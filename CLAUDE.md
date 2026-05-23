# nobori-lab-website — Claude Code context

## Project overview
Lab website for the Nobori Lab (The Sainsbury Laboratory, Norwich).
Stack: React 19 + Vite + Tailwind CSS 4. Data lives in `src/data/`.

Key data files:
- `src/data/publications.js` — all publications (selected, originalArticles, reviews)
- `src/data/cv.js` — experience, awards, editorial, invited talks
- `src/data/team.js` — current members and alumni
- `src/data/news.js` — news items
- `src/data/projects.js` — research projects
- `src/data/gallery.js` — lab photo gallery

Key components:
- `src/components/Publications.jsx` — tabbed publication list + flipbook launcher
- `src/components/PublicationFlipbook.jsx` — CSS 3D page-flip overlay
- `src/components/CV.jsx` — PI CV section
- `src/components/Team.jsx` — team grid

Public assets: `public/images/` (publications figures, team photos, gallery, lab logo).

First-page PDFs: `public/images/publications/first-pages/` — see Routines below.

---

## Routines

### "update publications"
When I say "update publications":
1. Check `public/images/publications/first-pages/` for any new PDF files
2. Run: `npm run trim-pdfs` (trims to 1 page + auto-identifies + renames + updates `firstPage` fields in publications.js)
3. Run: `npm run build` to verify no errors
4. Show a summary of what was matched/renamed
5. List any publications still missing a `firstPage` value (i.e., `firstPage: ''` in publications.js for entries that will appear in the flipbook)
6. Remind me to commit and push if changes were made

Flipbook deduplication note: the flipbook combines all three arrays and deduplicates by title, keeping the first occurrence. Only the `selected` entry matters for duplicates that also appear in `originalArticles` or `reviews` — those duplicate entries can keep `firstPage: ''`.

### "process inbox"
When I say "process inbox", check each inbox item and handle as follows:

**Papers — `inbox/papers/` + `inbox/papers.md`:**
1. Read `inbox/papers.md` for new entries (any format — DOI, citation, abstract, structured fields)
2. For each paper: add entry to `src/data/publications.js` (selected/originalArticles/reviews as appropriate; `firstPage: ''` initially)
3. Move any PDFs from `inbox/papers/` → `public/images/publications/first-pages/`
4. Run `npm run trim-pdfs` to trim to 1 page, auto-identify, rename, and update `firstPage` fields
5. Clear processed entries from `inbox/papers.md` (leave the header/template comments)

**New members — `inbox/members/` + `inbox/updates.md` (New Members section):**
1. Read member info from `inbox/updates.md`
2. Move headshot from `inbox/members/` → `public/images/team/` (use a clean filename)
3. Add entry to `src/data/team.js`
4. Add a welcome news item to `src/data/news.js`
5. Clear processed entries from `inbox/updates.md`

**News & grants — `inbox/updates.md` (News / Grants section):**
1. Parse items and add to `src/data/news.js`
2. Clear processed entries from `inbox/updates.md`

**Gallery — `inbox/gallery/`:**
1. Move photos to `public/images/gallery/`
2. Add entries to `src/data/gallery.js` (use any captions noted in `inbox/updates.md`)
3. Clear processed gallery entries from `inbox/updates.md`

After processing everything: run `npm run build` to verify, then remind me to commit and push.

### Quarterly publication check
Remind me to:
- Check if new papers have been published and add them to `src/data/publications.js` (add to all three arrays as appropriate, with `firstPage: ''`)
- Drop any new PDFs into `public/images/publications/first-pages/` and run `npm run trim-pdfs`
- Update `threadUrl` fields for recent papers
- Check that all `link` and `pdf` URLs still resolve
- Review the `selected` array — should any recent papers be promoted?
- Check `src/data/news.js` for any new achievements or media coverage to add
- Check `src/data/team.js` — any member changes (joins, departures, role changes)?
