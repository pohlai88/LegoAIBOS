import type { SalesInvoicePostedPayload } from "../schema/types";
import { SALES_INVOICE_POSTED_EVENT } from "../schema/types";

export function emitInvoicePostedEvent(
  emitEvent: ((type: string, payload: any) => void) | undefined,
  payload: SalesInvoicePostedPayload
) {
  if (!emitEvent) return;
  emitEvent(SALES_INVOICE_POSTED_EVENT, payload);
}
