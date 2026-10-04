import * as React from "react";
import { createPortal } from "react-dom";
import { menuStyle, useMenuPlacement } from "./menu";

/**
 * A text field with suggestions in the shared `.ds-menu` list — the replacement for
 * `<input list>` + `<datalist>`, whose popup the browser draws in its own colours and sizes.
 * Typing filters the suggestions (every typed word must match); the field accepts any text.
 * Keyboard: ↓/↑ move, Enter picks, Escape closes.
 */

export type ComboboxOption = string | { value: string; label?: string; detail?: string };

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size" | "list">;
export type ComboboxProps = InputProps & {
    value: string;
    /** Called with the new text, typed or picked */
    onValueChange: (value: string) => void;
    options: readonly ComboboxOption[];
    size?: "sm" | "md" | "lg";
    /** Most suggestions listed at once (the list scrolls; 320px tall at most) */
    limit?: number;
};

const norm = (o: ComboboxOption) => (typeof o === "string" ? { value: o, label: o } : { label: o.value, ...o });

export function Combobox({ value, onValueChange, options, size = "sm", limit = 2000, className = "", onKeyDown, onFocus, onBlur, ...rest }: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState(-1);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const listRef = React.useRef<HTMLUListElement | null>(null);
    const listId = React.useId();
    const place = useMenuPlacement(inputRef, listRef, open, () => setOpen(false));

    const shown = React.useMemo(() => {
        const all = options.map(norm);
        // A value that is an option shows every option, with that one first: the cap below
        // must never drop it (a typed exact code in a large list used to vanish)
        const exact = all.find((o) => o.value === value);
        if (exact) return [exact, ...all.filter((o) => o !== exact)].slice(0, limit);
        const words = value.toLocaleLowerCase().split(/\s+/).filter(Boolean);
        const hits = words.length ? all.filter((o) => words.every((w) => `${o.value} ${o.label} ${o.detail ?? ""}`.toLocaleLowerCase().includes(w))) : all;
        return hits.slice(0, limit);
    }, [options, value, limit]);

    React.useEffect(() => { setActive(-1); }, [value]);
    React.useEffect(() => {
        if (!open || active < 0) return;
        listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
    }, [open, active]);

    const pick = (v: string) => { onValueChange(v); setOpen(false); };

    const cls = ["ds-input", size === "sm" && "ds-input--sm", size === "md" && "ds-input--md", size === "lg" && "ds-input--lg", className].filter(Boolean).join(" ");
    const visible = open && shown.length > 0;

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
                    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(shown.length - 1, a + 1)); }
                    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
                    else if (e.key === "Enter" && visible && active >= 0) { e.preventDefault(); pick(shown[active].value); }
                    else if (e.key === "Escape" && visible) { e.preventDefault(); setOpen(false); }
                    else if (e.key === "Tab") setOpen(false);
                }}
            />
            {visible && place && typeof document !== "undefined"
                ? createPortal(
                    <ul
                        ref={listRef}
                        id={listId}
                        role="listbox"
                        className="ds-menu ds-scroll-quiet"
                        style={menuStyle(place)}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    >
                        {shown.map((o, i) => (
                            <li
                                key={`${o.value}-${i}`}
                                id={`${listId}-${i}`}
                                role="option"
                                data-index={i}
                                aria-selected={o.value === value}
                                data-active={i === active || undefined}
                                className="ds-menu__item"
                                onMouseEnter={() => setActive(i)}
                                onClick={() => pick(o.value)}
                            >
                                <span className="ds-menu__label">{o.label}</span>
                                {o.detail ? <span className="ds-menu__detail">{o.detail}</span> : null}
                            </li>
                        ))}
                    </ul>,
                    document.body,
                )
                : null}
        </>
    );
}
