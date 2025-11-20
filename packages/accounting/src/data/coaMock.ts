import type { ChartOfAccount } from "../schema/types";

export const MOCK_COA: ChartOfAccount[] = [
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

export function getAccountNormalBalance(accountId: string): "debit" | "credit" | undefined {
  return MOCK_COA.find(a => a.id === accountId)?.normalBalance;
}
