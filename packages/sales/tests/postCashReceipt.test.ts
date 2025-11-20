import { describe, it, expect } from "vitest";
import { postCashReceiptService } from "../src/services/postCashReceipt";

describe("postCashReceipt service", () => {
  it("accepts bank receipt and defaults bankAccountId", () => {
    const out = postCashReceiptService.handler({
      receiptId: "CR-1",
      postingDate: "2025-11-21",
      companyId: "demo.company",
      customerId: "demo.customer",
      currency: "MYR",
      amount: 100,
      method: "bank",
    });
    expect(out.ok).toBe(true);
    expect(out.payload.bankAccountId).toBe("1020");
  });

  it("accepts cash receipt with no bankAccountId", () => {
    const out = postCashReceiptService.handler({
      receiptId: "CR-2",
      postingDate: "2025-11-21",
      companyId: "demo.company",
      customerId: "demo.customer",
      currency: "MYR",
      amount: 50,
      method: "cash",
    });
    expect(out.payload.method).toBe("cash");
    expect(out.payload.bankAccountId).toBeUndefined();
  });
});
