"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Layers, BookOpen, Brain, Microscope, PenLine, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";
import { useDueReviews, useNextFoundationLesson, useActiveSubject } from "@/lib/store/selectors";

interface Block {
  icon: React.ElementType;
  title: string;
  desc: string;
  minutes: number;
  href: string;
  tone: "primary" | "accent" | "success" | "warning";
}

export default function PathPage() {
  const profile = useStore((s) => s.profile);
  const due = useDueReviews();
  const nextLesson = useNextFoundationLesson();
  const subject = useActiveSubject();
  const total = profile?.dailyMinutes ?? 20;

  const blocks = useMemo<Block[]>(() => {
    // Allocate the daily budget across the evidence-based mix (spec §17),
    // scaled to the user's available minutes.
    const b: Block[] = [];
    const scale = total / 60;
    if (due.length > 0) {
      b.push({
        icon: Layers,
        title: "Spaced recall",
        desc: `${due.length} item(s) due — retrieve them from memory.`,
        minutes: Math.max(5, Math.round(10 * scale)),
        href: "/review",
        tone: "warning",
      });
    }
    b.push({
      icon: BookOpen,
      title: "New learning",
      desc: nextLesson ? `Lesson: ${nextLesson.title}` : "Pick a concept to study.",
      minutes: Math.max(5, Math.round(15 * scale)),
      href: nextLesson ? `/lesson/${nextLesson.id}` : "/academy",
      tone: "primary",
    });
    b.push({
      icon: Brain,
      title: "Problem-solving",
      desc: subject ? `Practice ${subject.title}` : "Sharpen reasoning in the arena.",
      minutes: Math.max(5, Math.round(15 * scale)),
      href: subject ? "/practice" : "/arena",
      tone: "accent",
    });
    if (total >= 40) {
      b.push({
        icon: Microscope,
        title: "Reading / research",
        desc: "Read actively or advance an investigation.",
        minutes: Math.round(10 * scale),
        href: "/read",
        tone: "success",
      });
      b.push({
        icon: PenLine,
        title: "Write & reflect",
        desc: "Explain what you learned in your own words.",
        minutes: Math.round(10 * scale),
        href: "/write",
        tone: "primary",
      });
    }
    return b;
  }, [due.length, nextLesson, subject, total]);

  const planned = blocks.reduce((a, b) => a + b.minutes, 0);

  return (
    <div>
      <PageHeader
        title="Today's Plan"
        subtitle={`A balanced ~${total}-minute session tuned to what you need most right now.`}
        action={
          <Link href="/settings">
            <Button variant="secondary" className="gap-2">
              <Clock className="h-4 w-4" /> Adjust time
            </Button>
          </Link>
        }
      />

      <Card className="mb-5">
        <CardContent className="flex items-center justify-between p-4">
          <span className="text-sm font-semibold">Planned session</span>
          <Badge tone="primary">~{planned} min</Badge>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {blocks.map((b, i) => {
          const Icon = b.icon;
          return (
            <Link key={i} href={b.href}>
              <Card className="transition-shadow hover:shadow-card-hover">
                <CardContent className="flex items-center gap-4 p-4">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                    style={{
                      background: `hsl(var(--${b.tone}) / 0.15)`,
                      color: `hsl(var(--${b.tone}))`,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{b.title}</p>
                      <Badge tone="muted">{b.minutes} min</Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Short on time? Just do the spaced recall — it's the highest-leverage block.
      </p>
    </div>
  );
}
