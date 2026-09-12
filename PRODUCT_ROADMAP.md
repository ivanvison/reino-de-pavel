# Reino de Pavel — Product Roadmap

*Prepared as a planning reference. Status notes below reflect what has since shipped.*

## 1. Current state

Reino de Pavel is a single-page satirical micronation site built as personal comedic branding: a fully realized fake national identity system for a "country" with exactly one citizen, Pavel. The page (`reino-de-pavel.dc.html`) covers a coat of arms and brand system, a flag ("La Iridiscente"), a passport/national ID/driver's license set, currency ("Grandezas") and postage stamps, a looping national anthem with lyrics and cover art, a seven-article constitution ("Carta Magna de la Grandeza"), a Descartes cogito parody, diplomatic letterhead, a citizenship certificate, a visa page, a national holiday calendar, the Order of the Unicorn medal, the Pavel Prize diploma, a royal decree generator, a Ministry of Complaints, a "How Pavelian are you?" quiz, and an interactive minigame, "El Mundo de Pavel," where a visitor registers a pilgrim name, walks a small throne room, worships Pavel, unlocks achievement badges, and can summon "the unicorn of unicorns." The entire page is fully bilingual (English default, Spanish toggle via `localStorage`), including all of the above. The national motto is **"El Non Plus Ultra" / "The Non Plus Ultra"** (the earlier, profane wording was retired at the owner's request).

## 2. In flight (this session) — now shipped

The three efforts originally called out here are done:

- **Mobile/tablet responsiveness** — breakpoints for phones and tablets, touch-friendly tap targets.
- **SEO/marketing** — meta description, Open Graph/Twitter cards, JSON-LD, `robots.txt`/`sitemap.xml`, a favicon.
- **Security review** — see `SECURITY_NOTES.md` (hardened cookie flags, a Content-Security-Policy).

## 3. Roadmap ideas — status

### More documents & artifacts

1. ✅ **Diplomatic visa page** — shipped as `#visa`.
2. ✅ **Order of the Unicorn — medal & honor certificate** — shipped as `#orden-unicornio`, personalized with the visitor's registered pilgrim name when one exists.
3. ✅ **National holiday calendar** — shipped as `#calendario`, 8 invented holidays (the motto-referencing one now reads "Day of the Non Plus Ultra").
4. ✅ **Royal decree generator** — shipped as `#decreto`; assembles a bureaucratic decree client-side from a visitor-supplied topic, no backend.
5. ✅ **Ministry of Complaints** — shipped as `#quejas`; one of 8 randomized canned non-answers, nothing stored.
6. ✅ **National anthem sheet-music mockup** — shipped inside the existing `#himno` section.
7. ✅ **Coin/medallion design** — shipped inside the existing `#moneda` (currency) section.
8. ✅ **"Pavel Prize" academic award certificate** — shipped as `#premio-pavel`, personalized the same way as the medal.

### Interactivity & fun

9. ✅ **Leaderboard of top adorers — joke version only.** Per the owner's explicit direction (no real cross-visitor storage, no backend), only the joke version was built: it shows the visitor's own registered name as the sole entry ("no one else has ever logged in"). The "real, shared" variant from the original idea is intentionally not planned — see §4.
10. ✅ **Downloadable/shareable personalized citizenship card image** — a button on the citizenship certificate draws a simplified card to a `<canvas>` (no external rasterization library, so no new CSP/dependency) and downloads it as a PNG.
11. ✅ **"How Pavelian are you?" quiz** — shipped as `#quiz`, 6 questions, resolves to Pilgrim/Citizen/Minister/Sovereign-Adjacent.
12. ✅ **Easter eggs** — shipped: a Konami-code listener (brief rainbow flash), 7 clicks on the coat-of-arms crest, and a counter on the anthem `<audio>` loop (detected via `timeupdate` wrap-around, since a looping track never fires `ended`).
13. ✅ **Achievements/badges for game milestones** — shipped: 5 `localStorage`-persisted badges (first bow, royal thanks, first unicorn summoned, 50 acts of worship, visited in both languages), with a badge shelf in the game modal.
14. ⛔ **Guestbook of registered pilgrims — not built, by design.** This idea inherently needs shared, cross-visitor storage. The owner was explicit: no real data collection beyond the visitor's own browser, and GitHub Pages has no backend/database to hold it anyway. Treat this as declined rather than pending.

### Growth & shareability

15. ✅ **"State of the Kingdom" changelog page** — shipped as `#pvl-changelog`, grounded in the repo's actual commit history rather than invented milestones.
16. ✅ **Referral/invite mechanic** — shipped: a `?ref=` query-parameter link generator with copy-to-clipboard (Clipboard API, with a manual-select fallback) and a "summons received from X" banner on arrival — entirely client-side, no backend.
17. **Print-ready exports of key documents — shipped as print CSS, not standalone PDFs.** Rather than generating PDF files (which would need a library or server-side step this static site doesn't have), an `@media print` stylesheet makes the passport data page, a currency note, the citizenship certificate, the Order of the Unicorn certificate, and the Pavel Prize diploma each print cleanly via the browser's own Print / Save-as-PDF. Functionally equivalent for the visitor, zero new dependencies.
18. ✅ **Personalized citizenship card as the primary share unit** — shipped alongside #10: an explicit "download & share my citizenship" call to action sits on the certificate itself.

### Bilingual completeness

19. **Official English anthem lyrics — still open.** The owner has said they'll provide the official English lyrics for "El Ruir del Unicornio"; the current English lyric block remains a placeholder translation pending that. **Flagged for the owner, not for AI translation.**
20. **i18n spot-check — holds, extended.** All of the newly-shipped sections above followed the same `data-lang="es"`/`data-lang="en"` pattern (and `PavelI18N.get()` for dynamic JS strings); nothing new was left English-only. No action needed beyond #19.

### Technical/UX polish

21. ✅ **Asset weight** — `pavel-unicorn.png` 3.32MB → 1.49MB and `pavel-head.png` 2.89MB → 1.62MB, same dimensions, no filename changes.
22. ✅ **Favicon/tab branding** — shipped as part of the SEO pass (an inline SVG "P" monogram, no new asset needed).

## 4. Risks & decisions for the owner — resolved this round

- **Real visitor emails/leads → declined.** No email collection was built anywhere; the owner confirmed this should stay a fun project, not a lead-gen one.
- **Custom domain → deferred, not a code decision.** Nothing in the codebase assumes one; canonical/OG URLs remain relative or clearly-marked placeholders until a domain is chosen (see `SECURITY_NOTES.md`/SEO commit for specifics).
- **Tone and profanity → resolved.** The motto is now "El Non Plus Ultra" / "The Non Plus Ultra," with no profanity left on the page. There is no separate "director's cut" toggle — the owner asked to just remove the bad words, not maintain two versions.
- **Shared/cross-visitor storage (leaderboard, guestbook, referral tracking) → declined.** The owner was explicit that this should never grow beyond what the visitor's own browser holds. Item #9 shipped as a joke-only leaderboard and item #14 (guestbook) was not built, both per this decision.
- **Public visibility of personal identity → still open.** Not addressed this round; still the owner's call whether the site should be fully public/indexed under Pavel's real name or partially unlisted.
- **User-generated content moderation → largely moot now.** With the guestbook declined and the leaderboard reduced to a joke/local-only display, there is no visitor-entered content displayed to *other* visitors anywhere on the site today. Worth revisiting only if a future feature changes that.

---

*Roadmap prepared as a planning document. Effort estimates (S/M/L) in the original entries were rough sizing, not commitments.*
