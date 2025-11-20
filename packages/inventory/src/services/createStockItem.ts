import { z } from "zod";
import type { StockItem, StockItemDraft } from "../schema/types";
import { addMockItem, findMockItemByCode } from "../data/inventoryMock";

export const CreateStockItemInputSchema = z.object({
  itemCode: z.string().min(1, "itemCode required"),
  name: z.string().min(1, "name required"),
  type: z.enum([
    "raw_material",
    "wip",
    "finished_goods",
    "trading_stock",
    "consumable",
    "service"
  ]),
  category: z.string().optional(),
  uom: z.string().min(1, "uom required"),
  qtyOnHand: z.number().min(0, "qtyOnHand must be >= 0"),
  unitCost: z.number().min(0, "unitCost must be >= 0"),
  isActive: z.boolean().default(true)
}).superRefine((val, ctx) => {
  if (findMockItemByCode(val.itemCode)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `itemCode '${val.itemCode}' already exists`
    });
  }
});

export const CreateStockItemOutputSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  item: z.object({
    itemCode: z.string(),
    name: z.string(),
    type: z.string(),
    category: z.string().optional(),
    uom: z.string(),
    qtyOnHand: z.number(),
    unitCost: z.number(),
    isActive: z.boolean()
  })
});

export type CreateStockItemInput = z.infer<typeof CreateStockItemInputSchema>;
export type CreateStockItemOutput = z.infer<typeof CreateStockItemOutputSchema>;

export const createStockItemService = {
  key: "inventory.createStockItem",
  description: "Creates a stock item (v1.0.0 uses mock storage).",
  inputSchema: CreateStockItemInputSchema,
  outputSchema: CreateStockItemOutputSchema,

  handler: (input: CreateStockItemInput): CreateStockItemOutput => {
    const now = new Date().toISOString();

    const item: StockItem = {
      id: input.itemCode,
      createdAt: now,
      ...(input as StockItemDraft)
    };

    addMockItem(item);

    return { id: item.id, createdAt: now, item };
  }
};
