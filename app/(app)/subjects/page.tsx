"use client";

import Link from "next/link";
import { Network, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, Progress } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";
import { useSubjectMastery } from "@/lib/store/selectors";
import type { Subject } from "@/lib/types";

export default function SubjectsIndex() {
  const subjects = useStore((s) => s.subjects);

  return (
    <div>
      <PageHeader
        title="Knowledge Skill Trees"
        subtitle="Each subject is an interactive graph of concepts — see what you know, what you don't, and what's next."
        action={
          <Link href="/topics">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New subject
            </Button>
          </Link>
        }
      />
      {subjects.length === 0 ? (
        <EmptyState
          icon={<Network className="h-8 w-8" />}
          title="No subjects yet"
          body="Generate a curriculum or add a ready-made one to see its skill tree."
          action={
            <Link href="/topics">
              <Button>Master a topic</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {subjects.map((s) => (
            <SubjectCard key={s.id} subject={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectCard({ subject }: { subject: Subject }) {
  const mastery = useSubjectMastery(subject);
  return (
    <Link href={`/subjects/${subject.id}`}>
      <Card className="transition-shadow hover:shadow-card-hover">
        <CardContent className="p-5">
          <h3 className="text-lg font-bold">{subject.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {subject.nodes.length} concepts · {subject.subfields.length} subfields
          </p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{Math.round(mastery.avg * 100)}%</span>
          </div>
          <Progress value={mastery.avg} className="mt-1" />
        </CardContent>
      </Card>
    </Link>
  );
}
