// =============================================================================
// Two curated sample subject curricula so "master a topic X" works end-to-end
// offline and demonstrates the knowledge skill tree. Concept nodes are hand-
// curated; lesson bodies are produced on demand by the LocalAdapter from each
// node (see content/index.ts → getLessonsForConcept).
// =============================================================================

import type { ConceptNode, Difficulty, Subject, TopicRequest } from "@/lib/types";

function buildSubject(opts: {
  id: string;
  title: string;
  topic: string;
  scope: string;
  subfields: string[];
  concepts: {
    name: string;
    subfield: string;
    difficulty: Difficulty;
    importance: 1 | 2 | 3;
    desc: string;
  }[];
  misconceptions: string[];
  applications: string[];
  frontiers: string[];
}): Subject {
  const req: TopicRequest = {
    topic: opts.topic,
    existingKnowledge: "beginner",
    objectives: `Build working competence in ${opts.topic}.`,
    depth: "working",
    weeklyMinutes: 180,
  };
  const nodes: ConceptNode[] = [];
  const path: string[] = [];
  opts.concepts.forEach((c, i) => {
    const id = `${opts.id}_c${i}`;
    const prev = i > 0 ? [`${opts.id}_c${i - 1}`] : [];
    nodes.push({
      id,
      subjectId: opts.id,
      name: c.name,
      subfield: c.subfield,
      description: c.desc,
      objectives: [
        `Explain ${c.name.toLowerCase()} clearly`,
        `Apply ${c.name.toLowerCase()} to a concrete problem`,
        `Recognize when it does and doesn't apply`,
      ],
      prerequisites: prev,
      related: prev,
      difficulty: c.difficulty,
      importance: c.importance,
      resources: [
        { title: `A reputable ${opts.topic} resource of your choice`, note: "Demo mode does not fetch live sources." },
      ],
      lessonIds: [`lesson_${id}`],
      masteryCriteria: [
        "Explain it unaided",
        "Solve an unseen problem using it",
        "Retain it through a delayed review",
      ],
    });
    path.push(id);
  });
  return {
    id: opts.id,
    title: opts.title,
    request: req,
    createdAt: Date.now(),
    source: "demo",
    scopeStatement: opts.scope,
    subfields: opts.subfields,
    nodes,
    path,
    misconceptions: opts.misconceptions,
    applications: opts.applications,
    frontiers: opts.frontiers,
    resources: [
      { title: `Curated starting points for ${opts.topic}`, note: "Swap in sources you trust." },
    ],
  };
}

