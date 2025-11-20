# ADR-005: Accounting MVP v1.0.0 — Journal Entry Capture Baseline

- **Date**: 2025-11-21
- **Author**: Jack + ChatGPT
- **Status**: Accepted
- **Scope**: packages/accounting only

## Context
AI-BOS requires a first real business module to validate kernel/SDK SSOT in practice.
Accounting is the most load-bearing domain. We need the smallest real slice that is:
1) legally modular (adapter only)
2) type-safe
3) balanced double entry guarded at contract level
4) visible in Kernel UI host

## Decision
Create Accounting module v1.0.0 with a single thin slice:
- One adapter manifest via SDK SSOT (`defineApp`)
- One route: Journal Entry Capture UI
- One service: `accounting.createJournalEntry`
- Balancing rules enforced by Zod schemas
- Handler is local stub (no kernel RPC/DB in v1.0.0)
- Emits `accounting.JOURNAL_CREATED` for future integration

## Consequences
- Kernel remains unchanged (v1.0.0 stable).
- Modules can now be born from template into real domains.
- DB write/proxy will be added in v1.1+ after at least one more module confirms service lane needs.
- This slice becomes canonical accounting DNA for later expansion (posting, approvals, party types, dimensions).

## References
- AI-BOS Development Contract v1.x
- KERNEL-PDR v1.0.0
- ADR-001 (Kernel baseline)
- ADR-002 (SDK SSOT)
- ADR-003 (HelloWorld service + event demo)
