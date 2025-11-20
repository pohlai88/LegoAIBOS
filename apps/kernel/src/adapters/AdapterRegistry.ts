import { validateAppManifest } from "@aibos/kernel-sdk";
import { AppRegistry } from "../registry/AppRegistry";

export class AdapterRegistry {
  constructor(private apps: AppRegistry) {}

  async install(adapter: any) {
    const manifest = validateAppManifest(adapter.manifest);
    this.apps.set(manifest.id, {
      id: manifest.id,
      version: manifest.version,
      manifest
    });
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
  }

  unmount(appId: string) {
    this.apps.delete(appId);
  }
}
