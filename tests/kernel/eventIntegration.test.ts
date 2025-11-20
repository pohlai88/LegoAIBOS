import { describe, it, expect } from "vitest";
import kernel from "../../apps/kernel/src/index";

import helloWorldAdapter from "@aibos/helloworld";
import listenerDemoAdapter from "@aibos/listener-demo";
import { createHelloEmitter } from "../../packages/helloworld/src/emitHelloEvent";
import { createHelloListener } from "../../packages/listener-demo/src/listenHelloEvent";

// ADR-001: Cross-module comms only via kernel lanes (events)
// ADR-002: Adapters defined/validated in SDK SSOT

describe("Cross-module HELLO_EVENT integration proof", () => {
  it("HelloWorld emits HELLO_EVENT and listener-demo consumes it", async () => {
    await kernel.boot({
      mode: "dev",
      adapters: [helloWorldAdapter, listenerDemoAdapter]
    });

    const ctx = kernel.context.getContext();

    let received: string | null = null;

    // In v1.0.x, kernel does not inject lanes automatically yet.
    // Tests wire the lane manually to prove end-to-end behavior.
    const unsubscribe = createHelloListener(
      kernel.events.on.bind(kernel.events),
      ctx,
      (msg) => { received = msg; }
    );

    const emitHello = createHelloEmitter(
      (event) => kernel.events.emit(ctx, event)
    );

    emitHello("event-ping");

    expect(received).toBe("event-ping");

    unsubscribe();
    kernel.adapters.unmount("demo.helloworld");
    kernel.adapters.unmount("demo.listener");
  });
});
