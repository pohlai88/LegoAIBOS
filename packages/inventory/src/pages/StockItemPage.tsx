import React, { useEffect, useMemo, useState } from "react";
import { createStockItemService } from "../services/createStockItem";
import { getStockItemListService } from "../services/getStockItemList";
import { createStockMoveService } from "../services/createStockMove";
import { listStockMoves } from "../data/stockMock";
import { emitStockItemCreated } from "../events/emitInventoryEvent";
import { emitStockMovedEvent } from "../events/emitStockMovedEvent";
import type { StockItemType } from "../schema/types";

type Props = {
  emitEvent?: (e: { type: string; payload: unknown }) => void;
};

export function StockItemPage({ emitEvent }: Props) {
  const [itemCode, setItemCode] = useState("RM-0002");
  const [name, setName] = useState("Local Raw Lettuce Seeds");
  const [type, setType] = useState<StockItemType>("raw_material");
  const [category, setCategory] = useState("Seeds");
  const [uom, setUom] = useState("pack");
  const [qtyOnHand, setQtyOnHand] = useState("10");
  const [unitCost, setUnitCost] = useState("12.0");
  const [isActive, setIsActive] = useState(true);

  const [items, setItems] = useState<any[]>([]);
  const [moves, setMoves] = useState<any[]>([]);
  const [result, setResult] = useState<string>("");

  const [moveForm, setMoveForm] = useState({
    itemCode: "",
    qtyDelta: 0,
    reason: "adjustment",
    postingDate: new Date().toISOString().slice(0, 10),
    memo: "",
    allowNegative: false,
  });

  function refreshList() {
    const out = getStockItemListService.handler({ isActive: true });
    setItems(out.items);
    setMoves(listStockMoves());
  }

  useEffect(() => {
    refreshList();
  }, []);

  const payload = useMemo(() => ({
    itemCode,
    name,
    type,
    category: category || undefined,
    uom,
    qtyOnHand: Number(qtyOnHand || 0),
    unitCost: Number(unitCost || 0),
    isActive
  }), [itemCode, name, type, category, uom, qtyOnHand, unitCost, isActive]);

  function submit() {
    setResult("");
    const parsed = createStockItemService.inputSchema.safeParse(payload);

    if (!parsed.success) {
      setResult(parsed.error.issues.map(i => i.message).join("\n"));
      return;
    }

    const out = createStockItemService.handler(parsed.data);

    emitStockItemCreated(emitEvent, {
      id: out.id,
      itemCode: out.item.itemCode,
      name: out.item.name,
      qtyOnHand: out.item.qtyOnHand,
      unitCost: out.item.unitCost,
      createdAt: out.createdAt
    });

    setResult(`Created Item ${out.item.itemCode} (${out.item.name})`);
    refreshList();
  }

  function submitMove() {
    setResult("");
    const parsed = createStockMoveService.inputSchema.safeParse({
      companyId: "demo.company",
      ...moveForm,
      qtyDelta: Number(moveForm.qtyDelta),
    });
    if (!parsed.success) {
      setResult(parsed.error.issues.map((x) => x.message).join("\n"));
      return;
    }
    try {
      const out = createStockMoveService.handler(parsed.data);
      emitStockMovedEvent(emitEvent, {
        ...out,
        reason: parsed.data.reason,
        postingDate: parsed.data.postingDate,
      });
      setResult(
        `Moved ${out.itemCode}: ${out.qtyBefore} → ${out.qtyAfter} (${out.status})`
      );
      refreshList();
    } catch (e: any) {
      setResult(e.message || String(e));
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <h2>Inventory — Stock Item Capture (v1.0.1)</h2>

      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <label>
          Item Code
          <input value={itemCode} onChange={e => setItemCode(e.target.value)} />
        </label>

        <label>
          Name
          <input value={name} onChange={e => setName(e.target.value)} />
        </label>

        <label>
          Type
          <select value={type} onChange={e => setType(e.target.value as StockItemType)}>
            <option value="raw_material">Raw Material</option>
            <option value="wip">WIP</option>
            <option value="finished_goods">Finished Goods</option>
            <option value="trading_stock">Trading Stock</option>
            <option value="consumable">Consumable</option>
            <option value="service">Service</option>
          </select>
        </label>

        <label>
          Category
          <input value={category} onChange={e => setCategory(e.target.value)} />
        </label>

        <label>
          UOM
          <input value={uom} onChange={e => setUom(e.target.value)} />
        </label>

        <label>
          Qty On Hand
          <input value={qtyOnHand} onChange={e => setQtyOnHand(e.target.value)} />
        </label>

        <label>
          Unit Cost
          <input value={unitCost} onChange={e => setUnitCost(e.target.value)} />
        </label>

        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={e => setIsActive(e.target.checked)}
          />
          Active
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={submit}>Create Stock Item</button>
      </div>

      {result && (
        <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{result}</pre>
      )}

      <hr style={{ margin: "18px 0" }} />

      <h3>Stock Movement (v1.0.1)</h3>
      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <label>
          Item
          <select
            value={moveForm.itemCode}
            onChange={(e) =>
              setMoveForm((f) => ({ ...f, itemCode: e.target.value }))
            }
          >
            <option value="">-- Select Item --</option>
            {items.map((i) => (
              <option key={i.itemCode} value={i.itemCode}>
                {i.itemCode} - {i.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Qty Delta (+in / -out)
          <input
            type="number"
            value={moveForm.qtyDelta}
            onChange={(e) =>
              setMoveForm((f) => ({ ...f, qtyDelta: Number(e.target.value) }))
            }
          />
        </label>

        <label>
          Reason
          <select
            value={moveForm.reason}
            onChange={(e) =>
              setMoveForm((f) => ({ ...f, reason: e.target.value }))
            }
          >
            {["purchase","sale","adjustment","transfer","waste","opening"].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        <label>
          Posting Date
          <input
            type="date"
            value={moveForm.postingDate}
            onChange={(e) =>
              setMoveForm((f) => ({ ...f, postingDate: e.target.value }))
            }
          />
        </label>

        <label>
          Memo
          <input
            value={moveForm.memo}
            onChange={(e) =>
              setMoveForm((f) => ({ ...f, memo: e.target.value }))
            }
          />
        </label>

        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={moveForm.allowNegative}
            onChange={(e) =>
              setMoveForm((f) => ({ ...f, allowNegative: e.target.checked }))
            }
          />
          Allow Negative (admin only)
        </label>
      </div>

      <button style={{ marginTop: 10 }} onClick={submitMove}>
        Post Stock Move
      </button>

      <div style={{ marginTop: 14 }}>
        <h4>Recent Moves</h4>
        {moves.length === 0 && <div>No moves yet.</div>}
        {moves.map((m) => (
          <div key={m.id} style={{ fontSize: 13, marginBottom: 4 }}>
            {m.postingDate} — {m.itemCode} {m.qtyBefore} → {m.qtyAfter} ({m.reason})
          </div>
        ))}
      </div>

      <hr style={{ margin: "18px 0" }} />

      <div style={{ marginTop: 16 }}>
        <h3>Active Items</h3>
        <div style={{ display: "grid", gap: 6 }}>
          {items.map(i => (
            <div key={i.id} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}>
              <div><b>{i.itemCode}</b> — {i.name}</div>
              <div>{i.type} | {i.category ?? "-"} | {i.qtyOnHand} {i.uom} @ {i.unitCost}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
