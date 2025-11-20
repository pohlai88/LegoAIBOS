# ADR-002: SDK Manifest Schema as Single Source of Truth

## Metadata
- **Document ID**: ADR-002-SDK-SSOT
- **Version**: 1.0.0
- **Status**: Accepted
- **Date Issued**: 2025-11-20
- **Authors**: Jack + ChatGPT
- **Related SSOTs**: AI-BOS-KERNEL-BOILERPLATE-v1, AI-BOS-KERNEL-PDR-v1

---

## Context
In plugin-based platforms, drift occurs when:
- Type definitions and runtime validators diverge.
- Kernel validates one shape while SDK types allow another.
- Modules compile but fail at runtime (or vice versa).

Previous AI-BOS drafts showed early signs of this:
- Kernel had its own Zod schema.
- SDK had separate TypeScript types.
- Small inconsistencies emerged before coding started.

This is structurally unsafe for a Lego modular platform.

---

## Decision
We declare that **all adapter manifest types and validators live in `packages/kernel-sdk/`** as the SSOT.

Specifically:
1. `AppManifest` TypeScript type is defined in SDK.
2. `AppManifestSchema` (Zod runtime validator) is defined in SDK.
3. `defineApp()` validates manifests at definition time (fail-fast).
4. Kernel imports `validateAppManifest()` from SDK and MUST NOT redefine schema locally.

Kernel is therefore a consumer of SSOT contracts, not an author.

---

## Consequences
### Positive
- Eliminates schema drift between Kernel and SDK.
- Ensures modules fail fast on invalid adapters.
- Enables safe future versioning (SDK semver becomes law).
- Mirrors proven ERP/plugin architectures (single manifest authority).

### Negative / Tradeoffs
- Any manifest evolution requires SDK semver bump + ADR.
- Kernel release cadence must follow SDK contract changes.

---

## References
- AI-BOS Kernel Boilerplate SSOT v1.0.0 — SDK manifest schema placement
- AI-BOS Kernel PDR v1 — Adapter rules and lifecycle
