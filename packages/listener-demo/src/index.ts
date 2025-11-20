import { defineApp } from "@aibos/kernel-sdk";
import { ListenerPage } from "./ListenerPage";

// ADR-002: Manifest schema validated via SDK SSOT

export const listenerDemoAdapter = defineApp({
  id: "demo.listener",
  name: "Listener Demo",
  version: "1.0.0",

  ownedEntities: [],

  routes: [
    {
      path: "/listener",
      component: ListenerPage,
      exact: true
    }
  ],

  menu: [
    {
      id: "listener.menu",
      label: "Listener Demo",
      path: "/listener",
      order: 2
    }
  ],

  permissions: [],
  dimensions: [],
  services: [],

  events: {
    emits: [],
    consumes: ["HELLO_EVENT"]
  }
});

export default listenerDemoAdapter;
