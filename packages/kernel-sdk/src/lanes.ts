// packages/kernel-sdk/src/lanes.ts
// v1.1.0: Typed lanes facade (events + services)
import type { KernelContext } from "./index";

export type KernelEventType = string;
export type KernelEventMap = Record<KernelEventType, unknown>;
export type KernelServiceKey = string;
export type KernelServiceMap = Record<KernelServiceKey, { input: unknown; output: unknown }>;

export type KernelServiceLane<S extends KernelServiceMap = KernelServiceMap> = {
  call: <K extends keyof S & string>(key: K, input: S[K]["input"]) => Promise<S[K]["output"]> | S[K]["output"];
};

export type KernelEventLane<E extends KernelEventMap = KernelEventMap> = {
  emit: <K extends keyof E & string>(type: K, payload: E[K]) => void;
  on: <K extends keyof E & string>(type: K, handler: (payload: E[K]) => void) => () => void;
};

export type KernelLanes<
  S extends KernelServiceMap = KernelServiceMap,
  E extends KernelEventMap = KernelEventMap
> = {
  services: KernelServiceLane<S>;
  events: KernelEventLane<E>;
  ctx: KernelContext;
};
