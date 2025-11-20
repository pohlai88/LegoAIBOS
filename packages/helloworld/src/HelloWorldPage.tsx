import React, { useMemo, useState } from "react";
import type { KernelEvent } from "@aibos/kernel-sdk";
import { createHelloEmitter } from "./emitHelloEvent";

export function HelloWorldPage(props: {
  emitEvent?: (event: KernelEvent) => void; 
  // Kernel injection lane is OPTIONAL in v1.0.x.
  // ADR-001: Kernel stays lean until v1.1 injection standardization.
}) {
  const [msg, setMsg] = useState("Hello from module UI!");

  const emitHello = useMemo(() => {
    if (!props.emitEvent) return undefined;
    return createHelloEmitter(props.emitEvent);
  }, [props.emitEvent]);

  return (
    <div style={{ padding: 16 }}>
      <h1>HelloWorld Module v1.0.1</h1>
      <p>
        v1.0.1 proves service + event contracts without kernel drift.
      </p>

      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        style={{ width: 320, padding: 6 }}
      />

      <div style={{ marginTop: 12 }}>
        <button
          disabled={!emitHello}
          onClick={() => emitHello?.(msg)}
        >
          Emit HELLO_EVENT
        </button>

        {!emitHello && (
          <small style={{ marginLeft: 8 }}>
            (emitEvent lane will be injected by kernel later)
          </small>
        )}
      </div>
    </div>
  );
}
