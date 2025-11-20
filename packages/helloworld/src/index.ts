import { defineApp } from "@aibos/kernel-sdk";
import { z } from "zod";
import { HelloWorldPage } from "./HelloWorldPage";

// ADR-002: Manifest schema validated via SDK SSOT (defineApp + AppManifestSchema)

export const helloWorldAdapter = defineApp({
  id: "demo.helloworld",
  name: "HelloWorld Demo",
  version: "1.0.1",

  ownedEntities: [],

  routes: [
    {
      path: "/hello",
      component: HelloWorldPage,
      exact: true
    }
  ],

  menu: [
    {
      id: "hello.menu",
      label: "HelloWorld",
      path: "/hello",
      order: 1
    }
  ],

  // Demo public service contract WITH handler stub.
  // NOTE: Kernel does not proxy services yet (out of scope v1.0.0),
  // but including handler here standardizes module pattern early.
  services: [
    {
      key: "demo.helloworld.echo",
      description: "Echo back a message (demo service contract)",
      inputSchema: z.object({ message: z.string() }),
      outputSchema: z.object({ message: z.string() }),

      // v1.0.1 handler stub:
      // proves executable contract without kernel RPC plumbing yet.
      handler: (input: { message: string }) => input
    }
  ],

  permissions: [],
  dimensions: [],

  // Demo event lane
  events: {
    emits: ["HELLO_EVENT"],
    consumes: []
  }
});

export default helloWorldAdapter;
