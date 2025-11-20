# 🧱 AI-BOS Kernel Boilerplate Scaffold (Refined Complete SSOT v1.0.0)

This document is the **single source of truth (SSOT)** for the Kernel v1 chassis and Kernel SDK v1.  
It is intentionally minimal but **strictly boundary‑enforcing**. Copy‑paste into your monorepo to enact Kernel v1.

---

## Metadata
- **Document ID**: AI-BOS-KERNEL-BOILERPLATE-v1
- **Version**: 1.0.0
- **Status**: Active (Baseline)
- **Date Issued**: 2025-11-20
- **Authors**: Jack + ChatGPT
- **Purpose / Reasoning**: Provide a stable Kernel + SDK skeleton that enforces the Kernel/SDK/Adapter contract, prevents drift, and enables Lego‑style modules.

---

## 0. Monorepo Layout (Authoritative)

> **Hard rule:** `apps/*` must NOT import other `apps/*` directly.
> All shared contracts live in `packages/*`.

```
AI-BOS/
  apps/
    kernel/
      src/
        registry/        # Installed apps state
        adapters/        # Adapter loader/registry
        events/          # Tenant-scoped event bus
        auth/            # Context/auth provider stubs
        shell/           # Kernel OS shell + UI
        index.ts         # Kernel exports
        main.ts          # Boot entry
      package.json
      tsconfig.json

  packages/
    kernel-sdk/
      src/
        types.ts             # Core contracts (AppManifest etc.)
        context.ts           # KernelContext
        manifestSchema.ts    # Zod schema SSOT for AppManifest
        defineApp.ts         # defineApp() adapter factory
        events.ts            # Event types/helpers
        index.ts             # Barrel exports
      package.json
      tsconfig.json

  tests/
    kernel/
      manifest.test.ts
      adapters.test.ts
      events.test.ts

  .github/workflows/
    ci.yml

  docs/
    AI-BOS-CONTRACT-v1.md
    AI-BOS-KERNEL-PDR-v1.md
    AI-BOS-KERNEL-BOILERPLATE-v1.md

  .eslintrc.cjs
```

---

## 1. Root Enforcement (Boundary Seatbelt)

### 1.1 `.eslintrc.cjs`

```js
module.exports = {
  root: true,
  env: { es2024: true, node: true, browser: true },
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  rules: {
    "no-restricted-imports": ["error", {
      "patterns": [
        {
          "group": ["apps/*", "../apps/*", "../../apps/*"],
          "message": "Apps must not import other apps directly. Use kernel-sdk adapters/contracts."
        },
        {
          "group": ["**/db/**", "**/internal/**"],
          "message": "Do not import another module's DB or internal layers."
        }
      ]
    }]
  }
};
```

---

## 2. `packages/kernel-sdk` — SDK v1 (SSOT)

### 2.1 `packages/kernel-sdk/package.json`

```json
{
  "name": "@aibos/kernel-sdk",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit",
    "lint": "eslint ."
  },
  "dependencies": {
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "eslint": "^9.0.0"
  }
}
```

---

### 2.2 Core Types

#### `packages/kernel-sdk/src/types.ts`

```ts
// ---------- Events ----------
export type KernelEventType = string;

export type KernelEvent<TPayload = unknown> = {
  type: KernelEventType;
  payload: TPayload;
  timestamp?: string;
  sourceAppId?: string;
};

// ---------- UI Surfaces ----------
export type RouteDef = {
  path: string;
  component: unknown; // later: React.ComponentType if SSOT
  exact?: boolean;
};

export type MenuItem = {
  id: string;
  label: string;
  path: string;
  icon?: string;
  order?: number;
  parentId?: string;
};

// ---------- Dimensions ----------
export type DimensionDef = {
  key: string;
  label: string;
  required?: boolean;
  optionsSource?: string; // service key
};

// ---------- Public Services ----------
export type ServiceDef = {
  key: string;
  description?: string;
  // Recommend Zod schemas at boundaries.
  inputSchema?: unknown;
  outputSchema?: unknown;
  handler?: unknown;
};

// ---------- App Manifest (Adapter Spec v1) ----------
export type AppManifest = {
  id: string;
  name: string;
  version: string;

  ownedEntities: string[];

  routes: RouteDef[];
  menu: MenuItem[];

  permissions: string[];
  dimensions: DimensionDef[];
  services: ServiceDef[];

  events: {
    emits: KernelEventType[];
    consumes: KernelEventType[];
  };

  migrations?: unknown;
};
```

---

### 2.3 Context

