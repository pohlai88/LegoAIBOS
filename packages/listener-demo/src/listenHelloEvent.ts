import type { KernelEvent, KernelEventType, KernelContext } from "@aibos/kernel-sdk";

// ADR-001 compliant:
// Modules consume events ONLY via injected onEvent lane.
export function createHelloListener(
  onEvent: (
    ctx: KernelContext,
    type: KernelEventType,
    handler: (event: KernelEvent) => void
  ) => () => void,
  ctx: KernelContext,
  callback: (message: string) => void
) {
  return onEvent(ctx, "HELLO_EVENT", (event) => {
    const payload = event.payload as { message?: string };
    if (payload?.message) callback(payload.message);
  });
}
