# Access Control : Gating the Repo to Paid Buyers

> **TL;DR** — Buyer pays on Gumroad → gets an email with a link → enters their receipt + GitHub username on a form → an n8n workflow invites them to the private repo. Three n8n workflows, two tables, one HTML form. Dog-fooded: your course on n8n is sold by n8n.

---

## 🧭 Architecture

```mermaid
sequenceDiagram
    participant B as Buyer
    participant G as Gumroad
    participant W as n8n (your VPS)
    participant DB as Postgres
    participant GH as GitHub API
    participant R as Private Repo

    B->>G: Pay $79
    G->>W: POST /webhook/course/gumroad-sale
    W->>DB: INSERT purchases
    W->>B: Email with claim-access link
    B->>W: POST /webhook/course/claim-access<br/>{receipt, github}
    W->>DB: Look up purchase + seats
    W->>GH: PUT /repos/.../collaborators/:user
    GH-->>B: Invite email
    W->>DB: INSERT access_grants
    B->>R: Accept + git clone
```

Three workflows:

| File | Purpose |
|---|---|
| `workflows/access/01-gumroad-sale-webhook.json` | Receive sale, record purchase, email buyer |
| `workflows/access/02-grant-github-access.json` | Verify receipt + invite buyer to repo |
| `workflows/access/03-gumroad-refund-webhook.json` | On refund, revoke all GitHub grants for that purchase |

Plus:

| File | Purpose |
|---|---|
| `db/access.sql` | Postgres schema: `purchases`, `access_grants`, `access_attempts` |
| `landing/repo-access.html` | Buyer-facing form (plain HTML, no build) |
| `scripts/revoke-access.mjs` | CLI for manual revocation (chargebacks, policy violations) |

> In the split-repo setup, buyers are granted access to the **consumer repo**:
>
> `tkivite/n8n-mpesa-course-consumer`

---

## 🚀 Setup (one-time, ~30 min)

### 1. Make the course repo private

```
GitHub → Settings → Change repo visibility → Private
```

### 2. Load the access tables into Postgres

```bash
docker compose exec postgres psql -U n8n -d n8n -f /docker-entrypoint-initdb.d/02-access.sql
```

Or copy `db/access.sql` next to `db/schema.sql` and bounce the Postgres container (fresh init).

### 3. Create a fine-grained GitHub Personal Access Token

1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens**
2. **Resource owner**: your username (or the org that owns the repo)
3. **Repository access**: Only select repositories → pick `n8n-mpesa-course-consumer`
4. **Permissions** (repository):
   - `Administration` → **Read and write** (required to invite/remove collaborators)
   - `Metadata` → Read only (auto-included)
5. Save the token (`ghp_...`). You will not see it again.

### 4. Add env vars to `docker/.env`

```bash
# --- Course access control ---
GH_REPO_OWNER=tkivite
GH_REPO_NAME=n8n-mpesa-course-consumer
GH_ADMIN_TOKEN=ghp_your_fine_grained_token

GUMROAD_WEBHOOK_SECRET=any-random-string-you-want
COURSE_SITE_URL=https://yourcourse.co.ke
COURSE_FROM_EMAIL=hello@yourcourse.co.ke
```

Restart n8n: `docker compose up -d`.

### 5. Import the three workflows into n8n

Workflows → Import from File → pick each JSON in `workflows/access/`. Save and **activate** each one.

Note the generated webhook URLs — n8n shows them on the Webhook node.

### 6. Point Gumroad at your webhooks

In Gumroad: **Settings → Advanced → Ping URL**:

- **Sale ping** → `https://api.yourcourse.co.ke/webhook/course/gumroad-sale`
- **Refund ping** → `https://api.yourcourse.co.ke/webhook/course/gumroad-refund`

(Gumroad calls it "Ping" — same as a webhook.)

### 7. Deploy the claim-access form

The form lives at `landing/repo-access.html`. Edit the config line at the bottom of the file to point `ACCESS_ENDPOINT` at your n8n webhook, then host it anywhere (Netlify, Vercel, GitHub Pages, same host as your landing page). Link it from the welcome email the first workflow sends.

### 8. (Optional) Smoke-test with a $1 Gumroad product

- Create a $1 variant on Gumroad
- Buy it with a test card (or your own card for a real sale, then refund)
- Verify: welcome email arrives → claim form grants access → refund removes it

---

## 🎟️ Seat quotas per tier

