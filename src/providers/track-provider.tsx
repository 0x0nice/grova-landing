"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Track = "dev" | "biz";

interface TrackContextValue {
  track: Track;
  setTrack: (t: Track) => void;
}

export const TrackContext = createContext<TrackContextValue>({
  track: "dev",
  setTrack: () => {},
});

export function TrackProvider({ children }: { children: ReactNode }) {
  const [track, setTrackState] = useState<Track>("dev");

  useEffect(() => {
    try {
      const hash = window.location.hash === "#developers" ? "dev" : null;
      let saved: string | null = null;
      try { saved = localStorage.getItem("grova-track"); } catch {}
      const initial = hash || (saved as Track) || "dev";
      document.documentElement.setAttribute("data-track", initial);
      queueMicrotask(() => setTrackState(initial));
    } catch {
      // Fallback: keep the developer product as the primary track.
    }
  }, []);

  const setTrack = useCallback((t: Track) => {
    setTrackState(t);
    document.documentElement.setAttribute("data-track", t);
    try { localStorage.setItem("grova-track", t); } catch {}
    try { history.replaceState(null, "", t === "dev" ? "#developers" : "#"); } catch {}
  }, []);

  return (
    <TrackContext.Provider value={{ track, setTrack }}>
      {children}
    </TrackContext.Provider>
  );
}
