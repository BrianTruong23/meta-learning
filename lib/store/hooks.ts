"use client";

import { useEffect, useState } from "react";
import { useStore } from "./store";

/** True once mounted on the client AND the persisted store has rehydrated.
 *  Gate persisted-state rendering on this to avoid hydration mismatches. */
export function useHydrated(): boolean {
  const hasHydrated = useStore((s) => s.hasHydrated);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Fallback: if there was nothing to rehydrate, flip the flag ourselves.
    if (!useStore.getState().hasHydrated) {
      useStore.getState().setHydrated(true);
    }
  }, []);
  return mounted && hasHydrated;
}
