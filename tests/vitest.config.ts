import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/helloworld/**"]
  },
  resolve: {
    alias: {
      "@aibos/kernel": path.resolve(__dirname, "../apps/kernel/src"),
      "@aibos/kernel-sdk": path.resolve(__dirname, "../packages/kernel-sdk/src"),
      "@aibos/inventory": path.resolve(__dirname, "../packages/inventory/src"),
      "@aibos/accounting": path.resolve(__dirname, "../packages/accounting/src")
    }
  }
});
