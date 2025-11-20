import { z } from "zod";
import { getAccountNormalBalance } from "../data/coaMock";

const JournalLineSchema = z.object({
  accountId: z.string().min(1),
  debit: z.number().nonnegative(),
  credit: z.number().nonnegative(),
  memo: z.string().optional()
}).refine(l => !(l.debit > 0 && l.credit > 0), {
  message: "A line cannot have both debit and credit."
});

const TRUSTED_SOURCE_EVENTS = [
  "inventory.STOCK_MOVED",
  "sales.CASH_RECEIPT_POSTED",
  "purchases.PAYMENT_MADE"
] as const;

export const CreateJournalEntryInputSchema = z.object({
  postingDate: z.string().min(1),
  companyId: z.string().min(1),
  currency: z.string().min(1),
  referenceNo: z.string().optional(),
  referenceDate: z.string().optional(),
  userRemark: z.string().optional(),
  allowOppositeNormalBalance: z.boolean().optional(),
  // v1.6.1: Guard hardening – trusted automation shortcut
  sourceEvent: z.string().optional(),
  lines: z.array(JournalLineSchema).min(2)
}).refine(d => {
  const td = d.lines.reduce((s, l) => s + l.debit, 0);
  const tc = d.lines.reduce((s, l) => s + l.credit, 0);
  return td > 0 && tc > 0 && Math.abs(td - tc) < 0.000001;
}, {
  message: "Journal must balance: totalDebit = totalCredit and both > 0."
}).refine(d => {
  const allowOpposite = d.allowOppositeNormalBalance === true;
  const trusted = !!d.sourceEvent && TRUSTED_SOURCE_EVENTS.includes(d.sourceEvent as any);

  for (const line of d.lines) {
    const nb = getAccountNormalBalance(line.accountId);
    if (!nb) return false; // Unknown account

    const debitOnly = line.debit > 0 && line.credit === 0;
    const creditOnly = line.credit > 0 && line.debit === 0;

    // Normal balance mismatch (contra) permitted if explicit override OR trusted automation sourceEvent
    if (!allowOpposite && !trusted) {
      if (nb === "debit" && creditOnly) return false;
      if (nb === "credit" && debitOnly) return false;
    }
  }
  return true;
}, {
  message: "Line normal balance mismatch. Use correct Dr/Cr OR set allowOppositeNormalBalance=true OR supply trusted sourceEvent."
});

export const CreateJournalEntryOutputSchema = z.object({
  id: z.string(),
  totalDebit: z.number(),
  totalCredit: z.number(),
  status: z.enum(["draft", "posted"])
});

export type CreateJournalEntryInput = z.infer<typeof CreateJournalEntryInputSchema>;
export type CreateJournalEntryOutput = z.infer<typeof CreateJournalEntryOutputSchema>;

export const createJournalEntryService = {
  key: "accounting.createJournalEntry",
  description: "Creates a balanced journal entry draft with COA normal balance validation (v1.1.0) + sourceEvent guard shortcut (v1.6.1). Handler is local-only stub.",
  inputSchema: CreateJournalEntryInputSchema,
  outputSchema: CreateJournalEntryOutputSchema,

  // v1.1.0: Added normal balance validation against COA
  // v1.0.0: Balancing validation only
  // Real DB write lands in v1.2+ once kernel service lanes are final.
  handler: (input: CreateJournalEntryInput): CreateJournalEntryOutput => {
    const totalDebit = input.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = input.lines.reduce((s, l) => s + l.credit, 0);

    return {
      id: `je_${Math.random().toString(36).slice(2)}`,
      totalDebit,
      totalCredit,
      status: "draft"
    };
  }
};
