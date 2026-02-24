"use client";

import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/stores/project-store";
import { useToast } from "@/components/ui/toast";

export function SettingsView() {
  const active = useProjectStore((s) => s.active);
  const [context, setContext] = useState("");
  const [saved, setSaved] = useState(false);
  const { show } = useToast();

  const storageKey = active ? `grova-ctx-${active.id}` : null;

  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) setContext(saved);
    }
  }, [storageKey]);

  function handleSave() {
    if (storageKey) {
      localStorage.setItem(storageKey, context);
      setSaved(true);
      show("Context saved");
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (!active) return null;

  return (
    <div className="max-w-[600px]">
      {/* Project info */}
      <div className="mb-10">
        <span className="block font-mono text-micro text-text3 uppercase tracking-[0.14em] mb-4">
          Project info
        </span>
        <h2 className="font-serif text-title text-text mb-4">{active.name}</h2>
        <div className="flex flex-col gap-2">
          <InfoRow label="Source" value={active.source || "—"} />
          <InfoRow label="Mode" value={active.mode} />
          {active.api_key && (
            <InfoRow label="API Key" value={active.api_key} />
          )}
        </div>
      </div>

      {/* Triage lens */}
      <div>
        <span className="block font-mono text-micro text-text3 uppercase tracking-[0.14em] mb-4">
          Triage lens
        </span>
        <h2 className="font-serif text-title text-text mb-2">
          Project context
        </h2>
        <p className="font-mono text-footnote text-text2 leading-[1.7] mb-4">
          Paste your README or product description. This context is injected
          into every Cursor prompt when you approve feedback.
        </p>
        <Textarea
          id="project-ctx"
          label="Project description / README"
          placeholder={"## My App\n\nA tool for indie developers…"}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={8}
          maxLength={5000}
          charCount
        />
        <div className="mt-4">
          <Button variant="primary" onClick={handleSave}>
            {saved ? "Saved ✓" : "Save context"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-micro text-text3 uppercase tracking-[0.08em] w-16 shrink-0">
        {label}
      </span>
      <span className="font-mono text-footnote text-text2">{value}</span>
    </div>
  );
}
