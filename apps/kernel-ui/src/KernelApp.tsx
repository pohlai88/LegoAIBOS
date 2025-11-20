import React, { useEffect, useMemo, useState } from "react";

import kernel from "@aibos/kernel";
import type { KernelLanes } from "@aibos/kernel-sdk";
import helloWorldAdapter from "@aibos/helloworld";
import listenerDemoAdapter from "@aibos/listener-demo";
import accountingAdapter from "@aibos/accounting";
import inventoryAdapter from "@aibos/inventory";
import purchasesAdapter from "@aibos/purchases";
import salesAdapter from "@aibos/sales";

type InstalledApp = {
  id: string;
  version: string;
  manifest: any;
};

export function KernelApp() {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [booted, setBooted] = useState(false);
  const [activeView, setActiveView] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      await kernel.boot({
        mode: "dev",
        adapters: [helloWorldAdapter, listenerDemoAdapter, accountingAdapter, inventoryAdapter, purchasesAdapter, salesAdapter]
      });
      const loadedApps = kernel.apps.list();
      setApps(loadedApps);
      setBooted(true);
      
      // Auto-select first menu item
      const firstMenu = loadedApps.flatMap(a => a.manifest.menu || [])
        .sort((x: any, y: any) => (x.order ?? 999) - (y.order ?? 999))[0];
      if (firstMenu) setActiveView(firstMenu.id);
    })();
  }, []);

  const menuItems = useMemo(() => {
    return apps
      .flatMap(a => a.manifest.menu || [])
      .sort((x, y) => (x.order ?? 999) - (y.order ?? 999));
  }, [apps]);

  const routes = useMemo(() => {
    return apps.flatMap(a => a.manifest.routes || []);
  }, [apps]);

  const activeRoute = useMemo(() => {
    const menu = menuItems.find((m: any) => m.id === activeView);
    if (!menu) return null;
    return routes.find((r: any) => r.path === menu.path);
  }, [activeView, menuItems, routes]);

  const lanes: KernelLanes = kernel.lanes();

  if (!booted) {
    return <div style={{ padding: 16, fontFamily: "system-ui" }}>Booting Kernel…</div>;
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "220px 1fr",
      height: "100vh",
      fontFamily: "system-ui"
    }}>
      <aside style={{ borderRight: "1px solid #e5e5e5", padding: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>AI-BOS Kernel</div>
        {menuItems.length === 0 && <div style={{ opacity: 0.6 }}>No apps installed</div>}
        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {menuItems.map((m: any) => (
            <button
              key={m.id}
              onClick={() => setActiveView(m.id)}
              style={{
                padding: "6px 8px",
                borderRadius: 6,
                textDecoration: "none",
                color: activeView === m.id ? "#0066cc" : "#111",
                backgroundColor: activeView === m.id ? "#e6f3ff" : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontWeight: activeView === m.id ? 600 : 400
              }}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </aside>
      <main style={{ padding: 12, overflow: "auto" }}>
        {activeRoute ? (
          React.createElement(activeRoute.component as React.ComponentType<any>, { lanes })
        ) : (
          <div style={{ opacity: 0.6 }}>Select a module from the sidebar</div>
        )}
      </main>
    </div>
  );
}
