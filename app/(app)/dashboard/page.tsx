"use client";

import Link from "next/link";
import {
  Play,
  Flame,
  Zap,
  Layers,
  Target,
  TrendingUp,
  Microscope,
  ArrowRight,
  Trophy,
  Brain,
  CheckCircle2,
  Puzzle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, Progress, EmptyState } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";
import {
  useActiveSubject,
  useDueReviews,
  useUpcomingReviews,
  useSubjectMastery,
  useKnowledgeHighlights,
  useNextFoundationLesson,
} from "@/lib/store/selectors";
import { levelProgress, rankForLevel } from "@/lib/game/progression";
import { statusLabel } from "@/lib/mastery/engine";
import { dueLabel } from "@/lib/srs/scheduler";

export default function Dashboard() {
  const profile = useStore((s) => s.profile);
  const game = useStore((s) => s.game);
  const research = useStore((s) => s.research);
  const subject = useActiveSubject();
  const due = useDueReviews();
  const upcoming = useUpcomingReviews();
  const mastery = useSubjectMastery(subject);
  const highlights = useKnowledgeHighlights();
  const nextLesson = useNextFoundationLesson();

  const lp = levelProgress(game.xp);
  const rank = rankForLevel(lp.level);

  // Next recommended action — make it obvious.
  const primary =
    due.length > 0
      ? { label: `Review ${due.length} due item${due.length > 1 ? "s" : ""}`, href: "/review", icon: Layers }
      : nextLesson
        ? { label: `Continue: ${nextLesson.title}`, href: `/lesson/${nextLesson.id}`, icon: Play }
        : { label: "Explore a new topic", href: "/topics", icon: Target };
  const PrimaryIcon = primary.icon;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${profile?.name ?? "Learner"}`}
        subtitle="Here's your next best step and where your understanding stands."
      />

      {/* Hero: next action */}
      <Card className="mb-6 overflow-hidden border-0 bg-foreground text-background shadow-card-hover">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Your next best step
            </p>
            <h2 className="font-display mt-2 text-2xl md:text-3xl">{primary.label}</h2>
            <p className="mt-1.5 text-sm text-background/70">
              {due.length > 0
                ? "Spaced review first — it's the highest-leverage thing you can do right now."
                : "Keep your momentum going."}
            </p>
          </div>
          <Link href={primary.href}>
            <Button size="lg" variant="secondary" className="gap-2 text-foreground">
              <PrimaryIcon className="h-5 w-5" /> Start
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Stat row */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={<Zap className="h-5 w-5 text-primary" />} label="Level" value={`${lp.level}`} sub={`${rank}`} />
        <Stat icon={<TrendingUp className="h-5 w-5 text-accent" />} label="Total XP" value={`${game.xp}`} sub={`${lp.span - lp.into} to Lv ${lp.level + 1}`} />
        <Stat icon={<Flame className="h-5 w-5 text-[hsl(var(--warning))]" />} label="Streak" value={`${game.streakDays}d`} sub={`Best ${game.longestStreak}d`} />
        <Stat icon={<Layers className="h-5 w-5 text-success" />} label="Due now" value={`${due.length}`} sub={`${upcoming.length} upcoming`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: plan + mastery */}
        <div className="space-y-6 lg:col-span-2">
          {/* Level progress */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold">Level {lp.level} · {rank}</span>
                <span className="text-muted-foreground">
                  {lp.into} / {lp.span} XP
                </span>
              </div>
              <Progress value={lp.pct} />
            </CardContent>
          </Card>

          {/* Daily quests */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5 text-primary" /> Today's quests
              </CardTitle>
              <Link href="/path" className="text-sm font-semibold text-primary">
                Daily plan →
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {game.quests.filter((q) => q.kind === "daily").map((q) => (
                <div key={q.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      {q.progress >= q.target && <CheckCircle2 className="h-4 w-4 text-success" />}
                      {q.label}
                    </span>
                    <span className="text-muted-foreground">
                      {q.progress}/{q.target} · +{q.xp} XP
                    </span>
                  </div>
                  <Progress value={q.progress / q.target} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Current subject mastery */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-5 w-5 text-primary" />
                {subject ? subject.title : "No subject yet"}
              </CardTitle>
              {subject ? (
                <Link href={`/subjects/${subject.id}`} className="text-sm font-semibold text-primary">
                  Skill tree →
                </Link>
              ) : (
                <Link href="/topics" className="text-sm font-semibold text-primary">
                  Choose one →
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {subject ? (
                <>
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall progress</span>
                    <span className="font-semibold">{Math.round(mastery.avg * 100)}%</span>
                  </div>
                  <Progress value={mastery.avg} className="mb-4" />
                  <div className="flex flex-wrap gap-2">
                    {mastery.perNode.slice(0, 8).map((p) => (
                      <Badge
                        key={p.node.id}
                        tone={
                          p.status === "mastered" || p.status === "proficient"
                            ? "success"
                            : p.status === "undiscovered"
                              ? "muted"
                              : "primary"
                        }
                      >
                        {p.node.name.length > 22 ? p.node.name.slice(0, 22) + "…" : p.node.name}
                      </Badge>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  title="Pick something to master"
                  body="Generate a personalized curriculum for any subject in seconds."
                  action={
                    <Link href="/topics">
                      <Button className="gap-2">
                        Master a topic <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: reviews, weak spots, research */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="h-5 w-5 text-success" /> Upcoming reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 && due.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing scheduled yet. Complete a lesson to start building your review queue.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {due.slice(0, 3).map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">{r.front}</span>
                      <Badge tone="warning">due</Badge>
                    </li>
                  ))}
                  {upcoming.slice(0, 4).map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2">
                      <span className="truncate text-muted-foreground">{r.front}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {dueLabel(r.due)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Focus areas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Weakest concepts
                </p>
                {highlights.weakest.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ul className="space-y-1.5 text-sm">
                    {highlights.weakest.map((w) => (
                      <li key={w.nodeId} className="flex items-center justify-between gap-2">
                        <span className="truncate">{w.name}</span>
                        <Badge tone="warning">{statusLabel(w.est.status)}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {highlights.mastered.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Recently strong
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    {highlights.mastered.map((w) => (
                      <li key={w.nodeId} className="flex items-center justify-between gap-2">
                        <span className="truncate">{w.name}</span>
                        <Badge tone="success">{statusLabel(w.est.status)}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Microscope className="h-5 w-5 text-accent" /> Research
              </CardTitle>
              <Link href="/research" className="text-sm font-semibold text-primary">
                Open →
              </Link>
            </CardHeader>
            <CardContent>
              {research.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active investigations. Start one in the Research Lab.
                </p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {research.slice(0, 3).map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">{r.question || "Untitled"}</span>
                      <Badge tone="accent">{r.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Link href="/challenges">
            <Card className="overflow-hidden border-0 bg-accent/12 transition-shadow hover:shadow-card-hover">
              <CardContent className="flex items-center gap-3 p-5">
                <Puzzle className="h-6 w-6 text-accent" />
                <div>
                  <p className="font-semibold">Earn XP in the wild</p>
                  <p className="text-sm text-muted-foreground">
                    Log Wordle, chess, papers &amp; more
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/achievements">
            <Card className="transition-shadow hover:shadow-card-hover">
              <CardContent className="flex items-center gap-3 p-5">
                <Trophy className="h-6 w-6 text-[hsl(var(--warning))]" />
                <div>
                  <p className="font-semibold">{game.badges.length} badges earned</p>
                  <p className="text-sm text-muted-foreground">View your achievements</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className="text-2xl font-extrabold">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}
