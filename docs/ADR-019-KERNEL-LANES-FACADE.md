# ADR-019: Kernel v1.1.0 Lanes Facade (Services + Events)

Date: 2025-11-20
Status: Accepted

## Context
Kernel v1.0.0 intentionally shipped as a minimal chassis (boot, registry, event bus) allowing real modules to surface actual runtime needs. After multiple operational→financial flows (Inventory STOCK_MOVED, Sales INVOICE_POSTED/CASH_RECEIPT_POSTED, Purchases BILL_POSTED/PAYMENT_MADE) and guard hardening (sourceEvent allowlist, v1.6.1 accounting), we now have evidence for a stable interaction surface.

Direct imports of service handlers or raw EventBus wiring inside modules/UI couples implementation details and duplicates validation. A typed facade simplifies runtime invocation and constrains boundaries.

## Decision
Introduce `kernel.lanes(ctx)` producing a `KernelLanes` object with:
- `services.call(key, input)` → resolves service by manifest key, validates input/output via schemas (if provided), invokes handler.
- `events.emit(type, payload)` → emits structured events with tenant context.
- `events.on(type, handler)` → subscribes; returns unsubscribe.
- `ctx` → the resolved `KernelContext` for downstream use.

Listener registration in Accounting migrated to accept `KernelLanes` instead of an ad-hoc `(onEvent)` function. Kernel UI obtains lanes after boot and wires register*EventListeners once (dev host proof).

## Consequences
- Modules never touch kernel internals (registries/bus) directly; only lanes.
- Service boundaries centrally enforce validation (Zod parse) and output shape.
- Event provenance preserved (future telemetry / multi-tenant filtering possible behind facade without API break).
- Simplifies future additions (discovery, tracing, auth scopes) by extending lanes rather than changing module code.
- Legacy direct handler calls in pages can be deprecated gradually (currently fall back if lanes absent).

## Alternatives Considered
- Exposing registries directly (rejected: increases coupling & surface area).
- Generating per-module client SDKs (premature for v1.1; evidence favors a single kernel-facade first).

## Future Work (Not in Scope Here)
- Lane discovery API (enumerate installed services/events for UI auto-suggest).
- Telemetry/event audit emission per service call.
- Auth/permission filtering inside `services.call`.
- Configurable dynamic trusted sourceEvent list (guard policy extension).

## References
- ADR-001 Kernel Baseline Architecture
- ADR-002 SDK SSOT
- ADR-011..018 Operational→Financial flows & guard evolution
- Accounting v1.7.0 listener migration

## Status Tracking
Kernel tagged: `kernel-v1.1.0-lanes`
Accounting tagged: `accounting-v1.7.0-lanes-listeners` (post migration)
