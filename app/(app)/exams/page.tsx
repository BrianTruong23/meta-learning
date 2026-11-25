"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Swords, Trophy, RotateCcw, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, Progress } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { ExercisePlayer, type ExerciseResult } from "@/components/exercises/exercise-player";
import { bosses, worlds } from "@/lib/content";
import { useStore } from "@/lib/store/store";
import { uid } from "@/lib/utils";
import type { AssessmentEvent } from "@/lib/types";

export default function ExamsPage() {
  return (
    <Suspense fallback={null}>
      <ExamsInner />
    </Suspense>
  );
}

function ExamsInner() {
  const sp = useSearchParams();
  const requested = sp.get("boss");
  const completed = useStore((s) => s.completedLessons);
  const defeated = useStore((s) => s.defeatedBosses);
  const defeatBoss = useStore((s) => s.defeatBoss);
  const recordEvents = useStore((s) => s.recordEvents);

  const [activeBossId, setActiveBossId] = useState<string | null>(requested);
  const [i, setI] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [finished, setFinished] = useState<{ passed: boolean; score: number } | null>(null);

  const boss = useMemo(() => bosses.find((b) => b.id === activeBossId) ?? null, [activeBossId]);

  function start(id: string) {
    setActiveBossId(id);
    setI(0);
    setResults([]);
    setFinished(null);
  }

  function onComplete(r: ExerciseResult) {
    if (!boss) return;
    const next = [...results, r];
    setResults(next);
    if (i + 1 < boss.exercises.length) {
      setI(i + 1);
    } else {
      const score = next.reduce((a, x) => a + x.score, 0) / next.length;
      const passed = score >= boss.passThreshold;
      // record exam evidence (high weight, independent)
      const now = Date.now();
      const events: AssessmentEvent[] = boss.exercises.map((ex, idx) => ({
        id: uid("ev_"),
        nodeId: boss.worldId ? `L1-${ex.id}` : ex.id,
        at: now,
        score: next[idx]?.score ?? 0,
        cognitiveLevel: ex.cognitiveLevel,
        difficulty: ex.difficulty,
        independence: 1,
        dimensions: ["conceptual", "transfer", "problemSolving", "independence"],
        kind: "exam",
      }));
      recordEvents(events);
      if (passed) defeatBoss(boss.id);
      setFinished({ passed, score });
    }
  }

  // ---- Boss list ----
  if (!boss) {
    return (
      <div>
        <PageHeader
          title="Boss Battles"
          subtitle="Comprehensive mastery exams. No hints. Unlimited retries after you review. Passing demands broad, independent success — not luck."
        />
        <div className="space-y-3">
          {bosses.map((b) => {
            const world = worlds.find((w) => w.id === b.worldId);
            const lessonIds = world?.modules.flatMap((m) => m.lessonIds) ?? [];
            const ready = lessonIds.every((id) => completed.includes(id));
            const won = defeated.includes(b.id);
            return (
              <Card key={b.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                      {won ? <Trophy className="h-5 w-5" /> : <Swords className="h-5 w-5" />}
                    </span>
                    <div>
                      <p className="font-bold">{b.title}</p>
                      <p className="max-w-xl text-sm text-muted-foreground">{b.intro}</p>
                      <div className="mt-1 flex gap-2">
                        <Badge tone="muted">{b.exercises.length} challenges</Badge>
                        <Badge tone="muted">pass ≥ {Math.round(b.passThreshold * 100)}%</Badge>
                        {won && <Badge tone="success">cleared</Badge>}
                      </div>
                    </div>
                  </div>
                  <div>
                    {ready || won ? (
                      <Button onClick={() => start(b.id)}>{won ? "Retry" : "Begin"}</Button>
                    ) : (
                      <div className="text-right text-xs text-muted-foreground">
                        <ShieldAlert className="ml-auto mb-1 h-4 w-4" />
                        Finish the module's lessons first
                        <br />
                        <Link href="/academy" className="font-semibold text-primary">
                          Go to lessons →
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ---- Result ----
  if (finished) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="overflow-hidden">
          <div
            className={`p-8 text-center text-white ${finished.passed ? "bg-gradient-to-br from-success to-accent" : "bg-gradient-to-br from-[hsl(var(--warning))] to-danger"}`}
          >
            {finished.passed ? <Trophy className="mx-auto h-12 w-12" /> : <RotateCcw className="mx-auto h-12 w-12" />}
            <h1 className="mt-3 text-2xl font-extrabold">
              {finished.passed ? "Victory!" : "Not yet — regroup"}
            </h1>
            <p className="mt-1 opacity-90">
              You scored {Math.round(finished.score * 100)}% (needed{" "}
              {Math.round(boss.passThreshold * 100)}%)
            </p>
          </div>
          <CardContent className="p-6">
            {finished.passed ? (
              <p className="text-sm text-muted-foreground">
                Strong, broad, independent performance — that's real mastery. This counts as
                high-quality evidence toward your mastery estimate.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  No penalty — this is how learning works. Review the weak spots below, then retry.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {boss.remediation.map((r) => (
                    <Link key={r.reviewLessonId} href={`/lesson/${r.reviewLessonId}`}>
                      <Badge tone="warning">Review: {r.reviewLessonId}</Badge>
                    </Link>
                  ))}
                </div>
              </>
            )}
            <div className="mt-6 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setActiveBossId(null)}>
                All battles
              </Button>
              <Button className="flex-1 gap-2" onClick={() => start(boss.id)}>
                <RotateCcw className="h-4 w-4" /> Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- In battle ----
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        <Progress value={i / boss.exercises.length} />
        <span className="shrink-0 text-xs font-semibold text-muted-foreground">
          {i + 1}/{boss.exercises.length}
        </span>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="mb-4 flex items-center gap-2 text-sm font-bold text-primary">
            <Swords className="h-4 w-4" /> {boss.title}
          </p>
          <ExercisePlayer
            key={boss.exercises[i].id}
            exercise={{ ...boss.exercises[i], hints: undefined }}
            onComplete={onComplete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
