"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Wand2, Plus, FlaskConical, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, Input, Label, Select, Textarea } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";
import { sampleSubjects } from "@/lib/content";
import { getAdapter } from "@/lib/ai";
import type { TopicRequest } from "@/lib/types";

export default function TopicsPage() {
  const router = useRouter();
  const addSubject = useStore((s) => s.addSubject);
  const existing = useStore((s) => s.subjects);

  const [req, setReq] = useState<TopicRequest>({
    topic: "",
    existingKnowledge: "none",
    objectives: "",
    depth: "working",
    weeklyMinutes: 120,
  });
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (!req.topic.trim()) return;
    setBusy(true);
    const adapter = await getAdapter();
    const subject = await adapter.generateCurriculum(req);
    addSubject(subject);
    setBusy(false);
    router.push(`/subjects/${subject.id}`);
  }

  function addSample(id: string) {
    const s = sampleSubjects.find((x) => x.id === id);
    if (!s) return;
    // clone so the stored copy is independent of the template
    const clone = { ...s, createdAt: Date.now() };
    addSubject(clone);
    router.push(`/subjects/${clone.id}`);
  }

  return (
    <div>
      <PageHeader
        title="Master a Topic"
        subtitle="Tell us what you want to learn and we'll build a personalized, source-grounded curriculum and skill tree."
      />

      {/* Generator */}
      <Card className="mb-6 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" /> What do you want to master?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topic">Topic or subject</Label>
            <Input
              id="topic"
              autoFocus
              placeholder="e.g. machine learning, Roman history, music theory, options trading…"
              value={req.topic}
              onChange={(e) => setReq({ ...req, topic: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && generate()}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="know">Your current level</Label>
              <Select
                id="know"
                value={req.existingKnowledge}
                onChange={(e) =>
                  setReq({ ...req, existingKnowledge: e.target.value as TopicRequest["existingKnowledge"] })
                }
              >
                <option value="none">Complete beginner</option>
                <option value="beginner">Some exposure</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="depth">Target depth</Label>
              <Select
                id="depth"
                value={req.depth}
                onChange={(e) => setReq({ ...req, depth: e.target.value as TopicRequest["depth"] })}
              >
                <option value="overview">Overview</option>
                <option value="working">Working competence</option>
                <option value="deep">Deep competence</option>
                <option value="expert">Expert</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="obj">Your objectives (optional)</Label>
            <Textarea
              id="obj"
              rows={2}
              placeholder="Why are you learning this? What do you want to be able to do?"
              value={req.objectives}
              onChange={(e) => setReq({ ...req, objectives: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FlaskConical className="h-3.5 w-3.5" />
              In demo mode this uses a deterministic offline generator — results are clearly
              scoped, never claimed to be exhaustive.
            </p>
            <Button className="gap-2" disabled={busy || !req.topic.trim()} onClick={generate}>
              {busy ? (
                "Generating…"
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate curriculum
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sample curricula */}
      <h2 className="mb-3 text-lg font-bold">Or start with a ready-made curriculum</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {sampleSubjects.map((s) => {
          const added = existing.some((x) => x.id === s.id);
          return (
            <Card key={s.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <Badge tone="accent">sample</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{s.scopeStatement}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.subfields.map((sf) => (
                    <Badge key={sf} tone="muted">
                      {sf}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{s.nodes.length} concepts</span>
                  <Button
                    size="sm"
                    variant={added ? "secondary" : "default"}
                    className="gap-1.5"
                    onClick={() => addSample(s.id)}
                  >
                    {added ? (
                      <>
                        Open <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Add
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {existing.length > 0 && (
        <>
          <h2 className="mb-3 text-lg font-bold">Your subjects</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {existing.map((s) => (
              <Card
                key={s.id}
                className="cursor-pointer transition-shadow hover:shadow-card-hover"
                onClick={() => router.push(`/subjects/${s.id}`)}
              >
                <CardContent className="p-4">
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {s.nodes.length} concepts · {s.source === "demo" ? "demo-generated" : "AI"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
