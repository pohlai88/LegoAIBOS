# ADR-014: Purchases v1.0.0 — Bill Posted MVP

**Status:** Accepted  
**Date:** 2025-11-21  
**Authors:** AI-BOS Team  
**Related:** ADR-010, ADR-012, ADR-013

---

## Context

We need the Purchases operational domain to:
1. Prove the Lego pattern scales beyond Accounting/Inventory/Sales
2. Establish the AP (Accounts Payable) cycle symmetry with AR (Accounts Receivable)
3. Enable the third contra proof via payment clearing (v1.0.1)

Supplier bills are the starting point of the AP cycle:
- Record expenses or inventory purchases
- Recognize liability to supplier
- Track input tax (recoverable tax on purchases)

---

## Decision

**Create Purchases v1.0.0 thin slice with Bill Posted MVP.**

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

#### Purchases v1.0.0: New module with BILL_POSTED emission

**Service:** `postBill`
```typescript
export const postBillService = {
  key: "purchases.postBill",
  inputSchema: PostBillInputSchema,
  outputSchema: PostBillOutputSchema,
  
  handler: (input) => {
    // Normalize lines (qty*unitCost OR amount)
    const normalizedLines = input.lines.map(l => ({
      accountId: l.accountId,
      amount: l.amount ?? (l.qty! * l.unitCost!),
      memo: l.memo
    }));
    
    const subtotal = sum(normalizedLines.map(l => l.amount));
    const taxAmount = subtotal * (input.taxRate ?? 0) / 100;
    const total = subtotal + taxAmount;
    
    return { id, billNo, subtotal, taxAmount, total, lines: normalizedLines };
  }
};
```

**Event payload:**
```typescript
export type PurchaseBillPostedPayload = {
  id: string;
  billNo: string;
  postingDate: string;
  companyId: string;
  supplierId?: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  lines: Array<{
    accountId: string;  // expense or asset
    amount: number;
    memo?: string;
  }>;
};
```

**UI:** `PurchaseBillPage` with multi-line entry, qty×unitCost or direct amount, tax toggle

---

## Scope (v1.0.0)

**In scope:**
- ✅ Multi-line bill entry UI
- ✅ Flexible line input (qty×unitCost OR direct amount)
- ✅ Tax calculation (single rate per bill)
- ✅ Emit `purchases.BILL_POSTED` event
- ✅ Local stub (no DB persistence)

**Out of scope (v1.0+):**
- ❌ DB persistence
- ❌ Supplier master data
- ❌ Multi-tax rates (line-level tax codes)
- ❌ Bill approval workflows
- ❌ Payment terms (net 30, net 60)
- ❌ Purchase orders / GRN matching
- ❌ Three-way matching (PO → GRN → Bill)

---

## Consequences

### ✅ Benefits
1. **Fourth operational module proved** — pattern scales beyond Sales/Inventory
2. **Zero kernel changes** — pure module addition via adapter
3. **AR/AP symmetry established** — same event-driven integration pattern
4. **Prepares for third contra proof** — Payment Made will clear AP (v1.0.1)
5. **ESLint boundary enforcement** — types duplicated at Accounting consumer

### ⚠️ Limitations (v1.0)
1. **No persistence** — bill data lost on refresh (demo only)
2. **Single tax rate** — can't handle mixed tax treatments
3. **Hardcoded expense mapping** — all lines assumed expense accounts
4. **No supplier validation** — free-text supplier ID
5. **No payment terms** — due date not tracked

### 🔄 Future Work
- **DB persistence** → v2.x when DB layer added
- **Supplier master** → v1.1.x
- **Multi-tax support** → v1.1.x
- **Approval workflows** → v2.x
- **Three-way matching** → v2.x (PO → GRN → Bill)

---

## Testing

**Module tests:**
- `postBill.test.ts`: Totals without tax, totals with tax, rejects empty lines
- `adapter.test.ts`: Manifest validation, BILL_POSTED emission

**Integration test:**
- `tests/kernel/billPostedToJeDraft.test.ts`: Proves Accounting consumes event and drafts balanced JE

---

## Version Tags

- `purchases-v1.0.0-bill-posted`

---

## Related Standards (Reference)

- **MFRS 102 / IAS 2:** Inventory cost recognition
- **MFRS 112 / IAS 12:** Input tax (recoverable VAT/GST/SST)
- **Three-way matching:** PO quantity vs GRN quantity vs Bill quantity

*v1.0 implements simplified expense recognition. Full procurement cycle deferred to v2.x.*
