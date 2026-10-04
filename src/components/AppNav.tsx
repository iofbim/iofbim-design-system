"use client";
// Compact navigation for the tool apps, inside the app's own bar (.ds-app__bar) instead of the
// website's TopNav:
//   <AppNav current="ids" />       "I of BIM › IDS ▾"  home link + a switcher listing every tool
//   <AppSettings … />              interface size · theme · EN | TR
// The size (a list of steps, or any typed value) scales the desktop density (`--ds-scale`,
// 100% = unzoomed) and is remembered in the browser for every tool on the site (`iofbim.uiScale`).
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
        typeHint: "Click the number again to type a size",
        short: { ifcSchema: "IFC Schema", bep: "BEP", ids: "IDS", loin: "L.O.I.N", ifcGraph: "IFC Graph" },
        long: { ifcSchema: "IFC Schema", bep: "BEP Authoring Tool", ids: "IDS Authoring Tool", loin: "L.O.I.N Authoring Tool", ifcGraph: "IFC Graph" },
        sizeTitle: "Interface size",
        language: "Language",
    },
    tr: {
        home: "I of BIM",
        homeTitle: "I of BIM: ana sayfa",
        switchTitle: "Diğer I of BIM araçları",
        typeHint: "Bir boyut yazmak için sayıya yeniden tıklayın",
        short: { ifcSchema: "IFC Şeması", bep: "BEP", ids: "IDS", loin: "L.O.I.N", ifcGraph: "IFC Grafik" },
        long: { ifcSchema: "IFC Şeması", bep: "BEP Oluşturma Aracı", ids: "IDS Oluşturma Aracı", loin: "L.O.I.N Oluşturma Aracı", ifcGraph: "IFC Grafik Görüntüleyici" },
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
    /** The interface size control; it only shows where the desktop density applies */
    showScale?: boolean;
    /** EN | TR; off for apps with one language */
    showLanguage?: boolean;
    className?: string;
};

/** Typed sizes are kept within this range (percent) */
const SCALE_MIN = 50;
const SCALE_MAX = 200;

/**
 * The interface size: a button with the current percentage. A click lists the steps; a
 * second click on the number turns it into a field for any size (Enter applies, Esc cancels).
 */
function ScaleControl({ lang }: { lang: Lang }) {
    const t = LABELS[lang];
    const [scale, setScale] = useUiScale();
    const pct = Math.round(scale * 100);
    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(false);
    const [draft, setDraft] = React.useState(String(pct));
    const anchor = React.useRef<HTMLSpanElement | null>(null);
    const list = React.useRef<HTMLUListElement | null>(null);
    const input = React.useRef<HTMLInputElement | null>(null);
    const close = React.useCallback(() => { setOpen(false); setEditing(false); }, []);
    const place = useMenuPlacement(anchor, list, open, close);
    const menuId = React.useId();

    React.useEffect(() => { if (editing) { input.current?.focus(); input.current?.select(); } }, [editing]);

    const commit = () => {
        const v = Math.round(Number(draft.replace(/[^\d.]/g, "")));
        if (Number.isFinite(v) && v > 0) setScale(Math.min(SCALE_MAX, Math.max(SCALE_MIN, v)) / 100);
        close();
    };
    const pick = (s: number) => { setScale(s); close(); };

    return (
        <span ref={anchor} className="ds-appscale" title={t.sizeTitle}>
            {editing ? (
                <input
                    ref={input}
                    className="ds-appscale__input"
                    inputMode="numeric"
                    aria-label={t.sizeTitle}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); commit(); }
                        else if (e.key === "Escape") { e.preventDefault(); close(); }
                    }}
                    onBlur={() => { if (editing) commit(); }}
                />
            ) : (
                <button
                    type="button"
                    className="ds-appsettings__btn ds-appscale__btn"
                    aria-haspopup="menu"
                    aria-expanded={open}
                    aria-controls={open ? menuId : undefined}
                    aria-label={`${t.sizeTitle}: ${pct}%`}
                    onClick={() => {
                        // First click lists the steps; a click while they show opens the field
                        if (!open) { setOpen(true); return; }
                        setDraft(String(pct));
                        setEditing(true);
                    }}
                >
                    {pct}%
                    <svg className="ds-select__chevron" viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}
            {open && place && typeof document !== "undefined" && createPortal(
                <ul ref={list} id={menuId} role="menu" aria-label={t.sizeTitle} className="ds-menu ds-scroll-quiet" style={menuStyle(place)}>
                    {UI_SCALES.map((s) => (
                        <li key={s} role="none">
                            <button
                                type="button"
                                role="menuitemradio"
                                aria-checked={Math.abs(s - scale) < 0.001}
                                className="ds-menu__item ds-appscale__option"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => pick(s)}
                            >
                                <span className="ds-menu__label">{Math.round(s * 100)}%</span>
                            </button>
                        </li>
                    ))}
                    <li role="none" className="ds-menu__hint">{t.typeHint}</li>
                </ul>,
                document.body,
            )}
        </span>
    );
}

/** Interface size · theme · language, for the right end of the app bar */
export function AppSettings({ lang = "en", onToggleLang, showThemeToggle = true, showScale = true, showLanguage = true, className = "" }: AppSettingsProps) {
    const t = LABELS[lang];
    return (
        <div className={`ds-appsettings ${className}`}>
            {showScale && <ScaleControl lang={lang} />}
            {showThemeToggle && <ThemeToggle className="ds-appsettings__btn ds-appsettings__theme" />}
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
