import { z } from "zod";
import { MOCK_COA } from "../data/coaMock";

export const GetCOAListInputSchema = z.object({
  companyId: z.string().min(1),
  type: z.enum(["asset", "liability", "equity", "revenue", "expense"]).optional(),
  isActive: z.boolean().optional()
});

export const GetCOAListOutputSchema = z.object({
  accounts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
    category: z.string(),
    normalBalance: z.enum(["debit", "credit"]),
    isActive: z.boolean(),
    parentId: z.string().optional()
  }))
});

export type GetCOAListInput = z.infer<typeof GetCOAListInputSchema>;
export type GetCOAListOutput = z.infer<typeof GetCOAListOutputSchema>;

export const getCOAListService = {
  key: "accounting.getCOAList",
  description: "Returns list of Chart of Accounts. v1.0.1 uses mock MFRS5-inspired data.",
  inputSchema: GetCOAListInputSchema,
  outputSchema: GetCOAListOutputSchema,

  handler: (input: GetCOAListInput): GetCOAListOutput => {
    let filtered = MOCK_COA;

    if (input.type) {
      filtered = filtered.filter(a => a.type === input.type);
    }

    if (input.isActive !== undefined) {
      filtered = filtered.filter(a => a.isActive === input.isActive);
    }

    return { accounts: filtered };
  }
};
