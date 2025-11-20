import { createJournalEntryService } from "../services/createJournalEntry";

/**
 * Boundary-duplicated payload (ESLint SSOT rule):
 * Do NOT import from @aibos/purchases.
 */
type PurchasePaymentPostedPayload = {
  id: string;
  paymentNo: string;
  postingDate: string;
  companyId: string;
  supplierId?: string;
  currency: string;
  amount: number;
  method: "bank" | "cash";
  bankAccountId?: string;
  billNo?: string;
  memo?: string;
};

const AP_ACCOUNT = "2010";
const CASH_ACCOUNT = "1010";
const DEFAULT_BANK_ACCOUNT = "1020";

export function onPaymentMade(
  payload: PurchasePaymentPostedPayload,
  opts?: { dryRun?: boolean }
) {
  const bankOrCash =
    payload.method === "cash"
      ? CASH_ACCOUNT
      : (payload.bankAccountId || DEFAULT_BANK_ACCOUNT);

  const draft = {
    postingDate: payload.postingDate,
    companyId: payload.companyId,
    currency: payload.currency,

    referenceNo: payload.paymentNo,

    // Contra is VALID here: DR AP reduces liability.
    allowOppositeNormalBalance: true,

    lines: [
      {
        accountId: AP_ACCOUNT,
        debit: payload.amount,
        credit: 0,
        memo: `Clear AP ${payload.billNo ?? ""}`.trim()
      },
      {
        accountId: bankOrCash,
        debit: 0,
        credit: payload.amount,
        memo: `Payment ${payload.paymentNo}`
      }
    ]
  };

  const parsed = createJournalEntryService.inputSchema.parse(draft);
  if (opts?.dryRun) return parsed;
  return createJournalEntryService.handler(parsed);
}