#### `packages/kernel-sdk/src/context.ts`

```ts
export type KernelContext = {
  tenantId: string;
  userId: string;
  roles: string[];
  scopes: string[];
};
```

---

### 2.4 Manifest Zod Schemas (Real Validation)

#### `packages/kernel-sdk/src/manifestSchema.ts`

```ts
import { z } from "zod";

// --- Sub-schemas (lean but real runtime validation) ---
export const RouteDefSchema = z.object({
  path: z.string().min(1),
  component: z.any(),
  exact: z.boolean().optional(),
});

export const MenuItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  path: z.string().min(1),
  icon: z.string().optional(),
  order: z.number().optional(),
  parentId: z.string().optional(),
});

export const DimensionDefSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  required: z.boolean().optional(),
  optionsSource: z.string().optional(),
});

export const ServiceDefSchema = z.object({
  key: z.string().min(1),
  description: z.string().optional(),
  inputSchema: z.any().optional(),
  outputSchema: z.any().optional(),
  handler: z.any().optional(),
});

// --- AppManifest SSOT schema ---
export const AppManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),

  ownedEntities: z.array(z.string()).default([]),

  routes: z.array(RouteDefSchema).default([]),
  menu: z.array(MenuItemSchema).default([]),

  permissions: z.array(z.string()).default([]),
  dimensions: z.array(DimensionDefSchema).default([]),
  services: z.array(ServiceDefSchema).default([]),

  events: z.object({
    emits: z.array(z.string()).default([]),
    consumes: z.array(z.string()).default([])
  }).default({ emits: [], consumes: [] }),

  migrations: z.any().optional(),
});

export type ValidatedManifest = z.infer<typeof AppManifestSchema>;
```

---

### 2.5 Adapter Factory

#### `packages/kernel-sdk/src/defineApp.ts`

```ts
import type { AppManifest } from "./types";
import { AppManifestSchema, type ValidatedManifest } from "./manifestSchema";

export type AppAdapter = {
  manifest: AppManifest;
};

// Adapter factory used by modules.
// Validates manifest at definition time to fail fast.
export function defineApp(manifest: AppManifest): AppAdapter {
  AppManifestSchema.parse(manifest);
  return { manifest };
}

export function validateAppManifest(input: unknown): ValidatedManifest {
  return AppManifestSchema.parse(input);
}
```

---

### 2.6 Events + Barrel Export

#### `packages/kernel-sdk/src/events.ts`

```ts
export { type KernelEvent, type KernelEventType } from "./types";
```

#### `packages/kernel-sdk/src/index.ts`

```ts
export * from "./types";
export * from "./context";
export * from "./manifestSchema";
export * from "./defineApp";
export * from "./events";
```

---

## 3. `apps/kernel` — Kernel Chassis v1

### 3.1 `apps/kernel/package.json`

```json
{
  "name": "@aibos/kernel",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "dev": "tsx src/main.ts",
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest run"
  },
  "dependencies": {
    "@aibos/kernel-sdk": "workspace:*",
    "eventemitter3": "^5.0.1",
    "semver": "^7.6.3"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "tsx": "^4.19.2",
    "eslint": "^9.0.0",
    "vitest": "^2.1.8"
  }
}
```

---

### 3.2 Boot Entrypoint

#### `apps/kernel/src/main.ts`

```ts
import kernel from "./index";

kernel.boot({
  mode: "dev",
  adapters: [],
});
```

#### `apps/kernel/src/index.ts`

```ts
import { Kernel } from "./shell/Kernel";

export const kernel = new Kernel();
export default kernel;
```

---

### 3.3 Registry

#### `apps/kernel/src/registry/AppRegistry.ts`

```ts
import type { AppAdapter, AppManifest } from "@aibos/kernel-sdk";

export type InstalledApp = {
  id: string;
  version: string;
  manifest: AppManifest;
  adapter: AppAdapter;
  installedAt: string;
};

export class AppRegistry {
  private apps = new Map<string, InstalledApp>();

  list(): InstalledApp[] {
    return Array.from(this.apps.values());
  }

  get(id: string): InstalledApp | undefined {
    return this.apps.get(id);
  }

  register(app: InstalledApp): void {
    this.apps.set(app.id, app);
  }

  unregister(appId: string): void {
    this.apps.delete(appId);
  }
}
```

---

### 3.4 Adapter Loader + Registry

#### `apps/kernel/src/adapters/AdapterLoader.ts`

