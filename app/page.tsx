"use client";

import Link from "next/link";
import {
  Sparkles,
  Brain,
  Microscope,
  PenLine,
  BookOpen,
  Lightbulb,
  Target,
  Repeat,
  Network,
  ArrowRight,
  Puzzle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store/store";
import { useHydrated } from "@/lib/store/hooks";

const worldCards = [
  { icon: Brain, n: "01", title: "Learn how to learn", color: "world-learn", body: "Retrieval, spacing, interleaving, metacognition — the evidence-based engine of durable learning." },
  { icon: Microscope, n: "02", title: "Learn how to research", color: "world-research", body: "Ask sharp questions, find and judge sources, build evidence-grounded conclusions." },
  { icon: PenLine, n: "03", title: "Learn how to write", color: "world-write", body: "Use writing to think — theses, argument, revision, explaining complexity simply." },
  { icon: BookOpen, n: "04", title: "Learn how to read", color: "world-read", body: "Active, analytical, and syntopical reading that turns text into understanding." },
  { icon: Lightbulb, n: "05", title: "Learn how to think", color: "world-think", body: "First-principles, systems, and probabilistic reasoning for unfamiliar problems." },
];

const pillars = [
  { icon: Target, title: "Mastery, not minutes", body: "Progress is earned by demonstrated competence and transfer — never by time spent or clicking through lessons." },
  { icon: Repeat, title: "Science-backed by default", body: "Spaced repetition, retrieval practice, and interleaving are built into the core loop, not bolted on." },
  { icon: Network, title: "A living knowledge graph", body: "Every concept connects. Watch your understanding grow from Discovered to Mastered." },
];

export default function Landing() {
  const hydrated = useHydrated();
  const profile = useStore((s) => s.profile);
  const startHref = hydrated && profile ? "/dashboard" : "/onboarding";

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Brand />
        <div className="flex items-center gap-2">
          <Link href="/academy">
            <Button variant="ghost" size="sm">
              Explore
            </Button>
          </Link>
          <Link href={startHref}>
            <Button size="sm">{hydrated && profile ? "Continue" : "Get started"}</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pb-12 pt-12 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground shadow-card">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Learn how to learn. Master anything.
          </span>
          <h1 className="font-display mt-6 text-[2.6rem] leading-[1.05] md:text-[4.2rem]">
            Don't just finish courses.
            <br className="hidden sm:block" /> Truly{" "}
            <span className="accent-underline">master</span> the subject.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Mastery builds the universal skills of learning, research, writing, reading, and
            thinking — then turns any topic into a personalized, science-backed path with spaced
            review, real problem-solving, and honest, evidence-based progress.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={startHref}>
              <Button size="lg" className="gap-2">
                {hydrated && profile ? "Continue learning" : "Start free"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/topics">
              <Button size="lg" variant="secondary">
                What do you want to master?
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            No account or key needed — runs locally in your browser. Progress is saved on this
            device.
          </p>
        </div>
      </section>

      {/* Worlds — editorial numbered list */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">The foundations</p>
            <h2 className="font-display mt-1 text-3xl md:text-4xl">Five worlds of thinking</h2>
          </div>
          <p className="hidden max-w-xs text-sm text-muted-foreground sm:block">
            The intellectual foundations that make every subject easier to master.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {worldCards.map((w) => {
            const Icon = w.icon;
            return (
              <div key={w.title} className="group bg-surface p-6 transition-colors hover:bg-surface-2">
                <div className="flex items-center justify-between">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-2xl text-white"
                    style={{ background: `hsl(var(--${w.color}))` }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-2xl text-muted-foreground/40">{w.n}</span>
                </div>
                <h3 className="font-display mt-4 text-xl">{w.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{w.body}</p>
              </div>
            );
          })}
          {/* Topic X call-to-action tile */}
          <div className="relative flex flex-col justify-between bg-primary p-6 text-primary-foreground">
            <div>
              <Sparkles className="h-6 w-6" />
              <h3 className="font-display mt-4 text-xl">Then master any topic X</h3>
              <p className="mt-1.5 text-sm opacity-90">
                ML, finance, philosophy, anything — a structured curriculum and skill tree in
                seconds.
              </p>
            </div>
            <Link href="/topics" className="mt-5">
              <Button variant="secondary" size="sm" className="gap-1 text-foreground">
                Try it <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="rounded-2xl border border-border bg-surface p-6 shadow-card">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-4 text-lg">{p.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Earn points in the wild */}
      <section className="mx-auto max-w-6xl px-5 py-6">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-border bg-surface p-7 shadow-card md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent">
              <Puzzle className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-xl">Learning doesn't only happen here</h3>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Play Wordle, solve a chess puzzle, read a paper, grind a LeetCode problem — log real
                intellectual activities from anywhere and earn XP toward your streak.
              </p>
            </div>
          </div>
          <Link href={hydrated && profile ? "/challenges" : "/onboarding"}>
            <Button className="shrink-0 gap-2">
              Explore challenges <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h2 className="font-display text-3xl md:text-4xl">Make yourself need us less.</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Mastery succeeds when you can independently ask great questions, find reliable
          information, reason clearly, and teach yourself anything.
        </p>
        <Link href={startHref} className="mt-8 inline-block">
          <Button size="lg" className="gap-2">
            Begin your path <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <Brand className="mb-3 justify-center" />
        Mastery · a demo learning platform · built with Next.js
      </footer>
    </div>
  );
}

function Brand({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-background">
        <Sparkles className="h-5 w-5" />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">Mastery</span>
    </div>
  );
}
