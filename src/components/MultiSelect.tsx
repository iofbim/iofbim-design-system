"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { menuStyle, useMenuPlacement } from "./menu";

/**
 * Several values from a list: a field that summarises the choice ("Architect, Client (+2)") and
 * opens a `.ds-menu` of checkboxes that stays open while ticking. A search field appears for
 * long lists; `onCreate` adds an "Add …" row for values that are not in the list yet.
 *
 *   <MultiSelect label="Actors" value={ids} onChange={setIds} placeholder="None"
 *     options={[{ value: "a1", label: "Architect", group: "Design" }, …]} />
 *
 * Keyboard: Enter/Space/↓ open, ↑/↓ move, Space/Enter tick, Escape/Tab close.
 */

export type MultiSelectOption = {
    value: string;
    label: string;
    /** Smaller text on the right */
    detail?: string;
    /** Options with the same group are listed together under the group name */
    group?: string;
    disabled?: boolean;
};

export type MultiSelectProps = {
    /** Accessible name (and the search field's placeholder) */
    label: string;
    options: readonly MultiSelectOption[];
    value: readonly string[];
    onChange: (value: string[]) => void;
    /** Shown when nothing is chosen */
    placeholder?: string;
    size?: "sm" | "md" | "lg";
    /** A search field above the options; by default when there are more than 8 */
    search?: boolean;
    /** Adds an "Add …" row for typed text that is not an option; called with that text */
    onCreate?: (text: string) => void;
    /** Text of the add row; {text} is replaced */
    createLabel?: string;
    /** How the field summarises the chosen labels */
    summarize?: (labels: string[]) => string;
    className?: string;
    disabled?: boolean;
    id?: string;
};

const defaultSummary = (labels: string[]) => (labels.length <= 2 ? labels.join(", ") : `${labels.slice(0, 2).join(", ")} (+${labels.length - 2})`);

export function MultiSelect({
    label, options, value, onChange, placeholder = "", size = "sm", search, onCreate, createLabel = "Add “{text}”",
    summarize = defaultSummary, className = "", disabled, id,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const button = React.useRef<HTMLButtonElement | null>(null);
    const list = React.useRef<HTMLDivElement | null>(null);
    const place = useMenuPlacement(button, list, open, () => setOpen(false));
    const listId = React.useId();
    const chosen = new Set(value);
    const withSearch = search ?? (options.length > 8 || !!onCreate);

    const words = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const shown = words.length ? options.filter((o) => words.every((w) => `${o.label} ${o.detail ?? ""} ${o.group ?? ""}`.toLocaleLowerCase().includes(w))) : options;
    const typed = query.trim();
    const canCreate = !!onCreate && typed !== "" && !options.some((o) => o.label.toLocaleLowerCase() === typed.toLocaleLowerCase() || o.value === typed);

    React.useEffect(() => { if (!open) setQuery(""); }, [open]);
    React.useEffect(() => {
        if (!open || !place) return;
        (list.current?.querySelector<HTMLElement>("input[type=search]") ?? list.current?.querySelector<HTMLElement>("[role=option]"))?.focus();
    }, [open, place]);

    // Values come back in the order of `options` (what users see), whatever order they were ticked
    // in; a value that is not an option yet (one just created) goes last
    const ordered = (values: string[]) => {
        const set = new Set(values);
        const known = new Set(options.map((o) => o.value));
        return [...options.map((o) => o.value).filter((v) => set.has(v)), ...values.filter((v) => !known.has(v))];
    };
    const toggle = (v: string) => onChange(ordered(chosen.has(v) ? value.filter((x) => x !== v) : [...value, v]));
    const labels = options.filter((o) => chosen.has(o.value)).map((o) => o.label);
    // Values not in the options (e.g. just created) still count
    for (const v of value) if (!options.some((o) => o.value === v)) labels.push(v);

    const onListKey = (e: React.KeyboardEvent) => {
        const els = [...(list.current?.querySelectorAll<HTMLElement>("[role=option]:not([aria-disabled=true]), [data-create]") ?? [])];
        const i = els.indexOf(document.activeElement as HTMLElement);
        if (e.key === "ArrowDown") { e.preventDefault(); els[Math.min(els.length - 1, i + 1)]?.focus(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); if (i <= 0) list.current?.querySelector<HTMLElement>("input[type=search]")?.focus(); else els[i - 1]?.focus(); }
        else if (e.key === "Escape") { e.preventDefault(); setOpen(false); button.current?.focus(); }
        else if (e.key === "Tab") setOpen(false);
    };

    const cls = ["ds-input", "ds-select", size === "sm" && "ds-input--sm", size === "md" && "ds-input--md", size === "lg" && "ds-input--lg", className].filter(Boolean).join(" ");
    let lastGroup: string | undefined;

    return (
        <>
            <button
                ref={button}
                id={id}
                type="button"
                className={cls}
                aria-label={labels.length ? `${label}: ${labels.join(", ")}` : label}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
                onKeyDown={(e) => { if (e.key === "ArrowDown" && !open) { e.preventDefault(); setOpen(true); } }}
            >
                <span className={`ds-select__value${labels.length ? "" : " ds-select__placeholder"}`}>{labels.length ? summarize(labels) : placeholder}</span>
                <svg className="ds-select__chevron" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {open && place && typeof document !== "undefined" && createPortal(
                <div ref={list} className="ds-menu ds-multiselect ds-scroll-quiet" style={menuStyle(place)} onKeyDown={onListKey}>
                    {withSearch && (
                        <input
                            type="search"
                            className="ds-input ds-input--sm ds-multiselect__search"
                            placeholder={label}
                            aria-label={label}
                            aria-controls={listId}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && canCreate) { e.preventDefault(); onCreate!(typed); onChange(ordered([...value, typed])); setQuery(""); }
                            }}
                        />
                    )}
                    <ul id={listId} role="listbox" aria-multiselectable="true" aria-label={label} className="ds-multiselect__list">
                        {shown.map((o) => {
                            const head = o.group && o.group !== lastGroup ? o.group : null;
                            lastGroup = o.group;
                            const on = chosen.has(o.value);
                            return (
                                <React.Fragment key={o.value}>
                                    {head ? <li role="presentation" className="ds-menu__group">{head}</li> : null}
                                    <li
                                        role="option"
                                        aria-selected={on}
                                        aria-disabled={o.disabled || undefined}
                                        tabIndex={-1}
                                        className="ds-menu__item ds-multiselect__option"
                                        onClick={() => { if (!o.disabled) toggle(o.value); }}
                                        onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !o.disabled) { e.preventDefault(); toggle(o.value); } }}
                                    >
                                        <span className="ds-menu__check" aria-hidden>{on ? "✓" : ""}</span>
                                        <span className="ds-menu__label">{o.label}</span>
                                        {o.detail ? <span className="ds-menu__detail">{o.detail}</span> : null}
                                    </li>
                                </React.Fragment>
                            );
                        })}
                        {canCreate && (
                            <li role="presentation">
                                <button
                                    type="button"
                                    data-create
                                    className="ds-menu__item ds-menu__action ds-multiselect__create"
                                    onClick={() => { onCreate!(typed); onChange(ordered([...value, typed])); setQuery(""); }}
                                >
                                    <span className="ds-menu__label">{createLabel.replace("{text}", typed)}</span>
                                </button>
                            </li>
                        )}
                        {shown.length === 0 && !canCreate && <li role="presentation" className="ds-menu__hint">—</li>}
                    </ul>
                </div>,
                document.body,
            )}
        </>
    );
}
