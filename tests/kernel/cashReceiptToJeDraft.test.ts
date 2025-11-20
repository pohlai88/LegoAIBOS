import { describe, it, expect } from "vitest";
import salesAdapter from "../../packages/sales/src/index";
import accountingAdapter from "../../packages/accounting/src/index";
import { postCashReceiptService } from "../../packages/sales/src/services/postCashReceipt";
import { onCashReceiptPosted } from "../../packages/accounting/src/listeners/onCashReceiptPosted";

describe("Sales CASH_RECEIPT_POSTED → Accounting JE draft", () => {
  it("manifest lanes declared correctly", () => {
    expect(salesAdapter.manifest.events.emits).toContain("sales.CASH_RECEIPT_POSTED");
    expect(accountingAdapter.manifest.events.consumes).toContain("sales.CASH_RECEIPT_POSTED");
  });

  it("bank receipt drafts balanced JE (DR Bank, CR AR)", () => {
    const receipt = postCashReceiptService.handler({
      receiptId: "CR-100",
      postingDate: "2025-11-21",
      companyId: "demo.company",
      customerId: "demo.customer",
      currency: "MYR",
      amount: 120,
      method: "bank",
      bankAccountId: "1020",
    }).payload;

    const out = onCashReceiptPosted(receipt);
    expect(out).toBeDefined();
    expect(out.id).toBeDefined();
    expect(out.status).toBe("draft");
    expect(out.totalDebit).toBe(120);
    expect(out.totalCredit).toBe(120);
    expect(out.totalDebit).toBeGreaterThan(0);
  });

  it("cash receipt uses Petty Cash (1010)", () => {
    const receipt = postCashReceiptService.handler({
      receiptId: "CR-101",
      postingDate: "2025-11-21",
      companyId: "demo.company",
      customerId: "demo.customer",
      currency: "MYR",
      amount: 50,
      method: "cash",
    }).payload;

    const out = onCashReceiptPosted(receipt);
    expect(out).toBeDefined();
    expect(out.id).toBeDefined();
    expect(out.status).toBe("draft");
    expect(out.totalDebit).toBe(50);
    expect(out.totalCredit).toBe(50);
  });
});
