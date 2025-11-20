import { describe, it, expect } from "vitest";
import adapter from "../src/index";

describe("Purchases adapter baseline", () => {
  it("exports a valid manifest", () => {
    expect(adapter.manifest.id).toBe("purchases");
    expect(adapter.manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("declares BILL_POSTED emit", () => {
    expect(adapter.manifest.events?.emits?.includes("purchases.BILL_POSTED")).toBe(true);
  });

  it("declares PAYMENT_MADE emit (v1.0.1)", () => {
    expect(adapter.manifest.events?.emits?.includes("purchases.PAYMENT_MADE")).toBe(true);
  });
});
