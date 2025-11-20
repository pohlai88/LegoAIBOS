// packages/inventory/src/services/getItemValuation.ts
import { findStockItem } from "../data/stockMock";

/**
 * v1.0.3: Mock valuation helper
 * Returns unitCost from stock item mock data
 * Later: replace with real valuation engine (FIFO/LIFO/weighted avg)
 */
export function getItemValuation(itemCode: string): number {
  const item = findStockItem(itemCode);
  if (!item) {
    throw new Error(`Item not found for valuation: ${itemCode}`);
  }
  return item.unitCost;
}
