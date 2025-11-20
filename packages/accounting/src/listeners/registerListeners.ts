// packages/accounting/src/listeners/registerListeners.ts
import type { KernelLanes } from "@aibos/kernel-sdk";
import { registerInventoryEventListeners } from "../events/registerInventoryListeners";
import { registerSalesEventListeners } from "./registerSalesEventListeners";
import { registerPurchasesEventListeners } from "./registerPurchasesEventListeners";

let registered = false;

export function registerListeners(lanes: KernelLanes) {
  if (registered) return;
  registered = true;
  registerInventoryEventListeners(lanes);
  registerSalesEventListeners(lanes);
  registerPurchasesEventListeners(lanes);
}
