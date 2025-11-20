import { defineApp } from "@aibos/kernel-sdk";
import type { KernelLanes } from "@aibos/kernel-sdk";
import { ModulePage } from "./pages/ModulePage";
import { echoService } from "./services/echoService";

const manifest = defineApp({
  id: "__MODULE_ID__",
  name: "__MODULE_NAME__",
  version: "1.0.0",
  ownedEntities: [],
  permissions: [],
  dimensions: [],

  routes: [
    { path: "/__MODULE_ID__", component: ModulePage }
  ],

  menu: [
    { id: "__MODULE_ID__.menu", label: "__MODULE_NAME__", path: "/__MODULE_ID__", order: 50 }
  ],

  services: [
    echoService
  ],

  events: {
    emits: ["__MODULE_ID__.EVENT"],
    consumes: []
  }
}).manifest;

export function registerListeners(_lanes: KernelLanes) {
  // Optional: wire event listeners here using lanes.events.on(...)
}

export default { manifest, registerListeners };
