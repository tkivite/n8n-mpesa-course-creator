# Course Owner Checklist : n8n M-Pesa Mastery

> A practical, downloadable execution guide for the course owner. Use this before launch, during local testing, and again when onboarding your first paying students.

---

## 1. Definition of ready

The course is ready when all of these are true:

- [ ] A buyer can pay successfully
- [ ] A buyer can receive access instructions
- [ ] A buyer can access the repo or downloadable files
- [ ] A buyer on **macOS** can complete the local setup
- [ ] A buyer on **Windows** can complete the local setup
- [ ] A buyer on **Linux** can complete the local setup
- [ ] A buyer can identify where to start without asking you
- [ ] The STK Push demo works locally from the student materials alone
- [ ] Refunds and repo-access revocation work
- [ ] You have a support path for common setup issues

---

## 2. Product decisions to freeze

Before recording or launching, lock these down.

### Offer design

- [ ] Final course title chosen
- [ ] Final subtitle chosen
- [ ] Final pricing tiers confirmed
  - [ ] Starter
  - [ ] Pro
  - [ ] Agency
- [ ] Final refund policy written
- [ ] Final support policy written
- [ ] Final launch date chosen

### Current frozen decisions

- **Course title** : `n8n M-Pesa Mastery`
- **Subtitle** : `Build Production-Ready STK Push Payment Workflows - No Backend code`
- **Pricing tiers** : `Starter · Pro · Agency`
- **Target launch date** : `2026-10-15`

### Checkout / Gumroad product names

Use these exact names in Gumroad, Lemon Squeezy, Paystack checkout copy, and launch posts:

- **Starter** : `n8n M-Pesa Mastery : Starter`
- **Pro** : `n8n M-Pesa Mastery : Pro`
- **Agency** : `n8n M-Pesa Mastery : Agency`

Suggested positioning:

- **Starter** : videos + PDFs + community access
- **Pro** : Starter + private consumer repo + workflows + Postman + deploy files
- **Agency** : Pro + creator-oriented commercial guidance, white-label material, and premium support

### Tier contents

- [ ] Decide which tiers include videos
- [ ] Decide which tiers include PDFs
- [ ] Decide which tiers include Git repo access
- [ ] Decide which tiers include Postman collection
- [ ] Decide which tiers include workflow JSONs
- [ ] Decide which tiers include private support or consult calls

---

## 3. Course assets checklist

### Core documentation

- [ ] `docs/handbook.md` reviewed
- [ ] `docs/handbook.pdf` exported and checked
- [ ] `docs/daraja-cheatsheet.md` reviewed
- [ ] `docs/daraja-cheatsheet.pdf` exported and checked
- [ ] `docs/go-live-checklist.md` reviewed
- [ ] `docs/go-live-checklist.pdf` exported and checked
- [ ] `docs/access-control.md` reviewed
- [ ] `docs/course-owner-checklist.md` reviewed

### Workflows

- [ ] `workflows/01-mpesa-auth.json`
- [ ] `workflows/02-stk-push.json`
- [ ] `workflows/03-stk-callback.json`
- [ ] `workflows/04-reconciliation.json`
- [ ] `workflows/use-cases/*.json`
- [ ] `workflows/access/*.json`

### Data and deployment

- [ ] `db/schema.sql` reviewed
- [ ] `db/access.sql` reviewed
- [ ] `docker/docker-compose.yml` reviewed
- [ ] `docker/.env.example` reviewed
- [ ] `deploy/vps-setup.sh` reviewed
- [ ] `deploy/nginx.conf` reviewed

### Student downloads

- [ ] Postman collection reviewed
- [ ] PDFs generated
- [ ] Repo clone path tested
- [ ] Optional ZIP delivery prepared if using Gumroad file delivery

---

## 4. Video production checklist

### Scripts and narration

- [ ] All module scripts reviewed for clarity
- [ ] Narration tone sounds human and natural
- [ ] Long lessons split where needed
- [ ] Every lesson has a clear outcome
- [ ] Every lesson has matching screen cues

### Audio

- [ ] Voice model chosen (your own voice clone or AI voice)
- [ ] Test narration sounds natural with technical words
- [ ] M-Pesa, Daraja, shortcode, passkey, and GitHub are pronounced correctly
- [ ] Pauses sound natural

### Screen recordings

- [ ] n8n demos recorded
- [ ] Postman demos recorded
- [ ] Docker / terminal demos recorded
- [ ] Daraja portal demos recorded
- [ ] GitHub access flow demos recorded
- [ ] Errors / troubleshooting demos recorded where useful

### Editing

- [ ] Intro card added
- [ ] Outro card added
- [ ] Callouts readable on 1080p
- [ ] Captions exported and checked
- [ ] Audio normalized across lessons
- [ ] Final exports named consistently

