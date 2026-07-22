"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export type FontSizePreset = 0 | 1 | 2 | 3;

interface FontSizeContextValue {
  preset: FontSizePreset;
  setPreset: (p: FontSizePreset) => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const SCALE_MAP: Record<FontSizePreset, number> = {
  0: 0.88,
  1: 1.0,
  2: 1.14,
  3: 1.28,
};

const STORAGE_KEY = "grova-font-size";

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */
const FontSizeContext = createContext<FontSizeContextValue>({
  preset: 1,
  setPreset: () => {},
});

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */
export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState<FontSizePreset>(1);

  // Sync React state with whatever the inline script already applied
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const p = Number(saved) as FontSizePreset;
        if (p in SCALE_MAP) queueMicrotask(() => setPresetState(p));
      }
    } catch {
      // localStorage blocked - keep default
    }
  }, []);

  const setPreset = useCallback((p: FontSizePreset) => {
    setPresetState(p);
    const scale = SCALE_MAP[p];
    document.documentElement.style.setProperty("--font-scale", String(scale));
    try {
      localStorage.setItem(STORAGE_KEY, String(p));
    } catch {
      // localStorage blocked
    }
  }, []);

  return (
    <FontSizeContext.Provider value={{ preset, setPreset }}>
      {children}
    </FontSizeContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */
export function useFontSize() {
  return useContext(FontSizeContext);
}
