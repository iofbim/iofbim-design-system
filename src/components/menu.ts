import * as React from "react";

/** Where a `.ds-menu` list sits: fixed, under its anchor (above when there is no room) */
export type MenuPlacement = { left: number; top?: number; bottom?: number; minWidth: number; maxHeight: number };

/**
 * Positions a portaled `.ds-menu` against `anchor` while `open`, and closes it (via `onClose`) on
 * an outside press or when anything else scrolls. The list is portaled to <body>; with CSS zoom on
 * <body> (design-system density) screen px are divided back by it.
 */
export function useMenuPlacement(
    anchor: React.RefObject<HTMLElement | null>,
    list: React.RefObject<HTMLElement | null>,
    open: boolean,
    onClose: () => void,
    /** "right": the list's right edge lines up with the anchor's, so a wide list grows leftwards */
    align: "left" | "right" = "left",
): MenuPlacement | null {
    const [place, setPlace] = React.useState<MenuPlacement | null>(null);
    const close = React.useRef(onClose);
    close.current = onClose;

    const measure = React.useCallback(() => {
        const el = anchor.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const scale = el.offsetHeight ? r.height / el.offsetHeight : 1;
        const vh = window.innerHeight;
        const below = vh - r.bottom - 8;
        const above = r.top - 8;
        const up = below < 180 && above > below;
        setPlace({
            left: r.left / scale,
            ...(up ? { bottom: (vh - r.top + 4) / scale } : { top: (r.bottom + 4) / scale }),
            minWidth: r.width / scale,
            maxHeight: Math.min(320, (up ? above : below) / scale),
        });
    }, [anchor]);

    React.useLayoutEffect(() => {
        if (!open) { setPlace(null); return; }
        measure();
        const onScroll = (e: Event) => { if (!list.current?.contains(e.target as Node)) close.current(); };
        const onDown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!anchor.current?.contains(t) && !list.current?.contains(t)) close.current();
        };
        window.addEventListener("resize", measure);
        document.addEventListener("scroll", onScroll, true);
        document.addEventListener("mousedown", onDown);
        return () => {
            window.removeEventListener("resize", measure);
            document.removeEventListener("scroll", onScroll, true);
            document.removeEventListener("mousedown", onDown);
        };
    }, [open, measure, anchor, list]);

    // The list is as wide as its content (up to the window); right-aligned lists line up with the
    // anchor's right edge; any list is shifted back inside the window when it would run off it
    React.useLayoutEffect(() => {
        const el = list.current;
        const a = anchor.current;
        if (!open || !place || !el || !a) return;
        const ar = a.getBoundingClientRect();
        const scale = a.offsetHeight ? ar.height / a.offsetHeight : 1;
        if (align === "right") el.style.left = `${Math.max(8, ar.right - el.getBoundingClientRect().width) / scale}px`;
        const r = el.getBoundingClientRect();
        const overflow = r.right - (window.innerWidth - 8);
        if (overflow > 0) el.style.left = `${Math.max(8, r.left - overflow) / scale}px`;
    });

    return open ? place : null;
}

/** Fixed-position style for a placed `.ds-menu` */
export function menuStyle(place: MenuPlacement): React.CSSProperties {
    return { position: "fixed", left: place.left, top: place.top, bottom: place.bottom, minWidth: place.minWidth, maxHeight: place.maxHeight };
}