---

## 5. Student experience checklist

Run this as if you are a brand-new buyer.

### Purchase journey

- [ ] Buyer can land on the sales page and understand the offer
- [ ] Buyer can complete checkout successfully
- [ ] Buyer receives welcome or access email
- [ ] Buyer understands the next action immediately

### Access journey

- [ ] Repo-access form works
- [ ] GitHub invite arrives
- [ ] Buyer understands how to accept the invite
- [ ] Non-GitHub buyers still have a fallback path if you offer one

### First 15 minutes of onboarding

- [ ] Buyer can find the correct first document to open
- [ ] Buyer can identify prerequisites quickly
- [ ] Buyer knows whether their OS is supported
- [ ] Buyer can start local setup without messaging support

---

## 6. Platform support checklist

This course should officially support **macOS, Windows, and Linux**.

### Support statement to publish

Use wording like this in the landing page, README, and welcome email:

> This course is fully supported for **macOS, Windows, and Linux** users. The local hands-on setup uses Git, Docker, a browser, and Postman or equivalent tools.

### macOS support

- [ ] Docker Desktop setup instructions written
- [ ] `zsh` / Terminal commands tested
- [ ] Browser launch instructions tested
- [ ] Postman workflow tested
- [ ] Copy/paste commands verified

### Windows support

- [ ] Docker Desktop setup instructions written
- [ ] WSL2 note added where needed
- [ ] PowerShell commands written and tested
- [ ] Path separator differences handled
- [ ] Postman workflow tested
- [ ] Browser launch instructions tested

### Linux support

- [ ] Docker Engine setup instructions written
- [ ] Docker Compose plugin instructions written
- [ ] Shell commands tested on Ubuntu or Debian-like system
- [ ] `xdg-open` note added
- [ ] Browser launch instructions tested
- [ ] Postman or alternative guidance included

### Platform support matrix

| Task | macOS | Windows | Linux |
|---|---|---|---|
| Watch videos | ✅ | ✅ | ✅ |
| Read PDFs | ✅ | ✅ | ✅ |
| Clone repo | ✅ | ✅ | ✅ |
| Run Docker locally | ✅ | ✅ | ✅ |
| Import n8n workflows | ✅ | ✅ | ✅ |
| Use Postman collection | ✅ | ✅ | ✅ |
| Complete the full hands-on course | ✅ | ✅ | ✅ |

---

## 7. Local QA checklist for you, the owner

Do this yourself before launch.

### Clean-room test

- [ ] Use a clean machine, new OS user, or fresh VM
- [ ] Follow only the student-facing docs
- [ ] Do not rely on memory or internal knowledge
- [ ] Write down every confusion point
- [ ] Fix the docs immediately after the test

### Technical test flow

- [ ] Clone the repo
- [ ] Copy `docker/.env.example` to `.env`
- [ ] Start Docker Compose
- [ ] Open n8n successfully
- [ ] Import workflows successfully
- [ ] Run `npm install`
- [ ] Run `npm run validate:workflows`
- [ ] Run `npm run build:voiceover`
- [ ] Run `npm run build:pdf`
- [ ] Confirm PDFs are generated
- [ ] Confirm landing pages open locally in the browser

### STK Push flow test

- [ ] Auth workflow works
- [ ] STK Push workflow accepts valid test payload
- [ ] Invalid payloads fail clearly
- [ ] Callback workflow updates transaction state
- [ ] Reconciliation workflow resolves pending items
- [ ] Database rows are created correctly

### Access control test

- [ ] Sale webhook creates a purchase
- [ ] Claim-access form grants repo invite
- [ ] Invalid receipt returns a clear message
- [ ] Invalid GitHub username returns a clear message
- [ ] Refund webhook revokes access
- [ ] Manual revoke script works

---

## 8. Common failure cases to test before students hit them

- [ ] Docker not installed
- [ ] Docker daemon not running
- [ ] Port `5678` already in use
- [ ] Missing `NGROK_AUTHTOKEN`
- [ ] Missing `MPESA_CONSUMER_KEY`
- [ ] Missing `MPESA_CONSUMER_SECRET`
- [ ] Missing `MPESA_PASSKEY`
- [ ] Wrong `MPESA_BASE_URL`
- [ ] Wrong GitHub token for repo-access automation
- [ ] Wrong Gumroad webhook URL
- [ ] Receipt typo in claim form
- [ ] GitHub username entered with `@`

For each one:

- [ ] Verify what the student sees
- [ ] Add a troubleshooting note if the error is confusing
- [ ] Prefer helpful error messages over silent failure

---

## 9. Sales and delivery checklist

### Sales page

- [ ] Landing page is live
- [ ] Pricing is correct
- [ ] Purchase buttons point to the correct checkout
- [ ] Refund policy is visible
- [ ] Supported platforms are visible
- [ ] What buyers get is explicitly listed

