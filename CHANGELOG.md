# Changelog

## v0.4.0 : 2026-10-02

- Gated repo access system (see `docs/access-control.md`)
- Three new n8n workflows under `workflows/access/`:
  - `01-gumroad-sale-webhook.json` : record purchase + email buyer
  - `02-grant-github-access.json` : verify receipt + invite to private repo
  - `03-gumroad-refund-webhook.json` : revoke GitHub access on refund
- Postgres schema: `purchases`, `access_grants`, `access_attempts` (`db/access.sql`)
- Static buyer-facing claim form (`landing/repo-access.html`)
- Manual revocation CLI (`scripts/revoke-access.mjs`)
- Seat quotas per tier (Starter/Pro = 1, Agency = 5)
- Audit log for every claim attempt (brute-force detection)

## v0.3.0 : 2026-10-01

- All ten module voiceover scripts written (~23k words, ~2.6 h of narration, 50 lessons)
- Workflow JSON validator (`npm run validate:workflows`)
- GitHub Actions CI: validates workflows, extracts voiceover, renders PDFs on every push
- Mermaid architecture diagrams: STK push sequence, callback flow, reconciliation, auth caching, VPS topology
- Zero-build static landing page (`landing/index.html`)
- Heading styles cleaned up (`:` separator instead of em-dash)

## v0.2.0 : 2026-10-01

- Voiceover scripts for Modules 0–2 (~55 min of narration)
- Script extractor pipeline: markdown → ElevenLabs-ready `.txt` files (`npm run build:voiceover`)
- Chrome-headless PDF renderer (`npm run build:pdf`)
- Handbook, Daraja cheat sheet, go-live checklist rendered to PDF

## v0.1.0 : 2026-10-01

- Initial scaffold
- Docker Compose: n8n + Postgres + optional ngrok tunnel
- Four core workflows: auth, STK push, callback, reconciliation
- Five use-case workflow templates
- Postman collection (Daraja direct + n8n webhooks)
- Postgres & Supabase SQL schemas
- VPS deployment script + Nginx config
- Course handbook, cheat sheet, go-live checklist (Markdown)
- Helper scripts: token test, callback simulator

