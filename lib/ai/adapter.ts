// =============================================================================
// AI adapter interface.
// =============================================================================
// A single interface so the whole app depends on a capability, not a provider.
//  - LocalAdapter (default): deterministic, offline, labelled "demo".
//  - ClaudeAdapter: calls /api/ai which uses ANTHROPIC_API_KEY server-side.
// The active adapter is chosen at runtime by lib/ai/index.ts based on whether
// the server reports a configured key. Callers never branch on provider.
// =============================================================================

import type {
  Rubric,
  Subject,
  TopicRequest,
} from "@/lib/types";

export type TutorMode =
  | "explain"
  | "teach"
  | "question"
  | "quiz"
  | "research"
  | "debate"
  | "critique"
  | "hint"
  | "problem-solve"
  | "review"
  | "assess";

export interface TutorTurn {
  role: "user" | "tutor";
  content: string;
}

export interface TutorContext {
  mode: TutorMode;
  subject?: string;
  concept?: string;
  history: TutorTurn[];
  message: string;
}

export interface TutorReply {
  content: string;
  /** Socratic follow-ups the UI can offer as chips. */
  followups?: string[];
  source: "demo" | "ai";
  /** Any citations — demo mode uses only real, named references. */
  sources?: { title: string; url?: string }[];
  uncertain?: boolean;
}

export interface RubricScore {
  overall: number; // 0..1
  perCriterion: { criterionId: string; met: boolean; note: string }[];
  feedback: string;
  source: "demo" | "ai";
  /** Always true in demo mode: scoring is heuristic and transparent. */
  heuristic: boolean;
}

export interface DiagnosticQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  concept: string;
}

export interface AIAdapter {
  readonly id: "demo" | "ai";
  generateCurriculum(req: TopicRequest): Promise<Subject>;
  tutor(ctx: TutorContext): Promise<TutorReply>;
  scoreOpenResponse(answer: string, rubric: Rubric): Promise<RubricScore>;
  diagnostic(topic: string): Promise<DiagnosticQuestion[]>;
}
