"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store/store";
import { useHydrated } from "@/lib/store/hooks";
import { Sparkles } from "lucide-react";

/** Redirects to onboarding if no local profile exists. Renders a neutral
 *  loading state until hydration resolves (avoids SSR/client mismatch). */
export function RequireProfile({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const profile = useStore((s) => s.profile);
  const tickQuests = useStore((s) => s.tickQuests);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !profile) router.replace("/onboarding");
  }, [hydrated, profile, router]);

  // Refresh daily/weekly quests whenever we enter the app.
  useEffect(() => {
    if (hydrated && profile) tickQuests();
  }, [hydrated, profile, tickQuests]);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex animate-pulse items-center gap-2 text-muted-foreground">
          <Sparkles className="h-5 w-5" /> Loading your progress…
        </div>
      </div>
    );
  }
  if (!profile) return null;
  return <>{children}</>;
}
