// packages/inventory/src/events/emitStockMovedEvent.ts
export type EmitEventLane = (event: { type: string; payload: unknown }) => void;

export function emitStockMovedEvent(
  emitEvent: EmitEventLane | undefined,
  payload: {
    id: string;
    itemCode: string;
    qtyBefore: number;
    qtyAfter: number;
    reason: string;
    postingDate: string;
  }
) {
  emitEvent?.({
    type: "inventory.STOCK_MOVED",
    payload,
  });
}
