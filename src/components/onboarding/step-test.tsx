"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { apiGet, apiPost } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import type { FeedbackItem } from "@/types/feedback";
import type { PageResponse } from "@/types/pagination";
import type { OnboardingData } from "./onboarding-wizard";

interface StepTestProps {
  data: OnboardingData;
  onFinish: () => void;
  onBack: () => void;
}

type TestState = "idle" | "checking" | "sending" | "verified" | "error";

export function StepTest({ data, onFinish, onBack }: StepTestProps) {
  const { session } = useAuth();
  const [state, setState] = useState<TestState>("idle");
  const [status, setStatus] = useState("Submit once from your installed widget, then check the connection here.");

  const token = session?.access_token;
  const canTest = Boolean(token && data.projectId);

  async function checkConnection() {
    if (!token || !data.projectId) return;
    setState("checking");
    try {
      const response = await apiGet<PageResponse<FeedbackItem>>(
        `/feedback?project_id=${data.projectId}&page=1&limit=1`,
        token
      );
      if (response.items.length === 0) {
        setState("idle");
        setStatus("No feedback has arrived yet. Submit through the widget and check again.");
        return;
      }
      setState("verified");
      setStatus("Connection verified. Grova received feedback for this project.");
    } catch (error) {
      setState("error");
      setStatus(errorMessage(error, "Could not verify the connection"));
    }
  }

  async function sendApiTest() {
    if (!token || !data.projectId || !data.apiKey) return;
    setState("sending");
    try {
      await apiPost<{ success: boolean; id: string }>(
        "/feedback",
        {
          type: "other",
          message: "Grova onboarding connection test - safe to resolve or dismiss.",
          source: data.projectSource,
          project_id: data.projectId,
          api_key: data.apiKey,
          metadata: { onboarding_test: true },
        },
        token
      );
      setState("verified");
      setStatus("API connection verified. A test item was added to your inbox.");
    } catch (error) {
      setState("error");
      setStatus(errorMessage(error, "Could not send the test feedback"));
    }
  }

  return (
    <div className="bg-surface border border-border rounded p-8 text-center">
      <span className="font-mono text-[0.62rem] text-accent tracking-[0.16em] uppercase block mb-4">
        Final check
      </span>
      <h2 className="font-serif text-[clamp(1.5rem,3vw,2rem)] font-normal tracking-[-0.02em] leading-[1.1] text-text mb-3">
        Verify the <span className="text-text2">connection.</span>
      </h2>
      <p className="font-mono text-callout text-text2 leading-[1.7] max-w-[420px] mx-auto mb-6">
        Confirm feedback reaches <strong className="text-text">{data.projectName}</strong> before you leave setup.
      </p>

      <div className="bg-bg border border-border rounded p-5 mb-6 text-left max-w-[420px] mx-auto">
        <p className={`font-mono text-footnote leading-relaxed ${state === "error" ? "text-orange" : state === "verified" ? "text-accent" : "text-text2"}`} aria-live="polite">
          {status}
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Button variant="ghost" onClick={() => void checkConnection()} loading={state === "checking"} disabled={!canTest || state === "sending"}>
            Check widget
          </Button>
          <Button variant="ghost" onClick={() => void sendApiTest()} loading={state === "sending"} disabled={!canTest || !data.apiKey || state === "checking"}>
            Send API test
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button onClick={onBack} className="font-mono text-footnote text-text3 hover:text-text2 transition-colors cursor-pointer">
          Back
        </button>
        <Button variant="fill" onClick={onFinish}>
          {state === "verified" ? "Open Dashboard" : "Skip for now"}
        </Button>
      </div>
    </div>
  );
}
