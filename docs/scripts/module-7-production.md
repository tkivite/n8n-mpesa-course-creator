# Module 7 : Production Hardening

**Target runtime:** ~40 min · **Lessons:** 5 · **Combined word count:** ~5,400

---

## Lesson 7.1 : Choosing and provisioning a VPS *(8 min)*

### [SCREEN] 0:00–0:15
Title card.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 7.1 : Picking a VPS**

### [VO]
> Welcome to module seven. Forty minutes from now, your workflows will be running on a real server with real HTTPS, surviving reboots, backed up nightly, firewalled, and ready to accept production Daraja credentials. Let's deploy.

### [SCREEN] 0:15–1:30
Compare VPS providers for Kenyan use case.

### [ON-SCREEN TEXT] 0:15–1:30
> **VPS comparison (2 vCPU, 2GB, 40GB):**
> Hetzner CPX11: €4.59/mo · EU
> DigitalOcean: $6/mo · global
> Vultr: $6/mo · global
> Linode: $5/mo · global

### [VO]
> Four providers, roughly the same price and specs. Hetzner is cheapest at about five dollars equivalent — but Europe-based, so maybe sixty milliseconds further from Kenya than DigitalOcean's Johannesburg region. For STK push, that latency is invisible to users. Pick on preference.
>
> [PAUSE 1s]
>
> Minimum specs: two vCPU, two gigabytes RAM, forty gigabytes disk. That handles roughly a million M-Pesa transactions a month comfortably. Scale up if you grow.

### [SCREEN] 1:30–3:00
Provisioning on Hetzner demo.

### [VO]
> Walkthrough on Hetzner. Create a project. Add a server. Ubuntu twenty-four point oh four LTS. Pick CPX11. Pick a datacenter close to your users — Nuremberg is fine for Kenya. Add your SSH key. Create.
>
> [PAUSE 1s]
>
> Twenty seconds later, you have an IP address. SSH into it as root. You're on the box.

### [SCREEN] 3:00–4:30
Point DNS A record at the VPS IP.

### [VO]
> Point a domain at it. You need a real domain for Let's Encrypt. Buy a .co.ke from safaricom or Truehost — about a thousand shillings a year. Or use a subdomain of a domain you already own.
>
> [PAUSE 1s]
>
> In your DNS provider, add an A record. Hostname: api — or whatever subdomain. Value: your VPS's IP. TTL: three hundred. Save. Wait a minute for DNS to propagate.

### [SCREEN] 4:30–6:00
Run the vps-setup.sh one-liner.

### [ON-SCREEN TEXT] 4:30–6:00
> ```bash
> curl -fsSL https://raw.githubusercontent.com/<you>/n8n-mpesa-course/main/deploy/vps-setup.sh \
>   | sudo bash -s -- api.yourdomain.co.ke you@email.com
> ```

### [VO]
> The vps-setup script. One command. Replace the GitHub URL with your fork. Pass your domain and email as arguments. The script:
>
> [PAUSE 1s]
>
> Installs Docker, Docker Compose, Nginx, UFW, Certbot. Clones the course repo to opt slash n8n dash mpesa. Configures Nginx as a reverse proxy. Issues a Let's Encrypt cert. Enables UFW with only SSH, eighty, and four four three open. Updates the dot env with your production domain.
>
> [PAUSE 1s]
>
> Takes about three minutes. At the end, your domain serves n8n over HTTPS.

### [SCREEN] 6:00–7:00
Edit .env with real Daraja credentials.

### [VO]
> Final step: edit opt slash n8n dash mpesa slash docker slash dot env. Paste your production Daraja Consumer Key, Secret, Shortcode, and Passkey. Set MPESA_ENV equals production. Set MPESA_BASE_URL equals https colon slash slash api dot safaricom dot co dot ke.
>
> [PAUSE 1s]
>
> Then: docker compose up dash d. Thirty seconds. Open your browser to your domain. Create the n8n owner account. Import your workflows. Live.

### [SCREEN] 7:00–7:40
First-run sanity check.

### [VO]
> First sanity check. From Postman, hit your production webhook URL for the STK push with amount one. Phone buzzes. You enter PIN. One shilling leaves your account for the shortcode owner. Callback arrives. Database row updates. If all four steps happen in under five seconds, you're live.

### [SCREEN] 7:40–8:00
End card.

