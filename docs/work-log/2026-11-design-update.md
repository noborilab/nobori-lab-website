# Design update, November 2026: handoff and work log

Six commits for `noborilab/nobori-lab-website`, prepared in a Claude session on
9 November 2026. They are delivered as one patch series,
`nobori-design-updates.mbox`, based on `a7bb9fa` ("Move Ru Zhang to alumni; add
ICBPI 2026 plenary to invited talks"), which was `origin/main` at the time.

The series was applied to a clean checkout of that commit with `git am` and
built without errors (details under "Checks already run").

No new npm dependencies. `package.json` changes only the `build` script.

---

## How to apply

```bash
git status --short                      # must be clean
git switch main && git pull
git switch -c design-updates-2026-11
git am /path/to/nobori-design-updates.mbox
npm ci
npm run build
npm run preview                         # http://localhost:4173
```

If `main` has moved and a patch does not apply, run `git am --abort` and rebase
the series instead of merging by hand:

```bash
git switch -c design-updates-2026-11 a7bb9fa
git am /path/to/nobori-design-updates.mbox
git rebase main
```

The commits carry `Claude <noreply@anthropic.com>` as author and a
`Co-Authored-By` trailer. To make yourself the author while keeping the
messages:

```bash
git rebase main --exec 'git commit --amend --no-edit --reset-author'
```

---

## Commits

### 1. Add cell-field hero background and scroll-linked ink on mission statement

- `src/components/CellField.jsx` (new): a dependency-free 2D canvas of faint
  "cells" behind the hero. Cells near the pointer switch state (sage, coral at
  the core); a click or tap, and an occasional spontaneous event, sends a wave
  through neighbouring cells. Cells fade out around the logo and text so they
  never sit behind content. Animates only while something is active and the
  hero is on screen; static dot field with reduced motion.
- `src/components/Hero.jsx`: mounts `CellField`; section gets `isolate`.
- `src/components/Mission.jsx`: the mission statement is split into words that
  ink in one by one as the paragraph scrolls past (CSS scroll-driven
  animations). Plain, fully inked text where unsupported or with reduced motion.
- `src/index.css`: the ink keyframes, and `body { overflow-x: clip }`.
  `hidden` made `body` a scroll container, so scroll-driven animations measured
  against it and never progressed. `clip` keeps the same visual result.

### 2. Add command palette, card spotlight and type/focus polish

- `src/components/CommandPalette.jsx` (new): site search over sections,
  papers (title, authors, journal, year), research areas and people. Opens with
  Cmd/Ctrl+K, `/`, or the new search button in the navbar. Papers open at the
  publisher in a new tab. Keyboard: arrows, Enter, Esc.
- `src/data/nav.js` (new): the navbar links, moved out of `Navbar.jsx` so the
  navbar and the palette share one list.
- `src/components/Navbar.jsx`: search button (desktop and mobile).
- `src/lib/spotlight.js` (new) + `src/components/Projects.jsx`: project-card
  border lights up under the pointer (two CSS variables, no React re-render).
- `src/index.css`: `::selection` colour, `:focus-visible` ring (there was none),
  `text-wrap: balance` on headings and `pretty` on paragraphs, palette entrance.

### 3. Faster first load: shorter intro, self-hosted fonts, vendor chunk, lazy flipbook

- `src/components/LoadingScreen.jsx`: the intro now ends as soon as the logo and
  fonts are ready (minimum 1.1 s, maximum 2.5 s) instead of a fixed 3.2 s.
  Intro animations retimed to match. Measured in headless Chrome: about 2.9 s
  to the finished hero, against about 4.5 s by design before.
- Fonts: latin and latin-ext subsets of Cormorant Garamond, Karla, Josefin Sans
  and IBM Plex Mono are now served from `public/fonts/` (14 files, about
  350 kB, all SIL OFL 1.1; sources in `public/fonts/README.md`). `@font-face`
  rules in `src/fonts.css`. The Google Fonts `<link>` and preconnects are gone
  from `index.html`; the two faces the hero needs first are preloaded.
- `vite.config.js`: React and framer-motion go into a separate `vendor` chunk
  (about 320 kB), so content-only deploys keep it cached.
- `src/components/Publications.jsx`: `PublicationFlipbook` is lazy-loaded when
  opened (14 kB).
- `src/components/Hero.jsx`, `LoadingScreen.jsx`: `mix-blend-mode: multiply` on
  the logo removes the white square behind it.

Note on code splitting: about 60% of the main bundle is React and
framer-motion, so lazy loading had little left to remove. The world map in the
Team section was left as is: its data is already loaded on demand, and
deferring the component could shift positions for deep links such as `#join`.

### 4. Morph thumbnails into lightboxes with View Transitions

- `src/lib/viewTransition.js` (new): helpers around `document.startViewTransition`.
- `src/components/ProgressivePhoto.jsx` (new): the lightbox image is sized from
  the thumbnail's aspect ratio and shows the cached thumbnail until the
  full-size file has loaded, so the box never jumps.
- `src/components/Gallery.jsx`, `src/components/Publications.jsx`: gallery
  photos and publication figures grow out of the clicked thumbnail and shrink
  back on close. Browsers without View Transitions, and visitors with reduced
  motion, get the previous fade.
- `src/index.css`: timing for the morph.

### 5. Make the site findable: static HTML, topic pages, Tools & data, small fixes

- Static HTML: `npm run build` now runs `vite build` and then
  `scripts/prerender.mjs`, which renders each page with React on the server and
  writes the result into its `index.html`. Search engines, link previews and AI
  crawlers now receive the page content instead of an empty `<div id="root">`.
  The browser bundle then renders over it as before. Home page HTML: 167 kB
  (25 kB gzipped). Entry point for this step: `src/prerender.jsx`.
- Sitemap: `dist/sitemap.xml` is regenerated at every build with all pages and
  the build date (it was a single hand-written URL last updated in July).
- Topic pages: `/phytomap/` and `/primer-cells/`, defined in
  `src/data/topics.js`, laid out by `src/components/TopicPage.jsx`. Each page is
  assembled from existing data (project text and media from `projects.js`,
  papers from `publications.js` by id, resource links), with a copyable
  citation, a contact box and its own title, description and canonical URL. No
  new copy was written. An optional `faq` list per topic renders when filled.
  The matching project cards link to them; the home page is otherwise
  unchanged.
- Tools & data: `src/components/Resources.jsx` + `src/data/resources.js`, one
  list of every shared dataset, protocol, code repository and poster at the
  foot of the Contributions section (`#resources`). Built from each project's
  `resources`, with an `extra` array for anything not on a project card. Also
  reachable from the search palette and the footer (not the top navbar, which
  already overflows at 1024 px with ten items).
- `src/main.jsx`: picks `TopicPage` or the one-page site from the URL path.
- `src/App.jsx`: page content split into `SiteContent` so it can be prerendered.
- Gallery lightbox: Esc closes, left/right arrows move, dialog role and button
  labels.
- Publication thumbnails: descriptive `alt` text.
- Analytics (`src/lib/analytics.js`): a `resource_click` event for links to
  papers, PDFs, protocols, datasets, code and videos, with `link_type`,
  `link_url`, `link_text` and `page_section`.
- `CLAUDE.md`: documents the new data files, components and the two-step build.
- `index.html`: a `<noscript>` rule that shows prerendered content whose
  entrance animation would otherwise start hidden.

Constraint introduced: components rendered at build time must not touch
`window`, `document` or `sessionStorage` during render (effects and event
handlers are fine). Breaking this fails the build with a clear error rather than
shipping a broken page.

### 6. Avoid regex lookbehind in topic summaries for older Safari

Found while preparing this handoff. The meta-description helper in
`src/data/topics.js` split sentences with a lookbehind regex. The build turns it
into `new RegExp(...)`, which throws as the module loads in Safari before 16.4
(iOS 16.3 and earlier), so the whole site would have failed to render there.
Now splits on `'. '`; the generated descriptions are identical. The built
bundle contains no lookbehind.

---

## Checks already run

- `git am` of the full series onto a clean checkout of `a7bb9fa`: applies
  without conflicts (44 files, +1758 / -111), and the resulting `src/` is
  identical to the working branch.
- `npm run build`: passes; prerenders `/`, `/primer-cells/`, `/phytomap/`;
  writes `sitemap.xml` with three URLs. The prerender step fails the build if
  the static HTML references an image that is not in `dist/`.
- `npm run lint`: 42 findings against 41 on `main`. The one extra is the
  repository's existing false positive (`'motion' is defined but never used`,
  because this ESLint setup does not count `<motion.div>` as a use), now also in
  `Resources.jsx`. No other new findings.
