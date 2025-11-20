import { describe, it, expect } from "vitest";
import purchasesAdapter from "../../packages/purchases/src/index";
import { postPaymentService } from "../../packages/purchases/src/services/postPayment";
import accountingAdapter from "../../packages/accounting/src/index";
import { onPaymentMade } from "../../packages/accounting/src/listeners/onPaymentMade";

describe("Purchases PAYMENT_MADE → Accounting AP-clearing JE draft", () => {
  it("drafts balanced JE for bank payment", () => {
    const pay = postPaymentService.handler({
      paymentNo: "PP-100",
      postingDate: "2025-01-02",
      companyId: "demo.company",
      currency: "MYR",
      amount: 120,
      method: "bank",
      bankAccountId: "1020"
    });

    const draft = onPaymentMade(pay as any, { dryRun: true });
    const td = (draft as any).lines.reduce((s: number, l: any) => s + l.debit, 0);
    const tc = (draft as any).lines.reduce((s: number, l: any) => s + l.credit, 0);

    expect(td).toBe(120);
    expect(tc).toBe(120);

    expect((draft as any).lines.some((l: any) => l.accountId === "2010" && l.debit === 120)).toBe(true);
    expect((draft as any).lines.some((l: any) => l.accountId === "1020" && l.credit === 120)).toBe(true);
    // v1.6.1: Contra allowed via sourceEvent allowlist, flag no longer needed
    expect(draft.sourceEvent).toBe("purchases.PAYMENT_MADE");
  });

  it("drafts balanced JE for cash payment", () => {
    const pay = postPaymentService.handler({
      paymentNo: "PP-101",
      postingDate: "2025-01-02",
      companyId: "demo.company",
      currency: "MYR",
      amount: 50,
      method: "cash"
    });

    const draft = onPaymentMade(pay as any, { dryRun: true });
    const td = (draft as any).lines.reduce((s: number, l: any) => s + l.debit, 0);
    const tc = (draft as any).lines.reduce((s: number, l: any) => s + l.credit, 0);

    expect(td).toBe(50);
    expect(tc).toBe(50);

    expect((draft as any).lines.some((l: any) => l.accountId === "2010" && l.debit === 50)).toBe(true);
    expect((draft as any).lines.some((l: any) => l.accountId === "1010" && l.credit === 50)).toBe(true);
    expect(draft.sourceEvent).toBe("purchases.PAYMENT_MADE");
  });

  it("manifests declare emits/consumes lanes", () => {
    expect(purchasesAdapter.manifest.events.emits).toContain("purchases.PAYMENT_MADE");
    expect(accountingAdapter.manifest.events.consumes).toContain("purchases.PAYMENT_MADE");
  });
});
