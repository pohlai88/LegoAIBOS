// tests/kernel/stockMovedToJeDraft.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import kernel from "../../apps/kernel/src/index";
import inventoryAdapter from "../../packages/inventory/src/index";
import accountingAdapter from "../../packages/accounting/src/index";
import { onStockMoved } from "../../packages/accounting/src/listeners/onStockMoved";
import type { StockMovedPayload } from "../../packages/accounting/src/listeners/onStockMoved";

describe("Stock Movement → Auto-draft JE Integration (v1.0.3/v1.2.0)", () => {
  beforeEach(async () => {
    // Boot kernel with both adapters
    await kernel.boot({
      mode: "test",
      adapters: [inventoryAdapter, accountingAdapter]
    });
  });

  it("should auto-draft balanced JE when Inventory emits STOCK_MOVED (OUT direction)", () => {
    const payload: StockMovedPayload = {
      companyId: "test-company",
      itemCode: "DEMO-LETTUCE-001",
      qty: 10,
      direction: "OUT",
      unitCost: 5,
      postingDate: "2025-11-20",
      refDoc: "DO-001"
    };

    // Test listener logic directly (service returns summary only)
    const result = onStockMoved(payload);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.status).toBe("draft");
    
    // Verify balanced
    expect(result.totalDebit).toBe(50); // 10 * 5
    expect(result.totalCredit).toBe(50);
    expect(result.totalDebit).toBeGreaterThan(0);
  });

  it("should auto-draft balanced JE when Inventory emits STOCK_MOVED (IN direction)", () => {
    const payload: StockMovedPayload = {
      companyId: "test-company",
      itemCode: "DEMO-PACK-001",
      qty: 100,
      direction: "IN",
      unitCost: 0.3,
      postingDate: "2025-11-20",
      refDoc: "GRN-001"
    };

    const result = onStockMoved(payload);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.status).toBe("draft");
    
    // Verify balanced
    expect(result.totalDebit).toBe(30); // 100 * 0.3
    expect(result.totalCredit).toBe(30);
  });

  it("should not throw error for valid stock movement payload", () => {
    const payload: StockMovedPayload = {
      companyId: "test-company",
      itemCode: "DEMO-LETTUCE-001",
      qty: 5,
      direction: "OUT",
      unitCost: 5,
      postingDate: "2025-11-20"
    };

    // Should not throw - normal balance validation passes
    expect(() => onStockMoved(payload)).not.toThrow();
    
    const result = onStockMoved(payload);
    expect(result.status).toBe("draft");
  });

  it("should verify Inventory and Accounting adapters loaded correctly", () => {
    const invManifest = kernel.apps.get("inventory");
    const accManifest = kernel.apps.get("accounting");

    expect(invManifest).toBeDefined();
    expect(accManifest).toBeDefined();

    // Both modules registered
    expect(invManifest.id).toBe("inventory");
    expect(accManifest.id).toBe("accounting");
    
    // Verify versions
    expect(invManifest.version).toBe("1.0.3");
    expect(accManifest.version).toBe("1.8.0");  // v1.8.0: Payroll consumption added
  });
});

