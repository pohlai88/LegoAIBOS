export type PurchaseBillLineDraft = {
  accountId: string;        // expense or inventory in later versions
  qty?: number;
  unitCost?: number;
  amount?: number;          // if omitted, qty*unitCost is used
  memo?: string;
};

export type PurchaseBillDraft = {
  billNo: string;
  postingDate: string;      // YYYY-MM-DD
  companyId: string;
  supplierId?: string;
  currency: string;
  taxRate?: number;         // 0-100
  lines: PurchaseBillLineDraft[];
};

export type PurchaseBillPostedPayload = {
  id: string;
  billNo: string;
  postingDate: string;
  companyId: string;
  supplierId?: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  lines: Array<{
    accountId: string;
    amount: number;
    memo?: string;
  }>;
};

export const BILL_POSTED_EVENT = "purchases.BILL_POSTED" as const;
