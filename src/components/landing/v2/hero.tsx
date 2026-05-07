"use client";

export function Hero() {
  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 py-24 max-md:py-16 overflow-hidden"
      aria-label="Grova"
    >
      {/* Ambient accent glow, barely-there */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 48%, rgba(0, 200, 122, 0.07) 0%, transparent 60%)",
        }}
      />

      <div
        className="relative font-serif font-normal text-center leading-[0.96] tracking-[-0.025em] text-text"
        style={{
          fontSize: "clamp(3rem, 11vw, 9rem)",
          animation: "fadeUp 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) 120ms both",
        }}
      >
        <span className="block [text-wrap:balance]">Feedback,</span>
        <em
          className="block text-text2 [text-wrap:balance]"
          style={{ letterSpacing: "-0.03em" }}
        >
          considered.
        </em>
      </div>

      <p
        className="relative mt-10 max-w-[36ch] text-center font-mono text-callout text-text3 font-light [text-wrap:pretty] max-md:mt-7"
        style={{
          animation: "fadeUp 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 420ms both",
        }}
      >
        Grova reads your feedback so you don&apos;t have to.
      </p>

      {/* Breathing accent dot — the gesture */}
      <button
        type="button"
        onClick={() =>
          window.scrollTo({
            top: window.innerHeight * 0.95,
            behavior: "smooth",
          })
        }
        aria-label="Continue"
        className="relative mt-24 max-md:mt-16 flex flex-col items-center gap-3 cursor-pointer group"
        style={{
          animation: "fadeUp 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 780ms both",
        }}
      >
        <span
          aria-hidden="true"
          className="block w-2.5 h-2.5 rounded-full bg-accent"
          style={{ animation: "pulse-dot 2.8s ease-in-out infinite" }}
        />
        <span className="font-mono text-[0.62rem] text-text3 tracking-[0.24em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Continue
        </span>
      </button>
    </section>
  );
}
