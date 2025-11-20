// packages/accounting/src/listeners/onStockMoved.ts
import { createJournalEntryService } from "../services/createJournalEntry";

/**
 * v1.2.0: Auto-draft JE from Inventory STOCK_MOVED event
 * Maps stock movements to GL accounts using simple policy:
 * - OUT (sale/usage): DR COGS, CR Inventory
 * - IN (purchase/receipt): DR Inventory, CR Payables/GRNI
 */

// Duplicated from inventory to avoid cross-module import boundary violation
export type StockMovedPayload = {
  companyId: string;
  itemCode: string;
  qty: number;
  direction: "IN" | "OUT";
  unitCost: number;
  warehouseId?: string;
  refDoc?: string;
  postingDate: string;
};

export function onStockMoved(payload: StockMovedPayload) {
  const total = payload.qty * payload.unitCost;

  // v1 mapping policy (mock):
  // TODO: Replace with configurable GL mapping engine
  const inventoryAccount = "1200"; // Asset: Inventories
  const cogsAccount = "5010";      // Expense: Cost of Goods Sold
  const payablesAccount = "2010";  // Liability: Trade Payables (or GRNI)

  const lines =
    payload.direction === "OUT"
      ? [
          { accountId: cogsAccount, debit: total, credit: 0, memo: `${payload.itemCode} OUT` },
          { accountId: inventoryAccount, debit: 0, credit: total, memo: `${payload.itemCode} OUT` }
        ]
      : [
          { accountId: inventoryAccount, debit: total, credit: 0, memo: `${payload.itemCode} IN` },
          { accountId: payablesAccount, debit: 0, credit: total, memo: `${payload.itemCode} IN` }
        ];

  const draft = {
    postingDate: payload.postingDate,
    companyId: payload.companyId,
    currency: "MYR",
    referenceNo: payload.refDoc,
    userRemark: `Auto-draft from stock movement: ${payload.itemCode}`,
    lines,
    // v1.6.1: sourceEvent allowlist provides contra permission implicitly
    sourceEvent: "inventory.STOCK_MOVED"
  };

  const parsed = createJournalEntryService.inputSchema.safeParse(draft);
  if (!parsed.success) {
    throw new Error(`JE draft validation failed: ${parsed.error.message}`);
  }

  return createJournalEntryService.handler(parsed.data);
}