### [ON-SCREEN TEXT] 7:40–8:00
> **Up next:** Secrets, basic auth, and environment variables

### [VO]
> Next lesson: lock down secrets and auth. See you there.

---

## Lesson 7.2 : Secrets and environment management *(7 min)*

### [SCREEN] 0:00–0:15
Title card.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 7.2 : Secrets management**

### [VO]
> Short lesson. Five rules for not leaking your Daraja secrets.

### [SCREEN] 0:15–1:30
Rule 1: Never commit secrets.

### [ON-SCREEN TEXT] 0:15–1:30
> **Rule 1: .gitignore .env**
> Only commit .env.example.
> Rotate immediately if committed by mistake.

### [VO]
> Rule one: never commit dot env to Git. Our dot gitignore excludes it. If you accidentally commit, GitHub's secret-scanning will catch Consumer Keys and alert you. Immediately rotate the credential in the Daraja portal — don't just revert the commit. Git history keeps the old value forever.

### [SCREEN] 1:30–2:30
Rule 2: Permissions.

### [ON-SCREEN TEXT] 1:30–2:30
> **Rule 2: `chmod 600 .env`**
> Only root readable.
> No shell shortcuts, no shared logins.

### [VO]
> Rule two: file permissions. On the VPS: chmod six hundred dot env. Owned by root. No other user can read. If you have teammates with SSH access, they shouldn't need credentials to debug n8n — they can read from the running container's env with "docker compose exec".

### [SCREEN] 2:30–3:30
Rule 3: Strong N8N auth.

### [ON-SCREEN TEXT] 2:30–3:30
> **Rule 3: Strong N8N basic auth + owner password**
> 20+ character random strings.
> Store in password manager.

### [VO]
> Rule three: strong n8n auth. The basic auth username and password that gates HTTPS access. The owner account email and password. Both long, both random, both in a password manager. If someone brute-forces into your n8n, they can read every workflow — and your Daraja credentials sit inside workflow Code nodes.

### [SCREEN] 3:30–5:00
Rule 4: Rotate the encryption key with care.

### [ON-SCREEN TEXT] 3:30–5:00
> **Rule 4: Don't change N8N_ENCRYPTION_KEY**
> After initial setup, encrypted credentials become unreadable.
> If you MUST rotate, export → re-import credentials.

### [VO]
> Rule four: don't change the encryption key after initial setup. n8n encrypts stored credentials — like database passwords and SMTP keys — with this key. Change the key and existing credentials are unreadable, workflows fail silently.
>
> [PAUSE 1s]
>
> If you absolutely must rotate — because of a suspected leak — the process is: export credentials, change the key, re-import credentials, re-authorize OAuth integrations. Painful. Avoid.

### [SCREEN] 5:00–6:00
Rule 5: Rotate Daraja secrets quarterly.

### [ON-SCREEN TEXT] 5:00–6:00
> **Rule 5: Rotate Consumer Secret every 90 days**
> Daraja portal → Regenerate.
> Update `.env`, restart n8n.

### [VO]
> Rule five: rotate your Daraja Consumer Secret every ninety days or sooner. The Daraja portal has a "regenerate" button. Click it, grab the new secret, paste into dot env, docker compose up dash d to restart n8n. Downtime: thirty seconds.
>
> [PAUSE 1s]
>
> Make it a calendar event. Set it and forget it. Credential hygiene is one of those things nobody notices until it saves you after a breach.

### [SCREEN] 6:00–7:00
End card.

### [ON-SCREEN TEXT] 6:00–7:00
> **Up next:** Rate limiting and abuse prevention

### [VO]
> Secrets locked. Next: rate limiting at the Nginx layer. See you there.

---

## Lesson 7.3 : Rate limiting and abuse prevention *(7 min)*

### [SCREEN] 0:00–0:15
Open the Nginx config file.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 7.3 : Nginx rate limits**

### [VO]
> If your webhook is public — which it must be — bots will find it. Not malicious bots necessarily. Just the Internet's background hum of scanners. Plus the one angry customer who thinks spamming "pay" fifty times will somehow work. Rate limiting at Nginx stops both.

### [SCREEN] 0:15–2:00
Add rate limiting zones to Nginx.

### [ON-SCREEN TEXT] 0:15–2:00
> ```nginx
> # In http { } block:
> limit_req_zone $binary_remote_addr zone=stk:10m rate=5r/s;
> limit_req_zone $binary_remote_addr zone=webhook_general:10m rate=20r/s;
> ```

