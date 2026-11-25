"use client";

import { useState } from "react";
import { PenLine, Plus, Sparkles, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, Input, Label, Select, Textarea } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";
import { getAdapter, type RubricScore } from "@/lib/ai";
import { relativeTime } from "@/lib/utils";
import type { WritingPiece, Rubric } from "@/lib/types";

const PROMPTS: Record<WritingPiece["type"], { prompt: string; rubric: Rubric }> = {
  argument: {
    prompt: "Argue for or against: 'Spaced practice should replace cramming in schools.' State a clear thesis, give reasons, and address one counterargument.",
    rubric: {
      criteria: [
        { id: "thesis", label: "Clear thesis", description: "One contestable claim.", keywords: ["should", "argue", "believe", "thesis", "claim"], weight: 1 },
        { id: "reasons", label: "Supporting reasons", description: "At least two grounded reasons.", keywords: ["because", "since", "evidence", "research", "first", "second"], weight: 1 },
        { id: "counter", label: "Addresses counterargument", description: "Acknowledges and answers an objection.", keywords: ["however", "although", "critics", "some argue", "on the other hand", "counter"], weight: 1 },
      ],
      referenceAnswer: "A strong piece opens with a crisp thesis, gives 2–3 evidence-based reasons, then names the strongest objection and rebuts it.",
    },
  },
  explanation: {
    prompt: "Explain the testing effect to a 12-year-old in under 150 words, using one analogy.",
    rubric: {
      criteria: [
        { id: "simple", label: "Age-appropriate", description: "Plain, jargon-free language.", weight: 1 },
        { id: "analogy", label: "Uses an analogy", description: "One concrete comparison.", keywords: ["like", "imagine", "as if", "similar", "think of"], weight: 1 },
        { id: "accurate", label: "Accurate", description: "Captures retrieval strengthening memory.", keywords: ["remember", "recall", "test", "memory", "stronger"], weight: 1 },
      ],
    },
  },
  summary: {
    prompt: "Summarize the key ideas of the 'Learning How to Learn' world in 3–5 sentences.",
    rubric: {
      criteria: [
        { id: "coverage", label: "Covers key ideas", description: "Mentions retrieval, spacing, or interleaving.", keywords: ["retriev", "spac", "interleav", "elaborat", "metacognition"], weight: 2 },
        { id: "concise", label: "Concise", description: "Tight and clear.", weight: 1 },
      ],
    },
  },
  technical: {
    prompt: "Write clear step-by-step instructions for setting up a personal spaced-repetition routine.",
    rubric: {
      criteria: [
        { id: "steps", label: "Ordered steps", description: "Numbered, sequential.", keywords: ["1", "2", "first", "then", "next", "step"], weight: 1 },
        { id: "actionable", label: "Actionable", description: "Concrete, not vague.", weight: 1 },
      ],
    },
  },
  free: {
    prompt: "Write about anything you're learning and want to think through on the page.",
    rubric: {
      criteria: [
        { id: "clarity", label: "Clarity", description: "Readable and coherent.", weight: 1 },
        { id: "depth", label: "Depth of thought", description: "Goes beyond surface.", weight: 1 },
      ],
    },
  },
};

export default function WritePage() {
  const writing = useStore((s) => s.writing);
  const upsert = useStore((s) => s.upsertWriting);
  const [activeId, setActiveId] = useState<string | null>(writing[0]?.id ?? null);

  const active = writing.find((w) => w.id === activeId) ?? null;

  function create(type: WritingPiece["type"]) {
    const p = upsert({ title: `${type} draft`, type, prompt: PROMPTS[type].prompt, revisions: [] });
    setActiveId(p.id);
  }

  return (
    <div>
      <PageHeader
        title="Writing Lab"
        subtitle="Writing is thinking. Draft, get rubric-based feedback, revise, and watch your drafts improve — the AI coaches, it doesn't write for you."
      />

      {writing.length === 0 ? (
        <div>
          <EmptyState
            icon={<PenLine className="h-8 w-8" />}
            title="Start a writing challenge"
            body="Pick a type of writing to practice."
          />
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {(Object.keys(PROMPTS) as WritingPiece["type"][]).map((t) => (
              <Button key={t} variant="secondary" className="gap-1.5 capitalize" onClick={() => create(t)}>
                <Plus className="h-4 w-4" /> {t}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
          <div className="space-y-2">
            {(Object.keys(PROMPTS) as WritingPiece["type"][]).map((t) => (
              <Button key={t} variant="ghost" size="sm" className="w-full justify-start gap-1.5 capitalize" onClick={() => create(t)}>
                <Plus className="h-4 w-4" /> New {t}
              </Button>
            ))}
            <div className="pt-2">
              {writing.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setActiveId(w.id)}
                  className={`mb-1 w-full truncate rounded-xl border p-2.5 text-left text-sm transition-colors ${
                    activeId === w.id ? "border-primary bg-primary/10" : "border-border hover:bg-surface-2"
                  }`}
                >
                  {w.title}
                </button>
              ))}
            </div>
          </div>

          {active && <Editor key={active.id} piece={active} onChange={(p) => upsert({ id: active.id, ...p })} />}
        </div>
      )}
    </div>
  );
}

