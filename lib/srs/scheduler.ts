// =============================================================================
// Spaced-repetition scheduler — an SM-2 variant.
// =============================================================================
// Pure functions only (no storage, no React) so they are trivially testable.
// Grades: 0 = again (lapse), 1 = hard, 2 = good, 3 = easy.
// Design choices:
//  - Taking a break is never punished: due dates are relative, nothing expires.
//  - A lapse resets the interval but only gently lowers ease (floor 1.3).
//  - First two successful reps use fixed short intervals (1d, then ~3-6d),
//    thereafter interval = prevInterval * ease, matching SM-2 behaviour.
// =============================================================================

import type { RecallGrade, ReviewItem } from "@/lib/types";

export const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

export function createReviewItem(
  params: Omit<
    ReviewItem,
    | "ease"
    | "intervalDays"
    | "repetitions"
    | "due"
    | "lapses"
    | "createdAt"
  > & { now?: number },
): ReviewItem {
  const now = params.now ?? Date.now();
  return {
    id: params.id,
    nodeId: params.nodeId,
    front: params.front,
    back: params.back,
    subjectId: params.subjectId,
    worldId: params.worldId,
    source: params.source,
    ease: DEFAULT_EASE,
    intervalDays: 0,
    repetitions: 0,
    due: now, // due immediately (newly learned → first review soon)
    lapses: 0,
    createdAt: now,
  };
}

/**
 * Apply a recall grade to an item, returning the updated item.
 * Does not mutate the input.
 */
export function schedule(
  item: ReviewItem,
  grade: RecallGrade,
  now: number = Date.now(),
): ReviewItem {
  let { ease, intervalDays, repetitions, lapses } = item;

  if (grade === 0) {
    // Lapse: reset reps, schedule again in ~10 minutes, nudge ease down.
    lapses += 1;
    repetitions = 0;
    intervalDays = 0;
    ease = Math.max(MIN_EASE, ease - 0.2);
    return {
      ...item,
      ease,
      intervalDays,
      repetitions,
      lapses,
      lastReviewed: now,
      due: now + 10 * 60 * 1000,
    };
  }

  // SM-2 ease adjustment. Map grade→quality: hard=3, good=4, easy=5.
  const quality = grade === 1 ? 3 : grade === 2 ? 4 : 5;
  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  ease = Math.max(MIN_EASE, ease);

  repetitions += 1;
  if (repetitions === 1) {
    intervalDays = grade === 1 ? 1 : grade === 3 ? 2 : 1;
  } else if (repetitions === 2) {
    intervalDays = grade === 1 ? 3 : grade === 3 ? 6 : 4;
  } else {
    const factor = grade === 1 ? Math.max(1.2, ease - 0.6) : ease;
    intervalDays = Math.round(intervalDays * factor);
  }
  intervalDays = Math.max(1, intervalDays);

  return {
    ...item,
    ease: round(ease, 2),
    intervalDays,
    repetitions,
    lapses,
    lastReviewed: now,
    due: now + intervalDays * DAY_MS,
  };
}

/** Items that are due now (or overdue), soonest first. */
export function getDue(items: ReviewItem[], now: number = Date.now()): ReviewItem[] {
  return items
    .filter((i) => i.due <= now)
    .sort((a, b) => a.due - b.due);
}

/** Upcoming (not yet due), soonest first — for "upcoming reviews" widgets. */
export function getUpcoming(
  items: ReviewItem[],
  now: number = Date.now(),
): ReviewItem[] {
  return items
    .filter((i) => i.due > now)
    .sort((a, b) => a.due - b.due);
}

/** Buckets of counts due per day for the next `days` days (analytics). */
export function dueForecast(
  items: ReviewItem[],
  days = 14,
  now: number = Date.now(),
): { day: string; count: number }[] {
  const start = startOfDay(now);
  const out: { day: string; count: number }[] = [];
  for (let d = 0; d < days; d++) {
    const from = start + d * DAY_MS;
    const to = from + DAY_MS;
    const count = items.filter((i) => (d === 0 ? i.due < to : i.due >= from && i.due < to)).length;
    out.push({ day: new Date(from).toISOString().slice(5, 10), count });
  }
  return out;
}

/** Human label for when an item is next due. */
export function dueLabel(due: number, now: number = Date.now()): string {
  const diff = due - now;
  if (diff <= 0) return "due now";
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `in ${hrs}h`;
  const d = Math.round(hrs / 24);
  return `in ${d}d`;
}

function round(n: number, places: number) {
  const p = 10 ** places;
  return Math.round(n * p) / p;
}
function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
