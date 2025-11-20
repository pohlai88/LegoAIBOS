# ADR-007: Accounting v1.1.0 — JE COA Normal Balance Validation

**Date:** 2025-11-21  
**Status:** ✅ Accepted  
**Context:** ADR-005 (JE Capture), ADR-006 (COA Picker)  
**Decision:** Add COA-aware validation to prevent wrong-side postings in Journal Entry capture

---

## Problem

JE capture (v1.0.0) + COA picker (v1.0.1) are usable by juniors, but validation only checks:
- Balance (debit = credit)
- Both sides > 0

**Missing**: Account-side validation. Examples of nonsense postings currently allowed:
- Petty Cash (debit-normal) posted as credit-only → destroys account balance integrity
- Sales Revenue (credit-normal) posted as debit-only → breaks P&L structure
- Trade Payables (credit-normal) with debit-only → liability side wrong

These errors break audit clarity and require manual correction, defeating "usable by juniors" goal.

## Decision

Add **COA-aware normal balance validation** to `createJournalEntryService` (v1.1.0):

### Implementation

**1. Shared COA Mock Source** (`src/data/coaMock.ts`):
- Extract MFRS5 mock data into single source of truth
- Export helper `getAccountNormalBalance(accountId)` for validation
- Used by both `getCOAList` service and JE validation

**2. Enhanced Input Schema**:
- Add optional field: `allowOppositeNormalBalance: boolean`
- Default `false` → strict validation
- Set `true` → allow adjustments/corrections

**3. Validation Rule** (new `.refine()` after balance check):
- For each line, lookup account's `normalBalance` from COA
- Reject if unknown account (safety check)
- If `allowOppositeNormalBalance=false`:
  - Reject credit-only on debit-normal accounts (Asset/Expense)
  - Reject debit-only on credit-normal accounts (Liability/Equity/Revenue)
- If `allowOppositeNormalBalance=true`:
  - Allow all combinations (for adjustments)

**4. Error Message**:
```
Line normal balance mismatch. Use correct Dr/Cr per account or set allowOppositeNormalBalance=true for adjustments.
```

### Tests Added
- ✅ Reject credit-only to Petty Cash (1010, debit-normal)
- ✅ Reject debit-only to Sales Revenue (4010, credit-normal)
- ✅ Accept same posting when override flag is true
- ✅ Existing balanced test updated to use real COA account IDs

## Rationale

**Why MINOR bump (1.0.1 → 1.1.0)?**
- Introduces **breaking validation rule** (previously valid payloads now rejected)
- Adds new field to input schema (non-breaking but semantically significant)

**Why not MAJOR?**
- Existing valid use cases (correct Dr/Cr) still work
- Override flag provides escape hatch
- No API signature changes

**Why local validation (not kernel)?**
- COA is still mock data (no real DB yet)
- Rule is accounting-domain specific, not cross-cutting
- Keeps kernel change-free until v1.1+ service lanes land

**Why configurable override?**
- Real-world needs adjustments (e.g., correcting prior errors, contra accounts)
- Explicit flag documents intentional deviation
- Prevents accidental mispostings while allowing deliberate ones

## Consequences

✅ **Positive**:
- JE becomes "guarded entry" (prevents obvious errors)
- Junior users protected from common mistakes
- Audit trail cleaner (errors caught at input, not post-facto)
- Still flexible for corrections via explicit override
- No kernel changes (SSOT boundary maintained)

⚠️ **Constraints**:
- Validation depends on COA mock data (no real DB yet)
- Rule is binary (debit-normal vs credit-normal), no nuanced policies
- Override is payload-level, not line-level (sufficient for v1.1, refineable later)

📋 **Follow-up (v1.2+)**:
- Wire to real COA database once kernel service lanes exist
- Consider line-level override flags if needed
- Add configurable validation policies (e.g., allow contra accounts by category)
- Audit log for override usage

## Related

- **Builds on**: ADR-005 (JE Capture), ADR-006 (COA Picker)
- **Enables**: Real accounting workflows without manual error correction
- **Prepares**: v1.2 kernel integration (validation logic already proven)

## Code Changes

**New**:
- `src/data/coaMock.ts` (shared COA source)
- `tests/createJournalEntry.test.ts` (2 new tests)

**Modified**:
- `src/services/createJournalEntry.ts` (added validation refine + override field)
- `src/services/getCOAList.ts` (import shared mock)
- `src/index.ts` (version bump 1.0.1 → 1.1.0)
- `package.json` (version bump)

**Verification**: All tests 12/12 green (4 JE tests, 4 COA tests, 4 adapter tests)
