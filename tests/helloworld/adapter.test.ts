import { describe, it, expect } from "vitest";
import { validateAppManifest } from "@aibos/kernel-sdk";
import helloWorldAdapter from "@aibos/helloworld";

import { AppRegistry } from "../../apps/kernel/src/registry/AppRegistry";
import { AdapterRegistry } from "../../apps/kernel/src/adapters/AdapterRegistry";
import { ServiceRegistry } from "../../apps/kernel/src/services/ServiceRegistry";

// ADR-001: Kernel baseline lifecycle enforced
// ADR-002: Manifest schema SSOT via SDK

describe("HelloWorld adapter v1.0.1 - SSOT compliance + lifecycle", () => {
  it("passes SDK SSOT manifest validation", () => {
    const manifest = validateAppManifest(helloWorldAdapter.manifest);
    expect(manifest.id).toBe("demo.helloworld");
    expect(manifest.version).toBe("1.0.1");

    // Snapshot: stable fields only (mask component refs).
    const stable = {
      ...manifest,
      routes: manifest.routes.map(r => ({ ...r, component: "[component]" }))
    };
    expect(stable).toMatchSnapshot();
  });

  it("service handler stub returns echo input (module-only proof)", () => {
    const svc = helloWorldAdapter.manifest.services[0];
    const out = (svc.handler as (i: { message: string }) => { message: string })({
      message: "ping"
    });
    expect(out.message).toBe("ping");
  });

  it("installs adapter and exposes menu/routes/services/events", async () => {
    const apps = new AppRegistry();
    const services = new ServiceRegistry();
    const adapters = new AdapterRegistry(apps, services);

    await adapters.install(helloWorldAdapter);

    const installed = apps.get("demo.helloworld");
    expect(installed).toBeTruthy();

    expect(installed?.manifest.menu[0].label).toBe("HelloWorld");
    expect(installed?.manifest.routes[0].path).toBe("/hello");

    expect(installed?.manifest.services[0].key).toBe("demo.helloworld.echo");
    expect(installed?.manifest.events.emits).toContain("HELLO_EVENT");
  });

  it("unmount removes adapter without breaking registry", async () => {
    const apps = new AppRegistry();
    const services = new ServiceRegistry();
    const adapters = new AdapterRegistry(apps, services);

    await adapters.install(helloWorldAdapter);
    adapters.unmount("demo.helloworld");

    expect(apps.get("demo.helloworld")).toBeUndefined();
    expect(apps.list().length).toBe(0);
  });
});
