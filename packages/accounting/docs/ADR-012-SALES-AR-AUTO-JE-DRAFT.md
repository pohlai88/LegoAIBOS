# ADR-012: Sales Invoice → AR Auto-JE Draft

**Status:** Accepted  
**Date:** 2025-11-20  
**Authors:** AI-BOS Team  
**Related:** ADR-005, ADR-010, ADR-011

---

## Context

After proving Inventory→Accounting event flow (ADR-011), we need to establish a **second operational→financial pipeline** to validate the Lego architecture pattern is repeatable and generalizable.

Sales Invoices are a canonical revenue transaction:
- Create **Accounts Receivable** (customer owes money)
- Recognize **Revenue** (goods/services delivered)
- Record **Output Tax Liability** (SST/GST collected from customer)

This is the standard accrual accounting entry for revenue recognition at point of sale.

### Pre-requisites (already complete)
- ✅ Kernel event bus with tenant scoping
- ✅ Accounting v1.2.0: Normal balance validation + contra entry support
- ✅ ADR-011 pattern: Operational event → Financial artifact
- ✅ Integration test infrastructure

### Problem
Every sales invoice requires a corresponding AR journal entry:
- **Manual entry is error-prone** (wrong accounts, calculation mistakes, unbalanced entries)
- **Creates operational bottleneck** (sales staff wait for accounting to post)
- **Not scalable** (high-volume e-commerce/retail needs real-time GL impact)

Manual intervention breaks the operational→financial flow and creates reconciliation gaps.

---

## Decision

**Implement automatic AR JE draft generation from Sales INVOICE_POSTED events.**

### Architecture

```
┌─────────────┐                  ┌──────────────┐
│    Sales    │  INVOICE_POSTED  │  Accounting  │
│   Module    ├─────────────────→│    Module    │
└─────────────┘   event lane     └──────────────┘
      ↓                                  ↓
 Invoice posted                    Auto-draft JE
 (subtotal+tax)                  (AR + Revenue + Tax)
```

### Changes

#### Sales v1.0.0: New module with INVOICE_POSTED emission

**New module:** `packages/sales`

**Service:** `postSalesInvoice`
```typescript
export const postSalesInvoiceService = {
  key: "sales.postSalesInvoice",
  inputSchema: PostSalesInvoiceInputSchema,  // validates line totals
  outputSchema: PostSalesInvoiceOutputSchema,
  
  handler: (input) => {
    const subtotal = input.lines.reduce((s, l) => s + l.lineTotal, 0);
    const tax = +(subtotal * (input.taxRate ?? 0)).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    
    return { invoiceId, subtotal, tax, total };
  }
};
```

**Event payload:**
```typescript
export type SalesInvoicePostedPayload = {
  invoiceId: string;
  postingDate: string;
  companyId: string;
  customerId: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  lines: SalesInvoiceLine[];
};
```

**UI:** `SalesInvoicePage` with multi-line entry, auto-computed tax/totals

#### Accounting v1.3.0: Consume INVOICE_POSTED → Auto-draft AR JE

**New listener:** `src/listeners/onSalesInvoicePosted.ts`

```typescript
export function onSalesInvoicePosted(p: SalesInvoicePostedPayload) {
  const lines = [
    { accountId: "1310", debit: p.total, credit: 0 },  // AR (asset)
    { accountId: "4010", debit: 0, credit: p.subtotal }  // Revenue
  ];
  
  if (p.tax > 0) {
    lines.push({ accountId: "2160", debit: 0, credit: p.tax });  // Output Tax
  }
  
  return createJournalEntryService.handler({
    postingDate: p.postingDate,
    companyId: p.companyId,
    currency: p.currency,
    lines,
    allowOppositeNormalBalance: false  // No contra entries needed
  });
}
```

**Wired in:** `registerSalesEventListeners()` calls `onSalesInvoicePosted()` when event fires.

**New COA account:** Added `2160 - Output Tax Payable (SST/GST)` to mock COA.

---

## Mapping Policy (v1.0)

| Transaction | DR Account | CR Account | Notes |
|-------------|------------|------------|-------|
| Sales Invoice (no tax) | 1310 AR | 4010 Revenue | Customer owes, revenue recognized |
| Sales Invoice (with tax) | 1310 AR | 4010 Revenue<br/>2160 Output Tax | Tax collected from customer |

