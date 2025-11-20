// packages/inventory/tests/createStockMove.test.ts
import { describe, it, expect } from "vitest";
import { createStockMoveService } from "../src/services/createStockMove";
import { listStockItems } from "../src/data/stockMock";

describe("createStockMove service v1.0.1", () => {
  it("rejects unknown itemCode", () => {
    const parsed = createStockMoveService.inputSchema.safeParse({
      companyId: "demo.company",
      itemCode: "NO-SUCH",
      qtyDelta: 10,
      reason: "adjustment",
      postingDate: "2025-01-01",
    });
    expect(parsed.success).toBe(true);
    expect(() => createStockMoveService.handler(parsed.data as any)).toThrow();
  });

  it("rejects qtyDelta=0", () => {
    const parsed = createStockMoveService.inputSchema.safeParse({
      companyId: "demo.company",
      itemCode: "DEMO-LETTUCE-001",
      qtyDelta: 0,
      reason: "adjustment",
      postingDate: "2025-01-01",
    });
    expect(parsed.success).toBe(false);
  });

  it("blocks negative stock by default", () => {
    const item = listStockItems().find(i => i.itemCode === "DEMO-LETTUCE-001")!;
    const parsed = createStockMoveService.inputSchema.parse({
      companyId: "demo.company",
      itemCode: item.itemCode,
      qtyDelta: -999999,
      reason: "sale",
      postingDate: "2025-01-01",
    });
    expect(() => createStockMoveService.handler(parsed)).toThrow(/Negative stock blocked/);
  });

  it("allows negative stock when allowNegative=true", () => {
    const parsed = createStockMoveService.inputSchema.parse({
      companyId: "demo.company",
      itemCode: "DEMO-LETTUCE-001",
      qtyDelta: -999999,
      reason: "adjustment",
      postingDate: "2025-01-01",
      allowNegative: true,
    });
    const out = createStockMoveService.handler(parsed);
    expect(out.status).toBe("posted");
    expect(out.qtyAfter).toBeLessThan(0);
  });
});
