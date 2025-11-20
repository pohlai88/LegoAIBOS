import React, { useMemo, useState } from "react";
import { postCashReceiptService } from "../services/postCashReceipt";
import { emitCashReceiptPosted } from "../events/emitCashReceiptPosted";

type Props = {
  emitEvent?: (e: string, p: unknown) => void;
};

export function CashReceiptPage({ emitEvent }: Props) {
  const [postingDate, setPostingDate] = useState(() => new Date().toISOString().slice(0,10));
  const [companyId, setCompanyId] = useState("demo.company");
  const [customerId, setCustomerId] = useState("demo.customer");
  const [currency, setCurrency] = useState("MYR");
  const [amount, setAmount] = useState("100");
  const [method, setMethod] = useState<"bank"|"cash">("bank");
  const [bankAccountId, setBankAccountId] = useState("1020");
  const [invoiceId, setInvoiceId] = useState("");
  const [result, setResult] = useState("");

  const parsedAmount = useMemo(() => Number(amount || 0), [amount]);

  function submit() {
    setResult("");
    const input = {
      receiptId: `CR-${Date.now()}`,
      postingDate,
      companyId,
      customerId,
      currency,
      amount: parsedAmount,
      method,
      bankAccountId: method === "bank" ? bankAccountId : undefined,
      invoiceId: invoiceId || undefined,
    };

    const parsed = postCashReceiptService.inputSchema.safeParse(input);
    if (!parsed.success) {
      setResult(parsed.error.issues.map(i => i.message).join("\n"));
      return;
    }

    const out = postCashReceiptService.handler(parsed.data);
    if (emitEvent) emitCashReceiptPosted(emitEvent, out.payload);

    setResult(`Posted cash receipt ${out.payload.receiptId}\nAmount=${out.payload.amount} ${out.payload.currency}\nMethod=${out.payload.method}`);
  }

  return (
    <div style={{ padding: 12 }}>
      <h2>Sales — Cash Receipt (v1.0.1)</h2>

      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <label>Posting Date
          <input type="date" value={postingDate} onChange={e=>setPostingDate(e.target.value)} />
        </label>

        <label>Company
          <input value={companyId} onChange={e=>setCompanyId(e.target.value)} />
        </label>

        <label>Customer
          <input value={customerId} onChange={e=>setCustomerId(e.target.value)} />
        </label>

        <label>Currency
          <input value={currency} onChange={e=>setCurrency(e.target.value)} />
        </label>

        <label>Amount
          <input value={amount} onChange={e=>setAmount(e.target.value)} />
        </label>

        <label>Method
          <select value={method} onChange={e=>setMethod(e.target.value as any)}>
            <option value="bank">Bank</option>
            <option value="cash">Cash</option>
          </select>
        </label>

        {method === "bank" && (
          <label>Bank Account Id
            <input value={bankAccountId} onChange={e=>setBankAccountId(e.target.value)} />
          </label>
        )}

        <label>Invoice Id (optional)
          <input value={invoiceId} onChange={e=>setInvoiceId(e.target.value)} />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={submit}>Post Cash Receipt</button>
      </div>

      {result && <pre style={{ marginTop: 12, whiteSpace:"pre-wrap" }}>{result}</pre>}
    </div>
  );
}
