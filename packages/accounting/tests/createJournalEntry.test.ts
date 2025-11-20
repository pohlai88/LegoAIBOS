import { describe, it, expect } from "vitest";
import { createJournalEntryService } from "../src/services/createJournalEntry";

describe("createJournalEntry service", () => {
  it("rejects unbalanced journals", () => {
    const bad = {
      postingDate: "2025-01-01",
      companyId: "demo.company",
      currency: "MYR",
      lines: [
        { accountId: "a", debit: 100, credit: 0 },
        { accountId: "b", debit: 0, credit: 90 }
      ]
    };

    const parsed = createJournalEntryService.inputSchema.safeParse(bad);
    expect(parsed.success).toBe(false);
  });

  it("accepts balanced journals", () => {
    const good = {
      postingDate: "2025-01-01",
      companyId: "demo.company",
      currency: "MYR",
      lines: [
        { accountId: "a", debit: 100, credit: 0 },
        { accountId: "b", debit: 0, credit: 100 }
      ]
    };

    const parsed = createJournalEntryService.inputSchema.safeParse(good);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const out = createJournalEntryService.handler(parsed.data);
    expect(out.totalDebit).toBe(100);
    expect(out.totalCredit).toBe(100);
  });
});
