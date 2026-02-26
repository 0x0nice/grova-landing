"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { useTrack } from "@/hooks/use-track";

export function TrackToggle() {
  const { track, setTrack } = useTrack();
  const containerRef = useRef<HTMLDivElement>(null);
  const devRef = useRef<HTMLButtonElement>(null);
  const bizRef = useRef<HTMLButtonElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  // Measure the active button and position the sliding indicator
  const updateIndicator = () => {
    const activeRef = track === "dev" ? devRef : bizRef;
    const container = containerRef.current;
    if (activeRef.current && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeRef.current.getBoundingClientRect();
      setIndicator({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  };

  // Use layoutEffect for synchronous measurement to avoid flash
  useLayoutEffect(updateIndicator, [track]);
  // Re-measure on resize
  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [track]);

  return (
    <div className="flex items-center">
      <span className="font-mono text-[0.62rem] text-text3 tracking-[0.06em] px-2.5 pl-4 shrink-0 leading-none">
        for
      </span>
      <div
        ref={containerRef}
        className="relative flex bg-surface border border-border2 rounded-pill p-[3px] gap-[2px]"
      >
        {/* Sliding indicator */}
        <div
          className="absolute top-[3px] h-[calc(100%-6px)] rounded-pill transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            left: indicator.left,
            width: indicator.width,
            backgroundColor:
              track === "biz" ? "var(--color-accent)" : "var(--color-orange)",
          }}
        />

        <button
          ref={bizRef}
          onClick={() => setTrack("biz")}
          className={`
            relative z-10 border-none rounded-pill cursor-pointer font-mono text-caption font-medium
            tracking-[0.05em] px-3 py-[5px] leading-none whitespace-nowrap
            transition-colors duration-300
            ${track === "biz" ? "text-black" : "bg-transparent text-text3 hover:text-text2"}
          `}
        >
          Business
        </button>
        <button
          ref={devRef}
          onClick={() => setTrack("dev")}
          className={`
            relative z-10 border-none rounded-pill cursor-pointer font-mono text-caption font-medium
            tracking-[0.05em] px-3 py-[5px] leading-none whitespace-nowrap
            transition-colors duration-300
            ${track === "dev" ? "text-white" : "bg-transparent text-text3 hover:text-text2"}
          `}
        >
          Developers
        </button>
      </div>
    </div>
  );
}
