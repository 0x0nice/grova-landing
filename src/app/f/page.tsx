"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { QrFeedbackForm } from "@/components/feedback/qr-feedback-form";

function FeedbackContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get("k");

  if (!key) {
    return (
      <div className="w-full max-w-[400px] flex flex-col items-center gap-4 py-12 text-center">
        <span className="font-serif text-[1.1rem] text-text3">grova</span>
        <h1 className="font-serif text-title text-text italic">
          Link not found
        </h1>
        <p className="text-body text-text3 leading-[1.7]">
          This feedback link isn&apos;t active or doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return <QrFeedbackForm apiKey={key} />;
}

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[400px] flex flex-col items-center gap-6 py-12">
          <span className="font-serif text-[1.1rem] text-text3 animate-pulse">
            grova
          </span>
        </div>
      }
    >
      <FeedbackContent />
    </Suspense>
  );
}
