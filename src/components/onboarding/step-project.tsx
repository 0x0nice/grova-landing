"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpTip } from "@/components/ui/help-tip";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import type { OnboardingData } from "./onboarding-wizard";

interface StepProjectProps {
  data: OnboardingData;
  onUpdate: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepProject({
  data,
  onUpdate,
  onNext,
  onBack,
}: StepProjectProps) {
  const { session, isDemo } = useAuth();
  const createProject = useProjectStore((s) => s.createProject);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!data.projectName.trim()) {
      setError("Project name is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isDemo) {
        // In demo mode, simulate project creation
        onUpdate({
          apiKey: "gv_demo_" + Math.random().toString(36).slice(2, 10),
          projectId: "demo-" + Date.now(),
        });
        onNext();
        return;
      }

      const token = session?.access_token;
      if (!token) {
        setError("Not authenticated. Please sign in first.");
        return;
      }

      const project = await createProject(
        {
          name: data.projectName,
          mode: data.track,
          source: data.projectSource || data.projectName.toLowerCase().replace(/\s+/g, "-"),
        },
        token
      );

      if (project) {
        onUpdate({
          apiKey: project.api_key,
          projectId: project.id,
        });
        onNext();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create project."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded p-8">
      <span className="block font-mono text-caption text-text3 tracking-[0.16em] uppercase mb-3">
        Step 3 of 5
      </span>
      <h2 className="font-serif text-title font-normal tracking-[-0.02em] leading-[1.1] text-text mb-2">
        Create a <em className="text-text2">project.</em>
      </h2>
      <p className="font-mono text-callout text-text2 leading-[1.7] mb-6">
        {data.track === "developer"
          ? "This represents your app or product."
          : "This represents your business location."}
      </p>

      <div className="flex flex-col gap-4 mb-6">
        <Input
          id="project-name"
          label={data.track === "developer" ? "App Name" : "Business Name"}
          placeholder={
            data.track === "developer" ? "My SaaS App" : "Joe's Coffee"
          }
          value={data.projectName}
          onChange={(e) => onUpdate({ projectName: e.target.value })}
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="project-source"
            className="font-mono text-footnote text-text2 uppercase tracking-[0.04em] flex items-center"
          >
            Source Identifier (optional)
            <HelpTip>
              {data.track === "developer" ? (
                <>
                  The <strong className="text-text">data-source</strong> attribute in your
                  widget script tag. It links feedback to this project.
                  <br /><br />
                  Example: if your widget has{" "}
                  <code className="text-accent bg-bg px-1 rounded">data-source=&quot;my-app&quot;</code>,
                  enter <strong className="text-text">my-app</strong> here.
                  <br /><br />
                  Leave blank to auto-generate from your app name.
                </>
              ) : (
                <>
                  A short identifier that connects your feedback widget to this
                  project. It appears in your widget embed code as{" "}
                  <code className="text-accent bg-bg px-1 rounded">data-source</code>.
                  <br /><br />
                  Use your domain or a slug like{" "}
                  <strong className="text-text">joes-coffee</strong> or{" "}
                  <strong className="text-text">mysite.com</strong>.
                  <br /><br />
                  Leave blank to auto-generate from your business name.
                </>
              )}
            </HelpTip>
          </label>
          <input
            id="project-source"
            className="w-full bg-bg2 border border-border rounded px-4 py-3
                       font-mono text-body text-text placeholder:text-text3
                       transition-colors duration-[180ms] ease
                       focus:outline-none focus:border-accent"
            placeholder={
              data.track === "developer"
                ? "my-saas-app"
                : "joes-coffee-main"
            }
            value={data.projectSource}
            onChange={(e) => onUpdate({ projectSource: e.target.value })}
          />
        </div>
      </div>

      {error && (
        <p className="font-mono text-footnote text-red leading-[1.6] mb-4">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="font-mono text-footnote text-text3 hover:text-text2 transition-colors cursor-pointer"
        >
          Back
        </button>
        <Button
          variant="fill"
          onClick={handleCreate}
          loading={loading}
          disabled={!data.projectName.trim()}
        >
          Create Project
        </Button>
      </div>
    </div>
  );
}
