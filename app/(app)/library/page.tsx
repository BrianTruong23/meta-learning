"use client";

import { useMemo, useState } from "react";
import { Library, Plus, Trash2, Search, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, Input, Label, Select, Textarea } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";
import { relativeTime } from "@/lib/utils";
import type { KnowledgeNote } from "@/lib/types";

const TYPES: { id: KnowledgeNote["type"]; label: string }[] = [
  { id: "knowledge", label: "Knowledge" },
  { id: "question", label: "Questions" },
  { id: "problem", label: "Problems" },
  { id: "mistake", label: "Mistakes" },
  { id: "mental-model", label: "Mental models" },
  { id: "solution", label: "Solutions" },
  { id: "vocabulary", label: "Vocabulary" },
];

export default function LibraryPage() {
  const notes = useStore((s) => s.notes);
  const upsert = useStore((s) => s.upsertNote);
  const del = useStore((s) => s.deleteNote);

  const [tab, setTab] = useState<KnowledgeNote["type"]>("knowledge");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<KnowledgeNote | null>(null);

  const filtered = useMemo(
    () =>
      notes
        .filter((n) => n.type === tab)
        .filter(
          (n) =>
            !q ||
            n.title.toLowerCase().includes(q.toLowerCase()) ||
            n.body.toLowerCase().includes(q.toLowerCase()) ||
            n.tags.some((t) => t.toLowerCase().includes(q.toLowerCase())),
        )
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [notes, tab, q],
  );

  function newNote() {
    setEditing({
      id: "",
      type: tab,
      title: "",
      body: "",
      tags: [],
      links: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  return (
    <div>
      <PageHeader
        title="Knowledge Library"
        subtitle="Your personal knowledge OS: capture what you learn, your questions, mistakes, and mental models — then connect them."
        action={
          <Button className="gap-2" onClick={newNote}>
            <Plus className="h-4 w-4" /> New entry
          </Button>
        }
      />

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TYPES.map((t) => {
          const count = notes.filter((n) => n.type === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                tab === t.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-2"
              }`}
            >
              {t.label} {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search your library…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {editing && (
        <NoteEditor
          note={editing}
          onCancel={() => setEditing(null)}
          onSave={(n) => {
            upsert(n);
            setEditing(null);
          }}
        />
      )}

      {filtered.length === 0 && !editing ? (
        <EmptyState
          icon={<Library className="h-8 w-8" />}
          title={`No ${TYPES.find((t) => t.id === tab)?.label.toLowerCase()} yet`}
          body="Capture your first entry. Great learners externalize their knowledge."
          action={<Button onClick={newNote}>Add one</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((n) => (
            <Card key={n.id} className="group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold">{n.title || "Untitled"}</h3>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => setEditing(n)} className="text-xs font-semibold text-primary">
                      Edit
                    </button>
                    <button onClick={() => del(n.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-danger" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 line-clamp-4 whitespace-pre-line text-sm text-muted-foreground">{n.body}</p>
                {n.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {n.tags.map((t) => (
                      <Badge key={t} tone="muted">
                        <Tag className="h-3 w-3" /> {t}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-muted-foreground">{relativeTime(n.updatedAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteEditor({
  note,
  onSave,
  onCancel,
}: {
  note: KnowledgeNote;
  onSave: (n: Partial<KnowledgeNote> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [tags, setTags] = useState(note.tags.join(", "));

  return (
    <Card className="mb-4 border-primary/40">
      <CardContent className="space-y-3 p-5">
        <div>
          <Label>Title</Label>
          <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A short, memorable title" />
        </div>
        <div>
          <Label>Content</Label>
          <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write it in your own words…" />
        </div>
        <div>
          <Label>Tags (comma-separated)</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. memory, exam-prep" />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              onSave({
                id: note.id || undefined,
                type: note.type,
                title,
                body,
                tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
              })
            }
          >
            Save
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
