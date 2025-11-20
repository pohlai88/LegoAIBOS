# ADR-001: Adopt Kernel v1.0.0 Baseline

## Metadata
- **Document ID**: ADR-001-KERNEL-BASELINE
- **Version**: 1.0.0
- **Status**: Accepted
- **Date Issued**: 2025-11-20
- **Authors**: Jack + ChatGPT
- **Related SSOTs**: AI-BOS-CONTRACT-v1, AI-BOS-KERNEL-PDR-v1, AI-BOS-KERNEL-BOILERPLATE-v1

---

## Context
AI-BOS requires a modular, Lego-style platform where each module can be installed, upgraded, disabled, or removed without destabilizing other modules.

Earlier development attempts drifted into monolith behavior:
- Kernel and modules cross-imported code or DB layers.
- Adapter contracts were inconsistent or optional.
- System broke when one domain changed.

A baseline Kernel must therefore be frozen before any real modules are developed.

---

## Decision
We adopt **Kernel v1.0.0 baseline** as defined in:
- **AI-BOS Kernel PDR v1**
- **AI-BOS Kernel Boilerplate SSOT v1.0.0**

Kernel v1.0.0 includes only:
1. AppRegistry (installed app state)
2. AdapterLoader + AdapterRegistry (install/upgrade/unmount)
3. Manifest validation (imported from SDK SSOT schema)
4. Tenant-scoped EventBus
5. KernelContext stub
6. Minimal KernelShell UI stub
7. Boundary enforcement (ESLint + CI + unit tests)

Kernel v1.0.0 explicitly **excludes** business domains, cross-module DB access, marketplace fetching, migration runners, async queues, or router runtime.

---

## Consequences
### Positive
- Provides a stable chassis for all future modules.
- Enforces hard modular boundaries from day 1.
- Prevents drift through SSOT schema + ESLint + CI.
- Enables safe install/uninstall without platform collapse.

### Negative / Tradeoffs
- Marketplace, DB provisioning, router rendering, and persistence features must wait for v1.1+.
- Event payload types remain generic until real modules define event catalogs.

---

## References
- AI-BOS Development Contract v1 — Architecture & Process Guardrails
- AI-BOS Kernel PDR v1 — Mission, lifecycle, boundaries
- AI-BOS Kernel Boilerplate SSOT v1.0.0 — Enacted scaffold
