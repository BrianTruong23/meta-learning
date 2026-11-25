import { describe, it, expect } from "vitest";
import {
  xpForLevel,
  levelForXp,
  rankForLevel,
  awardXp,
  initGameState,
  registerActivity,
  refreshQuests,
  advanceQuests,
} from "@/lib/game/progression";

const DAY = 24 * 60 * 60 * 1000;

describe("Gamification progression", () => {
  it("has a monotonic level curve", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBeLessThan(xpForLevel(3));
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(xpForLevel(5))).toBe(5);
  });

  it("maps levels to the 8 ranks", () => {
    expect(rankForLevel(1)).toBe("Novice");
    expect(rankForLevel(100)).toBe("Master");
  });

  it("awards XP and flags level-ups", () => {
    const s0 = initGameState();
    const { state, leveledUp } = awardXp(s0, xpForLevel(2));
    expect(state.xp).toBe(xpForLevel(2));
    expect(state.level).toBe(2);
    expect(leveledUp).toBe(true);
  });

  it("builds a streak on consecutive days", () => {
    let s = initGameState();
    const d1 = Date.parse("2026-01-01T12:00:00Z");
    s = registerActivity(s, d1);
    expect(s.streakDays).toBe(1);
    s = registerActivity(s, d1 + DAY);
    expect(s.streakDays).toBe(2);
    // same day again doesn't double-count
    s = registerActivity(s, d1 + DAY + 1000);
    expect(s.streakDays).toBe(2);
  });

  it("uses a freeze token to forgive a single missed day (no punishment)", () => {
    let s = initGameState();
    const d1 = Date.parse("2026-01-01T12:00:00Z");
    s = registerActivity(s, d1);
    const tokens = s.freezeTokens;
    // skip one day (gap of 2) → absorbed by a token
    s = registerActivity(s, d1 + 2 * DAY);
    expect(s.streakDays).toBe(2);
    expect(s.freezeTokens).toBe(tokens - 1);
  });

  it("resets streak after a long gap with no tokens", () => {
    let s = { ...initGameState(), freezeTokens: 0 };
    const d1 = Date.parse("2026-01-01T12:00:00Z");
    s = registerActivity(s, d1);
    s = registerActivity(s, d1 + 5 * DAY);
    expect(s.streakDays).toBe(1);
  });

  it("refreshes and advances quests", () => {
    let s = refreshQuests(initGameState());
    expect(s.quests.length).toBeGreaterThan(0);
    const lessonsQuest = s.quests.find((q) => q.metric === "lessons");
    s = advanceQuests(s, "lessons", 1);
    const after = s.quests.find((q) => q.id === lessonsQuest!.id)!;
    expect(after.progress).toBe(1);
  });
});
