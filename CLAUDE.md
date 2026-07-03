# nobori-lab-website — Claude Code context

## Role
Claude Code is the **primary implementation agent** for this repository.

Use Claude Code for:
- Implementing requested website changes
- Updating content and data files
- Processing inbox items
- Refactoring code when needed
- Running local checks and builds
- Preparing clean diffs for human review or Codex audit

Claude Code should not make large visual/design direction changes without first summarising the proposed direction and getting approval. Small fixes, content updates, and clearly requested features can be implemented directly.

---

## Project overview
Lab website for the Nobori Lab at The Sainsbury Laboratory, Norwich.

Stack:
- React 19
- Vite
- Tailwind CSS 4
- Data-driven content in `src/data/`
- Public assets in `public/images/`

The website should feel:
- Professional but not corporate
- Scientific, clear, and visually calm
- Modern, lightweight, and easy to maintain
- Appropriate for a plant-microbe interactions / single-cell and spatial omics research lab

Prioritise maintainability over cleverness. Prefer simple React components, explicit data structures, and readable Tailwind classes.

---

## Key files

### Data files
- `src/data/publications.js` — all publications: `selected`, `originalArticles`, `reviews`
- `src/data/cv.js` — experience, awards, editorial roles, invited talks
- `src/data/team.js` — current members and alumni
- `src/data/news.js` — news items
- `src/data/projects.js` — research projects
- `src/data/gallery.js` — lab photo gallery

### Main components
- `src/components/Publications.jsx` — tabbed publication list and flipbook launcher
- `src/components/PublicationFlipbook.jsx` — CSS 3D page-flip overlay
- `src/components/CV.jsx` — PI CV section
- `src/components/Team.jsx` — team grid

### Public assets
- `public/images/` — publication figures, team photos, gallery images, lab logo
- `public/images/publications/first-pages/` — source PDFs and generated JPG previews used by the flipbook
- `public/images/team/` — member headshots
- `public/images/lab/<year>/` — lab/gallery photos

---

## Operating rules

### Before making changes
1. Run or inspect `git status --short`.
2. Understand the current diff before editing files.
3. Do not overwrite unrelated user changes.
4. If there are many modified files, ask which area to work on unless the requested task is clearly scoped.

### While making changes
- Keep changes small and reviewable.
- Prefer editing existing components/data structures over introducing new abstractions.
- Preserve existing naming conventions unless there is a clear reason to improve them.
- Do not delete assets unless explicitly asked.
- Do not reformat large files unnecessarily.
- Do not change package versions or install new dependencies unless explicitly asked.
- Do not commit, push, deploy, or create pull requests unless explicitly asked.

### After making changes
1. Run `npm run build` when code, data shape, imports, or assets have changed.
2. Summarise changed files and the reason for each change.
3. Report build result clearly.
4. Mention any follow-up manual checks, especially visual checks in browser.
5. Remind the user to commit when ready; push/deploy only according to their workflow.

---

## Quality bar

### Content integrity
- Publication metadata should be accurate and consistently formatted.
- Team/news/project text should be concise, factual, and not overhyped.
- Do not invent dates, awards, roles, grants, or publication details.
- If data are ambiguous, leave a clear placeholder or ask the user.

### Design and UX
- Preserve a clean scientific-lab aesthetic.
- Avoid flashy animations unless they clearly improve the site.
- Check mobile layout for any component touched.
- Keep navigation and content hierarchy obvious.
- Use responsive image handling where practical.

### Accessibility
- Images should have meaningful `alt` text unless decorative.
- Interactive elements should be keyboard-accessible.
- Avoid low-contrast text.
- Avoid relying on colour alone to convey meaning.

### Performance
- Avoid adding heavy dependencies.
- Avoid unnecessary large image loads.
- Use lazy loading for gallery-like image lists when appropriate.
- Keep the site static-friendly and easy to deploy.

---

## Routine: "update publications"

When the user says **"update publications"**:

1. Check `public/images/publications/first-pages/` for new PDF files.
2. Run:
   ```bash
   npm run trim-pdfs
   ```
   This trims PDFs to one page, auto-identifies papers, renames files, and updates `firstPage` fields in `src/data/publications.js`.
3. Run:
   ```bash
   npm run build
   ```
4. Show a summary of what was matched, renamed, and updated.
5. List publications still missing a `firstPage` value, meaning entries with `firstPage: ''` that should appear in the flipbook.
6. Remind the user to commit when ready; push/deploy only according to their workflow.

Flipbook note:
- The flipbook combines `selected`, `originalArticles`, and `reviews`, then deduplicates by title.
- If the same publication appears in multiple arrays, only the first retained entry matters.
- Usually the `selected` entry should have the `firstPage`; duplicate entries can keep `firstPage: ''`.

