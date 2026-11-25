"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Lightbulb, HelpCircle } from "lucide-react";
import type { Exercise, OpenResponseExercise } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge, Textarea } from "@/components/ui/misc";
import { RichText } from "./katex-text";
import { cn, normalize } from "@/lib/utils";
import { getAdapter, type RubricScore } from "@/lib/ai";

export interface ExerciseResult {
  score: number; // 0..1
  independence: number; // 0..1 (1 = no hints used)
  correct: boolean;
}

export function ExercisePlayer({
  exercise,
  onComplete,
}: {
  exercise: Exercise;
  onComplete: (r: ExerciseResult) => void;
}) {
  const [hintsUsed, setHintsUsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);

  const independence = Math.max(0.3, 1 - hintsUsed * 0.25);

  function finish(score: number, correct: boolean) {
    const r = { score, independence, correct };
    setResult(r);
    setSubmitted(true);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="primary">{labelForKind(exercise.kind)}</Badge>
        <Badge tone="muted">{exercise.cognitiveLevel.replace(/-/g, " ")}</Badge>
        <span className="text-xs text-muted-foreground">
          Difficulty {"★".repeat(exercise.difficulty)}
        </span>
      </div>

      <div className="mb-4 text-base font-semibold leading-relaxed">
        <RichText text={exercise.prompt} />
      </div>

      {"stimulus" in exercise && exercise.stimulus && (
        <blockquote className="mb-4 rounded-xl border-l-4 border-primary bg-surface-2 p-3 text-sm italic">
          <RichText text={exercise.stimulus} />
        </blockquote>
      )}

      <ExerciseBody
        exercise={exercise}
        submitted={submitted}
        onGrade={finish}
      />

      {/* Hints */}
      {!submitted && exercise.hints && exercise.hints.length > 0 && (
        <div className="mt-4">
          {hintsUsed < exercise.hints.length ? (
            <button
              onClick={() => setHintsUsed((h) => h + 1)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
            >
              <Lightbulb className="h-4 w-4" /> Show a hint
              {hintsUsed > 0 && ` (${hintsUsed} used)`}
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">No more hints.</span>
          )}
          {hintsUsed > 0 && (
            <ul className="mt-2 space-y-1">
              {exercise.hints.slice(0, hintsUsed).map((h, idx) => (
                <li
                  key={idx}
                  className="rounded-lg bg-warning/10 px-3 py-2 text-sm text-foreground"
                >
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Feedback */}
      {submitted && result && (
        <div
          className={cn(
            "mt-5 rounded-xl border p-4",
            result.correct
              ? "border-success/40 bg-success/10"
              : "border-warning/40 bg-warning/10",
          )}
        >
          <div className="flex items-center gap-2 font-bold">
            {result.correct ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <HelpCircle className="h-5 w-5 text-[hsl(var(--warning))]" />
            )}
            {result.correct ? "Correct" : "Review this"}
            {hintsUsed > 0 && (
              <span className="text-xs font-normal text-muted-foreground">
                · {hintsUsed} hint{hintsUsed > 1 ? "s" : ""} used
              </span>
            )}
          </div>
          <p className="mt-2 text-sm">
            <RichText text={exercise.explanation} />
          </p>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => onComplete(result)}>Continue</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExerciseBody({
  exercise,
  submitted,
  onGrade,
}: {
  exercise: Exercise;
  submitted: boolean;
  onGrade: (score: number, correct: boolean) => void;
}) {
  switch (exercise.kind) {
    case "mcq":
      return <Mcq ex={exercise} submitted={submitted} onGrade={onGrade} />;
    case "multi-select":
      return <MultiSelect ex={exercise} submitted={submitted} onGrade={onGrade} />;
    case "fill-blank":
      return <FillBlank ex={exercise} submitted={submitted} onGrade={onGrade} />;
    case "matching":
      return <Matching ex={exercise} submitted={submitted} onGrade={onGrade} />;
    case "ordering":
      return <Ordering ex={exercise} submitted={submitted} onGrade={onGrade} />;
    case "code":
      return <CodeEx ex={exercise} submitted={submitted} onGrade={onGrade} />;
    default:
      return <OpenResponse ex={exercise} submitted={submitted} onGrade={onGrade} />;
  }
}

function labelForKind(k: Exercise["kind"]): string {
  const map: Record<string, string> = {
    mcq: "Multiple choice",
    "multi-select": "Select all",
    "fill-blank": "Fill in",
    matching: "Match",
    ordering: "Order",
    "free-response": "Free response",
    explain: "Explain",
    "identify-mistake": "Find the mistake",
    "compare-contrast": "Compare",
    "construct-argument": "Argue",
    "evaluate-source": "Evaluate",
    "predict-outcome": "Predict",
    "solve-problem": "Solve",
    code: "Code",
  };
  return map[k] ?? k;
}

// ---- MCQ ------------------------------------------------------------------
function Mcq({
  ex,
  submitted,
  onGrade,
}: {
  ex: Extract<Exercise, { kind: "mcq" }>;
  submitted: boolean;
  onGrade: (s: number, c: boolean) => void;
}) {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div>
      <div className="space-y-2.5">
        {ex.options.map((opt, i) => {
          const isPick = pick === i;
          const correct = submitted && i === ex.answerIndex;
          const wrong = submitted && isPick && i !== ex.answerIndex;
          return (
            <div key={i}>
              <button
                disabled={submitted}
                onClick={() => setPick(i)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                  correct && "border-success bg-success/10",
                  wrong && "border-danger bg-danger/10",
                  !submitted && isPick && "border-primary bg-primary/10",
                  !submitted && !isPick && "border-border hover:bg-surface-2",
                  submitted && !correct && !wrong && "opacity-60",
                )}
              >
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                <RichText text={opt} />
              </button>
              {submitted && ex.optionFeedback?.[i] && (isPick || correct) && (
                <p className="ml-9 mt-1 text-xs text-muted-foreground">
                  {ex.optionFeedback[i]}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {!submitted && (
        <Button
          className="mt-4"
          disabled={pick === null}
          onClick={() => onGrade(pick === ex.answerIndex ? 1 : 0, pick === ex.answerIndex)}
        >
          Check
        </Button>
      )}
    </div>
  );
}

// ---- Multi-select ---------------------------------------------------------
function MultiSelect({
  ex,
  submitted,
  onGrade,
}: {
  ex: Extract<Exercise, { kind: "multi-select" }>;
  submitted: boolean;
  onGrade: (s: number, c: boolean) => void;
}) {
  const [sel, setSel] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setSel((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  const answer = new Set(ex.answerIndices);
  return (
    <div>
      <div className="space-y-2.5">
        {ex.options.map((opt, i) => {
          const isSel = sel.has(i);
          const shouldBe = answer.has(i);
          const correct = submitted && shouldBe;
          const wrong = submitted && isSel && !shouldBe;
          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => toggle(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                correct && "border-success bg-success/10",
                wrong && "border-danger bg-danger/10",
                !submitted && isSel && "border-primary bg-primary/10",
                !submitted && !isSel && "border-border hover:bg-surface-2",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded border",
                  isSel ? "border-primary bg-primary text-primary-foreground" : "border-current",
                )}
              >
                {isSel && "✓"}
              </span>
              <RichText text={opt} />
            </button>
          );
        })}
      </div>
      {!submitted && (
        <Button
          className="mt-4"
          onClick={() => {
            const exact =
              sel.size === answer.size && [...sel].every((i) => answer.has(i));
            const overlap = [...sel].filter((i) => answer.has(i)).length;
            const score = exact ? 1 : Math.max(0, overlap / answer.size - (sel.size - overlap) * 0.25);
            onGrade(Math.min(1, score), exact);
          }}
        >
          Check
        </Button>
      )}
    </div>
  );
}

// ---- Fill blank -----------------------------------------------------------
function FillBlank({
  ex,
  submitted,
  onGrade,
}: {
  ex: Extract<Exercise, { kind: "fill-blank" }>;
  submitted: boolean;
  onGrade: (s: number, c: boolean) => void;
}) {
  const parts = ex.text.split("___");
  const [vals, setVals] = useState<string[]>(() => ex.answers.map(() => ""));
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 text-sm leading-loose">
        {parts.map((p, i) => (
          <span key={i} className="inline-flex items-center gap-1.5">
            <RichText text={p} />
            {i < ex.answers.length && (
              <input
                disabled={submitted}
                value={vals[i]}
                onChange={(e) =>
                  setVals((v) => v.map((x, j) => (j === i ? e.target.value : x)))
                }
                className={cn(
                  "inline-block w-28 rounded-lg border px-2 py-1 text-sm outline-none focus:border-primary",
                  submitted && matchBlank(ex, i, vals[i])
                    ? "border-success bg-success/10"
                    : submitted
                      ? "border-danger bg-danger/10"
                      : "border-input bg-surface",
                )}
              />
            )}
          </span>
        ))}
      </div>
      {submitted && (
        <p className="mt-2 text-xs text-muted-foreground">
          Accepted: {ex.answers.map((a, i) => [a, ...(ex.aliases?.[i] ?? [])].join(" / ")).join("; ")}
        </p>
      )}
      {!submitted && (
        <Button
          className="mt-4"
          onClick={() => {
            const got = ex.answers.filter((_, i) => matchBlank(ex, i, vals[i])).length;
            const score = got / ex.answers.length;
            onGrade(score, score === 1);
          }}
        >
          Check
        </Button>
      )}
    </div>
  );
}
function matchBlank(
  ex: Extract<Exercise, { kind: "fill-blank" }>,
  i: number,
  val: string,
): boolean {
  const accepted = [ex.answers[i], ...(ex.aliases?.[i] ?? [])].map(normalize);
  return accepted.includes(normalize(val));
}

// ---- Matching -------------------------------------------------------------
function Matching({
  ex,
  submitted,
  onGrade,
}: {
  ex: Extract<Exercise, { kind: "matching" }>;
  submitted: boolean;
  onGrade: (s: number, c: boolean) => void;
}) {
  const [choice, setChoice] = useState<(number | null)[]>(() => ex.left.map(() => null));
  return (
    <div>
      <div className="space-y-2.5">
        {ex.left.map((l, i) => {
          const ok = submitted && choice[i] === ex.correct[i];
          return (
            <div
              key={i}
              className={cn(
                "flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center",
                submitted && (ok ? "border-success bg-success/10" : "border-danger bg-danger/10"),
                !submitted && "border-border",
              )}
            >
              <span className="flex-1 text-sm font-medium">
                <RichText text={l} />
              </span>
              <select
                disabled={submitted}
                value={choice[i] ?? ""}
                onChange={(e) =>
                  setChoice((c) =>
                    c.map((x, j) => (j === i ? (e.target.value === "" ? null : Number(e.target.value)) : x)),
                  )
                }
                className="h-10 rounded-lg border border-input bg-surface px-2 text-sm sm:w-64"
              >
                <option value="">Choose…</option>
                {ex.right.map((r, ri) => (
                  <option key={ri} value={ri}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
      {!submitted && (
        <Button
          className="mt-4"
          disabled={choice.some((c) => c === null)}
          onClick={() => {
            const got = ex.correct.filter((c, i) => c === choice[i]).length;
            const score = got / ex.correct.length;
            onGrade(score, score === 1);
          }}
        >
          Check
        </Button>
      )}
    </div>
  );
}

// ---- Ordering -------------------------------------------------------------
function Ordering({
  ex,
  submitted,
  onGrade,
}: {
  ex: Extract<Exercise, { kind: "ordering" }>;
  submitted: boolean;
  onGrade: (s: number, c: boolean) => void;
}) {
  const [order, setOrder] = useState<number[]>(() => ex.items.map((_, i) => i));
  const move = (idx: number, dir: -1 | 1) => {
    const t = idx + dir;
    if (t < 0 || t >= order.length) return;
    const n = [...order];
    [n[idx], n[t]] = [n[t], n[idx]];
    setOrder(n);
  };
  return (
    <div>
      <ul className="space-y-2">
        {order.map((itemIdx, pos) => {
          const ok = submitted && ex.correctOrder[pos] === itemIdx;
          return (
            <li
              key={itemIdx}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm",
                submitted && (ok ? "border-success bg-success/10" : "border-danger bg-danger/10"),
                !submitted && "border-border bg-surface",
              )}
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-xs font-bold">
                {pos + 1}
              </span>
              <span className="flex-1">
                <RichText text={ex.items[itemIdx]} />
              </span>
              {!submitted && (
                <span className="flex flex-col">
                  <button onClick={() => move(pos, -1)} aria-label="Move up" className="px-1 text-muted-foreground hover:text-foreground">
                    ▲
                  </button>
                  <button onClick={() => move(pos, 1)} aria-label="Move down" className="px-1 text-muted-foreground hover:text-foreground">
                    ▼
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {!submitted && (
        <Button
          className="mt-4"
          onClick={() => {
            const got = order.filter((v, i) => ex.correctOrder[i] === v).length;
            const score = got / order.length;
            onGrade(score, score === 1);
          }}
        >
          Check
        </Button>
      )}
    </div>
  );
}

// ---- Open response (rubric-scored) ---------------------------------------
function OpenResponse({
  ex,
  submitted,
  onGrade,
}: {
  ex: OpenResponseExercise;
  submitted: boolean;
  onGrade: (s: number, c: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState<RubricScore | null>(null);

  async function submit() {
    setBusy(true);
    const adapter = await getAdapter();
    const r = await adapter.scoreOpenResponse(text, ex.rubric);
    setScore(r);
    setBusy(false);
    onGrade(r.overall, r.overall >= 0.6);
  }

  return (
    <div>
      <Textarea
        rows={5}
        disabled={submitted}
        placeholder="Write your answer in your own words…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <p className="mt-1 text-right text-xs text-muted-foreground">
        {text.trim().split(/\s+/).filter(Boolean).length} words
      </p>

      {/* Rubric (always visible — transparent grading) */}
      <div className="mt-3 rounded-xl border border-border bg-surface-2 p-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Rubric
        </p>
        <ul className="space-y-1.5">
          {ex.rubric.criteria.map((c) => {
            const pc = score?.perCriterion.find((p) => p.criterionId === c.id);
            return (
              <li key={c.id} className="flex items-start gap-2 text-sm">
                {submitted && pc ? (
                  pc.met ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--warning))]" />
                  )
                ) : (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
                )}
                <span>
                  <span className="font-semibold">{c.label}</span> — {c.description}
                  {submitted && pc && (
                    <span className="block text-xs text-muted-foreground">{pc.note}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {submitted && score && (
        <div className="mt-3 space-y-2">
          <p className="rounded-xl bg-primary/10 p-3 text-sm">{score.feedback}</p>
          {score.heuristic && (
            <p className="text-xs text-muted-foreground">
              ⚠ Demo mode: this is a transparent keyword/length heuristic, not a judgment of
              correctness. Grade yourself honestly against the reference.
            </p>
          )}
          {ex.rubric.referenceAnswer && (
            <details className="rounded-xl border border-border p-3 text-sm">
              <summary className="cursor-pointer font-semibold">Show a reference answer</summary>
              <p className="mt-2 text-muted-foreground">
                <RichText text={ex.rubric.referenceAnswer} />
              </p>
            </details>
          )}
        </div>
      )}

      {!submitted && (
        <Button className="mt-4" disabled={busy || text.trim().length < 2} onClick={submit}>
          {busy ? "Scoring…" : "Submit answer"}
        </Button>
      )}
    </div>
  );
}

// ---- Code (sandboxed JS) --------------------------------------------------
function CodeEx({
  ex,
  submitted,
  onGrade,
}: {
  ex: Extract<Exercise, { kind: "code" }>;
  submitted: boolean;
  onGrade: (s: number, c: boolean) => void;
}) {
  const [code, setCode] = useState(ex.starter);
  const [results, setResults] = useState<{ pass: boolean; desc: string; detail: string }[]>([]);

  function run() {
    const out = ex.tests.map((t) => {
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function(`"use strict";${code};return (${t.call});`);
        const got = fn();
        const pass = JSON.stringify(got) === JSON.stringify(t.expected);
        return {
          pass,
          desc: t.description,
          detail: pass ? "" : `got ${JSON.stringify(got)}, expected ${JSON.stringify(t.expected)}`,
        };
      } catch (e) {
        return { pass: false, desc: t.description, detail: String(e) };
      }
    });
    setResults(out);
    const score = out.filter((r) => r.pass).length / out.length;
    onGrade(score, score === 1);
  }

  return (
    <div>
      <textarea
        disabled={submitted}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={8}
        className="w-full rounded-xl border border-input bg-[hsl(232_28%_9%)] p-3 font-mono text-sm text-[hsl(150_60%_75%)] outline-none focus:border-primary"
      />
      {results.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {results.map((r, i) => (
            <li key={i} className="flex items-center gap-2">
              {r.pass ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <XCircle className="h-4 w-4 text-danger" />
              )}
              <span className="font-mono text-xs">{r.desc}</span>
              {r.detail && <span className="text-xs text-muted-foreground">— {r.detail}</span>}
            </li>
          ))}
        </ul>
      )}
      {!submitted && (
        <Button className="mt-4" onClick={run}>
          Run tests
        </Button>
      )}
    </div>
  );
}
