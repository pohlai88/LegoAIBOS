# ADR-021: Payroll v1.0.0 Payrun Posted

- Date: 2025-11-21
- Status: Accepted
- Scope: Payroll module introduction (operational slice only)

## Context
We need a thin Payroll domain slice to pressure kernel lanes/event consumption further without adding kernel features. The slice must emit a rich but minimal `payroll.PAYRUN_POSTED` event sufficient for Accounting to auto-draft a balanced journal entry.

## Decision
Introduce `@aibos/payroll` module (v1.0.0) with a single service `payroll.postPayrollRun` and UI page `PayrollRunPage`. The service validates per-employee net = gross - employeeEpf, aggregates totals, returns a posted summary. The UI emits a `payroll.PAYRUN_POSTED` event with structured payload (companyId, periodStart, periodEnd, currency, postingDate, employees[], totals). No persistence, approvals, tax engine, or employer statutory lines in v1.0.0.

## Event Payload
```
{
  companyId,
  periodStart,
  periodEnd,
  currency,
  postingDate,
  referenceNo?,
  employees: [{ employeeId, gross, employeeEpf, net }],
  totals: { totalGross, totalEmployeeEpf, totalNetPayable },
  status: "posted",
  id: string
}
```

## Consequences
- Enables Accounting listener coverage for payroll without kernel drift.
- Provides foundation for later statutory employer contributions (EPF employer, SOCSO) and approval workflow in v2.
- Keeps module Lego-removable: no cross-module imports.

## Out of Scope (v1.0.0)
- Employer EPF/SOCSO expense lines
- PCB / tax authority remittance flows
- Pay period locking / approvals
- Persistence layer

## References
- ADR-019 Kernel lanes facade
- ADR-020 Auto listener registration
- ADR-022 Payroll→GL Auto-JE Draft
