# Lab profile source data

These two CSV files are the **human-editable master tables** for the lab's
research-profile and collaboration visualisation.  They mirror a private
Google Sheet; what lives here in the repo is always **placeholder /
anonymised data** — real member names are never committed.

Run the build pipeline to regenerate the component data:

```bash
node scripts/build-lab-data.mjs
```

---

## scores.csv

| Column | Description |
|---|---|
| `name` | Member identifier (placeholder: "Member A" … "Member L") |
| `status` | `current` or `alumni` — only `current` members are rendered |
| `order` | Integer display order (1 = first / PI) |
| `<area>` | One column per research area, **integer 0–10** |

- Column order after `order` must match `researchAreas` in `build-lab-data.mjs`.
- To **add** a member: append a row.
- To **remove** a member: delete the row (or set `status = alumni`).
- To **add** an area: append a column header and fill scores for all rows.

## collaborations.csv

Weighted undirected edge list.  Each row is one collaboration pair.

| Column | Description |
|---|---|
| `person_a` | Name exactly as in `scores.csv` |
| `person_b` | Name exactly as in `scores.csv` |
| `level` | Collaboration intensity: **1** = occasional, **2** = regular / project-dependent |

**Level scale:**
- `0` — no collaboration. **Do not add a row** — simply omit the pair.
- `1` — occasional: have worked together, cross-area input, ad-hoc help.
- `2` — regular / dependent: active joint project, shared analysis pipeline, or day-to-day dependency.

Other notes:
- Lines starting with `#` are comments and are ignored by the build script.
- List each pair **once**; the edges are undirected (A↔B = B↔A).
- The script deduplicates, drops self-edges, skips blank or level=0 rows, and
  warns on unrecognised names or invalid levels.
- Edges referencing members not in `scores.csv` (or with `status ≠ current`)
  are silently dropped.
- The PI and support roles will naturally appear as hubs; no special handling
  is needed.

---

## Google Sheet sync (when enabled)

Set `SCORES_CSV_URL` and `COLLAB_CSV_URL` environment variables to the
"Publish to web → CSV" URLs of the corresponding sheets.  The build script
fetches those URLs when the env vars are present, otherwise falls back to
these local files.

The GitHub Actions workflow (`.github/workflows/lab-profile.yml`) is
**disabled** until member consent is obtained.  See that file for the
exact steps to enable it.
