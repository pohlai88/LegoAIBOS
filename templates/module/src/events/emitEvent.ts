import type { KernelContext, KernelEvent } from "@aibos/kernel-sdk";

export function emitModuleEvent(
  emit: (ctx: KernelContext, e: KernelEvent) => void,
  ctx: KernelContext,
  payload: unknown
) {
  emit(ctx, {
    type: "__MODULE_ID__.EVENT",
    payload,
    timestamp: new Date().toISOString(),
    sourceAppId: "__MODULE_ID__"
  });
}
