# Agent Guide (Design System)

Scope: this file applies to the `packages/iofbim-design-system` package and code within this directory.

## Purpose

Expose a Tailwind preset plus CSS tokens/utilities used by apps in this monorepo. No React components are exported at this time.

## Exports

- `@iofbim/design-system/tailwind-preset` – Tailwind theme mapping for colors, fonts, radii, spacing.
- `@iofbim/design-system/tokens.css` – CSS variables (tokens) and utilities (e.g., `.ds-btn`, `.ds-panel`, `.ds-root`).

## Usage Patterns

- Apps import `tokens.css` in their global stylesheet before Tailwind layers.
- Apps include the preset via `presets: [preset]` in `tailwind.config.{ts,js}`.
- Fonts are normally provided via `next/font` to set `--font-sans` and `--font-sans2`. Defaults exist to avoid invalid CSS, but `next/font` is recommended.
- Background and base text color can be applied via Tailwind utilities (`bg-customBg text-textDark`) or with the `.ds-root` utility class.

## Token Notes

- Colors are RGB triplets so opacity utilities (e.g., `/60`) work with Tailwind.
- Font variables: `--font-sans` (Montserrat) and `--font-sans2` (Raleway) have safe defaults in `tokens.css`. Apps may override with `next/font`.
- Spacing and radii tokens map into Tailwind via the preset.

## Contributing

- If adding tokens, update both `tokens.css` and `tailwind-preset/index.cjs` to keep Tailwind utilities in sync.
- Keep utilities lightweight and framework-agnostic.
- Avoid adding opinionated global CSS; prefer opt-in utilities like `.ds-root`.

