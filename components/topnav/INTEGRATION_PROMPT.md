Use this prompt to integrate the shared TopNav and unify header sizing across all iofBIM sites and tools.

Prompt
------
You are working in a web app or static site that currently has a custom header. Replace it with the design-system TopNav so all headers match size and style across the website.

Requirements:
- Import `design-system/iofbim-design-system/tokens.css` (absolute or relative path as appropriate) on every page that renders the header.
- Render the TopNav with the `ds-topnav-size-md` size class (or `size="md"` for React) to standardize height and font-size.
- The tools label must be exactly: "IofBIM Tools".
- Keep the same links: `/#IOB`, `/#WhatWeCanDo`, `/#ProjectsSection`, `/#ContactSection`, `/tools/IFC_schema`, `/tools/bep`, `/tools/ids`.
- Include an EN | TR language pill; in React, wire it to the app’s language toggle if available.

If the project is plain HTML:
1) Add `<link rel="stylesheet" href=".../design-system/iofbim-design-system/tokens.css">`.
2) Replace the existing header markup with the snippet from `components/topnav/README.md` under "HTML Usage".
3) Ensure the outer container has `class="ds-topnav ds-topnav-size-md"`.

If the project is React (Next.js, CRA, etc.):
1) Import tokens: `import "../design-system/iofbim-design-system/tokens.css"` (update path to your repo layout).
2) Copy `TopNav.tsx` into your app or import from the design-system path.
3) Render `<TopNav size="md" lang={lang} onToggleLang={toggleLang} />` and pass your links if they differ.

Do not alter paddings or font sizes in local CSS. The TopNav sizing utilities control these via CSS variables to keep all headers identical site-wide.

