# ADR-013: Cash Receipt → AR Clearing Auto-JE (Sales→Accounting)

**Status:** Accepted  
**Date:** 2025-11-21  
**Authors:** AI-BOS Team  
**Related:** ADR-010, ADR-012

---

## Context

After proving Sales Invoice → AR JE (ADR-012), we need the **collection leg** to complete the revenue cycle.

When customers pay invoices:
- **Cash/Bank balance increases** (asset)
- **Trade Receivables decrease** (asset contra)

Junior accounting staff need automatic JE generation to:
- Prevent AR clearing errors (wrong account, wrong amount)
- Eliminate reconciliation delays (payment posted but AR not cleared)
- Support real-time cash flow visibility

This is the third operational→financial integration pattern, proving the architecture scales across the full revenue cycle: Invoice → Receivable → Collection.

---

## Decision

**Implement automatic AR clearing JE draft generation from Sales CASH_RECEIPT_POSTED events.**

### Architecture

```
┌─────────────┐  CASH_RECEIPT_POSTED  ┌──────────────┐
│    Sales    ├──────────────────────→│  Accounting  │
│   Module    │      event lane       │    Module    │
└─────────────┘                       └──────────────┘
      ↓                                       ↓
 Cash collected                    Auto-draft clearing JE
 (bank/cash method)              (DR Bank/Cash, CR AR)
```

### Changes

#### Sales v1.0.1: Add CASH_RECEIPT_POSTED emission

**New service:** `postCashReceipt`
```typescript
export const postCashReceiptService = {
  key: "sales.postCashReceipt",
  inputSchema: PostCashReceiptInputSchema,
  outputSchema: PostCashReceiptOutputSchema,
  
  handler: (input) => {
    return {
      ok: true,
      payload: {
        receiptId: input.receiptId,
        postingDate: input.postingDate,
        companyId: input.companyId,
        customerId: input.customerId,
        currency: input.currency,
        amount: input.amount,
        method: input.method,  // "bank" | "cash"
        bankAccountId: input.method === "bank" ? (input.bankAccountId || "1020") : undefined,
        invoiceId: input.invoiceId,
        refDoc: input.refDoc,
      }
    };
  }
};
```

**Event payload:**
```typescript
export type CashReceiptPostedPayload = {
  receiptId: string;
  postingDate: string;
  companyId: string;
  customerId: string;
  currency: string;
  amount: number;
  method: "bank" | "cash";
  bankAccountId?: string;  // defaults to 1020 for bank
  invoiceId?: string;      // optional AR allocation reference
  refDoc?: string;
};
```

**UI:** `CashReceiptPage` with bank/cash toggle, amount entry, optional invoice reference

#### Accounting v1.4.0: Consume CASH_RECEIPT_POSTED → Auto-draft AR clearing JE

**New listener:** `src/listeners/onCashReceiptPosted.ts`

```typescript
export function onCashReceiptPosted(payload: CashReceiptPostedPayload) {
  const bankOrCashAcc =
    payload.method === "cash" ? "1010" : (payload.bankAccountId || "1020");

  const lines = [
    { accountId: bankOrCashAcc, debit: payload.amount, credit: 0, memo: "Cash receipt" },
    { accountId: "1310", debit: 0, credit: payload.amount, memo: "Clear trade receivables" }
  ];
  
  return createJournalEntryService.handler({
    postingDate: payload.postingDate,
    companyId: payload.companyId,
    currency: payload.currency,
    refDoc: payload.receiptId,
    lines,
    allowOppositeNormalBalance: false  // No contra entries needed
  });
}
```

**Wired in:** `registerSalesEventListeners()` added CASH_RECEIPT_POSTED handler

**COA accounts used:**
- `1010` - Petty Cash (asset, debit normal)
- `1020` - Bank - Current Account (asset, debit normal)
- `1310` - Trade Receivables (asset, debit normal)

---

## Mapping Policy (v1.0)

| Transaction | DR Account | CR Account | Notes |
|-------------|------------|------------|-------|
| Bank receipt | 1020 Bank | 1310 AR | Cash collected via bank transfer |
| Cash receipt | 1010 Petty Cash | 1310 AR | Cash collected physically |

**Hardcoded assumptions (v1.0):**
- All receipts clear AR (1310)
- Bank defaults to 1020 if not specified
- Cash always uses 1010
- Single currency (MYR)
- No partial payment allocation (full AR clearing only)

*Future:* Replace with **Payment Allocation Engine** for:
- Multi-invoice allocation (apply one payment across multiple invoices)
- Over/under-payments (credit notes, write-offs)
- Payment discounts (early payment terms)
- Bank reconciliation matching

---

## Consequences

