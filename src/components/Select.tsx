import * as React from "react";
import { createPortal } from "react-dom";
import { menuStyle, useMenuPlacement } from "./menu";

/**
 * The one dropdown of every IofBIM app: a button that opens a `.ds-menu` list instead of the
 * browser's or the operating system's native popup, so it looks and behaves the same everywhere.
 *
 * Drop-in for `<select>`: pass `<option>` / `<optgroup>` children (fragments are fine), `value`
 * or `defaultValue`, and an `onChange` that reads `event.target.value`. `className`, `title`,
 * `aria-*`, `id` and `disabled` go to the button. With `name`, a hidden input carries the value
 * in forms. Keyboard: ↑/↓/Home/End move, Enter/Space pick, Escape/Tab close, typing jumps to a
 * matching option.
 */

type BaseProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size" | "multiple">;
/** `bare`: only the dropdown behaviour and chevron, no `ds-input` field look (for pills/chips styled by the caller) */
export type SelectProps = BaseProps & { size?: "sm" | "md" | "lg"; bare?: boolean };

type Item =
    | { kind: "option"; value: string; label: React.ReactNode; text: string; disabled: boolean; className?: string }
    | { kind: "group"; label: string };

function textOf(node: React.ReactNode): string {
    if (node === null || node === undefined || typeof node === "boolean") return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(textOf).join("");
    if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
    return "";
}

/** Flattens <option>/<optgroup> children, looking through fragments */
function collect(children: React.ReactNode, out: Item[] = [], groupDisabled = false): Item[] {
    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;
        const props = child.props as { children?: React.ReactNode; value?: unknown; disabled?: boolean; label?: string; className?: string };
        if (child.type === React.Fragment) {
            collect(props.children, out, groupDisabled);
        } else if (child.type === "optgroup") {
            out.push({ kind: "group", label: String(props.label ?? "") });
            collect(props.children, out, groupDisabled || !!props.disabled);
        } else if (child.type === "option") {
            const text = textOf(props.children);
            out.push({
                kind: "option",
                value: props.value === undefined ? text : String(props.value),
                label: props.children,
                text,
                disabled: groupDisabled || !!props.disabled,
                className: props.className,
            });
        }
    });
    return out;
}

/** A change event shaped like the native one, so `e.target.value` keeps working */
function changeEvent(value: string, name?: string): React.ChangeEvent<HTMLSelectElement> {
    const target = { value, name: name ?? "" } as HTMLSelectElement;
    return { target, currentTarget: target, type: "change", preventDefault() {}, stopPropagation() {} } as unknown as React.ChangeEvent<HTMLSelectElement>;
}

