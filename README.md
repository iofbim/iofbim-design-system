# iofbim-design-system
I of BIM unified web design system

## TL;DR usage

```tsx
// tailwind.config.ts
import preset from '@iofbim/design-system/tailwind-preset'
export default { presets: [preset as any], content: ['./src/**/*.{ts,tsx,mdx}'] }

// src/app/globals.css
@import '@iofbim/design-system/tokens.css';
@tailwind base; @tailwind components; @tailwind utilities;

// src/app/layout.tsx (Next.js)
import { Montserrat, Raleway } from 'next/font/google'
const sans = Montserrat({ variable: '--font-sans', subsets: ['latin','latin-ext'], display: 'swap' })
const alt  = Raleway({    variable: '--font-sans2', subsets: ['latin','latin-ext'], weight: ['300','500','700'], display: 'swap' })
export default ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={`${sans.variable} ${alt.variable}`}>
    <body className="bg-customBg text-textDark font-sans antialiased">{children}</body>
  </html>
)

// Optional: use DS root class instead of Tailwind utilities
// <body className="ds-root font-sans"> ...
```

## What this package provides

- Tailwind preset: `@iofbim/design-system/tailwind-preset`
  - Maps CSS variables to Tailwind theme: colors, typography families, radii, spacing.
- CSS tokens and utilities: `@iofbim/design-system/tokens.css`
  - Defines color tokens (RGB triplets for alpha support), font variables, radius/spacing tokens.
  - Provides small, framework-agnostic utility classes: buttons, chips, panels, gradients, masks, nav items, and `.ds-root` for default background/text/font.

## Quick start (in a Next.js + Tailwind app)

1) Install or link the package

If inside this monorepo, apps already reference the package via a workspace file path. In an external app, install from your registry and add to `devDependencies`/`dependencies` as needed.

2) Import the Tailwind preset

Create or update your `tailwind.config.{ts,js}` to include the preset and content globs:

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import preset from '@iofbim/design-system/tailwind-preset'

const config: Config = {
  presets: [preset as any],
  content: [
    './src/**/*.{ts,tsx,mdx}',
    // Ensure tokens and preset are scanned if locally linked
    '../../packages/iofbim-design-system/**/*.{js,cjs,ts,tsx,css}',
  ],
}
export default config
```

3) Import tokens in your global CSS

```css
/* src/app/globals.css */
@import '@iofbim/design-system/tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4) Provide font variables with next/font (recommended)

The preset reads `--font-sans` and `--font-sans2`. Set them in your layout so Tailwind `font-sans` resolves correctly.

```tsx
// src/app/layout.tsx
import { Montserrat, Raleway } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({ subsets: ['latin','latin-ext'], variable: '--font-sans', display: 'swap' })
const raleway    = Raleway({    subsets: ['latin','latin-ext'], variable: '--font-sans2', weight: ['300','500','700'], display: 'swap' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${raleway.variable}`}>
      <body className="bg-customBg text-textDark antialiased font-sans">{children}</body>
    </html>
  )
}
```

Optionally, replace the Tailwind background/text utilities with the provided `.ds-root` class:

```tsx
<body className="ds-root font-sans">{children}</body>
```

## Available design tokens (high-level)

- Colors: `customBg`, `prim`, `accent`, `highlight`, `textDark`, `textMid`, `textLight`, `textAccent`
- Radii: `--radius-xl`, `--radius-full` (mapped to `rounded-xl`, `rounded-full`)
- Spacing: `--space-xs|sm|md|lg` (available as `spacing` scale in Tailwind)
- Fonts: `font-sans` → `--font-sans`, `font-alt` → `--font-sans2`, `font-serif` → `--font-serif`

Use via Tailwind utilities, e.g. `bg-customBg`, `text-textDark`, `bg-prim/60`.

## Provided CSS utilities (class names)

- Surfaces: `.ds-panel`
- Chips: `.ds-chip`
- Buttons: `.ds-btn`, `.ds-btn--primary`, `.ds-btn--ghost`
- Gradients: `.ds-gradient`, `.ds-gradient-card`, `.ds-gradient-dark`
- Mask: `.ds-mask-horizontal`
- Nav item: `.ds-nav-item`
- Root defaults: `.ds-root` (background, text color, smoothing, and font family)

Back-compat aliases are also included: `.nav-item`, `.gradientBG`, `.gradientCardBG`, `.gradientBG2`, `.imageMask`.

## Notes

- This package does not export React components yet; it focuses on tokens, Tailwind theme, and small CSS utilities.
- Ensure your app’s `content` globs include the design-system package files when linked locally so Tailwind can tree-shake correctly.
- To color the browser UI to match your background, set Next.js `viewport.themeColor = "rgb(var(--color-customBg))"`.
