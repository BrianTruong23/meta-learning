"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/misc";
import { useStore } from "@/lib/store/store";
import { useHydrated } from "@/lib/store/hooks";
import { cn, uid } from "@/lib/utils";
import type { AssessmentEvent, WorldId } from "@/lib/types";

interface DQ {
  world: WorldId;
  concept: string;
  prompt: string;
  options: string[];
  answer: number;
  why: string;
}

const QUESTIONS: DQ[] = [
  {
    world: "learn",
    concept: "retrieval",
    prompt: "Which study method tends to produce the strongest long-term memory?",
    options: ["Re-reading notes repeatedly", "Highlighting key sentences", "Testing yourself from memory", "Listening to a recording while relaxing"],
    answer: 2,
    why: "Retrieval practice (self-testing) beats passive review — the testing effect.",
  },
  {
    world: "learn",
    concept: "spacing",
    prompt: "You have 4 hours to study for a test in two weeks. What's most effective?",
    options: ["Cram all 4 hours the night before", "Spread the 4 hours across many days", "Study 4 hours today, then nothing", "Only review the morning of the test"],
    answer: 1,
    why: "Distributed (spaced) practice beats massed practice for durable retention.",
  },
  {
    world: "read",
    concept: "active-reading",
    prompt: "The best first step when tackling a difficult article is to…",
    options: ["Read every word slowly from the start", "Preview its structure and form a question", "Memorize the first paragraph", "Translate it to simpler words line by line"],
    answer: 1,
    why: "Inspectional reading (previewing + posing a question) builds a map first.",
  },
  {
    world: "think",
    concept: "first-principles",
    prompt: "First-principles thinking means…",
    options: ["Doing what's always been done", "Copying the best competitor", "Reasoning up from fundamental truths", "Trusting your first instinct"],
    answer: 2,
    why: "It strips assumptions down to what must be true, then rebuilds.",
  },
  {
    world: "research",
    concept: "evidence",
    prompt: "Which is the strongest signal of a credible source?",
    options: ["It confirms what you already believe", "It's the top search result", "It cites primary, peer-reviewed evidence transparently", "It's written confidently"],
    answer: 2,
    why: "Credibility rests on transparent, verifiable evidence — not confidence or ranking.",
  },
];

export default function Diagnostic() {
  const router = useRouter();
  const hydrated = useHydrated();
  const profile = useStore((s) => s.profile);
  const updateProfile = useStore((s) => s.updateProfile);
  const recordEvents = useStore((s) => s.recordEvents);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (hydrated && !profile) router.replace("/onboarding");
  }, [hydrated, profile, router]);

  const q = QUESTIONS[i];
  const placement = useMemo(() => {
    const byWorld: Partial<Record<WorldId, { got: number; n: number }>> = {};
    QUESTIONS.forEach((qq, idx) => {
      const slot = (byWorld[qq.world] ??= { got: 0, n: 0 });
      slot.n += 1;
      if (answers[idx]) slot.got += 1;
    });
    const out: Partial<Record<WorldId, number>> = {};
    for (const [w, v] of Object.entries(byWorld)) out[w as WorldId] = v.got / v.n;
    return out;
  }, [answers]);

  function submit() {
    if (picked === null) return;
    const correct = picked === q.answer;
    const next = [...answers];
    next[i] = correct;
    setAnswers(next);
  }

  function advance() {
    if (i + 1 < QUESTIONS.length) {
      setI(i + 1);
      setPicked(null);
    } else {
      // record diagnostic evidence + placement
      const now = Date.now();
      const events: AssessmentEvent[] = QUESTIONS.map((qq, idx) => ({
        id: uid("ev_"),
        nodeId: qq.world === "learn" ? `L1-${qq.concept}` : `L-${qq.world}`,
        at: now,
        score: answers[idx] ? 1 : 0,
        cognitiveLevel: "recognition",
        difficulty: 2,
        independence: 1,
        dimensions: ["coverage"],
        kind: "diagnostic",
      }));
      recordEvents(events);
      updateProfile({ foundationsPlacement: placement });
      setDone(true);
    }
  }

  if (!hydrated || !profile) {
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>
    );
  }

  if (done) {
    const score = answers.filter(Boolean).length;
    return (
      <div className="grid min-h-screen place-items-center px-5">
        <Card className="w-full max-w-lg p-7 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-success/15 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">Placement complete</h1>
          <p className="mt-1 text-muted-foreground">
            You answered {score} of {QUESTIONS.length} correctly. This is just a starting map —
            your real progress comes from demonstrated mastery, not this quiz.
          </p>
          <div className="mt-5 space-y-2 text-left">
            {Object.entries(placement).map(([w, v]) => (
              <div key={w} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm font-semibold capitalize">{w}</span>
                <Progress value={v} />
                <span className="w-10 text-right text-xs text-muted-foreground">
                  {Math.round(v * 100)}%
                </span>
              </div>
            ))}
          </div>
          <Button className="mt-7 w-full gap-2" onClick={() => router.push("/dashboard")}>
            Go to your dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    );
  }

  const answered = answers[i] !== undefined;

  return (
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" /> Diagnostic placement
        </div>
        <Progress value={(i + (answered ? 1 : 0)) / QUESTIONS.length} className="mb-5" />
        <Card className="p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Question {i + 1} of {QUESTIONS.length}
          </p>
          <h2 className="mt-2 text-xl font-bold">{q.prompt}</h2>
          <div className="mt-5 space-y-2.5">
            {q.options.map((opt, idx) => {
              const isPicked = picked === idx;
              const showCorrect = answered && idx === q.answer;
              const showWrong = answered && isPicked && idx !== q.answer;
              return (
                <button
                  key={idx}
                  disabled={answered}
                  onClick={() => setPicked(idx)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                    showCorrect && "border-success bg-success/10",
                    showWrong && "border-danger bg-danger/10",
                    !answered && isPicked && "border-primary bg-primary/10",
                    !answered && !isPicked && "border-border hover:bg-surface-2",
                    answered && !showCorrect && !showWrong && "border-border opacity-60",
                  )}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">
              <span className="font-semibold">
                {answers[i] ? "Correct. " : "Not quite. "}
              </span>
              {q.why}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            {!answered ? (
              <Button onClick={submit} disabled={picked === null}>
                Check answer
              </Button>
            ) : (
              <Button onClick={advance} className="gap-2">
                {i + 1 < QUESTIONS.length ? "Next" : "See results"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
