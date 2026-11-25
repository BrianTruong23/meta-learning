"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Target, X, Play, ListChecks, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, Progress } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { SkillTree } from "@/components/graph/skill-tree";
import { useStore } from "@/lib/store/store";
import { useSubjectMastery } from "@/lib/store/selectors";
import { sampleSubjects } from "@/lib/content";
import { estimateMastery, statusLabel } from "@/lib/mastery/engine";
import type { ConceptNode } from "@/lib/types";

export default function SubjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const userSubjects = useStore((s) => s.subjects);
  const knowledge = useStore((s) => s.knowledge);
  const setActive = useStore((s) => s.setActiveSubject);

  const subject = useMemo(
    () => userSubjects.find((s) => s.id === id) ?? sampleSubjects.find((s) => s.id === id),
    [userSubjects, id],
  );

  const [selected, setSelected] = useState<ConceptNode | null>(null);
  const mastery = useSubjectMastery(subject ?? null);

  if (!subject) {
    return (
      <EmptyState
        title="Subject not found"
        action={
          <Link href="/topics">
            <Button>Browse topics</Button>
          </Link>
        }
      />
    );
  }

  const est = selected ? estimateMastery(knowledge[selected.id]?.events ?? []) : null;

  return (
    <div>
      <PageHeader
        title={subject.title}
        subtitle={subject.scopeStatement}
        action={
          <Button variant="secondary" onClick={() => setActive(subject.id)}>
            Set as active
          </Button>
        }
      />

      {/* overall progress */}
      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="min-w-[180px] flex-1">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Overall progress</span>
              <span className="font-semibold">{Math.round(mastery.avg * 100)}%</span>
            </div>
            <Progress value={mastery.avg} />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(mastery.counts).map(([status, n]) => (
              <Badge key={status} tone={status === "mastered" || status === "proficient" ? "success" : status === "undiscovered" ? "muted" : "primary"}>
                {statusLabel(status as any)}: {n}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SkillTree subject={subject} onSelect={setSelected} selectedId={selected?.id} />
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" /> Click any concept to see details and study it. Columns
            are subfields; arrows are prerequisites.
          </p>
        </div>

        {/* Detail panel */}
        <div>
          {selected ? (
            <Card className="sticky top-20">
              <CardContent className="p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold">{selected.name}</h3>
                  <button onClick={() => setSelected(null)} aria-label="Close">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge tone="primary">{selected.subfield}</Badge>
                  <Badge tone="muted">Difficulty {"★".repeat(selected.difficulty)}</Badge>
                  <Badge tone={est?.status === "mastered" ? "success" : "muted"}>
                    {statusLabel(est?.status ?? "undiscovered")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selected.description}</p>

                {est && (
                  <div className="mt-3 rounded-xl bg-surface-2 p-3 text-xs">
                    <p className="font-semibold">Mastery</p>
                    <p className="mt-1 text-muted-foreground">{est.rationale}</p>
                  </div>
                )}

                <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold">
                  <Target className="h-4 w-4 text-primary" /> Objectives
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {selected.objectives.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>

                <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold">
                  <ListChecks className="h-4 w-4 text-success" /> Mastery criteria
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {selected.masteryCriteria.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>

                <Button
                  className="mt-5 w-full gap-2"
                  onClick={() => router.push(`/lesson/${selected.lessonIds[0]}`)}
                >
                  <Play className="h-4 w-4" /> Study this concept
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-5">
                <p className="flex items-center gap-2 font-semibold">
                  <BookOpen className="h-4 w-4 text-primary" /> About this curriculum
                </p>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground">Common misconceptions</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      {subject.misconceptions.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Research frontiers</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      {subject.frontiers.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
