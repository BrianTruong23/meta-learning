"use client";

import { useMemo, useState } from "react";
import {
  Puzzle,
  ExternalLink,
  Check,
  Plus,
  Trophy,
  ShieldCheck,
  Flame,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, Input, Label, Select } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";
import { challengeCatalog, CATEGORY_META } from "@/lib/content/challenges";
import { todayKey } from "@/lib/game/progression";
import { relativeTime, uid } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ExternalActivity, ExternalCategory } from "@/lib/types";

export default function ChallengesPage() {
  const logs = useStore((s) => s.externalLogs);
  const log = useStore((s) => s.logExternalActivity);

  const [cat, setCat] = useState<ExternalCategory | "all">("all");
  const [logging, setLogging] = useState<ExternalActivity | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [custom, setCustom] = useState(false);

  const today = todayKey();
  const loggedTodayIds = useMemo(
    () => new Set(logs.filter((l) => todayKey(l.at) === today).map((l) => l.activityId)),
    [logs, today],
  );

  const pointsFromChallenges = logs.reduce((a, l) => a + l.points, 0);
  const todayCount = logs.filter((l) => todayKey(l.at) === today).length;

  const visible =
    cat === "all" ? challengeCatalog : challengeCatalog.filter((a) => a.category === cat);

  function doLog(activity: ExternalActivity, detail?: string) {
    const res = log(activity, detail);
    setLogging(null);
    setToast(`+${res.points} XP · ${activity.title}${res.leveledUp ? " · Level up! 🎉" : ""}`);
    setTimeout(() => setToast(null), 2600);
  }

  return (
    <div>
      <PageHeader
        title="Challenges in the Wild"
        subtitle="Learning happens everywhere. Do real intellectual activities — anywhere — and log them to earn XP toward your level and streak."
        action={
          <Button variant="secondary" className="gap-2" onClick={() => setCustom(true)}>
            <Plus className="h-4 w-4" /> Custom activity
          </Button>
        }
      />

      {/* Honor-system + stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Trophy className="h-6 w-6 text-accent" />
            <div>
              <p className="font-display text-2xl">{pointsFromChallenges}</p>
              <p className="text-xs text-muted-foreground">XP earned in the wild</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Flame className="h-6 w-6 text-[hsl(var(--warning))]" />
            <div>
              <p className="font-display text-2xl">{todayCount}</p>
              <p className="text-xs text-muted-foreground">logged today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface-2">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-6 w-6 shrink-0 text-success" />
            <p className="text-xs text-muted-foreground">
              Honor system. These earn <strong className="text-foreground">XP</strong>, not mastery —
              you're only cheating your own growth.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        <FilterChip active={cat === "all"} onClick={() => setCat("all")}>
          All
        </FilterChip>
        {(Object.keys(CATEGORY_META) as ExternalCategory[]).map((c) => (
          <FilterChip key={c} active={cat === c} onClick={() => setCat(c)} color={CATEGORY_META[c].color}>
            {CATEGORY_META[c].label}
          </FilterChip>
        ))}
      </div>

      {/* Activities */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((a) => {
          const meta = CATEGORY_META[a.category];
          const doneToday = a.cadence === "daily" && loggedTodayIds.has(a.id);
          return (
            <Card key={a.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                    style={{
                      background: `hsl(var(--${meta.color}) / 0.14)`,
                      color: `hsl(var(--${meta.color}))`,
                    }}
                  >
                    {meta.label}
                  </span>
                  <Badge tone="accent">+{a.points}</Badge>
                </div>
                <h3 className="font-display mt-3 text-lg">{a.title}</h3>
                <p className="text-xs font-medium text-muted-foreground">{a.provider}</p>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{a.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  {a.url && (
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1.5">
                        Open <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                  {doneToday ? (
                    <Button size="sm" variant="ghost" disabled className="flex-1 gap-1.5 text-success">
                      <Check className="h-4 w-4" /> Done today
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className={cn("gap-1.5", a.url ? "flex-1" : "w-full")}
                      onClick={() => (a.detailLabel ? setLogging(a) : doLog(a))}
                    >
                      <Check className="h-4 w-4" /> Log it
                    </Button>
                  )}
                </div>
                {a.cadence === "daily" && (
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Daily · resets each day
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent log */}
      {logs.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Recently logged</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {logs
                .slice()
                .reverse()
                .slice(0, 10)
                .map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0">
                      <span className="font-medium">{l.title}</span>
                      {l.detail && <span className="text-muted-foreground"> · {l.detail}</span>}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      <Badge tone="accent">+{l.points}</Badge>
                      {relativeTime(l.at)}
                    </span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Log-detail modal */}
      {logging && (
        <Modal onClose={() => setLogging(null)} title={`Log: ${logging.title}`}>
          <LogForm activity={logging} onSubmit={(detail) => doLog(logging, detail)} />
        </Modal>
      )}

      {/* Custom activity modal */}
      {custom && (
        <Modal onClose={() => setCustom(false)} title="Log a custom activity">
          <CustomForm
            onSubmit={(activity, detail) => {
              doLog(activity, detail);
              setCustom(false);
            }}
          />
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-pop rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-card-hover">
          {toast}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
        active ? "border-transparent text-white" : "border-border hover:bg-surface-2",
      )}
      style={active ? { background: color ? `hsl(var(--${color}))` : "hsl(var(--foreground))" } : undefined}
    >
      {children}
    </button>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <button onClick={onClose} aria-label="Close">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

function LogForm({
  activity,
  onSubmit,
}: {
  activity: ExternalActivity;
  onSubmit: (detail?: string) => void;
}) {
  const [detail, setDetail] = useState("");
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{activity.description}</p>
      <div>
        <Label>{activity.detailLabel ?? "Note (optional)"}</Label>
        <Input
          autoFocus
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="Optional — record your result"
          onKeyDown={(e) => e.key === "Enter" && onSubmit(detail || undefined)}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">
          Reward: <Badge tone="accent">+{activity.points} XP</Badge>
        </span>
        <Button onClick={() => onSubmit(detail || undefined)} className="gap-1.5">
          <Check className="h-4 w-4" /> Confirm (honor system)
        </Button>
      </div>
    </div>
  );
}

function CustomForm({
  onSubmit,
}: {
  onSubmit: (activity: ExternalActivity, detail?: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ExternalCategory>("knowledge");
  const [points, setPoints] = useState(20);
  const [detail, setDetail] = useState("");

  return (
    <div className="space-y-3">
      <div>
        <Label>What did you do?</Label>
        <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Solved a logic grid puzzle" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Category</Label>
          <Select value={category} onChange={(e) => setCategory(e.target.value as ExternalCategory)}>
            {(Object.keys(CATEGORY_META) as ExternalCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Effort → XP</Label>
          <Select value={points} onChange={(e) => setPoints(Number(e.target.value))}>
            <option value={10}>Light (+10)</option>
            <option value={20}>Moderate (+20)</option>
            <option value={35}>Substantial (+35)</option>
            <option value={50}>Deep (+50)</option>
          </Select>
        </div>
      </div>
      <div>
        <Label>Note (optional)</Label>
        <Input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="One takeaway or result" />
      </div>
      <Button
        disabled={!title.trim()}
        className="w-full gap-1.5"
        onClick={() =>
          onSubmit(
            {
              id: "custom_" + uid(),
              title: title.trim(),
              provider: "Custom",
              description: "A custom logged activity.",
              category,
              points,
              cadence: "repeatable",
              custom: true,
            },
            detail || undefined,
          )
        }
      >
        <Check className="h-4 w-4" /> Log activity (+{points} XP)
      </Button>
    </div>
  );
}
