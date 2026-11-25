// =============================================================================
// World 1 — "Learning How to Learn". Fully authored module: "The Science of
// Learning". Content is grounded in real cognitive-science findings with real
// citations (no fabricated sources). Each lesson follows the 10-part structure.
// =============================================================================

import type { Lesson, Source } from "@/lib/types";

const RETRIEVAL: Source = {
  title: "Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention",
  authors: "Roediger, H. L., & Karpicke, J. D.",
  year: 2006,
  note: "Psychological Science, 17(3). The classic demonstration of the testing effect.",
};
const SPACING: Source = {
  title: "Distributed Practice in Verbal Recall Tasks: A Review and Quantitative Synthesis",
  authors: "Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D.",
  year: 2006,
  note: "Psychological Bulletin, 132(3). Meta-analysis of the spacing effect.",
};
const INTERLEAVING: Source = {
  title: "Interleaved Practice Improves Mathematics Learning",
  authors: "Rohrer, D., Dedrick, R. F., & Stershic, S.",
  year: 2015,
  note: "Journal of Educational Psychology, 107(3).",
};
const STYLES_MYTH: Source = {
  title: "Learning Styles: Concepts and Evidence",
  authors: "Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R.",
  year: 2008,
  note: "Psychological Science in the Public Interest, 9(3). Finds no credible evidence for matching instruction to 'learning styles'.",
};
const DESIRABLE: Source = {
  title: "Making Things Hard on Yourself, But in a Good Way: Creating Desirable Difficulties",
  authors: "Bjork, E. L., & Bjork, R. A.",
  year: 2011,
  note: "In Psychology and the Real World.",
};

