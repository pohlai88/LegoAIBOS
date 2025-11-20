// packages/accounting/src/events/registerInventoryListeners.ts
import { onStockMoved, type StockMovedPayload } from "../listeners/onStockMoved";

export type OnEventLane = (eventType: string, handler: (evt: any) => void) => void;

export const STOCK_MOVED_EVENT = "inventory.STOCK_MOVED" as const;

/**
 * v1.2.0: Wire Inventory event consumers
 * Converts STOCK_MOVED events into JE drafts automatically
 */
export function registerInventoryEventListeners(onEvent: OnEventLane) {
  onEvent(STOCK_MOVED_EVENT, (evt: { type: string; payload: StockMovedPayload }) => {
    try {
      const result = onStockMoved(evt.payload);
      console.log(`[Accounting] Auto-drafted JE from stock movement:`, result);
    } catch (error: any) {
      console.error(`[Accounting] Failed to draft JE from STOCK_MOVED:`, error.message);
    }
  });
}
