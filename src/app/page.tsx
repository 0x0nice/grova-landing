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
import { BizHowSection } from "@/components/landing/biz-how-section";
import { BizFeaturesSection } from "@/components/landing/biz-features-section";
import { BizExampleSection } from "@/components/landing/biz-example-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

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
              <BizHowSection />
            </div>
            <Divider />
            <div className="max-w-[980px] mx-auto px-10 max-md:px-5">
              <BizFeaturesSection />
            </div>
            <Divider />
            <div className="max-w-[980px] mx-auto px-10 max-md:px-5">
              <BizExampleSection />
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
    </TrackProvider>
  );
}
