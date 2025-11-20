import React, { useEffect, useState } from "react";
import type { KernelContext, KernelEvent, KernelEventType } from "@aibos/kernel-sdk";
import { createHelloListener } from "./listenHelloEvent";

export function ListenerPage(props: {
  ctx?: KernelContext;
  onEvent?: (
    ctx: KernelContext,
    type: KernelEventType,
    handler: (event: KernelEvent) => void
  ) => () => void;
}) {
  const [lastMsg, setLastMsg] = useState<string>("(no event yet)");

  useEffect(() => {
    if (!props.ctx || !props.onEvent) return;

    const unsubscribe = createHelloListener(
      props.onEvent,
      props.ctx,
      (msg) => setLastMsg(msg)
    );

    return unsubscribe;
  }, [props.ctx, props.onEvent]);

  return (
    <div style={{ padding: 16 }}>
      <h1>Listener Demo v1.0.0</h1>
      <p>Consumes HELLO_EVENT and shows last payload.</p>
      <strong>Last HELLO_EVENT.message:</strong>
      <div style={{ marginTop: 8 }}>{lastMsg}</div>

      {!props.ctx || !props.onEvent ? (
        <small>
          (ctx/onEvent will be injected by kernel later; tests wire this lane)
        </small>
      ) : null}
    </div>
  );
}
