# Building the Course PDFs

The handbook, cheat sheet, go-live checklist, course-owner checklist, and public policy documents live as **Markdown** in `docs/` so they're easy to edit and diff. They're rendered to PDF via a tiny Node script that uses the Google Chrome you already have installed — **no Pandoc, no LaTeX, no Puppeteer download**.

## Prerequisites

- Node.js ≥ 20
- Google Chrome (or Chromium / Edge) installed in `/Applications`
  - Override with `CHROME_PATH=/path/to/chrome` if needed

## Build

```bash
npm install          # installs marked + highlight.js only (~1 MB)
npm run build:pdf
```

Output:
```
docs/handbook.pdf           (~10 pages, course handbook)
docs/daraja-cheatsheet.pdf  (~5 pages, API reference)
docs/go-live-checklist.pdf  (~4 pages, production checklist)
docs/course-owner-checklist.pdf  (owner launch + QA checklist)
docs/refund-policy.pdf      (public refund policy)
docs/support-policy.pdf     (public support policy)
docs/privacy-policy.pdf     (public privacy policy)
docs/terms-of-use.pdf       (public terms of purchase and use)
```

## Customising

- Edit the markdown in `docs/*.md`
- Styling lives in the `CSS` constant inside `scripts/build-pdfs.mjs`
- Add a new doc: append an entry to `DOCS_TO_BUILD` at the bottom of the script

## Why not Pandoc?

Pandoc + LaTeX is a 2-GB install for what is essentially "turn markdown into a styled PDF". Chrome's headless print-to-PDF handles our needs (code blocks, tables, callouts, page breaks) with 1 MB of deps and renders in under 2 seconds per doc.

