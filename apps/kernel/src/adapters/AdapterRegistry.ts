import { validateAppManifest } from "@aibos/kernel-sdk";
import { AppRegistry } from "../registry/AppRegistry";
import { ServiceRegistry } from "../services/ServiceRegistry";

export class AdapterRegistry {
  constructor(private apps: AppRegistry, private services: ServiceRegistry) {}

  async install(adapter: any) {
    const manifest = validateAppManifest(adapter.manifest);
    this.apps.set(manifest.id, {
      id: manifest.id,
      version: manifest.version,
      manifest
    });
    // v1.1.0: register services for service lane invocation
    for (const svc of manifest.services || []) this.services.register(manifest.id, svc);
  }

  async upgrade(appId: string, adapter: any) {
    const existing = this.apps.get(appId);
    if (!existing) throw new Error(`App ${appId} not installed`);

    const next = validateAppManifest(adapter.manifest);

    // minimal semver guard
    if (next.version <= existing.version) {
      throw new Error(`New version must be greater than existing`);
    }

    this.apps.set(appId, {
      id: next.id,
      version: next.version,
      manifest: next
    });
    // Re-register services from upgraded manifest (drop old ones first)
    this.services.unregisterApp(appId);
    for (const svc of next.services || []) this.services.register(appId, svc);
  }

  unmount(appId: string) {
    this.apps.delete(appId);
    this.services.unregisterApp(appId);
  }
}
