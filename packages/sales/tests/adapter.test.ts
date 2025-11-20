import { describe, it, expect } from "vitest";
import adapter from "../src/index";
import { SALES_INVOICE_POSTED_EVENT, CASH_RECEIPT_POSTED_EVENT } from "../src/schema/types";

describe("Sales adapter baseline", () => {
  it("exports a valid manifest", () => {
    expect(adapter.manifest.id).toBe("sales");
    expect(adapter.manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("declares route + menu", () => {
    expect(adapter.manifest.routes.length).toBeGreaterThan(0);
    expect(adapter.manifest.menu.length).toBeGreaterThan(0);
  });

  it("declares postSalesInvoice service", () => {
    expect(adapter.manifest.services?.some((s: any) =>
      s.key === "sales.postSalesInvoice")).toBe(true);
  });

  it("declares postCashReceipt service", () => {
    expect(adapter.manifest.services?.some((s: any) =>
      s.key === "sales.postCashReceipt")).toBe(true);
  });

  it("emits SALES_INVOICE_POSTED", () => {
    expect(adapter.manifest.events?.emits).toContain(SALES_INVOICE_POSTED_EVENT);
  });

  it("emits CASH_RECEIPT_POSTED", () => {
    expect(adapter.manifest.events?.emits).toContain(CASH_RECEIPT_POSTED_EVENT);
  });
});
