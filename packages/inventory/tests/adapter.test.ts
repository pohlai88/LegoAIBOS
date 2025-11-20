import { describe, it, expect } from "vitest";
import adapter from "../src/index";

describe("Inventory adapter baseline", () => {
  it("exports a valid manifest", () => {
    expect(adapter.manifest.id).toBe("inventory");
    expect(adapter.manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("declares route + menu", () => {
    expect(adapter.manifest.routes.length).toBeGreaterThan(0);
    expect(adapter.manifest.menu.length).toBeGreaterThan(0);
  });

  it("declares createStockItem service", () => {
    expect(adapter.manifest.services?.some((s: any) =>
      s.key === "inventory.createStockItem"
    )).toBe(true);
  });

  it("declares getStockItemList service", () => {
    expect(adapter.manifest.services?.some((s: any) =>
      s.key === "inventory.getStockItemList"
    )).toBe(true);
  });

  it("declares createStockMove service", () => {
    expect(adapter.manifest.services?.some((s: any) =>
      s.key === "inventory.createStockMove"
    )).toBe(true);
  });

  it("declares STOCK_MOVED event", () => {
    expect(adapter.manifest.events?.emits?.includes("inventory.STOCK_MOVED")).toBe(true);
  });
});
