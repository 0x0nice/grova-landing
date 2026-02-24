"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProgressBar } from "./progress-bar";
import { StepWelcome } from "./step-welcome";
import { StepTrack } from "./step-track";
import { StepProject } from "./step-project";
import { StepInstall } from "./step-install";
import { StepTest } from "./step-test";

export type OnboardingData = {
  track: "developer" | "business";
  projectName: string;
  projectSource: string;
  apiKey?: string;
  projectId?: string;
};

const STEPS = ["Welcome", "Track", "Project", "Install", "Test"];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    track: "developer",
    projectName: "",
    projectSource: "",
  });

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  function finish() {
    router.push("/dashboard");
  }

  function update(partial: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  const stepComponents = [
    <StepWelcome key="welcome" onNext={next} />,
    <StepTrack key="track" data={data} onUpdate={update} onNext={next} onBack={back} />,
    <StepProject key="project" data={data} onUpdate={update} onNext={next} onBack={back} />,
    <StepInstall key="install" data={data} onBack={back} onNext={next} />,
    <StepTest key="test" data={data} onFinish={finish} onBack={back} />,
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <nav className="flex items-center justify-between px-10 py-6 max-md:px-5">
        <Logo size="lg" />
        <ThemeToggle />
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-12">
        <div className="w-full max-w-[520px]">
          <ProgressBar steps={STEPS} current={step} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="mt-8"
            >
              {stepComponents[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
