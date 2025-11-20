import { defineApp } from "@aibos/kernel-sdk";
import { StockItemPage } from "./pages/StockItemPage";
import { createStockItemService } from "./services/createStockItem";
import { getStockItemListService } from "./services/getStockItemList";
import { createStockMoveService } from "./services/createStockMove";

// ADR-008: Inventory MVP Stock Item Capture baseline
// ADR-009: Stock movement operational slice
const manifest = defineApp({
  id: "inventory",
  name: "Inventory",
  version: "1.0.1",

  ownedEntities: ["StockItem"],
  permissions: ["inventory:read", "inventory:write"],
  dimensions: [],

  routes: [
    { path: "/inventory/items", component: StockItemPage }
  ],

  menu: [
    {
      id: "inventory.menu.items",
      label: "Stock Items",
      path: "/inventory/items",
      order: 20
    }
  ],

  services: [
    createStockItemService,
    getStockItemListService,
    createStockMoveService,
  ],

  events: {
    emits: ["inventory.STOCK_ITEM_CREATED", "inventory.STOCK_MOVED"],
    consumes: []
  }
}).manifest;

export default { manifest };