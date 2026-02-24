"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  // Sync with the inline script that already set data-theme before hydration
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as Theme;
    if (current) setTheme(current);
  }, []);

  // Listen for OS preference changes (only if user hasn't set a preference)
  useEffect(() => {
    try {
      const mq = window.matchMedia("(prefers-color-scheme: light)");
      const handler = (e: MediaQueryListEvent) => {
        try {
          if (!localStorage.getItem("grova-theme")) {
            const next = e.matches ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", next);
            setTheme(next);
          }
        } catch {}
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } catch {
      // matchMedia not available — skip OS preference sync
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("grova-theme", next); } catch {}
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
