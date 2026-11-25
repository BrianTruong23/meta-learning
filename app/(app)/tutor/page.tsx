"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { RichText } from "@/components/exercises/katex-text";
import { getAdapter, type TutorMode, type TutorTurn } from "@/lib/ai";
import { useActiveSubject } from "@/lib/store/selectors";
import { cn } from "@/lib/utils";

const MODES: { id: TutorMode; label: string; blurb: string }[] = [
  { id: "question", label: "Socratic", blurb: "Guides you with questions" },
  { id: "explain", label: "Explain", blurb: "Clear explanations" },
  { id: "hint", label: "Hint", blurb: "Nudge, not the answer" },
  { id: "quiz", label: "Quiz", blurb: "Tests your understanding" },
  { id: "debate", label: "Debate", blurb: "Argues the other side" },
  { id: "critique", label: "Critique", blurb: "Reviews your work" },
  { id: "research", label: "Research", blurb: "Guides investigation" },
];

export default function TutorPage() {
  const subject = useActiveSubject();
  const [mode, setMode] = useState<TutorMode>("question");
  const [history, setHistory] = useState<TutorTurn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [followups, setFollowups] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, busy]);

  async function send(message: string) {
    if (!message.trim() || busy) return;
    const userTurn: TutorTurn = { role: "user", content: message };
    const newHistory = [...history, userTurn];
    setHistory(newHistory);
    setInput("");
    setFollowups([]);
    setBusy(true);
    const adapter = await getAdapter();
    const reply = await adapter.tutor({
      mode,
      subject: subject?.title,
      history: newHistory,
      message,
    });
    setHistory((h) => [...h, { role: "tutor", content: reply.content }]);
    setFollowups(reply.followups ?? []);
    setBusy(false);
  }

  return (
    <div>
      <PageHeader
        title="AI Tutor"
        subtitle="A Socratic mentor that guides you to answers — it won't just hand them over."
      />

      {/* Mode selector */}
      <div className="mb-4 flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
              mode === m.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-surface-2",
            )}
            title={m.blurb}
          >
            {m.label}
          </button>
        ))}
      </div>

      <Card className="flex h-[60vh] flex-col">
        <CardContent className="flex-1 space-y-4 overflow-y-auto p-5">
          {history.length === 0 && !busy && (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <MessageCircle className="mb-3 h-10 w-10" />
              <p className="font-semibold">
                {mode === "question"
                  ? "Ask about anything — I'll help you reason it out."
                  : `${MODES.find((m) => m.id === mode)?.label} mode ready.`}
              </p>
              {subject && (
                <p className="mt-1 text-sm">
                  Context: <Badge tone="primary">{subject.title}</Badge>
                </p>
              )}
            </div>
          )}

          {history.map((t, i) => (
            <div key={i} className={cn("flex", t.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                  t.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2",
                )}
              >
                {t.role === "tutor" && (
                  <span className="mb-1 flex items-center gap-1 text-xs font-bold text-primary">
                    <Sparkles className="h-3 w-3" /> Tutor
                  </span>
                )}
                <RichText text={t.content} />
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-surface-2 px-4 py-3 text-sm text-muted-foreground">
                <span className="inline-flex gap-1">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse [animation-delay:150ms]">●</span>
                  <span className="animate-pulse [animation-delay:300ms]">●</span>
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </CardContent>

        {followups.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
            {followups.map((f) => (
              <button
                key={f}
                onClick={() => send(f)}
                className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-surface-2"
              >
                {f}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-border p-3">
          <input
            className="h-11 flex-1 rounded-xl border border-input bg-surface px-3.5 text-sm outline-none focus:border-primary"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
          />
          <Button size="icon" onClick={() => send(input)} disabled={busy} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <p className="mt-3 text-xs text-muted-foreground">
        In demo mode the tutor uses scripted Socratic flows and never fabricates citations. Add an
        API key (see README) to enable full AI responses.
      </p>
    </div>
  );
}
