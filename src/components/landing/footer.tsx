"use client";

import { useTrack } from "@/hooks/use-track";

export function Footer() {
  const { track } = useTrack();

  return (
    <footer className="border-t border-border py-[26px] flex items-center justify-between max-md:flex-col max-md:gap-3 max-md:text-center">
      <span className="font-serif text-[0.9rem] text-text3">grova</span>
      <span className="text-[0.58rem] text-text3 tracking-[0.05em]">
        {track === "dev"
          ? "© 2026 Grova — Built by a developer, for developers."
          : "© 2026 Grova — Feedback made simple for small businesses."}
      </span>
    </footer>
  );
}
