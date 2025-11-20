export class AppRegistry {
  private apps = new Map<string, any>();

  set(appId: string, app: any) {
    this.apps.set(appId, app);
  }

  get(appId: string) {
    return this.apps.get(appId);
  }

  delete(appId: string) {
    this.apps.delete(appId);
  }

  list() {
    return Array.from(this.apps.values());
  }

  clear() {
    this.apps.clear();
  }
}
