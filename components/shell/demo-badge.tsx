"use client";

import { useEffect, useState } from "react";
import { FlaskConical, Sparkles } from "lucide-react";
import { aiConfigured } from "@/lib/ai";

/** Honest label of whether real AI is wired, or we're in offline demo mode. */
export function DemoModeBadge() {
  const [mode, setMode] = useState<"demo" | "ai" | "loading">("loading");
  useEffect(() => {
    aiConfigured().then((c) => setMode(c ? "ai" : "demo"));
  }, []);

  if (mode === "loading") return null;

  return mode === "ai" ? (
    <span
      className="hidden items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent sm:flex"
      title="Real AI is configured on the server."
    >
      <Sparkles className="h-3.5 w-3.5" /> AI mode
    </span>
  ) : (
    <span
      className="hidden items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground sm:flex"
      title="No AI key configured — using offline, deterministic demo generation. Generated content is clearly labeled."
    >
      <FlaskConical className="h-3.5 w-3.5" /> Demo mode
    </span>
  );
}
