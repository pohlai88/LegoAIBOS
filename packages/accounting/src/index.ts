import { defineApp } from "@aibos/kernel-sdk";
import { JournalEntryPage } from "./pages/JournalEntryPage";
import { createJournalEntryService } from "./services/createJournalEntry";
import { getCOAListService } from "./services/getCOAList";

// ADR-005: Accounting MVP JE Capture baseline
// ADR-006: COA read-only service (v1.0.1) for junior-usable picker
const manifest = defineApp({
  id: "accounting",
  name: "Accounting",
  version: "1.0.1",

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
    consumes: []
  }
}).manifest;

export default { manifest };
