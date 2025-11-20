import type { KernelLanes } from "@aibos/kernel-sdk";
import type { PostPayrollRunInput, PostPayrollRunOutput } from "../services/postPayrollRun";

export const PAYRUN_POSTED_EVENT = "payroll.PAYRUN_POSTED" as const;

export type PayrunPostedPayload = PostPayrollRunInput & PostPayrollRunOutput & {
  status: "posted";
};

export function emitPayrunPosted(lanes: KernelLanes, payload: PayrunPostedPayload) {
  lanes.events.emit(PAYRUN_POSTED_EVENT, payload);
}
