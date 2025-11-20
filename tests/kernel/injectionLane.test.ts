import { describe, it, expect } from "vitest";
import kernel from "../../apps/kernel/src/index";
import accountingAdapter from "../../packages/accounting/src/index";

// v1.1.0: Kernel lanes facade injection proof

describe("kernel lanes injection", () => {
  it("calls accounting services via lanes facade", async () => {
    await kernel.boot({ mode: "test", adapters: [accountingAdapter] });
    const lanes = kernel.lanes();

    const coa: any = await lanes.services.call("accounting.getCOAList", { companyId: "demo.company" });
    expect(coa.accounts.length).toBeGreaterThan(0);

    const debitAcc = coa.accounts.find((a: any) => a.normalBalance === "debit")!.id;
    const creditAcc = coa.accounts.find((a: any) => a.normalBalance === "credit")!.id;
    const je: any = await lanes.services.call("accounting.createJournalEntry", {
      postingDate: "2025-11-20",
      companyId: "demo.company",
      currency: "MYR",
      lines: [
        { accountId: debitAcc, debit: 100, credit: 0 },
        { accountId: creditAcc, debit: 0, credit: 100 }
      ]
    });
    expect(je.status).toBe("draft");
    expect(je.totalDebit).toBe(100);
    expect(je.totalCredit).toBe(100);
  });
});
