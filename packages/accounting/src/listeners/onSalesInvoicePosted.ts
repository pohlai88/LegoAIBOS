// packages/accounting/src/listeners/onSalesInvoicePosted.ts
import { createJournalEntryService } from "../services/createJournalEntry";

/**
 * v1.3.0: Auto-draft AR JE from Sales INVOICE_POSTED event
 * Maps sales invoices to GL accounts:
 * - DR Trade Receivables (1310) = total
 * - CR Sales Revenue (4010) = subtotal
 * - CR Output Tax Payable (2160) = tax (if applicable)
 */

// Duplicated from sales to avoid cross-module import boundary violation
export type SalesInvoicePostedPayload = {
  invoiceId: string;
  postingDate: string;
  companyId: string;
  customerId: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  lines: Array<{
    itemCode: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};

/**
 * v1.3.0: Auto-draft AR JE from Sales INVOICE_POSTED event
 * Mapping policy (v1.0):
 * - DR Trade Receivables (1310) = total (subtotal + tax)
 * - CR Sales Revenue (4010) = subtotal
 * - CR Output Tax Payable (2160) = tax (only if tax > 0)
 */
export function onSalesInvoicePosted(p: SalesInvoicePostedPayload) {
  const ar = p.total;
  const revenue = p.subtotal;
  const tax = p.tax;

  const lines = [
    { accountId: "1310", debit: ar, credit: 0, memo: `AR for ${p.invoiceId}` },
    { accountId: "4010", debit: 0, credit: revenue, memo: `Sales ${p.invoiceId}` }
  ];

  if (tax > 0) {
    lines.push({
      accountId: "2160",
      debit: 0,
      credit: tax,
      memo: `Output tax ${p.invoiceId}`
    });
  }

  const draft = {
    postingDate: p.postingDate,
    companyId: p.companyId,
    currency: p.currency,
    lines,
    allowOppositeNormalBalance: false  // No contra entries needed for AR/Revenue
  };

  const parsed = createJournalEntryService.inputSchema.safeParse(draft);
  if (!parsed.success) {
    throw new Error(`JE draft validation failed: ${parsed.error.message}`);
  }

  return createJournalEntryService.handler(parsed.data);
}
