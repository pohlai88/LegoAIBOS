import { describe, it, expect } from "vitest";
import { postSalesInvoiceService } from "../src/services/postSalesInvoice";

describe("postSalesInvoice service", () => {
  it("computes totals without tax", () => {
    const out = postSalesInvoiceService.handler({
      postingDate: "2025-01-01",
      companyId: "demo.company",
      customerId: "demo.customer",
      currency: "MYR",
      lines: [
        { itemCode: "A", qty: 2, unitPrice: 50, lineTotal: 100 }
      ]
    });
    expect(out.subtotal).toBe(100);
    expect(out.tax).toBe(0);
    expect(out.total).toBe(100);
  });

  it("computes totals with tax", () => {
    const out = postSalesInvoiceService.handler({
      postingDate: "2025-01-01",
      companyId: "demo.company",
      customerId: "demo.customer",
      currency: "MYR",
      taxRate: 0.06,
      lines: [
        { itemCode: "A", qty: 2, unitPrice: 50, lineTotal: 100 }
      ]
    });
    expect(out.subtotal).toBe(100);
    expect(out.tax).toBe(6);
    expect(out.total).toBe(106);
  });
});
