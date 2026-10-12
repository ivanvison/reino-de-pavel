#!/usr/bin/env node
// Copies the menu and the "halls of the palace" backlinks of the landing page onto every other
// page — the rule in AGENTS.md.
//
//   node tools/sync-nav.mjs
//
// Edit <nav id="pvl-nav"> (and, for a new page, <nav class="pvl-wings">) in reino-de-pavel.dc.html,
// run this, then `node tools/check-nav.mjs`.
// Every page carries the same menu; the pages have no build step, so this is how they stay equal.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = 'reino-de-pavel.dc.html';
const read = (f) => readFileSync(join(root, f), 'utf8');

const BLOCKS = ['<nav id="pvl-nav"', '<nav class="pvl-wings"'];
const span = (html, open) => {
  const a = html.indexOf(open);
  if (a === -1) return null;
  return [a, html.indexOf('</nav>', a) + '</nav>'.length];
};

const src = read(SOURCE);
let changed = 0;
for (const f of readdirSync(root).filter((f) => f.endsWith('.html') && f !== SOURCE)) {
  const html = read(f);
  if (!span(html, BLOCKS[0])) continue;
  let next = html;
  for (const open of BLOCKS) {
    const [a, b] = span(src, open);
    const s = span(next, open);
    if (s) next = next.slice(0, s[0]) + src.slice(a, b) + next.slice(s[1]);
  }
  if (next !== html) { writeFileSync(join(root, f), next); changed++; console.log(`updated ${f}`); }
}
console.log(changed ? `✓ menu copied to ${changed} page(s)` : '✓ every page already carries the menu and the halls');
