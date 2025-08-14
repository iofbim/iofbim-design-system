/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [], // apps provide their own content globs
  theme: {
    extend: {
      colors: {
        // Base/backgrounds
        customBg: "rgb(var(--color-customBg) / <alpha-value>)",

        // Brand colors
        prim:      "rgb(var(--color-prim) / <alpha-value>)",
        accent:    "rgb(var(--color-accent) / <alpha-value>)",
        highlight: "rgb(var(--color-highlight) / <alpha-value>)",

        // Text scale
        textDark:   "rgb(var(--color-textDark) / <alpha-value>)",
        textMid:    "rgb(var(--color-textMid) / <alpha-value>)",
        textLight:  "rgb(var(--color-textLight) / <alpha-value>)",
        textAccent: "rgb(var(--color-textAccent) / <alpha-value>)",
      },
      borderRadius: {
        xl: "var(--radius-xl)",
        full: "var(--radius-full)"
      },
      spacing: {
        xs: "var(--space-xs)",
        sm: "var(--space-sm)",
        md: "var(--space-md)",
        lg: "var(--space-lg)"
      },
      fontFamily: {
        // Uses variables you set via next/font in layout.tsx
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        alt:  ["var(--font-sans2)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif:["var(--font-serif)"]
      }
    }
  },
  plugins: []
};