export const sampleSubjects: Subject[] = [
  buildSubject({
    id: "sample_ml",
    title: "Machine Learning",
    topic: "machine learning",
    scope:
      "Working competence in classical and introductory deep machine learning: you can frame a problem, choose and train a model, evaluate it honestly, and avoid common pitfalls. Scoped to fundamentals — not an exhaustive survey of a fast-moving field.",
    subfields: [
      "Foundations",
      "Core Algorithms",
      "Model Evaluation",
      "Deep Learning Basics",
      "Applied & Responsible ML",
    ],
    concepts: [
      { name: "What Machine Learning Is", subfield: "Foundations", difficulty: 1, importance: 3, desc: "Learning patterns from data to make predictions, vs. explicit programming. Supervised, unsupervised, reinforcement." },
      { name: "Features, Labels & Datasets", subfield: "Foundations", difficulty: 1, importance: 3, desc: "How data is represented; train/validation/test splits and why they matter." },
      { name: "Linear & Logistic Regression", subfield: "Core Algorithms", difficulty: 2, importance: 3, desc: "The workhorse models: fitting a line/boundary by minimizing a loss." },
      { name: "Gradient Descent", subfield: "Core Algorithms", difficulty: 3, importance: 3, desc: "How models learn: iteratively stepping down a loss surface. $\\theta \\leftarrow \\theta - \\eta\\nabla L$." },
      { name: "Decision Trees & Ensembles", subfield: "Core Algorithms", difficulty: 3, importance: 2, desc: "Tree splits, random forests, gradient boosting." },
      { name: "Overfitting & Regularization", subfield: "Model Evaluation", difficulty: 3, importance: 3, desc: "The bias–variance tradeoff; why a model can memorize and fail to generalize." },
      { name: "Evaluation Metrics", subfield: "Model Evaluation", difficulty: 2, importance: 3, desc: "Accuracy, precision/recall, ROC-AUC — and why accuracy misleads on imbalanced data." },
      { name: "Neural Networks", subfield: "Deep Learning Basics", difficulty: 4, importance: 2, desc: "Layers, activations, and backpropagation as composed gradient descent." },
      { name: "Responsible ML", subfield: "Applied & Responsible ML", difficulty: 4, importance: 2, desc: "Bias, data leakage, and honest reporting of limitations." },
    ],
    misconceptions: [
      "More data or a fancier model always beats careful problem framing — it doesn't.",
      "High training accuracy means a good model (it can mean overfitting).",
      "Accuracy is the right metric for every problem (it isn't, especially when classes are imbalanced).",
    ],
    applications: [
      "Predict a numeric outcome from tabular data (regression)",
      "Classify emails as spam / not spam and evaluate honestly",
      "Build and critique a small end-to-end ML pipeline",
    ],
    frontiers: [
      "When do large models truly generalize vs. memorize?",
      "Fairness and interpretability in high-stakes decisions",
      "Data efficiency and learning from little labeled data",
    ],
  }),
  buildSubject({
    id: "sample_finance",
    title: "Personal Finance",
    topic: "personal finance",
    scope:
      "Working competence in personal financial decision-making: budgeting, debt, saving, and the core logic of long-term investing. Educational only — not individualized financial advice.",
    subfields: ["Money Foundations", "Debt & Credit", "Saving & Protection", "Investing Basics"],
    concepts: [
      { name: "Budgeting & Cash Flow", subfield: "Money Foundations", difficulty: 1, importance: 3, desc: "Tracking income vs. expenses; the idea of paying yourself first." },
      { name: "Compound Interest", subfield: "Money Foundations", difficulty: 2, importance: 3, desc: "Why growth compounds over time: $A = P(1+r)^t$. The single most important idea in finance." },
      { name: "Good vs. Bad Debt & Interest", subfield: "Debt & Credit", difficulty: 2, importance: 3, desc: "How interest works for and against you; prioritizing high-interest debt." },
      { name: "Emergency Funds & Insurance", subfield: "Saving & Protection", difficulty: 2, importance: 3, desc: "Buffering against shocks before investing; the role of insurance." },
      { name: "Risk, Return & Diversification", subfield: "Investing Basics", difficulty: 3, importance: 3, desc: "Why higher expected return demands more risk; not putting all eggs in one basket." },
      { name: "Index Funds & Long-Term Investing", subfield: "Investing Basics", difficulty: 3, importance: 2, desc: "Low-cost diversified investing and why fees and time horizon dominate outcomes." },
      { name: "Behavioral Pitfalls", subfield: "Investing Basics", difficulty: 4, importance: 2, desc: "Loss aversion, recency bias, and panic selling — the human side of money." },
    ],
    misconceptions: [
      "You need to be rich before compound interest matters — starting early beats starting big.",
      "Investing is the same as gambling (diversified, long-horizon investing is not).",
      "Paying only the minimum on high-interest debt is fine (interest can outpace everything else).",
    ],
    applications: [
      "Build a monthly budget and find your savings rate",
      "Compare two debt-payoff strategies and justify one",
      "Explain to a friend why starting to invest at 25 vs. 35 matters so much",
    ],
    frontiers: [
      "How much do fees really cost over a lifetime?",
      "Behavioral interventions that actually change saving habits",
      "Personal finance under high inflation and uncertainty",
    ],
  }),
];