- Headless Chrome (Playwright), desktop 1280–1440 px and phone 390 px:
  - Hero cell field reacts to pointer and tap; mission words ink in on scroll.
  - Intro ends early; all four self-hosted families load; no Google Fonts
    requests.
  - Gallery and figure morphs run on open and close; lightbox closes with Esc,
    arrows move between photos.
  - Search finds papers by title, author, journal and year; Enter on a topic
    opens its page.
  - Topic pages render with no horizontal overflow at 390 px.
  - `resource_click` events reach `window.dataLayer` with the expected fields.
  - No page errors in the console.

## Manual checks still needed

1. Safari and Firefox, desktop and iPhone: hero field, mission ink (plain text
   expected in Firefox), lightbox morphs (fade expected where unsupported).
2. No horizontal scroll anywhere on a phone, especially Team, world map and
   Gallery (because of the `overflow-x: clip` change).
3. First visit in a private window: the intro and its hand-off to the hero.
4. Typography looks the same as before at all weights (bold headings in
   Cormorant Garamond, Karla body and italics).
5. After deploy:
   - `https://noborilab.org/phytomap/` and `/primer-cells/` load, and
     view-source shows the page text.
   - Google Analytics Realtime or DebugView shows `resource_click`. To see
     `link_type` and `page_section` in reports, register them as event-scoped
     custom dimensions in GA Admin.
   - Submit `https://noborilab.org/sitemap.xml` in Google Search Console and
     request indexing for the two topic pages.

