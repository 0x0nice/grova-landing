"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TrackProvider } from "@/providers/track-provider";
import { useTrack } from "@/hooks/use-track";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { PipelineSection } from "@/components/landing/pipeline-section";
import { StepsSection } from "@/components/landing/steps-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { BizPipelineSection } from "@/components/landing/biz-pipeline-section";
import { BizStopGuessingSection } from "@/components/landing/biz-stop-guessing-section";
import { BizThreeStepsSection } from "@/components/landing/biz-three-steps-section";
import { BizBounceBackSection } from "@/components/landing/biz-bounce-back-section";
import { BizFeaturesSection } from "@/components/landing/biz-features-section";
import { FreeAccessSection } from "@/components/landing/free-access-section";
import { Footer } from "@/components/landing/footer";
import Script from "next/script";

const sectionFade = {
  initial: { y: 10 },
  animate: { y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.32, ease: "easeOut" as const },
};

function LandingContent() {
  const { track } = useTrack();

  return (
    <>
      <Header />

      <div className="max-w-[1120px] mx-auto px-10 max-md:px-5">
        <Hero />
      </div>

      {/* Track-specific content with crossfade */}
      <AnimatePresence mode="wait" initial={false}>
        {track === "dev" ? (
          <motion.div key="dev-sections" {...sectionFade}>
            <div className="max-w-[1120px] mx-auto px-10 max-md:px-5">
              <PipelineSection />
            </div>
            <div className="max-w-[1120px] mx-auto px-10 max-md:px-5">
              <StepsSection />
            </div>
            <div className="max-w-[1120px] mx-auto px-10 max-md:px-5">
              <FeaturesGrid />
            </div>
          </motion.div>
        ) : (
          <motion.div key="biz-sections" {...sectionFade}>
            <div className="max-w-[1120px] mx-auto px-10 max-md:px-5">
              <BizPipelineSection />
            </div>
            <div className="max-w-[1120px] mx-auto px-10 max-md:px-5">
              <BizStopGuessingSection />
            </div>
            <div className="max-w-[1120px] mx-auto px-10 max-md:px-5">
              <BizThreeStepsSection />
            </div>
            <div className="max-w-[1120px] mx-auto px-10 max-md:px-5">
              <BizBounceBackSection />
            </div>
            <div className="max-w-[1120px] mx-auto px-10 max-md:px-5">
              <BizFeaturesSection />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared free-access close + footer */}
      <div className="max-w-[1120px] mx-auto px-10 max-md:px-5">
        <FreeAccessSection />
        <Footer />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <TrackProvider>
      <LandingContent />
      <Script
        src="/grova-widget.js"
        data-source="grova.dev"
        strategy="lazyOnload"
      />
    </TrackProvider>
  );
}
