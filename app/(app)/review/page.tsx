"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers, RotateCcw, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";
import { useDueReviews, useUpcomingReviews } from "@/lib/store/selectors";
import { dueLabel } from "@/lib/srs/scheduler";
import type { RecallGrade } from "@/lib/types";

const GRADES: { grade: RecallGrade; label: string; variant: "danger" | "secondary" | "success" | "default"; hint: string }[] = [
  { grade: 0, label: "Again", variant: "danger", hint: "Forgot" },
  { grade: 1, label: "Hard", variant: "secondary", hint: "Barely" },
  { grade: 2, label: "Good", variant: "default", hint: "Recalled" },
  { grade: 3, label: "Easy", variant: "success", hint: "Instant" },
];

export default function ReviewPage() {
  const due = useDueReviews();
  const upcoming = useUpcomingReviews();
  const gradeReview = useStore((s) => s.gradeReview);

  const [flipped, setFlipped] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  const current = due[0];

  function grade(g: RecallGrade) {
    if (!current) return;
    gradeReview(current.id, g);
    setFlipped(false);
    setDoneCount((c) => c + 1);
  }

  return (
    <div>
      <PageHeader
        title="Review"
        subtitle="Spaced retrieval practice — the single highest-leverage habit for durable memory."
      />

      {!current ? (
        <div className="space-y-6">
          <EmptyState
            icon={doneCount > 0 ? <CheckCircle2 className="h-8 w-8 text-success" /> : <Layers className="h-8 w-8" />}
            title={doneCount > 0 ? `All caught up! ${doneCount} reviewed.` : "Nothing due right now"}
            body={
              upcoming.length > 0
                ? `${upcoming.length} item(s) scheduled for later. Come back when they're due, or complete a lesson to add more.`
                : "Complete a lesson to start building your review queue."
            }
            action={
              <Link href={upcoming.length > 0 ? "/academy" : "/academy"}>
                <Button>{upcoming.length > 0 ? "Learn something new" : "Start a lesson"}</Button>
              </Link>
            }
          />
          {upcoming.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Clock className="h-4 w-4 text-muted-foreground" /> Upcoming
                </p>
                <ul className="space-y-2 text-sm">
                  {upcoming.slice(0, 8).map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2">
                      <span className="truncate text-muted-foreground">{r.front}</span>
                      <span className="shrink-0 text-xs">{dueLabel(r.due)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-xl">
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <Badge tone="warning">{due.length} due</Badge>
            <span>{doneCount} done this session</span>
          </div>

          <Card className="min-h-[260px]">
            <CardContent className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {flipped ? "Answer" : "Recall from memory"}
              </p>
              <p className="mt-3 text-xl font-semibold">{current.front}</p>
              {flipped && (
                <>
                  <div className="my-5 h-px w-24 bg-border" />
                  <p className="text-lg text-muted-foreground">{current.back}</p>
                </>
              )}
            </CardContent>
          </Card>

          {!flipped ? (
            <Button className="mt-5 w-full gap-2" onClick={() => setFlipped(true)}>
              <RotateCcw className="h-4 w-4" /> Show answer
            </Button>
          ) : (
            <div className="mt-5">
              <p className="mb-2 text-center text-sm text-muted-foreground">
                How well did you recall it?
              </p>
              <div className="grid grid-cols-4 gap-2">
                {GRADES.map((g) => (
                  <Button key={g.grade} variant={g.variant} onClick={() => grade(g.grade)} className="flex-col gap-0 py-6">
                    <span>{g.label}</span>
                    <span className="text-[10px] font-normal opacity-80">{g.hint}</span>
                  </Button>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Honest grading trains the scheduler. "Again" reschedules it soon; "Easy" pushes it far out.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
