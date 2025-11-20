// packages/accounting/src/listeners/registerSalesEventListeners.ts
import { onSalesInvoicePosted, type SalesInvoicePostedPayload } from "./onSalesInvoicePosted";
import { onCashReceiptPosted, type CashReceiptPostedPayload } from "./onCashReceiptPosted";

export type OnEventLane = (eventType: string, handler: (evt: any) => void) => void;

export const SALES_INVOICE_POSTED_EVENT = "sales.INVOICE_POSTED" as const;
export const CASH_RECEIPT_POSTED_EVENT = "sales.CASH_RECEIPT_POSTED" as const;

/**
 * v1.3.0: Wire Sales event consumers
 * v1.4.0: Added CASH_RECEIPT_POSTED consumption
 * Converts INVOICE_POSTED events into AR JE drafts automatically
 * Converts CASH_RECEIPT_POSTED events into AR clearing JE drafts
 */
export function registerSalesEventListeners(onEvent: OnEventLane) {
  onEvent(SALES_INVOICE_POSTED_EVENT, (evt: { type: string; payload: SalesInvoicePostedPayload }) => {
    try {
      const result = onSalesInvoicePosted(evt.payload);
      console.log(`[Accounting] Auto-drafted AR JE from sales invoice:`, result);
    } catch (error: any) {
      console.error(`[Accounting] Failed to draft JE from INVOICE_POSTED:`, error.message);
    }
  });

  onEvent(CASH_RECEIPT_POSTED_EVENT, (evt: { type: string; payload: CashReceiptPostedPayload }) => {
    try {
      const result = onCashReceiptPosted(evt.payload);
      console.log(`[Accounting] Auto-drafted AR clearing JE from cash receipt:`, result);
    } catch (error: any) {
      console.error(`[Accounting] Failed to draft JE from CASH_RECEIPT_POSTED:`, error.message);
    }
  });
}
