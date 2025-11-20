import type { KernelLanes } from "@aibos/kernel-sdk";
import { onPayrunPosted, type PayrunPostedPayload } from "./onPayrunPosted";

export const PAYRUN_POSTED_EVENT = "payroll.PAYRUN_POSTED" as const;

export function registerPayrollEventListeners(lanes: KernelLanes) {
  lanes.events.on(PAYRUN_POSTED_EVENT, (payload: any) => {
    try {
      onPayrunPosted(lanes, payload as PayrunPostedPayload);
    } catch (err: any) {
      console.error("[Accounting] Failed PAYRUN_POSTED listener:", err?.message);
    }
  });
}
