"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";
import { dueForecast, DAY_MS } from "@/lib/srs/scheduler";
import { estimateMastery } from "@/lib/mastery/engine";
import { MASTERY_DIMENSIONS, type MasteryDimension } from "@/lib/types";

const DIM_LABEL: Record<MasteryDimension, string> = {
  coverage: "Coverage",
  accuracy: "Accuracy",
  conceptual: "Concept",
  retention: "Retention",
  application: "Apply",
  problemSolving: "Problems",
  transfer: "Transfer",
  independence: "Independent",
  calibration: "Calibration",
};

export default function AnalyticsPage() {
  const knowledge = useStore((s) => s.knowledge);
  const reviews = useStore((s) => s.reviews);

  const allEvents = useMemo(
    () => Object.values(knowledge).flatMap((k) => k.events),
    [knowledge],
  );

  // Activity: events per day, last 14 days
  const activity = useMemo(() => {
    const now = Date.now();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const days: { day: string; sessions: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const from = start.getTime() - i * DAY_MS;
      const to = from + DAY_MS;
      const count = allEvents.filter((e) => e.at >= from && e.at < to).length;
      days.push({ day: new Date(from).toISOString().slice(5, 10), sessions: count });
    }
    return days;
  }, [allEvents]);

  // Status distribution
  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const k of Object.values(knowledge)) {
      if (!k.events.length) continue;
      const st = estimateMastery(k.events).status;
      counts[st] = (counts[st] ?? 0) + 1;
    }
    return Object.entries(counts).map(([status, n]) => ({
      status: status.replace("-", " "),
      count: n,
    }));
  }, [knowledge]);

  // Per-dimension competence
  const dimensions = useMemo(() => {
    const acc: Record<string, { n: number; d: number }> = {};
    for (const k of Object.values(knowledge)) {
      const est = estimateMastery(k.events);
      for (const dim of MASTERY_DIMENSIONS) {
        const v = est.dimensions[dim];
        if (typeof v === "number") {
          const slot = (acc[dim] ??= { n: 0, d: 0 });
          slot.n += v;
          slot.d += 1;
        }
      }
    }
    return MASTERY_DIMENSIONS.filter((d) => acc[d]).map((d) => ({
      dimension: DIM_LABEL[d],
      value: Math.round((acc[d].n / acc[d].d) * 100),
    }));
  }, [knowledge]);

  const forecast = useMemo(() => dueForecast(reviews, 14), [reviews]);

  if (allEvents.length === 0) {
    return (
      <div>
        <PageHeader title="Progress Analytics" subtitle="Your learning, measured honestly." />
        <EmptyState
          title="No data yet"
          body="Complete some lessons and reviews, then come back to see your activity, mastery spread, and review forecast."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Progress Analytics"
        subtitle="Measured by demonstrated evidence — not time spent. Thin evidence is shown as such."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity (last 14 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--surface))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review forecast (next 14 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--surface))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mastery spread</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="status" width={90} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--surface))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--success))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Competence by dimension</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {dimensions.length >= 3 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={dimensions}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
                Keep practicing across more exercise types to populate the competence radar.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
