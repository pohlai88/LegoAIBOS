export type JournalLine = {
  accountId: string;      // COA id (from your MFRS5 COA)
  debit: number;          // >= 0
  credit: number;         // >= 0
  memo?: string;
};

export type JournalEntryDraft = {
  postingDate: string;    // ISO date string
  companyId: string;      // tenant/company UUID
  currency: string;       // e.g. "MYR"
  referenceNo?: string;
  referenceDate?: string; // ISO date string
  userRemark?: string;
  lines: JournalLine[];
};

export type JournalEntryCreated = JournalEntryDraft & {
  id: string;             // JE UUID
  totalDebit: number;
  totalCredit: number;
  status: "draft" | "posted";
};

export type ChartOfAccount = {
  id: string;              // COA account code (e.g., "1010", "5100")
  name: string;            // Account name (e.g., "Petty Cash", "Office Supplies")
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  category: string;        // e.g., "Current Asset", "Operating Expense"
  normalBalance: "debit" | "credit";
  isActive: boolean;
  parentId?: string;       // For hierarchical COA
};

export type COAListFilter = {
  type?: ChartOfAccount["type"];
  isActive?: boolean;
};
