import * as React from "react";

type BaseProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">;
export type SelectProps = BaseProps & { size?: "sm" | "md" | "lg" };

export function Select({ children, size = "sm", className = "", title, ...props }: React.PropsWithChildren<SelectProps>) {
    const cls = [
        "ds-input",
        size === "sm" && "ds-input--sm",
        size === "md" && "ds-input--md",
        size === "lg" && "ds-input--lg",
        className,
    ]
        .filter(Boolean)
        .join(" ");
    const accName = (props as any)["aria-label"] ?? title ?? "Select";
    return (
        <select
            className={cls}
            title={accName}
            aria-label={accName}
            {...props}
        >
            {children}
        </select>
    );
}
