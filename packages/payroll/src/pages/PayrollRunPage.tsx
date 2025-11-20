import React, { useMemo, useState } from "react";
import type { KernelLanes } from "@aibos/kernel-sdk";
import { postPayrollRunService } from "../services/postPayrollRun";
import { emitPayrunPosted } from "../events/emitPayrunPosted";

type Props = { lanes?: KernelLanes };

type EmpLineState = {
  employeeId: string;
  gross: string;
  employeeEpf: string;
  net: string;
};

export function PayrollRunPage({ lanes }: Props) {
  const [companyId, setCompanyId] = useState("demo.company");
  const [currency, setCurrency] = useState("MYR");
  const [periodStart, setPeriodStart] = useState("2025-01-01");
  const [periodEnd, setPeriodEnd] = useState("2025-01-31");
  const [postingDate, setPostingDate] = useState("2025-01-31");
  const [employees, setEmployees] = useState<EmpLineState[]>([
    { employeeId: "E001", gross: "3000", employeeEpf: "330", net: "2670" }
  ]);
  const [result, setResult] = useState("");

  const totals = useMemo(() => {
    const tGross = employees.reduce((s, e) => s + Number(e.gross || 0), 0);
    const tEpf = employees.reduce((s, e) => s + Number(e.employeeEpf || 0), 0);
    const tNet = employees.reduce((s, e) => s + Number(e.net || 0), 0);
    return { tGross, tEpf, tNet };
  }, [employees]);

  function updateEmp(i: number, patch: Partial<EmpLineState>) {
    setEmployees(prev => prev.map((e, idx) => idx === i ? { ...e, ...patch } : e));
  }

  function addEmp() {
    setEmployees(prev => [...prev, { employeeId: "", gross: "0", employeeEpf: "0", net: "0" }]);
  }

  function removeEmp(i: number) {
    setEmployees(prev => prev.filter((_, idx) => idx !== i));
  }

  function submit() {
    setResult("");
    const payload = {
      companyId, currency, periodStart, periodEnd, postingDate,
      employees: employees.map(e => ({
        employeeId: e.employeeId,
        gross: Number(e.gross || 0),
        employeeEpf: Number(e.employeeEpf || 0),
        net: Number(e.net || 0)
      }))
    };

    const parsed = postPayrollRunService.inputSchema.safeParse(payload);
    if (!parsed.success) {
      setResult(parsed.error.issues.map(x => x.message).join("\n"));
      return;
    }

    const out = postPayrollRunService.handler(parsed.data);
    setResult(`Posted Payrun ${out.id}\nGross=${out.totals.totalGross} EPF=${out.totals.totalEmployeeEpf} Net=${out.totals.totalNetPayable}`);

    if (lanes) {
      emitPayrunPosted(lanes, { ...parsed.data, ...out, status: "posted" });
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <h2>Payroll — Payrun Posting (v1.0.0)</h2>
      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <label>Company Id <input value={companyId} onChange={e => setCompanyId(e.target.value)} /></label>
        <label>Currency <input value={currency} onChange={e => setCurrency(e.target.value)} /></label>
        <label>Period Start <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} /></label>
        <label>Period End <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} /></label>
        <label>Posting Date <input type="date" value={postingDate} onChange={e => setPostingDate(e.target.value)} /></label>
      </div>
      <div style={{ marginTop: 12 }}>
        <h3>Employees</h3>
        {employees.map((e, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr 1fr auto", gap: 6, marginBottom: 6 }}>
            <input placeholder="employeeId" value={e.employeeId} onChange={(ev: React.ChangeEvent<HTMLInputElement>) => updateEmp(i, { employeeId: ev.target.value })} />
            <input placeholder="gross" value={e.gross} onChange={(ev: React.ChangeEvent<HTMLInputElement>) => updateEmp(i, { gross: ev.target.value })} />
            <input placeholder="employee EPF" value={e.employeeEpf} onChange={(ev: React.ChangeEvent<HTMLInputElement>) => updateEmp(i, { employeeEpf: ev.target.value })} />
            <input placeholder="net" value={e.net} onChange={(ev: React.ChangeEvent<HTMLInputElement>) => updateEmp(i, { net: ev.target.value })} />
            <button onClick={() => removeEmp(i)}>×</button>
          </div>
        ))}
        <button onClick={addEmp}>Add employee</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <div>Total Gross: {totals.tGross}</div>
        <div>Total Employee EPF: {totals.tEpf}</div>
        <div>Total Net Payable: {totals.tNet}</div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={submit}>Post Payrun</button>
      </div>
      {result && <pre style={{ marginTop: 12 }}>{result}</pre>}
    </div>
  );
}
