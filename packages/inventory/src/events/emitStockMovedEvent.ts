// packages/inventory/src/events/emitStockMovedEvent.ts
export type EmitEventLane = (event: { type: string; payload: unknown }) => void;

export const STOCK_MOVED_EVENT = "inventory.STOCK_MOVED" as const;

export function emitStockMovedEvent(
  emitEvent: EmitEventLane | undefined,
  payload: {
    id: string;
    companyId: string;
    itemCode: string;
    qtyBefore: number;
    qtyAfter: number;
    reason: string;
    postingDate: string;
  }
) {
  emitEvent?.({
    type: STOCK_MOVED_EVENT,
    payload,
  });
}
