// =============================================================================
// Mastery — core domain types
// =============================================================================
// These types model the whole learning domain: the knowledge graph
// (Domain → Subfield → Topic → Concept → Skill → Objective → Lesson → Exercise
// → Assessment), the spaced-repetition scheduler, the evidence-based mastery
// engine, and the gamification layer. Game XP is deliberately modelled
// separately from demonstrated mastery (see lib/game vs lib/mastery).
// =============================================================================

// ---------------------------------------------------------------------------
// Knowledge status — the lifecycle of a single concept/skill node.
// Ordered from least to most developed. Mastery is EARNED via evidence, never
// assigned by time spent or lessons clicked.
// ---------------------------------------------------------------------------
export const KNOWLEDGE_STATUSES = [
  "undiscovered",
  "discovered",
  "learning",
  "understood",
  "practiced",
  "proficient",
  "mastered",
  "needs-review",
] as const;
export type KnowledgeStatus = (typeof KNOWLEDGE_STATUSES)[number];

// ---------------------------------------------------------------------------
// Ranks (gamification progression, 8 tiers). Separate from mastery.
// ---------------------------------------------------------------------------
export const RANKS = [
  "Novice",
  "Apprentice",
  "Practitioner",
  "Proficient",
  "Advanced",
  "Specialist",
  "Expert",
  "Master",
] as const;
export type Rank = (typeof RANKS)[number];

// ---------------------------------------------------------------------------
// The five foundational worlds.
// ---------------------------------------------------------------------------
export type WorldId = "learn" | "research" | "write" | "read" | "think";

export interface World {
  id: WorldId;
  order: number;
  title: string;
  tagline: string;
  description: string;
  color: string; // css var token name, e.g. "world-learn"
  modules: Module[];
}

export interface Module {
  id: string;
  worldId: WorldId;
  title: string;
  summary: string;
  lessonIds: string[];
  /** A capstone / boss battle for this module, optional. */
  bossId?: string;
}

// ---------------------------------------------------------------------------
// Difficulty & cognitive level (Bloom-inspired). Used by exercises, problems,
// and the mastery engine to weight evidence.
// ---------------------------------------------------------------------------
export const COGNITIVE_LEVELS = [
  "recognition",
  "recall",
  "explanation",
  "application",
  "analysis",
  "evaluation",
  "complex-problem-solving",
  "novel-problem-solving",
  "open-ended-investigation",
] as const;
export type CognitiveLevel = (typeof COGNITIVE_LEVELS)[number];

export type Difficulty = 1 | 2 | 3 | 4 | 5;

// ---------------------------------------------------------------------------
// Exercises — a discriminated union. <ExercisePlayer> dispatches on `kind`.
// ---------------------------------------------------------------------------
export type ExerciseKind =
  | "mcq"
  | "multi-select"
  | "fill-blank"
  | "matching"
  | "ordering"
  | "free-response"
  | "explain"
  | "identify-mistake"
  | "compare-contrast"
  | "construct-argument"
  | "evaluate-source"
  | "predict-outcome"
  | "solve-problem"
  | "code";

interface ExerciseBase {
  id: string;
  kind: ExerciseKind;
  prompt: string;
  /** Short note shown after answering, regardless of correctness. */
  explanation: string;
  cognitiveLevel: CognitiveLevel;
  difficulty: Difficulty;
  /** Optional hint ladder — revealed one at a time. */
  hints?: string[];
  /** KaTeX is rendered inside prompts/options when wrapped in $...$ */
}

export interface McqExercise extends ExerciseBase {
  kind: "mcq";
  options: string[];
  answerIndex: number;
  /** Per-option explanatory feedback (why each is right/wrong). */
  optionFeedback?: string[];
}

export interface MultiSelectExercise extends ExerciseBase {
  kind: "multi-select";
  options: string[];
  answerIndices: number[];
}

export interface FillBlankExercise extends ExerciseBase {
  kind: "fill-blank";
  /** Text with `___` marking each blank. */
  text: string;
  answers: string[]; // one per blank; accepts case-insensitive match + aliases
  aliases?: string[][];
}

export interface MatchingExercise extends ExerciseBase {
  kind: "matching";
  left: string[];
  right: string[];
  /** correct[i] = index into `right` that matches left[i]. */
  correct: number[];
}

export interface OrderingExercise extends ExerciseBase {
  kind: "ordering";
  items: string[];
  /** The correct order as indices into `items`. */
  correctOrder: number[];
}

/** Open-ended families share a rubric for transparent, limited self-grading. */
export interface Rubric {
  criteria: RubricCriterion[];
  /** Model/reference answer shown after submission (not auto-graded against). */
  referenceAnswer?: string;
}
export interface RubricCriterion {
  id: string;
  label: string;
  description: string;
  /** Keywords/phrases that, if present, suggest the criterion was addressed.
   *  Used only as a heuristic in demo mode and always surfaced transparently. */
  keywords?: string[];
  weight: number;
}

