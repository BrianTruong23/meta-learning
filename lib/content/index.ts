// =============================================================================
// Content aggregation + lookup helpers. The single source of truth for all
// built-in (seeded) content: worlds, lessons, bosses, and sample subjects.
// Subject lessons are produced on demand from concept nodes.
// =============================================================================

import type { ConceptNode, Lesson, Subject, World, WorldId } from "@/lib/types";
import { worlds, skeletonLessons } from "./worlds";
import { learnLessons } from "./lessons-learn";
import { bosses, type BossBattle } from "./boss";
import { sampleSubjects } from "./sample-subjects";
import { localAdapter } from "@/lib/ai/local";

export { worlds, bosses, sampleSubjects };
export type { BossBattle };

/** All authored foundational lessons (World 1 full + skeletons). */
export const foundationalLessons: Lesson[] = [...learnLessons, ...skeletonLessons];

const lessonMap = new Map(foundationalLessons.map((l) => [l.id, l]));
const worldMap = new Map(worlds.map((w) => [w.id, w]));
const bossMap = new Map(bosses.map((b) => [b.id, b]));
const sampleMap = new Map(sampleSubjects.map((s) => [s.id, s]));

export function getWorld(id: WorldId): World | undefined {
  return worldMap.get(id);
}

export function getFoundationalLesson(id: string): Lesson | undefined {
  return lessonMap.get(id);
}

export function getBoss(id: string): BossBattle | undefined {
  return bossMap.get(id);
}

export function getSampleSubject(id: string): Subject | undefined {
  return sampleMap.get(id);
}

/** Find a concept node across a set of subjects (built-in samples + user ones). */
export function findConcept(
  subjects: Subject[],
  nodeId: string,
): { subject: Subject; node: ConceptNode } | undefined {
  for (const s of subjects) {
    const node = s.nodes.find((n) => n.id === nodeId);
    if (node) return { subject: s, node };
  }
  return undefined;
}

/** Produce lesson(s) for a concept node on demand (deterministic). */
export function getLessonsForConcept(node: ConceptNode, topic: string): Lesson[] {
  return localAdapter.generateLessonsFor(node, topic);
}

/** Resolve any lesson id to a Lesson: foundational (authored) or subject
 *  (generated from its concept node). Needs user+sample subjects to resolve
 *  subject lessons. */
export function resolveLesson(
  lessonId: string,
  subjects: Subject[],
): Lesson | undefined {
  const authored = lessonMap.get(lessonId);
  if (authored) return authored;
  // subject lesson ids look like `lesson_<nodeId>`
  if (lessonId.startsWith("lesson_")) {
    const nodeId = lessonId.slice("lesson_".length);
    const found = findConcept(subjects, nodeId);
    if (found) return getLessonsForConcept(found.node, found.subject.title)[0];
  }
  return undefined;
}

/** Count of total authored foundational lessons, for progress displays. */
export function totalFoundationalLessons(): number {
  return foundationalLessons.length;
}
