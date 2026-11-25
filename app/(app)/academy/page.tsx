"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Lock, Swords, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { worlds, foundationalLessons } from "@/lib/content";
import { useStore } from "@/lib/store/store";
import { cn } from "@/lib/utils";

export default function AcademyPage() {
  const completed = useStore((s) => s.completedLessons);
  const defeated = useStore((s) => s.defeatedBosses);

  return (
    <div>
      <PageHeader
        title="Foundational Academy"
        subtitle="Five worlds that teach the universal skills under every subject. Start with Learning How to Learn."
      />

      <div className="space-y-5">
        {worlds.map((world) => {
          const allLessonIds = world.modules.flatMap((m) => m.lessonIds);
          const done = allLessonIds.filter((id) => completed.includes(id)).length;
          const pct = allLessonIds.length ? done / allLessonIds.length : 0;
          return (
            <Card key={world.id} className="overflow-hidden">
              <div
                className="h-1.5 w-full"
                style={{ background: `hsl(var(--${world.color}))` }}
              />
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold text-white"
                      style={{ background: `hsl(var(--${world.color}))` }}
                    >
                      {world.order}
                    </span>
                    <div>
                      <h2 className="text-lg font-bold">{world.title}</h2>
                      <p className="text-sm text-muted-foreground">{world.tagline}</p>
                    </div>
                  </div>
                  <div className="min-w-[140px] text-right">
                    <span className="text-sm font-semibold">{Math.round(pct * 100)}%</span>
                    <Progress value={pct} className="mt-1" />
                  </div>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">{world.description}</p>

                <div className="mt-4 space-y-4">
                  {world.modules.map((mod) => (
                    <div key={mod.id}>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        {mod.title}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {mod.lessonIds.map((lid) => {
                          const lesson = foundationalLessons.find((l) => l.id === lid);
                          if (!lesson) return null;
                          const isDone = completed.includes(lid);
                          return (
                            <Link key={lid} href={`/lesson/${lid}`}>
                              <div
                                className={cn(
                                  "flex items-center gap-3 rounded-xl border p-3 text-sm transition-colors hover:bg-surface-2",
                                  isDone ? "border-success/30 bg-success/5" : "border-border",
                                )}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                                ) : (
                                  <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium">{lesson.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {lesson.estMinutes} min
                                  </p>
                                </div>
                                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {mod.bossId && (
                        <Link href={`/exams?boss=${mod.bossId}`}>
                          <div
                            className={cn(
                              "mt-2 flex items-center gap-3 rounded-xl border p-3 text-sm transition-colors hover:bg-surface-2",
                              defeated.includes(mod.bossId)
                                ? "border-success/40 bg-success/5"
                                : done < mod.lessonIds.length
                                  ? "border-dashed border-border opacity-80"
                                  : "border-primary/40 bg-primary/5",
                            )}
                          >
                            {done < mod.lessonIds.length && !defeated.includes(mod.bossId) ? (
                              <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
                            ) : (
                              <Swords className="h-5 w-5 shrink-0 text-primary" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold">Boss Battle</p>
                              <p className="text-xs text-muted-foreground">
                                {defeated.includes(mod.bossId)
                                  ? "Defeated — retry anytime"
                                  : done < mod.lessonIds.length
                                    ? "Finish the lessons to unlock"
                                    : "Ready — prove your mastery"}
                              </p>
                            </div>
                            {defeated.includes(mod.bossId) && <Badge tone="success">Cleared</Badge>}
                          </div>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
