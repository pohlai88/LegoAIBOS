import { defineApp } from "@aibos/kernel-sdk";
import { SalesInvoicePage } from "./pages/SalesInvoicePage";
import { CashReceiptPage } from "./pages/CashReceiptPage";
import { postSalesInvoiceService } from "./services/postSalesInvoice";
import { postCashReceiptService } from "./services/postCashReceipt";
import { SALES_INVOICE_POSTED_EVENT, CASH_RECEIPT_POSTED_EVENT } from "./schema/types";

// ADR-012: Sales→AR Auto-JE Draft baseline
// ADR-013: Cash Receipt→AR Clearing (v1.0.1)
const manifest = defineApp({
  id: "sales",
  name: "Sales",
  version: "1.0.1",

  ownedEntities: ["SalesInvoice", "CashReceipt"],
  permissions: ["sales:read", "sales:write"],
  dimensions: [],

  routes: [
    { path: "/sales/invoice", component: SalesInvoicePage },
    { path: "/sales/cash-receipt", component: CashReceiptPage }
  ],

  menu: [
    {
      id: "sales.menu.invoice",
      label: "Sales Invoice",
      path: "/sales/invoice",
      order: 30
    },
    {
      id: "sales.menu.cashReceipt",
      label: "Cash Receipt",
      path: "/sales/cash-receipt",
      order: 31
    }
  ],

  services: [postSalesInvoiceService, postCashReceiptService],

  events: {
    emits: [SALES_INVOICE_POSTED_EVENT, CASH_RECEIPT_POSTED_EVENT],
    consumes: []
  }
}).manifest;

export default { manifest };

// Public types for consumers
export type { SalesInvoicePostedPayload, CashReceiptPostedPayload } from "./schema/types";
export { SALES_INVOICE_POSTED_EVENT, CASH_RECEIPT_POSTED_EVENT } from "./schema/types";
