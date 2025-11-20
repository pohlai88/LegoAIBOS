// tests/kernel/salesToJeDraft.test.ts
import { describe, it, expect } from "vitest";
import { onSalesInvoicePosted } from "../../packages/accounting/src/listeners/onSalesInvoicePosted";
import { createJournalEntryService } from "../../packages/accounting/src/services/createJournalEntry";

describe("Sales → AR JE draft", () => {
  it("drafts balanced JE without tax", () => {
    const draft = onSalesInvoicePosted({
      invoiceId: "SI-1",
      postingDate: "2025-01-01",
      companyId: "demo.company",
      customerId: "demo.customer",
      currency: "MYR",
      subtotal: 100,
      tax: 0,
      total: 100,
      lines: []
    });

    expect(draft).toBeDefined();
    expect(draft.id).toBeDefined();
    expect(draft.status).toBe("draft");
    expect(draft.totalDebit).toBe(100);
    expect(draft.totalCredit).toBe(100);
  });

  it("drafts balanced JE with tax", () => {
    const draft = onSalesInvoicePosted({
      invoiceId: "SI-2",
      postingDate: "2025-01-01",
      companyId: "demo.company",
      customerId: "demo.customer",
      currency: "MYR",
      subtotal: 100,
      tax: 6,
      total: 106,
      lines: []
    });

    expect(draft).toBeDefined();
    expect(draft.id).toBeDefined();
    expect(draft.status).toBe("draft");
    expect(draft.totalDebit).toBe(106);
    expect(draft.totalCredit).toBe(106);
  });

  it("uses correct validation for normal balance", () => {
    // Should not throw - all entries follow normal balance rules:
    // AR (1310) asset → DR ✓
    // Revenue (4010) revenue → CR ✓
    // Output Tax (2160) liability → CR ✓
    expect(() => onSalesInvoicePosted({
      invoiceId: "SI-3",
      postingDate: "2025-01-01",
      companyId: "demo.company",
      customerId: "demo.customer",
      currency: "MYR",
      subtotal: 100,
      tax: 6,
      total: 106,
      lines: []
    })).not.toThrow();
  });
});
