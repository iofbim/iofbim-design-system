/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        customBg: 'rgb(var(--color-customBg) / <alpha-value>)',
        prim:     'rgb(var(--color-prim) / <alpha-value>)',
        accent:   'rgb(var(--color-accent) / <alpha-value>)',
        highlight:'rgb(var(--color-highlight) / <alpha-value>)',

        textDark:   'rgb(var(--color-textDark) / <alpha-value>)',
        textMid:    'rgb(var(--color-textMid) / <alpha-value>)',
        textLight:  'rgb(var(--color-textLight) / <alpha-value>)',
        textAccent: 'rgb(var(--color-textAccent) / <alpha-value>)'
      },
      fontFamily: {
        // You already set these with next/font in layout.tsx
        sans:  ['var(--font-sans)'],
        sans2: ['var(--font-sans2)'],
        serif: ['var(--font-serif)']
      },
      borderRadius: {
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)'
      },
      spacing: {
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)'
      }
    }
  },
  plugins: []
};
