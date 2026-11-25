// =============================================================================
// ClaudeAdapter — thin client that calls our own server route (/api/ai).
// The API key lives ONLY on the server (app/api/ai/route.ts); this file never
// sees it. Every method falls back to the LocalAdapter if the call fails, so
// the app degrades gracefully.
// =============================================================================

import {
  type AIAdapter,
  type DiagnosticQuestion,
  type RubricScore,
  type TutorContext,
  type TutorReply,
} from "./adapter";
import type { Rubric, Subject, TopicRequest } from "@/lib/types";
import { localAdapter } from "./local";

async function call<T>(action: string, payload: unknown): Promise<T> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  if (!res.ok) throw new Error(`AI route ${res.status}`);
  return (await res.json()) as T;
}

export class ClaudeAdapter implements AIAdapter {
  readonly id = "ai" as const;

  async generateCurriculum(req: TopicRequest): Promise<Subject> {
    try {
      return await call<Subject>("generateCurriculum", req);
    } catch {
      return localAdapter.generateCurriculum(req);
    }
  }
  async tutor(ctx: TutorContext): Promise<TutorReply> {
    try {
      return await call<TutorReply>("tutor", ctx);
    } catch {
      return localAdapter.tutor(ctx);
    }
  }
  async scoreOpenResponse(answer: string, rubric: Rubric): Promise<RubricScore> {
    try {
      return await call<RubricScore>("scoreOpenResponse", { answer, rubric });
    } catch {
      return localAdapter.scoreOpenResponse(answer, rubric);
    }
  }
  async diagnostic(topic: string): Promise<DiagnosticQuestion[]> {
    try {
      return await call<DiagnosticQuestion[]>("diagnostic", { topic });
    } catch {
      return localAdapter.diagnostic(topic);
    }
  }
}

export const claudeAdapter = new ClaudeAdapter();
