// =============================================================================
// LocalAdapter — deterministic, offline "AI". Everything it returns is tagged
// source:"demo" so the UI can label it honestly. It never claims exhaustive
// coverage and always emits an explicit scope statement.
// =============================================================================

import {
  type AIAdapter,
  type DiagnosticQuestion,
  type RubricScore,
  type TutorContext,
  type TutorReply,
} from "./adapter";
import type {
  ConceptNode,
  Difficulty,
  Exercise,
  Lesson,
  Rubric,
  Subject,
  TopicRequest,
} from "@/lib/types";
import { hashString, normalize, pick, seeded, titleCase, uid } from "@/lib/utils";

// A generic mastery scaffold applied to ANY topic. Each phase becomes a
// subfield; concepts are instantiated with the topic woven in.
const SCAFFOLD: { subfield: string; concepts: string[]; difficulty: Difficulty }[] = [
  {
    subfield: "Foundations & Vocabulary",
    difficulty: 1,
    concepts: [
      "What {T} is and why it matters",
      "Core terminology of {T}",
      "The big picture: how the parts of {T} fit together",
    ],
  },
  {
    subfield: "Core Principles",
    difficulty: 2,
    concepts: [
      "Foundational principles of {T}",
      "Key theories and frameworks in {T}",
      "Common misconceptions in {T}",
    ],
  },
  {
    subfield: "Methods & Practical Skills",
    difficulty: 3,
    concepts: [
      "Essential methods used in {T}",
      "Working through a {T} problem end to end",
      "Tools and techniques practitioners of {T} rely on",
    ],
  },
  {
    subfield: "Application & Analysis",
    difficulty: 4,
    concepts: [
      "Applying {T} to real-world situations",
      "Analyzing and evaluating {T} work critically",
      "Case studies in {T}",
    ],
  },
  {
    subfield: "Advanced Topics & Frontiers",
    difficulty: 5,
    concepts: [
      "Advanced topics in {T}",
      "Open questions and research frontiers in {T}",
      "Synthesizing {T} with adjacent fields",
    ],
  },
];

function fill(t: string, topic: string) {
  return t.replace(/\{T\}/g, topic);
}

export class LocalAdapter implements AIAdapter {
  readonly id = "demo" as const;

  async generateCurriculum(req: TopicRequest): Promise<Subject> {
    const topic = req.topic.trim() || "your subject";
    const titleTopic = titleCase(topic);
    const subjectId = uid("subj_");

    // Depth trims/extends the scaffold.
    const depthPhases =
      req.depth === "overview" ? 3 : req.depth === "working" ? 4 : 5;
    const phases = SCAFFOLD.slice(0, depthPhases);

    const nodes: ConceptNode[] = [];
    const path: string[] = [];
    let prevId: string | undefined;

    phases.forEach((phase, pi) => {
      phase.concepts.forEach((ctpl, ci) => {
        const id = `${subjectId}_c${pi}_${ci}`;
        const name = fill(ctpl, titleTopic);
        const prereqs = prevId ? [prevId] : [];
        const node: ConceptNode = {
          id,
          subjectId,
          name,
          subfield: phase.subfield,
          description: `${name}. This concept builds ${
            pi === 0 ? "the groundwork" : "on earlier ideas"
          } you need before moving on.`,
          objectives: [
            `Explain ${name.toLowerCase()} in your own words`,
            `Apply it to a concrete ${topic} example`,
            ci === phase.concepts.length - 1
              ? `Connect it to the rest of ${titleTopic}`
              : `Identify a common error related to it`,
          ],
          prerequisites: prereqs,
          related: [],
          difficulty: phase.difficulty,
          importance: ci === 0 ? 3 : pi >= 3 ? 1 : 2,
          resources: genericResources(titleTopic),
          lessonIds: [],
          masteryCriteria: [
            `Correctly explain the idea without hints`,
            `Solve an unseen ${topic} problem that uses it`,
            `Still recall it in a delayed review`,
          ],
        };
        // wire a couple of "related" links for the graph
        if (prevId) node.related.push(prevId);
        nodes.push(node);
        path.push(id);
        prevId = id;
      });
    });

    // lessons are generated lazily by generateLessonsFor() to keep payload small,
    // but we attach at least one lesson id per node so the UI is wired.
    for (const n of nodes) {
      n.lessonIds = [`lesson_${n.id}`];
    }

    return {
      id: subjectId,
      title: titleTopic,
      request: req,
      createdAt: Date.now(),
      source: "demo",
      scopeStatement: buildScope(titleTopic, req),
      subfields: phases.map((p) => p.subfield),
      nodes,
      path,
      misconceptions: [
        `That knowing about ${topic} is the same as being able to do ${topic}.`,
        `That ${topic} can be mastered by memorizing facts rather than practicing.`,
        `That one correct answer means the underlying skill is secure.`,
      ],
      applications: [
        `Use ${topic} to solve a real problem you personally care about`,
        `Explain a ${topic} idea to someone unfamiliar with it`,
        `Build a small project that applies ${topic}`,
      ],
      frontiers: [
        `Where experts in ${topic} still disagree`,
        `Recent developments reshaping ${topic}`,
        `Questions in ${topic} that remain unresolved`,
      ],
      resources: genericResources(titleTopic),
    };
  }

