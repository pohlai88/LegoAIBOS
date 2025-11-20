export type PayrollEmployeeLine = {
  employeeId: string;
  gross: number;        // total gross salary
  employeeEpf: number;  // employee deduction
  net: number;          // gross - employeeEpf (v1 integrity rule)
};

export type PayrollRunDraft = {
  companyId: string;
  periodStart: string;  // YYYY-MM-DD
  periodEnd: string;    // YYYY-MM-DD
  currency: string;
  postingDate: string;  // YYYY-MM-DD
  referenceNo?: string;
  employees: PayrollEmployeeLine[];
};

export type PayrollRunPosted = PayrollRunDraft & {
  id: string;
  totals: {
    totalGross: number;
    totalEmployeeEpf: number;
    totalNetPayable: number;
  };
  status: "posted";
};
