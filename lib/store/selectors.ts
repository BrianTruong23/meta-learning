"use client";

import { useMemo } from "react";
import { useStore } from "./store";
import { getDue, getUpcoming } from "@/lib/srs/scheduler";
import { estimateMastery, statusRank } from "@/lib/mastery/engine";
import type { ConceptNode, KnowledgeStatus, Subject } from "@/lib/types";
import {
  foundationalLessons,
  resolveLesson,
  worlds,
} from "@/lib/content";

/** The user's active subject object, if any. */
export function useActiveSubject(): Subject | null {
  const subjects = useStore((s) => s.subjects);
  const activeId = useStore((s) => s.activeSubjectId);
  return useMemo(
    () => subjects.find((s) => s.id === activeId) ?? subjects[0] ?? null,
    [subjects, activeId],
  );
}

export function useDueReviews() {
  const reviews = useStore((s) => s.reviews);
  return useMemo(() => getDue(reviews), [reviews]);
}

export function useUpcomingReviews() {
  const reviews = useStore((s) => s.reviews);
  return useMemo(() => getUpcoming(reviews), [reviews]);
}

/** Status for a node id (undiscovered if no evidence). */
export function nodeStatus(
  knowledge: Record<string, { events: { at: number }[] }>,
  nodeId: string,
): KnowledgeStatus {
  const k = knowledge[nodeId];
  if (!k || k.events.length === 0) return "undiscovered";
  return estimateMastery(k.events as any).status;
}

/** Compute mastery summary across the active subject's nodes. */
export function useSubjectMastery(subject: Subject | null) {
  const knowledge = useStore((s) => s.knowledge);
  return useMemo(() => {
    if (!subject) return { counts: {} as Record<KnowledgeStatus, number>, avg: 0, perNode: [] as { node: ConceptNode; status: KnowledgeStatus; score: number }[] };
    const perNode = subject.nodes.map((node) => {
      const k = knowledge[node.id];
      const est = k ? estimateMastery(k.events) : null;
      return {
        node,
        status: (est?.status ?? "undiscovered") as KnowledgeStatus,
        score: est?.sufficient ? est.score : 0,
      };
    });
    const counts = perNode.reduce(
      (acc, p) => {
        acc[p.status] = (acc[p.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<KnowledgeStatus, number>,
    );
    const avg =
      perNode.reduce((a, p) => a + statusRank(p.status), 0) /
      Math.max(1, perNode.length) /
      6;
    return { counts, avg, perNode };
  }, [subject, knowledge]);
}

/** Weakest + recently mastered concepts across everything the user has touched. */
export function useKnowledgeHighlights() {
  const knowledge = useStore((s) => s.knowledge);
  const subjects = useStore((s) => s.subjects);
  return useMemo(() => {
    const nameOf = (nodeId: string): string => {
      for (const s of subjects) {
        const n = s.nodes.find((x) => x.id === nodeId);
        if (n) return n.name;
      }
      const lesson = foundationalLessons.find((l) => l.id === nodeId);
      return lesson?.title ?? nodeId;
    };
    const entries = Object.values(knowledge)
      .filter((k) => k.events.length > 0)
      .map((k) => {
        const est = estimateMastery(k.events);
        return { nodeId: k.nodeId, name: nameOf(k.nodeId), est, lastSeen: k.lastSeen };
      });
    const weakest = [...entries]
      .filter((e) => e.est.status !== "mastered")
      .sort((a, b) => a.est.score - b.est.score)
      .slice(0, 4);
    const mastered = entries
      .filter((e) => e.est.status === "mastered" || e.est.status === "proficient")
      .sort((a, b) => b.lastSeen - a.lastSeen)
      .slice(0, 4);
    return { weakest, mastered, total: entries.length };
  }, [knowledge, subjects]);
}

/** First foundational lesson the user hasn't completed (for "continue"). */
export function useNextFoundationLesson() {
  const completed = useStore((s) => s.completedLessons);
  return useMemo(() => {
    const ordered = worlds.flatMap((w) =>
      w.modules.flatMap((m) => m.lessonIds),
    );
    const nextId = ordered.find((id) => !completed.includes(id)) ?? ordered[0];
    return foundationalLessons.find((l) => l.id === nextId) ?? null;
  }, [completed]);
}

export { resolveLesson };
