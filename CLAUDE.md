# Reino de Pavel — rules for anyone changing the site

`CLAUDE.md` and `AGENTS.md` hold the same text. Edit both, or `node tools/check-nav.mjs` fails.

## The menu is the source of truth

The navigation menu, `<nav id="pvl-nav">`, is how a visitor finds anything in the Kingdom. It is not
decoration and it is not optional: **a section that is not in the menu does not exist**, and a menu
entry that points nowhere is a broken door in the palace.

One `<nav>` serves both the desktop dropdowns and the mobile menu — the same markup, laid out by CSS
(`@media (max-width:768px)` turns it into the hamburger panel). So one missed edit breaks both.

**Every page carries the same `<nav>`**, and the same "halls of the palace" backlinks
(`<nav class="pvl-wings">`) at its foot. Edit both in `reino-de-pavel.dc.html` (the landing page), then
copy them to the others with `node tools/sync-nav.mjs`. Menu links are always page-qualified
(`documentos.html#visa`, or just `biblioteca.html` for a one-section page) so the one menu works on
every page.

Nothing ships that adds, renames, moves or removes a section unless the menu follows **in the same
change**. Run the check before every commit that touches a section:

```bash
node tools/check-nav.mjs
```

It fails when a `<section id>` is not reachable from the menu, when a menu link points at a missing
page or id, when a menu label has Spanish without English (or the reverse), when two pages carry
different menus or different halls, when the halls miss a page, when `sitemap.xml` misses a page, or when `README.md`'s table never names a section.
It cannot see a layout, so the breakpoint checks below stay yours.

## Definition of Done for any section change

- [ ] The section has a stable, descriptive `id` (Spanish, kebab-case: `#banda-sonora`, `#premio-pavel`).
      Never rename an existing id: links and `?ref=` deep links point at it.
- [ ] The section lives on the right page (see "The pages" below). A new section joins its group's
      page; a big one may get its own page, which then needs the full page shell.
- [ ] A menu entry is added, renamed or removed in the right `.pvl-nav-group` — *El Reino / The
      Kingdom*, *Documentos / Documents*, *Honores / Honors*, *Ministerios / Ministries*, *Cultura /
      Culture* — or as a top-level `.pvl-nav-toplink` — on the landing page, then
      `node tools/sync-nav.mjs` copies it to every page.
- [ ] The entry's label carries **both** `<span data-lang="es">` **and** `<span data-lang="en">`. A
      word that is the same in both languages (`Quiz`, `Descartes`) may be plain text with no spans.
- [ ] Checked in **English and Spanish** — the EN / ES switch beside the menu.
- [ ] Checked on **desktop (~1280 px)**: the dropdown opens, the entry is there, the link scrolls to
      or opens the section.
- [ ] Checked on **mobile (~390 px)**: the hamburger opens, the group expands, the entry is there,
      and tapping it closes the menu and reaches the section. No horizontal scroll.
- [ ] `sitemap.xml` lists every page.
- [ ] `README.md`'s section table lists the section's `#id`, its page, its menu group and what it holds.
- [ ] A section that moved off the landing page is in `assets/js/anclas.js`, so the old
      `reino-de-pavel.dc.html#id` link still lands on it.
- [ ] The Chronicle (`#pvl-changelog`, in `cronica.html`) gains a new **Decreto N.º n** entry at the top of the list,
      the next number, dated, in both languages.
- [ ] `node tools/check-nav.mjs` passes.

## The pages

No build step: each page is a complete static file, and shared things live in `assets/`.

| Page | Holds |
|---|---|
| `reino-de-pavel.dc.html` | The landing page: hero, state figures, anthem player, `#himno`, `#mapa`, `#juego`, the invitation card. `index.html` redirects here. |
| `el-reino.html` | `#emblema`, `#blason`, `#bandera`, `#constitucion`, `#descartes`, `#clima` |
| `documentos.html` | `#documentos`, `#moneda`, `#papeleria` (with the citizenship certificate, `#ciudadania`), `#visa`, `#calendario`, `#hora-real` |
| `honores.html` | `#orden-unicornio`, `#premio-pavel`, `#titulo` |
| `ministerios.html` | `#decreto`, `#quejas`, `#quiz`, `#test-psi`, `#oraculo`, `#bolsa` |
| `biblioteca.html`, `banda-sonora.html` | One section each |
| `descargas.html` | `#descargas`, `#postales` |
| `museo.html` | `#museo` |
| `arcade.html` | `#pavel-dice`, `#arcade` |
| `gastronomia.html` | `#gastronomia` |
| `cronica.html` | The Chronicle, `#pvl-changelog` |

- **Styles**: `assets/css/reino.css`, linked from every page's real `<head>`.
- **Scripts**: `assets/js/*.js`, one per feature, each listed as `<script src>` in the `<helmet>` of
  the pages that need it. Every page loads `i18n`, `menu`, `huevos` and `mundo`; the rest only where
  their section is. `lienzo.js` (`window.PavelLienzo`) draws and downloads the PNG cards (title,
  visa, decree…); load it before the feature that uses it. `anclas.js` runs in the landing page's real `<head>` and redirects old
  `#anchors` of sections that moved.
- **A sub-page** is the landing page's shell (real `<head>`, `<helmet>` metadata with its own title,
  description, canonical and `og:url`) plus the `.pvl-subhead` header (top bar with the menu,
  breadcrumbs, title, chips to the sections on the page), its sections, the `.pvl-wings` "halls of the
  palace" backlinks, the footer and the `data-dc-script`. Copy an existing sub-page to start one, add
  its card to `.pvl-wings` on the landing page, run `node tools/sync-nav.mjs`, and list it in
  `sitemap.xml`. The halls block is the same on every page; `menu.js` marks the current one.
- **The anthem plays only on the landing page.** A page navigation would cut it, and restarting it on
  every page would be worse. Sub-pages are silent; the soundtrack page has its own `#pavel-audio`
  that plays only when the visitor picks the anthem track.

## How the page works (the traps)

- **Every visible string is a pair**: `<span data-lang="es">…</span><span data-lang="en">…</span>`.
  `window.PavelI18N` (`assets/js/i18n.js`) hides the inactive one with `.pvl-hide`. Attributes use
  `data-aria-es` / `data-aria-en` and `data-alt-es` / `data-alt-en`. English is the default; the
  choice is kept in `localStorage`.
- **Scripts in `<helmet>` run twice** — once at parse, once when `support.js` remounts them into
  `<head>` — and the body mounts after them. Delegate events on `document`, look elements up on use,
  and guard each script with a `window.__…` lock. Because the body mounts late, the browser cannot
  find a `#anchor` on arrival; `menu.js` scrolls to it once the section exists.
- **Never give a `z-index` (or `transform`, `filter`, `opacity` < 1) to an ancestor of `#pvl-nav`.**
  It makes a stacking context, and the dropdown then sits under `#pvl-nav-backdrop` (z-index 70, on
  `<body>`): the menu opens but every link click lands on the backdrop and only closes it (#51).
  Check menu links with real clicks, or `document.elementFromPoint()` on each open link — a scripted
  `link.click()` skips hit-testing and passes even when the link is covered.
- **A Content-Security-Policy `<meta>`** lists every external origin; `SECURITY_NOTES.md` records how
  it was derived. A new external resource must be added there, and is better avoided.
- No build step, no dependencies: the site is static files on GitHub Pages from `main`.
- To test, serve the folder (`python3 -m http.server`) and open `http://localhost:8000/`.
