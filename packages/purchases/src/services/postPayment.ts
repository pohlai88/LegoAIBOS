import { z } from "zod";

export const PostPaymentInputSchema = z.object({
  paymentNo: z.string().min(1),
  postingDate: z.string().min(10),
  companyId: z.string().min(1),
  supplierId: z.string().optional(),
  currency: z.string().min(1),
  amount: z.number().positive(),

  method: z.enum(["bank", "cash"]),
  bankAccountId: z.string().optional(),

  billNo: z.string().optional(),
  memo: z.string().optional()
}).refine(d => {
  if (d.method === "bank") return !!d.bankAccountId;
  return true;
}, { message: "bankAccountId is required when method=bank" });

export const PostPaymentOutputSchema = z.object({
  id: z.string(),
  paymentNo: z.string(),
  postingDate: z.string(),
  companyId: z.string(),
  supplierId: z.string().optional(),
  currency: z.string(),
  amount: z.number(),
  method: z.enum(["bank", "cash"]),
  bankAccountId: z.string().optional(),
  billNo: z.string().optional(),
  memo: z.string().optional()
});

export type PostPaymentInput = z.infer<typeof PostPaymentInputSchema>;
export type PostPaymentOutput = z.infer<typeof PostPaymentOutputSchema>;

export const postPaymentService = {
  key: "purchases.postPayment",
  description: "Posts supplier payment. v1.0.1 is local-stub.",
  inputSchema: PostPaymentInputSchema,
  outputSchema: PostPaymentOutputSchema,

  handler: (input: PostPaymentInput): PostPaymentOutput => {
    return {
      id: `PP-${Date.now()}`,
      ...input
    };
  }
};
