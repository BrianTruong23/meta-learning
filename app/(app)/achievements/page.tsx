"use client";

import {
  Footprints,
  Zap,
  Flame,
  Compass,
  Award,
  Swords,
  Target,
  Microscope,
  PenLine,
  Puzzle,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";
import { ALL_BADGES, levelProgress, rankForLevel } from "@/lib/game/progression";
import { RANKS } from "@/lib/types";
import { cn } from "@/lib/utils";

const RANKS_INFO = RANKS.map((name) => ({ name }));

const BADGE_ICONS: Record<string, LucideIcon> = {
  footprints: Footprints,
  zap: Zap,
  flame: Flame,
  compass: Compass,
  award: Award,
  swords: Swords,
  target: Target,
  microscope: Microscope,
  "pen-line": PenLine,
  puzzle: Puzzle,
};

export default function AchievementsPage() {
  const game = useStore((s) => s.game);
  const lp = levelProgress(game.xp);
  const rank = rankForLevel(lp.level);

  return (
    <div>
      <PageHeader
        title="Achievements"
        subtitle="Earned through effort and consistency. (Remember: XP and badges are motivation — real mastery is tracked separately, by evidence.)"
      />

      {/* Rank ladder */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <p className="mb-3 text-sm font-bold">Rank progression</p>
          <div className="flex flex-wrap gap-2">
            {RANKS_INFO.map((r, i) => {
              const reached = RANKS_INFO.findIndex((x) => x.name === rank) >= i;
              return (
                <div
                  key={r.name}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-center text-sm",
                    r.name === rank
                      ? "border-primary bg-primary/10 font-bold text-primary"
                      : reached
                        ? "border-success/40 bg-success/5"
                        : "border-border opacity-60",
                  )}
                >
                  {r.name}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span>
              Level {lp.level} · <strong>{rank}</strong>
            </span>
            <span className="text-muted-foreground">
              {lp.into}/{lp.span} XP to Lv {lp.level + 1}
            </span>
          </div>
          <Progress value={lp.pct} className="mt-1" />
        </CardContent>
      </Card>

      {/* Badges */}
      <h2 className="mb-3 text-lg font-bold">
        Badges <span className="text-muted-foreground">({game.badges.length}/{ALL_BADGES.length})</span>
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_BADGES.map((b) => {
          const earned = game.badges.includes(b.id);
          const Icon = BADGE_ICONS[b.icon] ?? Award;
          return (
            <Card key={b.id} className={cn(!earned && "opacity-55")}>
              <CardContent className="flex items-center gap-3 p-4">
                <span
                  className={cn(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                    earned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold">
                    {b.title}
                    {earned && <Badge tone="success">earned</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">{b.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
