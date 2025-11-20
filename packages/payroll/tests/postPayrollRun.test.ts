import { describe, it, expect } from "vitest";
import { postPayrollRunService } from "../src/services/postPayrollRun";

describe("postPayrollRun", () => {
  it("rejects wrong net formula", () => {
    const bad = {
      companyId: "demo.company",
      periodStart: "2025-01-01",
      periodEnd: "2025-01-31",
      currency: "MYR",
      postingDate: "2025-01-31",
      employees: [{ employeeId: "E1", gross: 100, employeeEpf: 10, net: 50 }]
    };
    const parsed = postPayrollRunService.inputSchema.safeParse(bad);
    expect(parsed.success).toBe(false);
  });

  it("accepts correct net formula and totals", () => {
    const good = {
      companyId: "demo.company",
      periodStart: "2025-01-01",
      periodEnd: "2025-01-31",
      currency: "MYR",
      postingDate: "2025-01-31",
      employees: [{ employeeId: "E1", gross: 100, employeeEpf: 10, net: 90 }]
    };
    const parsed = postPayrollRunService.inputSchema.safeParse(good);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return; // type guard
    const out = postPayrollRunService.handler(parsed.data);
    expect(out.totals.totalGross).toBe(100);
    expect(out.totals.totalEmployeeEpf).toBe(10);
    expect(out.totals.totalNetPayable).toBe(90);
  });
});
