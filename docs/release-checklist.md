# Release Checklist : Creator Repo → Consumer Repo

Use this checklist every time you publish changes from the creator repo into the consumer repo.

---

## 1. Ownership model

Not every file should be pushed from the creator repo to the consumer repo.

### Creator-owned source of truth

These files are maintained in the creator repo and then synced into the consumer repo:

- `docs/handbook.md`
- `docs/handbook.pdf`
- `docs/daraja-cheatsheet.md`
- `docs/daraja-cheatsheet.pdf`
- `docs/go-live-checklist.md`
- `docs/go-live-checklist.pdf`
- `LICENSE`

### Consumer-owned source of truth

These are maintained directly in the consumer repo:

- `START-HERE.md`
- `docs/platform-support.md`
- `docs/platform-setup-macos.md`
- `docs/platform-setup-windows.md`
- `docs/platform-setup-linux.md`
- `docs/troubleshooting.md`
- `docs/student-quickstart.md`
- `docs/student-quickstart.pdf`
- `README.md`
- all student-facing runtime assets (`workflows/`, `docker/`, `postman/`, `deploy/`)

This keeps the split clean:

- creator repo = course operations + packaging + sales + gated access
- consumer repo = actual student experience

---

## 2. Before publishing

- [ ] Update the creator-owned docs in this repo
- [ ] Rebuild PDFs
- [ ] Review the rendered PDFs visually
- [ ] Confirm the consumer repo path exists locally

### Rebuild PDFs

```bash
cd /Users/tituskivite/Projects/mpesa-v3/n8n-mpesa-course-creator
npm install
npm run build:pdf
```

---

## 3. Dry-run the consumer publish step

```bash
cd /Users/tituskivite/Projects/mpesa-v3/n8n-mpesa-course-creator
bash scripts/publish-consumer.sh --dry-run
```

Confirm the file mappings look correct.

---

## 4. Publish into the consumer repo

```bash
cd /Users/tituskivite/Projects/mpesa-v3/n8n-mpesa-course-creator
bash scripts/publish-consumer.sh
```

This syncs the files listed in:

- `release/consumer-sync-manifest.txt`

---

## 5. Review and commit in the consumer repo

```bash
cd /Users/tituskivite/Projects/mpesa-v3/n8n-mpesa-course-consumer
git status
git add -A
git commit -m "chore: sync shared docs from creator repo"
git push
```

---

## 6. Student sanity check after publish

Do this quickly after any release:

- [ ] Open `README.md`
- [ ] Open `START-HERE.md`
- [ ] Open `docs/student-quickstart.pdf`
- [ ] Open `docs/handbook.pdf`
- [ ] Confirm platform docs are still linked correctly
- [ ] Confirm no creator-only file accidentally landed in the consumer repo

---

## 7. Versioning recommendation

Use matching tags for major course releases.

### Example

- creator repo tag: `creator-v1.0.0`
- consumer repo tag: `consumer-v1.0.0`

Or, if you want tighter pairing:

- creator repo tag: `course-v1.0.0`
- consumer repo tag: `course-v1.0.0`

Just be consistent.

---

## 8. When to publish from creator → consumer

Good times to run the sync:

- after updating the handbook
- after changing the Daraja cheat sheet
- after updating the go-live checklist
- before a launch
- after a support-driven doc improvement that belongs in shared materials

Do **not** use this sync for:

- student onboarding doc changes that belong only in the consumer repo
- workflow edits that belong only in the consumer repo
- access-control workflow changes that belong only in the creator repo

---

## 9. Quick commands

### Dry run

```bash
cd /Users/tituskivite/Projects/mpesa-v3/n8n-mpesa-course-creator
bash scripts/publish-consumer.sh --dry-run
```

### Publish

```bash
cd /Users/tituskivite/Projects/mpesa-v3/n8n-mpesa-course-creator
bash scripts/publish-consumer.sh
```

### Publish to a different consumer repo path

```bash
cd /Users/tituskivite/Projects/mpesa-v3/n8n-mpesa-course-creator
bash scripts/publish-consumer.sh /absolute/path/to/other-consumer-repo
```

