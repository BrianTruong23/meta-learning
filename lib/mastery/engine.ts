// =============================================================================
// Mastery engine — evidence-based, multi-dimensional competence estimation.
// =============================================================================
// Hard rules from the spec:
//  - NEVER invent a mastery percentage without backing assessment evidence.
//    With too little evidence we return { sufficient: false } explicitly.
//  - Mastery is EARNED through demonstrated competence (accuracy, at difficulty,
//    independently, retained over time, transferred to new problems) — not by
//    time spent, lessons opened, or repeating easy activities.
//  - Self-reported confidence is tracked SEPARATELY from demonstrated competence
//    (calibration), never blended into the mastery number.
// =============================================================================

import {
  type AssessmentEvent,
  type CognitiveLevel,
  type KnowledgeStatus,
  type MasteryDimension,
  COGNITIVE_LEVELS,
  MASTERY_DIMENSIONS,
} from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Minimum independent-ish evidence before we'll state a mastery estimate. */
const MIN_EVENTS_FOR_ESTIMATE = 3;

export interface MasteryResult {
  sufficient: boolean;
  /** 0..1 overall competence estimate — only meaningful when sufficient. */
  score: number;
  status: KnowledgeStatus;
  /** Per-dimension 0..1 (only dimensions with evidence are populated). */
  dimensions: Partial<Record<MasteryDimension, number>>;
  /** How much evidence backs this, 0..1 — surfaced to the learner. */
  evidenceStrength: number;
  /** Calibration gap: demonstrated minus self-reported confidence (-1..1). */
  calibration?: number;
  /** Plain-language explanation of what's missing / what's next. */
  rationale: string;
}

const COG_WEIGHT: Record<CognitiveLevel, number> = {
  recognition: 0.5,
  recall: 0.6,
  explanation: 0.8,
  application: 1.0,
  analysis: 1.1,
  evaluation: 1.2,
  "complex-problem-solving": 1.4,
  "novel-problem-solving": 1.6,
  "open-ended-investigation": 1.6,
};

/** Recency weight: recent evidence counts more; decays over ~60 days. */
function recency(at: number, now: number): number {
  const ageDays = Math.max(0, (now - at) / DAY_MS);
  return Math.exp(-ageDays / 60);
}

/**
 * Estimate mastery for a node from its assessment events.
 * Returns an explicit "insufficient" result when evidence is too thin.
 */
export function estimateMastery(
  events: AssessmentEvent[],
  now: number = Date.now(),
): MasteryResult {
  if (events.length === 0) {
    return {
      sufficient: false,
      score: 0,
      status: "undiscovered",
      dimensions: {},
      evidenceStrength: 0,
      rationale: "No evidence yet. Complete a lesson or exercise to begin.",
    };
  }

  // Weighted competence: each event weighted by cognitive demand × difficulty ×
  // independence × recency. Independence matters a lot — answers produced with
  // heavy hints count for less.
  let num = 0;
  let den = 0;
  let evidenceMass = 0;
  const dimAcc: Partial<Record<MasteryDimension, { n: number; d: number }>> = {};

  // calibration
  let confSum = 0;
  let confN = 0;
  let demoForConf = 0;

  for (const e of events) {
    const w =
      COG_WEIGHT[e.cognitiveLevel] *
      (0.6 + 0.1 * e.difficulty) *
      (0.4 + 0.6 * e.independence) *
      recency(e.at, now);
    num += e.score * w;
    den += w;
    evidenceMass += w;

    for (const dim of e.dimensions) {
      const slot = (dimAcc[dim] ??= { n: 0, d: 0 });
      slot.n += e.score * w;
      slot.d += w;
    }

    if (typeof e.confidence === "number") {
      confSum += e.confidence;
      demoForConf += e.score;
      confN += 1;
    }
  }

  const raw = den > 0 ? num / den : 0;

  // Evidence strength: grows with number + quality + variety of events.
  const levelVariety =
    new Set(events.map((e) => e.cognitiveLevel)).size / COGNITIVE_LEVELS.length;
  const evidenceStrength = clamp01(
    0.5 * clamp01(events.length / 6) +
      0.3 * clamp01(evidenceMass / 6) +
      0.2 * levelVariety,
  );

  const dimensions: Partial<Record<MasteryDimension, number>> = {};
  for (const dim of MASTERY_DIMENSIONS) {
    const slot = dimAcc[dim];
    if (slot && slot.d > 0) dimensions[dim] = round2(slot.n / slot.d);
  }

  let calibration: number | undefined;
  if (confN > 0) {
    calibration = round2(demoForConf / confN - confSum / confN);
  }

  const sufficient = events.length >= MIN_EVENTS_FOR_ESTIMATE && evidenceStrength >= 0.33;

  const status = deriveStatus(raw, events, evidenceStrength, now);

  return {
    sufficient,
    score: round2(raw),
    status,
    dimensions,
    evidenceStrength: round2(evidenceStrength),
    calibration,
    rationale: buildRationale(sufficient, raw, events, evidenceStrength, calibration),
  };
}

