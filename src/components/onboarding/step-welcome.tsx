import { Button } from "@/components/ui/button";

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="bg-surface border border-border rounded p-8 text-center">
      <span className="text-[2.5rem] block mb-4">👋</span>
      <h1 className="font-serif text-[clamp(1.5rem,3vw,2rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text mb-3">
        Welcome to <em className="text-text2">Grova.</em>
      </h1>
      <p className="font-mono text-callout text-text2 leading-[1.7] max-w-[380px] mx-auto mb-8">
        Let&apos;s set up your first project in under 2 minutes. We&apos;ll choose your
        track, create a project, and install the feedback widget.
      </p>
      <Button variant="fill" onClick={onNext}>
        Get Started
      </Button>
    </div>
  );
}
