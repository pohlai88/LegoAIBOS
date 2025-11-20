import { defineApp } from "@aibos/kernel-sdk";
import { JournalEntryPage } from "./pages/JournalEntryPage";
import { createJournalEntryService } from "./services/createJournalEntry";
import { getCOAListService } from "./services/getCOAList";
import { registerListeners } from "./listeners/registerListeners";

// ADR-005: Accounting MVP JE Capture baseline
// ADR-006: COA read-only service (v1.0.1) for junior-usable picker
// ADR-007: JE COA normal balance validation (v1.1.0) for guarded entry
// ADR-010: inventory.STOCK_MOVED consumption proof (v1.1.1)
// ADR-011: Stock movement auto-JE draft (v1.2.0)
// ADR-012: Sales invoice→AR auto-JE draft (v1.3.0)
// ADR-013: Cash receipt→AR clearing (v1.4.0)
// ADR-014/015: Purchases bill→AP auto-JE draft (v1.5.0)
// ADR-016/017: Purchases payment→AP clearing (v1.6.0)
const manifest = defineApp({
  id: "accounting",
  name: "Accounting",
  version: "1.7.0",

  ownedEntities: ["JournalEntry", "JournalLine"],
  permissions: ["accounting:read", "accounting:write"],
  dimensions: [],

  routes: [
    { path: "/accounting/journal-entry", component: JournalEntryPage }
  ],

  menu: [
    {
      id: "accounting.menu.journal",
      label: "Journal Entry",
      path: "/accounting/journal-entry",
      order: 10
    }
  ],

  services: [createJournalEntryService, getCOAListService],

  events: {
    emits: ["accounting.JOURNAL_CREATED"],
    consumes: ["inventory.STOCK_MOVED", "sales.INVOICE_POSTED", "sales.CASH_RECEIPT_POSTED", "purchases.BILL_POSTED", "purchases.PAYMENT_MADE"]
  }
}).manifest;

export default { manifest, registerListeners };
export { registerListeners };
