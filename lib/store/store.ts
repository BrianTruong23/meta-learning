// =============================================================================
// Central app state (Zustand + persist to localStorage). Every component reads
// and writes through this store — nothing touches localStorage directly. All
// reads tolerate an empty/first-run state. Larger blobs (uploaded research
// files) go to IndexedDB (lib/store/files.ts), not here.
// =============================================================================

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type AssessmentEvent,
  type ExternalActivity,
  type ExternalLog,
  type GameState,
  type KnowledgeNote,
  type NodeKnowledge,
  type PortfolioProject,
  type Profile,
  type ProblemAttempt,
  type RecallGrade,
  type ResearchProject,
  type ReviewItem,
  type Subject,
  type WritingPiece,
} from "@/lib/types";
import { estimateMastery } from "@/lib/mastery/engine";
import { schedule } from "@/lib/srs/scheduler";
import {
  ALL_BADGES,
  advanceQuests,
  awardXp,
  initGameState,
  refreshQuests,
  registerActivity,
} from "@/lib/game/progression";
import { uid } from "@/lib/utils";

export interface Settings {
  theme: "system" | "light" | "dark";
  reducedMotion: boolean;
  sound: boolean;
}

interface StoreState {
  hasHydrated: boolean;
  profile: Profile | null;
  game: GameState;
  knowledge: Record<string, NodeKnowledge>;
  subjects: Subject[]; // user-added (includes sample subjects once added)
  activeSubjectId: string | null;
  reviews: ReviewItem[];
  notes: KnowledgeNote[];
  research: ResearchProject[];
  writing: WritingPiece[];
  portfolio: PortfolioProject[];
  problems: ProblemAttempt[];
  externalLogs: ExternalLog[];
  completedLessons: string[];
  defeatedBosses: string[];
  settings: Settings;

  // lifecycle
  setHydrated: (v: boolean) => void;
  createProfile: (name: string, dailyMinutes: number, goal?: string) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  resetAll: () => void;

  // learning
  recordEvents: (events: AssessmentEvent[]) => void;
  completeLesson: (
    lessonId: string,
    events: AssessmentEvent[],
    reviewSeeds: {
      nodeId: string;
      front: string;
      back: string;
      subjectId?: string;
      worldId?: string;
    }[],
  ) => { leveledUp: boolean; newBadges: string[] };
  gradeReview: (itemId: string, grade: RecallGrade) => void;
  addReview: (item: Omit<ReviewItem, "id">) => void;

  // subjects
  addSubject: (s: Subject) => void;
  setActiveSubject: (id: string | null) => void;
  removeSubject: (id: string) => void;

  // banks
  upsertNote: (note: Partial<KnowledgeNote> & { id?: string }) => KnowledgeNote;
  deleteNote: (id: string) => void;
  upsertResearch: (p: Partial<ResearchProject> & { id?: string }) => ResearchProject;
  deleteResearch: (id: string) => void;
  upsertWriting: (w: Partial<WritingPiece> & { id?: string }) => WritingPiece;
  addProblemAttempt: (p: Omit<ProblemAttempt, "id" | "at">) => void;
  upsertPortfolio: (p: Partial<PortfolioProject> & { id?: string }) => PortfolioProject;
  logExternalActivity: (
    activity: ExternalActivity,
    detail?: string,
  ) => { leveledUp: boolean; points: number };

  // game
  defeatBoss: (bossId: string) => void;
  grantBadge: (badgeId: string) => void;
  tickQuests: () => void;

  // settings
  setSettings: (patch: Partial<Settings>) => void;
}