### Post-purchase delivery

- [ ] Welcome email wording is clear
- [ ] Repo claim link works
- [ ] Buyer knows where to begin
- [ ] Buyer knows how to contact support
- [ ] Buyer knows whether to start on macOS, Windows, or Linux docs

### Access management

- [ ] Repo is private
- [ ] GitHub token is scoped correctly
- [ ] Access workflows are active
- [ ] Refund flow is active
- [ ] Audit logs are being written

---

## 10. Support readiness checklist

### Channels

- [ ] Support email live
- [ ] Discord or Telegram live if used
- [ ] Response-time expectation written

### Canned replies to prepare

- [ ] Docker install issue
- [ ] n8n not loading at `localhost:5678`
- [ ] Postman import issue
- [ ] Invalid M-Pesa credentials
- [ ] Callback not arriving
- [ ] GitHub invite missing
- [ ] Claim form says invalid receipt

### Escalation rules

- [ ] Student setup issue
- [ ] Payment access issue
- [ ] Refund issue
- [ ] Broken repo asset
- [ ] Gumroad / GitHub outage scenario

---

## 11. Launch checklist

### Soft launch first

- [ ] Invite 3–5 trusted testers
- [ ] Give them the exact student path
- [ ] Collect feedback on confusing parts
- [ ] Fix documentation before public launch

### Public launch

- [ ] Announce on LinkedIn
- [ ] Announce on X / Twitter
- [ ] Share in Kenyan dev communities
- [ ] Share a teaser video
- [ ] Share a free lead magnet (Daraja cheat sheet or mini lesson)

### Post-launch first 7 days

- [ ] Track where buyers get stuck
- [ ] Patch docs daily if needed
- [ ] Watch repo-access logs
- [ ] Watch refund/revoke behavior
- [ ] Collect testimonials from early buyers

---

## 12. Recommended execution order

Follow this exact order to stay organized.

### Phase 1 : Freeze the product

- [ ] Final name
- [ ] Final tiers
- [ ] Final pricing
- [ ] Final support policy

### Phase 2 : Finalize student materials

- [ ] Docs
- [ ] PDFs
- [ ] Workflows
- [ ] Downloads

### Phase 3 : Complete local owner QA

- [ ] Clean-room test on macOS
- [ ] Clean-room test on Windows
- [ ] Clean-room test on Linux
- [ ] Fix all friction points

### Phase 4 : Finish video production

- [ ] Voiceover
- [ ] Screen recording
- [ ] Editing
- [ ] Uploads

### Phase 5 : Test paid-access automation

- [ ] Sale webhook
- [ ] Claim form
- [ ] GitHub invite
- [ ] Refund revoke

### Phase 6 : Soft launch

- [ ] Small test group
- [ ] Feedback
- [ ] Adjustments

### Phase 7 : Public launch

- [ ] Landing page live
- [ ] Checkout live
- [ ] Repo gating live
- [ ] Support live

---

## 13. Owner sign-off page

Use this section as the final gate.

### Product sign-off

- [ ] I have personally tested the full student flow
- [ ] I have personally tested the repo-access flow
- [ ] I have personally tested the refund and revoke flow
- [ ] I am comfortable supporting macOS, Windows, and Linux students
- [ ] I have a fallback plan if GitHub or Gumroad is temporarily unavailable

### Launch sign-off

- [ ] Ready for soft launch
- [ ] Ready for public launch

**Owner name:** __________________________

**Signed on:** __________________________

---

## 14. Quick links

- Repo root : `README.md`
- Student starting point : `START-HERE.md`
- Platform support matrix : `docs/platform-support.md`
- macOS setup : `docs/platform-setup-macos.md`
- Windows setup : `docs/platform-setup-windows.md`
- Linux setup : `docs/platform-setup-linux.md`
- Troubleshooting : `docs/troubleshooting.md`
- Access-control guide : `docs/access-control.md`
- Release checklist : `docs/release-checklist.md`
- Gumroad product copy : `docs/gumroad-product-copy.md`
- Gumroad setup checklist : `docs/gumroad-setup-checklist.md`
- Refund policy : `docs/refund-policy.md`
- Support policy : `docs/support-policy.md`
- Privacy policy : `docs/privacy-policy.md`
- Terms of use : `docs/terms-of-use.md`
- Thumbnail and lesson naming guide : `docs/thumbnail-and-lesson-naming-guide.md`
- Video production playbook : `docs/video-production-playbook.md`
- Handbook : `docs/handbook.pdf`
- Cheat sheet : `docs/daraja-cheatsheet.pdf`
- Go-live checklist : `docs/go-live-checklist.pdf`
- Owner checklist PDF : `docs/course-owner-checklist.pdf`

