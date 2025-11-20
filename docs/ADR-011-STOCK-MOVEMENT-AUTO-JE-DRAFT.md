# ADR-011: Stock Movement Auto-JE Draft

**Status:** Accepted  
**Date:** 2025-11-20  
**Authors:** AI-BOS Team  
**Related:** ADR-005, ADR-008, ADR-009, ADR-010

---

## Context

After establishing cross-module event lanes (ADR-010), we need to prove **real business flow**: Inventory operational events should automatically generate downstream financial artifacts in Accounting.

This is the canonical **Operational→Financial** integration pattern that all future flows (Sales→AR, Purchases→AP, Payroll→GL) will follow.

### Pre-requisites (already complete)
- ✅ Inventory v1.0.1: Stock movement operational slice (ADR-009)
- ✅ Inventory v1.0.2: STOCK_MOVED event emission (ADR-010)
- ✅ Accounting v1.1.0: Normal balance guard on JE capture (ADR-007)
- ✅ Accounting v1.1.1: STOCK_MOVED event consumption wiring (ADR-010)

### Problem
Stock movements have immediate financial impact:
- **OUT (sale/usage)**: Must recognize Cost of Goods Sold (COGS) and reduce Inventory asset
- **IN (purchase/receipt)**: Must increase Inventory asset and record liability (Payables/GRNI)

Manual JE entry for every stock movement is:
- ❌ Error-prone (wrong accounts, unbalanced entries)
- ❌ Slow (operational staff must wait for accounting)
- ❌ Not scalable (high-volume warehouses need real-time GL impact)

---

## Decision

**Implement automatic JE draft generation from Inventory STOCK_MOVED events.**

### Architecture

```
┌─────────────┐                  ┌──────────────┐
│  Inventory  │  STOCK_MOVED     │  Accounting  │
│   Module    ├─────────────────→│    Module    │
└─────────────┘   event lane     └──────────────┘
      ↓                                  ↓
 Stock moved                      Auto-draft JE
 (qty × cost)                    (balanced, guarded)
```

### Changes

#### Inventory v1.0.3: Enrich STOCK_MOVED payload
Add valuation fields to event payload:

```typescript
export type StockMovedPayload = {
  companyId: string;
  itemCode: string;
  qty: number;              // absolute quantity moved
  direction: "IN" | "OUT";  // derived from qtyDelta sign
  unitCost: number;         // mock valuation for now
  warehouseId?: string;
  refDoc?: string;          // e.g. GRN-0001, DO-0002
  postingDate: string;      // YYYY-MM-DD
};
```

**New service:** `getItemValuation(itemCode)` returns mock unitCost from stock master data.  
*Future:* Replace with real costing engine (FIFO/LIFO/weighted avg).

#### Accounting v1.2.0: Auto-draft JE from event
**New listener:** `src/listeners/onStockMoved.ts`

```typescript
export function onStockMoved(payload: StockMovedPayload) {
  const total = payload.qty * payload.unitCost;
  
  const lines = payload.direction === "OUT"
    ? [
        { accountId: "5010", debit: total, credit: 0 },  // COGS
        { accountId: "1200", debit: 0, credit: total }   // Inventory
      ]
    : [
        { accountId: "1200", debit: total, credit: 0 },  // Inventory
        { accountId: "2010", debit: 0, credit: total }   // Payables
      ];
  
  return createJournalEntryService.handler({
    postingDate: payload.postingDate,
    companyId: payload.companyId,
    currency: "MYR",
    lines,
    allowOppositeNormalBalance: false  // Uses ADR-007 guard
  });
}
```

**Wired in:** `registerInventoryEventListeners()` calls `onStockMoved()` when event fires.

---

## Mapping Policy (v1 Mock)

| Movement | Direction | DR Account | CR Account | Notes |
|----------|-----------|------------|------------|-------|
| Sale/Usage | OUT | 5010 COGS | 1200 Inventory | Expense recognition |
| Purchase/Receipt | IN | 1200 Inventory | 2010 Payables | Asset + Liability |
| Adjustment | IN/OUT | *(same as above)* | *(same as above)* | Admin corrections |

**Hardcoded assumptions (v1):**
- All inventory movements use accounts 1200, 5010, 2010
- Currency: MYR
- No multi-warehouse GL segmentation
- No configurable GL mapping

*Future:* Replace with **GL Mapping Engine** using business rules (item category → GL accounts).

---

## Consequences

### ✅ Benefits
1. **Real operational→financial flow proved** — first end-to-end Lego chain working
2. **Zero kernel changes** — pure module evolution via SDK contracts
3. **Automatic financial recording** — no manual JE entry for stock movements
4. **Normal balance safety** — ADR-007 guard prevents invalid drafts
5. **Integration test coverage** — `stockMovedToJeDraft.test.ts` proves 4 assertions:
   - OUT direction → COGS DR, Inventory CR
   - IN direction → Inventory DR, Payables CR
   - Balanced (DR = CR)
   - Normal balance compliant

### ⚠️ Limitations (v1)
1. **Mock valuation only** — `unitCost` from stock master, not real costing
2. **Hardcoded GL mapping** — no configurability, one policy for all items
3. **Draft only** — JE not persisted (no DB layer yet)
4. **No reversal logic** — can't undo auto-drafted JEs
5. **Type duplication** — `StockMovedPayload` copied into Accounting to avoid boundary violations

### 🔄 Future Work
- **Real valuation engine** (FIFO/LIFO/weighted avg) → Inventory v2.x
- **GL Mapping configurator** → Accounting v2.x
- **DB persistence** → Both modules when DB layer added
- **JE reversal/adjustment flow** → Accounting v2.x
- **Shared event types** → Extract to `@aibos/event-contracts` package (ADR-TBD)

---

## Testing

**Integration test:** `tests/kernel/stockMovedToJeDraft.test.ts`

- ✅ OUT movement auto-drafts COGS/Inventory JE (balanced)
- ✅ IN movement auto-drafts Inventory/Payables JE (balanced)
- ✅ Normal balance validation passes
- ✅ Manifest declarations verified (emits/consumes)

**Module tests:**
- Inventory v1.0.3: Existing tests pass (16/16)
- Accounting v1.2.0: Existing tests pass (12/12), listener logic unit-testable

---

## Out of Scope (Explicitly NOT in this slice)

- ❌ Real costing engines (FIFO/LIFO/weighted avg)
- ❌ Multi-currency valuation
- ❌ DB persistence of JE drafts
- ❌ JE approval workflow
- ❌ GL mapping configurability
- ❌ Multi-warehouse GL segmentation
- ❌ Reversing entries
- ❌ Audit trail beyond event logs

---

## Version Tags

- `inventory-v1.0.3-stock-moved-valuation`
- `accounting-v1.2.0-auto-je-draft`
- Optional combined: `flow-v1-stock-to-gl-draft`

---

## Lessons for Next Flows

This pattern establishes the template for **all future operational→financial integrations**:

1. **Operational module enriches event payload** with valuation/amounts
2. **Financial module consumes event** and generates artifact (JE/Invoice/Receipt)
3. **Integration test proves end-to-end** delivery + validation
4. **ADR documents mapping policy** and limitations
5. **Zero kernel drift** — modules own their domain, communicate via events

**Next applications:**
- Sales Invoice → AR JE + Revenue Recognition
- Purchase Invoice → AP JE + Expense Recognition
- Payroll Run → GL posting (Salary Expense + Withholdings)
- Cash Receipt → AR clearing + Bank reconciliation

All follow this proven playbook.
