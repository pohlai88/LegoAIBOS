import { describe, it, expect } from "vitest";
import adapter from "../src/index";

describe("Payroll adapter", () => {
  it("exports valid manifest", () => {
    expect(adapter.manifest.id).toBe("payroll");
    expect(adapter.manifest.version).toMatch(/^[0-9]+\.[0-9]+\.[0-9]+$/);
  });
  it("declares postPayrollRun service", () => {
    expect(adapter.manifest.services?.some((s: any) => s.key === "payroll.postPayrollRun")).toBe(true);
  });
});
