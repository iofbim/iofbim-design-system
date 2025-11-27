import * as React from "react";
import { twMerge } from "tailwind-merge";

export type CardProps = React.ComponentPropsWithoutRef<'div'>;

export const Card = ({
    className,
    children,
    ...other
}: CardProps) => {
    return (
        <div
            className={twMerge(
                "ds-gradient-card rounded-3xl relative z-overflow-hidden overflow-hidden after:z-10 after:content-[''] after:absolute after:inset-0 after:outline-2 after:outline after:-outline-offset-2 after:rounded-3xl after:outline-white/20 after:pointer-events-none",
                className
            )}
            {...other}
        >
            <div className={twMerge("absolute inset-0 -z-10 opacity-5 bg-customBg")}></div>
            {children}
        </div>
    );
};

export const CardNoBG = ({
    className,
    children,
    ...other
}: CardProps) => {
    return (
        <div
            className={twMerge(
                "rounded-3xl relative z-overflow-hidden overflow-hidden after:z-10 after:content-[''] after:absolute after:inset-0 after:outline-2 after:outline after:-outline-offset-2 after:rounded-3xl after:outline-white/20 after:pointer-events-none",
                className
            )}
            {...other}
        >
            {children}
        </div>
    );
};
