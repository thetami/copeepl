"use client";

import { useEffect } from "react";

// Must match HARD_RELOAD_PORT in scripts/dev.mjs.
const PORT = 47820;

export function HardReloadListener() {
  useEffect(() => {
    const source = new EventSource(`http://localhost:${PORT}/hard-reload`);
    source.onmessage = () => window.location.reload();
    return () => source.close();
  }, []);

  return null;
}
