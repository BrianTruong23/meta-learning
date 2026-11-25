"use client";

import { useState } from "react";
import { Brain, Save, CheckCircle2, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, Label, Textarea } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";
import { relativeTime } from "@/lib/utils";

const PROBLEMS = [
  {
    id: "p-bridge",
    level: "novel-problem-solving",
    title: "The unreliable bridge",
    body: "Four people must cross a rickety bridge at night with one flashlight. The bridge holds at most two at a time, and whoever crosses must carry the flashlight. They walk at different speeds: 1, 2, 7, and 10 minutes. A pair walks at the slower person's pace. What's the minimum total time to get all four across, and why?",
    hint: "The two slowest shouldn't each cross with the fastest. Think about sending the two slowest together.",
  },
  {
    id: "p-estimate",
    level: "open-ended-investigation",
    title: "Fermi estimation",
    body: "Estimate how many piano tuners work in a large city (say, 2 million people). Show your reasoning and assumptions explicitly — the answer matters less than a defensible decomposition.",
    hint: "Decompose: pianos per person → total pianos → tunings per piano per year → tunings one tuner can do per year.",
  },
  {
    id: "p-transfer",
    level: "complex-problem-solving",
    title: "Transfer challenge",
    body: "You learned that spaced, interleaved retrieval improves memory. Design an experiment to test whether the same principles improve a *motor* skill (e.g. basketball free throws). Define variables, control, and what result would support or refute the transfer.",
    hint: "Identify independent (practice schedule) and dependent (performance) variables, a control group, and a delayed test.",
  },
];

const FIELDS: { key: keyof FormState; label: string; placeholder: string }[] = [
  { key: "definition", label: "1. Define the problem", placeholder: "Restate it precisely in your own words." },
  { key: "known", label: "2. What's known", placeholder: "Facts and constraints you're given." },
  { key: "unknown", label: "3. What's unknown", placeholder: "What exactly are you solving for?" },
  { key: "assumptions", label: "4. Assumptions", placeholder: "What are you assuming? Are they justified?" },
  { key: "hypotheses", label: "5. Hypotheses", placeholder: "Candidate ideas or approaches." },
  { key: "reasoning", label: "6. Reasoning", placeholder: "Work through it step by step." },
  { key: "selectedSolution", label: "7. Your solution", placeholder: "State your answer." },
  { key: "testing", label: "8. Test it", placeholder: "How could you check it? Does it hold up?" },
  { key: "lessonsLearned", label: "9. Lessons learned", placeholder: "What will you take to the next problem?" },
];

type FormState = {
  definition: string;
  known: string;
  unknown: string;
  assumptions: string;
  hypotheses: string;
  reasoning: string;
  selectedSolution: string;
  testing: string;
  lessonsLearned: string;
};

const EMPTY: FormState = {
  definition: "",
  known: "",
  unknown: "",
  assumptions: "",
  hypotheses: "",
  reasoning: "",
  selectedSolution: "",
  testing: "",
  lessonsLearned: "",
};

export default function ArenaPage() {
  const problems = useStore((s) => s.problems);
  const addProblemAttempt = useStore((s) => s.addProblemAttempt);

  const [active, setActive] = useState(PROBLEMS[0]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [showHint, setShowHint] = useState(false);
  const [saved, setSaved] = useState(false);

  function save() {
    addProblemAttempt({
      problemId: active.id,
      definition: form.definition,
      known: form.known,
      unknown: form.unknown,
      assumptions: form.assumptions,
      hypotheses: form.hypotheses,
      research: "",
      reasoning: form.reasoning,
      candidateSolutions: form.hypotheses,
      selectedSolution: form.selectedSolution,
      testing: form.testing,
      conclusion: form.selectedSolution,
      lessonsLearned: form.lessonsLearned,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const myAttempts = problems.filter((p) => p.problemId === active.id);

  return (
    <div>
      <PageHeader
        title="Problem-Solving Arena"
        subtitle="Unfamiliar problems that reward reasoning over recall. Document your process — it's graded as much as the answer."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {PROBLEMS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setActive(p);
              setForm(EMPTY);
              setShowHint(false);
            }}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
              active.id === p.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-2"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      <Card className="mb-5">
        <CardContent className="p-5">
          <Badge tone="accent" className="mb-2">
            {active.level.replace(/-/g, " ")}
          </Badge>
          <h2 className="text-lg font-bold">{active.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{active.body}</p>
          <button
            onClick={() => setShowHint((v) => !v)}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
          >
            <Lightbulb className="h-4 w-4" /> {showHint ? "Hide" : "Show"} hint
          </button>
          {showHint && <p className="mt-2 rounded-xl bg-warning/10 p-3 text-sm">{active.hint}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-primary" /> Your reasoning log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Textarea
                rows={f.key === "reasoning" ? 4 : 2}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div className="flex items-center gap-3">
            <Button className="gap-2" onClick={save}>
              <Save className="h-4 w-4" /> Save attempt
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" /> Saved to your problem bank
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {myAttempts.length > 0 && (
        <Card className="mt-5">
          <CardHeader>
            <CardTitle className="text-base">Past attempts ({myAttempts.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {myAttempts
              .slice()
              .reverse()
              .map((a) => (
                <details key={a.id} className="rounded-xl border border-border p-3 text-sm">
                  <summary className="cursor-pointer font-semibold">
                    Attempt · {relativeTime(a.at)}
                  </summary>
                  <p className="mt-2 text-muted-foreground">
                    <strong>Solution:</strong> {a.selectedSolution || "—"}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    <strong>Lessons:</strong> {a.lessonsLearned || "—"}
                  </p>
                </details>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
