"use client";
import React from "react";

export type SupportedLang = "en" | "tr";

export interface TopNavProps {
  lang?: SupportedLang;
  onToggleLang?: () => void;
  links?: {
    iofbim?: string;
    whatWeCanDo?: string;
    projects?: string;
    about?: string;
    contact?: string;
  };
  tools?: {
    ifcSchema?: string;
    bep?: string;
    ids?: string;
    ifcGraph?: string;
  };
  labels?: {
    iofbim?: string;
    whatWeCanDo?: string;
    projects?: string;
    about?: string;
    contact?: string;
    tools?: string; // Top-level tools label
    ifcSchema?: string;
    bep?: string;
    ids?: string;
    ifcGraph?: string;
    en?: string; // language code label
    tr?: string; // language code label
    divider?: string; // between language codes, default "|"
  };
  size?: "sm" | "md" | "lg";
  className?: string;
  showThemeToggle?: boolean;
}

const defaultLabels = {
  en: {
    iofbim: "I of BIM",
    whatWeCanDo: "What we can do",
    projects: "Projects",
    about: "About",
    contact: "Contact",
    tools: "I of BIM Tools",
    toolsSm: "IoB Tools",
    ifcSchema: "IFC Schema",
    bep: "BEP Authoring Tool",
    ids: "IDS Authoring Tool",
    ifcGraph: "IFC Graph",
    en: "EN",
    tr: "TR",
    divider: "|",
  },
  tr: {
    iofbim: "I of BIM",
    whatWeCanDo: "Neler yapabiliriz",
    projects: "Projeler",
    about: "Hakkımda",
    contact: "İletişim",
    tools: "I of BIM Araçları",
    toolsSm: "IoB Araçları",
    ifcSchema: "IFC Şeması",
    bep: "BEP Oluşturma Aracı",
    ids: "IDS Oluşturma Aracı",
    ifcGraph: "IFC Grafiği",
    en: "EN",
    tr: "TR",
    divider: "|",
  },
} as const;

type Theme = "light" | "dark" | "system";

const themeIcons: Record<Theme, string> = { system: "☾", dark: "☀", light: "◑" };
const themeLabels: Record<Theme, string> = {
  system: "Auto (system)",
  dark: "Dark mode",
  light: "Light mode",
};
const nextTheme: Record<Theme, Theme> = { system: "dark", dark: "light", light: "system" };

/**
 * Self-contained theme toggle. Persists to localStorage and sets `data-theme`
 * on <html> directly, so this standalone TopNav copy needs no ThemeProvider in
 * the consuming app. (The packaged version uses the design-system ThemeProvider.)
 */
function ThemeToggle({ className = "", storageKey = "iofbim-theme" }: { className?: string; storageKey?: string }) {
  const [theme, setThemeState] = React.useState<Theme>("system");

  React.useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemeState(stored);
    }
  }, [storageKey]);

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(storageKey, t);
  };

  return (
    <button
      type="button"
      aria-label={`Color scheme: ${themeLabels[theme]}. Click to switch.`}
      title={themeLabels[theme]}
      className={`ds-nav-item ${className}`}
      onClick={() => setTheme(nextTheme[theme])}
    >
      {themeIcons[theme]}
    </button>
  );
}

export function TopNav({
  lang = "en",
  onToggleLang,
  links,
  tools,
  labels,
  size = "md",
  className,
  showThemeToggle = true,
}: TopNavProps) {
  const t = { ...defaultLabels[lang], ...labels };

  const sizeClass =
    size === "sm" ? "ds-topnav-size-sm" : size === "lg" ? "ds-topnav-size-lg" : "ds-topnav-size-md";

  return (
    <div className={["ds-topnav", sizeClass, className].filter(Boolean).join(" ")}>
      {/* Primary site nav */}
      <nav className="ds-topnav__group" aria-label="Site">
        <a href={links?.iofbim ?? "/#IOB"} className="ds-nav-item">
          <span className="ds-md-up">{t.iofbim}</span>
          <span className="ds-sm-only">I of BIM</span>
        </a>
        <a href={links?.whatWeCanDo ?? "/#WhatWeCanDo"} className="ds-nav-item ds-md-up">{t.whatWeCanDo}</a>
        <a href={links?.projects ?? "/#ProjectsSection"} className="ds-nav-item ds-md-up">{t.projects}</a>
        <a href={links?.about ?? "/#AboutSection"} className="ds-nav-item ds-md-up">{t.about}</a>
        <a href={links?.contact ?? "/#ContactSection"} className="ds-nav-item ds-md-up">{t.contact}</a>
      </nav>

      {/* Tools dropdown (desktop first, CSS hover) */}
      <nav className="ds-topnav__group ds-mx-sm" aria-label="Tools">
        <div className="ds-dropdown">
          <button type="button" className="ds-md-up ds-nav-item" aria-haspopup="menu" aria-expanded="false">{t.tools}</button>
          <button type="button" className="ds-sm-only ds-nav-item" aria-haspopup="menu" aria-expanded="false">{t.toolsSm}</button>
          <div role="menu" className="ds-topnav__dropdown">
            <a role="menuitem" href={tools?.ifcSchema ?? "/tools/IFC_schema"}>{t.ifcSchema}</a>
            <a role="menuitem" href={tools?.bep ?? "/tools/bep"}>{t.bep}</a>
            <a role="menuitem" href={tools?.ids ?? "/tools/ids"}>{t.ids}</a>
            <a role="menuitem" href={tools?.ifcGraph ?? "/tools/ifcGraph"}>{t.ifcGraph}</a>
          </div>
        </div>
      </nav>

      {/* Theme toggle */}
      {showThemeToggle && (
        <nav className="ds-topnav__group ds-mx-sm" aria-label="Theme">
          <ThemeToggle />
        </nav>
      )}

      {/* Language toggle */}
      <nav className="ds-topnav__group" aria-label="Language">
        {onToggleLang ? (
          <button type="button" className="ds-nav-item" onClick={onToggleLang}>
            <span className={lang === "en" ? "ds-bold ds-text-white" : undefined}>{t.en}</span>
            <span className="ds-divider">{t.divider}</span>
            <span className={lang === "tr" ? "ds-bold ds-text-white" : undefined}>{t.tr}</span>
          </button>
        ) : (
          <span className="ds-nav-item">{t.en} {t.divider} {t.tr}</span>
        )}
      </nav>
    </div>
  );
}

export default TopNav;
