# ADR-022: Accounting Consumption of payroll.PAYRUN_POSTED

- Date: 2025-11-21
- Status: Accepted
- Scope: Accounting listener policy for Payroll payrun event

## Context
The Payroll module emits `payroll.PAYRUN_POSTED` summarizing gross, employee EPF deduction, and net payable. Accounting must auto-draft a balanced journal entry (JE) reflecting salary expense and liabilities without introducing new kernel abstractions.

## Decision
Accounting (v1.8.0) adds a listener `onPayrunPosted` consuming `payroll.PAYRUN_POSTED` via KernelLanes event facade. JE policy (v1) lines:

- DR 5200 Salaries & Wages Expense = totalGross
- CR 2030 Payroll Payable (Net Pay) = totalNetPayable
- CR 2130 EPF Payable (Employee deduction) = totalEmployeeEpf

Totals: Debits (totalGross) = Credits (totalNetPayable + totalEmployeeEpf) ensuring balance.

No contra or employer contribution lines included in v1 to keep slice minimal.

## Consequences
- Extends cross-module auto-JE drafting pattern (Inventory, Sales, Purchases → Accounting) to Payroll domain.
- Validates kernel auto listener registration for a newly added module.
- Expands COA mock with liability accounts 2030 & 2130 if absent.

## Out of Scope (Future Extensions)
- Employer EPF/SOCSO expense and liability lines
- Payrun approval workflow
- Multi-currency handling variances
- Tax remittance (PCB) clearing entries

## References
- ADR-021 Payroll Payrun Posted
- ADR-019 Kernel lanes facade
- ADR-020 Auto listener registration
