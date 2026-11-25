// =============================================================================
// The five foundational worlds + their modules. World 1 is fully authored
// (lessons-learn.ts); Worlds 2–5 ship as navigable skeletons with one real
// starter lesson each, to be expanded in Phase B.
// =============================================================================

import type { Lesson, World } from "@/lib/types";
import { learnLessons } from "./lessons-learn";

// A reusable starter lesson for the skeleton worlds — real, substantive content
// so nothing is a dead stub, just not the full module yet.
function starter(
  id: string,
  worldId: World["id"],
  moduleId: string,
  title: string,
  objective: string,
  hook: string,
  explanation: string,
  point: string,
): Lesson {
  return {
    id,
    worldId,
    moduleId,
    title,
    objective,
    estMinutes: 8,
    hook,
    explanation,
    examples: [{ title: "In practice", body: point }],
    exercises: [
      {
        id: `${id}-ex1`,
        kind: "explain",
        prompt: `In your own words, ${objective[0].toLowerCase()}${objective.slice(1)} Give a concrete example.`,
        rubric: {
          criteria: [
            { id: "idea", label: "Core idea", description: "States the main idea.", weight: 1 },
            { id: "example", label: "Concrete example", description: "Includes a specific example.", keywords: ["example", "e.g", "such as", "like", "imagine"], weight: 1 },
          ],
        },
        explanation: "Explaining it yourself is retrieval + elaboration.",
        cognitiveLevel: "explanation",
        difficulty: 2,
      },
    ],
    summary: [objective, point],
    teaches: [id],
  };
}

export const skeletonLessons: Lesson[] = [
  starter(
    "L2-questions",
    "research",
    "research-foundations",
    "Asking a Researchable Question",
    "Turn a vague curiosity into a precise, answerable research question.",
    "'Is social media bad?' vs. 'Does daily social-media use over 3 hours correlate with reported anxiety in teenagers?' Which can you actually investigate — and why?",
    "A good research question is **specific, answerable, and scoped**. It names what you're studying, for whom, and what relationship or outcome you care about. Vague questions can't be answered or falsified; precise ones tell you exactly what evidence to seek. Start by writing what you already know, what you don't, and what would count as an answer.",
    "Rewrite a broad topic ('AI and jobs') into a precise question with a population, a variable, and a measurable outcome.",
  ),
  starter(
    "L3-thesis",
    "write",
    "write-foundations",
    "Writing to Think: The Thesis",
    "Write clearly by first finding the single point you're trying to make.",
    "If you can't state your point in one sentence, your reader won't find it either. What's the one thing you want them to believe after reading?",
    "Writing is thinking made visible. A strong piece has a **thesis** — one clear, contestable claim — and every paragraph earns its place by supporting it. Before drafting, write your thesis in a single sentence. If you can't, you haven't finished thinking yet. Clarity on the page follows clarity in the head.",
    "Take something you believe and compress it to one contestable sentence; then list three reasons that support it.",
  ),
  starter(
    "L4-active-reading",
    "read",
    "read-foundations",
    "Active Reading & Inspectional Reading",
    "Read with questions in mind and preview a text before diving in.",
    "You read a whole page and realized you absorbed nothing. The problem usually isn't focus — it's that you read passively, with no questions driving you.",
    "**Inspectional reading** means surveying a text first — title, headings, intro, conclusion — to build a map before reading closely. Then read **actively**: pose questions, predict answers, and after each section, look away and summarize from memory. Reading is a conversation with the author, not a transfer of ink into eyes.",
    "Preview an article's structure in 2 minutes, write one question you expect it to answer, then read to answer it.",
  ),
  starter(
    "L5-first-principles",
    "think",
    "think-foundations",
    "First-Principles Thinking",
    "Break a problem down to what you know is fundamentally true, then reason up.",
    "Everyone 'knows' it has to be done a certain way. First-principles thinkers ask: what's actually, fundamentally true here — and what follows from only that?",
    "**First-principles thinking** strips away assumptions and analogies ('this is how it's always done') down to foundational truths, then rebuilds a solution from them. It's how you escape inherited constraints and reason about genuinely new problems. Ask repeatedly: *how do I know this? what must be true? what follows?*",
    "Pick a 'rule' you follow and trace it to its root assumptions; decide if the rule still holds when you rebuild from those roots.",
  ),
];

export const worlds: World[] = [
  {
    id: "learn",
    order: 1,
    title: "Learning How to Learn",
    tagline: "The meta-skill under every other skill.",
    description:
      "How memory and attention work, and the evidence-based techniques — retrieval, spacing, interleaving, elaboration, metacognition — that make learning efficient and durable.",
    color: "world-learn",
    modules: [
      {
        id: "science-of-learning",
        worldId: "learn",
        title: "The Science of Learning",
        summary:
          "Six lessons on how learning actually works and the techniques that follow from it.",
        lessonIds: learnLessons.map((l) => l.id),
        bossId: "boss-learn-1",
      },
    ],
  },
  {
    id: "research",
    order: 2,
    title: "Learning How to Research",
    tagline: "Investigate any question with rigor.",
    description:
      "Formulate questions, find and evaluate sources, distinguish evidence from opinion, synthesize findings, and produce honest, source-grounded conclusions.",
    color: "world-research",
    modules: [
      {
        id: "research-foundations",
        worldId: "research",
        title: "Research Foundations",
        summary: "Starter module (expanding in Phase B).",
        lessonIds: ["L2-questions"],
      },
    ],
  },
  {
    id: "write",
    order: 3,
    title: "Learning How to Write",
    tagline: "Writing is thinking.",
    description:
      "Use writing to sharpen thought: theses, structure, argument, revision, and communicating complex ideas simply and to different audiences.",
    color: "world-write",
    modules: [
      {
        id: "write-foundations",
        worldId: "write",
        title: "Writing Foundations",
        summary: "Starter module (expanding in Phase B).",
        lessonIds: ["L3-thesis"],
      },
    ],
  },
  {
    id: "read",
    order: 4,
    title: "Learning How to Read",
    tagline: "Extract understanding, not just words.",
    description:
      "Active, inspectional, analytical, and syntopical reading; finding arguments and evidence; annotating; and synthesizing multiple authors.",
    color: "world-read",
    modules: [
      {
        id: "read-foundations",
        worldId: "read",
        title: "Reading Foundations",
        summary: "Starter module (expanding in Phase B).",
        lessonIds: ["L4-active-reading"],
      },
    ],
  },
  {
    id: "think",
    order: 5,
    title: "Learning How to Think & Solve Problems",
    tagline: "Reason systematically about anything.",
    description:
      "Critical, logical, first-principles, systems, and probabilistic thinking; decomposition, inversion, the scientific method, and the cognitive biases that derail us.",
    color: "world-think",
    modules: [
      {
        id: "think-foundations",
        worldId: "think",
        title: "Thinking Foundations",
        summary: "Starter module (expanding in Phase B).",
        lessonIds: ["L5-first-principles"],
      },
    ],
  },
];
