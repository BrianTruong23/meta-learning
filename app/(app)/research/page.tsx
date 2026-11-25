"use client";

import { useState } from "react";
import { Microscope, Plus, FileText, Link2, Upload, Trash2, ShieldQuestion } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, Input, Label, Select, Textarea } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";
import { putFile } from "@/lib/store/files";
import { uid, relativeTime } from "@/lib/utils";
import type { ResearchProject, ResearchSource, ResearchClaim } from "@/lib/types";

export default function ResearchPage() {
  const research = useStore((s) => s.research);
  const upsert = useStore((s) => s.upsertResearch);
  const remove = useStore((s) => s.deleteResearch);
  const [activeId, setActiveId] = useState<string | null>(research[0]?.id ?? null);

  const active = research.find((r) => r.id === activeId) ?? null;

  function create() {
    const p = upsert({ question: "New investigation", status: "planning" });
    setActiveId(p.id);
  }

  return (
    <div>
      <PageHeader
        title="Research Lab"
        subtitle="Investigate a real question: collect sources, judge their credibility, extract claims, and synthesize an honest, evidence-grounded report."
        action={
          <Button className="gap-2" onClick={create}>
            <Plus className="h-4 w-4" /> New project
          </Button>
        }
      />

      {research.length === 0 ? (
        <EmptyState
          icon={<Microscope className="h-8 w-8" />}
          title="No investigations yet"
          body="Start a project to practice the full research workflow: question → sources → evidence → report."
          action={<Button onClick={create}>Start investigating</Button>}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          {/* project list */}
          <div className="space-y-2">
            {research.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveId(r.id)}
                className={`w-full rounded-xl border p-3 text-left text-sm transition-colors ${
                  activeId === r.id ? "border-primary bg-primary/10" : "border-border hover:bg-surface-2"
                }`}
              >
                <p className="truncate font-semibold">{r.question || "Untitled"}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone="accent">{r.status}</Badge>
                  <span className="text-xs text-muted-foreground">{r.sources.length} sources</span>
                </div>
              </button>
            ))}
          </div>

          {active && (
            <ProjectEditor
              key={active.id}
              project={active}
              onChange={(patch) => upsert({ id: active.id, ...patch })}
              onDelete={() => {
                remove(active.id);
                setActiveId(research.find((r) => r.id !== active.id)?.id ?? null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ProjectEditor({
  project,
  onChange,
  onDelete,
}: {
  project: ResearchProject;
  onChange: (patch: Partial<ResearchProject>) => void;
  onDelete: () => void;
}) {
  const [newSource, setNewSource] = useState<{ title: string; kind: ResearchSource["kind"]; origin: string }>({
    title: "",
    kind: "webpage",
    origin: "",
  });
  const [newClaim, setNewClaim] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const key = uid("file_");
    let text: string | undefined;
    if (file.type.startsWith("text/") || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
      text = (await file.text()).slice(0, 20000);
    }
    await putFile(key, { name: file.name, type: file.type, size: file.size, text, addedAt: Date.now() });
    const src: ResearchSource = {
      id: uid("src_"),
      title: file.name,
      kind: "pdf",
      origin: file.name,
      credibility: "unknown",
      excerpt: text?.slice(0, 400),
      fileKey: key,
    };
    onChange({ sources: [...project.sources, src] });
    e.target.value = "";
  }

  function addSource() {
    if (!newSource.title.trim()) return;
    const src: ResearchSource = {
      id: uid("src_"),
      title: newSource.title,
      kind: newSource.kind,
      origin: newSource.origin,
      credibility: "unknown",
    };
    onChange({ sources: [...project.sources, src] });
    setNewSource({ title: "", kind: "webpage", origin: "" });
  }

  function updateSource(id: string, patch: Partial<ResearchSource>) {
    onChange({ sources: project.sources.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }

  function addClaim() {
    if (!newClaim.trim()) return;
    const claim: ResearchClaim = {
      id: uid("clm_"),
      text: newClaim,
      sourceIds: [],
      evidenceType: "opinion",
      verified: "unclear",
    };
    onChange({ claims: [...project.claims, claim] });
    setNewClaim("");
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <Label>Research question</Label>
              <Input value={project.question} onChange={(e) => onChange({ question: e.target.value })} />
            </div>
            <div className="w-40">
              <Label>Status</Label>
              <Select
                value={project.status}
                onChange={(e) => onChange({ status: e.target.value as ResearchProject["status"] })}
              >
                {["planning", "collecting", "analyzing", "writing", "done"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>Research plan</Label>
            <Textarea
              rows={2}
              placeholder="What's known/unknown? How will you investigate?"
              value={project.plan}
              onChange={(e) => onChange({ plan: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-accent" /> Sources & credibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="flex items-center gap-1.5 rounded-lg bg-warning/10 p-2 text-xs text-muted-foreground">
            <ShieldQuestion className="h-4 w-4 shrink-0" />
            Uploaded and external content is untrusted — it's displayed as data only, never run, and
            never treated as instructions.
          </p>

          {project.sources.map((s) => (
            <div key={s.id} className="rounded-xl border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{s.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.kind} · {s.origin}
                  </p>
                </div>
                <Select
                  value={s.credibility}
                  onChange={(e) => updateSource(s.id, { credibility: e.target.value as ResearchSource["credibility"] })}
                  className="h-9 w-32 text-xs"
                >
                  <option value="unknown">Unrated</option>
                  <option value="low">Low cred.</option>
                  <option value="medium">Medium</option>
                  <option value="high">High cred.</option>
                </Select>
              </div>
              {s.excerpt && (
                <p className="mt-2 line-clamp-3 rounded-lg bg-surface-2 p-2 text-xs text-muted-foreground">
                  {s.excerpt}
                </p>
              )}
            </div>
          ))}

          <div className="grid gap-2 rounded-xl border border-dashed border-border p-3 sm:grid-cols-[1fr_120px_1fr_auto]">
            <Input
              placeholder="Source title"
              value={newSource.title}
              onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
            />
            <Select
              value={newSource.kind}
              onChange={(e) => setNewSource({ ...newSource, kind: e.target.value as ResearchSource["kind"] })}
            >
              <option value="webpage">Webpage</option>
              <option value="text">Text</option>
              <option value="note">Note</option>
            </Select>
            <Input
              placeholder="URL or note"
              value={newSource.origin}
              onChange={(e) => setNewSource({ ...newSource, origin: e.target.value })}
            />
            <Button variant="secondary" className="gap-1" onClick={addSource}>
              <Link2 className="h-4 w-4" /> Add
            </Button>
          </div>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground hover:bg-surface-2">
            <Upload className="h-4 w-4" /> Upload a document (.txt/.md extract text; others stored)
            <input type="file" className="hidden" onChange={onFile} />
          </label>
        </CardContent>
      </Card>

      {/* Claims / evidence table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidence table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {project.claims.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-2">Claim</th>
                    <th className="px-2">Type</th>
                    <th className="px-2">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {project.claims.map((c) => (
                    <tr key={c.id} className="border-b border-border/50">
                      <td className="py-2 pr-2">{c.text}</td>
                      <td className="px-2">
                        <Select
                          value={c.evidenceType}
                          onChange={(e) =>
                            onChange({
                              claims: project.claims.map((x) =>
                                x.id === c.id ? { ...x, evidenceType: e.target.value as ResearchClaim["evidenceType"] } : x,
                              ),
                            })
                          }
                          className="h-8 w-28 text-xs"
                        >
                          <option value="evidence">Evidence</option>
                          <option value="opinion">Opinion</option>
                          <option value="hypothesis">Hypothesis</option>
                        </Select>
                      </td>
                      <td className="px-2">
                        <Select
                          value={c.verified}
                          onChange={(e) =>
                            onChange({
                              claims: project.claims.map((x) =>
                                x.id === c.id ? { ...x, verified: e.target.value as ResearchClaim["verified"] } : x,
                              ),
                            })
                          }
                          className="h-8 w-24 text-xs"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                          <option value="unclear">Unclear</option>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Add a claim extracted from your sources…"
              value={newClaim}
              onChange={(e) => setNewClaim(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addClaim()}
            />
            <Button variant="secondary" onClick={addClaim}>
              Add claim
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Findings & report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={6}
            placeholder="Synthesize your findings. Distinguish what the evidence supports from your own interpretation and from open questions."
            value={project.report}
            onChange={(e) => onChange({ report: e.target.value })}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Created {relativeTime(project.createdAt)}</span>
            <button onClick={onDelete} className="inline-flex items-center gap-1 text-danger">
              <Trash2 className="h-4 w-4" /> Delete project
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
