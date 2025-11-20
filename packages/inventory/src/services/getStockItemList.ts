import { z } from "zod";
import { listStockItems } from "../data/stockMock";

export const GetStockItemListInputSchema = z.object({
  type: z.enum([
    "raw_material",
    "wip",
    "finished_goods",
    "trading_stock",
    "consumable",
    "service"
  ]).optional(),
  isActive: z.boolean().optional(),
  category: z.string().optional()
});

export const GetStockItemListOutputSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    itemCode: z.string(),
    name: z.string(),
    type: z.string(),
    category: z.string().optional(),
    uom: z.string(),
    qtyOnHand: z.number(),
    unitCost: z.number(),
    isActive: z.boolean(),
    createdAt: z.string()
  }))
});

export type GetStockItemListInput = z.infer<typeof GetStockItemListInputSchema>;
export type GetStockItemListOutput = z.infer<typeof GetStockItemListOutputSchema>;

export const getStockItemListService = {
  key: "inventory.getStockItemList",
  description: "Returns stock items (v1.0.0 uses mock storage).",
  inputSchema: GetStockItemListInputSchema,
  outputSchema: GetStockItemListOutputSchema,

  handler: (input: GetStockItemListInput): GetStockItemListOutput => {
    let items = listStockItems();

    if (input.type) items = items.filter(i => i.type === input.type);
    if (input.isActive !== undefined) items = items.filter(i => i.isActive === input.isActive);
    if (input.category) items = items.filter(i => i.category === input.category);

    return { items };
  }
};
