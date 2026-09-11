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

function applyTheme(t: Theme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", t === "dark");
  root.style.colorScheme = t;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // SSR and the first client render both start "light" so the markup matches; an effect then syncs the
  // real theme from the pre-hydration class / stored preference. The toggle glyph therefore settles on
  // mount with no hydration mismatch (the <html> root carries suppressHydrationWarning).
  const [theme, setThemeState] = useState<Theme>("light");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let initial: Theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") initial = stored;
    } catch {
      // localStorage unavailable (privacy mode); fall back to the class set by the pre-paint script.
    }
    setThemeState(initial);
    applyTheme(initial);
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
