# ADR-006: COA Read-Only Service (v1.0.1)

**Date:** 2025-01-31  
**Status:** ✅ Accepted  
**Context:** Accounting v1.0.0 (ADR-005)  
**Decision:** Add Chart of Accounts (COA) read-only service for junior-usable account picker in Journal Entry UI

---

## Problem
v1.0.0 JE page required manual accountId text input (e.g., `"cash.petty"`), which:
- Requires user to memorize account codes
- Error-prone (typos, invalid codes)
- Not usable by junior accountants without COA reference sheet
- No validation that account exists or is active

## Decision
Add thin COA read-only slice in v1.0.1:

**Service** (`getCOAList.ts`):
- Input: `{ companyId, type?, isActive? }`
- Output: `{ accounts: ChartOfAccount[] }`
- Mock MFRS5-inspired data (9 accounts: Petty Cash, Bank, Trade Receivables, Trade Payables, Share Capital, Sales Revenue, COGS, Office Supplies, Salaries)
- Filter logic for type (asset/liability/equity/revenue/expense) and active status

**UI Update** (`JournalEntryPage.tsx`):
- Replace `<input placeholder="accountId">` with `<select>` dropdown
- Load COA via `useEffect` on mount (local stub handler)
- Display format: `"1010 - Petty Cash"`
- SSOT comment: "v1.0.1 design — no kernel service yet"

**Tests**:
- `getCOAList.test.ts`: Filter tests (all accounts, type=asset, isActive=true), input schema validation
- `adapter.test.ts`: Check getCOAList service registered in manifest

## Rationale
- **User Story**: As a junior accountant, I can select accounts from dropdown instead of memorizing codes
- **SSOT Compliance**: No kernel changes, no cross-module imports, local stub handler (v1.0.0 SDK pattern)
- **Incremental**: Thin slice adds picker without COA CRUD complexity
- **Extensible**: Future v1.1 can wire to kernel COA service without UI changes

## Consequences
✅ **Positive**:
- JE UI now junior-friendly (no code memorization)
- Validates selected account exists in COA
- Dropdown shows human-readable names
- SSOT maintained (no manifest schema drift)

⚠️ **Constraints**:
- Mock data only (9 accounts hardcoded)
- No COA CRUD (admin must edit code to add accounts)
- Filter logic basic (no search/fuzzy match)

📋 **Follow-up (v1.1+)**:
- COA CRUD endpoints (create/update/deactivate accounts)
- Kernel COA service lane (shared across modules)
- Advanced picker (search, hierarchy, balance indicator)
- Account validation in JE balancing rules

## Related
- **Builds on**: ADR-005 (Accounting MVP JE Capture)
- **Enables**: JE UI becomes production-ready for junior users
- **Prepares**: v1.1 COA CRUD slice (when kernel service lanes exist)