export interface OpenResponseExercise extends ExerciseBase {
  kind:
    | "free-response"
    | "explain"
    | "identify-mistake"
    | "compare-contrast"
    | "construct-argument"
    | "evaluate-source"
    | "predict-outcome"
    | "solve-problem";
  rubric: Rubric;
  /** For identify-mistake / evaluate-source: the stimulus the learner reacts to. */
  stimulus?: string;
}

export interface CodeExercise extends ExerciseBase {
  kind: "code";
  language: "javascript";
  starter: string;
  /** Test cases run in a sandboxed worker-like eval. */
  tests: { call: string; expected: unknown; description: string }[];
}

export type Exercise =
  | McqExercise
  | MultiSelectExercise
  | FillBlankExercise
  | MatchingExercise
  | OrderingExercise
  | OpenResponseExercise
  | CodeExercise;

// ---------------------------------------------------------------------------
// Lessons — the 10-part interactive structure (spec §9).
// ---------------------------------------------------------------------------
export interface Lesson {
  id: string;
  /** Owning node: a module (foundational) or a concept (subject curriculum). */
  worldId?: WorldId;
  moduleId?: string;
  conceptId?: string;
  title: string;
  objective: string;
  estMinutes: number;
  /** 1. curiosity / diagnostic hook */
  hook: string;
  /** 2. concise conceptual explanation (markdown-ish, supports $katex$). */
  explanation: string;
  /** 3. concrete worked examples. */
  examples: { title: string; body: string }[];
  /** A common misconception to directly challenge. */
  misconception?: { claim: string; reality: string };
  /** Interactive exercises (mix of types — never all MCQ). */
  exercises: Exercise[];
  /** Key points for the end-of-lesson summary + what gets scheduled for review. */
  summary: string[];
  /** Concepts/skills this lesson develops (for mastery + graph wiring). */
  teaches: string[]; // node ids
  prerequisites?: string[]; // node ids
  /** Citations for any factual claims (no fabricated sources — demo uses real refs). */
  sources?: Source[];
}

export interface Source {
  title: string;
  authors?: string;
  year?: number;
  url?: string;
  note?: string;
}

// ---------------------------------------------------------------------------
// Knowledge-graph nodes for a SUBJECT (topic X) curriculum.
// ---------------------------------------------------------------------------
export interface Subject {
  id: string;
  title: string;
  /** User's request that generated it (intake). */
  request: TopicRequest;
  createdAt: number;
  source: "demo" | "ai"; // provenance of generation
  scopeStatement: string; // explicit scope + competency standard (spec §6)
  subfields: string[];
  nodes: ConceptNode[];
  /** Ordered concept ids forming the recommended path. */
  path: string[];
  misconceptions: string[];
  applications: string[];
  frontiers: string[]; // unresolved questions / research frontiers
  resources: Source[];
}

export interface ConceptNode {
  id: string;
  subjectId: string;
  name: string;
  subfield: string;
  description: string;
  objectives: string[];
  prerequisites: string[]; // node ids
  related: string[]; // node ids
  difficulty: Difficulty;
  importance: 1 | 2 | 3; // 3 = core
  resources: Source[];
  lessonIds: string[];
  /** Mastery criteria in plain language (spec §6.18). */
  masteryCriteria: string[];
}

export interface TopicRequest {
  topic: string;
  existingKnowledge: "none" | "beginner" | "intermediate" | "advanced";
  objectives: string;
  depth: "overview" | "working" | "deep" | "expert";
  weeklyMinutes: number;
  applications?: string;
  targetProjects?: string;
  materials?: string;
}

// ---------------------------------------------------------------------------
// Mastery evidence & records (consumed by lib/mastery/engine.ts).
// ---------------------------------------------------------------------------
export const MASTERY_DIMENSIONS = [
  "coverage",
  "accuracy",
  "conceptual",
  "retention",
  "application",
  "problemSolving",
  "transfer",
  "independence",
  "calibration",
] as const;
export type MasteryDimension = (typeof MASTERY_DIMENSIONS)[number];

export interface AssessmentEvent {
  id: string;
  nodeId: string; // concept/skill/module id
  at: number;
  /** 0..1 correctness/quality of the response. */
  score: number;
  cognitiveLevel: CognitiveLevel;
  difficulty: Difficulty;
  /** 0..1 how independent the attempt was (1 = no hints/scaffolding). */
  independence: number;
  /** Which dimensions this event provides evidence for. */
  dimensions: MasteryDimension[];
  /** Learner's self-reported confidence before answering, 0..1 (calibration). */
  confidence?: number;
  kind: "lesson" | "practice" | "review" | "exam" | "diagnostic" | "project";
}

