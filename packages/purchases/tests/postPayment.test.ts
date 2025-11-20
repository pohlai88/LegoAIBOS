import { describe, it, expect } from "vitest";
import { postPaymentService } from "../src/services/postPayment";

describe("purchases.postPayment", () => {
  it("accepts bank payment with bankAccountId", () => {
    const out = postPaymentService.handler({
      paymentNo: "PP-1",
      postingDate: "2025-01-02",
      companyId: "demo.company",
      currency: "MYR",
      amount: 100,
      method: "bank",
      bankAccountId: "1020"
    });
    expect(out.method).toBe("bank");
    expect(out.bankAccountId).toBe("1020");
  });

  it("rejects bank payment without bankAccountId", () => {
    const parsed = postPaymentService.inputSchema.safeParse({
      paymentNo: "PP-2",
      postingDate: "2025-01-02",
      companyId: "demo.company",
      currency: "MYR",
      amount: 100,
      method: "bank"
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts cash payment without bankAccountId", () => {
    const out = postPaymentService.handler({
      paymentNo: "PP-3",
      postingDate: "2025-01-02",
      companyId: "demo.company",
      currency: "MYR",
      amount: 50,
      method: "cash"
    });
    expect(out.method).toBe("cash");
    expect(out.bankAccountId).toBeUndefined();
  });
});
