import React, { useState } from "react";
import { postPaymentService } from "../services/postPayment";

export function PurchasePaymentPage() {
  const [paymentNo, setPaymentNo] = useState("PP-0001");
  const [postingDate, setPostingDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [companyId, setCompanyId] = useState("demo.company");
  const [currency, setCurrency] = useState("MYR");
  const [amount, setAmount] = useState("100");
  const [method, setMethod] = useState<"bank" | "cash">("bank");
  const [bankAccountId, setBankAccountId] = useState("1020");
  const [billNo, setBillNo] = useState("");
  const [memo, setMemo] = useState("");
  const [result, setResult] = useState("");

  function submit() {
    setResult("");
    const payload = {
      paymentNo,
      postingDate,
      companyId,
      currency,
      amount: Number(amount),
      method,
      bankAccountId: method === "bank" ? bankAccountId : undefined,
      billNo: billNo || undefined,
      memo: memo || undefined
    };

    const parsed = postPaymentService.inputSchema.safeParse(payload);
    if (!parsed.success) {
      setResult(parsed.error.issues.map(i => i.message).join("\n"));
      return;
    }

    const out = postPaymentService.handler(parsed.data);
    setResult(`Posted Payment ${out.paymentNo}\nAmount=${out.amount}\nMethod=${out.method}`);

    // SSOT note: kernel lane emits purchases.PAYMENT_MADE at runtime
  }

  return (
    <div style={{ padding: 12 }}>
      <h2>Purchases — Payment Made (v1.0.1)</h2>

      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <label>Payment No <input value={paymentNo} onChange={e => setPaymentNo(e.target.value)} /></label>
        <label>Posting Date <input type="date" value={postingDate} onChange={e => setPostingDate(e.target.value)} /></label>
        <label>Company Id <input value={companyId} onChange={e => setCompanyId(e.target.value)} /></label>
        <label>Currency <input value={currency} onChange={e => setCurrency(e.target.value)} /></label>
        <label>Amount <input value={amount} onChange={e => setAmount(e.target.value)} /></label>

        <label>
          Method
          <select value={method} onChange={e => setMethod(e.target.value as any)}>
            <option value="bank">bank</option>
            <option value="cash">cash</option>
          </select>
        </label>

        {method === "bank" && (
          <label>Bank Account (COA id)
            <input value={bankAccountId} onChange={e => setBankAccountId(e.target.value)} />
          </label>
        )}

        <label>Bill No (optional)
          <input value={billNo} onChange={e => setBillNo(e.target.value)} />
        </label>

        <label>Memo
          <input value={memo} onChange={e => setMemo(e.target.value)} />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={submit}>Post Payment</button>
      </div>

      {result && <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{result}</pre>}
    </div>
  );
}