export interface NodeKnowledge {
  nodeId: string;
  status: KnowledgeStatus;
  events: AssessmentEvent[];
  firstSeen: number;
  lastSeen: number;
}

// ---------------------------------------------------------------------------
// Spaced repetition (SM-2 variant) — see lib/srs/scheduler.ts.
// ---------------------------------------------------------------------------
export interface ReviewItem {
  id: string;
  /** What is being reviewed. */
  nodeId: string;
  front: string;
  back: string;
  subjectId?: string;
  worldId?: WorldId;
  // SM-2 state
  ease: number; // easiness factor
  intervalDays: number;
  repetitions: number;
  due: number; // epoch ms
  lastReviewed?: number;
  lapses: number;
  createdAt: number;
  source: "lesson" | "manual" | "mistake";
}

/** Recall grade used to drive the scheduler. */
export type RecallGrade = 0 | 1 | 2 | 3; // again, hard, good, easy

// ---------------------------------------------------------------------------
// Gamification state (lib/game/progression.ts).
// ---------------------------------------------------------------------------
export interface GameState {
  xp: number;
  level: number;
  rank: Rank;
  streakDays: number;
  lastActiveDay?: string; // yyyy-mm-dd
  longestStreak: number;
  badges: string[]; // badge ids earned
  quests: Quest[];
  freezeTokens: number; // streak protection; breaks are not punished
}

export interface Quest {
  id: string;
  kind: "daily" | "weekly";
  label: string;
  target: number;
  progress: number;
  xp: number;
  metric: "lessons" | "reviews" | "practice" | "minutes" | "xp";
  issuedDay: string; // yyyy-mm-dd (daily) or iso-week (weekly)
  claimed: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// ---------------------------------------------------------------------------
// Personal Knowledge OS banks (spec §12).
// ---------------------------------------------------------------------------
export interface KnowledgeNote {
  id: string;
  type:
    | "knowledge"
    | "question"
    | "problem"
    | "mistake"
    | "mental-model"
    | "solution"
    | "vocabulary";
  title: string;
  body: string;
  tags: string[];
  links: string[]; // ids of other notes
  createdAt: number;
  updatedAt: number;
  sourceNodeId?: string;
}

// ---------------------------------------------------------------------------
// Research workspace (spec §16).
// ---------------------------------------------------------------------------
export interface ResearchProject {
  id: string;
  question: string;
  plan: string;
  createdAt: number;
  sources: ResearchSource[];
  claims: ResearchClaim[];
  findings: string;
  report: string;
  status: "planning" | "collecting" | "analyzing" | "writing" | "done";
}
export interface ResearchSource {
  id: string;
  title: string;
  kind: "pdf" | "webpage" | "text" | "note";
  origin: string; // url or filename — UNTRUSTED content
  credibility: "unknown" | "low" | "medium" | "high";
  credibilityRationale?: string;
  excerpt?: string;
  fileKey?: string; // IndexedDB key for uploaded blob
}
export interface ResearchClaim {
  id: string;
  text: string;
  sourceIds: string[];
  evidenceType: "evidence" | "opinion" | "hypothesis";
  verified: "yes" | "no" | "unclear";
}

// ---------------------------------------------------------------------------
// Writing & reading labs.
// ---------------------------------------------------------------------------
export interface WritingPiece {
  id: string;
  title: string;
  prompt: string;
  type: "argument" | "explanation" | "summary" | "technical" | "free";
  revisions: { at: number; text: string; wordCount: number }[];
  rubricScores?: { criterionId: string; met: boolean; note: string }[];
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Projects / portfolio.
// ---------------------------------------------------------------------------
export interface PortfolioProject {
  id: string;
  title: string;
  subjectId?: string;
  description: string;
  status: "idea" | "in-progress" | "done";
  artifactLinks: string[];
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Problem-solving arena log (spec §13).
// ---------------------------------------------------------------------------
export interface ProblemAttempt {
  id: string;
  problemId: string;
  definition: string;
  known: string;
  unknown: string;
  assumptions: string;
  hypotheses: string;
  research: string;
  reasoning: string;
  candidateSolutions: string;
  selectedSolution: string;
  testing: string;
  conclusion: string;
  lessonsLearned: string;
  at: number;
}

// ---------------------------------------------------------------------------
// Profile & diagnostic.
// ---------------------------------------------------------------------------
export interface Profile {
  id: string;
  name: string;
  createdAt: number;
  goal?: string;
  dailyMinutes: number;
  foundationsPlacement?: Partial<Record<WorldId, number>>; // 0..1 placement
}
