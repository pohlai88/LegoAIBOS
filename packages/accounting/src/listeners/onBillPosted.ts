import { createJournalEntryService } from "../services/createJournalEntry";

/**
 * v1.5.0: Auto-draft AP JE from Purchases BILL_POSTED event
 * Maps purchase bill to GL accounts:
 * - DR Expense/Asset (per line accountId)
 * - DR Input Tax Receivable (1170) if taxAmount > 0
 * - CR Trade Payables (2010) for total
 */

// Duplicated from purchases to avoid cross-module import boundary violation
export type PurchaseBillPostedPayload = {
  id: string;
  billNo: string;
  postingDate: string;
  companyId: string;
  supplierId?: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  lines: Array<{
    accountId: string;
    amount: number;
    memo?: string;
  }>;
};

const AP_ACCOUNT = "2010";
const INPUT_TAX_ACCOUNT = "1170";

export function onBillPosted(payload: PurchaseBillPostedPayload) {
  const lines = [
    // DR each expense/asset line
    ...payload.lines.map(l => ({
      accountId: l.accountId,
      debit: l.amount,
      credit: 0,
      memo: l.memo || `${payload.billNo} expense`
    })),
    
    // DR input tax if applicable
    ...(payload.taxAmount > 0
      ? [{
          accountId: INPUT_TAX_ACCOUNT,
          debit: payload.taxAmount,
          credit: 0,
          memo: "Input tax"
        }]
      : []),
    
    // CR AP for total
    {
      accountId: AP_ACCOUNT,
      debit: 0,
      credit: payload.total,
      memo: `AP for ${payload.billNo}`
    }
  ];

  const draft = {
    postingDate: payload.postingDate,
    companyId: payload.companyId,
    currency: payload.currency,
    referenceNo: payload.billNo,
    userRemark: `Auto-draft from purchase bill: ${payload.billNo}`,
    lines,
    allowOppositeNormalBalance: false,  // No contra needed for bill posting
  };

  const parsed = createJournalEntryService.inputSchema.safeParse(draft);
  if (!parsed.success) {
    throw new Error(`JE draft validation failed: ${parsed.error.message}`);
  }

  return createJournalEntryService.handler(parsed.data);
}
