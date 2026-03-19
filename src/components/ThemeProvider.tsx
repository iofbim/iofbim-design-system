"use client";
import * as React from "react";

export type Theme = "light" | "dark" | "dark-hc" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark" | "dark-hc";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function ThemeProvider({
  children,
  storageKey = "iofbim-theme",
}: {
  children: React.ReactNode;
  storageKey?: string;
}) {
  const [theme, setThemeState] = React.useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark" | "dark-hc">("light");

  // On mount: restore persisted preference
  React.useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "dark-hc" || stored === "system") {
      setThemeState(stored);
    }
  }, [storageKey]);

  // Apply data-theme to <html> and track OS preference changes
  React.useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = (t: Theme) => {
      const systemIsDark = mq.matches;
      if (t === "dark") {
        root.setAttribute("data-theme", "dark");
        setResolvedTheme("dark");
      } else if (t === "dark-hc") {
        root.setAttribute("data-theme", "dark-hc");
        setResolvedTheme("dark-hc");
      } else if (t === "light") {
        root.setAttribute("data-theme", "light");
        setResolvedTheme("light");
      } else {
        // "system" — let @media handle it, remove explicit attribute
        root.removeAttribute("data-theme");
        setResolvedTheme(systemIsDark ? "dark" : "light");
      }
    };

    apply(theme);

    const handler = () => {
      if (theme === "system") apply("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = React.useCallback(
    (t: Theme) => {
      setThemeState(t);
      localStorage.setItem(storageKey, t);
    },
    [storageKey]
  );

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return React.useContext(ThemeContext);
}
