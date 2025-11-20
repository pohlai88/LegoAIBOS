import { describe, it, expect, beforeEach } from "vitest";
import { getStockItemListService } from "../src/services/getStockItemList";
import { upsertStockItem } from "../src/data/stockMock";
import type { StockItem } from "../src/schema/types";

describe("getStockItemList service", () => {
  const testItems: StockItem[] = [
    {
      id: "A",
      itemCode: "A",
      name: "Asset Item",
      type: "raw_material",
      category: "Seeds",
      uom: "pack",
      qtyOnHand: 1,
      unitCost: 1,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "B",
      itemCode: "B",
      name: "Inactive Item",
      type: "finished_goods",
      category: "Vegetables",
      uom: "pcs",
      qtyOnHand: 2,
      unitCost: 2,
      isActive: false,
      createdAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    // Note: stockMock has default demo items; filter tests work against full set
  });

  it("returns all when no filter", () => {
    const out = getStockItemListService.handler({});
    expect(out.items.length).toBeGreaterThan(0);
  });

  it("filters by type", () => {
    const out = getStockItemListService.handler({ type: "raw_material" });
    expect(out.items.every(i => i.type === "raw_material")).toBe(true);
  });

  it("filters by active", () => {
    // All default items in stockMock are active=true
    const out = getStockItemListService.handler({ isActive: true });
    expect(out.items.length).toBeGreaterThan(0);
    expect(out.items.every(i => i.isActive === true)).toBe(true);
  });
});
