import { z } from "zod";
import type { PurchaseBillPostedPayload } from "../schema/types";

const LineSchema = z.object({
  accountId: z.string().min(1),
  qty: z.number().positive().optional(),
  unitCost: z.number().nonnegative().optional(),
  amount: z.number().nonnegative().optional(),
  memo: z.string().optional()
}).refine(l => {
  // must have amount OR (qty & unitCost)
  return l.amount !== undefined || (l.qty !== undefined && l.unitCost !== undefined);
}, { message: "Line must have amount or qty*unitCost" });

export const PostBillInputSchema = z.object({
  billNo: z.string().min(1),
  postingDate: z.string().min(10),
  companyId: z.string().min(1),
  supplierId: z.string().optional(),
  currency: z.string().min(1),
  taxRate: z.number().min(0).max(100).optional(),
  lines: z.array(LineSchema).min(1)
});

export const PostBillOutputSchema = z.object({
  id: z.string(),
  billNo: z.string(),
  postingDate: z.string(),
  companyId: z.string(),
  supplierId: z.string().optional(),
  currency: z.string(),
  subtotal: z.number(),
  taxAmount: z.number(),
  total: z.number(),
  lines: z.array(z.object({
    accountId: z.string(),
    amount: z.number(),
    memo: z.string().optional()
  }))
});

export type PostBillInput = z.infer<typeof PostBillInputSchema>;
export type PostBillOutput = z.infer<typeof PostBillOutputSchema>;

function computeAmount(l: z.infer<typeof LineSchema>) {
  if (l.amount !== undefined) return l.amount;
  return Number(l.qty) * Number(l.unitCost);
}

export const postBillService = {
  key: "purchases.postBill",
  description: "Posts a supplier bill and returns computed totals. v1.0.0 is local-stub.",
  inputSchema: PostBillInputSchema,
  outputSchema: PostBillOutputSchema,

  handler: (input: PostBillInput): PostBillOutput => {
    const normalizedLines = input.lines.map(l => ({
      accountId: l.accountId,
      amount: computeAmount(l),
      memo: l.memo
    }));

    const subtotal = normalizedLines.reduce((s, l) => s + l.amount, 0);
    const taxRate = input.taxRate ?? 0;
    const taxAmount = +(subtotal * taxRate / 100).toFixed(2);
    const total = +(subtotal + taxAmount).toFixed(2);

    const out: PurchaseBillPostedPayload = {
      id: `PB-${Date.now()}`,
      billNo: input.billNo,
      postingDate: input.postingDate,
      companyId: input.companyId,
      supplierId: input.supplierId,
      currency: input.currency,
      subtotal,
      taxAmount,
      total,
      lines: normalizedLines
    };

    // v1.0.0 note: emission handled by kernel lane at runtime
    return out;
  }
};
