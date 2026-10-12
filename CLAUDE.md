# Reino de Pavel — rules for anyone changing the site

`CLAUDE.md` and `AGENTS.md` hold the same text. Edit both, or `node tools/check-nav.mjs` fails.

## The menu is the source of truth

The navigation menu, `<nav id="pvl-nav">`, is how a visitor finds anything in the Kingdom. It is not
decoration and it is not optional: **a section that is not in the menu does not exist**, and a menu
entry that points nowhere is a broken door in the palace.

One `<nav>` serves both the desktop dropdowns and the mobile menu — the same markup, laid out by CSS
(`@media (max-width:768px)` turns it into the hamburger panel). So one missed edit breaks both.

Nothing ships that adds, renames, moves or removes a section unless the menu follows **in the same
change**. Run the check before every commit that touches a section:

```bash
node tools/check-nav.mjs
```

It fails when a `<section id>` is not reachable from the menu, when a menu link points at a missing
page or id, when a menu label has Spanish without English (or the reverse), when two pages carry
different menus, when `sitemap.xml` misses a page, or when `README.md`'s table never names a section.
It cannot see a layout, so the breakpoint checks below stay yours.

## Definition of Done for any section change

- [ ] The section has a stable, descriptive `id` (Spanish, kebab-case: `#banda-sonora`, `#premio-pavel`).
      Never rename an existing id: links and `?ref=` deep links point at it.
- [ ] A menu entry is added, renamed or removed in the right `.pvl-nav-group` — *El Reino / The
      Kingdom*, *Documentos / Documents*, *Honores / Honors*, *Ministerios / Ministries*, *Cultura /
      Culture* — or as a top-level `.pvl-nav-toplink`.
- [ ] The entry's label carries **both** `<span data-lang="es">` **and** `<span data-lang="en">`. A
      word that is the same in both languages (`Quiz`, `Descartes`) may be plain text with no spans.
- [ ] Checked in **English and Spanish** — the EN / ES switch beside the menu.
- [ ] Checked on **desktop (~1280 px)**: the dropdown opens, the entry is there, the link scrolls to
      or opens the section.
- [ ] Checked on **mobile (~390 px)**: the hamburger opens, the group expands, the entry is there,
      and tapping it closes the menu and reaches the section. No horizontal scroll.
- [ ] `sitemap.xml` lists every page.
- [ ] `README.md`'s section table lists the section's `#id`, its menu group and what it holds.
- [ ] The Chronicle (`#pvl-changelog`) gains a new **Decreto N.º n** entry at the top of the list,
      the next number, dated, in both languages.
- [ ] `node tools/check-nav.mjs` passes.

## How the page works (the traps)

- **Every visible string is a pair**: `<span data-lang="es">…</span><span data-lang="en">…</span>`.
  `window.PavelI18N`, in `<helmet>`, hides the inactive one with `.pvl-hide`. Attributes use
  `data-aria-es` / `data-aria-en` and `data-alt-es` / `data-alt-en`. English is the default; the
  choice is kept in `localStorage`.
- **Scripts in `<helmet>` run twice** — once at parse, once when `support.js` remounts them into
  `<head>` — and the body mounts after them. Delegate events on `document`, look elements up on use,
  and guard each script with a `window.__…` lock.
- **A Content-Security-Policy `<meta>`** lists every external origin; `SECURITY_NOTES.md` records how
  it was derived. A new external resource must be added there, and is better avoided.
- No build step, no dependencies: the site is static files on GitHub Pages from `main`.
