import type { KernelContext, KernelEvent } from "@aibos/kernel-sdk";

export function emitJournalCreated(
  emit: (ctx: KernelContext, e: KernelEvent) => void,
  ctx: KernelContext,
  payload: unknown
) {
  emit(ctx, {
    type: "accounting.JOURNAL_CREATED",
    payload,
    timestamp: new Date().toISOString(),
    sourceAppId: "accounting"
  });
}
