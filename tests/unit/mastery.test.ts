import { describe, it, expect } from "vitest";
import { estimateMastery } from "@/lib/mastery/engine";
import type { AssessmentEvent, CognitiveLevel } from "@/lib/types";

const DAY = 24 * 60 * 60 * 1000;

function ev(partial: Partial<AssessmentEvent>): AssessmentEvent {
  return {
    id: Math.random().toString(),
    nodeId: "n1",
    at: Date.now(),
    score: 1,
    cognitiveLevel: "explanation",
    difficulty: 3,
    independence: 1,
    dimensions: ["conceptual"],
    kind: "lesson",
    ...partial,
  };
}

describe("Mastery engine (evidence-based)", () => {
  it("reports insufficient evidence with no events", () => {
    const r = estimateMastery([]);
    expect(r.sufficient).toBe(false);
    expect(r.status).toBe("undiscovered");
    expect(r.score).toBe(0);
    expect(r.rationale).toMatch(/no evidence/i);
  });

  it("does NOT claim a reliable estimate from a single event", () => {
    const r = estimateMastery([ev({ score: 1 })]);
    expect(r.sufficient).toBe(false);
    expect(r.rationale).toMatch(/not enough evidence/i);
  });

  it("produces a sufficient estimate once enough varied evidence exists", () => {
    const now = Date.now();
    const events = [
      ev({ at: now - 6 * DAY, score: 0.9, cognitiveLevel: "explanation" }),
      ev({ at: now - 3 * DAY, score: 0.9, cognitiveLevel: "application" }),
      ev({ at: now - 1 * DAY, score: 1, cognitiveLevel: "analysis" }),
      ev({ at: now, score: 1, cognitiveLevel: "application" }),
    ];
    const r = estimateMastery(events, now);
    expect(r.sufficient).toBe(true);
    expect(r.score).toBeGreaterThan(0.6);
  });

  it("flags needs-review after a recent failure", () => {
    const now = Date.now();
    const events = [
      ev({ at: now - 10 * DAY, score: 0.9 }),
      ev({ at: now - 5 * DAY, score: 0.8 }),
      ev({ at: now - 1 * DAY, score: 0.2 }),
    ];
    const r = estimateMastery(events, now);
    expect(r.status).toBe("needs-review");
  });

  it("requires retention + independence + high level for 'mastered'", () => {
    const now = Date.now();
    // all high, old + recent success, independent, analysis level
    const strong = [
      ev({ at: now - 20 * DAY, score: 1, cognitiveLevel: "analysis", independence: 1 }),
      ev({ at: now - 10 * DAY, score: 1, cognitiveLevel: "application", independence: 1 }),
      ev({ at: now - 1 * DAY, score: 1, cognitiveLevel: "analysis", independence: 1 }),
      ev({ at: now, score: 1, cognitiveLevel: "evaluation", independence: 1 }),
    ];
    expect(estimateMastery(strong, now).status).toBe("mastered");

    // same scores but all low independence (heavy hints) → not mastered
    const assisted = strong.map((e) => ({ ...e, independence: 0.3 }));
    expect(estimateMastery(assisted, now).status).not.toBe("mastered");
  });

  it("tracks calibration separately (overconfidence → negative)", () => {
    const now = Date.now();
    const events = [
      ev({ at: now - 3 * DAY, score: 0.3, confidence: 0.9 }),
      ev({ at: now - 2 * DAY, score: 0.4, confidence: 0.9 }),
      ev({ at: now - 1 * DAY, score: 0.3, confidence: 0.9 }),
    ];
    const r = estimateMastery(events, now);
    expect(r.calibration).toBeLessThan(0);
  });

  it("weights low-level recognition below high-level application", () => {
    const now = Date.now();
    const lowLevel = Array.from({ length: 4 }, (_, i) =>
      ev({ at: now - i * DAY, score: 1, cognitiveLevel: "recognition" as CognitiveLevel }),
    );
    const highLevel = Array.from({ length: 4 }, (_, i) =>
      ev({ at: now - i * DAY, score: 1, cognitiveLevel: "application" as CognitiveLevel }),
    );
    // both perfect, but higher cognitive level should not score lower
    expect(estimateMastery(highLevel, now).score).toBeGreaterThanOrEqual(
      estimateMastery(lowLevel, now).score - 0.001,
    );
    // and recognition-only should not reach 'mastered'
    expect(estimateMastery(lowLevel, now).status).not.toBe("mastered");
  });
});
