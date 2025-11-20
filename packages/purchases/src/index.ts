import { defineApp } from "@aibos/kernel-sdk";
import { PurchaseBillPage } from "./pages/PurchaseBillPage";
import { postBillService } from "./services/postBill";
import { BILL_POSTED_EVENT } from "./schema/types";

// ADR-014: Purchases Bill Posted MVP
const manifest = defineApp({
  id: "purchases",
  name: "Purchases",
  version: "1.0.0",

  ownedEntities: ["PurchaseBill"],
  permissions: ["purchases:read", "purchases:write"],
  dimensions: [],

  routes: [
    { path: "/purchases/bill", component: PurchaseBillPage }
  ],

  menu: [
    {
      id: "purchases.menu.bill",
      label: "Purchase Bill",
      path: "/purchases/bill",
      order: 40
    }
  ],

  services: [postBillService],

  events: {
    emits: [BILL_POSTED_EVENT],
    consumes: []
  }
}).manifest;

export default { manifest };

// Public types for consumers
export type { PurchaseBillPostedPayload } from "./schema/types";
export { BILL_POSTED_EVENT } from "./schema/types";
export { postBillService } from "./services/postBill";
