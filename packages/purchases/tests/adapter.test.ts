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
});
