// packages/accounting/src/listeners/onCashReceiptPosted.ts
import { createJournalEntryService } from "../services/createJournalEntry";

/**
 * v1.4.0: Auto-draft JE from Sales CASH_RECEIPT_POSTED event
 * Maps cash receipt to GL accounts:
 * - DR Bank (1020) or Petty Cash (1010) based on method
 * - CR Trade Receivables (1310)
 */

// Duplicated from sales to avoid cross-module import boundary violation
export type CashReceiptPostedPayload = {
  receiptId: string;
  postingDate: string;
  companyId: string;
  customerId: string;
  currency: string;
  amount: number;
  method: "bank" | "cash";
  bankAccountId?: string;
  invoiceId?: string;
  refDoc?: string;
};

export function onCashReceiptPosted(payload: CashReceiptPostedPayload) {
  const bankOrCashAcc =
    payload.method === "cash" ? "1010" : (payload.bankAccountId || "1020");

  const draft = {
    postingDate: payload.postingDate,
    companyId: payload.companyId,
    currency: payload.currency,
    referenceNo: payload.receiptId,
    userRemark: `Auto-draft from cash receipt: ${payload.receiptId}`,
    lines: [
      { accountId: bankOrCashAcc, debit: payload.amount, credit: 0, memo: "Cash receipt" },
      { accountId: "1310", debit: 0, credit: payload.amount, memo: "Clear trade receivables" },
    ],
    // v1.6.1: sourceEvent allowlist grants contra permission
    sourceEvent: "sales.CASH_RECEIPT_POSTED"
  };

  // SSOT guard applies here too
  const parsed = createJournalEntryService.inputSchema.safeParse(draft);
  if (!parsed.success) {
    throw new Error(`JE draft validation failed: ${parsed.error.message}`);
  }

  return createJournalEntryService.handler(parsed.data);
}
