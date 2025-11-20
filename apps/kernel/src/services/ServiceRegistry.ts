// apps/kernel/src/services/ServiceRegistry.ts
// v1.1.0: Minimal service registry + proxy invocation lane (evidence-driven)

export type RegisteredService = {
  key: string;
  description?: string;
  inputSchema?: any; // Zod schema optional
  outputSchema?: any; // Zod schema optional
  handler?: (input: any) => any;
  appId: string;
};

function isSchema(x: any): x is { parse: (val: any) => any } {
  return !!x && typeof x.parse === "function";
}

export class ServiceRegistry {
  private map = new Map<string, RegisteredService>();

  register(appId: string, svc: Omit<RegisteredService, "appId">) {
    if (this.map.has(svc.key)) {
      throw new Error(`Duplicate service key detected: ${svc.key}`);
    }
    this.map.set(svc.key, { ...svc, appId });
  }

  unregisterApp(appId: string) {
    for (const [key, svc] of this.map.entries()) {
      if (svc.appId === appId) this.map.delete(key);
    }
  }

  list() {
    return Array.from(this.map.values());
  }

  clear() {
    this.map.clear();
  }

  get(key: string) {
    return this.map.get(key);
  }

  call(key: string, input: any) {
    const svc = this.map.get(key);
    if (!svc || typeof svc.handler !== "function") {
      throw new Error(`Service not found or missing handler: ${key}`);
    }

    const parsedInput = isSchema(svc.inputSchema) ? svc.inputSchema.parse(input) : input;
    const raw = svc.handler(parsedInput);
    const parsedOutput = isSchema(svc.outputSchema) ? svc.outputSchema.parse(raw) : raw;
    return parsedOutput;
  }
}
