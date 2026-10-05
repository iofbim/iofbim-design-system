import * as React from "react";
import { createPortal } from "react-dom";
import { menuStyle, useMenuPlacement } from "./menu";

/**
 * A text field with suggestions in the shared `.ds-menu` list — the replacement for
 * `<input list>` + `<datalist>`, whose popup the browser draws in its own colours and sizes.
 * Typing filters the suggestions (every typed word must match); the field accepts any text.
 * Keyboard: ↓/↑ move, Enter picks, Escape closes.
 *
 * Options can carry a `group` (listed together under the group name) and a `section` (a heading
 * above groups). Optional extras:
 * - `selected` + `onToggle`: several values at once. Choosing ticks or unticks and the list stays
 *   open; a group heading ticks or unticks the group's shown options; the field only filters.
 * - `onCreate`: an "Add …" row for typed text that is not an option yet.
 * - `onEnter`: Enter with no option highlighted.
 */

export type ComboboxOption =
    | string
    | {
        value: string;
        label?: string;
        detail?: string;
        /** Options with the same group are listed together under the group name, shown once */
        group?: string;
        /** A heading above groups (e.g. "Occurrence", "Type"); shown once and never chosen */
        section?: string;
    };

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size" | "list" | "onToggle">;
export type ComboboxProps = InputProps & {
    value: string;
    /** Called with the new text, typed or picked */
    onValueChange: (value: string) => void;
    options: readonly ComboboxOption[];
    size?: "sm" | "md" | "lg";
    /** Most suggestions listed at once (the list scrolls; 320px tall at most) */
    limit?: number;
    /** Options are identifiers: the field and the list use the monospace face */
    mono?: boolean;
    /** A list wider than the field (28rem), for long names */
    wide?: boolean;
    /** Which edge of the field the list lines up with; "right" makes a wide list grow leftwards */
    align?: "left" | "right";
    /** Enter with no option highlighted */
    onEnter?: () => void;
    /** Several values: the ticked ones */
    selected?: ReadonlySet<string>;
    /** Several values: called with the values to tick (on) or untick */
    onToggle?: (values: string[], on: boolean) => void;
    /** An "Add …" row for typed text that is not an option; called with that text */
    onCreate?: (text: string) => void;
    /** Text of the add row; {text} is replaced */
    createLabel?: string;
};

type Opt = { value: string; label: string; detail?: string; group?: string; section?: string };
const norm = (o: ComboboxOption): Opt => (typeof o === "string" ? { value: o, label: o } : { ...o, label: o.label ?? o.value });

type Row =
    | { kind: "section"; label: string }
    | { kind: "group"; label: string; values: string[] }
    | { kind: "option"; opt: Opt; index: number }
    | { kind: "create"; text: string; index: number };

