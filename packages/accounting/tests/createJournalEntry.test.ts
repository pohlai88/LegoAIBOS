import { describe, it, expect } from "vitest";
import { createJournalEntryService } from "../src/services/createJournalEntry";

describe("createJournalEntry service", () => {
  it("rejects unbalanced journals", () => {
    const bad = {
      postingDate: "2025-01-01",
      companyId: "demo.company",
      currency: "MYR",
      lines: [
        { accountId: "1010", debit: 100, credit: 0 },
        { accountId: "4010", debit: 0, credit: 90 }
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
        { accountId: "1010", debit: 100, credit: 0 },  // Petty Cash (debit-normal)
        { accountId: "4010", debit: 0, credit: 100 }   // Sales Revenue (credit-normal)
      ]
    };

    const parsed = createJournalEntryService.inputSchema.safeParse(good);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

  const output = createJournalEntryService.handler(parsed.data);
  expect(output.totalDebit).toBe(100);
  expect(output.totalCredit).toBe(100);
  expect(output.status).toBe("draft");
  });
});

  it("rejects credit-only posting to debit-normal account by default", () => {
    const bad = {
      postingDate: "2025-11-21",
      companyId: "demo.company",
      currency: "MYR",
      lines: [
        { accountId: "1010", debit: 0, credit: 100 },  // Petty Cash (debit-normal) incorrectly credited
        { accountId: "4010", debit: 100, credit: 0 }   // Sales Revenue (credit-normal) incorrectly debited
      ]
    };

    const parsed = createJournalEntryService.inputSchema.safeParse(bad);
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues[0].message).toContain("normal balance");
  });

  it("allows opposite-normal posting when override flag is true", () => {
    const override = {
      postingDate: "2025-11-21",
      companyId: "demo.company",
      currency: "MYR",
      allowOppositeNormalBalance: true,
      lines: [
        { accountId: "1010", debit: 0, credit: 100 },  // Petty Cash credited (adjustment scenario)
        { accountId: "4010", debit: 100, credit: 0 }   // Sales Revenue debited (adjustment scenario)
      ]
    };

    const parsed = createJournalEntryService.inputSchema.safeParse(override);
    expect(parsed.success).toBe(true);
  });
