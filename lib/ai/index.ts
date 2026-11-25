// =============================================================================
// Adapter selection. Callers use `getAdapter()` and never branch on provider.
// We probe the server once: if it reports a configured key, use ClaudeAdapter,
// otherwise the offline LocalAdapter (demo mode).
// =============================================================================

import type { AIAdapter } from "./adapter";
import { localAdapter, LocalAdapter } from "./local";
import { claudeAdapter } from "./claude";

export * from "./adapter";
export { localAdapter, LocalAdapter };

let cached: AIAdapter | null = null;
let probe: Promise<boolean> | null = null;

/** Whether real AI is configured on the server (cached). */
export async function aiConfigured(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!probe) {
    probe = fetch("/api/ai", { method: "GET" })
      .then((r) => (r.ok ? r.json() : { configured: false }))
      .then((j) => Boolean(j?.configured))
      .catch(() => false);
  }
  return probe;
}

export async function getAdapter(): Promise<AIAdapter> {
  if (cached) return cached;
  const configured = await aiConfigured();
  cached = configured ? claudeAdapter : localAdapter;
  return cached;
}

/** For UI labels: synchronous best-effort (defaults to demo until probe done). */
export function currentMode(): "demo" | "ai" {
  return cached?.id ?? "demo";
}
