"use client";

import { useState } from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, Label, Textarea } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { ExercisePlayer } from "@/components/exercises/exercise-player";
import type { Exercise } from "@/lib/types";

const PASSAGE = {
  title: "On the illusion of explanatory depth",
  body: `Most people feel they understand how everyday things work — zippers, flush toilets, bicycles — far better than they actually do. When asked to explain the mechanism step by step, their confidence collapses. Psychologists call this the "illusion of explanatory depth": we mistake familiarity for understanding.

The illusion matters beyond trivia. It shapes how we reason about complex issues, where a feeling of understanding can substitute for the real thing. The cure is diagnostic: attempting a complete, causal explanation reveals exactly where understanding thins out. This is why explaining something — to a student, a rubber duck, or yourself — is such a powerful learning tool. It converts a vague sense of "I get it" into the concrete test of "can I actually produce the steps?"

Notably, the illusion shrinks for facts (which we're better calibrated about) and grows for causal, mechanistic knowledge. It also shrinks after people try and fail to explain — a humbling but productive experience that makes them more open to other viewpoints.`,
  note: "Adapted from the research tradition of Rozenblit & Keil (2002), 'The misunderstood limits of folk science: an illusion of explanatory depth.'",
};

const COMPREHENSION: Exercise[] = [
  {
    id: "read-c1",
    kind: "mcq",
    prompt: "According to the passage, the 'illusion of explanatory depth' is strongest for…",
    options: [
      "simple facts we can recall",
      "causal, mechanistic knowledge of how things work",
      "things we've never encountered",
      "opinions about politics",
    ],
    answerIndex: 1,
    optionFeedback: [
      "No — the passage says the illusion shrinks for facts.",
      "Correct — it grows for causal/mechanistic understanding.",
      "No — it's about familiar things we assume we understand.",
      "The passage doesn't single this out.",
    ],
    explanation: "The illusion grows for mechanistic 'how' knowledge and shrinks for facts.",
    cognitiveLevel: "analysis",
    difficulty: 3,
  },
  {
    id: "read-c2",
    kind: "identify-mistake",
    prompt: "A reader concludes: 'Since I feel I understand how a bicycle works, I definitely do.' Explain why the passage says this reasoning is flawed.",
    stimulus: "'I feel I understand it, therefore I understand it.'",
    rubric: {
      criteria: [
        { id: "illusion", label: "Names the illusion", description: "Identifies familiarity ≠ understanding.", keywords: ["illusion", "familiar", "feel", "depth"], weight: 1 },
        { id: "test", label: "Proposes the test", description: "Suggests trying to explain the mechanism.", keywords: ["explain", "steps", "mechanism", "produce"], weight: 1 },
      ],
    },
    explanation: "The feeling of understanding is exactly what the illusion produces; the test is a full causal explanation.",
    cognitiveLevel: "evaluation",
    difficulty: 4,
  },
];

export default function ReadPage() {
  const [stage, setStage] = useState<"preview" | "read" | "recall" | "check">("preview");
  const [question, setQuestion] = useState("");
  const [recall, setRecall] = useState("");
  const [cIndex, setCIndex] = useState(0);

  return (
    <div>
      <PageHeader
        title="Reading Lab"
        subtitle="Active, analytical reading: preview, pose a question, read, recall from memory, then check comprehension."
      />

      {/* Stage indicator */}
      <div className="mb-5 flex flex-wrap gap-2">
        {(["preview", "read", "recall", "check"] as const).map((s, i) => (
          <Badge key={s} tone={stage === s ? "primary" : "muted"}>
            {i + 1}. {s === "preview" ? "Preview" : s === "read" ? "Read actively" : s === "recall" ? "Recall" : "Comprehension"}
          </Badge>
        ))}
      </div>

      {stage === "preview" && (
        <Card>
          <CardContent className="p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <BookOpen className="h-5 w-5 text-primary" /> {PASSAGE.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Before reading, inspect the title. What question do you expect this text to answer?
              Posing a question primes active reading.
            </p>
            <Label className="mt-4">Your guiding question</Label>
            <Textarea
              rows={2}
              placeholder="e.g. Why do people overestimate their understanding?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Button className="mt-4 gap-2" onClick={() => setStage("read")} disabled={!question.trim()}>
              Read the passage <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {stage === "read" && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-3 rounded-xl bg-primary/5 p-3 text-sm">
              <span className="font-semibold text-primary">Keep in mind:</span> {question}
            </div>
            <h2 className="text-lg font-bold">{PASSAGE.title}</h2>
            <div className="lesson-prose mt-2 whitespace-pre-line text-[15px]">{PASSAGE.body}</div>
            <p className="mt-3 text-xs text-muted-foreground">{PASSAGE.note}</p>
            <Button className="mt-4 gap-2" onClick={() => setStage("recall")}>
              I've read it — recall from memory <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {stage === "recall" && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold">Summarize from memory</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Without scrolling back, write the passage's central argument and one supporting
              point. This retrieval is where the learning happens.
            </p>
            <Textarea
              className="mt-4"
              rows={5}
              placeholder="The main argument was…"
              value={recall}
              onChange={(e) => setRecall(e.target.value)}
            />
            <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm">
              <details>
                <summary className="cursor-pointer font-semibold">Compare with the passage</summary>
                <p className="mt-2 whitespace-pre-line text-muted-foreground">{PASSAGE.body}</p>
              </details>
            </div>
            <Button className="mt-4 gap-2" onClick={() => setStage("check")} disabled={recall.trim().length < 10}>
              Check comprehension <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {stage === "check" && (
        <Card>
          <CardContent className="p-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Comprehension {cIndex + 1} of {COMPREHENSION.length}
            </p>
            {cIndex < COMPREHENSION.length ? (
              <ExercisePlayer
                key={COMPREHENSION[cIndex].id}
                exercise={COMPREHENSION[cIndex]}
                onComplete={() => setCIndex((i) => i + 1)}
              />
            ) : (
              <div className="text-center">
                <p className="text-lg font-bold">Nice work.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  You previewed, read with a question, recalled from memory, and tested comprehension —
                  the full active-reading loop.
                </p>
                <Button className="mt-4" onClick={() => { setStage("preview"); setCIndex(0); setQuestion(""); setRecall(""); }}>
                  Restart
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
