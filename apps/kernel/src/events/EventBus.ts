import type { KernelContext, KernelEvent } from "@aibos/kernel-sdk";

type Handler = (event: KernelEvent) => void;

export class EventBus {
  private handlers = new Map<string, Handler[]>();

  emit(ctx: KernelContext, event: KernelEvent) {
    const list = this.handlers.get(event.type) || [];
    for (const h of list) h(event);
  }

  on(ctx: KernelContext, type: string, handler: Handler) {
    const list = this.handlers.get(type) || [];
    list.push(handler);
    this.handlers.set(type, list);
    return () => {
      const next = (this.handlers.get(type) || []).filter(h => h !== handler);
      this.handlers.set(type, next);
    };
  }
}