function Editor({ piece, onChange }: { piece: WritingPiece; onChange: (p: Partial<WritingPiece>) => void }) {
  const latest = piece.revisions[piece.revisions.length - 1]?.text ?? "";
  const [draft, setDraft] = useState(latest);
  const [score, setScore] = useState<RubricScore | null>(null);
  const [busy, setBusy] = useState(false);
  const rubric = PROMPTS[piece.type].rubric;

  async function saveAndScore() {
    setBusy(true);
    const wc = draft.trim().split(/\s+/).filter(Boolean).length;
    onChange({ revisions: [...piece.revisions, { at: Date.now(), text: draft, wordCount: wc }] });
    const adapter = await getAdapter();
    const s = await adapter.scoreOpenResponse(draft, rubric);
    setScore(s);
    onChange({
      rubricScores: s.perCriterion.map((p) => ({
        criterionId: p.criterionId,
        met: p.met,
        note: p.note,
      })),
    });
    setBusy(false);
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-3 p-5">
          <div>
            <Label>Title</Label>
            <Input value={piece.title} onChange={(e) => onChange({ title: e.target.value })} />
          </div>
          <div className="rounded-xl bg-primary/5 p-3 text-sm">
            <span className="font-semibold text-primary">Prompt: </span>
            {piece.prompt}
          </div>
          <div>
            <Label>Your draft (revision {piece.revisions.length + 1})</Label>
            <Textarea rows={10} value={draft} onChange={(e) => setDraft(e.target.value)} />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {draft.trim().split(/\s+/).filter(Boolean).length} words
            </p>
          </div>
          <Button className="gap-2" onClick={saveAndScore} disabled={busy || draft.trim().length < 5}>
            <Sparkles className="h-4 w-4" /> {busy ? "Reviewing…" : "Save & get feedback"}
          </Button>
        </CardContent>
      </Card>

      {/* Rubric feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rubric feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rubric.criteria.map((c) => {
            const pc = score?.perCriterion.find((p) => p.criterionId === c.id);
            return (
              <div key={c.id} className="flex items-start gap-2 text-sm">
                <Badge tone={pc ? (pc.met ? "success" : "warning") : "muted"}>
                  {pc ? (pc.met ? "✓" : "✗") : "—"}
                </Badge>
                <span>
                  <strong>{c.label}</strong> — {c.description}
                  {pc && <span className="block text-xs text-muted-foreground">{pc.note}</span>}
                </span>
              </div>
            );
          })}
          {score?.heuristic && (
            <p className="text-xs text-muted-foreground">
              ⚠ Demo mode: transparent heuristic feedback. Use it as a checklist, then revise and
              re-submit to improve your own writing.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Revision history (before/after) */}
      {piece.revisions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-5 w-5 text-muted-foreground" /> Revision history
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {piece.revisions
              .slice()
              .reverse()
              .map((r, idx) => (
                <details key={r.at} className="rounded-xl border border-border p-3 text-sm">
                  <summary className="cursor-pointer font-semibold">
                    Revision {piece.revisions.length - idx} · {r.wordCount} words · {relativeTime(r.at)}
                  </summary>
                  <p className="mt-2 whitespace-pre-line text-muted-foreground">{r.text}</p>
                </details>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
