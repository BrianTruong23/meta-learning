import { describe, it, expect } from "vitest";
import { localAdapter } from "@/lib/ai/local";
import type { TopicRequest } from "@/lib/types";

const baseReq: TopicRequest = {
  topic: "quantum computing",
  existingKnowledge: "none",
  objectives: "",
  depth: "working",
  weeklyMinutes: 120,
};

describe("LocalAdapter (deterministic demo generator)", () => {
  it("generates a scoped, non-empty curriculum tagged as demo", async () => {
    const subj = await localAdapter.generateCurriculum(baseReq);
    expect(subj.source).toBe("demo");
    expect(subj.nodes.length).toBeGreaterThan(0);
    expect(subj.path.length).toBe(subj.nodes.length);
    expect(subj.scopeStatement).toMatch(/scope|mastery/i);
    // never claims exhaustiveness
    expect(subj.scopeStatement.toLowerCase()).toContain("does not claim");
    expect(subj.title.toLowerCase()).toContain("quantum");
  });

  it("is deterministic for the same topic", async () => {
    const a = await localAdapter.generateCurriculum(baseReq);
    const b = await localAdapter.generateCurriculum(baseReq);
    expect(a.nodes.map((n) => n.name)).toEqual(b.nodes.map((n) => n.name));
  });

  it("scales depth: overview is shorter than deep", async () => {
    const overview = await localAdapter.generateCurriculum({ ...baseReq, depth: "overview" });
    const deep = await localAdapter.generateCurriculum({ ...baseReq, depth: "deep" });
    expect(overview.nodes.length).toBeLessThan(deep.nodes.length);
  });

  it("wires prerequisites so the path is a chain", async () => {
    const subj = await localAdapter.generateCurriculum(baseReq);
    for (let i = 1; i < subj.nodes.length; i++) {
      expect(subj.nodes[i].prerequisites).toContain(subj.nodes[i - 1].id);
    }
  });

  it("generates concrete lessons with varied, non-MCQ-only exercises", async () => {
    const subj = await localAdapter.generateCurriculum(baseReq);
    const lessons = localAdapter.generateLessonsFor(subj.nodes[0], subj.title);
    expect(lessons.length).toBeGreaterThan(0);
    const kinds = new Set(lessons[0].exercises.map((e) => e.kind));
    expect(kinds.size).toBeGreaterThan(1); // not all one type
    expect(lessons[0].exercises.length).toBeGreaterThanOrEqual(3);
  });

  it("scores open responses transparently via rubric heuristics", async () => {
    const rubric = {
      criteria: [
        { id: "k", label: "Keyword", description: "mentions photons", keywords: ["photon"], weight: 1 },
        { id: "len", label: "Detail", description: "enough detail", weight: 1 },
      ],
    };
    const good = await localAdapter.scoreOpenResponse(
      "A photon is a quantum of light and this is a reasonably detailed answer about it.",
      rubric,
    );
    expect(good.heuristic).toBe(true);
    expect(good.source).toBe("demo");
    expect(good.perCriterion.find((c) => c.criterionId === "k")?.met).toBe(true);

    const empty = await localAdapter.scoreOpenResponse("", rubric);
    expect(empty.overall).toBe(0);
  });

  it("tutor guides without fabricating citations in research mode", async () => {
    const reply = await localAdapter.tutor({
      mode: "research",
      history: [],
      message: "how do I research this?",
    });
    expect(reply.source).toBe("demo");
    expect(reply.content).toMatch(/won't invent|primary|peer-reviewed/i);
  });
});
