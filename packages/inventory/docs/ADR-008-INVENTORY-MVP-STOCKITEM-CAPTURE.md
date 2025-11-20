# ADR-008: Inventory v1.0.0 — Stock Item Capture MVP

- **Date**: 2025-11-21
- **Author**: Jack + ChatGPT
- **Status**: Accepted
- **Scope**: packages/inventory only

## Context
Kernel v1.0.0 and module template DNA are stable.
We need a second domain module to validate:
1) adapter lifecycle across domains,
2) service + UI integration pattern,
3) SSOT boundary enforcement outside accounting.

Inventory is chosen because it is master-data + operational by nature and will later connect to accounting valuation.

## Decision
Ship Inventory MVP v1.0.0 with:
- `inventory.createStockItem` service
  - Zod validation for required fields, qty/cost >= 0, unique itemCode
  - Mock storage only (no DB, no migrations)
- `inventory.getStockItemList` read-only service for UI
- One UI route: `/inventory/items`
  - Form capture + active items list
- Emits `inventory.STOCK_ITEM_CREATED`
- No kernel changes

## Consequences
- Proves module DNA works in a second bounded context
- Builds real multi-domain evidence before Kernel v1.1 expansion
- Mock storage is sufficient for MVP; persistence lands after valuation/posting pipeline exists.

## References
- AI-BOS Development Contract v1 (SSOT)
- Kernel PDR v1.0.0
- Templates/module baseline
