import React, { useMemo, useState } from "react";
import { postBillService } from "../services/postBill";

type LineState = {
  accountId: string;
  qty: string;
  unitCost: string;
  amount: string;
  memo?: string;
};

export function PurchaseBillPage() {
  const [billNo, setBillNo] = useState("PB-0001");
  const [postingDate, setPostingDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [companyId, setCompanyId] = useState("demo.company");
  const [currency, setCurrency] = useState("MYR");
  const [taxRate, setTaxRate] = useState("0");
  const [lines, setLines] = useState<LineState[]>([
    { accountId: "5100", qty: "1", unitCost: "100", amount: "", memo: "Office supplies" }
  ]);
  const [result, setResult] = useState("");

  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => {
      const amt =
        l.amount !== ""
          ? Number(l.amount)
          : Number(l.qty || 0) * Number(l.unitCost || 0);
      return s + amt;
    }, 0);
    const tr = Number(taxRate || 0);
    const tax = subtotal * tr / 100;
    return { subtotal, tax, total: subtotal + tax };
  }, [lines, taxRate]);

  function updateLine(i: number, patch: Partial<LineState>) {
    setLines(prev => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines(prev => [
      ...prev,
      { accountId: "", qty: "1", unitCost: "0", amount: "", memo: "" }
    ]);
  }

  function removeLine(i: number) {
    setLines(prev => prev.filter((_, idx) => idx !== i));
  }

  function submit() {
    setResult("");
    const payload = {
      billNo,
      postingDate,
      companyId,
      currency,
      taxRate: Number(taxRate || 0),
      lines: lines.map(l => ({
        accountId: l.accountId,
        qty: l.qty === "" ? undefined : Number(l.qty),
        unitCost: l.unitCost === "" ? undefined : Number(l.unitCost),
        amount: l.amount === "" ? undefined : Number(l.amount),
        memo: l.memo
      }))
    };

    const parsed = postBillService.inputSchema.safeParse(payload);
    if (!parsed.success) {
      setResult(parsed.error.issues.map(x => x.message).join("\n"));
      return;
    }

    const out = postBillService.handler(parsed.data);
    setResult(
      `Posted Bill ${out.billNo}\nSubtotal=${out.subtotal}\nTax=${out.taxAmount}\nTotal=${out.total}`
    );

    // SSOT note: kernel event lane emits purchases.BILL_POSTED at runtime
  }

  return (
    <div style={{ padding: 12 }}>
      <h2>Purchases — Bill Posted (v1.0.0)</h2>

      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <label>Bill No <input value={billNo} onChange={e => setBillNo(e.target.value)} /></label>
        <label>Posting Date <input type="date" value={postingDate} onChange={e => setPostingDate(e.target.value)} /></label>
        <label>Company Id <input value={companyId} onChange={e => setCompanyId(e.target.value)} /></label>
        <label>Currency <input value={currency} onChange={e => setCurrency(e.target.value)} /></label>
        <label>Tax Rate % <input value={taxRate} onChange={e => setTaxRate(e.target.value)} /></label>
      </div>

      <div style={{ marginTop: 12 }}>
        <h3>Lines</h3>
        {lines.map((l, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px 110px 110px 1fr auto", gap: 6, marginBottom: 6 }}>
            <input placeholder="accountId" value={l.accountId} onChange={e => updateLine(i, { accountId: e.target.value })} />
            <input placeholder="qty" value={l.qty} onChange={e => updateLine(i, { qty: e.target.value })} />
            <input placeholder="unitCost" value={l.unitCost} onChange={e => updateLine(i, { unitCost: e.target.value })} />
            <input placeholder="amount (override)" value={l.amount} onChange={e => updateLine(i, { amount: e.target.value })} />
            <input placeholder="memo" value={l.memo || ""} onChange={e => updateLine(i, { memo: e.target.value })} />
            <button onClick={() => removeLine(i)}>×</button>
          </div>
        ))}
        <button onClick={addLine}>Add line</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <div>Subtotal: {totals.subtotal.toFixed(2)}</div>
        <div>Tax: {totals.tax.toFixed(2)}</div>
        <div>Total: {totals.total.toFixed(2)}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={submit}>Post Bill</button>
      </div>

      {result && <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{result}</pre>}
    </div>
  );
}
