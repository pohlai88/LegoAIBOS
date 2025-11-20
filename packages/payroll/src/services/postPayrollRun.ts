import { z } from "zod";

export const PostPayrollRunInputSchema = z.object({
  companyId: z.string().min(1),
  periodStart: z.string().min(10),
  periodEnd: z.string().min(10),
  currency: z.string().min(1),
  postingDate: z.string().min(10),
  referenceNo: z.string().optional(),
  employees: z.array(z.object({
    employeeId: z.string().min(1),
    gross: z.number().nonnegative(),
    employeeEpf: z.number().nonnegative(),
    net: z.number().nonnegative()
  })).min(1)
}).refine(d => d.employees.every(e => Math.abs(e.net - (e.gross - e.employeeEpf)) < 0.000001), {
  message: "Each employee net must equal gross - employeeEpf"
});

export const PostPayrollRunOutputSchema = z.object({
  id: z.string(),
  status: z.literal("posted"),
  totals: z.object({
    totalGross: z.number(),
    totalEmployeeEpf: z.number(),
    totalNetPayable: z.number()
  })
});

export type PostPayrollRunInput = z.infer<typeof PostPayrollRunInputSchema>;
export type PostPayrollRunOutput = z.infer<typeof PostPayrollRunOutputSchema>;

export const postPayrollRunService = {
  key: "payroll.postPayrollRun",
  description: "Posts a payroll run and emits PAYRUN_POSTED.",
  inputSchema: PostPayrollRunInputSchema,
  outputSchema: PostPayrollRunOutputSchema,
  handler: (input: PostPayrollRunInput): PostPayrollRunOutput => {
    const totalGross = input.employees.reduce((s: number, e: { gross: number }) => s + e.gross, 0);
    const totalEmployeeEpf = input.employees.reduce((s: number, e: { employeeEpf: number }) => s + e.employeeEpf, 0);
    const totalNetPayable = input.employees.reduce((s: number, e: { net: number }) => s + e.net, 0);
    return {
      id: `PR-${Date.now()}`,
      status: "posted",
      totals: { totalGross, totalEmployeeEpf, totalNetPayable }
    };
  }
};
