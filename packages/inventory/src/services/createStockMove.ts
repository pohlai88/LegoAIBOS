// packages/inventory/src/services/createStockMove.ts
import { z } from "zod";
import { applyStockMove } from "../data/stockMock";
import type { StockMoveReason } from "../schema/types";

export const CreateStockMoveInputSchema = z.object({
  companyId: z.string().min(1),
  itemCode: z.string().min(1),
  qtyDelta: z.number().refine((n) => n !== 0, "qtyDelta cannot be 0"),
  reason: z.enum([
    "purchase",
    "sale",
    "adjustment",
    "transfer",
    "waste",
    "opening",
  ]),
  postingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  refType: z.string().optional(),
  refId: z.string().optional(),
  memo: z.string().optional(),
  allowNegative: z.boolean().optional(),
});

export const CreateStockMoveOutputSchema = z.object({
  id: z.string(),
  itemCode: z.string(),
  qtyBefore: z.number(),
  qtyAfter: z.number(),
  status: z.literal("posted"),
});

export type CreateStockMoveInput = z.infer<typeof CreateStockMoveInputSchema>;
export type CreateStockMoveOutput = z.infer<typeof CreateStockMoveOutputSchema>;

export const createStockMoveService = {
  key: "inventory.createStockMove",
  description:
    "Posts a stock movement and updates qtyOnHand. v1.0.1 uses mock store.",
  inputSchema: CreateStockMoveInputSchema,
  outputSchema: CreateStockMoveOutputSchema,

  handler: (input: CreateStockMoveInput): CreateStockMoveOutput => {
    const posted = applyStockMove(input);
    return {
      id: posted.id,
      itemCode: posted.itemCode,
      qtyBefore: posted.qtyBefore,
      qtyAfter: posted.qtyAfter,
      status: posted.status,
    };
  },
};
