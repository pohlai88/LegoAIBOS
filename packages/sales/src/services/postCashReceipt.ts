import { z } from "zod";
import type { CashReceiptDraft, CashReceiptPostedPayload } from "../schema/types";

export const PostCashReceiptInputSchema = z.object({
  receiptId: z.string().min(1),
  postingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  companyId: z.string().min(1),
  customerId: z.string().min(1),
  currency: z.string().min(1),
  amount: z.number().positive(),
  method: z.enum(["bank", "cash"]),
  bankAccountId: z.string().optional(),
  invoiceId: z.string().optional(),
  refDoc: z.string().optional(),
});

export const PostCashReceiptOutputSchema = z.object({
  ok: z.literal(true),
  payload: z.object({
    receiptId: z.string(),
    postingDate: z.string(),
    companyId: z.string(),
    customerId: z.string(),
    currency: z.string(),
    amount: z.number(),
    method: z.enum(["bank", "cash"]),
    bankAccountId: z.string().optional(),
    invoiceId: z.string().optional(),
    refDoc: z.string().optional(),
  }),
});

export type PostCashReceiptInput = z.infer<typeof PostCashReceiptInputSchema>;
export type PostCashReceiptOutput = z.infer<typeof PostCashReceiptOutputSchema>;

// local stub: emits event via kernel lane (same pattern as invoice)
export const postCashReceiptService = {
  key: "sales.postCashReceipt",
  description: "Posts a cash receipt and emits sales.CASH_RECEIPT_POSTED (v1 stub).",
  inputSchema: PostCashReceiptInputSchema,
  outputSchema: PostCashReceiptOutputSchema,

  handler: (input: PostCashReceiptInput): PostCashReceiptOutput => {
    const payload: CashReceiptPostedPayload = {
      receiptId: input.receiptId,
      postingDate: input.postingDate,
      companyId: input.companyId,
      customerId: input.customerId,
      currency: input.currency,
      amount: input.amount,
      method: input.method,
      bankAccountId: input.method === "bank" ? (input.bankAccountId || "1020") : undefined,
      invoiceId: input.invoiceId,
      refDoc: input.refDoc,
    };

    return { ok: true, payload };
  },
};