## Follow-ups (not done)

- Fill `faq` for each topic in `src/data/topics.js`.
- Add public tools or datasets that are not on a project card to `extra` in
  `src/data/resources.js`.
- Fill the empty `highlights` in `src/data/publications.js` with a one-line
  "what we found and why it matters" per paper.
- Give each topic page its own `og:image` (all pages currently share
  `og-preview.png`).
- `public/sitemap.xml` is now overwritten at build time and can be deleted.
- The static HTML contains only the "Selected" publication tab; the other tabs
  are still rendered in the browser only.

---

## Draft PR description

**Design update: hero interaction, search, faster load, lightbox morphs, static HTML and topic pages**

Six commits; each can be reviewed on its own.

1. **Hero and mission.** A light canvas "cell field" behind the hero reacts to
   the pointer and taps; the mission statement inks in word by word as it
   scrolls. Both fall back to static content with reduced motion.
2. **Search and polish.** Cmd/Ctrl+K site search over sections, papers,
   research areas and people; pointer-following border on project cards;
   selection colour, keyboard focus ring and balanced headings.
3. **Faster first load.** Intro ends when assets are ready (1.1–2.5 s instead
   of 3.2 s fixed); fonts self-hosted (no Google Fonts requests); React and
   framer-motion in a cacheable vendor chunk; flipbook loaded on demand; white
   box behind the logo removed.
4. **Lightbox morphs.** Gallery photos and publication figures grow from their
   thumbnails via View Transitions, with the previous fade as fallback.
5. **Findability.** Pages are prerendered to static HTML at build time; the
   sitemap is generated with every page; new `/phytomap/` and `/primer-cells/`
   pages built from existing data; a Tools & data list of every shared
   resource; gallery keyboard support; alt text; a GA event for resource clicks.
6. **Compatibility fix.** Removes a regex lookbehind that would have stopped
   the site from starting in Safari before 16.4.

No new dependencies. `npm run build` now also runs `scripts/prerender.mjs`;
the deploy workflow needs no change.

**Testing:** builds cleanly; lint unchanged apart from the existing `motion`
false positive in one new file; checked in Chrome at desktop and phone widths.
Safari, Firefox and the post-deploy checks are listed in
`docs/work-log/2026-11-design-update.md`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01Kbj1XCAZm85vV82PbbPbQX

---

## Local verification and follow-up commits (9 November 2026)

Applied with `git am` onto `a7bb9fa` (`main`, up to date with `origin/main`)
without conflicts. `npm ci` and `npm run build` pass; `/`, `/primer-cells/`
and `/phytomap/` are prerendered with their page text, and `dist/sitemap.xml`
lists all three. `npm run lint`: 42 findings against 41 on `main`; the extra
one is the known `motion` false positive in `Resources.jsx`.

Checked against a build of `main` in Chrome 157, at desktop width (1440 px)
and phone width (390 x 844, touch emulation, fresh profile):

- Hero cell field reacts to pointer and click (desktop) and to taps (phone).
- Mission words ink in with scroll at both widths.
- Gallery and figure lightboxes morph on open and close; Esc closes and the
  arrow keys move between photos.
- No horizontal scroll at 390 px on any section of the home page or on the
  topic pages (same as `main`).
- First visit with an empty cache: the intro finishes at about 2.7 s against
  about 4.8 s on `main`, and first paint is earlier than on `main`.
- Typography unchanged: the same family/weight/style combinations are used as
  on `main`, each backed by a real font file, and every combination `main`
  loads renders at the same width with the self-hosted files. No Google Fonts
  requests.
- No page errors.

Not yet checked: Safari (WebDriver remote automation was not enabled),
Firefox (not installed), a real iPhone, and the post-deploy items above.

Follow-up commits on top of the series, one change each:

1. **Close lightboxes once when the close button is clicked.** The close
   button sat inside the backdrop, so one click closed twice; with view
   transitions the close morph was skipped and the console showed
   `Uncaught AbortError: Transition was skipped`.
2. **Keep hero cells out from under the fixed navbar.** On phones the cells
   sat behind the wordmark, search and menu buttons.
3. **Let elements keep their own shape when keyboard-focused.** The new
   `:focus-visible` rule was unlayered and overrode every utility, so
   rounded pills turned into square-cornered boxes on keyboard focus.
4. **Make gallery thumbnails keyboard-accessible, with descriptive alt
   text.** Already the case on `main`: thumbnails were clickable divs and
   their alt text was the file name.
5. **Update dev tooling to clear npm audit advisories.** Lockfile only
   (vite, zod, brace-expansion, source-map-js); already the case on `main`.
6. **Turn the hero cell field off by default, behind a hidden option.**
   Reviewed locally: nice, but too much as the default. Search the palette
   for "cells" (or "animation") to turn it on or off; the choice is kept in
   `localStorage`. The code is unchanged otherwise, and the static HTML has
   no canvas.

The draft PR description above lists the original six commits; when opening
the pull request, add these follow-ups and note in item 1 that the cell
field is now an opt-in option.
