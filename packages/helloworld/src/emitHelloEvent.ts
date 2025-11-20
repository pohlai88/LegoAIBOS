import type { KernelEvent } from "@aibos/kernel-sdk";

// ADR-001/ADR-002 compliant:
// Modules emit ONLY via injected lane (no kernel imports).
export function createHelloEmitter(
  emitEvent: (event: KernelEvent) => void,
  sourceAppId = "demo.helloworld"
) {
  return (message: string) => {
    emitEvent({
      type: "HELLO_EVENT",
      payload: { message },
      timestamp: new Date().toISOString(),
      sourceAppId
    });
  };
}