export function Combobox({
    value, onValueChange, options, size = "sm", limit = 2000, mono = false, wide = false, align = "left", onEnter,
    selected, onToggle, onCreate, createLabel = "Add “{text}”", className = "", onKeyDown, onFocus, onBlur, ...rest
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState(-1);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const listRef = React.useRef<HTMLUListElement | null>(null);
    const listId = React.useId();
    const place = useMenuPlacement(inputRef, listRef, open, () => setOpen(false), align);
    const multiple = !!selected && !!onToggle;

    const shown = React.useMemo(() => {
        const all = options.map(norm);
        // A value that is an option shows every option, with that one first: the cap below
        // must never drop it (a typed exact code in a large list used to vanish). Not in the
        // several-values mode, where the field only filters.
        const exact = multiple ? undefined : all.find((o) => o.value === value);
        if (exact) return [exact, ...all.filter((o) => o !== exact)].slice(0, limit);
        const words = value.toLocaleLowerCase().split(/\s+/).filter(Boolean);
        const hits = words.length
            ? all.filter((o) => words.every((w) => `${o.value} ${o.label} ${o.detail ?? ""} ${o.group ?? ""} ${o.section ?? ""}`.toLocaleLowerCase().includes(w)))
            : all;
        return hits.slice(0, limit);
    }, [options, value, limit, multiple]);

    const typed = value.trim();
    const canCreate = !!onCreate && typed !== "" && !options.map(norm).some((o) => o.value === typed || o.label.toLocaleLowerCase() === typed.toLocaleLowerCase());

    // Headings interleaved with the options; `index` counts the choosable rows for the keyboard
    const rows = React.useMemo(() => {
        const out: Row[] = [];
        let section: string | undefined;
        let group: string | undefined;
        shown.forEach((opt, index) => {
            if (opt.section && opt.section !== section) { out.push({ kind: "section", label: opt.section }); group = undefined; }
            section = opt.section;
            if (opt.group && opt.group !== group) out.push({ kind: "group", label: opt.group, values: shown.filter((o) => o.group === opt.group && o.section === opt.section).map((o) => o.value) });
            group = opt.group;
            out.push({ kind: "option", opt, index });
        });
        if (canCreate) out.push({ kind: "create", text: typed, index: shown.length });
        return out;
    }, [shown, canCreate, typed]);
    const choosable = shown.length + (canCreate ? 1 : 0);

    React.useEffect(() => { setActive(-1); }, [value]);
    React.useEffect(() => {
        if (!open || active < 0) return;
        listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
    }, [open, active]);

    const choose = (index: number) => {
        if (canCreate && index === shown.length) { onCreate!(typed); setOpen(false); return; }
        const opt = shown[index];
        if (!opt) return;
        if (multiple) { onToggle!([opt.value], !selected!.has(opt.value)); return; }
        onValueChange(opt.value);
        setOpen(false);
    };
    const toggleGroup = (values: string[]) => {
        if (!multiple) return;
        const on = !values.every((v) => selected!.has(v));
        onToggle!(values, on);
    };

    const cls = ["ds-input", size === "sm" && "ds-input--sm", size === "md" && "ds-input--md", size === "lg" && "ds-input--lg", mono && "ds-input--mono", className].filter(Boolean).join(" ");
    const visible = open && rows.length > 0;
    const style = place ? { ...menuStyle(place), ...(wide ? { minWidth: "28rem" } : {}) } : undefined;

    return (
        <>
            <input
                {...rest}
                ref={inputRef}
                className={cls}
                value={value}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={visible}
                aria-controls={visible ? listId : undefined}
                aria-activedescendant={visible && active >= 0 ? `${listId}-${active}` : undefined}
                autoComplete="off"
                onChange={(e) => { onValueChange(e.target.value); setOpen(true); }}
                onFocus={(e) => { setOpen(true); onFocus?.(e); }}
                onBlur={(e) => { onBlur?.(e); }}
                onKeyDown={(e) => {
                    onKeyDown?.(e);
                    if (e.defaultPrevented) return;
                    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(choosable - 1, a + 1)); }
                    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
                    else if (e.key === "Enter" && visible && active >= 0) { e.preventDefault(); choose(active); }
                    else if (e.key === "Enter" && onEnter) { e.preventDefault(); onEnter(); setOpen(false); }
                    else if (e.key === "Escape" && visible) { e.preventDefault(); setOpen(false); }
                    else if (e.key === "Tab") setOpen(false);
                }}
            />
            {visible && style && typeof document !== "undefined"
                ? createPortal(
                    <ul
                        ref={listRef}
                        id={listId}
                        role="listbox"
                        aria-multiselectable={multiple || undefined}
                        className={`ds-menu ds-scroll-quiet${mono ? " ds-menu--mono" : ""}`}
                        style={style}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    >
                        {rows.map((row, i) => {
                            if (row.kind === "section") return <li key={`s${i}`} role="presentation" className="ds-menu__section">{row.label}</li>;
                            if (row.kind === "group") {
                                return (
                                    <li
                                        key={`g${i}`}
                                        role="presentation"
                                        className={`ds-menu__group${multiple ? " ds-menu__group--toggle" : ""}`}
                                        onClick={() => toggleGroup(row.values)}
                                    >
                                        {row.label}
                                    </li>
                                );
                            }
                            if (row.kind === "create") {
                                return (
                                    <li
                                        key="create"
                                        id={`${listId}-${row.index}`}
                                        role="option"
                                        aria-selected={false}
                                        data-index={row.index}
                                        data-active={row.index === active || undefined}
                                        className="ds-menu__item ds-menu__create"
                                        onMouseEnter={() => setActive(row.index)}
                                        onClick={() => choose(row.index)}
                                    >
                                        <span className="ds-menu__label">{createLabel.replace("{text}", row.text)}</span>
                                    </li>
                                );
                            }
                            const { opt, index } = row;
                            const ticked = multiple ? selected!.has(opt.value) : opt.value === value;
                            return (
                                <li
                                    key={`${opt.value}-${index}`}
                                    id={`${listId}-${index}`}
                                    role="option"
                                    data-index={index}
                                    aria-selected={ticked}
                                    data-active={index === active || undefined}
                                    className="ds-menu__item"
                                    onMouseEnter={() => setActive(index)}
                                    onClick={() => choose(index)}
                                >
                                    {multiple && <span className="ds-menu__check" aria-hidden>{ticked ? "✓" : ""}</span>}
                                    <span className="ds-menu__label">{opt.label}</span>
                                    {opt.detail ? <span className="ds-menu__detail">{opt.detail}</span> : null}
                                </li>
                            );
                        })}
                    </ul>,
                    document.body,
                )
                : null}
        </>
    );
}
