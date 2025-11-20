// packages/accounting/src/listeners/registerPurchasesEventListeners.ts
import { onBillPosted, type PurchaseBillPostedPayload } from "./onBillPosted";

export type OnEventLane = (eventType: string, handler: (evt: any) => void) => void;

export const PURCHASES_BILL_POSTED_EVENT = "purchases.BILL_POSTED" as const;

/**
 * v1.5.0: Wire Purchases event consumers
 * Converts BILL_POSTED events into AP/Expense JE drafts automatically
 */
export function registerPurchasesEventListeners(onEvent: OnEventLane) {
  onEvent(PURCHASES_BILL_POSTED_EVENT, (evt: { type: string; payload: PurchaseBillPostedPayload }) => {
    try {
      const result = onBillPosted(evt.payload);
      console.log(`[Accounting] Auto-drafted AP JE from purchase bill:`, result);
    } catch (error: any) {
      console.error(`[Accounting] Failed to draft JE from BILL_POSTED:`, error.message);
    }
  });
}