---

## Routine: "process inbox"

When the user says **"process inbox"**, inspect and process all relevant inbox areas.

### Papers: `inbox/papers/` and `inbox/papers.md`
1. Read `inbox/papers.md` for new entries in any format: DOI, citation, abstract, or structured notes.
2. Add each paper to `src/data/publications.js` in the appropriate arrays: `selected`, `originalArticles`, and/or `reviews`.
3. Set `firstPage: ''` initially.
4. Move PDFs from `inbox/papers/` to `public/images/publications/first-pages/`.
5. Run:
   ```bash
   npm run trim-pdfs
   ```
6. Clear only processed entries from `inbox/papers.md`, leaving the header/template comments. If an entry is ambiguous (unclear array placement, missing fields, uncertain metadata), do not clear it — leave it in place with a note or ask the user before proceeding.

### New members: `inbox/members/` and New Members section of `inbox/updates.md`
1. Read member details from `inbox/updates.md`.
2. Convert HEIC headshots to JPG if needed.
3. Move headshots to `public/images/team/` using clean filenames.
4. Add member entries to `src/data/team.js`.
5. Add a concise welcome item to `src/data/news.js`.
6. Clear only processed entries from `inbox/updates.md`. If any member detail is ambiguous (unclear role, missing headshot, conflicting information), do not clear that entry — leave it in place with a note or ask the user.

### News and grants: News / Grants section of `inbox/updates.md`
1. Parse news or grant items.
2. Add entries to `src/data/news.js`.
3. Clear only processed entries from `inbox/updates.md`. If an item is ambiguous (unclear date, vague description, unsure whether it belongs in news), leave it in place with a note or ask the user.

### Gallery: `inbox/gallery/`
1. Convert `.HEIC` / `.heic` files to JPG before moving:
   ```bash
   sips -s format jpeg <file> --out <same-path-with-.jpg>
   ```
2. Move JPG/PNG files to `public/images/lab/<year>/`.
3. Clear processed gallery entries from `inbox/updates.md`.

HEIC rule:
- HEIC conversion also applies to `inbox/members/` and any HEIC files found directly in `public/images/lab/` subfolders.
- Always convert HEIC before committing because browsers cannot reliably display HEIC.

After all inbox processing:
1. Run `npm run build`.
2. Summarise all moved/edited files.
3. Remind the user to commit when ready; push/deploy only according to their workflow.

---

## Routine: ordinary content updates

Use this routine for small, standalone edits such as updating a team member's role, adding a news item, editing a project blurb, or changing contact text.

1. Edit the relevant file in `src/data/` (e.g. `team.js`, `news.js`, `projects.js`).
2. If the change references an image or asset, verify the path exists in `public/images/`.
3. Run `npm run build` to confirm no errors.
4. Summarise what was changed and in which file.
5. Remind the user to commit when ready; push/deploy only according to their workflow.

These changes do not require the full inbox or publication routines. Apply them directly when the scope is clear.

---

## Routine: "prepare Codex review"

When the user wants Codex to review the site or the current changes:

1. Run:
   ```bash
   git status --short
   git diff --stat
   git diff --check
   npm run build
   ```
2. Prepare a concise handoff summary including:
   - Goal of the current change
   - Files changed
   - Build result
   - Known concerns or areas where feedback is wanted
   - Any visual checks already done or still needed
3. Do not ask Codex to implement by default. Ask Codex to audit, critique, and suggest.

Suggested prompt to use with Codex:

```text
Please review this repository as an external reviewer/advisor. Do not modify files unless explicitly asked. Focus on correctness, maintainability, accessibility, performance, responsiveness, content consistency, and design/UX opportunities. Prioritise issues by severity and give concrete recommendations with file-level pointers.
```

---

## Quarterly publication check

Remind the user to:
- Check whether new papers have been published and add them to `src/data/publications.js`.
- Add papers to all appropriate arrays: `selected`, `originalArticles`, and/or `reviews`.
- Drop new PDFs into `public/images/publications/first-pages/` and run `npm run trim-pdfs`.
- Update `threadUrl` fields for recent papers.
- Check that `link` and `pdf` URLs still resolve.
- Review the `selected` array and consider whether recent papers should be promoted.
- Check `src/data/news.js` for achievements, awards, media coverage, and grants.
- Check `src/data/team.js` for joins, departures, and role changes.

---

## Preferred final response format

After completing a task, respond with:

1. **What changed** — concise bullet list
2. **Checks run** — build/test commands and results
3. **Potential follow-ups** — only relevant items
4. **Commit reminder** — if files changed

Keep the response direct and factual.
