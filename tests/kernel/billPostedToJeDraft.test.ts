import { describe, it, expect } from "vitest";
import purchasesAdapter from "../../packages/purchases/src/index";
import accountingAdapter from "../../packages/accounting/src/index";
import { postBillService } from "../../packages/purchases/src/services/postBill";
import { onBillPosted } from "../../packages/accounting/src/listeners/onBillPosted";

describe("Purchases BILL_POSTED → Accounting JE draft", () => {
  it("manifest lanes declared correctly", () => {
    expect(purchasesAdapter.manifest.events.emits).toContain("purchases.BILL_POSTED");
    expect(accountingAdapter.manifest.events.consumes).toContain("purchases.BILL_POSTED");
  });

  it("drafts balanced JE without tax", () => {
    const bill = postBillService.handler({
      billNo: "PB-100",
      postingDate: "2025-01-01",
      companyId: "demo.company",
      currency: "MYR",
      lines: [{ accountId: "5100", amount: 100 }]
    });

    const out = onBillPosted(bill);
    
    expect(out).toBeDefined();
    expect(out.id).toBeDefined();
    expect(out.status).toBe("draft");
    expect(out.totalDebit).toBe(100);
    expect(out.totalCredit).toBe(100);
    expect(out.totalDebit).toBeGreaterThan(0);
  });

  it("drafts balanced JE with tax", () => {
    const bill = postBillService.handler({
      billNo: "PB-101",
      postingDate: "2025-01-01",
      companyId: "demo.company",
      currency: "MYR",
      taxRate: 10,
      lines: [{ accountId: "5100", amount: 100 }]
    });

    const out = onBillPosted(bill);
    
    expect(out).toBeDefined();
    expect(out.id).toBeDefined();
    expect(out.status).toBe("draft");
    expect(out.totalDebit).toBe(110);  // 100 expense + 10 tax
    expect(out.totalCredit).toBe(110);  // 110 AP
  });
});
