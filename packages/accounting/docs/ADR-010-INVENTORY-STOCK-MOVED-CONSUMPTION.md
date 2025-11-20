# ADR-010: Accounting consumes inventory.STOCK_MOVED (Cross-Module Proof)

- **Date**: 2025-11-20
- **Author**: Jack + ChatGPT
- **Status**: Accepted
- **Scope**: packages/accounting, packages/inventory, tests/kernel

## Context
We need a real cross-domain proof that modules communicate only via kernel event lanes.
Inventory v1.0.1 introduced stock movement. To validate Lego modularity, Accounting must consume the movement event without importing kernel internals or inventory DB structures.

## Decision
- Inventory emits `inventory.STOCK_MOVED` after stock movement posting.
- Accounting declares it consumes this event and exposes `registerInventoryEventListeners(onEvent, handler?)`.
- Kernel integration test installs both and proves event delivery end-to-end.

## Consequences
- Confirms safe inter-module wiring without kernel changes.
- Establishes event-lane template for future modules (Sales→AR, AP→Cash, Payroll→GL).
- No DB coupling or cross-imports beyond shared types.

## References
- SSOT Contract v1
- ADR-009 (Inventory Stock Movement baseline)
- ADR-007 (Accounting guarded JE baseline)
