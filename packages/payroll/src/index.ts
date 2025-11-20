import { defineApp } from "@aibos/kernel-sdk";
import { PayrollRunPage } from "./pages/PayrollRunPage";
import { postPayrollRunService } from "./services/postPayrollRun";
import { PAYRUN_POSTED_EVENT } from "./events/emitPayrunPosted";
import type { KernelLanes } from "@aibos/kernel-sdk";

const manifest = defineApp({
  id: "payroll",
  name: "Payroll",
  version: "1.0.0",
  ownedEntities: ["PayrollRun"],
  permissions: ["payroll:read", "payroll:write"],
  dimensions: [],
  routes: [
    { path: "/payroll/run", component: PayrollRunPage }
  ],
  menu: [
    { id: "payroll.menu.run", label: "Payrun", path: "/payroll/run", order: 40 }
  ],
  services: [postPayrollRunService],
  events: {
    emits: [PAYRUN_POSTED_EVENT],
    consumes: []
  }
}).manifest;

export function registerListeners(_lanes: KernelLanes) {
  // v1.0.0: payroll emits only; no consumption yet
}

export default { manifest, registerListeners };