### [VO]
> At the top of your Nginx config, define two zones. "stk" allows five requests per second per IP, with a ten-megabyte memory bucket — enough for about one hundred and sixty thousand distinct IPs. "webhook_general" allows twenty per second for other endpoints.
>
> [PAUSE 1s]
>
> Five per second per IP is generous for real users and brutal for bots. A real customer clicks "pay" once. A bot hammering tries hundreds per second.

### [SCREEN] 2:00–3:30
Apply zones to specific locations.

### [ON-SCREEN TEXT] 2:00–3:30
> ```nginx
> location /webhook/mpesa/stk-push {
>   limit_req zone=stk burst=10 nodelay;
>   proxy_pass http://127.0.0.1:5678;
> }
> 
> location /webhook/mpesa/stk-callback {
>   # No limit — this is Safaricom
>   proxy_pass http://127.0.0.1:5678;
> }
> ```

### [VO]
> Apply the zone to the STK push location. Burst ten means allow sudden spikes of up to ten extra requests before enforcing the rate.
>
> [PAUSE 1s]
>
> Important: do NOT rate-limit the callback endpoint. Safaricom legitimately bursts callbacks when many customers pay simultaneously. Limiting that endpoint would drop legitimate callbacks and cost you money.
>
> [PAUSE 1s]
>
> Reload Nginx: nginx dash s reload. Rate limiting is live.

### [SCREEN] 3:30–4:30
Install fail2ban.

### [ON-SCREEN TEXT] 3:30–4:30
> ```bash
> apt install -y fail2ban
> # /etc/fail2ban/jail.local
> [sshd]
> enabled = true
> maxretry = 3
> findtime = 10m
> bantime = 1h
> ```

### [VO]
> Second layer: fail2ban. Blocks IPs that fail SSH login three times in ten minutes for an hour. Prevents brute-force logins against your VPS.
>
> [PAUSE 1s]
>
> You can also configure fail2ban to watch Nginx logs for excessive four-hundreds and ban those IPs. More complex, but worth it on exposed webhooks.

### [SCREEN] 4:30–5:30
Webhook authentication (optional).

### [ON-SCREEN TEXT] 4:30–5:30
> **Optional: Webhook auth**
> Webhook node → Authentication: Header
> Header: `X-API-Key`, Value: random string
> Frontend must include header.

### [VO]
> Third layer: webhook authentication. In the Webhook node, Authentication dropdown has "Header Auth" option. Set a required header — like X dash API dash key — and a required value. Any request without that header gets a four-oh-one. Any request from your frontend includes the header. Simple shared secret.
>
> [PAUSE 1s]
>
> Not world-class security — the key is in your frontend's JavaScript if it's a browser app, so anyone can extract it. But it filters out ninety-nine percent of random Internet traffic, which is the actual threat here.

### [SCREEN] 5:30–6:30
UFW firewall review.

### [VO]
> Firewall review. UFW allow SSH, eighty, four four three. Nothing else. In particular, do NOT expose Postgres port five four three two publicly. If you ever need remote DB access, SSH tunnel in — never open the port.

### [SCREEN] 6:30–7:00
End card.

### [ON-SCREEN TEXT] 6:30–7:00
> **Up next:** Monitoring and alerting

### [VO]
> Abuse prevention done. Next: knowing when something breaks. See you there.

---

## Lesson 7.4 : Monitoring and alerting *(9 min)*

### [SCREEN] 0:00–0:15
Title card.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 7.4 : Observability**

### [VO]
> Three questions you must be able to answer at any moment. One: is my n8n up right now? Two: are my recent transactions succeeding? Three: did Safaricom's callbacks arrive today? If any of those answers are "no", someone needs to know fast.

### [SCREEN] 0:15–1:30
Uptime monitoring with UptimeRobot.

### [ON-SCREEN TEXT] 0:15–1:30
> **Uptime: UptimeRobot (free)**
> Monitor: https://your-domain/healthz
> Interval: 5 min
> Alert: email + SMS

### [VO]
> Uptime first. UptimeRobot — free for up to fifty monitors. Add a check on your domain slash healthz — our Nginx config returns two hundred for that path. Interval five minutes. Alerts: email and SMS.
>
> [PAUSE 1s]
>
> If your VPS goes down, UptimeRobot pings you within ten minutes. If your Daraja webhook returns five hundred for too long, Safaricom notices before you do. Reactive, but much better than nothing.

