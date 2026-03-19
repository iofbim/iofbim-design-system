/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [], // apps provide their own content globs
  theme: {
    extend: {
      colors: {
        customBg:  'rgb(var(--color-customBg) / <alpha-value>)',
        prim:      'rgb(var(--color-prim) / <alpha-value>)',
        accent:    'rgb(var(--color-accent) / <alpha-value>)',
        highlight: 'rgb(var(--color-highlight) / <alpha-value>)',

        textDark:     'rgb(var(--color-textDark) / <alpha-value>)',
        textMid:      'rgb(var(--color-textMid) / <alpha-value>)',
        textSubtle:   'rgb(var(--color-textSubtle) / <alpha-value>)',
        textMuted:    'rgb(var(--color-textMuted) / <alpha-value>)',
        textLight:    'rgb(var(--color-textLight) / <alpha-value>)',
        textAccent:   'rgb(var(--color-textAccent) / <alpha-value>)',
        textContrast: 'rgb(var(--color-textContrast) / <alpha-value>)',

        brand:   'rgb(var(--color-brand) / <alpha-value>)',
        danger:  'rgb(var(--color-danger) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        info:    'rgb(var(--color-info) / <alpha-value>)',

        surface:    'rgb(var(--color-surface) / <alpha-value>)',
        surfaceMid: 'rgb(var(--color-surfaceMid) / <alpha-value>)',

        border:       'rgb(var(--color-border) / <alpha-value>)',
        borderStrong: 'rgb(var(--color-borderStrong) / <alpha-value>)',

        idsRequired:   'rgb(var(--color-ids-required) / <alpha-value>)',
        idsOptional:   'rgb(var(--color-ids-optional) / <alpha-value>)',
        idsProhibited: 'rgb(var(--color-ids-prohibited) / <alpha-value>)',
        idsNeutral:    'rgb(var(--color-ids-neutral) / <alpha-value>)',

        ctxDoc:  'rgb(var(--color-ctx-doc) / <alpha-value>)',
        ctxBsdd: 'rgb(var(--color-ctx-bsdd) / <alpha-value>)'
      },
      fontFamily: {
        // You already set these with next/font in layout.tsx
        sans:  ['var(--font-sans)',  "ui-sans-serif", "system-ui", "sans-serif"],
        sans2: ['var(--font-sans2)', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['var(--font-serif)']
      },
      borderColor: {
        DEFAULT: 'rgb(var(--color-border))',
      },
      divideColor: {
        DEFAULT: 'rgb(var(--color-border))',
      },
      borderRadius: {
        xl:   'var(--radius-xl)',
        full: 'var(--radius-full)'
      },
      spacing: {
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)'
      },
      animation: {
        'move-left':  'move-left 30s linear infinite',
        'move-right': 'move-right 30s linear infinite'
      },
      keyframes: {
        'move-left':  { '0%': { transform: 'translateX(0%)' },   '100%': { transform: 'translateX(-50%)' } },
        'move-right': { '0%': { transform: 'translateX(-50%)' }, '100%': { transform: 'translateX(0%)' } }
      }
    }
  },
  plugins: []
};
