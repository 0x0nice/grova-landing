import { Button } from "@/components/ui/button";
import type { OnboardingData } from "./onboarding-wizard";

interface StepTrackProps {
  data: OnboardingData;
  onUpdate: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepTrack({ data, onUpdate, onNext, onBack }: StepTrackProps) {
  const tracks = [
    {
      value: "developer" as const,
      icon: "🔧",
      title: "Developer",
      desc: "Bug reports, feature requests, AI triage scoring, Cursor-ready prompts.",
    },
    {
      value: "business" as const,
      icon: "🏪",
      title: "Business",
      desc: "Customer sentiment, category insights, suggested replies, trend analysis.",
    },
  ];

  return (
    <div className="bg-surface border border-border rounded p-8">
      <span className="block font-mono text-caption text-text3 tracking-[0.16em] uppercase mb-3">
        Step 2 of 5
      </span>
      <h2 className="font-serif text-title font-normal tracking-[-0.025em] leading-[1.1] text-text mb-2">
        Choose your <em className="text-text2">track.</em>
      </h2>
      <p className="font-mono text-callout text-text2 leading-[1.7] mb-6">
        This determines your dashboard layout and AI scoring model.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {tracks.map((t) => (
          <button
            key={t.value}
            onClick={() => onUpdate({ track: t.value })}
            className={`
              w-full text-left p-4 rounded border transition-all cursor-pointer
              ${
                data.track === t.value
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-border2"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-[1.4rem]">{t.icon}</span>
              <div>
                <span className="block font-mono text-footnote text-text font-medium">
                  {t.title}
                </span>
                <span className="block font-mono text-micro text-text3 mt-0.5">
                  {t.desc}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="font-mono text-footnote text-text3 hover:text-text2 transition-colors cursor-pointer"
        >
          Back
        </button>
        <Button variant="fill" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
