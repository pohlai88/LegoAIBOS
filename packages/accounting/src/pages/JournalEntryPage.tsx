import React, { useEffect, useMemo, useState } from "react";
import { createJournalEntryService } from "../services/createJournalEntry";
import { getCOAListService } from "../services/getCOAList";
import type { KernelLanes } from "@aibos/kernel-sdk";
import type { ChartOfAccount } from "../schema/types";

type LineState = {
  accountId: string;
  debit: string;
  credit: string;
  memo?: string;
};

export function JournalEntryPage({ lanes }: { lanes?: KernelLanes }) {
  const [postingDate, setPostingDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [companyId, setCompanyId] = useState("demo.company");
  const [currency, setCurrency] = useState("MYR");
  const [lines, setLines] = useState<LineState[]>([
    { accountId: "", debit: "100", credit: "0" },
    { accountId: "", debit: "0", credit: "100" }
  ]);
  const [result, setResult] = useState<string>("");
  const [coaList, setCoaList] = useState<ChartOfAccount[]>([]);

  // SSOT: Load COA from local stub (v1.0.1 design — no kernel service yet)
  useEffect(() => {
    if (lanes) {
      const out = lanes.services.call("accounting.getCOAList", { companyId });
      Promise.resolve(out).then((val: any) => {
        if (val && val.accounts) setCoaList(val.accounts as any);
      });
    } else {
      // Fallback legacy direct call (pre-v1.1)
      const { accounts } = getCOAListService.handler({ companyId });
      setCoaList(accounts as any);
    }
  }, [companyId, lanes]);

  const totals = useMemo(() => {
    const td = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
    const tc = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
    return { td, tc, balanced: Math.abs(td - tc) < 0.000001 && td > 0 };
  }, [lines]);

  function updateLine(i: number, patch: Partial<LineState>) {
    setLines(prev => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines(prev => [...prev, { accountId: "", debit: "0", credit: "0" }]);
  }

  function removeLine(i: number) {
    setLines(prev => prev.filter((_, idx) => idx !== i));
  }

  function submit() {
    setResult("");
    const payload = {
      postingDate,
      companyId,
      currency,
      lines: lines.map(l => ({
        accountId: l.accountId,
        debit: Number(l.debit || 0),
        credit: Number(l.credit || 0),
        memo: l.memo
      }))
    };

    const parsed = createJournalEntryService.inputSchema.safeParse(payload);
    if (!parsed.success) {
      setResult(parsed.error.issues.map(x => x.message).join("\n"));
      return;
    }

    let out: any;
    if (lanes) {
      out = lanes.services.call("accounting.createJournalEntry", parsed.data);
    } else {
      out = createJournalEntryService.handler(parsed.data);
    }
    Promise.resolve(out).then((final: any) => {
      setResult(`Created JE ${final.id}\nDebit=${final.totalDebit} Credit=${final.totalCredit}\nStatus=${final.status}`);
    });
  }

  return (
    <div style={{ padding: 12 }}>
      <h2>Accounting — Journal Entry Capture (MVP)</h2>

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
          <input value={companyId} onChange={e => setCompanyId(e.target.value)} />
        </label>

        <label>
          Currency
          <input value={currency} onChange={e => setCurrency(e.target.value)} />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <h3>Lines</h3>
        {lines.map((l, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 110px 110px 1fr auto", gap: 6, marginBottom: 6 }}>
            <select
              value={l.accountId}
              onChange={e => updateLine(i, { accountId: e.target.value })}
            >
              <option value="">-- Select Account --</option>
              {coaList.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.id} - {acc.name}
                </option>
              ))}
            </select>
            <input
              placeholder="debit"
              value={l.debit}
              onChange={e => updateLine(i, { debit: e.target.value, credit: "0" })}
            />
            <input
              placeholder="credit"
              value={l.credit}
              onChange={e => updateLine(i, { credit: e.target.value, debit: "0" })}
            />
            <input
              placeholder="memo"
              value={l.memo || ""}
              onChange={e => updateLine(i, { memo: e.target.value })}
            />
            <button onClick={() => removeLine(i)}>×</button>
          </div>
        ))}

        <button onClick={addLine}>Add line</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <div>Total Debit: {totals.td}</div>
        <div>Total Credit: {totals.tc}</div>
        <div>Balanced: {String(totals.balanced)}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={submit}>Create Journal Entry</button>
      </div>

      {result && (
        <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{result}</pre>
      )}
    </div>
  );
}
