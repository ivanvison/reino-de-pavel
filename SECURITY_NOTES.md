# Security review — Reino de Pavel

Scope note up front: this is a static, backend-less, one-person joke site on GitHub
Pages. There is no server, no database, no auth, no file upload, and no form that
submits anywhere. The only interactive feature is a client-side minigame ("El Mundo
de Pavel") that stores a visitor-typed name in a cookie + `localStorage` and echoes
it back on the page. The review below is scoped to what actually applies to a site
shaped like that — it does not pad with SQL-injection/enterprise-AppSec boilerplate
that has no surface here.

## What was checked

- XSS sinks (`innerHTML`, `outerHTML`, `document.write`, `eval`, `new Function`) in
  `reino-de-pavel.dc.html`, and specifically how the pilgrim name is echoed back.
- Cookie flags on the `pavelense` cookie.
- Third-party script loading (React/ReactDOM/Babel via `unpkg.com` inside the
  vendored `support.js` runtime) and whether it's pinned/integrity-checked.
- Content-Security-Policy feasibility, built from every external domain the page
  and runtime actually touch.
- `target="_blank"` links needing `rel="noopener noreferrer"`.
- Secrets/tokens/credentials in any tracked file.
- Hardcoded `http://` on same-site resources.
- Anything else concrete (e.g. the `keys` dictionary's `Object.create(null)`).

## Findings and fixes

### 1. XSS via the pilgrim-name feature — checked, no issue found
`registrarNombre()` → `guardarNombre()` sanitizes the name (collapses whitespace,
trims, caps at 32 chars) before it ever gets stored or displayed. Every place the
name is echoed back uses `.textContent`, never `.innerHTML`:

- `reino-de-pavel.dc.html:296` — `chipN.textContent = n;`
- `reino-de-pavel.dc.html:301-303` — `saludo.textContent = ...`
- `reino-de-pavel.dc.html:359` — `pn.textContent = state.nombre;`
- `reino-de-pavel.dc.html:543-545` — `globo.textContent = ...` (i18n re-render path)

`doc.documentElement.setAttribute('data-pavelense', n)` (line 286) sets an
*attribute value*, not markup — also safe.

Grepped `reino-de-pavel.dc.html` for `innerHTML|outerHTML|document\.write|eval\(|new Function\(`
and the file has zero matches. The i18n engine (`window.PavelI18N`) toggles
visibility via `data-lang` attributes and never touches `innerHTML` either.

**No code change needed here** — this was the highest-priority thing to check and
it's clean.

### 2. Cookie flags — fixed
The `pavelense` cookie was missing `Secure`. GitHub Pages always serves over HTTPS,
so there's no legitimate reason for the cookie to also be transmittable over plain
HTTP. Added it:

- `reino-de-pavel.dc.html:284` (now):
  `doc.cookie = COOKIE + '=' + encodeURIComponent(n) + '; path=/; max-age=31536000; SameSite=Lax; Secure';`

Tradeoff considered: a `Secure` cookie silently fails to be set when someone tests
the file over plain `http://` (e.g. `python3 -m http.server`) or `file://`. This is
safe here because `leerNombre()` already falls back to `localStorage.getItem(COOKIE)`
when the cookie regex doesn't match (`reino-de-pavel.dc.html:274-279`), and
`guardarNombre()` always writes to `localStorage` as well as the cookie
(`reino-de-pavel.dc.html:285`). So local/plain-HTTP testing keeps working via the
`localStorage` path even though the cookie itself won't be set — verified by reading
the fallback logic, not just assumed.

### 3. Third-party script loading (unpkg) — checked, already handled correctly
`support.js` dynamically injects `<script>` tags for React, ReactDOM, and Babel
from `unpkg.com`, but it already pins **exact versions** and applies **Subresource
Integrity hashes** with `crossOrigin="anonymous"`:

```
support.js:1143-1148
  REACT_URL = "https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  REACT_SRI = "sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z"
  REACT_DOM_URL = "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  REACT_DOM_SRI = "sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1"
  BABEL_URL = "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"
  BABEL_SRI = "sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y"
```

`loadScript()` (support.js:1823-1837) sets `s.integrity` + `s.crossOrigin =
"anonymous"` whenever an SRI hash is supplied, and `loadReactUmd()`
(support.js:1838-1847) always calls it with both. So the "unpinned third-party
script" risk this task brief flagged as a likely finding turned out **not to apply**
to the current version of the vendored runtime — it already does the right thing.
**No change made** (and none needed); `support.js` was not modified, per scope.

Remaining residual risk, documented rather than fixed: SRI means unpkg can't serve
*tampered* bytes for these exact versions, but the page still depends on unpkg's
*availability* — if unpkg is down or the sandbox/network blocks it (as this review's
own test sandbox does), the page fails to boot. That's an availability tradeoff of
using a CDN-loaded runtime, not an integrity/security bug, and is out of scope to
"fix" without vendoring React locally (a larger change to a file explicitly marked
out of scope for this review).

### 4. Content-Security-Policy — shipped
Added a CSP `<meta>` tag to the real `<head>` (`reino-de-pavel.dc.html:13`), built
from a full audit of every resource the page and runtime load — not a generic
template:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self'; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'">
```

How each piece was derived (every external domain the site touches, confirmed by
`grep -oE 'https?://[a-zA-Z0-9.-]+'` across both files — there are exactly three:
`fonts.googleapis.com`, `fonts.gstatic.com`, `unpkg.com`):

- `script-src 'self' https://unpkg.com` — same-origin `support.js` plus the
  dynamically-injected React/ReactDOM/Babel `<script>` tags (support.js:1143-1148,
  1841-1846).
- `'unsafe-eval'` in `script-src` — **required**, not optional. The page's own
  `<script type="text/x-dc" data-dc-script>` block (line 1372, the
  `bilingual`/`guilloche`/`holder` props) is evaluated by `evalDcLogic()`
  (support.js:842-851) via `new Function(...)`, called unconditionally from
  `updateJs()` (support.js:1701-1712) whenever a `.dc.html` declares that script
  block — which this page does. Without `'unsafe-eval'` the CSP would silently
  break the page's own template-logic layer. Confirmed by tracing the call site,
  not by guessing.
- `'unsafe-inline'` in `script-src` and `style-src` — the anthem player, the
  minigame, and the i18n engine all live as plain inline `<script>` blocks inside
  `<helmet data-dc-atomics>`, which `support.js` hoists into the real `<head>` at
  runtime (support.js:1437-1446); there's also an inline `<style>` block and many
  inline `style="..."` attributes throughout the markup. There's no build step to
  generate nonces or hashes for any of this, so `'unsafe-inline'` is the honest,
  pragmatic choice rather than pretending a nonce scheme exists.
- `style-src ... https://fonts.googleapis.com`, `font-src ... https://fonts.gstatic.com`
  — the Google Fonts `<link rel="stylesheet">` (line 14) and the font files it
  pulls.
- `img-src 'self'`, `media-src 'self'` — every `<img>`/`<audio>` on the page points
  at a relative `assets/...` path (verified by grep — no `data:` URIs, no external
  image/audio hosts).
- `connect-src 'self'` — the only `fetch()` the runtime does outside the CDN
  script loads is `fetch(location.href)` (support.js:159), which is always
  same-origin.
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` — nothing on the
  page uses `<object>`/`<embed>`, a `<base>` tag, or a form that submits anywhere
  external (the minigame's name form is `e.preventDefault()`-only,
  `reino-de-pavel.dc.html:487-492`), so these can be locked down with no
  functional cost.
- `frame-ancestors` was deliberately **left out**: it's a real anti-clickjacking
  directive, but browsers ignore it when a CSP is delivered via `<meta>` (it must
  come from an HTTP header), and GitHub Pages doesn't support custom response
  headers. Including it would just add a confusing no-op console warning, which is
  exactly what showed up when I tested a version that included it (see below) — so
  it's cut rather than shipped as decoration. If the site is ever moved to a host
  that supports custom headers, `frame-ancestors 'self'` (or `'none'`) would be a
  cheap, effective addition then.

**Confidence / how this was tested**, given the sandbox itself blocks `unpkg.com`
outbound (so a full visual render isn't possible here regardless of the CSP):

1. Enumerated every `https?://` reference in both `reino-de-pavel.dc.html` and
   `support.js` — exactly the three domains above, nothing else.
2. Traced every dynamic script/style/fetch code path in `support.js` that the CSP
   needed to account for (`cdnScriptFor`, `loadScript`, `loadReactUmd`,
   `evalDcLogic`/`updateJs`, the `fetch(location.href)` call, and the helmet→head
   hoisting in `compile()`).
3. Served the page locally (`python3 -m http.server`) and loaded it headlessly with
   Playwright/Chromium, capturing all console/page errors, once **without** the CSP
   and once **with** it. Both runs produced byte-for-byte the same failures (React/
   ReactDOM failing to load with `net::ERR_TUNNEL_CONNECTION_FAILED`, from this
   sandbox's own network policy) — no CSP-refusal messages appeared in either run
   for script, style, font, or connect resources, meaning the policy isn't blocking
   anything the page needs beyond what the sandbox already blocks at the network
   layer. (An earlier draft that included `frame-ancestors` did produce one benign
   `"'frame-ancestors' is ignored when delivered via a <meta> element"` console
   line, confirming the tool can detect CSP-specific issues distinct from network
   failures — that directive was then removed, as described above.)

Given that combination of a fully-enumerated attack surface (only 3 external
domains, no build step, no dynamic imports in use on this page) plus a
call-site-level trace of `support.js`, I'm shipping the CSP rather than only
documenting it. The one thing I could **not** verify live is a full visual paint
with React actually booted (blocked by the sandbox's own network policy, not by
anything in this change) — if the site owner wants extra assurance, loading the
page in a normal browser after this change and checking DevTools' Console/Security
tab for any `Refused to ...` message would be the quick confirmation step.

### 5. `target="_blank"` external links — checked, none exist
Grepped for `target="_blank"` / `target='_blank'` across the page: zero matches.
Every `<a href="...">` on the page is a same-page anchor link (`#emblema`,
`#ciudadania`, etc.) or the one bare `<a href="#descartes">Descartes</a>` — no
external `http(s)://` links open in a new tab, so there was nothing to add
`rel="noopener noreferrer"` to.

### 6. Secrets/tokens/credentials — checked, none found
Grepped `reino-de-pavel.dc.html`, `support.js`, and `README.md` for
`key|secret|token|password|Authorization|bearer` (case-insensitive) and for
`http://`. No API keys, tokens, credentials, or webhook URLs anywhere. Expected for
a static site with no backend — confirmed rather than assumed.

### 7. Hardcoded `http://` — checked, none found
No same-site resource is loaded over plain `http://` anywhere in
`reino-de-pavel.dc.html` or `support.js`. All same-origin references are relative
paths (`./support.js`, `assets/...`); the only absolute URLs are the three
`https://` CDN/font domains listed above.

### 8. Other observations (not risks, noted for completeness)
- The minigame's keyboard-handling `keys` dictionary is built with
  `Object.create(null)` (`reino-de-pavel.dc.html:258, 335`) rather than `{}`. That's
  a good defensive pattern — it means a key name like `"__proto__"` can't be used
  to walk/pollute `Object.prototype` through this dictionary. No action needed;
  called out as something already done right.
- Both the anthem player and the minigame scripts guard against `support.js`
  re-mounting the `<helmet>` twice (`window.__anthemPlayer` / `window.__mundoPavel`
  flags) — left untouched, as instructed.
- No forms submit anywhere (the name form does `e.preventDefault()` and stays
  entirely client-side), no file uploads, no auth, no server secrets, no database —
  so SQL injection, auth-bypass, and similar server-side categories genuinely don't
  apply to this site and aren't discussed further here.

## Summary of changes made

| File | Change |
|---|---|
| `reino-de-pavel.dc.html` | Added `Secure` to the `pavelense` cookie's attributes. |
| `reino-de-pavel.dc.html` | Added a `Content-Security-Policy` `<meta>` tag to `<head>`, scoped to the site's actual resources (see §4). |
| `support.js` | Not modified (out of scope; also already does SRI correctly — see §3). |

Net assessment: this is, and remains, a low-risk static site. The one real
finding worth fixing was the missing `Secure` cookie flag; everything else checked
out clean on inspection, and the CSP is an incremental hardening layer on top of an
already-safe page rather than a fix for a discovered vulnerability.
