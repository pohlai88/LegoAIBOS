import { describe, it, expect } from "vitest";
import { createJournalEntryService } from "../src/services/createJournalEntry";

// Helper to build a contra AP clearing draft
function buildContraAPDraft(extra: Partial<any> = {}) {
  return {
    postingDate: "2025-11-21",
    companyId: "demo.company",
    currency: "MYR",
    lines: [
      { accountId: "2010", debit: 100, credit: 0 }, // liability normally credit → contra debit
      { accountId: "1010", debit: 0, credit: 100 } // asset normally debit → normal credit reduction
    ],
    ...extra
  };
}

describe("sourceEvent guard hardening (v1.6.1)", () => {
  it("rejects manual contra without allowOppositeNormalBalance or sourceEvent", () => {
    const draft = buildContraAPDraft();
    const parsed = createJournalEntryService.inputSchema.safeParse(draft);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some(i => i.message.includes("Line normal balance mismatch"))).toBe(true);
    }
  });

  it("accepts contra with explicit allowOppositeNormalBalance (legacy path)", () => {
    const draft = buildContraAPDraft({ allowOppositeNormalBalance: true });
    const parsed = createJournalEntryService.inputSchema.safeParse(draft);
    expect(parsed.success).toBe(true);
  });

  it("accepts contra with trusted sourceEvent and no flag", () => {
    const draft = buildContraAPDraft({ sourceEvent: "purchases.PAYMENT_MADE" });
    const parsed = createJournalEntryService.inputSchema.safeParse(draft);
    expect(parsed.success).toBe(true);
  });
});
