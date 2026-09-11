# Reino de Pavel — Product Roadmap

*Prepared as a planning reference. Nothing in this document changes the live site; all items below are proposals for the owner to prioritize.*

## 1. Current state

Reino de Pavel is a single-page satirical micronation site built as personal comedic branding: a fully realized fake national identity system for a "country" with exactly one citizen, Pavel. As of today the page (`reino-de-pavel.dc.html`) covers a coat of arms and brand system, a flag ("La Iridiscente"), a passport/national ID/driver's license set, currency ("Grandezas") and postage stamps, a looping national anthem with lyrics and cover art, a seven-article constitution ("Carta Magna de la Grandeza"), a Descartes cogito parody, diplomatic letterhead and a citizenship certificate. It also includes an interactive minigame, "El Mundo de Pavel," where a visitor registers a pilgrim name, walks a small throne room, and can worship Pavel — reaching 10 acts of worship triggers a thank-you message and unlocks summoning "the unicorn of unicorns." The entire page was just made fully bilingual (English default, Spanish toggle via `localStorage`) with all copy, the anthem block, the constitution, and the game UI switching live without a reload.

## 2. In flight (this session)

Three other efforts are running in parallel right now and are out of scope for this roadmap:

- **Mobile/tablet responsiveness** — layout and touch behavior across breakpoints.
- **SEO/marketing** — meta tags, sitemap, social sharing previews, structured data.
- **Security review** — a pass over the current branch's changes for security issues.

The ideas below deliberately avoid re-proposing that work and focus on new content, features, and product direction.

## 3. Roadmap ideas

### More documents & artifacts

1. **Diplomatic visa page** — a mock tourist/courtesy visa ("Visa de Cortesía") granting bearer entry to the Kingdom, styled like the passport data page. *Effort: S. Why: extends the documents set with something visitors can imagine "having," reinforcing the bit that anyone can be recognized by the state.*
2. **Order of the Unicorn — medal & honor certificate** — a decorated medallion graphic plus a certificate of conferral, ideally personalized with a name field (mirrors the existing `holder` prop pattern). *Effort: M. Why: gives adoring visitors something to "earn," a natural tie-in to the game's worship counter.*
3. **National holiday calendar** — a satirical annual calendar (Founding Day, Day of the Unicorn, Day of the Final Fucking Word, etc.) in the same document-mockup style as the currency/stamps section. *Effort: S. Why: cheap, funny, expands the "fully realized nation" conceit with minimal new mechanics.*
4. **Royal decree generator** — visitor types a topic or complaint; the page returns a mad-libs-style official decree in Pavel's bureaucratic voice. *Effort: M. Why: turns a static joke format (the diplomatic letter) into something visitors actively play with and want to screenshot.*
5. **Ministry of Complaints** — a "file a complaint" form that only ever replies with worship-themed non-answers ("Your grievance has been noted and reclassified as praise"). *Effort: S/M. Why: strong comedic payoff for a bureaucratic-satire site; no backend needed if replies are canned/random client-side.*
6. **National anthem sheet-music mockup** — a staff-notation graphic styled like a hymnal page, paired with the existing lyrics card. *Effort: S. Why: rounds out the anthem section, which currently has lyrics and cover art but no "printed score."*
7. **Coin/medallion design** — obverse/reverse coin artwork to sit alongside the 100-Grandezas note and 5 G stamp. *Effort: S. Why: currency section currently jumps from paper notes to a stamp; a coin closes the "full monetary system" joke.*
8. **"Pavel Prize" academic award certificate** — a Nobel-parody certificate ("for services to grandeza"), possibly personalizable like the citizenship certificate. *Effort: S. Why: another shareable, personalizable artifact in the same visual language as the citizenship certificate.*

### Interactivity & fun

9. **Leaderboard of top adorers** — start with a joke version ("1. You. 2. No one else has ever logged in.") that needs no backend; a real cross-visitor leaderboard would require shared storage. *Effort: S (joke version) / L (real, shared version — needs backend). Why: leaderboards drive repeat visits and are a natural next step from the existing worship counter.*
10. **Downloadable/shareable personalized citizenship card image** — render the citizenship certificate with the visitor's pilgrim name as a canvas-generated PNG they can save and post. *Effort: M. Why: directly serves the owner's stated goal of growing shares — a personalized artifact is what people actually post.*
11. **"How Pavelense are you?" quiz** — a short quiz in the site's bureaucratic voice that assigns a rank (Pilgrim, Citizen, Minister, Sovereign-adjacent) at the end. *Effort: M. Why: quizzes are inherently shareable and reuse existing rank/title vocabulary already in the ID documents.*
12. **More easter eggs** — e.g., a Konami-code trigger, clicking the crest a set number of times, or a hidden line if the anthem is looped a certain number of times. *Effort: S each. Why: rewards attentive/repeat visitors and gives content creators something to "discover" on camera.*
13. **Achievements/badges for game milestones** — beyond the existing 10-worship thank-you, add milestones (first bow, first unicorn summon, 50 worships, visiting in both languages). *Effort: M. Why: extends the game's only current progression hook (the worship counter) into a fuller loop.*
14. **Guestbook of registered pilgrims** — a visible (or admin-curated) log of names who have registered in the game. *Effort: M (needs shared storage; see privacy note in §4). Why: makes the "you exist because Pavel exists" conceit social rather than solitary.*