  /** Generate concrete lesson content for one concept node on demand. */
  generateLessonsFor(node: ConceptNode, topic: string): Lesson[] {
    const rnd = seeded(hashString(node.id));
    const lesson: Lesson = {
      id: `lesson_${node.id}`,
      conceptId: node.id,
      title: node.name,
      objective: node.objectives[0],
      estMinutes: 10,
      hook: `Before we start: in one sentence, what do you already believe about "${node.name.toLowerCase()}"? Hold that thought — we'll test it.`,
      explanation:
        `${node.description}\n\n` +
        `A useful way to think about this: break it into its parts, understand each part, then see how they combine. ` +
        `As you read, try to **predict** what comes next and **explain** each idea to yourself — retrieval and self-explanation are what make it stick, not re-reading.`,
      examples: [
        {
          title: "Worked example",
          body: `Here is ${node.name.toLowerCase()} applied step by step to a typical ${topic} situation. Notice each decision and why it's made — then try to reproduce the reasoning yourself.`,
        },
      ],
      misconception: {
        claim: pick(
          [
            `"If I understood the explanation, I've learned it."`,
            `"I can recognize the right answer, so I know this."`,
          ],
          rnd,
        ),
        reality:
          "Recognition and understanding-in-the-moment are illusions of competence. You only know it once you can retrieve and apply it unaided, later.",
      },
      exercises: genExercises(node, topic),
      summary: [
        `${node.name} — the core idea in one line.`,
        `The main way it's applied in ${topic}.`,
        `One mistake to avoid.`,
      ],
      teaches: [node.id],
      prerequisites: node.prerequisites,
      sources: node.resources,
    };
    return [lesson];
  }

  async tutor(ctx: TutorContext): Promise<TutorReply> {
    return localTutor(ctx);
  }

  async scoreOpenResponse(answer: string, rubric: Rubric): Promise<RubricScore> {
    return heuristicScore(answer, rubric);
  }

  async diagnostic(topic: string): Promise<DiagnosticQuestion[]> {
    const t = titleCase(topic || "the subject");
    return [
      {
        id: uid("dq_"),
        concept: "self-assessment",
        prompt: `How would you rate your current experience with ${t}?`,
        options: ["New to it", "Some exposure", "Comfortable", "Advanced"],
        answerIndex: 0,
      },
      {
        id: uid("dq_"),
        concept: "transfer",
        prompt: `True mastery of ${t} is best shown by…`,
        options: [
          "Finishing all the lessons",
          "Scoring high on multiple-choice quizzes",
          "Solving an unfamiliar problem and explaining your reasoning",
          "Spending many hours studying",
        ],
        answerIndex: 2,
      },
    ];
  }
}

// --- helpers ---------------------------------------------------------------

