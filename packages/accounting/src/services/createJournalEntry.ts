import { z } from "zod";

const JournalLineSchema = z.object({
  accountId: z.string().min(1),
  debit: z.number().nonnegative(),
  credit: z.number().nonnegative(),
  memo: z.string().optional()
}).refine(l => !(l.debit > 0 && l.credit > 0), {
  message: "A line cannot have both debit and credit."
});

export const CreateJournalEntryInputSchema = z.object({
  postingDate: z.string().min(1),
  companyId: z.string().min(1),
  currency: z.string().min(1),
  referenceNo: z.string().optional(),
  referenceDate: z.string().optional(),
  userRemark: z.string().optional(),
  lines: z.array(JournalLineSchema).min(2)
}).refine(d => {
  const td = d.lines.reduce((s, l) => s + l.debit, 0);
  const tc = d.lines.reduce((s, l) => s + l.credit, 0);
  return td > 0 && tc > 0 && Math.abs(td - tc) < 0.000001;
}, {
  message: "Journal must balance: totalDebit = totalCredit and both > 0."
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
  description: "Creates a balanced journal entry draft. v1 handler is local-only stub.",
  inputSchema: CreateJournalEntryInputSchema,
  outputSchema: CreateJournalEntryOutputSchema,

  // v1.0.0 stub: kernel does not yet proxy writes to DB.
  // Real DB write lands in v1.1+ once kernel service lanes are final.
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
