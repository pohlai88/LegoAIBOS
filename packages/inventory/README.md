# @aibos/inventory (MVP)

Inventory MVP v1.0.0 provides a thin-slice Stock Item capture module.

## Scope
- Create Stock Item (mock storage)
- List Stock Items (mock storage)
- UI form + list for quick proof
- Emits STOCK_ITEM_CREATED event

## Out of scope
- DB persistence/migrations
- Stock ledger, valuation, FIFO/WA
- Batch/serial, warehouses, transfers
- Integration into accounting posting

## Services
- `inventory.createStockItem`
- `inventory.getStockItemList`

## Route
- `/inventory/items`

## Dev
```bash
pnpm --filter @aibos/inventory typecheck
pnpm --filter @aibos/inventory lint
pnpm --filter @aibos/inventory test
```
