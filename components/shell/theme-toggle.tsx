"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { useHydrated } from "@/lib/store/hooks";

export function ThemeToggle() {
  const theme = useStore((s) => s.settings.theme);
  const setSettings = useStore((s) => s.setSettings);
  const hydrated = useHydrated();

  const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <button
      onClick={() => setSettings({ theme: next })}
      className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-foreground hover:bg-muted"
      aria-label={`Theme: ${hydrated ? theme : "system"}. Click to switch.`}
      title={`Theme: ${hydrated ? theme : "system"}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
