"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  /** Whether the visitor asked for reduced motion (matchMedia). Read by the gate sim. */
  reducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "monark-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function applyTheme(t: Theme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", t === "dark");
  root.style.colorScheme = t;
}

function storedTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null; // localStorage unavailable (privacy mode)
  }
}

// Charter C (ruling Q5): the default is the visitor's system preference (prefers-color-scheme); the header
// button records an explicit choice, which then wins. The pre-paint script in app/layout.tsx applies the same
// rule before first paint, so there is no flash; this provider syncs React state from it on mount and follows
// a live system change while no explicit choice is stored.
export function ThemeProvider({ children }: { children: ReactNode }) {
  // SSR and the first client render both start "light" so the markup matches; the effect then syncs the real
  // theme from the pre-paint class (the <html> root carries suppressHydrationWarning).
  const [theme, setThemeState] = useState<Theme>("light");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const initial: Theme = storedTheme() ?? (media.matches ? "dark" : "light");
    setThemeState(initial);
    applyTheme(initial);
    const follow = (): void => {
      if (storedTheme() !== null) return; // an explicit choice wins over the system
      const next: Theme = media.matches ? "dark" : "light";
      setThemeState(next);
      applyTheme(next);
    };
    media.addEventListener("change", follow);
    return () => media.removeEventListener("change", follow);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (): void => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // localStorage unavailable; the class is still applied for this session.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // localStorage unavailable; the class is still applied for this session.
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, reducedMotion }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
