"use client";
// Compact navigation for the tool apps, inside the app's own bar (.ds-app__bar) instead of the
// website's TopNav:
//   <AppNav current="ids" />       "I of BIM › IDS ▾"  home link + a switcher listing every tool
//   <AppSettings … />              size slider · theme · EN | TR
// The size slider scales the desktop density (`--ds-scale`, 100% = the usual 75% zoom) and is
// remembered in the browser for every tool on the site (`iofbim.uiScale`).
import * as React from "react";
import { createPortal } from "react-dom";
import { ThemeToggle } from "./ThemeToggle";
import { menuStyle, useMenuPlacement } from "./menu";

export type ToolId = "ifcSchema" | "bep" | "ids" | "loin" | "ifcGraph";
type Lang = "en" | "tr";

/** The tools in menu order, with their paths on the site */
export const IOFBIM_TOOLS: { id: ToolId; path: string }[] = [
    { id: "ifcSchema", path: "/tools/IFC_schema" },
    { id: "bep", path: "/tools/bep" },
    { id: "ids", path: "/tools/ids" },
    { id: "loin", path: "/tools/loin" },
    { id: "ifcGraph", path: "/tools/ifcGraph" },
];

const LABELS = {
    en: {
        home: "I of BIM",
        homeTitle: "I of BIM: home page",
        switchTitle: "Other I of BIM tools",
        current: "you are here",
        short: { ifcSchema: "IFC Schema", bep: "BEP", ids: "IDS", loin: "L.O.I.N", ifcGraph: "IFC Graph" },
        long: { ifcSchema: "IFC Schema", bep: "BEP Authoring Tool", ids: "IDS Authoring Tool", loin: "L.O.I.N Authoring Tool", ifcGraph: "IFC Graph" },
        size: "Size",
        sizeTitle: "Interface size",
        language: "Language",
    },
    tr: {
        home: "I of BIM",
        homeTitle: "I of BIM: ana sayfa",
        switchTitle: "Diğer I of BIM araçları",
        current: "buradasınız",
        short: { ifcSchema: "IFC Şeması", bep: "BEP", ids: "IDS", loin: "L.O.I.N", ifcGraph: "IFC Grafik" },
        long: { ifcSchema: "IFC Şeması", bep: "BEP Oluşturma Aracı", ids: "IDS Oluşturma Aracı", loin: "L.O.I.N Oluşturma Aracı", ifcGraph: "IFC Grafik Görüntüleyici" },
        size: "Boyut",
        sizeTitle: "Arayüz boyutu",
        language: "Dil",
    },
} as const;

export type AppNavProps = {
    /** The tool this app is */
    current: ToolId;
    lang?: Lang;
    /** Prefix for the links ("" on iofbim.io itself, "https://iofbim.io" elsewhere) */
    siteUrl?: string;
    className?: string;
};

