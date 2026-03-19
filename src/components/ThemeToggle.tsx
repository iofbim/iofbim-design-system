"use client";
import { useTheme, type Theme } from "./ThemeProvider";

const icons: Record<Theme, string> = {
  system:  "☾",
  dark:    "☀",
  "dark-hc": "◈",
  light:   "◑",
};

const labels: Record<Theme, string> = {
  system:  "Auto (system)",
  dark:    "Dark mode",
  "dark-hc": "High contrast",
  light:   "Light mode",
};

const next: Record<Theme, Theme> = {
  system:  "dark",
  dark:    "dark-hc",
  "dark-hc": "light",
  light:   "system",
};

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label={`Color scheme: ${labels[theme]}. Click to switch.`}
      title={labels[theme]}
      className={`ds-nav-item ${className}`}
      onClick={() => setTheme(next[theme])}
    >
      {icons[theme]}
    </button>
  );
}
