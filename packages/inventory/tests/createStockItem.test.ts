import { describe, it, expect, beforeEach } from "vitest";
import { createStockItemService, CreateStockItemInput } from "../src/services/createStockItem";
import { resetMockItems } from "../src/data/inventoryMock";

describe("createStockItem service", () => {
  beforeEach(() => resetMockItems([]));

  it("accepts a valid stock item", () => {
    const input = {
      itemCode: "RM-1000",
      name: "Test Raw Material",
      type: "raw_material",
      category: "Seeds",
      uom: "pack",
      qtyOnHand: 5,
      unitCost: 2.5,
      isActive: true
    };

    const parsed = createStockItemService.inputSchema.safeParse(input);
    expect(parsed.success).toBe(true);

    if (!parsed.success) throw new Error("parse failed");
    const out = createStockItemService.handler(parsed.data);
    expect(out.item.itemCode).toBe("RM-1000");
  });

  it("rejects duplicate itemCode", () => {
    const input: CreateStockItemInput = {
      itemCode: "RM-1000",
      name: "Test Raw Material",
      type: "raw_material",
      uom: "pack",
      qtyOnHand: 5,
      unitCost: 2.5,
      isActive: true
    };

    createStockItemService.handler(input);

    const parsed2 = createStockItemService.inputSchema.safeParse(input);
    expect(parsed2.success).toBe(false);
  });

  it("rejects negative qty or cost", () => {
    const bad = {
      itemCode: "RM-2000",
      name: "Bad Item",
      type: "raw_material",
      uom: "pack",
      qtyOnHand: -1,
      unitCost: -2,
      isActive: true
    };

    const parsed = createStockItemService.inputSchema.safeParse(bad);
    expect(parsed.success).toBe(false);
  });
});