function buildScope(topic: string, req: TopicRequest): string {
  const depth =
    req.depth === "overview"
      ? "a broad conceptual overview"
      : req.depth === "working"
        ? "working competence (you can apply the core ideas)"
        : req.depth === "deep"
          ? "deep competence (you can reason independently and tackle novel problems)"
          : "expert-level command of the core and its frontiers";
  return (
    `This curriculum targets ${depth} of ${topic}, scoped to its widely-agreed core. ` +
    `It does not claim to cover every subtopic of an evolving field — "mastery" here means ` +
    `meeting the stated competency standard for this scope, demonstrated through unaided ` +
    `explanation, application, retention, and transfer to new problems.`
  );
}

function genericResources(topic: string) {
  return [
    {
      title: `${topic}: a reputable introductory text or course`,
      note: "Replace with a specific source you trust. (Demo mode does not fetch live sources.)",
    },
    {
      title: "Primary sources and peer-reviewed work",
      note: "Prefer primary/peer-reviewed material over summaries when going deep.",
    },
  ];
}

function genExercises(node: ConceptNode, topic: string): Exercise[] {
  const base = node.id;
  const mcq: Exercise = {
    id: `${base}_ex1`,
    kind: "mcq",
    prompt: `Which statement best reflects a correct understanding of "${node.name.toLowerCase()}"?`,
    options: [
      `It is a core idea you can apply to new ${topic} problems.`,
      `It only matters for passing a test.`,
      `It is unrelated to the rest of ${topic}.`,
      `It cannot be explained simply.`,
    ],
    answerIndex: 0,
    optionFeedback: [
      "Correct — usable, transferable understanding is the goal.",
      "Not quite — learning aimed only at tests rarely transfers.",
      "No — concepts connect; isolation is a sign of shallow learning.",
      "No — if you truly understand it, you can explain it simply (the Feynman test).",
    ],
    explanation:
      "Mastery means you can use and explain the idea, not just recognize it.",
    cognitiveLevel: "explanation",
    difficulty: node.difficulty,
    hints: ["Think about what you could DO with this idea, not just recall."],
  };
  const explain: Exercise = {
    id: `${base}_ex2`,
    kind: "explain",
    prompt: `In 2–3 sentences, explain "${node.name.toLowerCase()}" as if teaching a curious beginner. Use a concrete example.`,
    rubric: {
      criteria: [
        {
          id: "clarity",
          label: "Clear & simple",
          description: "Plain language a beginner could follow.",
          keywords: [],
          weight: 1,
        },
        {
          id: "example",
          label: "Concrete example",
          description: "Includes a specific example, not just abstraction.",
          keywords: ["for example", "e.g", "such as", "like", "imagine", "suppose"],
          weight: 1,
        },
        {
          id: "accuracy",
          label: "Core idea present",
          description: `Mentions the central idea of ${node.name.toLowerCase()}.`,
          keywords: node.name.toLowerCase().split(/\s+/).filter((w) => w.length > 4),
          weight: 1,
        },
      ],
      referenceAnswer: `A strong answer states the core idea plainly and grounds it in one concrete ${topic} example.`,
    },
    explanation:
      "Explaining simply (the Feynman technique) exposes gaps that re-reading hides.",
    cognitiveLevel: "explanation",
    difficulty: node.difficulty,
  };
  const apply: Exercise = {
    id: `${base}_ex3`,
    kind: "solve-problem",
    prompt: `Describe how you would use ${node.name.toLowerCase()} to tackle an unfamiliar ${topic} situation of your choosing. Walk through your reasoning.`,
    rubric: {
      criteria: [
        { id: "approach", label: "Sensible approach", description: "A reasonable plan of attack.", weight: 1 },
        { id: "reasoning", label: "Explicit reasoning", description: "Shows the 'why', not just the 'what'.", keywords: ["because", "so that", "therefore", "since"], weight: 1 },
        { id: "transfer", label: "Novel application", description: "Applies the idea to a genuinely new case.", weight: 1 },
      ],
    },
    explanation:
      "Transfer to unseen problems is the real test of understanding.",
    cognitiveLevel: "application",
    difficulty: Math.min(5, node.difficulty + 1) as Difficulty,
  };
  return [mcq, explain, apply];
}

// --- Socratic tutor (scripted, offline) ------------------------------------