### [SCREEN] 1:30–3:00
n8n Error Trigger workflow.

### [ON-SCREEN TEXT] 1:30–3:00
> **Error Trigger workflow:**
> Fires on ANY failed execution.
> Sends to Slack / email / SMS.

### [VO]
> Second: in-app errors. n8n has a special trigger called "Error Trigger". A workflow using it fires whenever any OTHER workflow fails. One Error workflow protects every other workflow in your instance.
>
> [PAUSE 1s]
>
> Set it up: new workflow, add Error Trigger, add Slack node — or email node — with a message templating in the failing workflow's name, the error message, and a link back to the execution. Save, activate. Done. Any failure in STK push, callback, reconciliation, daily report — anywhere — you get a Slack notification within seconds.

### [SCREEN] 3:00–4:30
Transaction-level alerting.

### [ON-SCREEN TEXT] 3:00–4:30
> **Alert: >5 failed TX in 10 min**
> Query every minute.
> If count > threshold, Slack + ops email.

### [VO]
> Third: business-level alerting. A workflow that queries the transactions table every minute. If more than five failures in the last ten minutes, Slack ops. Something is wrong with the integration — maybe your float ran out, maybe Daraja is down.
>
> [PAUSE 1s]
>
> Build it just like the reconciliation workflow but with a different query. Simple threshold alert. Prevents you from discovering a four-hour outage from an angry customer tweet.

### [SCREEN] 4:30–6:00
Grafana + Postgres dashboard (optional).

### [VO]
> Optional: a real dashboard. Install Grafana as a second container in your docker compose. Connect it to the same Postgres. Build panels: transactions per hour, success rate, average time to resolve, revenue over time.
>
> [PAUSE 1s]
>
> Half a day of work. Massive impact on your ability to run the business. The handbook has a sample Grafana dashboard JSON you can import directly.

### [SCREEN] 6:00–7:30
Log retention.

### [ON-SCREEN TEXT] 6:00–7:30
> **n8n execution log pruning:**
> `N8N_EXECUTIONS_DATA_PRUNE=true`
> `N8N_EXECUTIONS_DATA_MAX_AGE=336` (hours = 14 days)
> `N8N_EXECUTIONS_DATA_MAX_COUNT=50000`

### [VO]
> Log retention. By default, n8n keeps every execution forever. On a busy integration, this fills your disk in weeks.
>
> [PAUSE 1s]
>
> Add three env vars. N8N_EXECUTIONS_DATA_PRUNE equals true. MAX_AGE equals three thirty six — two weeks in hours. MAX_COUNT equals fifty thousand. n8n auto-prunes anything older. Disk stays flat.
>
> [PAUSE 1s]
>
> If you want longer retention for compliance, offload executions to an external data warehouse before pruning. We don't cover that in the course, but it's a worthwhile improvement for banks and SACCOs.

### [SCREEN] 7:30–8:30
Backup strategy.

### [ON-SCREEN TEXT] 7:30–8:30
> **Nightly backup:**
> `pg_dump` → S3 / Backblaze B2
> `n8n_data/` volume → same
> Test restore quarterly.

### [VO]
> Backups. One cron job. Pg_dump the whole database at two AM. Upload to S3 or Backblaze B2 — Backblaze is cheaper, under a dollar a month for most businesses. Rotate: keep seven daily, four weekly, twelve monthly.
>
> [PAUSE 1s]
>
> Also backup n8n_data — the folder with your workflow JSONs and credentials. Encrypted with your N8N_ENCRYPTION_KEY, so safe-ish to store off-site.
>
> [PAUSE 1s]
>
> Test the restore quarterly. A backup you never tested is not a backup. Spin up a staging VPS, restore from last night's backup, verify the workflows run. Yes it takes an hour. Yes it's worth it.

### [SCREEN] 8:30–9:00
End card.

### [ON-SCREEN TEXT] 8:30–9:00
> **Up next:** Going live checklist

### [VO]
> Observability done. One last lesson: the final checklist before switching sandbox to production. See you there.

---

## Lesson 7.5 : The go-live checklist *(9 min)*

### [SCREEN] 0:00–0:15
Open docs/go-live-checklist.pdf on screen.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 7.5 : Going live**