/**
 * Derive a discrete knowledge status. Higher statuses require demonstrating
 * competence at higher cognitive levels AND retention (a spaced success).
 */
function deriveStatus(
  raw: number,
  events: AssessmentEvent[],
  evidenceStrength: number,
  now: number,
): KnowledgeStatus {
  const maxLevel = Math.max(
    ...events.map((e) => COGNITIVE_LEVELS.indexOf(e.cognitiveLevel)),
  );
  // retention: at least one successful event older than ~5 days, and a recent one
  const hasOld = events.some((e) => e.score >= 0.7 && now - e.at > 5 * DAY_MS);
  const recentSuccess = events.some(
    (e) => e.score >= 0.7 && now - e.at < 3 * DAY_MS,
  );
  const retained = hasOld && recentSuccess;
  const independentHigh = events.some(
    (e) =>
      e.independence >= 0.8 &&
      e.score >= 0.8 &&
      COGNITIVE_LEVELS.indexOf(e.cognitiveLevel) >= COGNITIVE_LEVELS.indexOf("application"),
  );

  // recent failure flags "needs review"
  const recentFail = events
    .filter((e) => now - e.at < 14 * DAY_MS)
    .slice(-3)
    .some((e) => e.score < 0.5);
  if (recentFail && evidenceStrength > 0.3) return "needs-review";

  if (raw >= 0.85 && retained && independentHigh && maxLevel >= COGNITIVE_LEVELS.indexOf("analysis"))
    return "mastered";
  if (raw >= 0.75 && independentHigh) return "proficient";
  if (raw >= 0.65 && maxLevel >= COGNITIVE_LEVELS.indexOf("application")) return "practiced";
  if (raw >= 0.55 && maxLevel >= COGNITIVE_LEVELS.indexOf("explanation")) return "understood";
  if (events.length > 0) return "learning";
  return "discovered";
}

function buildRationale(
  sufficient: boolean,
  raw: number,
  events: AssessmentEvent[],
  evidenceStrength: number,
  calibration?: number,
): string {
  if (!sufficient) {
    const need = Math.max(0, MIN_EVENTS_FOR_ESTIMATE - events.length);
    const parts = [
      `Not enough evidence for a reliable estimate (${events.length} assessment${events.length === 1 ? "" : "s"} so far).`,
    ];
    if (need > 0) parts.push(`Complete ${need} more to unlock an estimate.`);
    parts.push("Try exercises at higher levels (apply, analyze) to demonstrate real understanding.");
    return parts.join(" ");
  }
  const lvl =
    raw >= 0.85 ? "strong" : raw >= 0.65 ? "solid" : raw >= 0.5 ? "developing" : "early";
  let s = `Estimate is ${lvl}, backed by ${events.length} assessments (evidence strength ${Math.round(
    evidenceStrength * 100,
  )}%).`;
  if (typeof calibration === "number") {
    if (calibration < -0.15)
      s += " You tend to be over-confident here — your results trail your confidence.";
    else if (calibration > 0.15)
      s += " You tend to under-rate yourself — you perform better than you expect.";
    else s += " Your confidence is well-calibrated to your results.";
  }
  return s;
}

export function statusLabel(s: KnowledgeStatus): string {
  return {
    undiscovered: "Undiscovered",
    discovered: "Discovered",
    learning: "Learning",
    understood: "Understood",
    practiced: "Practiced",
    proficient: "Proficient",
    mastered: "Mastered",
    "needs-review": "Needs review",
  }[s];
}

export function statusRank(s: KnowledgeStatus): number {
  return [
    "undiscovered",
    "discovered",
    "learning",
    "understood",
    "practiced",
    "proficient",
    "mastered",
  ].indexOf(s === "needs-review" ? "practiced" : s);
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
