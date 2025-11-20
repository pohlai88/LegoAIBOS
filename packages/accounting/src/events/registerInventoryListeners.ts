// packages/accounting/src/events/registerInventoryListeners.ts
export type OnEventLane = (eventType: string, handler: (evt: any) => void) => void;

export const STOCK_MOVED_EVENT = "inventory.STOCK_MOVED" as const;

export type StockMovePosted = {
  id: string;
  companyId: string;
  itemCode: string;
  qtyBefore: number;
  qtyAfter: number;
  qtyDelta: number;
  reason: string;
  postingDate: string;
  status: "posted";
};

export function registerInventoryEventListeners(
  onEvent: OnEventLane,
  handleStockMoved?: (payload: StockMovePosted) => void
) {
  // Default behavior: just log for proof
  onEvent(STOCK_MOVED_EVENT, (evt: { type: string; payload: StockMovePosted }) => {
    handleStockMoved?.(evt.payload);
  });
}
