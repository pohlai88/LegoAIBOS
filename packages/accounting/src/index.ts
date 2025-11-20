import { defineApp } from "@aibos/kernel-sdk";
import { JournalEntryPage } from "./pages/JournalEntryPage";
import { createJournalEntryService } from "./services/createJournalEntry";
import { getCOAListService } from "./services/getCOAList";

// ADR-005: Accounting MVP JE Capture baseline
// ADR-006: COA read-only service (v1.0.1) for junior-usable picker
// ADR-007: JE COA normal balance validation (v1.1.0) for guarded entry
// ADR-010: inventory.STOCK_MOVED consumption proof (v1.1.1)
// ADR-011: Stock movement auto-JE draft (v1.2.0)
const manifest = defineApp({
  id: "accounting",
  name: "Accounting",
  version: "1.2.0",

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
    consumes: ["inventory.STOCK_MOVED"]
  }
}).manifest;

export default { manifest };
