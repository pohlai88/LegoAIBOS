import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@aibos/kernel": path.resolve(__dirname, "../kernel/src"),
      "@aibos/kernel-sdk": path.resolve(__dirname, "../../packages/kernel-sdk/src"),
      "@aibos/helloworld": path.resolve(__dirname, "../../packages/helloworld/src"),
      "@aibos/listener-demo": path.resolve(__dirname, "../../packages/listener-demo/src")
    }
  },
  optimizeDeps: {
    exclude: ["react-router-dom", "react-router", "@remix-run/router"]
  },
  server: { port: 5173 }
});
