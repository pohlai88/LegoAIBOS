import { z } from "zod";

export const PostSalesInvoiceInputSchema = z.object({
  postingDate: z.string().min(10),
  companyId: z.string().min(1),
  customerId: z.string().min(1),
  currency: z.string().min(1),
  taxRate: z.number().min(0).max(1).optional(),
  lines: z.array(
    z.object({
      itemCode: z.string().min(1),
      description: z.string().optional(),
      qty: z.number().positive(),
      unitPrice: z.number().nonnegative(),
      lineTotal: z.number().nonnegative()
    })
  ).min(1)
}).refine(d => {
  const recomputed = d.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const declared = d.lines.reduce((s, l) => s + l.lineTotal, 0);
  return Math.abs(recomputed - declared) < 0.000001;
}, { message: "Line totals must equal qty * unitPrice" });

export const PostSalesInvoiceOutputSchema = z.object({
  invoiceId: z.string(),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number()
});

export type PostSalesInvoiceInput = z.infer<typeof PostSalesInvoiceInputSchema>;
export type PostSalesInvoiceOutput = z.infer<typeof PostSalesInvoiceOutputSchema>;

export const postSalesInvoiceService = {
  key: "sales.postSalesInvoice",
  description: "Posts a Sales Invoice (v1.0.0 local stub). Emits sales.INVOICE_POSTED via event helper.",
  inputSchema: PostSalesInvoiceInputSchema,
  outputSchema: PostSalesInvoiceOutputSchema,

  handler: (input: PostSalesInvoiceInput): PostSalesInvoiceOutput => {
    const subtotal = input.lines.reduce((s, l) => s + l.lineTotal, 0);
    const taxRate = input.taxRate ?? 0;
    const tax = +(subtotal * taxRate).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);

    return {
      invoiceId: `SI-${Date.now()}`,
      subtotal,
      tax,
      total
    };
  }
};
