# ADR-016: Purchases v1.0.1 — Payment Made MVP

- Date: 2025-11-21
- Status: Accepted
- Scope: packages/purchases only

## Context
We need the third contra proof shape: AP clearing requires DR to a credit-normal liability.

## Decision
Add purchases.postPayment service + UI.
Emit purchases.PAYMENT_MADE event with payment method, amount, linkage to bill.

## Consequences
- Enables Accounting consumer (ADR-017) to auto-draft AP clearing JE
- Provides empirical contra case #3 for guard hardening later (v1.4.1)