**Hardcoded assumptions (v1.0):**
- All sales use accounts 1310, 4010, 2160
- Single tax rate per invoice
- Currency: MYR (no FX handling)
- No revenue recognition deferral (point-in-time only)

*Future:* Replace with **Revenue Recognition Engine** for:
- Performance obligations over time (contracts)
- Multi-deliverable arrangements
- Contract assets/liabilities

---

## Consequences

### ✅ Benefits
1. **Second operational→financial flow proved** — pattern is repeatable
2. **No contra entries needed** — all entries follow normal balance (AR/DR, Revenue/CR, Tax/CR)
3. **Normal balance guard validates cleanly** — no exception flag required
4. **Real-time GL impact** — AR recognized immediately when invoice posts
5. **Integration test coverage** — `salesToJeDraft.test.ts` proves:
   - Balanced JE without tax
   - Balanced JE with tax
   - Normal balance compliance

### ⚠️ Limitations (v1.0)
1. **Point-in-time revenue only** — no deferral, no contract accounting (IFRS 15)
2. **Single tax rate** — can't handle mixed tax rates or exempt items
3. **Hardcoded GL mapping** — no configurability for different product categories
4. **Draft only** — JE not persisted (no DB layer yet)
5. **No reversal logic** — can't undo or adjust posted invoices
6. **No AR aging** — customer balance tracking deferred to v2.x

### 🔄 Future Work
- **Revenue recognition engine** (performance obligations, contract assets) → v2.x
- **Multi-tax support** (line-level tax codes, exemptions) → v1.1.x
- **GL mapping configurator** (product category → revenue account) → v2.x
- **DB persistence** → Both modules when DB layer added
- **AR subledger** (customer balances, aging, payment matching) → v2.x
- **Credit notes + reversals** → v1.2.x

---

## Testing

**Integration test:** `tests/kernel/salesToJeDraft.test.ts`

- ✅ Invoice without tax → balanced AR/Revenue JE (100 DR = 100 CR)
- ✅ Invoice with tax → balanced AR/Revenue/Tax JE (106 DR = 100+6 CR)
- ✅ Normal balance validation passes (no exceptions needed)

**Module tests:**
- Sales v1.0.0: 2/2 tests passing (adapter + service)
- Accounting v1.3.0: 12/12 tests passing

---

## Out of Scope (Explicitly NOT in this slice)

- ❌ Revenue recognition over time (IFRS 15 / ASC 606)
- ❌ Contract assets / deferred revenue
- ❌ Multi-currency FX revaluation
- ❌ DB persistence of invoices or JEs
- ❌ AR subledger / customer aging
- ❌ Credit notes / reversing entries
- ❌ Payment matching / cash application
- ❌ Tax engine (configurable rates, exemptions)
- ❌ Multi-deliverable arrangements
- ❌ Audit trail beyond event logs

---

## Version Tags

- `sales-v1.0.0-invoice-posted`
- `accounting-v1.3.0-consume-sales-invoice`

---

## Pattern Validation

This ADR proves the **second instance** of the operational→financial integration pattern established in ADR-011:

### Repeatable Pattern (Validated 2x)
1. **Operational module enriches event payload** with amounts/valuation
2. **Financial module consumes event** and generates artifact (JE/Invoice/Receipt)
3. **Integration test proves end-to-end** delivery + validation
4. **ADR documents mapping policy** and limitations
5. **Zero kernel drift** — modules own their domain, communicate via events

### Evidence of Generalizability
- **Inventory (ADR-011):** Required contra entries (allowOppositeNormalBalance=true)
- **Sales (ADR-012):** Clean normal balance entries (allowOppositeNormalBalance=false)
- **Pattern holds** for both simple and complex accounting scenarios

**Next applications:**
- Purchases → AP JE + Inventory clearing
- Cash Receipt → AR clearing + Bank
- Payroll → GL posting (Salary + Withholdings + Statutory)
- Expense Claim → AP + Expense recognition

All follow this proven playbook.

---

## Related Standards (Reference)

- **MFRS 15 / IFRS 15 / ASC 606:** Revenue from Contracts with Customers
  - Point-in-time vs. over-time recognition
  - Performance obligations
  - Contract assets/liabilities

- **SST (Malaysia):** Sales & Service Tax
  - Standard-rated (6%), Zero-rated, Exempt
  - Output tax accounting

*v1.0 implements simplified accrual accounting. Full IFRS/MFRS compliance deferred to v2.x.*
