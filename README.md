# Mastery

**Learn how to learn. Master anything.**

A gamified, metacognition-first learning platform. Mastery teaches the five universal
intellectual foundations — **learning, research, writing, reading, and thinking** — and then turns
any subject into a personalized, evidence-based mastery path with spaced review, interactive
problem-solving, an AI tutor, and honest progress tracking.

This is a **functional MVP vertical slice**: a real, runnable app where every visible core feature
works. It runs **100% locally in your browser** — no account, no backend, no API key required.

```bash
npm install
npm run dev        # http://localhost:3000
```

> Port 3000 busy? Next picks the next free port (watch the console), or run `npx next dev -p 3003`.

---

## What works (acceptance journey)

Create a local profile → onboarding → diagnostic placement → complete interactive foundational
lessons with varied exercises and explanatory feedback → earn XP and keep a streak → generate (or
add) a subject curriculum → explore its skill tree → practice and solve problems → reviews come due
via spaced repetition → **reload the page and your progress persists** → the dashboard always shows
your single next best action. Boss battles, an AI tutor, research/reading/writing labs, a personal
knowledge library + graph, analytics, and a project portfolio are all functional.

## Core principles (enforced in code, not just copy)

- **Mastery is earned, not awarded.** `lib/mastery/engine.ts` estimates competence only from real
  assessment evidence (weighted by cognitive level, difficulty, independence, recency, and
  retention). With too little evidence it returns `sufficient: false` and says so — it never
  invents a percentage. Self-reported confidence is tracked **separately** as calibration.
- **Game XP ≠ knowledge.** `lib/game/progression.ts` (XP, 8 ranks, streaks, quests, badges) is
  deliberately decoupled from mastery. Breaks and mistakes are never punished (freeze tokens
  forgive a missed day).
- **Science-backed by default.** Retrieval practice, spacing (`lib/srs/scheduler.ts`, an SM-2
  variant), and interleaving are built into the core loop. Lessons explicitly debunk the
  learning-styles myth and illusions of competence — with real citations.
- **Honest AI.** Ships in **demo mode** with a deterministic offline generator; all generated
  content is labelled and never claims exhaustive coverage. The tutor never fabricates citations.

## Architecture

| Layer | Where | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router), TypeScript, Tailwind | `app/`, hand-built shadcn-style UI in `components/ui` |
| State | Zustand + `persist` → `localStorage` | `lib/store/store.ts`; everything goes through the store, guarded for empty/first-run |
| Large blobs | IndexedDB | `lib/store/files.ts` (uploaded research files only) |
| Domain engines (pure, tested) | `lib/srs`, `lib/mastery`, `lib/game` | no React/storage deps |
| Knowledge graph / skill tree | React Flow | `components/graph`, `app/(app)/subjects`, `app/(app)/graph` |
| Analytics | Recharts | `app/(app)/analytics` |
| Math | KaTeX | inline `$...$` via `components/exercises/katex-text.tsx` |
| Content | typed seed data | `lib/content` — World 1 fully authored; Worlds 2–5 + 2 sample subjects |
| AI | pluggable adapter | `lib/ai` — `LocalAdapter` (demo) + `ClaudeAdapter` → `/api/ai` |

### The AI adapter

Callers depend on a capability (`generateCurriculum`, `tutor`, `scoreOpenResponse`, `diagnostic`),
never a provider (`lib/ai/adapter.ts`). `getAdapter()` probes `/api/ai`: if the server reports a
configured key it uses `ClaudeAdapter`, otherwise the offline `LocalAdapter`. Every `ClaudeAdapter`
call falls back to local on failure, so the app degrades gracefully.

## Enabling real AI (optional)

Demo mode needs nothing. To wire real AI (tutor + open-response grading via Claude):

```bash
cp .env.example .env.local
# set ANTHROPIC_API_KEY=... and optionally ANTHROPIC_MODEL=<a model you can access>
npm run dev
```

The key is read **only** on the server in `app/api/ai/route.ts` and never exposed to the browser.
That route validates and size-caps input (zod), rate-limits per client, and wraps untrusted
learner/document text in delimiters with instructions never to follow commands inside it
(prompt-injection defense). The badge in the top bar shows **Demo mode** vs **AI mode** honestly.

## Testing

```bash
npm run test        # 27 Vitest unit tests: SRS, mastery (incl. "insufficient evidence"), game, LocalAdapter
npm run build       # production build + type-check + lint
npm run test:e2e    # Playwright smoke test of the full journey
```

The e2e suite reads `PORT` / `BASE_URL`, e.g. `BASE_URL=http://localhost:3003 npm run test:e2e`
to target an already-running server.

## Key design decisions

1. **Local-first over Supabase (for now).** Chosen so the app is fully runnable and demoable with
   zero setup. The store is the single seam; a backend sync layer can replace `localStorage`
   without touching components. Supabase/auth/RLS is the documented next milestone.
2. **Demo generator is deterministic.** Same topic → same curriculum, so the experience is stable
   and testable offline, and the AI path is a drop-in upgrade.
3. **Subject lesson bodies are generated on demand** from concept nodes (`getLessonsForConcept`)
   to keep seed payloads small while every concept remains studyable.
4. **Rubric grading is transparent.** In demo mode, open responses are scored by a visible
   keyword/length heuristic that tells the learner to self-grade against the rubric and reference —
   never a hidden, false "correctness" judgment.

## Deferred (next milestones)

Supabase auth + Postgres + row-level security + cross-device sync · real PDF/file parsing beyond
text · vector search · multiplayer leaderboards · full authoring of Worlds 2–5 · delayed-retention
capstones. These are intentionally out of this MVP slice.

## Project map

```
app/                 routes (landing, onboarding, diagnostic, (app)/* shell pages, api/ai)
components/ui/        hand-built primitives (button, card, inputs, badge, progress…)
components/exercises/ ExercisePlayer + all exercise types + KaTeX renderer
components/graph/     React Flow skill tree
components/shell/     app shell, nav, theme toggle, demo badge, page header
lib/types.ts          the whole domain model
lib/store/            Zustand store, selectors, hydration hook, IndexedDB files
lib/srs|mastery|game/ pure engines (unit-tested)
lib/ai/               adapter interface, LocalAdapter, ClaudeAdapter, selector
lib/content/          worlds, authored lessons, bosses, sample subjects
tests/                Vitest unit tests + Playwright e2e
```
