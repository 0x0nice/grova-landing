"use client";

import { useTrack } from "@/hooks/use-track";

export function TrackToggle() {
  const { track, setTrack } = useTrack();

  return (
    <div className="flex items-center">
      <span className="font-mono text-[0.62rem] text-text3 tracking-[0.06em] px-2.5 pl-4 shrink-0 leading-none">
        for
      </span>
      <div className="flex bg-surface border border-border2 rounded-pill p-[3px] gap-[2px]">
        <button
          onClick={() => setTrack("dev")}
          className={`
            border-none rounded-pill cursor-pointer font-mono text-caption font-medium
            tracking-[0.05em] px-3 py-[5px] leading-none whitespace-nowrap
            transition-all duration-[180ms]
            ${track === "dev" ? "bg-accent text-black" : "bg-transparent text-text3 hover:text-text2"}
          `}
        >
          Developers
        </button>
        <button
          onClick={() => setTrack("biz")}
          className={`
            border-none rounded-pill cursor-pointer font-mono text-caption font-medium
            tracking-[0.05em] px-3 py-[5px] leading-none whitespace-nowrap
            transition-all duration-[180ms]
            ${track === "biz" ? "bg-orange text-white" : "bg-transparent text-text3 hover:text-text2"}
          `}
        >
          Business
        </button>
      </div>
    </div>
  );
}
