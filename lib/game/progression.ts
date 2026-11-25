// =============================================================================
// Gamification — XP, levels, ranks, streaks, quests, badges.
// =============================================================================
// Deliberately SEPARATE from mastery (lib/mastery). XP rewards engagement and
// effort; it never stands in for demonstrated competence. Breaks and mistakes
// are not punished: streaks can be protected with freeze tokens, and losing a
// streak costs nothing but the streak counter.
// =============================================================================

import { RANKS, type GameState, type Quest, type Rank, type Badge } from "@/lib/types";

/** XP needed to reach level n (1-indexed). Gentle quadratic curve. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(50 * (level - 1) * level); // L2=100, L3=300, L4=600, ...
}

export function levelForXp(xp: number): number {
  let lvl = 1;
  while (xpForLevel(lvl + 1) <= xp) lvl += 1;
  return lvl;
}

/** Progress within the current level, 0..1, plus the raw numbers. */
export function levelProgress(xp: number) {
  const level = levelForXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const into = xp - base;
  const span = next - base;
  return { level, into, span, pct: span > 0 ? into / span : 0, next };
}

/** Rank is a coarse band derived from level (8 ranks across the curve). */
export function rankForLevel(level: number): Rank {
  const idx = Math.min(RANKS.length - 1, Math.floor((level - 1) / 4));
  return RANKS[idx];
}

export function rankIndex(rank: Rank): number {
  return RANKS.indexOf(rank);
}

export function initGameState(): GameState {
  return {
    xp: 0,
    level: 1,
    rank: "Novice",
    streakDays: 0,
    longestStreak: 0,
    badges: [],
    quests: [],
    freezeTokens: 2,
  };
}

/** Award XP and recompute derived fields. Returns new state + level-up flag. */
export function awardXp(
  state: GameState,
  amount: number,
): { state: GameState; leveledUp: boolean; newRank?: Rank } {
  const xp = Math.max(0, state.xp + amount);
  const level = levelForXp(xp);
  const rank = rankForLevel(level);
  const leveledUp = level > state.level;
  const newRank = rank !== state.rank ? rank : undefined;
  return { state: { ...state, xp, level, rank }, leveledUp, newRank };
}

export function todayKey(now: number = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

function dayDiff(a: string, b: string): number {
  const da = Date.parse(a + "T00:00:00Z");
  const db = Date.parse(b + "T00:00:00Z");
  return Math.round((db - da) / (24 * 60 * 60 * 1000));
}

/**
 * Register activity for the day; updates streak. Missing a single day is
 * absorbed by a freeze token if available (no punishment).
 */
export function registerActivity(
  state: GameState,
  now: number = Date.now(),
): GameState {
  const today = todayKey(now);
  if (state.lastActiveDay === today) return state;

  let streakDays = state.streakDays;
  let freezeTokens = state.freezeTokens;

  if (!state.lastActiveDay) {
    streakDays = 1;
  } else {
    const gap = dayDiff(state.lastActiveDay, today);
    if (gap === 1) {
      streakDays += 1;
    } else if (gap === 2 && freezeTokens > 0) {
      // one missed day, absorbed by a freeze token
      freezeTokens -= 1;
      streakDays += 1;
    } else {
      streakDays = 1; // streak reset — costs nothing else
    }
  }

  return {
    ...state,
    streakDays,
    freezeTokens,
    longestStreak: Math.max(state.longestStreak, streakDays),
    lastActiveDay: today,
  };
}

// --- Quests ----------------------------------------------------------------

export function isoWeek(now: number = Date.now()): string {
  const d = new Date(now);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((d.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const DAILY_TEMPLATES: Omit<Quest, "issuedDay" | "progress" | "claimed">[] = [
  { id: "d-lessons", kind: "daily", label: "Complete 2 lessons", target: 2, xp: 30, metric: "lessons" },
  { id: "d-reviews", kind: "daily", label: "Clear 10 reviews", target: 10, xp: 20, metric: "reviews" },
  { id: "d-practice", kind: "daily", label: "Solve 3 practice problems", target: 3, xp: 25, metric: "practice" },
  { id: "d-challenge", kind: "daily", label: "Log 1 activity from the wild", target: 1, xp: 20, metric: "challenges" },
];
const WEEKLY_TEMPLATES: Omit<Quest, "issuedDay" | "progress" | "claimed">[] = [
  { id: "w-xp", kind: "weekly", label: "Earn 300 XP this week", target: 300, xp: 100, metric: "xp" },
  { id: "w-lessons", kind: "weekly", label: "Complete 8 lessons", target: 8, xp: 80, metric: "lessons" },
];

/** Refresh daily/weekly quests for the current period, preserving progress
 *  only within the same period. */
export function refreshQuests(state: GameState, now: number = Date.now()): GameState {
  const today = todayKey(now);
  const week = isoWeek(now);
  const existing = new Map(state.quests.map((q) => [q.id, q]));

  const quests: Quest[] = [];
  for (const t of DAILY_TEMPLATES) {
    const prev = existing.get(t.id);
    quests.push(
      prev && prev.issuedDay === today
        ? prev
        : { ...t, issuedDay: today, progress: 0, claimed: false },
    );
  }
  for (const t of WEEKLY_TEMPLATES) {
    const prev = existing.get(t.id);
    quests.push(
      prev && prev.issuedDay === week
        ? prev
        : { ...t, issuedDay: week, progress: 0, claimed: false },
    );
  }
  return { ...state, quests };
}

export function advanceQuests(
  state: GameState,
  metric: Quest["metric"],
  amount = 1,
): GameState {
  return {
    ...state,
    quests: state.quests.map((q) =>
      q.metric === metric && !q.claimed
        ? { ...q, progress: Math.min(q.target, q.progress + amount) }
        : q,
    ),
  };
}

export const ALL_BADGES: Badge[] = [
  { id: "first-lesson", title: "First Steps", description: "Complete your first lesson", icon: "footprints" },
  { id: "first-recall", title: "Memory Spark", description: "Complete your first review", icon: "zap" },
  { id: "streak-7", title: "Consistent", description: "Reach a 7-day streak", icon: "flame" },
  { id: "streak-30", title: "Devoted", description: "Reach a 30-day streak", icon: "flame" },
  { id: "first-subject", title: "Trailblazer", description: "Generate your first subject curriculum", icon: "compass" },
  { id: "first-mastery", title: "True Understanding", description: "Reach 'Mastered' on any concept", icon: "award" },
  { id: "boss-win", title: "Giant Slayer", description: "Defeat your first boss battle", icon: "swords" },
  { id: "calibrated", title: "Know Thyself", description: "Achieve well-calibrated confidence", icon: "target" },
  { id: "researcher", title: "Investigator", description: "Complete a research project", icon: "microscope" },
  { id: "writer", title: "Wordsmith", description: "Revise a piece to a stronger draft", icon: "pen-line" },
  { id: "wild-learner", title: "Scholar at Large", description: "Log your first activity from the wild", icon: "puzzle" },
  { id: "polymath", title: "Polymath", description: "Log external activities in 4+ categories", icon: "puzzle" },
];
