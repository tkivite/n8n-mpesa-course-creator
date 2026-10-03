# n8n M-Pesa Mastery : Creator Repo

This repo is for the **course creator / maintainer**.

It contains the internal assets needed to build, package, publish, and gate the course:

- creator checklists
- voiceover lesson scripts
- PDF source docs and generated PDFs
- access-control workflows for Gumroad + GitHub
- landing pages
- PDF build pipeline
- workflow validator
- CI config

It is **not** the student-facing repo.

---

## What belongs here

### Course operations

- `docs/course-owner-checklist.md`
- `docs/access-control.md`
- `workflows/access/`
- `scripts/revoke-access.mjs`

### Publishing and packaging

- `scripts/build-pdfs.mjs`
- `scripts/extract-voiceover.mjs`
- `scripts/validate-workflows.mjs`
- `.github/workflows/ci.yml`

### Video-production source

- `docs/scripts/`

### Landing / sales assets

- `landing/index.html`
- `landing/repo-access.html`

---

## Suggested workflow

1. Update source content here
2. Export PDFs here
3. Record and edit lessons from the scripts here
4. Publish only the student-relevant output into the consumer repo
5. Keep repo-gating and course operations here only

---

## Quick links

- Owner checklist : `docs/course-owner-checklist.md`
- Access control : `docs/access-control.md`
- Release checklist : `docs/release-checklist.md`
- Gumroad product copy : `docs/gumroad-product-copy.md`
- Gumroad setup checklist : `docs/gumroad-setup-checklist.md`
- Refund policy : `docs/refund-policy.md`
- Support policy : `docs/support-policy.md`
- Privacy policy : `docs/privacy-policy.md`
- Terms of use : `docs/terms-of-use.md`
- Thumbnail and lesson naming guide : `docs/thumbnail-and-lesson-naming-guide.md`
- Video production playbook : `docs/video-production-playbook.md`
- Voiceover scripts : `docs/scripts/`
- PDF build docs : `docs/BUILDING.md`

---

## Build commands

```bash
npm install
npm run validate:workflows
npm run build:voiceover
npm run build:pdf
npm run publish:consumer
```

### Creator → consumer publish flow

```bash
npm run publish:consumer -- --dry-run
npm run publish:consumer
npm run publish:consumer -- --commit --push
```

That syncs the creator-owned public docs listed in `release/consumer-sync-manifest.txt` into the consumer repo.

---

## Related repo

Student-facing content should live in the **consumer repo**:

- `../n8n-mpesa-course-consumer`


