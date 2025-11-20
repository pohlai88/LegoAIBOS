import React, { useMemo, useState } from "react";
import { postSalesInvoiceService } from "../services/postSalesInvoice";
import { emitInvoicePostedEvent } from "../events/emitInvoicePostedEvent";
import type { SalesInvoiceLine, SalesInvoicePostedPayload } from "../schema/types";

type Props = {
  emitEvent?: (type: string, payload: any) => void;
};

export function SalesInvoicePage({ emitEvent }: Props) {
  const [postingDate, setPostingDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [companyId, setCompanyId] = useState("demo.company");
  const [customerId, setCustomerId] = useState("demo.customer");
  const [currency, setCurrency] = useState("MYR");
  const [taxRate, setTaxRate] = useState(0);

  const [lines, setLines] = useState<SalesInvoiceLine[]>([
    { itemCode: "ITEM-001", qty: 2, unitPrice: 50, lineTotal: 100 }
  ]);

  const [result, setResult] = useState("");

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.lineTotal, 0),
    [lines]
  );
  const tax = +(subtotal * taxRate).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  function updateLine(i: number, patch: Partial<SalesInvoiceLine>) {
    setLines(prev =>
      prev.map((l, idx) =>
        idx === i
          ? {
              ...l,
              ...patch,
              lineTotal:
                (patch.qty ?? l.qty) * (patch.unitPrice ?? l.unitPrice)
            }
          : l
      )
    );
  }

  function addLine() {
    setLines(prev => [
      ...prev,
      { itemCode: "", qty: 1, unitPrice: 0, lineTotal: 0 }
    ]);
  }

  function removeLine(i: number) {
    setLines(prev => prev.filter((_, idx) => idx !== i));
  }

  function submit() {
    setResult("");

    const payload = {
      postingDate,
      companyId,
      customerId,
      currency,
      taxRate,
      lines
    };

    const parsed = postSalesInvoiceService.inputSchema.safeParse(payload);
    if (!parsed.success) {
      setResult(parsed.error.issues.map(x => x.message).join("\n"));
      return;
    }

    const out = postSalesInvoiceService.handler(parsed.data);

    const eventPayload: SalesInvoicePostedPayload = {
      invoiceId: out.invoiceId,
      postingDate,
      companyId,
      customerId,
      currency,
      subtotal: out.subtotal,
      tax: out.tax,
      total: out.total,
      lines
    };

    emitInvoicePostedEvent(emitEvent, eventPayload);

    setResult(
      `Posted Sales Invoice ${out.invoiceId}\nSubtotal=${out.subtotal}\nTax=${out.tax}\nTotal=${out.total}`
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <h2>Sales — Invoice Post (v1.0.0)</h2>

      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <label>
          Posting Date
          <input
            type="date"
            value={postingDate}
            onChange={e => setPostingDate(e.target.value)}
          />
        </label>

        <label>
          Company Id
          <input
            value={companyId}
            onChange={e => setCompanyId(e.target.value)}
          />
        </label>

        <label>
          Customer Id
          <input
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
          />
        </label>

        <label>
          Currency
          <input
            value={currency}
            onChange={e => setCurrency(e.target.value)}
          />
        </label>

        <label>
          Tax Rate (e.g. 0.06)
          <input
            type="number"
            step="0.01"
            value={taxRate}
            onChange={e => setTaxRate(Number(e.target.value || 0))}
          />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <h3>Lines</h3>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 90px 120px 120px auto",
              gap: 6,
              marginBottom: 6
            }}
          >
            <input
              placeholder="item code"
              value={l.itemCode}
              onChange={e => updateLine(i, { itemCode: e.target.value })}
            />
            <input
              placeholder="qty"
              value={l.qty}
              onChange={e =>
                updateLine(i, { qty: Number(e.target.value || 0) })
              }
            />
            <input
              placeholder="unit price"
              value={l.unitPrice}
              onChange={e =>
                updateLine(i, { unitPrice: Number(e.target.value || 0) })
              }
            />
            <input value={l.lineTotal} readOnly />
            <button onClick={() => removeLine(i)}>×</button>
          </div>
        ))}

        <button onClick={addLine}>Add line</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <div>Subtotal: {subtotal}</div>
        <div>Tax: {tax}</div>
        <div>Total: {total}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={submit}>Post Sales Invoice</button>
      </div>

      {result && <pre style={{ marginTop: 12 }}>{result}</pre>}
    </div>
  );
}
