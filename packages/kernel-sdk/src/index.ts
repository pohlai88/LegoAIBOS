import { z } from "zod";

// Core Event Types
export type KernelEvent = {
  type: string;
  payload: unknown;
  timestamp?: string;
  sourceAppId?: string;
};

export type KernelEventType = string;

// v1.1.0: Global event typing helpers (pure TS – no manifest shape change)
export type KernelEventMap = Record<KernelEventType, unknown>;
export type KernelEventFor<
  TMap extends KernelEventMap,
  TType extends keyof TMap & KernelEventType
> = KernelEvent & { type: TType; payload: TMap[TType] };
export type KernelEventHandler<
  TMap extends KernelEventMap,
  TType extends keyof TMap & KernelEventType
> = (event: KernelEventFor<TMap, TType>) => void;

// Context
export type KernelContext = {
  tenantId: string;
  userId?: string;
};

// Zod Schemas for Manifest Validation (SSOT)
export const RouteDefSchema = z.object({
  path: z.string(),
  component: z.custom<unknown>(),
  exact: z.boolean().optional()
});

export const MenuItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  path: z.string(),
  order: z.number().optional()
});

// Service definition: handler kept intentionally untyped (any) in v1.0.x to avoid premature coupling.
export const ServiceDefSchema = z.object({
  key: z.string(),
  description: z.string().optional(),
  // Schemas remain untyped at runtime; service lane will attempt .parse if present.
  inputSchema: z.any().optional(),
  outputSchema: z.any().optional(),
  handler: z.any().optional() // v1.0.x kept loose; v1.1 service lane adds validation wrapper
});

export const AppManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  ownedEntities: z.array(z.string()).default([]),
  routes: z.array(RouteDefSchema).default([]),
  menu: z.array(MenuItemSchema).default([]),
  permissions: z.array(z.string()).default([]),
  dimensions: z.array(z.any()).default([]),
  services: z.array(ServiceDefSchema).default([]),
  events: z.object({
    emits: z.array(z.string()).default([]),
    consumes: z.array(z.string()).default([])
  }).default({ emits: [], consumes: [] })
});

export type AppManifest = z.infer<typeof AppManifestSchema>;

// Adapter Factory (fail-fast validation)
export function validateAppManifest(manifest: AppManifest) {
  return AppManifestSchema.parse(manifest);
}

export function defineApp(manifest: AppManifest) {
  const validated = validateAppManifest(manifest);
  return { manifest: validated };
}

// v1.1.0: re-export lanes types
export * from "./lanes";

// v1.1.1: Adapter module typing (optional registerListeners hook for kernel boot auto-registration)
export type AdapterModule = {
  manifest: AppManifest;
  registerListeners?: (lanes: any) => void; // lanes typed at call site to avoid premature cross-version coupling
};
