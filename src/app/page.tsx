"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TrackProvider } from "@/providers/track-provider";
import { useTrack } from "@/hooks/use-track";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { PipelineSection } from "@/components/landing/pipeline-section";
import { StepsSection } from "@/components/landing/steps-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { PricingGrid } from "@/components/landing/pricing-grid";
import { BizPipelineSection } from "@/components/landing/biz-pipeline-section";
import { BizStopGuessingSection } from "@/components/landing/biz-stop-guessing-section";
import { BizThreeStepsSection } from "@/components/landing/biz-three-steps-section";
import { BizBounceBackSection } from "@/components/landing/biz-bounce-back-section";
import { BizFeaturesSection } from "@/components/landing/biz-features-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import Script from "next/script";

function Divider() {
  return <div className="h-px bg-border" />;
}

const sectionFade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.32, ease: "easeOut" as const },
};

function LandingContent() {
  const { track } = useTrack();

  return (
    <>
      <Header />

      <div className="max-w-[980px] mx-auto px-10 max-md:px-5">
        <Hero />
      </div>

      {/* Track-specific content with crossfade */}
      <AnimatePresence mode="wait">
        {track === "dev" ? (
          <motion.div key="dev-sections" {...sectionFade}>
            <Divider />
            <div className="max-w-[980px] mx-auto px-10 max-md:px-5">
              <PipelineSection />
            </div>
            <Divider />
            <div className="max-w-[980px] mx-auto px-10 max-md:px-5">
              <StepsSection />
            </div>
            <Divider />
            <div className="max-w-[980px] mx-auto px-10 max-md:px-5">
              <FeaturesGrid />
            </div>
            <Divider />
            <div className="max-w-[980px] mx-auto px-10 max-md:px-5">
              <PricingGrid />
            </div>
          </motion.div>
        ) : (
          <motion.div key="biz-sections" {...sectionFade}>
            <Divider />
            <div className="max-w-[980px] mx-auto px-10 max-md:px-5">
              <BizPipelineSection />
            </div>
            <Divider />
            <div className="max-w-[980px] mx-auto px-10 max-md:px-5">
              <BizStopGuessingSection />
            </div>
            <Divider />
            <div className="max-w-[980px] mx-auto px-10 max-md:px-5">
              <BizThreeStepsSection />
            </div>
            <Divider />
            <div className="max-w-[980px] mx-auto px-10 max-md:px-5">
              <BizBounceBackSection />
            </div>
            <Divider />
            <div className="max-w-[980px] mx-auto px-10 max-md:px-5">
              <BizFeaturesSection />
            </div>
            <Divider />
            <div className="max-w-[980px] mx-auto px-10 max-md:px-5">
              <PricingGrid />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared CTA + Footer */}
      <Divider />
      <div className="max-w-[980px] mx-auto px-10 max-md:px-5">
        <CTASection />
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
        src="https://grova.dev/grova-business-widget.js"
        data-source="grova.dev"
        strategy="lazyOnload"
      />
    </TrackProvider>
  );
}
