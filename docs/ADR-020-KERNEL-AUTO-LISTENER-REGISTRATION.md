# ADR-020: Kernel v1.1.1 Auto Listener Registration

- Date: 2025-11-21
- Status: Accepted
- Scope: Kernel + SDK (no manifest schema changes)

## Context
Before v1.1.1, integration tests and UI apps manually invoked
`registerInventoryEventListeners()` / `registerSalesEventListeners()` etc.
This caused drift risk and double-subscription on reboots.

## Decision
Kernel `boot()` will:
1. Build `KernelLanes` facade.
2. Auto-invoke `adapter.registerListeners(lanes)` if present.
3. Clear EventBus and registries on reboots to avoid duplicate handlers.

Adapters may expose:
- default export `{ manifest, registerListeners }`
- or named export `registerListeners`

## Consequences
- Listener wiring becomes OS responsibility.
- Test setup simplifies to: boot kernel → emit event → assert outputs.
- Modules remain Lego-removable with event lanes as the sole coupling point.

## References
- ADR-019 Kernel lanes facade
- ADR-010 Cross-module event proof template
