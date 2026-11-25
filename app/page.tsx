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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store/store";
import { useHydrated } from "@/lib/store/hooks";

const worldCards = [
  { icon: Brain, title: "Learn how to learn", color: "var(--world-learn)", body: "Retrieval, spacing, interleaving, metacognition — the evidence-based engine of durable learning." },
  { icon: Microscope, title: "Learn how to research", color: "var(--world-research)", body: "Ask sharp questions, find and judge sources, and build evidence-grounded conclusions." },
  { icon: PenLine, title: "Learn how to write", color: "var(--world-write)", body: "Use writing to think — theses, argument, revision, and explaining complexity simply." },
  { icon: BookOpen, title: "Learn how to read", color: "var(--world-read)", body: "Active, analytical, and syntopical reading that turns text into understanding." },
  { icon: Lightbulb, title: "Learn how to think", color: "var(--world-think)", body: "First-principles, systems, and probabilistic reasoning for unfamiliar problems." },
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
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2 font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-xl tracking-tight">Mastery</span>
        </div>
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
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-10 md:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Learn how to learn. Master anything.
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
            Don't just finish courses.{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Actually master the subject.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Mastery builds the universal skills of learning, research, writing, reading, and
            thinking — then turns any topic into a personalized, science-backed path with
            spaced review, real problem-solving, and honest, evidence-based progress.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
          <p className="mt-4 text-xs text-muted-foreground">
            No account or key needed — runs locally in your browser. Progress is saved on this
            device.
          </p>
        </div>
      </section>

      {/* Worlds */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <h2 className="mb-1 text-center text-2xl font-bold">Five foundational worlds</h2>
        <p className="mb-7 text-center text-muted-foreground">
          The intellectual foundations that make every subject easier to master.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {worldCards.map((w) => {
            const Icon = w.icon;
            return (
              <Card key={w.title} className="p-5 transition-shadow hover:shadow-card-hover">
                <div
                  className="mb-3 grid h-11 w-11 place-items-center rounded-xl text-white"
                  style={{ background: `hsl(${w.color})` }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">{w.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{w.body}</p>
              </Card>
            );
          })}
          <Card className="flex flex-col justify-center bg-primary p-5 text-primary-foreground">
            <h3 className="text-lg font-bold">Then master any topic X</h3>
            <p className="mt-1 text-sm opacity-90">
              Machine learning, finance, philosophy, anything — get a structured curriculum and
              skill tree in seconds.
            </p>
            <Link href="/topics" className="mt-4">
              <Button variant="secondary" size="sm" className="gap-1">
                Try it <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="rounded-2xl border border-border bg-surface p-5">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-bold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h2 className="text-3xl font-bold">The goal: make yourself need us less.</h2>
        <p className="mt-3 text-muted-foreground">
          Mastery succeeds when you can independently ask great questions, find reliable
          information, reason clearly, and teach yourself anything.
        </p>
        <Link href={startHref} className="mt-7 inline-block">
          <Button size="lg" className="gap-2">
            Begin your path <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Mastery · a demo learning platform · built with Next.js
      </footer>
    </div>
  );
}
