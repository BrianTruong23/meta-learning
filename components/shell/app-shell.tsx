"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Flame, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { navGroups } from "./nav";
import { useStore } from "@/lib/store/store";
import { useHydrated } from "@/lib/store/hooks";
import { levelProgress } from "@/lib/game/progression";
import { ThemeToggle } from "./theme-toggle";
import { DemoModeBadge } from "./demo-badge";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();
  const profile = useStore((s) => s.profile);
  const game = useStore((s) => s.game);

  // Gate: before a profile exists, routes under the shell send to onboarding.
  // (Handled per-page via <RequireProfile/> to keep SSR simple.)

  const lp = levelProgress(game.xp);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-border bg-surface transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-4">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">Mastery</span>
            </Link>
            <button
              className="md:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Main">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active =
                      pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-primary/12 text-primary"
                              : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon className="h-[18px] w-[18px]" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <button
            className="md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <DemoModeBadge />

          {hydrated && (
            <>
              <div
                className="hidden items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold sm:flex"
                title="Learning streak"
              >
                <Flame className="h-4 w-4 text-[hsl(var(--warning))]" />
                {game.streakDays}
              </div>
              <div
                className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold"
                title={`Level ${lp.level} · ${game.xp} XP`}
              >
                <Zap className="h-4 w-4 text-primary" />
                Lv {lp.level}
              </div>
            </>
          )}

          <ThemeToggle />

          {hydrated && profile && (
            <button
              onClick={() => router.push("/profile")}
              className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary"
              title={profile.name}
            >
              {profile.name.slice(0, 1).toUpperCase()}
            </button>
          )}
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-6xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
