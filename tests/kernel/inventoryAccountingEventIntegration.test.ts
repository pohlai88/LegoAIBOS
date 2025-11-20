// tests/kernel/inventoryAccountingEventIntegration.test.ts
import { describe, it, expect } from "vitest";
import kernel from "../../apps/kernel/src/index";
import inventoryAdapter from "../../packages/inventory/src/index";
import accountingAdapter from "../../packages/accounting/src/index";
import { registerInventoryEventListeners } from "../../packages/accounting/src/events/registerInventoryListeners";

describe("Inventory → Accounting event lane (cross-module proof)", () => {
  it("delivers inventory.STOCK_MOVED to accounting listener", async () => {
    // Boot kernel with both adapters
    await kernel.boot({
      mode: "test",
      adapters: [inventoryAdapter, accountingAdapter]
    });

    let received: any = null;

    // Register accounting listener
    registerInventoryEventListeners(
      (eventType, handler) => {
        kernel.events.on({ tenantId: "test-tenant" }, eventType, handler);
      },
      (payload) => {
        received = payload;
      }
    );

    // Emit STOCK_MOVED event from inventory
    kernel.events.emit(
      { tenantId: "test-tenant" },
      {
        type: "inventory.STOCK_MOVED",
        payload: {
          id: "SM-TEST-001",
          companyId: "demo.company",
          itemCode: "ITEM-001",
          qtyBefore: 10,
          qtyAfter: 15,
          qtyDelta: 5,
          reason: "purchase",
          postingDate: "2025-11-20",
          status: "posted"
        }
      }
    );

    // Assert delivery
    expect(received).not.toBeNull();
    expect(received.itemCode).toBe("ITEM-001");
    expect(received.qtyDelta).toBe(5);
    expect(received.companyId).toBe("demo.company");
  });

  it("accounting manifest declares STOCK_MOVED consumption", () => {
    expect(accountingAdapter.manifest.events.consumes).toContain("inventory.STOCK_MOVED");
  });

  it("inventory manifest declares STOCK_MOVED emission", () => {
    expect(inventoryAdapter.manifest.events.emits).toContain("inventory.STOCK_MOVED");
  });
});
