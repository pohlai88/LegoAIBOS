import type { CashReceiptPostedPayload } from "../schema/types";

export const CASH_RECEIPT_POSTED_EVENT = "sales.CASH_RECEIPT_POSTED" as const;

export function emitCashReceiptPosted(
  emitEvent: (event: string, payload: unknown) => void,
  payload: CashReceiptPostedPayload
) {
  emitEvent(CASH_RECEIPT_POSTED_EVENT, payload);
}
