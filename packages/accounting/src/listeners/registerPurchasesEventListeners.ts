// packages/accounting/src/listeners/registerPurchasesEventListeners.ts
import { onBillPosted, type PurchaseBillPostedPayload } from "./onBillPosted";
import { onPaymentMade } from "./onPaymentMade";

export type OnEventLane = (eventType: string, handler: (evt: any) => void) => void;

export const PURCHASES_BILL_POSTED_EVENT = "purchases.BILL_POSTED" as const;
export const PURCHASES_PAYMENT_MADE_EVENT = "purchases.PAYMENT_MADE" as const;

/**
 * v1.6.0: Wire Purchases event consumers
 * Converts BILL_POSTED and PAYMENT_MADE events into JE drafts automatically
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

  onEvent(PURCHASES_PAYMENT_MADE_EVENT, (evt: { type: string; payload: any }) => {
    try {
      const result = onPaymentMade(evt.payload);
      console.log(`[Accounting] Auto-drafted AP clearing JE from payment:`, result);
    } catch (error: any) {
      console.error(`[Accounting] Failed to draft JE from PAYMENT_MADE:`, error.message);
    }
  });
}
