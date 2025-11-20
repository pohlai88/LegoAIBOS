# ADR-015: Accounting v1.5.0 — Auto-draft AP JE from Purchases Bills

**Status:** Accepted  
**Date:** 2025-11-21  
**Authors:** AI-BOS Team  
**Related:** ADR-014, ADR-012, ADR-013

---

## Context

Purchases v1.0.0 posts supplier bills and emits `purchases.BILL_POSTED`. Accounting must recognize:
- **Trade Payables (AP)** — liability to supplier
- **Expenses** — cost recognition
- **Input Tax** — recoverable tax on purchases

This follows the proven event-lane-only coupling pattern established in ADR-010, ADR-012, and ADR-013.

---

## Decision

**Consume purchases.BILL_POSTED and auto-draft AP/Expense JE.**

### Architecture

```
┌──────────────┐  BILL_POSTED   ┌──────────────┐
│  Purchases   ├────────────────→│  Accounting  │
│   Module     │   event lane    │    Module    │
└──────────────┘                 └──────────────┘
      ↓                                  ↓
 Bill entered                     Auto-draft JE
 (expense+tax)                 (DR Expense/Tax, CR AP)
```

### Changes

#### Accounting v1.5.0: Consume BILL_POSTED → Auto-draft AP JE

**New listener:** `src/listeners/onBillPosted.ts`

```typescript
export function onBillPosted(payload: PurchaseBillPostedPayload) {
  const lines = [
    // DR each expense/asset line
    ...payload.lines.map(l => ({
      accountId: l.accountId,
      debit: l.amount,
      credit: 0
    })),
    
    // DR input tax if applicable
    ...(payload.taxAmount > 0
      ? [{ accountId: "1170", debit: payload.taxAmount, credit: 0 }]
      : []),
    
    // CR AP for total
    { accountId: "2010", debit: 0, credit: payload.total }
  ];
  
  return createJournalEntryService.handler({ postingDate, companyId, currency, referenceNo, lines });
}
```

**Wired in:** `registerPurchasesEventListeners()` calls `onBillPosted()` when event fires

**New COA account:** Added `1170 - Input Tax Receivable` to mock COA

---

## Mapping Policy (v1.5)

| Transaction | DR Account | CR Account | Notes |
|-------------|------------|------------|-------|
| Purchase bill (no tax) | Expense (line.accountId) | AP 2010 | Expense recognition + liability |
| Purchase bill (with tax) | Expense (line.accountId)<br/>Input Tax 1170 | AP 2010 | Tax recoverable + liability |

**Hardcoded assumptions (v1.5):**
- All bill lines map to expense accounts (5xxx range)
- Single tax rate per bill
- Input tax fully recoverable (no partial claims)
- AP always account 2010
- Currency: MYR (no FX handling)

*Future:* Replace with **GL Mapping Engine** for:
- Asset vs expense classification (inventory purchases)
- Department/project allocations
- Tax codes (standard-rated, zero-rated, exempt, blocked)

---

## Consequences

### ✅ Benefits
1. **Fourth operational→financial flow proved** — Purchases→AP symmetric with Sales→AR
2. **No contra entries needed** — all entries follow normal balance (DR expense, DR asset, CR liability)
3. **Normal balance guard validates cleanly** — no exception flag required
4. **Input tax tracked separately** — enables tax reporting and claims
5. **Integration test coverage** — `billPostedToJeDraft.test.ts` proves:
   - Balanced JE without tax
   - Balanced JE with tax
   - Correct accounts mapped (expense, input tax, AP)

### ⚠️ Limitations (v1.5)
1. **Hardcoded GL mapping** — all lines assumed expense accounts
2. **Single tax rate** — can't handle mixed tax treatments per line
3. **No asset classification** — inventory purchases not differentiated
4. **Draft only** — JE not persisted (no DB layer yet)
5. **No reversal logic** — can't undo or adjust posted bills
6. **No department/project allocation** — single expense line per item

### 🔄 Future Work
- **GL mapping engine** (expense vs asset, department allocation) → v2.x
- **Multi-tax support** (line-level tax codes) → v1.6.x
- **DB persistence** → Both modules when DB layer added
- **Bill reversals** (credit notes, returns) → v1.6.x
- **Three-way matching** (PO → GRN → Bill reconciliation) → v2.x

---

## Testing

**Integration test:** `tests/kernel/billPostedToJeDraft.test.ts`

- ✅ Bill without tax → balanced JE (100 DR Expense = 100 CR AP)
- ✅ Bill with tax → balanced JE (110 DR Expense+Tax = 110 CR AP)
- ✅ Manifest lanes declared correctly (Purchases emits, Accounting consumes)

**Module tests:**
- Purchases v1.0.0: 5/5 tests passing (adapter + service)
- Accounting v1.5.0: 12/12 tests passing

---

## Out of Scope (Explicitly NOT in this slice)

- ❌ Inventory asset classification (all lines treated as expense)
- ❌ Department/project cost allocation
- ❌ Multi-currency FX handling
- ❌ DB persistence of bills or JEs
- ❌ Bill approval workflows
- ❌ Three-way matching (PO → GRN → Bill)
- ❌ Tax codes beyond single rate
- ❌ Partial tax recovery (blocked input tax)
- ❌ Supplier aging / payment due tracking

---

## Version Tags

- `purchases-v1.0.0-bill-posted`
- `accounting-v1.5.0-consume-purchases-bill`

---

## Pattern Validation

This ADR proves the **fourth instance** of the operational→financial integration pattern:

### Proven Pattern Sequence
1. **ADR-011 (Stock Movement)**: Inventory OUT/IN → COGS/Inventory JE (required contra entries)
2. **ADR-012 (Sales Invoice)**: Invoice posted → AR/Revenue/Tax JE (normal balance compliant)
3. **ADR-013 (Cash Receipt)**: Payment collected → Bank/AR clearing JE (contra for AR reduction)
4. **ADR-015 (Purchase Bill)**: Bill posted → Expense/AP JE (normal balance compliant)

**Next: AP clearing will require contra** (DR liability, contra to credit-normal balance)

### AR/AP Symmetry Proven
```
SALES CYCLE (ADR-012 + ADR-013):
Invoice → DR AR, CR Revenue, CR Output Tax
Receipt → DR Bank, CR AR (contra)

PURCHASES CYCLE (ADR-015 + next):
Bill → DR Expense, DR Input Tax, CR AP
Payment → DR AP (contra), CR Bank
```

---

## Related Standards (Reference)

- **MFRS 102 / IAS 2:** Inventory cost recognition
- **MFRS 112 / IAS 12:** Input tax (recoverable VAT/GST/SST)
- **Matching principle:** Expense recognized when incurred, not when paid

*v1.5 implements simplified expense recognition. Full cost allocation + asset classification deferred to v2.x.*
