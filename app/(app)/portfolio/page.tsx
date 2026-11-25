"use client";

import { useState } from "react";
import { FolderKanban, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, Input, Label, Select, Textarea } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";
import { relativeTime } from "@/lib/utils";
import type { PortfolioProject } from "@/lib/types";

const STATUS_TONE: Record<PortfolioProject["status"], "muted" | "warning" | "success"> = {
  idea: "muted",
  "in-progress": "warning",
  done: "success",
};

export default function PortfolioPage() {
  const portfolio = useStore((s) => s.portfolio);
  const subjects = useStore((s) => s.subjects);
  const upsert = useStore((s) => s.upsertPortfolio);
  const [editing, setEditing] = useState<Partial<PortfolioProject> | null>(null);

  return (
    <div>
      <PageHeader
        title="Project Portfolio"
        subtitle="Real projects are where knowledge becomes competence. Capture what you're building and what you learned."
        action={
          <Button className="gap-2" onClick={() => setEditing({ status: "idea" })}>
            <Plus className="h-4 w-4" /> New project
          </Button>
        }
      />

      {editing && (
        <Card className="mb-5 border-primary/40">
          <CardContent className="space-y-3 p-5">
            <div>
              <Label>Title</Label>
              <Input
                autoFocus
                value={editing.title ?? ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="e.g. Build a spam classifier"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="What are you making, and what does it demonstrate?"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Status</Label>
                <Select
                  value={editing.status ?? "idea"}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as PortfolioProject["status"] })}
                >
                  <option value="idea">Idea</option>
                  <option value="in-progress">In progress</option>
                  <option value="done">Done</option>
                </Select>
              </div>
              <div>
                <Label>Related subject</Label>
                <Select
                  value={editing.subjectId ?? ""}
                  onChange={(e) => setEditing({ ...editing, subjectId: e.target.value || undefined })}
                >
                  <option value="">None</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  upsert(editing);
                  setEditing(null);
                }}
                disabled={!editing.title?.trim()}
              >
                Save
              </Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {portfolio.length === 0 && !editing ? (
        <EmptyState
          icon={<FolderKanban className="h-8 w-8" />}
          title="No projects yet"
          body="Turn what you're learning into something you build."
          action={<Button onClick={() => setEditing({ status: "idea" })}>Add your first project</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((p) => (
            <Card key={p.id} className="group flex flex-col">
              <CardContent className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold">{p.title}</h3>
                  <button onClick={() => upsert({ ...p, status: "done" })} className="opacity-0 group-hover:opacity-100" />
                </div>
                <Badge tone={STATUS_TONE[p.status]} className="mt-1 w-fit">
                  {p.status}
                </Badge>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
                {p.subjectId && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {subjects.find((s) => s.id === p.subjectId)?.title}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{relativeTime(p.createdAt)}</span>
                  <button onClick={() => setEditing(p)} className="text-xs font-semibold text-primary">
                    Edit
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
