"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  mounted: boolean;
  setTheme: (theme: Theme) => void;
} | null>(null);

const STORAGE_KEY = "rpeak-theme";

function preferredTheme(): Theme {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // El valor inicial es determinista para que SSR y la primera hidratación coincidan.
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = preferredTheme();
    applyTheme(initialTheme);
    // Estado obtenido de APIs del navegador tras una primera renderización SSR determinista.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initialTheme);
    setMounted(true);
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    setThemeState(nextTheme);
  }, []);

  const value = useMemo(() => ({ theme, mounted, setTheme }), [mounted, setTheme, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useAppTheme debe usarse dentro de ThemeProvider");
  return value;
}
