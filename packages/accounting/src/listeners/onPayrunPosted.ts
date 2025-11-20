import type { KernelLanes } from "@aibos/kernel-sdk";
import { createJournalEntryService } from "../services/createJournalEntry";

// Boundary-local copy of payroll.PAYRUN_POSTED payload (avoid direct import)
export type PayrunPostedPayload = {
  id: string;
  companyId: string;
  periodStart: string;
  periodEnd: string;
  currency: string;
  postingDate: string;
  referenceNo?: string;
  employees: Array<{ employeeId: string; gross: number; employeeEpf: number; net: number }>;
  totals: { totalGross: number; totalEmployeeEpf: number; totalNetPayable: number };
  status: "posted";
};

export function onPayrunPosted(lanes: KernelLanes, payload: PayrunPostedPayload) {
  const { companyId, currency, postingDate, referenceNo, totals, id } = payload;

  const draft = {
    companyId,
    currency,
    postingDate,
    referenceNo: referenceNo ?? id,
    sourceEvent: "payroll.PAYRUN_POSTED" as const,
    lines: [
      { accountId: "5200", debit: totals.totalGross, credit: 0, memo: "Payroll gross" },
      { accountId: "2030", debit: 0, credit: totals.totalNetPayable, memo: "Net salary payable" },
      { accountId: "2130", debit: 0, credit: totals.totalEmployeeEpf, memo: "Employee EPF payable" }
    ]
  };

  const parsed = createJournalEntryService.inputSchema.safeParse(draft);
  if (!parsed.success) throw new Error(parsed.error.issues.map(i => i.message).join("; "));
  return createJournalEntryService.handler(parsed.data);
}
