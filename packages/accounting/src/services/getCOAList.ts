import { z } from "zod";
import type { ChartOfAccount } from "../schema/types";

// Mock MFRS5-inspired COA for v1.0.1 proof
const MOCK_COA: ChartOfAccount[] = [
  { id: "1010", name: "Petty Cash", type: "asset", category: "Current Asset", normalBalance: "debit", isActive: true },
  { id: "1020", name: "Bank - Current Account", type: "asset", category: "Current Asset", normalBalance: "debit", isActive: true },
  { id: "1310", name: "Trade Receivables", type: "asset", category: "Current Asset", normalBalance: "debit", isActive: true },
  { id: "2010", name: "Trade Payables", type: "liability", category: "Current Liability", normalBalance: "credit", isActive: true },
  { id: "3010", name: "Share Capital", type: "equity", category: "Equity", normalBalance: "credit", isActive: true },
  { id: "4010", name: "Sales Revenue", type: "revenue", category: "Operating Revenue", normalBalance: "credit", isActive: true },
  { id: "5010", name: "Cost of Goods Sold", type: "expense", category: "Direct Expense", normalBalance: "debit", isActive: true },
  { id: "5100", name: "Office Supplies", type: "expense", category: "Operating Expense", normalBalance: "debit", isActive: true },
  { id: "5200", name: "Salaries & Wages", type: "expense", category: "Operating Expense", normalBalance: "debit", isActive: true }
];

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
