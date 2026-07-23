"use client";

import Link from "next/link";
import { useProjectStore } from "@/stores/project-store";

export default function BillingPage() {
  const active = useProjectStore((state) => state.active);
  const destination = active?.mode === "business" ? "/dashboard/overview" : "/dashboard/inbox";
  const destinationLabel = active?.mode === "business" ? "Return to overview" : "Return to changes";

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center px-8 py-16 max-md:px-5">
      <div className="grid w-full max-w-[980px] grid-cols-[1.2fr_0.8fr] items-end gap-16 max-lg:grid-cols-1 max-lg:gap-8">
        <h1 className="max-w-[680px] font-serif text-[clamp(2.8rem,6vw,5rem)] font-normal leading-[0.96] tracking-[-0.03em] text-text">
          Grova is free for now.
        </h1>
        <div className="max-w-[440px]">
          <p className="mb-6 text-callout leading-[1.7] text-text2">
            We are building it with real teams, and everything available in this preview is
            included. There is nothing to choose or manage here right now.
          </p>
          <Link
            href={destination}
            className="text-footnote font-semibold text-accent transition-colors hover:text-accent/80"
          >
            {destinationLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
