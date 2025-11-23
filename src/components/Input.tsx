import * as React from "react";

type BaseProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">;
export type InputProps = BaseProps & { size?: "sm" | "md" | "lg" };

export function Input({ size = "sm", className = "", ...props }: InputProps) {
    const cls = [
        "ds-input",
        size === "sm" && "ds-input--sm",
        size === "md" && "ds-input--md",
        size === "lg" && "ds-input--lg",
        className,
    ]
        .filter(Boolean)
        .join(" ");
    return <input className={cls} {...props} />;
}
