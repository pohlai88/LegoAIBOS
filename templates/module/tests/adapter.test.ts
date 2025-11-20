import { describe, it, expect } from "vitest";
import adapter from "../src/index";

describe("Module adapter baseline", () => {
  it("exports a valid manifest", () => {
    expect(adapter.manifest.id).toBeTruthy();
    expect(adapter.manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("has at least one route + menu item", () => {
    expect(adapter.manifest.routes.length).toBeGreaterThan(0);
    expect(adapter.manifest.menu.length).toBeGreaterThan(0);
  });
});
