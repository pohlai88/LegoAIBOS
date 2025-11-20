import { describe, it, expect } from "vitest";
import { postBillService } from "../src/services/postBill";

describe("purchases.postBill", () => {
  it("computes totals without tax", () => {
    const out = postBillService.handler({
      billNo: "PB-1",
      postingDate: "2025-01-01",
      companyId: "demo.company",
      currency: "MYR",
      lines: [{ accountId: "5100", qty: 2, unitCost: 50 }]
    });
    expect(out.subtotal).toBe(100);
    expect(out.taxAmount).toBe(0);
    expect(out.total).toBe(100);
  });

  it("computes totals with tax", () => {
    const out = postBillService.handler({
      billNo: "PB-2",
      postingDate: "2025-01-01",
      companyId: "demo.company",
      currency: "MYR",
      taxRate: 10,
      lines: [{ accountId: "5100", amount: 100 }]
    });
    expect(out.subtotal).toBe(100);
    expect(out.taxAmount).toBe(10);
    expect(out.total).toBe(110);
  });

  it("rejects empty lines", () => {
    const parsed = postBillService.inputSchema.safeParse({
      billNo: "PB-3",
      postingDate: "2025-01-01",
      companyId: "demo.company",
      currency: "MYR",
      lines: []
    });
    expect(parsed.success).toBe(false);
  });
});
