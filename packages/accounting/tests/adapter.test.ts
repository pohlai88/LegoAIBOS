import { describe, it, expect } from "vitest";
import adapter from "../src/index";

describe("Accounting adapter baseline", () => {
  it("exports a valid manifest", () => {
    expect(adapter.manifest.id).toBe("accounting");
    expect(adapter.manifest.version).toBe("1.1.0");
  });

  it("declares JE route + menu", () => {
    expect(adapter.manifest.routes.length).toBeGreaterThan(0);
    expect(adapter.manifest.menu.length).toBeGreaterThan(0);
  });

  it("declares createJournalEntry service", () => {
    expect(adapter.manifest.services?.some((s: any) => s.key === "accounting.createJournalEntry")).toBe(true);
  });

  it("declares getCOAList service (v1.0.1)", () => {
    expect(adapter.manifest.services?.some((s: any) => s.key === "accounting.getCOAList")).toBe(true);
  });
});
