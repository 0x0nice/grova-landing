import { Button } from "@/components/ui/button";
import type { OnboardingData } from "./onboarding-wizard";

interface StepTestProps {
  data: OnboardingData;
  onFinish: () => void;
  onBack: () => void;
}

export function StepTest({ data, onFinish, onBack }: StepTestProps) {
  return (
    <div className="bg-surface border border-border rounded p-8 text-center">
      <span className="text-[2.5rem] block mb-4">🎉</span>
      <h2 className="font-serif text-[clamp(1.5rem,3vw,2rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text mb-3">
        You&apos;re all <em className="text-text2">set!</em>
      </h2>
      <p className="font-mono text-callout text-text2 leading-[1.7] max-w-[380px] mx-auto mb-4">
        Your project <strong className="text-text">{data.projectName}</strong>{" "}
        is ready. Once you install the widget, feedback will appear in your{" "}
        {data.track === "developer" ? "inbox" : "overview"}.
      </p>

      <div className="bg-bg border border-border rounded p-4 mb-8 text-left max-w-[360px] mx-auto">
        <span className="block font-mono text-micro text-text3 uppercase tracking-[0.08em] mb-2">
          Quick checklist
        </span>
        <ul className="flex flex-col gap-2">
          <li className="font-mono text-micro text-accent flex items-center gap-2">
            <span>✓</span> Account created
          </li>
          <li className="font-mono text-micro text-accent flex items-center gap-2">
            <span>✓</span> Track selected ({data.track})
          </li>
          <li className="font-mono text-micro text-accent flex items-center gap-2">
            <span>✓</span> Project created
          </li>
          <li className="font-mono text-micro text-text3 flex items-center gap-2">
            <span>○</span> Install widget on your site
          </li>
          <li className="font-mono text-micro text-text3 flex items-center gap-2">
            <span>○</span> Submit first test feedback
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onBack}
          className="font-mono text-footnote text-text3 hover:text-text2 transition-colors cursor-pointer"
        >
          Back
        </button>
        <Button variant="fill" onClick={onFinish}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