### Growth & shareability

15. **"State of the Kingdom" changelog page** — an in-universe, decree-styled changelog of the site's own real development history (e.g., "By royal decree, the Kingdom is now bilingual"). *Effort: S/M. Why: gives returning visitors and press a reason to check back, and doubles as a lightweight audit trail of the project itself.*
16. **Referral/invite mechanic** — a "Bring another pilgrim to court" link framed as a diplomatic summons, tied to the visitor's registered name. *Effort: M. Why: turns existing visitors into a distribution channel, directly supporting the stated goal of growing visits.*
17. **Print-ready PDF exports of key documents** — passport data page, currency note, and citizenship certificate as print-quality PDFs. *Effort: M. Why: "documents you can actually print" is a strong novelty/gift angle and a natural upgrade from the current on-screen-only mockups.*
18. **Personalized citizenship card as the primary share unit** (cross-referenced with #10) — treat this as the flagship shareable artifact and promote it from the citizenship section itself with an explicit "share your citizenship" call to action. *Effort: S once #10 exists. Why: consolidates the site's best shareability lever into one clear call to action.*

### Bilingual completeness

19. **Official English anthem lyrics** — the owner has said they will provide the official English lyrics for "El Ruir del Unicornio" soon; the current English lyric block is a placeholder translation and should be swapped in once received. **Open item — flagged for owner, not for AI translation.**
20. **i18n spot-check** — a read-through found no untranslated user-facing copy; every visible string in the hero, documents, currency, anthem, constitution, Descartes section, stationery, and the game UI has matching `data-lang="es"`/`data-lang="en"` pairs, and image `alt` text, placeholders, and ARIA labels all switch via `data-alt-*`/`data-ph-*`/`data-aria-*`. The only English-only or unlabeled strings are intentionally universal document fields (MRZ codes, "REINODEPAVEL.GOV," serial numbers, the "PVL" monogram) that read as realistic document furniture in either language — these do not need translation. *Effort: — (informational, no action needed beyond #19).*

### Technical/UX polish

*(Kept light — most polish is owned by the concurrent responsiveness, SEO, and security efforts.)*

21. **Asset weight** — `pavel-unicorn.png` (3.2 MB) and `pavel-head.png` (2.8 MB) are large, uncompressed PNGs reused many times across the page (hero, passport, ID, license, currency, game throne). Re-exporting them as compressed PNG/WebP would meaningfully cut initial load without any visible quality loss. *Effort: S. Why: this is pure asset hygiene, distinct from the in-flight SEO/performance work, and affects every visitor regardless of device.*
22. **Favicon/tab branding** — confirm a favicon is set for the published site (not visible from the HTML alone); if absent, a small "P" monogram favicon matching the seal would round out the identity system in the browser tab and bookmarks. *Effort: S. Why: cheap brand-consistency win that ties directly to the existing monogram seal.*

## 4. Risks & decisions for the owner

These need a human judgment call, not an AI's guess:

- **Real visitor emails/leads.** Should the site ever collect real email addresses (e.g., a "Join the Kingdom" mailing list)? If so, what would that actually be for — announcement list, or just another bit? This has real privacy/compliance implications (unsubscribe, storage, potential spam-law obligations) that a joke framing doesn't remove.
- **Custom domain.** The site already jokes about `REINODEPAVEL.GOV`. Is a real custom domain (a `.com`/`.xyz`/similar, since `.gov` is restricted) worth purchasing for shareability and memorability, and who owns/renews it?
- **Tone and profanity.** The current voice includes strong profanity (e.g., "EL JODIDO FINAL" / "THE FINAL FUCKING WORD" as the national motto). Is that the right register for the audience the owner wants to reach, or should there be a "tone it down" mode for wider/more public sharing (workplace-safe links, family, press) while keeping the current version as the "director's cut"?
- **Public visibility of personal identity.** The site names Pavel Navarro directly and is about to get SEO/structured-data work that will make it more discoverable and indexable. Is the owner comfortable with this being fully public and search-indexed under his real name, or should certain pages/sections stay unlisted?
- **User-generated content moderation.** Any feature that stores or displays visitor-entered names (guestbook, leaderboard, personalized cards, referral invites) needs a policy for offensive or impersonating names before it's public-facing — this applies to items #9, #14, and #16 above specifically.
- **Data retention for the game.** The pilgrim name and worship count are currently stored only in the visitor's own cookie/`localStorage` — nothing is sent anywhere. Any feature that introduces shared/cross-visitor storage (a real leaderboard, guestbook, or referral tracking) is a step up in data handling that should be a deliberate choice, not an implementation detail.

---

*Roadmap prepared as a planning document. Effort estimates (S/M/L) are rough sizing, not commitments.*
