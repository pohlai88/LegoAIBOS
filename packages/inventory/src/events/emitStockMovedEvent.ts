// packages/inventory/src/events/emitStockMovedEvent.ts
import type { StockMovedPayload } from "../schema/types";

export type EmitEventLane = (event: { type: string; payload: unknown }) => void;

export const STOCK_MOVED_EVENT = "inventory.STOCK_MOVED" as const;

export function emitStockMovedEvent(
  emitEvent: EmitEventLane | undefined,
  payload: StockMovedPayload
) {
  emitEvent?.({
    type: STOCK_MOVED_EVENT,
    payload,
  });
}
