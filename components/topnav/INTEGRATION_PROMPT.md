Use this prompt to integrate the shared TopNav and unify header sizing and placement across all iofBIM sites and tools.

Prompt
------
You are working in a web app or static site that currently has a custom header. Replace it with the design-system TopNav so all headers match size, position, and style across the website.

Requirements:
- Import `design-system/iofbim-design-system/tokens.css` (absolute or relative path as appropriate) on every page that renders the header.
- Use the `ds-topnav-size-md` size class (or `size="md"` for React) to standardize height and font size.
- Add `ds-topnav--floating` to match the floating look (fixed with a small top offset on desktop, sticky on small screens). Omit it if the header should be flush with the top edge.
- The tools label must be exactly: "IofBIM Tools".
- Keep the same links: `/#IOB`, `/#WhatWeCanDo`, `/#ProjectsSection`, `/#ContactSection`, `/tools/IFC_schema`, `/tools/bep`, `/tools/ids`.
- Include an EN | TR language pill; in React, wire it to the app’s language toggle if available.

If the project is plain HTML:
1) Add `<link rel="stylesheet" href=".../design-system/iofbim-design-system/tokens.css">`.
2) Replace the existing header markup with the snippet from `components/topnav/README.md` under "HTML Usage".
3) Ensure the outer container has `class="ds-topnav ds-topnav-size-md ds-topnav--floating"` (remove `ds-topnav--floating` if you do not want the offset).

If the project is React (Next.js, CRA, etc.):
1) Import tokens: `import "../design-system/iofbim-design-system/tokens.css"` (update path to your repo layout).
2) Copy `TopNav.tsx` into your app or import from the design-system path.
3) Render `<TopNav size="md" lang={lang} onToggleLang={toggleLang} className="ds-topnav--floating" />` and pass your links if they differ.

Do not alter paddings or font sizes in local CSS. The TopNav sizing utilities control these via CSS variables to keep all headers identical site‑wide. Avoid overriding TopNav background/blur so it matches the design system.

Base Path Hosting
-----------------
If your site/app is deployed under a subpath (base path), make sure links and imports are prefixed correctly.

- Next.js: set `basePath` in `next.config` and expose it as `process.env.NEXT_PUBLIC_BASE_PATH`. Then prefix TopNav links when needed:

  ```tsx
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";
  <TopNav
    size="md"
    className="ds-topnav--floating"
    tools={{ ifcSchema: `${bp}/tools/IFC_schema`, bep: `${bp}/tools/bep`, ids: `${bp}/tools/ids` }}
    // If you also link to on‑page anchors that live on the root page, ensure they resolve correctly
    links={{ iofbim: `${bp}/#IOB`, whatWeCanDo: `${bp}/#WhatWeCanDo`, projects: `${bp}/#ProjectsSection`, contact: `${bp}/#ContactSection` }}
  />
  ```

- Static HTML: either use a `<base href="/your-base/">` tag in the `<head>` or prefix each href, for example `href="/your-base/tools/ids"`.

- Avoid double prefixing: if your router already expands links with the base path, do not add the prefix again. Verify by inspecting the rendered anchor `href` in DevTools.
