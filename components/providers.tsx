"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store/store";

/** Applies the theme + reduced-motion preference to <html>, reactively. */
export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useStore((s) => s.settings.theme);
  const reducedMotion = useStore((s) => s.settings.reducedMotion);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  }, [reducedMotion]);

  return <>{children}</>;
}
