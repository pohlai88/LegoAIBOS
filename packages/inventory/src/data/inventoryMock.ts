import type { StockItem } from "../schema/types";

let MOCK_ITEMS: StockItem[] = [
  {
    id: "RM-0001",
    itemCode: "RM-0001",
    name: "Imported Raw Lettuce Seeds",
    type: "raw_material",
    category: "Seeds",
    uom: "pack",
    qtyOnHand: 20,
    unitCost: 15.5,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "FG-0001",
    itemCode: "FG-0001",
    name: "Fresh Lettuce Pack 200g",
    type: "finished_goods",
    category: "Vegetables",
    uom: "pcs",
    qtyOnHand: 120,
    unitCost: 2.4,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export function getMockItems() {
  return MOCK_ITEMS;
}

export function findMockItemByCode(itemCode: string) {
  return MOCK_ITEMS.find(i => i.itemCode === itemCode);
}

export function addMockItem(item: StockItem) {
  MOCK_ITEMS = [...MOCK_ITEMS, item];
}

export function resetMockItems(next?: StockItem[]) {
  MOCK_ITEMS = next ?? [];
}
