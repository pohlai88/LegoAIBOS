import { EventBus } from "./events/EventBus";
import { AppRegistry } from "./registry/AppRegistry";
import { AdapterRegistry } from "./adapters/AdapterRegistry";
import { ServiceRegistry } from "./services/ServiceRegistry";
import type { KernelLanes } from "@aibos/kernel-sdk";

const apps = new AppRegistry();
const events = new EventBus();
const services = new ServiceRegistry();
const adapters = new AdapterRegistry(apps, services);

const context = {
  getContext: () => ({ tenantId: "dev-tenant", userId: "dev-user" })
};

function rebuildServiceRegistry() {
  // Services already registered during adapter install; nothing extra needed yet.
  return services.list().length;
}

const kernel = {
  apps,
  events,
  adapters,
  services,
  context,
  callService: (key: string, input: any) => services.call(key, input),
  lanes: (ctx = context.getContext()): KernelLanes => ({
    services: { call: (key: string, input: any) => services.call(key, input) },
    events: {
      emit: (type: string, payload: any) => events.emit(ctx, { type, payload }),
      on: (type: string, handler: (payload: any) => void) => events.on(ctx, type, ev => handler(ev.payload))
    },
    ctx
  }),
  boot: async ({ adapters: installs }: { mode: string; adapters: any[] }) => {
    // v1.1.0: allow repeated boot calls by clearing previous state
    if (apps.list().length > 0) {
      apps.clear();
      services.clear();
      events.clear();
    }
    for (const a of installs) await adapters.install(a);
    const svcCount = rebuildServiceRegistry();

    // v1.1.1: auto-register listeners if adapter exposes registerListeners(lanes)
    const bootLanes = kernel.lanes(context.getContext());
    for (const a of installs) {
      const hook = (a as any).registerListeners || (a as any).default?.registerListeners;
      if (typeof hook === "function") {
        try {
          hook(bootLanes);
        } catch (err: any) {
          console.error(`Adapter listener registration failed for ${a.manifest.id}:`, err?.message);
        }
      }
    }

    console.log(
      "Kernel booted with apps:",
      installs.map(i => i.manifest.id + "@" + i.manifest.version),
      `services=${svcCount}`
    );
    return kernel;
  }
};

export default kernel;
