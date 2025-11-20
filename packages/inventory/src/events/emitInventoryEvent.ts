export type EmitEventLane = (event: { type: string; payload: unknown }) => void;

export function emitStockItemCreated(
  emitEvent: EmitEventLane | undefined,
  payload: unknown
) {
  if (!emitEvent) return;
  emitEvent({ type: "inventory.STOCK_ITEM_CREATED", payload });
}
