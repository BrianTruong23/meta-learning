// =============================================================================
// Boss battles / mastery examinations. A boss combines question types, offers
// no hints, and permits unlimited retries AFTER targeted remediation. Passing
// requires broad, independent success — not a single lucky answer.
// =============================================================================

import type { Exercise } from "@/lib/types";

export interface BossBattle {
  id: string;
  worldId?: string;
  subjectId?: string;
  title: string;
  intro: string;
  /** Minimum fraction of exercises that must be answered well to pass. */
  passThreshold: number;
  exercises: Exercise[];
  /** Concepts to send the learner back to on failure. */
  remediation: { ifWeakOn: string; reviewLessonId: string }[];
}

export const bosses: BossBattle[] = [
  {
    id: "boss-learn-1",
    worldId: "learn",
    title: "Boss Battle: The Science of Learning",
    intro:
      "Prove you can USE these ideas, not just recognize them. No hints here. You can retry after reviewing — mastery is earned by broad, independent success.",
    passThreshold: 0.75,
    exercises: [
      {
        id: "boss-learn-1-q1",
        kind: "mcq",
        prompt:
          "A classmate re-reads notes until everything 'feels familiar' and feels ready. What's the single best prediction and why?",
        options: [
          "They'll likely underperform on recall later — familiarity is an illusion of competence",
          "They'll ace it — familiarity equals mastery",
          "Re-reading erased their memory",
          "Nothing can be predicted",
        ],
        answerIndex: 0,
        explanation: "Fluency/familiarity ≠ retrievability.",
        cognitiveLevel: "analysis",
        difficulty: 4,
      },
      {
        id: "boss-learn-1-q2",
        kind: "ordering",
        prompt:
          "Assemble an evidence-based study loop for a new concept.",
        items: [
          "Transfer: solve an unfamiliar problem",
          "Learn actively (elaborate / self-explain)",
          "Blank-page recall; log the gaps",
          "Schedule spaced, interleaved review",
        ],
        correctOrder: [1, 2, 3, 0],
        explanation: "Learn → retrieve → space/interleave → transfer.",
        cognitiveLevel: "application",
        difficulty: 4,
      },
      {
        id: "boss-learn-1-q3",
        kind: "identify-mistake",
        prompt:
          "Find and fix the flawed reasoning.",
        stimulus:
          "'I'm a visual learner, so I'll only watch videos and skip all reading and self-testing. Diagrams match my style, so I'll learn fastest.'",
        rubric: {
          criteria: [
            { id: "styles", label: "Flags the learning-styles myth", description: "Notes no credible evidence for style-matching.", keywords: ["no evidence", "myth", "style", "pashler"], weight: 1 },
            { id: "retrieval", label: "Restores self-testing", description: "Notes dropping retrieval is the real error.", keywords: ["self-test", "recall", "retriev", "test"], weight: 1 },
            { id: "dual", label: "Dual coding for all", description: "Visuals help everyone, combined with words.", keywords: ["dual", "both", "words and", "everyone"], weight: 1 },
          ],
        },
        explanation:
          "The error is dropping retrieval practice and over-trusting a style myth.",
        cognitiveLevel: "evaluation",
        difficulty: 5,
      },
      {
        id: "boss-learn-1-q4",
        kind: "solve-problem",
        prompt:
          "You must help a friend prepare for a cumulative exam in 3 weeks with only 20 minutes a day. Design their regimen and justify every choice using the module's principles.",
        rubric: {
          criteria: [
            { id: "space", label: "Spacing", description: "Spreads practice across the 3 weeks.", keywords: ["day", "space", "spread", "week"], weight: 1 },
            { id: "retrieve", label: "Retrieval", description: "Centers self-testing over re-reading.", keywords: ["recall", "test", "retriev", "quiz", "blank"], weight: 1 },
            { id: "interleave", label: "Interleaving", description: "Mixes topics.", keywords: ["interleav", "mix", "alternate"], weight: 1 },
            { id: "justify", label: "Justified", description: "Explains WHY each choice works.", keywords: ["because", "since", "so that", "why"], weight: 1 },
          ],
        },
        explanation: "Designing + justifying a regimen is transfer at the highest level.",
        cognitiveLevel: "complex-problem-solving",
        difficulty: 5,
      },
    ],
    remediation: [
      { ifWeakOn: "L1-retrieval", reviewLessonId: "L1-retrieval" },
      { ifWeakOn: "L1-spacing", reviewLessonId: "L1-spacing" },
      { ifWeakOn: "L1-interleaving", reviewLessonId: "L1-interleaving" },
      { ifWeakOn: "L1-elaboration", reviewLessonId: "L1-elaboration" },
    ],
  },
];