| Tier | Seats | Enforced by |
|---|---|---|
| Starter | 1 | `tier_seat_quota` view + `purchase_seat_usage` view |
| Pro | 1 | ↑ |
| Agency | 5 | ↑ |

Buyers can grant to multiple GitHub usernames up to their tier's seat count. The `Decide Outcome` node in workflow 02 returns `seats_exhausted` once used up.

To change quotas, edit the `tier_seat_quota` view in `db/access.sql`.

---

## 🔄 What happens on refund

1. Gumroad fires the refund webhook
2. Workflow 03 marks `purchases.refunded_at`
3. Workflow 03 finds every active grant for that purchase
4. For each: DELETE the collaborator via GitHub API, mark `access_grants.revoked_at`
5. Buyer loses `git clone`/`git pull` immediately (they keep what they already cloned, but no updates)

---

## 🛠️ Manual revocation CLI

For edge cases (chargebacks outside Gumroad, policy violations, agency seat transfers):

```bash
# Revoke one user
GH_REPO_OWNER=tkivite \
GH_REPO_NAME=n8n-mpesa-course-consumer \
GH_ADMIN_TOKEN=ghp_... \
DATABASE_URL=postgres://n8n:n8n@localhost:5432/n8n \
  node scripts/revoke-access.mjs --user some-github-handle --reason "chargeback"

# Dry-run first
node scripts/revoke-access.mjs --user some-github-handle --dry-run

# Revoke ALL seats for a purchase
node scripts/revoke-access.mjs --purchase 00000000-0000-0000-0000-000000000000
```

Install `pg` once: `npm install pg`.

---

## 🔐 Security notes

### Rate-limit the claim-access endpoint

Add to Nginx (we already have the pattern for STK push):

```nginx
limit_req_zone $binary_remote_addr zone=claim:10m rate=3r/m;

location /webhook/course/claim-access {
  limit_req zone=claim burst=5 nodelay;
  proxy_pass http://127.0.0.1:5678;
}
```

Three attempts per minute is plenty for real buyers and brutal for brute-force.

### Audit log

Every claim attempt — success or failure — writes to `access_attempts` with the submitted receipt, GitHub handle, IP, and outcome. Query to spot abuse:

```sql
-- Top IPs by failed attempts in last 24h
SELECT source_ip, COUNT(*) AS failures
FROM access_attempts
WHERE attempted_at > NOW() - INTERVAL '24 hours'
  AND outcome <> 'granted'
GROUP BY source_ip
ORDER BY failures DESC
LIMIT 20;
```

### Verify Gumroad webhooks

Gumroad does not sign webhooks with HMAC. Two defensive moves:

1. **Secret in path** — set the ping URL to `.../webhook/course/gumroad-sale?secret=XYZ` and reject requests without the correct `?secret=` in the first Code node. Simple shared secret, enough for the actual threat (random bots scanning).
2. **Verify via Gumroad API** — add an HTTP Request node that calls `GET https://api.gumroad.com/v2/sales/<sale_id>` with your Gumroad access token and compares the amount. Guarantees the "sale" is real. Slight added complexity.

---

## ❓ Non-GitHub buyers

Not everyone has GitHub. For them:

- **Gumroad file delivery** — upload a zip of `workflows/`, `postman/`, `db/`, `docs/*.pdf`, and `docker/` as a Gumroad file. Buyers download the snapshot from their Gumroad library. No updates, but 90% of the value.
- The welcome email mentions both options so the buyer picks.

---

## 📊 Monitoring the access system

Add a dashboard query to your weekly ops report:

```sql
SELECT
  DATE_TRUNC('day', purchased_at) AS day,
  product_tier,
  COUNT(*)                        AS sales,
  SUM(amount_usd)                 AS revenue_usd,
  COUNT(*) FILTER (WHERE refunded_at IS NOT NULL) AS refunds
FROM purchases
WHERE purchased_at > NOW() - INTERVAL '30 days'
GROUP BY 1, 2
ORDER BY 1 DESC, 2;
```

Perfect for a daily email or a Grafana panel.

---

## 💡 Future upgrades

- **Discord bot** that grants a `student` role from the same `receipt` + `discord-id` form
- **Lemon Squeezy** / **Paystack** / **M-Pesa C2B** adapters — same shape, just change workflow 01's parsing
- **Expiring access** for rental-style courses (6 months, auto-revoke)
- **Receipt watermarking** — embed the sale ID into generated PDFs so leaked copies are traceable

