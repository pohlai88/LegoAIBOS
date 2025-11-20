# ADR-018: Accounting v1.6.1 — Journal Entry Guard Hardening via sourceEvent Allowlist

- Date: 2025-11-21
- Status: Accepted
- Scope: `packages/accounting`

## Context
Three empirical contra patterns are now proven:
1. Credit to debit-normal asset (Inventory OUT)
2. Credit to debit-normal asset (AR clearing cash receipt)
3. Debit to credit-normal liability (AP clearing payment)

Prior guard relied on `allowOppositeNormalBalance=true` flag sprinkled across automation listeners. This created:
- Repetition & noise in auto-drafted entries
- Risk of accidental omission in future automated flows
- No structured provenance linking a contra to the originating event lane

## Decision
Introduce optional `sourceEvent?: string` on journal entry input schema plus a trusted allowlist:
```
TRUSTED_SOURCE_EVENTS = [
  "inventory.STOCK_MOVED",
  "sales.CASH_RECEIPT_POSTED",
  "purchases.PAYMENT_MADE"
]
```
Validation semantics:
- If any line performs a normal balance *contra*, it is permitted when either:
  - `allowOppositeNormalBalance === true` (explicit manual override / legacy path)
  - `sourceEvent` is present AND in allowlist (trusted automation)
- Otherwise validation fails with normal balance mismatch error.

Automation listeners updated:
- `onStockMoved` → sets `sourceEvent: "inventory.STOCK_MOVED"`
- `onCashReceiptPosted` → sets `sourceEvent: "sales.CASH_RECEIPT_POSTED"`
- `onPaymentMade` → sets `sourceEvent: "purchases.PAYMENT_MADE"`
- Removed prior `allowOppositeNormalBalance: true` from these listeners.

Manual UI flow remains unchanged: operators must still set `allowOppositeNormalBalance=true` for legitimate manual contra entries (e.g., adjustment, reclassification) until richer approval workflow lands in v2.x.

## Consequences
- Cleaner automation code — no per-listener boolean flags.
- Auditable provenance of every trusted contra via `sourceEvent`.
- Backward compatibility preserved (legacy flag still works).
- Basis established for future policy escalation (e.g., role-based allowance, multi-step approvals) without further schema churn.

## Alternatives Considered
| Option | Summary | Rejected Because |
|--------|---------|------------------|
| Keep only flag | Simplicity | No provenance; hard to audit source of contra |
| Always allow contra in auto flows (implicit) | Remove checks | Silent widening of guard; loses explicit list and future extensibility |
| Per-line tagging | Granular but verbose | Overkill for current scope |

## Future Work
- v1.7.x: Extend allowlist dynamically via kernel config (tenant-level).
- v2.0: Introduce approval workflow for manual contras (flag replaced by structured adjustment request).
- Observability: Emit audit event when a contra is accepted via allowlist vs manual override.

## Migration Notes
Existing automation listeners migrated in-place; no consumer impact.
Manual processes unaffected; existing UIs can continue setting `allowOppositeNormalBalance=true`.

## Status Check
- Implementation merged (service + listeners + tests).
- New tests: `guardSourceEvent.test.ts` covering rejection, explicit flag acceptance, trusted source acceptance.
- Tag: `accounting-v1.6.1-guard-sourceevent-allowlist`.
