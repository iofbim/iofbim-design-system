"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { menuStyle, useMenuPlacement } from "./menu";

/**
 * An action menu: a button that opens a `.ds-menu` list of actions ("⋯", "More", bind / insert
 * menus). For picking a value use Select; for several values, MultiSelect.
 *
 *   <Menu label="More actions" trigger="⋯" items={[
 *     { label: "Duplicate", onSelect: duplicate },
 *     { separator: true },
 *     { label: "Show grid", checked: grid, onSelect: () => setGrid(!grid) },   // stays open
 *     { label: "Delete", onSelect: remove, danger: true },
 *   ]} />
 *
 * Keyboard: Enter/Space/↓ open on the first item, ↑/↓/Home/End move, Enter/Space choose,
 * Escape/Tab close (focus back on the button).
 */

export type MenuItem =
    | { separator: true }
    | {
        label: React.ReactNode;
        onSelect: () => void;
        /** Smaller text on the right (a shortcut, a count) */
        detail?: React.ReactNode;
        disabled?: boolean;
        /** Destructive action, in the danger colour */
        danger?: boolean;
        /** A toggle (menuitemcheckbox): choosing it keeps the menu open */
        checked?: boolean;
        /** A title for the row (e.g. why it is disabled) */
        title?: string;
    };

export type MenuProps = {
    /** Accessible name of the button and the menu */
    label: string;
    /** What the button shows (text or an icon) */
    trigger: React.ReactNode;
    items: readonly MenuItem[];
    /** Classes for the button; default is a small ghost button */
    className?: string;
    title?: string;
    disabled?: boolean;
};

const isAction = (i: MenuItem): i is Exclude<MenuItem, { separator: true }> => !("separator" in i);

export function Menu({ label, trigger, items, className, title, disabled }: MenuProps) {
    const [open, setOpen] = React.useState(false);
    const button = React.useRef<HTMLButtonElement | null>(null);
    const list = React.useRef<HTMLUListElement | null>(null);
    const place = useMenuPlacement(button, list, open, () => setOpen(false));
    const menuId = React.useId();

    const focusables = () => [...(list.current?.querySelectorAll<HTMLElement>("[role^=menuitem]:not([aria-disabled=true])") ?? [])];
    React.useEffect(() => { if (open && place) focusables()[0]?.focus(); }, [open, place]);

    const close = (refocus = true) => { setOpen(false); if (refocus) button.current?.focus(); };
    const onListKey = (e: React.KeyboardEvent) => {
        const els = focusables();
        const i = els.indexOf(document.activeElement as HTMLElement);
        if (e.key === "ArrowDown") { e.preventDefault(); els[(i + 1) % els.length]?.focus(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); els[(i - 1 + els.length) % els.length]?.focus(); }
        else if (e.key === "Home") { e.preventDefault(); els[0]?.focus(); }
        else if (e.key === "End") { e.preventDefault(); els[els.length - 1]?.focus(); }
        else if (e.key === "Escape") { e.preventDefault(); close(); }
        else if (e.key === "Tab") close(false);
    };
    const choose = (item: Exclude<MenuItem, { separator: true }>) => {
        if (item.disabled) return;
        item.onSelect();
        if (item.checked === undefined) close();
    };

    return (
        <>
            <button
                ref={button}
                type="button"
                className={className ?? "ds-menu-trigger"}
                aria-label={label}
                title={title ?? label}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                disabled={disabled}
                onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
                onKeyDown={(e) => { if (e.key === "ArrowDown" && !open) { e.preventDefault(); setOpen(true); } }}
            >
                {trigger}
            </button>
            {open && place && typeof document !== "undefined" && createPortal(
                <ul
                    ref={list}
                    id={menuId}
                    role="menu"
                    aria-label={label}
                    className="ds-menu ds-scroll-quiet"
                    style={menuStyle(place)}
                    onKeyDown={onListKey}
                    onClick={(e) => e.stopPropagation()}
                >
                    {items.map((item, i) =>
                        !isAction(item) ? (
                            <li key={i} role="separator" className="ds-menu__separator" />
                        ) : (
                            <li key={i} role="none">
                                <button
                                    type="button"
                                    role={item.checked === undefined ? "menuitem" : "menuitemcheckbox"}
                                    aria-checked={item.checked === undefined ? undefined : item.checked}
                                    aria-disabled={item.disabled || undefined}
                                    tabIndex={-1}
                                    title={item.title}
                                    className={`ds-menu__item ds-menu__action${item.danger ? " ds-menu__action--danger" : ""}`}
                                    onClick={() => choose(item)}
                                >
                                    {item.checked !== undefined && <span className="ds-menu__check" aria-hidden>{item.checked ? "✓" : ""}</span>}
                                    <span className="ds-menu__label">{item.label}</span>
                                    {item.detail ? <span className="ds-menu__detail">{item.detail}</span> : null}
                                </button>
                            </li>
                        ),
                    )}
                </ul>,
                document.body,
            )}
        </>
    );
}
