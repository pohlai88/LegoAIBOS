// packages/accounting/src/listeners/registerPurchasesEventListeners.ts
import type { KernelLanes } from "@aibos/kernel-sdk";
import { onBillPosted, type PurchaseBillPostedPayload } from "./onBillPosted";
import { onPaymentMade } from "./onPaymentMade";

export const PURCHASES_BILL_POSTED_EVENT = "purchases.BILL_POSTED" as const;
export const PURCHASES_PAYMENT_MADE_EVENT = "purchases.PAYMENT_MADE" as const;

/**
 * v1.7.0: Migrated to KernelLanes events facade
 */
export function registerPurchasesEventListeners(lanes: KernelLanes) {
  lanes.events.on(PURCHASES_BILL_POSTED_EVENT, (payload: any) => {
    try {
      const result = onBillPosted(payload as PurchaseBillPostedPayload);
      console.log(`[Accounting] Auto-drafted AP JE from purchase bill:`, result);
    } catch (error: any) {
      console.error(`[Accounting] Failed to draft JE from BILL_POSTED:`, error.message);
    }
  });

  lanes.events.on(PURCHASES_PAYMENT_MADE_EVENT, (payload: any) => {
    try {
      const result = onPaymentMade(payload);
      console.log(`[Accounting] Auto-drafted AP clearing JE from payment:`, result);
    } catch (error: any) {
      console.error(`[Accounting] Failed to draft JE from PAYMENT_MADE:`, error.message);
    }
  });
}
