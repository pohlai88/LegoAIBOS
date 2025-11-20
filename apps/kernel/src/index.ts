import { EventBus } from "./events/EventBus";
import { AppRegistry } from "./registry/AppRegistry";
import { AdapterRegistry } from "./adapters/AdapterRegistry";

const apps = new AppRegistry();
const events = new EventBus();
const adapters = new AdapterRegistry(apps);

const context = {
  getContext: () => ({ tenantId: "dev-tenant", userId: "dev-user" })
};

const kernel = {
  apps,
  events,
  adapters,
  context,
  boot: async ({ adapters: installs }: { mode: string; adapters: any[] }) => {
    for (const a of installs) await adapters.install(a);
    console.log(
      "Kernel booted with apps:",
      installs.map(i => i.manifest.id + "@" + i.manifest.version)
    );
    return kernel;
  }
};

export default kernel;
