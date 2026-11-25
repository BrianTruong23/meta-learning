"use client";

import { useState } from "react";
import { User, Target, Calendar, Zap, Flame, BookCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Badge } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";
import { levelProgress, rankForLevel } from "@/lib/game/progression";
import { relativeTime } from "@/lib/utils";

export default function ProfilePage() {
  const profile = useStore((s) => s.profile);
  const game = useStore((s) => s.game);
  const completed = useStore((s) => s.completedLessons);
  const subjects = useStore((s) => s.subjects);
  const knowledge = useStore((s) => s.knowledge);
  const updateProfile = useStore((s) => s.updateProfile);

  const [name, setName] = useState(profile?.name ?? "");
  const [goal, setGoal] = useState(profile?.goal ?? "");
  const [saved, setSaved] = useState(false);

  if (!profile) return null;
  const lp = levelProgress(game.xp);
  const mastered = Object.values(knowledge).filter(
    (k) => k.events.length > 0,
  ).length;

  function save() {
    updateProfile({ name: name.trim() || profile!.name, goal });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your identity and journey on Mastery." />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-primary text-3xl font-extrabold text-primary-foreground">
              {profile.name.slice(0, 1).toUpperCase()}
            </span>
            <h2 className="mt-3 text-xl font-bold">{profile.name}</h2>
            <Badge tone="primary" className="mt-1">
              {rankForLevel(lp.level)} · Lv {lp.level}
            </Badge>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Joined {relativeTime(profile.createdAt)}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-5 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat icon={<Zap className="h-4 w-4 text-primary" />} value={`${game.xp}`} label="XP" />
            <MiniStat icon={<Flame className="h-4 w-4 text-[hsl(var(--warning))]" />} value={`${game.longestStreak}`} label="Best streak" />
            <MiniStat icon={<BookCheck className="h-4 w-4 text-success" />} value={`${completed.length}`} label="Lessons" />
            <MiniStat icon={<Target className="h-4 w-4 text-accent" />} value={`${mastered}`} label="Concepts" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-5 w-5 text-primary" /> Edit profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="goal">Learning goal</Label>
                <Textarea id="goal" rows={3} value={goal} onChange={(e) => setGoal(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={save}>Save changes</Button>
                {saved && <span className="text-sm text-success">Saved ✓</span>}
              </div>
            </CardContent>
          </Card>

          {subjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Subjects you're mastering</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <Badge key={s.id} tone="primary">
                    {s.title}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xl font-extrabold">
          {icon}
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