export function AppNav({ current, lang = "en", siteUrl = "", className = "" }: AppNavProps) {
    const t = LABELS[lang];
    const [open, setOpen] = React.useState(false);
    const button = React.useRef<HTMLButtonElement | null>(null);
    const list = React.useRef<HTMLUListElement | null>(null);
    const place = useMenuPlacement(button, list, open, () => setOpen(false));
    const menuId = React.useId();

    // Keyboard: arrows move through the tools, Esc closes and returns to the switcher
    const onListKey = (e: React.KeyboardEvent) => {
        const items = [...(list.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
        const i = items.indexOf(document.activeElement as HTMLElement);
        if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
        else if (e.key === "Escape") { e.preventDefault(); setOpen(false); button.current?.focus(); }
    };
    React.useEffect(() => {
        if (open && place) list.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    }, [open, place]);

    return (
        <nav className={`ds-appnav ${className}`} aria-label="I of BIM">
            <a className="ds-appnav__home" href={`${siteUrl}/`} title={t.homeTitle}>{t.home}</a>
            <span className="ds-appnav__sep" aria-hidden>›</span>
            <button
                ref={button}
                type="button"
                className="ds-appnav__switch"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                title={t.switchTitle}
                onClick={() => setOpen((o) => !o)}
            >
                {t.short[current]}
                <svg className="ds-select__chevron" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {open && place && typeof document !== "undefined" && createPortal(
                <ul ref={list} id={menuId} role="menu" aria-label={t.switchTitle} className="ds-menu ds-scroll-quiet" style={menuStyle(place)} onKeyDown={onListKey}>
                    {IOFBIM_TOOLS.map((tool) => (
                        <li key={tool.id} role="none">
                            {tool.id === current ? (
                                <span role="menuitem" tabIndex={-1} aria-current="page" className="ds-menu__item ds-appnav__current">
                                    <span className="ds-menu__label">{t.long[tool.id]}</span>
                                    <span className="ds-menu__detail">{t.current}</span>
                                </span>
                            ) : (
                                <a role="menuitem" tabIndex={-1} className="ds-menu__item" href={`${siteUrl}${tool.path}`}>
                                    <span className="ds-menu__label">{t.long[tool.id]}</span>
                                </a>
                            )}
                        </li>
                    ))}
                </ul>,
                document.body,
            )}
        </nav>
    );
}

// ─── Interface size ────────────────────────────────────────────────────────────

const SCALE_KEY = "iofbim.uiScale";
export const UI_SCALES = [0.5, 0.75, 1, 1.25, 1.5] as const;

const applyScale = (s: number) => document.documentElement.style.setProperty("--ds-scale", String(s));

/**
 * Inline <script> body for <head>: applies the saved size before the first paint, so pages
 * don't jump. `<script dangerouslySetInnerHTML={{ __html: UI_SCALE_SCRIPT }} />`
 */
export const UI_SCALE_SCRIPT = `try{var s=parseFloat(localStorage.getItem("${SCALE_KEY}"));if(s>0)document.documentElement.style.setProperty("--ds-scale",String(s))}catch(e){}`;

/** The saved interface size (1 = the default density), kept in step across tabs */
export function useUiScale(): [number, (s: number) => void] {
    const [scale, setScale] = React.useState(1);
    React.useEffect(() => {
        try {
            const saved = parseFloat(localStorage.getItem(SCALE_KEY) ?? "");
            if (saved > 0) { setScale(saved); applyScale(saved); }
        } catch { /* storage unavailable: default size */ }
        const onStorage = (e: StorageEvent) => {
            if (e.key !== SCALE_KEY) return;
            const s = parseFloat(e.newValue ?? "") || 1;
            setScale(s);
            applyScale(s);
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);
    const update = React.useCallback((s: number) => {
        setScale(s);
        applyScale(s);
        try { localStorage.setItem(SCALE_KEY, String(s)); } catch { /* not remembered */ }
    }, []);
    return [scale, update];
}

export type AppSettingsProps = {
    lang?: Lang;
    onToggleLang?: () => void;
    showThemeToggle?: boolean;
    /** The size slider; it only shows where the desktop density applies */
    showScale?: boolean;
    /** EN | TR; off for apps with one language */
    showLanguage?: boolean;
    className?: string;
};

/** Size slider · theme · language, for the right end of the app bar */
export function AppSettings({ lang = "en", onToggleLang, showThemeToggle = true, showScale = true, showLanguage = true, className = "" }: AppSettingsProps) {
    const t = LABELS[lang];
    const [scale, setScale] = useUiScale();
    const index = Math.max(0, UI_SCALES.findIndex((s) => Math.abs(s - scale) < 0.01));
    return (
        <div className={`ds-appsettings ${className}`}>
            {showScale && (
                <label className="ds-appscale" title={t.sizeTitle}>
                    <span className="ds-appscale__label">{t.size}</span>
                    <input
                        type="range"
                        min={0}
                        max={UI_SCALES.length - 1}
                        step={1}
                        value={index}
                        aria-label={t.sizeTitle}
                        aria-valuetext={`${Math.round(UI_SCALES[index] * 100)}%`}
                        onChange={(e) => setScale(UI_SCALES[Number(e.target.value)] ?? 1)}
                    />
                    <span className="ds-appscale__value">{Math.round(UI_SCALES[index] * 100)}%</span>
                </label>
            )}
            {showThemeToggle && <ThemeToggle className="ds-appsettings__btn" />}
            {showLanguage && <div className="ds-appsettings__lang" role="group" aria-label={t.language}>
                {(["en", "tr"] as const).map((code) => (
                    <button
                        key={code}
                        type="button"
                        className="ds-appsettings__btn"
                        aria-pressed={lang === code}
                        disabled={!onToggleLang}
                        onClick={() => { if (lang !== code) onToggleLang?.(); }}
                    >
                        {code.toUpperCase()}
                    </button>
                ))}
            </div>}
        </div>
    );
}
