"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Target,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  PartyPopper,
  ArrowRight,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, Progress, EmptyState } from "@/components/ui/misc";
import { ExercisePlayer, type ExerciseResult } from "@/components/exercises/exercise-player";
import { RichText } from "@/components/exercises/katex-text";
import { useStore } from "@/lib/store/store";
import { resolveLesson } from "@/lib/store/selectors";
import { sampleSubjects } from "@/lib/content";
import { uid } from "@/lib/utils";
import type { AssessmentEvent } from "@/lib/types";
import { ALL_BADGES } from "@/lib/game/progression";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const userSubjects = useStore((s) => s.subjects);
  const completeLesson = useStore((s) => s.completeLesson);

  const lesson = useMemo(
    () => resolveLesson(id, [...userSubjects, ...sampleSubjects]),
    [id, userSubjects],
  );

  // phase: -1 intro, 0..n-1 exercises, n = summary
  const [phase, setPhase] = useState(-1);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [finished, setFinished] = useState<{
    leveledUp: boolean;
    newBadges: string[];
    xp: number;
  } | null>(null);

  if (!lesson) {
    return (
      <EmptyState
        title="Lesson not found"
        body="This lesson doesn't exist or its subject hasn't been added yet."
        action={
          <Link href="/academy">
            <Button>Back to Foundations</Button>
          </Link>
        }
      />
    );
  }

  const total = lesson.exercises.length;
  const stepTotal = total + 2; // intro + exercises + summary
  const stepNow = phase + 1; // -1→0 ...

  function handleExercise(r: ExerciseResult) {
    const next = [...results, r];
    setResults(next);
    if (phase + 1 < total) setPhase(phase + 1);
    else setPhase(total); // go to summary
  }

  function finish() {
    const now = Date.now();
    const events: AssessmentEvent[] = lesson!.exercises.map((ex, i) => ({
      id: uid("ev_"),
      nodeId: lesson!.teaches[0] ?? lesson!.id,
      at: now,
      score: results[i]?.score ?? 0,
      cognitiveLevel: ex.cognitiveLevel,
      difficulty: ex.difficulty,
      independence: results[i]?.independence ?? 1,
      dimensions:
        ex.cognitiveLevel === "application" || ex.cognitiveLevel === "complex-problem-solving"
          ? ["application", "conceptual"]
          : ["conceptual", "accuracy"],
      kind: "lesson",
    }));
    // Seed spaced-review items from the lesson summary points.
    const reviewSeeds = lesson!.summary.slice(0, 3).map((point, i) => ({
      nodeId: lesson!.teaches[0] ?? lesson!.id,
      front: `${lesson!.title}: key point ${i + 1}`,
      back: point,
      subjectId: lesson!.conceptId ? subjectIdForConcept(lesson!.conceptId) : undefined,
      worldId: lesson!.worldId,
    }));
    const avgXp = Math.round(
      15 + 10 * (events.reduce((a, e) => a + e.score, 0) / Math.max(1, events.length)),
    );
    const res = completeLesson(lesson!.id, events, reviewSeeds);
    setFinished({ ...res, xp: avgXp });
  }

  function subjectIdForConcept(conceptId: string): string | undefined {
    for (const s of [...userSubjects, ...sampleSubjects]) {
      if (s.nodes.some((n) => n.id === conceptId)) return s.id;
    }
    return undefined;
  }

  // ---- Completion screen ----
  if (finished) {
    const score = results.reduce((a, r) => a + r.score, 0) / Math.max(1, results.length);
    return (
      <div className="mx-auto max-w-lg">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-accent p-8 text-center text-white">
            <PartyPopper className="mx-auto h-12 w-12" />
            <h1 className="mt-3 text-2xl font-extrabold">Lesson complete!</h1>
            <p className="mt-1 opacity-90">{lesson.title}</p>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-surface-2 p-4">
                <div className="flex items-center justify-center gap-1 text-2xl font-extrabold text-primary">
                  <Zap className="h-5 w-5" /> +{finished.xp}
                </div>
                <div className="text-xs text-muted-foreground">XP earned</div>
              </div>
              <div className="rounded-xl bg-surface-2 p-4">
                <div className="text-2xl font-extrabold">{Math.round(score * 100)}%</div>
                <div className="text-xs text-muted-foreground">this session</div>
              </div>
            </div>

            {finished.leveledUp && (
              <div className="mt-4 rounded-xl bg-primary/10 p-3 text-center text-sm font-semibold text-primary">
                🎉 You leveled up!
              </div>
            )}
            {finished.newBadges.length > 0 && (
              <div className="mt-3 space-y-1">
                {finished.newBadges.map((b) => {
                  const badge = ALL_BADGES.find((x) => x.id === b);
                  return (
                    <div key={b} className="rounded-xl bg-warning/10 p-2.5 text-center text-sm">
                      🏅 Badge unlocked: <strong>{badge?.title ?? b}</strong>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 rounded-xl border border-border p-4 text-sm">
              <p className="mb-2 font-semibold">What you'll review later (spaced):</p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {lesson.summary.slice(0, 3).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <Button className="flex-1 gap-2" onClick={() => router.push("/review")}>
                Review now <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress header */}
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Progress value={stepNow / stepTotal} />
        <span className="shrink-0 text-xs font-semibold text-muted-foreground">
          {Math.min(stepNow, stepTotal)}/{stepTotal}
        </span>
      </div>

      {/* INTRO */}
      {phase === -1 && (
        <Card>
          <CardContent className="p-6">
            <Badge tone="primary" className="mb-3">
              <Target className="h-3.5 w-3.5" /> Objective
            </Badge>
            <h1 className="text-2xl font-extrabold">{lesson.title}</h1>
            <p className="mt-1 text-muted-foreground">{lesson.objective}</p>

            <div className="mt-5 rounded-xl border-l-4 border-primary bg-primary/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Lightbulb className="h-4 w-4" /> Think about this
              </p>
              <p className="mt-1 text-sm">
                <RichText text={lesson.hook} />
              </p>
            </div>

            <div className="lesson-prose mt-5 text-[15px]">
              <RichText text={lesson.explanation} />
            </div>

            {lesson.examples.length > 0 && (
              <div className="mt-5 space-y-3">
                {lesson.examples.map((ex, i) => (
                  <div key={i} className="rounded-xl bg-surface-2 p-4">
                    <p className="flex items-center gap-2 text-sm font-bold">
                      <BookOpen className="h-4 w-4 text-accent" /> {ex.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <RichText text={ex.body} />
                    </p>
                  </div>
                ))}
              </div>
            )}

            {lesson.misconception && (
              <div className="mt-5 rounded-xl border border-danger/30 bg-danger/5 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-danger">
                  <AlertTriangle className="h-4 w-4" /> Common misconception
                </p>
                <p className="mt-1 text-sm italic">“{lesson.misconception.claim}”</p>
                <p className="mt-1.5 text-sm">
                  <strong>Reality:</strong> {lesson.misconception.reality}
                </p>
              </div>
            )}

            <Button className="mt-6 w-full gap-2" onClick={() => setPhase(0)}>
              Start exercises <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* EXERCISES */}
      {phase >= 0 && phase < total && (
        <Card>
          <CardContent className="p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Exercise {phase + 1} of {total}
            </p>
            <ExercisePlayer
              key={lesson.exercises[phase].id}
              exercise={lesson.exercises[phase]}
              onComplete={handleExercise}
            />
          </CardContent>
        </Card>
      )}

      {/* SUMMARY */}
      {phase === total && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold">Summary</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Lock in the key points — these go into your spaced review schedule.
            </p>
            <ul className="mt-4 space-y-2">
              {lesson.summary.map((s, i) => (
                <li key={i} className="flex items-start gap-2 rounded-xl bg-surface-2 p-3 text-sm">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <RichText text={s} />
                </li>
              ))}
            </ul>

            {lesson.sources && lesson.sources.length > 0 && (
              <details className="mt-5 rounded-xl border border-border p-3 text-sm">
                <summary className="cursor-pointer font-semibold">Sources</summary>
                <ul className="mt-2 space-y-1.5 text-muted-foreground">
                  {lesson.sources.map((s, i) => (
                    <li key={i}>
                      {s.authors && `${s.authors} `}
                      {s.year && `(${s.year}). `}
                      <em>{s.title}</em>
                      {s.note && ` — ${s.note}`}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <Button className="mt-6 w-full gap-2" onClick={finish}>
              Complete lesson <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
