"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Sun, Moon, Trash2, Download, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";

const TIME_OPTIONS = [10, 20, 30, 45, 60, 90];

export default function SettingsPage() {
  const router = useRouter();
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const profile = useStore((s) => s.profile);
  const updateProfile = useStore((s) => s.updateProfile);
  const resetAll = useStore((s) => s.resetAll);
  const [confirming, setConfirming] = useState(false);

  function exportData() {
    const data = useStore.getState();
    const { setHydrated, createProfile, ...rest } = data as any;
    const blob = new Blob([JSON.stringify(serializable(rest), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mastery-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Appearance, accessibility, and your data." />

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["system", "light", "dark"] as const).map((t) => {
                  const Icon = t === "system" ? Monitor : t === "light" ? Sun : Moon;
                  return (
                    <button
                      key={t}
                      onClick={() => setSettings({ theme: t })}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold capitalize transition-colors ${
                        settings.theme === t
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-surface-2"
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accessibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Toggle
              label="Reduce motion"
              desc="Minimize animations and transitions."
              checked={settings.reducedMotion}
              onChange={(v) => setSettings({ reducedMotion: v })}
            />
            <Toggle
              label="Sound effects"
              desc="Play subtle feedback sounds (where supported)."
              checked={settings.sound}
              onChange={(v) => setSettings({ sound: v })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="daily">Daily time goal</Label>
            <Select
              id="daily"
              value={profile?.dailyMinutes ?? 20}
              onChange={(e) => updateProfile({ dailyMinutes: Number(e.target.value) })}
              className="max-w-[200px]"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t} minutes
                </option>
              ))}
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              All your progress lives in this browser (localStorage). Nothing is sent to a server
              in demo mode. Export a backup or reset below.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" className="gap-2" onClick={exportData}>
                <Download className="h-4 w-4" /> Export progress
              </Button>
            </div>

            <div className="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-4">
              <p className="flex items-center gap-2 font-semibold text-danger">
                <Trash2 className="h-4 w-4" /> Reset everything
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Permanently deletes your profile, progress, subjects, and reviews on this device.
                This cannot be undone.
              </p>
              {!confirming ? (
                <Button variant="danger" size="sm" className="mt-3" onClick={() => setConfirming(true)}>
                  Reset all data
                </Button>
              ) : (
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      resetAll();
                      router.push("/");
                    }}
                  >
                    Yes, delete everything
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function serializable(obj: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v !== "function") out[k] = v;
  }
  return out;
}