function localTutor(ctx: TutorContext): TutorReply {
  const topic = ctx.concept || ctx.subject || "this topic";
  const m = ctx.message.trim();
  const sources = undefined;

  switch (ctx.mode) {
    case "question":
      return {
        source: "demo",
        content:
          `Let's reason it through rather than me just telling you. About ${topic}:\n\n` +
          `• What do you already know that might apply here?\n` +
          `• What exactly is being asked — can you restate it in your own words?\n` +
          `• What would a first small step look like?`,
        followups: ["I'm stuck on the first step", "Give me a hint", "Check my reasoning"],
      };
    case "hint":
      return {
        source: "demo",
        content:
          `Here's a nudge, not the answer: break "${m || topic}" into smaller parts and solve the easiest part first. ` +
          `What's the smallest piece you're confident about?`,
        followups: ["Another hint", "I think I've got it", "Show the approach"],
      };
    case "explain":
      return {
        source: "demo",
        content:
          `Short version about ${topic}: start from first principles — what must be true, and why? ` +
          `A good explanation connects a new idea to something you already understand. ` +
          `Want me to give an analogy, a concrete example, or a step-by-step?`,
        followups: ["Give an analogy", "Give an example", "Step-by-step"],
        uncertain: false,
      };
    case "debate":
      return {
        source: "demo",
        content:
          `I'll take the opposing side so you can sharpen your argument. ` +
          `State your strongest claim about ${topic}, and I'll push back with a counterargument for you to answer.`,
        followups: ["Here's my claim…"],
      };
    case "critique":
      return {
        source: "demo",
        content:
          `Paste your reasoning or writing and I'll point out (1) what's strong, (2) one unclear step, ` +
          `and (3) one assumption worth checking — so you can improve it yourself.`,
      };
    case "assess":
    case "quiz":
      return {
        source: "demo",
        content:
          `Quick check on ${topic}: explain the core idea in one sentence, then give one example where it would fail or not apply. ` +
          `I'll tell you what your answer reveals about your understanding.`,
      };
    case "research":
      return {
        source: "demo",
        content:
          `For researching ${topic}: start by writing a precise question, list what's known vs. unknown, ` +
          `then seek primary and peer-reviewed sources and compare them. ` +
          `I won't invent citations — in demo mode I guide the process rather than fetch sources.`,
        uncertain: true,
      };
    default:
      return {
        source: "demo",
        content:
          `Tell me where you're stuck with ${topic}. I'll guide you toward the answer with questions and hints rather than just handing it over.`,
        followups: ["Explain it", "Quiz me", "Give a hint"],
      };
  }
}

// --- Rubric-based heuristic scoring (transparent) --------------------------

export function heuristicScore(answer: string, rubric: Rubric): RubricScore {
  const text = normalize(answer);
  const words = text.split(" ").filter(Boolean);
  const perCriterion = rubric.criteria.map((c) => {
    let met = false;
    let note = "";
    const kws = (c.keywords ?? []).map(normalize).filter(Boolean);
    if (kws.length > 0) {
      met = kws.some((k) => text.includes(k));
      note = met
        ? `Addressed (${c.label.toLowerCase()}).`
        : `Not clearly addressed — ${c.description}`;
    } else {
      // No keywords: fall back to a length/effort heuristic, stated plainly.
      met = words.length >= 12;
      note = met
        ? `Enough detail to plausibly cover "${c.label.toLowerCase()}" — self-check against the reference.`
        : `Seems brief for "${c.label.toLowerCase()}". Add more detail.`;
    }
    return { criterionId: c.id, met, note };
  });

  const totalW = rubric.criteria.reduce((s, c) => s + c.weight, 0) || 1;
  const gotW = rubric.criteria.reduce(
    (s, c, i) => s + (perCriterion[i].met ? c.weight : 0),
    0,
  );
  const overall = gotW / totalW;

  const empty = words.length < 3;
  return {
    overall: empty ? 0 : overall,
    perCriterion,
    source: "demo",
    heuristic: true,
    feedback: empty
      ? "No substantive answer detected. Try writing out your thinking."
      : `Heuristic score ${Math.round(overall * 100)}%. This is a transparent keyword/length check, not a judgment of correctness — compare your answer with the reference and the criteria below, and grade yourself honestly.`,
  };
}

export const localAdapter = new LocalAdapter();
