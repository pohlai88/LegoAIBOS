# ADR-009: Inventory v1.0.1 — Stock Movement Thin Slice

- **Date**: 2025-11-20
- **Author**: Jack + ChatGPT
- **Status**: Accepted
- **Scope**: packages/inventory only

## Context
Inventory v1.0.0 proved module DNA and master data capture, but lacked operational reality. 
Without movement, qtyOnHand is static and the domain remains a hollow shell.

## Decision
Add Stock Movement capability in v1.0.1:

- New entity types: `StockMoveDraft`, `StockMovePosted`, `StockMoveReason`
- New service: `inventory.createStockMove`
  - Validates item exists
  - Blocks qtyDelta=0
  - Prevents negative stock unless `allowNegative=true`
- Shared mock store (`stockMock.ts`) updates qtyOnHand and stores moves
- UI extends existing Stock Items page with:
  - Movement form
  - Recent moves list
- Emits event: `inventory.STOCK_MOVED`
- No kernel changes (kernel v1.0.0 remains frozen)

## Consequences
- Inventory becomes operational, not just master data
- Creates meaningful event lane for cross-domain proofs (Accounting valuation later)
- Negative stock is guarded but has admin escape hatch
- Mock store stays temporary until DB + warehouses land in v1.2+

## References
- ADR-008 (Inventory Stock Item Capture MVP)
- AI-BOS Development Contract v1 (adapter + service lanes)
