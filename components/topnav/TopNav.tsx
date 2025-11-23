import React from "react";

export type SupportedLang = "en" | "tr";

export interface TopNavProps {
  lang?: SupportedLang;
  onToggleLang?: () => void;
  links?: {
    iofbim?: string;
    whatWeCanDo?: string;
    projects?: string;
    contact?: string;
  };
  tools?: {
    ifcSchema?: string;
    bep?: string;
    ids?: string;
  };
  labels?: {
    iofbim?: string;
    whatWeCanDo?: string;
    projects?: string;
    contact?: string;
    tools?: string; // Top-level tools label
    ifcSchema?: string;
    bep?: string;
    ids?: string;
    en?: string; // language code label
    tr?: string; // language code label
    divider?: string; // between language codes, default "|"
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const defaultLabels = {
  en: {
    iofbim: "I of BIM",
    whatWeCanDo: "What we can do",
    projects: "Projects",
    contact: "Contact",
    tools: "I of BIM Tools",
    toolsSm: "IoB Tools",
    ifcSchema: "IFC Schema",
    bep: "BEP Authoring Tool",
    ids: "IDS Authoring Tool",
    en: "EN",
    tr: "TR",
    divider: "|",
  },
  tr: {
    iofbim: "I of BIM",
    whatWeCanDo: "Neler yapabiliriz",
    projects: "Projeler",
    contact: "İletişim",
    tools: "I of BIM Araçları",
    toolsSm: "IoB Araçları",
    ifcSchema: "IFC Şeması",
    bep: "BEP Oluşturma Aracı",
    ids: "IDS Oluşturma Aracı",
    en: "EN",
    tr: "TR",
    divider: "|",
  },
} as const;

export function TopNav({
  lang = "en",
  onToggleLang,
  links,
  tools,
  labels,
  size = "md",
  className,
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
          </div>
        </div>
      </nav>

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
