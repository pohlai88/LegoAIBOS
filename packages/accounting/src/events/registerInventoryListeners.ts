// packages/accounting/src/events/registerInventoryListeners.ts
import type { KernelLanes } from "@aibos/kernel-sdk";
import { onStockMoved, type StockMovedPayload } from "../listeners/onStockMoved";

export const STOCK_MOVED_EVENT = "inventory.STOCK_MOVED" as const;

/**
 * v1.7.0: Migrated to KernelLanes events facade (no direct EventBus usage)
 */
export function registerInventoryEventListeners(lanes: KernelLanes) {
  lanes.events.on(STOCK_MOVED_EVENT, (payload: any) => {
    try {
      const result = onStockMoved(payload as StockMovedPayload);
      console.log(`[Accounting] Auto-drafted JE from stock movement:`, result);
    } catch (error: any) {
      console.error(`[Accounting] Failed to draft JE from STOCK_MOVED:`, error.message);
    }
  });
}
