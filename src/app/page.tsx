"use client";

import Script from "next/script";
import { TrackProvider } from "@/providers/track-provider";
import { Header } from "@/components/landing/v2/header";
import { Hero } from "@/components/landing/v2/hero";
import { NarrativeSection } from "@/components/landing/v2/narrative-section";
import { PricingStrip } from "@/components/landing/v2/pricing-strip";
import { Footer } from "@/components/landing/v2/footer";

export default function Home() {
  return (
    <TrackProvider>
      <Header />
      <Hero />
      <NarrativeSection />
      <PricingStrip />
      <Footer />
      <Script
        src="/grova-business-widget.js"
        data-source="grova.dev"
        strategy="lazyOnload"
      />
    </TrackProvider>
  );
}