```ts
import type { AppAdapter } from "@aibos/kernel-sdk";
import { validateAppManifest } from "@aibos/kernel-sdk";

export class AdapterLoader {
  async load(adapters: AppAdapter[]): Promise<AppAdapter[]> {
    // Local dev: adapters imported statically.
    // Marketplace later.
    return adapters;
  }

  validate(adapter: AppAdapter): AppAdapter {
    validateAppManifest(adapter.manifest);
    return adapter;
  }
}
```

#### `apps/kernel/src/adapters/AdapterRegistry.ts`

```ts
import type { AppAdapter } from "@aibos/kernel-sdk";
import { AppRegistry } from "../registry/AppRegistry";
import { AdapterLoader } from "./AdapterLoader";
import semver from "semver";

export class AdapterRegistry {
  private loader = new AdapterLoader();
  constructor(private appRegistry: AppRegistry) {}

  async mountAll(adapters: AppAdapter[]) {
    const loaded = await this.loader.load(adapters);
    for (const adapter of loaded) await this.install(adapter);
  }

  async install(adapter: AppAdapter) {
    const validated = this.loader.validate(adapter);

    // TODO(v1.1): run migrations for validated.manifest.migrations

    this.appRegistry.register({
      id: validated.manifest.id,
      version: validated.manifest.version,
      manifest: validated.manifest,
      adapter: validated,
      installedAt: new Date().toISOString(),
    });
  }

  async upgrade(appId: string, newAdapter: AppAdapter) {
    const existing = this.appRegistry.get(appId);
    if (!existing) throw new Error(`Cannot upgrade missing app: ${appId}`);

    const validated = this.loader.validate(newAdapter);
    const next = validated.manifest.version;

    if (!semver.valid(next) || !semver.valid(existing.version)) {
      throw new Error(`Invalid semver for upgrade: ${existing.version} -> ${next}`);
    }

    if (!semver.gt(next, existing.version)) {
      throw new Error(`Upgrade version must be greater: ${existing.version} -> ${next}`);
    }

    // TODO(v1.1): run migrations; if fail, throw BEFORE swap.

    this.appRegistry.register({
      id: validated.manifest.id,
      version: next,
      manifest: validated.manifest,
      adapter: validated,
      installedAt: new Date().toISOString(),
    });
  }

  unmount(appId: string) {
    this.appRegistry.unregister(appId);
  }
}
```

---

### 3.5 Event Bus (Tenant‑scoped)

#### `apps/kernel/src/events/EventBus.ts`

```ts
import EventEmitter from "eventemitter3";
import type { KernelEvent, KernelEventType, KernelContext } from "@aibos/kernel-sdk";

export class EventBus {
  private emitter = new EventEmitter();

  emit(ctx: KernelContext, event: KernelEvent) {
    const key = `${ctx.tenantId}:${event.type}`;
    this.emitter.emit(key, event);
  }

  on(ctx: KernelContext, type: KernelEventType, handler: (event: KernelEvent) => void) {
    const key = `${ctx.tenantId}:${type}`;
    this.emitter.on(key, handler);
    return () => this.emitter.off(key, handler);
  }
}
```

---

### 3.6 Context Provider (Stub)

#### `apps/kernel/src/auth/ContextProvider.ts`

```ts
import type { KernelContext } from "@aibos/kernel-sdk";

export class ContextProvider {
  // Stub. Later: integrate your Zero-Trust Auth Orchestrator / Supabase.
  getContext(): KernelContext {
    return {
      tenantId: "dev-tenant",
      userId: "dev-user",
      roles: ["admin"],
      scopes: ["*"]
    };
  }
}
```

---

### 3.7 Kernel Orchestrator

#### `apps/kernel/src/shell/Kernel.ts`

```ts
import { AppRegistry } from "../registry/AppRegistry";
import { AdapterRegistry } from "../adapters/AdapterRegistry";
import { EventBus } from "../events/EventBus";
import { ContextProvider } from "../auth/ContextProvider";
import type { AppAdapter } from "@aibos/kernel-sdk";

export type KernelBootOptions = {
  mode: "dev" | "prod";
  adapters: AppAdapter[];
};

export class Kernel {
  readonly apps = new AppRegistry();
  readonly events = new EventBus();
  readonly context = new ContextProvider();
  readonly adapters = new AdapterRegistry(this.apps);

  async boot(opts: KernelBootOptions) {
    await this.adapters.mountAll(opts.adapters);

    if (opts.mode === "dev") {
      console.log(
        "Kernel booted with apps:",
        this.apps.list().map(a => `${a.id}@${a.version}`)
      );
    }
  }
}
```

---

