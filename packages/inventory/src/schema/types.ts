export type StockItemType =
  | "raw_material"
  | "wip"
  | "finished_goods"
  | "trading_stock"
  | "consumable"
  | "service";

export type StockItemDraft = {
  itemCode: string;       // unique SKU/code
  name: string;
  type: StockItemType;
  category?: string;
  uom: string;            // unit of measure (e.g. "kg", "pcs")
  qtyOnHand: number;      // >= 0
  unitCost: number;       // >= 0
  isActive: boolean;
};

export type StockItem = StockItemDraft & {
  id: string;             // internal id (mocked as itemCode for now)
  createdAt: string;      // ISO date
};

export type StockItemCreatedEvent = {
  id: string;
  itemCode: string;
  name: string;
  qtyOnHand: number;
  unitCost: number;
  createdAt: string;
};

export type StockItemListFilter = {
  type?: StockItemType;
  isActive?: boolean;
  category?: string;
};

// v1.0.1: Operational stock movement
export type StockMoveReason =
  | "purchase"
  | "sale"
  | "adjustment"
  | "transfer"
  | "waste"
  | "opening";

export type StockMoveDraft = {
  companyId: string;
  itemCode: string;
  qtyDelta: number; // +in, -out. Cannot be 0.
  reason: StockMoveReason;
  postingDate: string; // YYYY-MM-DD
  refType?: string;
  refId?: string;
  memo?: string;
  allowNegative?: boolean; // escape hatch for admin adjustments
};

export type StockMovePosted = StockMoveDraft & {
  id: string;
  qtyBefore: number;
  qtyAfter: number;
  status: "posted";
};
