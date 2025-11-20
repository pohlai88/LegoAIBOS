import { describe, it, expect } from "vitest";
import { AppRegistry } from "../../apps/kernel/src/registry/AppRegistry";
import { AdapterRegistry } from "../../apps/kernel/src/adapters/AdapterRegistry";
import { ServiceRegistry } from "../../apps/kernel/src/services/ServiceRegistry";
import { defineApp } from "@aibos/kernel-sdk";

describe("kernel service registry v1.1.0", () => {
  it("registers services and invokes handler", async () => {
    const apps = new AppRegistry();
    const services = new ServiceRegistry();
    const adapters = new AdapterRegistry(apps, services);

    const demo = defineApp({
      id: "demo.echo",
      name: "Echo",
      version: "1.0.0",
      ownedEntities: [],
      routes: [],
      menu: [],
      permissions: [],
      dimensions: [],
      services: [
        {
          key: "demo.echo.say",
          handler: (input: { msg: string }) => ({ msg: input.msg.toUpperCase() })
        }
      ],
      events: { emits: [], consumes: [] }
    });

    await adapters.install(demo);
    const out = services.call("demo.echo.say", { msg: "ping" });
    expect(out).toEqual({ msg: "PING" });
  });

  it("rejects duplicate service keys", async () => {
    const apps = new AppRegistry();
    const services = new ServiceRegistry();
    const adapters = new AdapterRegistry(apps, services);

    const a = defineApp({
      id: "a", name: "A", version: "1.0.0",
      ownedEntities: [], routes: [], menu: [], permissions: [], dimensions: [],
      services: [{ key: "dup.key", handler: () => "x" }],
      events: { emits: [], consumes: [] }
    });

    const b = defineApp({
      id: "b", name: "B", version: "1.0.0",
      ownedEntities: [], routes: [], menu: [], permissions: [], dimensions: [],
      services: [{ key: "dup.key", handler: () => "y" }],
      events: { emits: [], consumes: [] }
    });

    await adapters.install(a);
    await expect(adapters.install(b)).rejects.toThrow(/Duplicate service key/);
  });
});