### 3.8 Minimal Shell UI Stub

#### `apps/kernel/src/shell/KernelShell.tsx`

```tsx
import React from "react";
import kernel from "../index";

// Minimal UI surface to freeze UX shape.
// Styling intentionally plain in v1.

export function KernelShell() {
  const apps = kernel.apps.list();
  const menuItems = apps
    .flatMap(a => a.manifest.menu)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside style={{ width: 240, borderRight: "1px solid #eee", padding: 12 }}>
        <h3>AI-BOS</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {menuItems.map(m => (
            <li key={m.id} style={{ padding: "6px 0" }}>{m.label}</li>
          ))}
        </ul>
      </aside>
      <main style={{ flex: 1, padding: 16 }}>
        <h2>Workspace</h2>
        <p>Routes will render here once router integration is added.</p>
      </main>
    </div>
  );
}
```

---

## 4. Minimal Tests (Guardrails Proof)

> Place these in `/tests/kernel/*` or co-locate under kernel with your preferred convention.

### 4.1 `tests/kernel/manifest.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { validateAppManifest } from "@aibos/kernel-sdk";

describe("manifest validation", () => {
  it("rejects invalid manifest", () => {
    expect(() => validateAppManifest({ id: "x" })).toThrow();
  });

  it("accepts valid manifest", () => {
    const m = validateAppManifest({
      id: "demo.app",
      name: "Demo",
      version: "1.0.0",
      ownedEntities: [],
      routes: [],
      menu: [],
      permissions: [],
      dimensions: [],
      services: [],
      events: { emits: [], consumes: [] },
    });
    expect(m.id).toBe("demo.app");
  });
});
```

### 4.2 `tests/kernel/adapters.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { AppRegistry } from "../../apps/kernel/src/registry/AppRegistry";
import { AdapterRegistry } from "../../apps/kernel/src/adapters/AdapterRegistry";
import { defineApp } from "@aibos/kernel-sdk";

describe("adapter registry", () => {
  it("installs and unmounts adapter", async () => {
    const apps = new AppRegistry();
    const adapters = new AdapterRegistry(apps);

    const demo = defineApp({
      id: "demo.app",
      name: "Demo",
      version: "1.0.0",
      ownedEntities: [],
      routes: [],
      menu: [],
      permissions: [],
      dimensions: [],
      services: [],
      events: { emits: [], consumes: [] },
    });

    await adapters.install(demo);
    expect(apps.get("demo.app")).toBeTruthy();

    adapters.unmount("demo.app");
    expect(apps.get("demo.app")).toBeUndefined();
  });
});
```

### 4.3 `tests/kernel/events.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { EventBus } from "../../apps/kernel/src/events/EventBus";

describe("event bus tenant scoping", () => {
  it("does not leak events across tenants", () => {
    const bus = new EventBus();

    const ctxA = { tenantId: "A", userId: "u", roles: [], scopes: [] };
    const ctxB = { tenantId: "B", userId: "u", roles: [], scopes: [] };

    let receivedB = false;

    bus.on(ctxB, "PING", () => { receivedB = true; });
    bus.emit(ctxA, { type: "PING", payload: {} });

    expect(receivedB).toBe(false);
  });
});
```

---

## 5. CI Pipeline (Guardrails In Practice)

### 5.1 `.github/workflows/ci.yml`

```yml
name: CI

on:
  push:
  pull_request:

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install
        run: pnpm install

      - name: Typecheck
        run: pnpm -r typecheck

      - name: Lint
        run: pnpm -r lint

      - name: Test
        run: pnpm -r test
```

---

## 6. Quick Verification (v1 Acceptance)

Kernel v1 is accepted when:

1. Kernel boots with **zero adapters** without error.
2. A demo adapter can be mounted and appears in:
   - AppRegistry list
   - KernelShell nav
3. ESLint boundaries prevent cross‑app imports.
4. Manifest validation fails fast on malformed adapters.
5. CI runs clean on push/PR.

---

## 7. Intentional Minimalism (Do NOT add in v1)

**Out of scope for v1.0.0:**
- Marketplace / remote adapter fetching
- Full migration runner / rollback engine
- Router integration + dynamic route rendering
- Async queue/event persistence
- Database provisioning
- UI theming polish (tokens enforcement starts when real UI lands)
- Global `KernelEventMap` typing (land in v1.1.0 after 1–2 modules)

These enter only via ADR + MINOR bump once modules demand them.

---

✅ End of AI-BOS Kernel Boilerplate Scaffold (Refined Complete SSOT v1.0.0)