export function Select({
    children,
    size = "sm",
    className = "",
    title,
    value: valueProp,
    defaultValue,
    onChange,
    disabled,
    name,
    id,
    onClick,
    onKeyDown,
    style,
    bare = false,
    ...rest
}: React.PropsWithChildren<SelectProps>) {
    const items = React.useMemo(() => collect(children), [children]);
    const options = items.filter((i): i is Extract<Item, { kind: "option" }> => i.kind === "option");

    const controlled = valueProp !== undefined;
    const [inner, setInner] = React.useState(() => String(defaultValue ?? options[0]?.value ?? ""));
    const value = controlled ? String(valueProp) : inner;
    const selected = options.find((o) => o.value === value);

    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState(-1);
    const buttonRef = React.useRef<HTMLButtonElement | null>(null);
    const listRef = React.useRef<HTMLUListElement | null>(null);
    const typed = React.useRef({ text: "", at: 0 });
    const listId = React.useId();
    const autoId = React.useId();
    const buttonId = id ?? autoId;

    const ariaLabel = (rest as Record<string, unknown>)["aria-label"] as string | undefined;
    // Named by aria-label, else title, else an associated <label for={id}>
    const accName = ariaLabel ?? title;

    const cls = [
        !bare && "ds-input",
        "ds-select",
        !bare && size === "sm" && "ds-input--sm",
        !bare && size === "md" && "ds-input--md",
        !bare && size === "lg" && "ds-input--lg",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const pick = (option: Extract<Item, { kind: "option" }>) => {
        if (option.disabled) return;
        setOpen(false);
        buttonRef.current?.focus();
        if (option.value === value) return;
        if (!controlled) setInner(option.value);
        onChange?.(changeEvent(option.value, name));
    };

    const place = useMenuPlacement(buttonRef, listRef, open, () => setOpen(false));

    // Programmatic changes like on a native <select>: setting the button's `value` and firing a
    // `change` event (tests, automation) picks that option.
    const latest = React.useRef({ options, value, controlled, onChange, name });
    latest.current = { options, value, controlled, onChange, name };
    React.useEffect(() => {
        const btn = buttonRef.current;
        if (!btn) return;
        const onNativeChange = () => {
            const { options: opts, value: current, controlled: isControlled, onChange: cb, name: n } = latest.current;
            const next = btn.value;
            if (next === current || !opts.some((o) => o.value === next && !o.disabled)) return;
            if (!isControlled) setInner(next);
            cb?.(changeEvent(next, n));
        };
        btn.addEventListener("change", onNativeChange);
        return () => btn.removeEventListener("change", onNativeChange);
    }, []);

    // Keep the active option in view
    React.useEffect(() => {
        if (!open || active < 0) return;
        listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
    }, [open, active]);

    const openList = () => {
        if (disabled) return;
        setActive(Math.max(0, options.findIndex((o) => o.value === value)));
        setOpen(true);
    };

    const move = (from: number, step: number) => {
        for (let i = from + step; i >= 0 && i < options.length; i += step) if (!options[i].disabled) return i;
        return from;
    };

    const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(e as unknown as React.KeyboardEvent<HTMLSelectElement>);
        if (e.defaultPrevented || disabled) return;
        const k = e.key;
        if (!open) {
            if (k === "ArrowDown" || k === "ArrowUp" || k === "Enter" || k === " ") { e.preventDefault(); openList(); }
            return;
        }
        if (k === "Escape") { e.preventDefault(); setOpen(false); }
        else if (k === "Tab") setOpen(false);
        else if (k === "ArrowDown") { e.preventDefault(); setActive((a) => move(a, 1)); }
        else if (k === "ArrowUp") { e.preventDefault(); setActive((a) => move(a, -1)); }
        else if (k === "Home") { e.preventDefault(); setActive(move(-1, 1)); }
        else if (k === "End") { e.preventDefault(); setActive(move(options.length, -1)); }
        else if (k === "Enter" || k === " ") { e.preventDefault(); if (options[active]) pick(options[active]); }
        else if (k.length === 1) {
            // Type-ahead: jump to the next option starting with what was typed
            const now = Date.now();
            typed.current = { text: (now - typed.current.at < 700 ? typed.current.text : "") + k.toLowerCase(), at: now };
            const q = typed.current.text;
            const start = q.length === 1 ? active + 1 : active;
            for (let n = 0; n < options.length; n++) {
                const i = (start + n) % options.length;
                if (!options[i].disabled && options[i].text.toLowerCase().startsWith(q)) { setActive(i); break; }
            }
        }
    };

    let optionIndex = -1;
    const list = open && place && typeof document !== "undefined"
        ? createPortal(
            <ul
                ref={listRef}
                id={listId}
                role="listbox"
                aria-labelledby={buttonId}
                className="ds-menu ds-scroll-quiet"
                // Portaled, but React still bubbles events to the Select's parents (e.g. a clickable row)
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                style={menuStyle(place)}
            >
                {items.map((item, i) => {
                    if (item.kind === "group") return <li key={`g${i}`} role="presentation" className="ds-menu__group">{item.label}</li>;
                    const index = ++optionIndex;
                    const isSelected = item.value === value;
                    return (
                        <li
                            key={`o${i}`}
                            role="option"
                            data-index={index}
                            aria-selected={isSelected}
                            aria-disabled={item.disabled || undefined}
                            data-active={index === active || undefined}
                            className={["ds-menu__item", item.className].filter(Boolean).join(" ")}
                            onMouseEnter={() => !item.disabled && setActive(index)}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => pick(item)}
                        >
                            {item.label}
                        </li>
                    );
                })}
            </ul>,
            document.body,
        )
        : null;

    const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
        <>
            <button
                {...buttonProps}
                ref={buttonRef}
                id={buttonId}
                type="button"
                value={value}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                aria-label={accName}
                title={title ?? ariaLabel}
                disabled={disabled}
                className={cls}
                style={style}
                onClick={(e) => {
                    onClick?.(e as unknown as React.MouseEvent<HTMLSelectElement>);
                    if (e.defaultPrevented) return;
                    if (open) setOpen(false); else openList();
                }}
                onKeyDown={handleKey}
            >
                <span className="ds-select__value">{selected ? selected.label : null}</span>
                <svg className="ds-select__chevron" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {name ? <input type="hidden" name={name} value={value} /> : null}
            {list}
        </>
    );
}