const BADGE_IDS = new Set(ALL_BADGES.map((b) => b.id));

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      profile: null,
      game: initGameState(),
      knowledge: {},
      subjects: [],
      activeSubjectId: null,
      reviews: [],
      notes: [],
      research: [],
      writing: [],
      portfolio: [],
      problems: [],
      externalLogs: [],
      completedLessons: [],
      defeatedBosses: [],
      settings: { theme: "system", reducedMotion: false, sound: true },

      setHydrated: (v) => set({ hasHydrated: v }),

      createProfile: (name, dailyMinutes, goal) =>
        set({
          profile: {
            id: uid("u_"),
            name: name.trim() || "Learner",
            createdAt: Date.now(),
            dailyMinutes,
            goal,
          },
          game: refreshQuests(registerActivity(initGameState())),
        }),

      updateProfile: (patch) =>
        set((s) => (s.profile ? { profile: { ...s.profile, ...patch } } : {})),

      resetAll: () =>
        set({
          profile: null,
          game: initGameState(),
          knowledge: {},
          subjects: [],
          activeSubjectId: null,
          reviews: [],
          notes: [],
          research: [],
          writing: [],
          portfolio: [],
          problems: [],
          externalLogs: [],
          completedLessons: [],
          defeatedBosses: [],
        }),

      recordEvents: (events) =>
        set((s) => {
          const knowledge = { ...s.knowledge };
          for (const e of events) {
            const prev =
              knowledge[e.nodeId] ??
              ({
                nodeId: e.nodeId,
                status: "discovered",
                events: [],
                firstSeen: e.at,
                lastSeen: e.at,
              } as NodeKnowledge);
            const merged: NodeKnowledge = {
              ...prev,
              events: [...prev.events, e],
              lastSeen: Math.max(prev.lastSeen, e.at),
              firstSeen: Math.min(prev.firstSeen, e.at),
            };
            merged.status = estimateMastery(merged.events, e.at).status;
            knowledge[e.nodeId] = merged;
          }
          return { knowledge };
        }),

      completeLesson: (lessonId, events, reviewSeeds) => {
        const s = get();
        // 1. record evidence
        get().recordEvents(events);
        // 2. seed reviews (dedupe by nodeId+front)
        const existing = new Set(s.reviews.map((r) => r.nodeId + "|" + r.front));
        const now = Date.now();
        const newReviews: ReviewItem[] = reviewSeeds
          .filter((r) => !existing.has(r.nodeId + "|" + r.front))
          .map((r) => ({
            id: uid("rv_"),
            nodeId: r.nodeId,
            front: r.front,
            back: r.back,
            subjectId: r.subjectId,
            worldId: r.worldId as ReviewItem["worldId"],
            ease: 2.5,
            intervalDays: 0,
            repetitions: 0,
            due: now,
            lapses: 0,
            createdAt: now,
            source: "lesson",
          }));
        // 3. gamification
        let game = registerActivity(s.game, now);
        const avg =
          events.reduce((a, e) => a + e.score, 0) / Math.max(1, events.length);
        const xpEarned = Math.round(15 + 10 * avg); // effort + quality
        const res = awardXp(game, xpEarned);
        game = res.state;
        game = advanceQuests(game, "lessons", 1);
        game = advanceQuests(game, "xp", xpEarned);
        game = refreshQuests(game, now);

        // 4. badges
        const newBadges: string[] = [];
        const grant = (id: string) => {
          if (BADGE_IDS.has(id) && !game.badges.includes(id)) {
            game.badges = [...game.badges, id];
            newBadges.push(id);
          }
        };
        if (!s.completedLessons.length) grant("first-lesson");
        if (game.streakDays >= 7) grant("streak-7");
        if (game.streakDays >= 30) grant("streak-30");

        set({
          game,
          reviews: [...get().reviews, ...newReviews],
          completedLessons: s.completedLessons.includes(lessonId)
            ? s.completedLessons
            : [...s.completedLessons, lessonId],
        });

        // 5. mastery badge check (after knowledge updated)
        const k = get().knowledge;
        if (Object.values(k).some((n) => n.status === "mastered")) {
          get().grantBadge("first-mastery");
        }

        return { leveledUp: res.leveledUp, newBadges };
      },

      gradeReview: (itemId, grade) =>
        set((s) => {
          const now = Date.now();
          let game = registerActivity(s.game, now);
          game = advanceQuests(game, "reviews", 1);
          const reviews = s.reviews.map((r) =>
            r.id === itemId ? schedule(r, grade, now) : r,
          );
          // Record a lightweight review event for mastery/retention signal.
          const item = s.reviews.find((r) => r.id === itemId);
          if (item) {
            get().recordEvents([
              {
                id: uid("ev_"),
                nodeId: item.nodeId,
                at: now,
                score: grade === 0 ? 0.2 : grade === 1 ? 0.6 : grade === 2 ? 0.85 : 1,
                cognitiveLevel: "recall",
                difficulty: 2,
                independence: 1,
                dimensions: ["retention", "accuracy"],
                kind: "review",
              },
            ]);
          }
          const first = !s.game.badges.includes("first-recall");
          if (first) game = { ...game, badges: [...game.badges, "first-recall"] };
          return { reviews, game };
        }),

      addReview: (item) =>
        set((s) => ({ reviews: [...s.reviews, { ...item, id: uid("rv_") }] })),

      addSubject: (subj) =>
        set((s) => {
          if (s.subjects.some((x) => x.id === subj.id)) {
            return { activeSubjectId: subj.id };
          }
          const game = s.game.badges.includes("first-subject")
            ? s.game
            : { ...s.game, badges: [...s.game.badges, "first-subject"] };
          return {
            subjects: [...s.subjects, subj],
            activeSubjectId: subj.id,
            game,
          };
        }),

      setActiveSubject: (id) => set({ activeSubjectId: id }),

      removeSubject: (id) =>
        set((s) => ({
          subjects: s.subjects.filter((x) => x.id !== id),
          activeSubjectId: s.activeSubjectId === id ? null : s.activeSubjectId,
        })),

      upsertNote: (note) => {
        const now = Date.now();
        const existing = note.id ? get().notes.find((n) => n.id === note.id) : undefined;
        const full: KnowledgeNote = {
          id: existing?.id ?? uid("note_"),
          type: note.type ?? existing?.type ?? "knowledge",
          title: note.title ?? existing?.title ?? "Untitled",
          body: note.body ?? existing?.body ?? "",
          tags: note.tags ?? existing?.tags ?? [],
          links: note.links ?? existing?.links ?? [],
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
          sourceNodeId: note.sourceNodeId ?? existing?.sourceNodeId,
        };
        set((s) => ({
          notes: existing
            ? s.notes.map((n) => (n.id === full.id ? full : n))
            : [...s.notes, full],
        }));
        return full;
      },

      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      upsertResearch: (p) => {
        const now = Date.now();
        const existing = p.id ? get().research.find((r) => r.id === p.id) : undefined;
        const full: ResearchProject = {
          id: existing?.id ?? uid("res_"),
          question: p.question ?? existing?.question ?? "",
          plan: p.plan ?? existing?.plan ?? "",
          createdAt: existing?.createdAt ?? now,
          sources: p.sources ?? existing?.sources ?? [],
          claims: p.claims ?? existing?.claims ?? [],
          findings: p.findings ?? existing?.findings ?? "",
          report: p.report ?? existing?.report ?? "",
          status: p.status ?? existing?.status ?? "planning",
        };
        set((s) => ({
          research: existing
            ? s.research.map((r) => (r.id === full.id ? full : r))
            : [...s.research, full],
        }));
        if (full.status === "done") get().grantBadge("researcher");
        return full;
      },

      deleteResearch: (id) =>
        set((s) => ({ research: s.research.filter((r) => r.id !== id) })),

      upsertWriting: (w) => {
        const now = Date.now();
        const existing = w.id ? get().writing.find((x) => x.id === w.id) : undefined;
        const full: WritingPiece = {
          id: existing?.id ?? uid("wr_"),
          title: w.title ?? existing?.title ?? "Untitled",
          prompt: w.prompt ?? existing?.prompt ?? "",
          type: w.type ?? existing?.type ?? "free",
          revisions: w.revisions ?? existing?.revisions ?? [],
          rubricScores: w.rubricScores ?? existing?.rubricScores,
          createdAt: existing?.createdAt ?? now,
        };
        set((s) => ({
          writing: existing
            ? s.writing.map((x) => (x.id === full.id ? full : x))
            : [...s.writing, full],
        }));
        if (full.revisions.length >= 2) get().grantBadge("writer");
        return full;
      },

      addProblemAttempt: (p) =>
        set((s) => ({
          problems: [...s.problems, { ...p, id: uid("pa_"), at: Date.now() }],
        })),

      upsertPortfolio: (p) => {
        const existing = p.id ? get().portfolio.find((x) => x.id === p.id) : undefined;
        const full: PortfolioProject = {
          id: existing?.id ?? uid("proj_"),
          title: p.title ?? existing?.title ?? "Untitled project",
          subjectId: p.subjectId ?? existing?.subjectId,
          description: p.description ?? existing?.description ?? "",
          status: p.status ?? existing?.status ?? "idea",
          artifactLinks: p.artifactLinks ?? existing?.artifactLinks ?? [],
          createdAt: existing?.createdAt ?? Date.now(),
        };
        set((s) => ({
          portfolio: existing
            ? s.portfolio.map((x) => (x.id === full.id ? full : x))
            : [...s.portfolio, full],
        }));
        return full;
      },

      logExternalActivity: (activity, detail) => {
        const s = get();
        const now = Date.now();
        const log: ExternalLog = {
          id: uid("xl_"),
          activityId: activity.id,
          title: activity.title,
          category: activity.category,
          points: activity.points,
          detail,
          at: now,
        };
        let game = registerActivity(s.game, now);
        const res = awardXp(game, activity.points);
        game = res.state;
        game = advanceQuests(game, "xp", activity.points);
        game = advanceQuests(game, "challenges", 1);
        game = refreshQuests(game, now);

        const logs = [...s.externalLogs, log];
        if (!game.badges.includes("wild-learner"))
          game = { ...game, badges: [...game.badges, "wild-learner"] };
        const cats = new Set(logs.map((l) => l.category));
        if (cats.size >= 4 && !game.badges.includes("polymath"))
          game = { ...game, badges: [...game.badges, "polymath"] };

        set({ externalLogs: logs, game });
        return { leveledUp: res.leveledUp, points: activity.points };
      },

      defeatBoss: (bossId) =>
        set((s) => {
          const game = s.game.badges.includes("boss-win")
            ? s.game
            : { ...s.game, badges: [...s.game.badges, "boss-win"] };
          const res = awardXp(game, 80);
          return {
            defeatedBosses: s.defeatedBosses.includes(bossId)
              ? s.defeatedBosses
              : [...s.defeatedBosses, bossId],
            game: res.state,
          };
        }),

      grantBadge: (badgeId) =>
        set((s) =>
          BADGE_IDS.has(badgeId) && !s.game.badges.includes(badgeId)
            ? { game: { ...s.game, badges: [...s.game.badges, badgeId] } }
            : {},
        ),

      tickQuests: () => set((s) => ({ game: refreshQuests(s.game) })),

      setSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: "mastery-store-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => {
        // exclude transient hydration flag
        const { hasHydrated, ...rest } = s;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
