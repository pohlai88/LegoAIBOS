import { z } from "zod";

// Core Event Types
export type KernelEvent = {
  type: string;
  payload: unknown;
  timestamp?: string;
  sourceAppId?: string;
};

export type KernelEventType = string;

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
  inputSchema: z.any().optional(),
  outputSchema: z.any().optional(),
  handler: z.any().optional()
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
