import { defineApp } from "@aibos/kernel-sdk";
import { PurchaseBillPage } from "./pages/PurchaseBillPage";
import { PurchasePaymentPage } from "./pages/PurchasePaymentPage";
import { postBillService } from "./services/postBill";
import { postPaymentService } from "./services/postPayment";
import { BILL_POSTED_EVENT, PAYMENT_MADE_EVENT } from "./schema/types";

// ADR-014: Bill Posted | ADR-016: Payment Made
const manifest = defineApp({
  id: "purchases",
  name: "Purchases",
  version: "1.0.1",

  ownedEntities: ["PurchaseBill"],
  permissions: ["purchases:read", "purchases:write"],
  dimensions: [],

  routes: [
    { path: "/purchases/bill", component: PurchaseBillPage },
    { path: "/purchases/payment", component: PurchasePaymentPage }
  ],

  menu: [
    {
      id: "purchases.menu.bill",
      label: "Purchase Bill",
      path: "/purchases/bill",
      order: 30
    },
    {
      id: "purchases.menu.payment",
      label: "Payment Made",
      path: "/purchases/payment",
      order: 31
    }
  ],

  services: [postBillService, postPaymentService],

  events: {
    emits: [BILL_POSTED_EVENT, PAYMENT_MADE_EVENT],
    consumes: []
  }
}).manifest;

export default { manifest };

// Public types for consumers
export type { PurchaseBillPostedPayload, PurchasePaymentPostedPayload } from "./schema/types";
export { BILL_POSTED_EVENT, PAYMENT_MADE_EVENT } from "./schema/types";
export { postBillService } from "./services/postBill";
export { postPaymentService } from "./services/postPayment";
