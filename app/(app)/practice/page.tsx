"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Dumbbell, Shuffle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, Select } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { ExercisePlayer, type ExerciseResult } from "@/components/exercises/exercise-player";
import { useStore } from "@/lib/store/store";
import { foundationalLessons, getLessonsForConcept, sampleSubjects } from "@/lib/content";
import type { AssessmentEvent, Exercise } from "@/lib/types";
import { uid } from "@/lib/utils";

interface PoolItem {
  exercise: Exercise;
  nodeId: string;
  label: string;
}

export default function PracticePage() {
  const subjects = useStore((s) => s.subjects);
  const recordEvents = useStore((s) => s.recordEvents);

  const [scope, setScope] = useState<string>("foundations");
  const [current, setCurrent] = useState<PoolItem | null>(null);
  const [streak, setStreak] = useState(0);

  const pool = useMemo<PoolItem[]>(() => {
    const items: PoolItem[] = [];
    if (scope === "foundations") {
      for (const l of foundationalLessons) {
        for (const ex of l.exercises) items.push({ exercise: ex, nodeId: l.teaches[0] ?? l.id, label: l.title });
      }
    } else {
      const subj = [...subjects, ...sampleSubjects].find((s) => s.id === scope);
      if (subj) {
        for (const node of subj.nodes) {
          const lessons = getLessonsForConcept(node, subj.title);
          for (const l of lessons) for (const ex of l.exercises) items.push({ exercise: ex, nodeId: node.id, label: node.name });
        }
      }
    }
    return items;
  }, [scope, subjects]);

  function next() {
    if (pool.length === 0) return;
    const item = pool[Math.floor(Math.random() * pool.length)];
    // fresh key so component resets
    setCurrent({ ...item, exercise: { ...item.exercise, id: item.exercise.id + "_" + uid() } });
  }

  function onComplete(r: ExerciseResult) {
    if (!current) return;
    const ev: AssessmentEvent = {
      id: uid("ev_"),
      nodeId: current.nodeId,
      at: Date.now(),
      score: r.score,
      cognitiveLevel: current.exercise.cognitiveLevel,
      difficulty: current.exercise.difficulty,
      independence: r.independence,
      dimensions: ["accuracy", "application"],
      kind: "practice",
    };
    recordEvents([ev]);
    setStreak((s) => (r.correct ? s + 1 : 0));
    next();
  }

  return (
    <div>
      <PageHeader
        title="Practice Center"
        subtitle="Interleaved retrieval practice across everything you're learning. Mixing topics is harder — and far more effective."
      />

      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <Select value={scope} onChange={(e) => { setScope(e.target.value); setCurrent(null); setStreak(0); }} className="w-auto">
              <option value="foundations">Foundations</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
              {sampleSubjects
                .filter((s) => !subjects.some((u) => u.id === s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} (sample)
                  </option>
                ))}
            </Select>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <Badge tone="success">
                <CheckCircle2 className="h-3.5 w-3.5" /> {streak} in a row
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">{pool.length} in pool</span>
          </div>
        </CardContent>
      </Card>

      {!current ? (
        pool.length === 0 ? (
          <EmptyState
            title="No exercises in this scope yet"
            body="Add a subject or try the Foundations pool."
            action={
              <Link href="/topics">
                <Button>Add a subject</Button>
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={<Shuffle className="h-8 w-8" />}
            title="Ready to practice"
            body="Exercises are drawn at random (interleaved) from your selected scope."
            action={<Button onClick={next}>Start practicing</Button>}
          />
        )
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {current.label}
            </p>
            <ExercisePlayer key={current.exercise.id} exercise={current.exercise} onComplete={onComplete} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
