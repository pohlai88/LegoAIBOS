// packages/inventory/src/data/stockMock.ts
import type { StockItem, StockMoveDraft, StockMovePosted } from "../schema/types";

const STOCK_ITEMS: StockItem[] = [
  {
    id: "DEMO-LETTUCE-001",
    itemCode: "DEMO-LETTUCE-001",
    name: "Demo Lettuce",
    type: "raw_material",
    category: "Vegetable",
    uom: "kg",
    unitCost: 5,
    qtyOnHand: 100,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "DEMO-PACK-001",
    itemCode: "DEMO-PACK-001",
    name: "Demo Packaging Bag",
    type: "raw_material",
    category: "Packaging",
    uom: "pcs",
    unitCost: 0.3,
    qtyOnHand: 500,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const STOCK_MOVES: StockMovePosted[] = [];

export function listStockItems() {
  return STOCK_ITEMS.slice();
}

export function findStockItem(itemCode: string) {
  return STOCK_ITEMS.find((i) => i.itemCode === itemCode);
}

export function upsertStockItem(item: StockItem) {
  const idx = STOCK_ITEMS.findIndex((i) => i.itemCode === item.itemCode);
  if (idx >= 0) STOCK_ITEMS[idx] = item;
  else STOCK_ITEMS.push(item);
}

export function listStockMoves(itemCode?: string) {
  const all = STOCK_MOVES.slice();
  return itemCode ? all.filter((m) => m.itemCode === itemCode) : all;
}

export function applyStockMove(draft: StockMoveDraft): StockMovePosted {
  const item = findStockItem(draft.itemCode);
  if (!item) {
    throw new Error(`Item not found: ${draft.itemCode}`);
  }

  const qtyBefore = item.qtyOnHand;
  const qtyAfter = qtyBefore + draft.qtyDelta;

  if (!draft.allowNegative && qtyAfter < 0) {
    throw new Error(
      `Negative stock blocked for ${draft.itemCode}. qtyBefore=${qtyBefore}, delta=${draft.qtyDelta}`
    );
  }

  const posted: StockMovePosted = {
    ...draft,
    id: `SM-${Date.now()}`,
    qtyBefore,
    qtyAfter,
    status: "posted",
    allowNegative: Boolean(draft.allowNegative),
  };

  upsertStockItem({ ...item, qtyOnHand: qtyAfter });

  STOCK_MOVES.unshift(posted);
  return posted;
}

// Legacy compatibility exports for existing tests
export function getMockItems() {
  return listStockItems();
}

export function findMockItemByCode(itemCode: string) {
  return findStockItem(itemCode);
}

export function addMockItem(item: StockItem) {
  upsertStockItem(item);
}

export function resetMockItems(next?: StockItem[]) {
  STOCK_ITEMS.length = 0;
  if (next) STOCK_ITEMS.push(...next);
}
