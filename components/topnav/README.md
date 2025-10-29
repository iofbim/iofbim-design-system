TopNav (Design System)
======================

Purpose
-------
- Shared header/navigation bar to keep a consistent look & size across all iofBIM sites and tools.
- Works with plain HTML (no framework) and has a React/TSX component for apps.

Prerequisites
-------------
- Include `design-system/iofbim-design-system/tokens.css` on every page/app using TopNav.
- Use one of the size utilities to guarantee consistent height: `ds-topnav-size-sm|md|lg` (recommended: `md`).

HTML Usage
----------
<link rel="stylesheet" href="/path/to/design-system/iofbim-design-system/tokens.css" />

<div class="ds-topnav ds-topnav-size-md">
  <nav class="ds-topnav__group" aria-label="Site">
    <a href="/#IOB" class="ds-nav-item">I of BIM</a>
    <a href="/#WhatWeCanDo" class="ds-nav-item">What we can do</a>
    <a href="/#ProjectsSection" class="ds-nav-item">Projects</a>
    <a href="/#ContactSection" class="ds-nav-item">Contact</a>
  </nav>
  <nav class="ds-topnav__group" aria-label="Tools" style="margin: 0 .5rem">
    <div class="ds-dropdown">
      <button type="button" class="ds-nav-item">IofBIM Tools</button>
      <div class="ds-topnav__dropdown" role="menu">
        <a role="menuitem" href="/tools/IFC_schema">IFC Schema</a>
        <a role="menuitem" href="/tools/bep">BEP Authoring Tool</a>
        <a role="menuitem" href="/tools/ids">IDS Authoring Tool</a>
      </div>
    </div>
  </nav>
  <nav class="ds-topnav__group" aria-label="Language">
    <span class="ds-nav-item">EN | TR</span>
  </nav>
  <!-- Optional: make sticky at the top of the viewport (default) -->
</div>

React Usage
-----------
// TopNav.tsx is provided in this folder
import TopNav from "design-system/iofbim-design-system/components/topnav/TopNav";
import "design-system/iofbim-design-system/tokens.css";

<TopNav
  size="md"
  lang="en"
  onToggleLang={() => setLang(prev => prev === "en" ? "tr" : "en")}
  links={{ iofbim: "/#IOB", whatWeCanDo: "/#WhatWeCanDo", projects: "/#ProjectsSection", contact: "/#ContactSection" }}
  tools={{ ifcSchema: "/tools/IFC_schema", bep: "/tools/bep", ids: "/tools/ids" }}
/>;

Consistency Notes
-----------------
- `.ds-topnav-size-md` ensures the same pill/button height and font-size everywhere.
- The inner buttons use the shared `.ds-nav-item` style; TopNav overrides their padding/font via CSS variables.
- Keep border and background colors as defined to match the screenshots.

