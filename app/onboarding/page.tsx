"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/misc";
import { useStore } from "@/lib/store/store";

const TIME_OPTIONS = [10, 20, 30, 45, 60];

export default function Onboarding() {
  const router = useRouter();
  const createProfile = useStore((s) => s.createProfile);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [minutes, setMinutes] = useState(20);
  const [goal, setGoal] = useState("");

  function finish() {
    createProfile(name, minutes, goal);
    router.push("/diagnostic");
  }

  return (
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-center gap-2 font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-xl">Mastery</span>
        </div>

        <Card className="p-6">
          {/* progress dots */}
          <div className="mb-6 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step ? "w-8 bg-primary" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {step === 0 && (
            <div>
              <h1 className="text-2xl font-bold">Welcome. What should we call you?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Your profile and progress stay on this device — no account needed.
              </p>
              <div className="mt-5">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  autoFocus
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setStep(1)}
                />
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep(1)} className="gap-2">
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold">How much time most days?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll size your daily plan to fit. You can change this anytime.
              </p>
              <div className="mt-5 grid grid-cols-5 gap-2">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setMinutes(t)}
                    className={`rounded-xl border px-2 py-4 text-center transition-colors ${
                      minutes === t
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-surface-2"
                    }`}
                  >
                    <div className="text-lg font-bold">{t}</div>
                    <div className="text-[11px] text-muted-foreground">min</div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(0)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setStep(2)} className="gap-2">
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold">What are you hoping to achieve?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Optional — it helps us tailor recommendations. (e.g. "get fluent in machine
                learning for my job")
              </p>
              <div className="mt-5">
                <Label htmlFor="goal">Your goal</Label>
                <Textarea
                  id="goal"
                  rows={3}
                  placeholder="I want to…"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={finish} className="gap-2">
                  Start the diagnostic <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
