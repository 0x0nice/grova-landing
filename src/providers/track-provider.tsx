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
    const hash = window.location.hash === "#business" ? "biz" : null;
    const saved = localStorage.getItem("grova-track") as Track | null;
    const initial = hash || saved || "dev";
    setTrackState(initial);
    document.documentElement.setAttribute("data-track", initial);
  }, []);

  const setTrack = useCallback((t: Track) => {
    setTrackState(t);
    document.documentElement.setAttribute("data-track", t);
    localStorage.setItem("grova-track", t);
    history.replaceState(null, "", t === "biz" ? "#business" : "#");
  }, []);

  return (
    <TrackContext.Provider value={{ track, setTrack }}>
      {children}
    </TrackContext.Provider>
  );
}
