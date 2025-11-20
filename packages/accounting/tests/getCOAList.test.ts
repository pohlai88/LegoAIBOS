import { describe, it, expect } from "vitest";
import { getCOAListService } from "../src/services/getCOAList";

describe("getCOAList service", () => {
  it("returns all accounts when no filter", () => {
    const result = getCOAListService.handler({ companyId: "demo.company" });
    expect(result.accounts.length).toBeGreaterThan(0);
  });

  it("filters by type=asset", () => {
    const result = getCOAListService.handler({ companyId: "demo.company", type: "asset" });
    expect(result.accounts.every(a => a.type === "asset")).toBe(true);
  });

  it("filters by isActive=true", () => {
    const result = getCOAListService.handler({ companyId: "demo.company", isActive: true });
    expect(result.accounts.every(a => a.isActive === true)).toBe(true);
  });

  it("input schema validates filter shape", () => {
    expect(() =>
      getCOAListService.inputSchema.parse({ companyId: "demo.company", type: "asset" })
    ).not.toThrow();
  });
});
