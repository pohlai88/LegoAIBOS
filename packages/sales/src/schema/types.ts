export type SalesInvoiceLine = {
  itemCode: string;
  description?: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type SalesInvoiceDraft = {
  postingDate: string;     // YYYY-MM-DD
  companyId: string;
  customerId: string;
  currency: string;        // "MYR"
  taxRate?: number;        // 0..1 (e.g. 0.06)
  lines: SalesInvoiceLine[];
};

export type SalesInvoicePostedPayload = {
  invoiceId: string;
  postingDate: string;
  companyId: string;
  customerId: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  lines: SalesInvoiceLine[];
};

export const SALES_INVOICE_POSTED_EVENT = "sales.INVOICE_POSTED" as const;

// Cash Receipt types (v1.0.1)
export type CashReceiptDraft = {
  receiptId: string;
  postingDate: string;   // YYYY-MM-DD
  companyId: string;
  customerId: string;
  currency: string;      // e.g. "MYR"
  amount: number;        // > 0
  method: "bank" | "cash";
  bankAccountId?: string; // default "1020" if method=bank
  invoiceId?: string;     // optional link (v1)
  refDoc?: string;
};

export type CashReceiptPostedPayload = {
  receiptId: string;
  postingDate: string;
  companyId: string;
  customerId: string;
  currency: string;
  amount: number;
  method: "bank" | "cash";
  bankAccountId?: string;
  invoiceId?: string;
  refDoc?: string;
};

export const CASH_RECEIPT_POSTED_EVENT = "sales.CASH_RECEIPT_POSTED" as const;