### ✅ Benefits
1. **Third operational→financial flow proved** — pattern scales to full revenue cycle
2. **No contra entries needed** — DR Bank (normal debit asset), CR AR (reduces debit asset)
3. **Normal balance guard validates cleanly** — no exception flag required
4. **Real-time cash flow visibility** — bank/cash balance updated immediately
5. **AR reconciliation simplified** — payment and clearing happen atomically
6. **Integration test coverage** — `cashReceiptToJeDraft.test.ts` proves:
   - Bank receipt balanced JE (DR 1020, CR 1310)
   - Cash receipt balanced JE (DR 1010, CR 1310)
   - Both methods clear AR correctly

### ⚠️ Limitations (v1.0)
1. **Full payment only** — can't allocate partial amounts across multiple invoices
2. **No bank reconciliation** — imported bank statements not matched to receipts
3. **No payment discounts** — early payment terms not supported
4. **Hardcoded GL mapping** — no configurability for different payment methods
5. **Draft only** — JE not persisted (no DB layer yet)
6. **No reversal logic** — can't undo or adjust posted receipts
7. **Single currency** — no FX handling for foreign payments

### 🔄 Future Work
- **Payment allocation engine** (multi-invoice, over/under, discounts) → v2.x
- **Bank reconciliation** (import statements, auto-match) → v2.x
- **Payment methods** (credit card, check, wire transfer) → v1.2.x
- **DB persistence** → Both modules when DB layer added
- **Receipt reversals** (void/cancel) → v1.2.x
- **Multi-currency** (FX rates, revaluation) → v2.x

---

## Testing

**Integration test:** `tests/kernel/cashReceiptToJeDraft.test.ts`

- ✅ Bank receipt → balanced JE (120 DR Bank = 120 CR AR)
- ✅ Cash receipt → balanced JE (50 DR Petty Cash = 50 CR AR)
- ✅ Manifest lanes declared correctly (Sales emits, Accounting consumes)

**Module tests:**
- Sales v1.0.1: 8/8 tests passing (adapter + invoice + cash receipt)
- Accounting v1.4.0: 12/12 tests passing

---

## Out of Scope (Explicitly NOT in this slice)

- ❌ Multi-invoice payment allocation
- ❌ Bank reconciliation / statement import
- ❌ Payment discounts / early payment terms
- ❌ Over/under-payment handling
- ❌ DB persistence of receipts or JEs
- ❌ Receipt reversals / void transactions
- ❌ Multi-currency FX handling
- ❌ Payment methods beyond bank/cash
- ❌ Check printing / wire transfer generation
- ❌ Credit card integration / merchant fees

---

## Version Tags

- `sales-v1.0.1-cash-receipt-posted`
- `accounting-v1.4.0-consume-cash-receipt`

---

## Pattern Validation

This ADR proves the **third instance** of the operational→financial integration pattern:

### Proven Pattern Sequence
1. **ADR-011 (Stock Movement)**: Inventory OUT/IN → COGS/Inventory JE (required contra entries)
2. **ADR-012 (Sales Invoice)**: Invoice posted → AR/Revenue/Tax JE (normal balance compliant)
3. **ADR-013 (Cash Receipt)**: Payment collected → Bank/AR clearing JE (normal balance compliant)

### Evidence of Generalizability
All three flows follow identical structure:
- Operational module enriches event payload
- Financial module consumes event and generates artifact
- Integration test proves end-to-end delivery
- ADR documents mapping policy and limitations
- Zero kernel drift

**Pattern now proven for:**
- ✅ Cost accounting (inventory valuation)
- ✅ Revenue recognition (AR + sales)
- ✅ Cash collection (AR clearing)

**Next applications:**
- Purchases → AP JE + Inventory receipt
- Cash Payment → AP clearing
- Payroll → GL posting (Salary + Withholdings)
- Expense Claim → AP + Expense recognition

All follow this established playbook.

---

## Revenue Cycle Coverage (v1.0)

**Complete flow now automated:**

```
1. Sales Invoice Posted (ADR-012)
   ├─→ DR Trade Receivables (1310)
   ├─→ CR Sales Revenue (4010)
   └─→ CR Output Tax (2160)

2. Cash Receipt Posted (ADR-013)
   ├─→ DR Bank/Cash (1020/1010)
   └─→ CR Trade Receivables (1310)
```

**AR lifecycle:** Create → Clear → Zero balance

**Junior staff benefit:** Post invoice + record payment, accounting happens automatically.

---

## Related Standards (Reference)

- **MFRS 118 / IAS 18 / IFRS 15:** Revenue recognition
- **MFRS 107 / IAS 7:** Cash flow statement classification
- **Payment allocation:** FIFO, LIFO, specific identification methods

*v1.0 implements simplified cash accounting. Full accrual + allocation deferred to v2.x.*