export const learnLessons: Lesson[] = [
  // -------------------------------------------------------------------------
  {
    id: "L1-retrieval",
    worldId: "learn",
    moduleId: "science-of-learning",
    title: "Active Recall & Retrieval Practice",
    objective:
      "Explain why retrieving information strengthens memory more than reviewing it, and start using active recall.",
    estMinutes: 12,
    hook: "You just re-read a chapter three times and it felt easy and familiar. Quick: without looking, what were its three main points? If that felt hard, this lesson is for you.",
    explanation:
      "Every time you **pull** information out of memory — rather than pushing it back in by re-reading — you make that memory easier to retrieve next time. This is the **testing effect** (or retrieval practice). In a landmark study, students who studied a passage once and then took recall tests remembered far more a week later than students who re-read the passage repeatedly, even though re-readers *felt* more confident.\n\nThe key mechanism: retrieval is **effortful reconstruction**. That effort is exactly what builds durable memory. Re-reading feels productive because it increases *fluency* (things look familiar), but familiarity is not the same as the ability to recall.\n\nPractical forms of active recall: closing the book and writing down everything you remember (free recall); answering questions from memory; using flashcards you actually try to answer before flipping; explaining a concept aloud without notes.",
    examples: [
      {
        title: "Re-reading vs. recall",
        body: "Group A read a science text 4 times. Group B read it once, then practiced recalling it 3 times. On a test one week later, Group B (less re-reading, more retrieval) substantially outperformed Group A — despite Group A feeling more confident right after studying (Roediger & Karpicke, 2006).",
      },
      {
        title: "The blank-page technique",
        body: "After studying a topic, put everything away and write (or say) everything you can remember on a blank page. Then check your notes. The gaps you find are precisely what to study next.",
      },
    ],
    misconception: {
      claim: "Re-reading and highlighting are efficient ways to study.",
      reality:
        "They produce a feeling of fluency but weak retention. Retrieval practice feels harder and is more effective — a 'desirable difficulty'.",
    },
    exercises: [
      {
        id: "L1-retrieval-ex1",
        kind: "mcq",
        prompt:
          "Why does practicing recall beat re-reading for long-term retention?",
        options: [
          "Because the effort of reconstructing a memory strengthens it",
          "Because re-reading takes more time",
          "Because recall is more enjoyable",
          "Because re-reading damages memories",
        ],
        answerIndex: 0,
        optionFeedback: [
          "Correct — effortful retrieval is the active ingredient.",
          "Time isn't the mechanism; effortful retrieval is.",
          "Enjoyment isn't the reason — recall often feels harder.",
          "Re-reading doesn't damage memory; it's just less effective than recall.",
        ],
        explanation:
          "The testing effect comes from effortful reconstruction, not time or enjoyment.",
        cognitiveLevel: "explanation",
        difficulty: 2,
        hints: ["Think about what your brain has to *do* during each activity."],
      },
      {
        id: "L1-retrieval-ex2",
        kind: "fill-blank",
        prompt: "Complete the sentence about why re-reading misleads us.",
        text: "Re-reading increases a feeling of ___ (things look familiar), which we mistake for the ability to ___ the information later.",
        answers: ["fluency", "recall"],
        aliases: [["familiarity"], ["retrieve", "remember"]],
        explanation:
          "Fluency/familiarity ≠ retrievability. This gap is an 'illusion of competence'.",
        cognitiveLevel: "recall",
        difficulty: 2,
      },
      {
        id: "L1-retrieval-ex3",
        kind: "explain",
        prompt:
          "A friend says 'I study by highlighting and re-reading my notes until it all feels familiar.' In 2–3 sentences, explain why this might not work well and what you'd suggest instead.",
        rubric: {
          criteria: [
            { id: "fluency", label: "Names the fluency illusion", description: "Mentions that familiarity ≠ recall.", keywords: ["familiar", "fluency", "illusion", "feel"], weight: 1 },
            { id: "retrieval", label: "Recommends retrieval", description: "Suggests active recall / self-testing.", keywords: ["recall", "test", "quiz", "retrieve", "blank", "flashcard"], weight: 1 },
            { id: "clarity", label: "Clear & kind", description: "Readable, specific advice.", weight: 1 },
          ],
          referenceAnswer:
            "Re-reading makes notes feel familiar, but familiarity isn't the same as being able to recall them in an exam. Instead, close the notes and try to write down everything from memory, then check — the gaps show what to restudy.",
        },
        explanation:
          "Teaching the idea to someone else (the Feynman move) is itself retrieval practice.",
        cognitiveLevel: "application",
        difficulty: 3,
      },
    ],
    summary: [
      "Retrieving memory strengthens it more than reviewing it (the testing effect).",
      "Re-reading creates fluency, which we mistake for mastery.",
      "Use free recall, self-quizzing, and real flashcard attempts.",
    ],
    teaches: ["L1-retrieval"],
    sources: [RETRIEVAL, DESIRABLE],
  },

  // -------------------------------------------------------------------------
  {
    id: "L1-spacing",
    worldId: "learn",
    moduleId: "science-of-learning",
    title: "Spaced Practice",
    objective:
      "Explain the spacing effect and schedule study across time instead of cramming.",
    estMinutes: 11,
    hook: "Two students study for 4 hours total. One crams all 4 hours the night before; the other spreads them across a week. Weeks later, who remembers more — and why?",
    explanation:
      "Memory fades along a **forgetting curve** (Ebbinghaus). But each time you successfully retrieve something just as it's starting to fade, you reset and flatten that curve. Spreading study across time — **spaced practice** — produces far better long-term retention than the same amount of study massed together (cramming).\n\nWhy? Spacing forces harder retrievals (you've partly forgotten, so reconstruction is effortful — a desirable difficulty), and it binds the memory to more varied contexts and cues. A large meta-analysis found distributed practice reliably beats massed practice, with bigger benefits at longer retention intervals (Cepeda et al., 2006).\n\nThis is exactly why **spaced-repetition systems** schedule each item for review right before you'd forget it — and it's the engine behind the Review Center in this app.",
    examples: [
      {
        title: "Cram vs. space",
        body: "Cramming can win a test *tomorrow* but loses badly a month later. Four 1-hour sessions across a week beat one 4-hour session the night before for durable memory.",
      },
      {
        title: "Expanding intervals",
        body: "Review a new fact after 1 day, then 3 days, then a week, then a month. Each successful recall lets the next interval grow — the schedule this app's SRS computes automatically.",
      },
    ],
    misconception: {
      claim: "If I understood it today, I don't need to revisit it.",
      reality:
        "Without spaced retrieval, most of it fades within days. Revisiting at increasing intervals is what makes it permanent.",
    },
    exercises: [
      {
        id: "L1-spacing-ex1",
        kind: "ordering",
        prompt:
          "Put these review points in the ideal expanding-interval order for a newly learned fact.",
        items: ["After 1 month", "After 1 day", "After 1 week", "After 3 days"],
        correctOrder: [1, 3, 2, 0],
        explanation:
          "Expanding intervals (1d → 3d → 1w → 1m) catch the memory just before it fades.",
        cognitiveLevel: "application",
        difficulty: 2,
      },
      {
        id: "L1-spacing-ex2",
        kind: "mcq",
        prompt: "Spacing works partly because a partly-forgotten memory makes retrieval…",
        options: [
          "harder, which strengthens it more (a desirable difficulty)",
          "easier, which saves time",
          "impossible, so you relearn from scratch",
          "irrelevant to memory strength",
        ],
        answerIndex: 0,
        explanation:
          "The extra effort of a harder, spaced retrieval is what builds durability.",
        cognitiveLevel: "explanation",
        difficulty: 3,
      },
      {
        id: "L1-spacing-ex3",
        kind: "predict-outcome",
        prompt:
          "You have a test in 30 days and 6 hours to study. Describe how you'd distribute those 6 hours and predict how your retention would compare to cramming all 6 hours on day 29. Justify your prediction.",
        rubric: {
          criteria: [
            { id: "distribute", label: "Distributes sessions", description: "Spreads study across many days.", keywords: ["day", "spread", "space", "session", "week"], weight: 1 },
            { id: "predict", label: "Correct prediction", description: "Predicts spaced > crammed at 30 days.", keywords: ["better", "more", "retain", "remember"], weight: 1 },
            { id: "justify", label: "Mechanistic justification", description: "Cites forgetting curve / desirable difficulty.", keywords: ["forget", "curve", "effort", "difficult", "retrieval"], weight: 1 },
          ],
        },
        explanation:
          "Predicting before acting is itself a learning strategy (generation effect).",
        cognitiveLevel: "analysis",
        difficulty: 4,
      },
    ],
    summary: [
      "Memory decays along a forgetting curve; spaced retrieval flattens it.",
      "Distributed practice beats massed practice, especially long-term.",
      "Expanding review intervals are optimal — and automated by SRS.",
    ],
    teaches: ["L1-spacing"],
    prerequisites: ["L1-retrieval"],
    sources: [SPACING, DESIRABLE],
  },

  // -------------------------------------------------------------------------
  {
    id: "L1-interleaving",
    worldId: "learn",
    moduleId: "science-of-learning",
    title: "Interleaving",
    objective:
      "Explain how mixing problem types improves learning and when to use interleaving vs. blocking.",
    estMinutes: 10,
    hook: "Practicing 20 problems of the same type in a row feels smooth and satisfying. But does that smoothness mean you're learning to tell problems apart?",
    explanation:
      "**Blocked practice** drills one skill at a time (AAAA BBBB). **Interleaving** mixes them (ABCABC). Blocking feels easier and more fluent, but interleaving produces better long-term learning and — crucially — better ability to **choose the right method** for an unfamiliar problem.\n\nWhy: when problems are blocked, you already know which method to use, so you never practice *selecting* it. Interleaving forces you to discriminate between problem types and retrieve the right approach — the skill you actually need on a real test or in the real world. Rohrer et al. (2015) found interleaved math practice more than doubled test scores versus blocked practice weeks later.\n\nCaveat: interleaving helps most once you have basic familiarity with each piece. For a brand-new skill, a little blocking first is fine; then interleave.",
    examples: [
      {
        title: "Math practice",
        body: "Mixing problems that require different formulas forces you to first *identify* which formula applies — the hard part on exams. Blocked practice hides that challenge.",
      },
      {
        title: "Beyond math",
        body: "Radiologists learn to distinguish conditions faster when cases are interleaved; artists learn to recognize painters' styles better when works are mixed rather than blocked by artist.",
      },
    ],
    misconception: {
      claim: "Smooth, easy practice means I'm learning efficiently.",
      reality:
        "Fluency during practice often predicts *worse* retention. Interleaving feels harder but teaches discrimination and selection.",
    },
    exercises: [
      {
        id: "L1-interleaving-ex1",
        kind: "matching",
        prompt: "Match each practice pattern to its effect.",
        left: ["Blocked (AAAA BBBB)", "Interleaved (ABAB)"],
        right: [
          "Feels fluent; weaker at choosing methods later",
          "Feels harder; better at selecting the right method",
        ],
        correct: [0, 1],
        explanation: "Interleaving trades in-the-moment fluency for real discrimination skill.",
        cognitiveLevel: "explanation",
        difficulty: 2,
      },
      {
        id: "L1-interleaving-ex2",
        kind: "identify-mistake",
        prompt:
          "A student says: 'Interleaving is always better, so beginners should immediately mix everything from day one.' What's the flaw in this claim?",
        stimulus:
          "'Interleaving beats blocking, so from the very first minute of learning anything new, mix all topics together.'",
        rubric: {
          criteria: [
            { id: "nuance", label: "Identifies the overgeneralization", description: "Notes that some initial familiarity helps first.", keywords: ["beginner", "first", "familiar", "basic", "some blocking", "initial"], weight: 1 },
            { id: "fix", label: "Proposes a fix", description: "Suggests a little blocking, then interleave.", keywords: ["then interleave", "after", "once", "block first"], weight: 1 },
          ],
        },
        explanation:
          "Interleaving helps most after basic acquisition; pure interleaving from zero can overwhelm.",
        cognitiveLevel: "evaluation",
        difficulty: 4,
      },
    ],
    summary: [
      "Interleaving mixes problem types; blocking drills one at a time.",
      "Interleaving teaches you to *select* the right method — the real skill.",
      "Get basic familiarity first, then interleave.",
    ],
    teaches: ["L1-interleaving"],
    prerequisites: ["L1-spacing"],
    sources: [INTERLEAVING, DESIRABLE],
  },

  // -------------------------------------------------------------------------
  {
    id: "L1-elaboration",
    worldId: "learn",
    moduleId: "science-of-learning",
    title: "Elaboration, Self-Explanation & Dual Coding",
    objective:
      "Connect new ideas to what you already know and to visuals, so they become meaningful and memorable.",
    estMinutes: 11,
    hook: "Which sticks better: the raw fact 'the capital of Australia is Canberra', or the same fact plus *why* it's Canberra and not Sydney? Why?",
    explanation:
      "**Elaboration** means explaining and connecting new material — asking *how* and *why*, and linking it to things you already understand. Richly connected knowledge has more retrieval routes and is far stickier than isolated facts.\n\n**Self-explanation** is elaboration aimed at your own understanding: as you study a worked example, explain each step to yourself ('why this step? why does it follow?'). Learners who self-explain understand more deeply and transfer better.\n\n**Dual coding** (Paivio) means pairing words with visuals — diagrams, sketches, concept maps. Verbal and visual representations create two complementary memory traces. (Note: this is *not* the debunked 'visual learner' idea — dual coding helps *everyone*; matching a teaching 'style' to a supposed learner type has no credible evidence.)",
    examples: [
      {
        title: "Why, not just what",
        body: "Canberra was chosen as a compromise capital between rival cities Sydney and Melbourne. The 'why' gives the fact meaning and a hook, making it far easier to recall.",
      },
      {
        title: "Sketch it",
        body: "Turning a paragraph about a process into a quick flow diagram forces you to identify the steps and their order — and gives you a visual trace to recall later.",
      },
    ],
    misconception: {
      claim: "I'm a 'visual learner', so I should only use diagrams.",
      reality:
        "'Learning styles' lack credible evidence (Pashler et al., 2008). Dual coding — words *and* visuals — helps everyone; don't restrict yourself to one channel.",
    },
    exercises: [
      {
        id: "L1-elaboration-ex1",
        kind: "mcq",
        prompt: "What is the core idea of elaboration?",
        options: [
          "Explaining how/why and connecting new ideas to existing knowledge",
          "Repeating a fact many times verbatim",
          "Studying only with pictures",
          "Avoiding any connections to keep ideas separate",
        ],
        answerIndex: 0,
        explanation: "Elaboration = meaningful connections and causal 'why' explanations.",
        cognitiveLevel: "recall",
        difficulty: 2,
      },
      {
        id: "L1-elaboration-ex2",
        kind: "explain",
        prompt:
          "Pick any fact you learned recently. Elaborate it: explain why it's true and connect it to something you already know. (3–4 sentences.)",
        rubric: {
          criteria: [
            { id: "why", label: "Explains why", description: "Gives a causal/mechanistic reason.", keywords: ["because", "since", "due to", "so that", "why"], weight: 1 },
            { id: "connect", label: "Connects to prior knowledge", description: "Links it to something already known.", keywords: ["like", "similar", "reminds", "connect", "related", "just as"], weight: 1 },
          ],
        },
        explanation: "The act of elaborating is what builds the extra retrieval routes.",
        cognitiveLevel: "application",
        difficulty: 3,
      },
      {
        id: "L1-elaboration-ex3",
        kind: "mcq",
        prompt:
          "Which statement about 'learning styles' is best supported by evidence?",
        options: [
          "Matching instruction to a supposed style reliably boosts learning",
          "There's no credible evidence that matching teaching to a 'style' improves learning",
          "Everyone is strictly a visual, auditory, or kinesthetic learner",
          "Visual learners shouldn't read text",
        ],
        answerIndex: 1,
        optionFeedback: [
          "No — well-designed studies fail to find this benefit.",
          "Correct — the 'meshing hypothesis' lacks credible support.",
          "No — people aren't locked into one channel.",
          "No — restricting channels hurts; use dual coding.",
        ],
        explanation:
          "Pashler et al. (2008) found no credible evidence for the learning-styles 'meshing' claim.",
        cognitiveLevel: "evaluation",
        difficulty: 3,
      },
    ],
    summary: [
      "Elaboration = explain why and connect to what you know.",
      "Self-explanation while studying examples deepens understanding and transfer.",
      "Dual coding (words + visuals) helps everyone; learning styles are a myth.",
    ],
    teaches: ["L1-elaboration"],
    prerequisites: ["L1-retrieval"],
    sources: [STYLES_MYTH],
  },

  // -------------------------------------------------------------------------
  {
    id: "L1-feynman",
    worldId: "learn",
    moduleId: "science-of-learning",
    title: "The Feynman Technique & Illusions of Competence",
    objective:
      "Use simple self-explanation to expose gaps, and recognize when you only *feel* like you know something.",
    estMinutes: 10,
    hook: "You nod along to a clear explanation and think 'got it'. Then you try to explain it to someone else and… stumble. What just happened?",
    explanation:
      "The **Feynman technique**: pick a concept, explain it in plain language as if teaching a beginner, notice exactly where you get vague or stuck, go back and fill that gap, then simplify again. It works because teaching-simply is a demanding retrieval+elaboration task that ruthlessly exposes gaps.\n\nThose gaps are usually hidden by **illusions of competence**: fluency (familiar-looking material feels learned), and the ability to recognize a correct answer (which is far easier than producing it). Both make us *feel* we know more than we can actually do. The cure is to test production: explain without notes, solve without peeking, predict before checking.",
    examples: [
      {
        title: "Plain-language test",
        body: "If you can't explain it without jargon, you probably don't fully understand it yet. The jargon was hiding the gap.",
      },
      {
        title: "Recognize vs. recall",
        body: "Multiple-choice *recognition* feels easy; a blank page *recall* is hard. The gap between them is the size of your illusion of competence.",
      },
    ],
    misconception: {
      claim: "If the explanation made sense while I read it, I've learned it.",
      reality:
        "Understanding-in-the-moment is fragile. Only unaided explanation and application later prove you've actually learned it.",
    },
    exercises: [
      {
        id: "L1-feynman-ex1",
        kind: "ordering",
        prompt: "Order the steps of the Feynman technique.",
        items: [
          "Simplify and use an analogy",
          "Explain it plainly as if to a beginner",
          "Pick a concept",
          "Find where you get stuck, then restudy that gap",
        ],
        correctOrder: [2, 1, 3, 0],
        explanation: "Pick → explain simply → find & fix gaps → simplify again.",
        cognitiveLevel: "recall",
        difficulty: 2,
      },
      {
        id: "L1-feynman-ex2",
        kind: "explain",
        prompt:
          "Use the Feynman technique right now on 'the testing effect' (from Lesson 1). Explain it to a beginner in plain language, with an analogy. Then note where you felt vague.",
        rubric: {
          criteria: [
            { id: "plain", label: "Plain language", description: "No unexplained jargon.", weight: 1 },
            { id: "analogy", label: "Uses an analogy", description: "Includes a comparison/metaphor.", keywords: ["like", "as if", "imagine", "think of", "similar"], weight: 1 },
            { id: "gap", label: "Notes a gap", description: "Honestly flags where understanding felt thin.", keywords: ["stuck", "vague", "unsure", "gap", "not sure"], weight: 1 },
          ],
          referenceAnswer:
            "The testing effect is like strengthening a path through a forest: every time you walk it from memory (recall) the path gets clearer, while just looking at a map (re-reading) barely helps. Where I felt vague: exactly why effort causes the strengthening.",
        },
        explanation: "Explaining simply + flagging the gap is the whole technique in action.",
        cognitiveLevel: "application",
        difficulty: 3,
      },
    ],
    summary: [
      "Feynman: explain simply → find gaps → restudy → simplify again.",
      "Illusions of competence come from fluency and recognition.",
      "Test production (unaided explanation/application), not recognition.",
    ],
    teaches: ["L1-feynman"],
    prerequisites: ["L1-retrieval", "L1-elaboration"],
    sources: [RETRIEVAL],
  },

  // -------------------------------------------------------------------------
  {
    id: "L1-metacognition",
    worldId: "learn",
    moduleId: "science-of-learning",
    title: "Metacognition & Building a Study System",
    objective:
      "Plan, monitor, and adjust your own learning, and assemble the techniques into a personal system.",
    estMinutes: 12,
    hook: "Two learners put in the same hours. One constantly asks 'is this working? what don't I understand yet?' and adjusts; the other just grinds. Months later they're worlds apart. The difference has a name.",
    explanation:
      "**Metacognition** is thinking about your own thinking: planning (what will I learn, how?), monitoring (do I actually understand this, or does it just feel familiar?), and evaluating (what worked, what to change?). Strong learners are not those who never struggle — they're those who *notice* when they don't understand and *adjust*.\n\nBecause illusions of competence corrupt our self-judgments, good metacognition relies on **objective checks**: self-testing, predicting then checking, and tracking errors. An **error log** (your Mistake Bank in this app) turns every mistake into a diagnosis of exactly what to fix.\n\nA simple personal study system that combines everything in this module:\n1. **Plan** the concept and why it matters.\n2. **Learn** actively (elaborate, self-explain, dual-code).\n3. **Retrieve** from a blank page; log the gaps.\n4. **Space & interleave** reviews (let the SRS schedule them).\n5. **Transfer** — solve an unfamiliar problem.\n6. **Reflect** — update your error log and plan.",
    examples: [
      {
        title: "Predict-then-check",
        body: "Before grading your recall attempt, predict your score. A big gap between predicted and actual reveals miscalibration — and tells you to trust tests over feelings.",
      },
      {
        title: "The error log",
        body: "For each mistake, record: what I got wrong, why, and the corrected idea. Reviewing the log targets your exact weak points instead of re-studying what you already know.",
      },
    ],
    misconception: {
      claim: "Good learners understand things immediately and never struggle.",
      reality:
        "Productive struggle is where learning happens. Experts simply *monitor* their understanding and adjust — that's metacognition, not raw talent.",
    },
    exercises: [
      {
        id: "L1-metacognition-ex1",
        kind: "matching",
        prompt: "Match each metacognitive phase to an action.",
        left: ["Planning", "Monitoring", "Evaluating"],
        right: [
          "Set a goal and choose a strategy",
          "Self-test to check real understanding mid-study",
          "Review what worked and update your approach",
        ],
        correct: [0, 1, 2],
        explanation: "Plan → monitor → evaluate is the metacognitive loop.",
        cognitiveLevel: "explanation",
        difficulty: 2,
      },
      {
        id: "L1-metacognition-ex2",
        kind: "construct-argument",
        prompt:
          "Make the case to a skeptical friend that tracking mistakes in an error log is worth the effort. Use at least one idea from this module.",
        rubric: {
          criteria: [
            { id: "claim", label: "Clear claim", description: "States a position.", weight: 1 },
            { id: "reason", label: "Grounded reasoning", description: "Uses a module concept (illusions, targeting weak points).", keywords: ["illusion", "weak", "target", "gap", "calibrat", "retriev"], weight: 1 },
            { id: "counter", label: "Addresses a counterpoint", description: "Acknowledges the effort objection.", keywords: ["effort", "time", "but", "although", "worth"], weight: 1 },
          ],
        },
        explanation: "Constructing an argument is high-level elaboration and transfer.",
        cognitiveLevel: "evaluation",
        difficulty: 4,
      },
      {
        id: "L1-metacognition-ex3",
        kind: "free-response",
        prompt:
          "Design your own 30-minute study session for a topic you care about, using at least three techniques from this module. List the minutes per step.",
        rubric: {
          criteria: [
            { id: "three", label: "≥3 techniques", description: "Uses at least three module techniques.", keywords: ["recall", "retriev", "space", "interleav", "elaborat", "feynman", "self-explain", "error", "predict"], weight: 2 },
            { id: "time", label: "Time-boxed", description: "Assigns minutes to steps.", keywords: ["min", "minute"], weight: 1 },
          ],
          referenceAnswer:
            "e.g. 5m plan + recall prior session (retrieval) · 10m learn new idea w/ self-explanation (elaboration) · 8m interleaved practice problems · 5m blank-page recall + log gaps · 2m schedule spaced review.",
        },
        explanation: "Assembling a personal system is the capstone skill of this module.",
        cognitiveLevel: "complex-problem-solving",
        difficulty: 5,
      },
    ],
    summary: [
      "Metacognition = plan, monitor, evaluate your own learning.",
      "Trust objective checks (self-tests, predictions) over feelings.",
      "Combine the techniques into a repeatable personal study system.",
    ],
    teaches: ["L1-metacognition"],
    prerequisites: ["L1-feynman", "L1-interleaving"],
    sources: [DESIRABLE, RETRIEVAL],
  },
];
