// packages/accounting/src/listeners/registerSalesEventListeners.ts
import type { KernelLanes } from "@aibos/kernel-sdk";
import { onSalesInvoicePosted, type SalesInvoicePostedPayload } from "./onSalesInvoicePosted";
import { onCashReceiptPosted, type CashReceiptPostedPayload } from "./onCashReceiptPosted";

export const SALES_INVOICE_POSTED_EVENT = "sales.INVOICE_POSTED" as const;
export const CASH_RECEIPT_POSTED_EVENT = "sales.CASH_RECEIPT_POSTED" as const;

/**
 * v1.7.0: Migrated to KernelLanes events facade
 */
export function registerSalesEventListeners(lanes: KernelLanes) {
  lanes.events.on(SALES_INVOICE_POSTED_EVENT, (payload: any) => {
    try {
      const result = onSalesInvoicePosted(payload as SalesInvoicePostedPayload);
      console.log(`[Accounting] Auto-drafted AR JE from sales invoice:`, result);
    } catch (error: any) {
      console.error(`[Accounting] Failed to draft JE from INVOICE_POSTED:`, error.message);
    }
  });

  lanes.events.on(CASH_RECEIPT_POSTED_EVENT, (payload: any) => {
    try {
      const result = onCashReceiptPosted(payload as CashReceiptPostedPayload);
      console.log(`[Accounting] Auto-drafted AR clearing JE from cash receipt:`, result);
    } catch (error: any) {
      console.error(`[Accounting] Failed to draft JE from CASH_RECEIPT_POSTED:`, error.message);
    }
  });
}