### [VO]
> Walk through the printable go-live checklist from the docs folder. Six sections. Thirty-ish checkboxes. All of them matter.

### [SCREEN] 0:15–2:00
Section 1: Daraja prerequisites.

### [VO]
> Section one: Daraja. Production app approved. Business shortcode allocated. Production Consumer Key, Secret, and Passkey received. Callback URL registered with Safaricom. If required, your VPS IP whitelisted. Go-live letter on file.
>
> [PAUSE 1s]
>
> Of all of these, the one people miss is the IP whitelist. Depending on your account manager, Safaricom may require you to tell them which IP will receive callbacks before they'll approve the shortcode for production. Ask explicitly. Answer varies.

### [SCREEN] 2:00–3:30
Section 2: Infrastructure.

### [VO]
> Section two: infrastructure. VPS at two GB RAM minimum. Domain pointing to the IP. HTTPS cert valid and auto-renew tested — Let's Encrypt renews automatically, but verify. NTP synchronized. Timezone Africa Nairobi. Firewall closed to everything except SSH, eighty, four four three. Fail2ban installed.
>
> [PAUSE 1s]
>
> The NTP one is the single most important technical check. We've talked about clock drift before. Verify with timedatectl status that time is synchronized. If "yes" — proceed.

### [SCREEN] 3:30–4:30
Section 3: Secrets.

### [VO]
> Section three: secrets. Dot env permissions six hundred. Fresh thirty-two-character encryption key, not the default. Strong n8n basic auth password. Postgres password rotated. Sandbox creds removed from env. Secrets backed up in a password manager.
>
> [PAUSE 1s]
>
> Removing sandbox creds matters. You don't want a human — including yourself at two AM — accidentally hitting sandbox from the production box because an old env var was still set.

### [SCREEN] 4:30–6:00
Section 4: Pre-flight test.

### [VO]
> Section four: pre-flight. On production credentials with a tiny real amount — one shilling.
>
> [PAUSE 1s]
>
> OAuth token retrieved. STK push triggers prompt on your actual phone. You enter PIN. Callback arrives. Database row shows success with a real M-Pesa receipt number. Reconciliation workflow runs on schedule. Cancelled transaction gets marked cancelled correctly within seven minutes.
>
> [PAUSE 1s]
>
> If any single step fails, STOP. Fix. Re-test. Do not proceed to launch.

### [SCREEN] 6:00–7:00
Section 5: Monitoring and alerting.

### [VO]
> Section five: monitoring. Error Trigger workflow active. Postgres backup job scheduled daily. Backup restore tested at least once. Uptime monitor on your callback URL. Threshold alert on five-plus failed transactions in ten minutes.

### [SCREEN] 7:00–7:40
Section 6: Operational.

### [VO]
> Section six: operational. On-call rotation defined — who gets paged when things break at midnight. Runbook for "callbacks not arriving" — a one-page doc the on-call person can follow without thinking. Customer support can look up a transaction by phone or receipt. Finance gets the daily report email.

### [SCREEN] 7:40–8:30
Section 7: Compliance (Kenya DPA).

### [VO]
> Section seven: compliance. Kenya's Data Protection Act twenty-nineteen applies if you process more than ten thousand records. Privacy policy mentions M-Pesa data handling. Transaction logs retention policy defined — Safaricom recommends seven years. Customer phone numbers encrypted at rest if practical.
>
> [PAUSE 1s]
>
> The ODPC registration — Office of the Data Protection Commissioner — is often skipped, but required for formal businesses. Half a day of paperwork. Protects you from fines.

### [SCREEN] 8:30–9:00
End card. Module 7 summary.

### [ON-SCREEN TEXT] 8:30–9:00
> **Module 7 recap:**
> ✅ VPS provisioned & secured
> ✅ HTTPS, firewall, fail2ban
> ✅ Rate limits + webhook auth
> ✅ Monitoring + alerts + backups
> ✅ Go-live checklist printed and ticked

### [VO]
> Module seven done. You're production ready. Next up: module eight, real-world use cases. We'll build five complete integrations end to end. See you there.

---

## Recording checklist for Module 7

- [ ] Fresh Hetzner VPS available for deploy demo
- [ ] Domain available (`course-demo.yourdomain.co.ke`) for cert demo
- [ ] UptimeRobot free account ready
- [ ] Grafana sample dashboard JSON ready for import demo
- [ ] Go-live checklist PDF open on screen for the final lesson

