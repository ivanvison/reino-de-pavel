#!/usr/bin/env node
// Checks that the navigation menu reflects the sections that exist — the rule in AGENTS.md.
//
//   node tools/check-nav.mjs
//
// Every page with a <nav id="pvl-nav"> is read. It fails (exit 1) when:
//   - a <section id="…"> is not reachable from the menu;
//   - a menu link points at a page or an id that does not exist;
//   - a menu label has only one of <span data-lang="es"> / <span data-lang="en">;
//   - two pages carry different menus, or different "halls of the palace" backlinks, or the
//     backlinks miss a page;
//   - sitemap.xml misses a page, or README.md never names a section's #id;
//   - CLAUDE.md and AGENTS.md differ.
// No dependencies: plain Node 18+.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(root, f), 'utf8');
const problems = [];
const fail = (msg) => problems.push(msg);

// Sections that are deliberately not in the menu: none today. Add an id here only with a reason.
const UNLISTED = new Set([]);

const pages = readdirSync(root)
  .filter((f) => f.endsWith('.html'))
  .filter((f) => /<nav id="pvl-nav"/.test(read(f)));
if (!pages.length) fail('no page carries <nav id="pvl-nav">');

const navOf = (html) => {
  const start = html.indexOf('<nav id="pvl-nav"');
  return html.slice(start, html.indexOf('</nav>', start) + 6);
};
const idsOf = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const sectionsOf = (html) => [...html.matchAll(/<section\s+id="([^"]+)"/g)].map((m) => m[1]);

const ids = Object.fromEntries(pages.map((p) => [p, idsOf(read(p))]));
const reached = new Set(); // "page#id" and "page"

const wingsOf = (html) => {
  const start = html.indexOf('<nav class="pvl-wings"');
  return start === -1 ? '' : html.slice(start, html.indexOf('</nav>', start) + 6);
};
const firstNav = navOf(read(pages[0] ?? ''));
const firstWings = wingsOf(read(pages[0] ?? ''));
for (const page of pages) {
  const w = wingsOf(read(page));
  if (!w) fail(`${page}: no <nav class="pvl-wings"> — every page links back to home and its siblings`);
  else if (w !== firstWings) fail(`${page}: its "halls of the palace" differ from ${pages[0]}'s — run node tools/sync-nav.mjs`);
  for (const other of pages) if (w && !w.includes(`href="${other}"`)) fail(`${page}: "halls of the palace" miss ${other}`);
}
for (const page of pages) {
  const nav = navOf(read(page));
  if (nav !== firstNav) fail(`${page}: its menu differs from ${pages[0]}'s — run node tools/sync-nav.mjs`);

  for (const m of nav.matchAll(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const [, href, label] = m;
    if (/^https?:/.test(href)) continue;
    const es = /data-lang="es"/.test(label);
    const en = /data-lang="en"/.test(label);
    if (es !== en) fail(`${page}: menu link ${href} has a ${es ? 'Spanish' : 'English'} label only`);

    const [file, id] = href.startsWith('#') ? [page, href.slice(1)] : href.split('#');
    if (!ids[file] && !existsSync(join(root, file))) { fail(`${page}: menu link ${href} points at a missing page`); continue; }
    if (id && !(ids[file] ?? idsOf(read(file))).has(id)) fail(`${page}: menu link ${href} points at a missing id`);
    reached.add(id ? `${file}#${id}` : file);
  }
}

const readme = read('README.md');
const sitemap = existsSync(join(root, 'sitemap.xml')) ? read('sitemap.xml') : '';
for (const page of pages) {
  if (!sitemap.includes(page) && !(page === 'index.html' && sitemap.includes('/</loc>'))) fail(`sitemap.xml: ${page} is missing`);
  for (const id of sectionsOf(read(page))) {
    if (UNLISTED.has(id)) continue;
    if (!reached.has(`${page}#${id}`) && !reached.has(page)) fail(`${page}: section #${id} is not in the menu`);
    if (!readme.includes(`#${id}`)) fail(`README.md: section #${id} is not in the section table`);
  }
}

if (existsSync(join(root, 'AGENTS.md')) && read('AGENTS.md') !== (existsSync(join(root, 'CLAUDE.md')) ? read('CLAUDE.md') : '')) {
  fail('CLAUDE.md and AGENTS.md differ — they hold the same rules');
}

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join('\n'));
  console.error(`\n${problems.length} problem(s). The menu is the source of truth — see AGENTS.md.`);
  process.exit(1);
}
console.log(`✓ menu matches the sections on ${pages.join(', ')}`);
