# ADR-017: Accounting v1.6.0 — Auto-draft AP Clearing JE from Purchases Payment

- Date: 2025-11-21
- Status: Accepted
- Scope: packages/accounting only

## Context
AP is credit-normal. Paying it down requires a debit (contra vs normal balance). This is routine accounting, not an edge case.

## Decision
Consume purchases.PAYMENT_MADE and auto-draft JE:
- DR Trade Payables (2010) for amount
- CR Bank (1020) or Cash (1010) for amount
- Set allowOppositeNormalBalance=true to declare valid contra intent.

## Consequences
- Third empirical contra proof (Inventory reduction, AR clearing, AP clearing)
- Enables guard hardening based on evidence (v1.4.1)
