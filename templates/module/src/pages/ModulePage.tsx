import React, { useState } from "react";

export function ModulePage() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: 12 }}>
      <h2>__MODULE_NAME__</h2>
      <p>Canonical adapter page.</p>

      <button onClick={() => setCount(c => c + 1)}>
        Clicks: {count}
      </button>
    </div>
  );
}
