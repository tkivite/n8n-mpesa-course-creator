# Module 6 : Status Query and Reconciliation

**Target runtime:** ~30 min · **Lessons:** 4 · **Combined word count:** ~4,100

---

## Lesson 6.1 : Why reconciliation matters *(6 min)*

### [SCREEN] 0:00–0:15
Title card.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 6.1 : The missing callback problem**

### [VO]
> Welcome to module six. In production, roughly one to three percent of Safaricom callbacks never arrive. Network blips. Your server was redeploying. ngrok tunnel reset. Someone's upstream load balancer glitched. These transactions get stuck as "pending" forever if you rely only on callbacks.
>
> [PAUSE 1s]
>
> This module solves that. We build a workflow that polls Daraja for the real status of every pending transaction and reconciles your database. Set and forget. Sleeps while you sleep.

### [SCREEN] 0:30–1:30
Chart: pending transactions resolved by callback vs reconciliation over time.

### [B-ROLL]
Animated bar chart showing 97% resolved by callback, 3% resolved by reconciliation.

### [VO]
> Here's the mental model. Callback is the fast path — ninety-seven percent of transactions resolve in two to three seconds via callback. Reconciliation is the slow path — one to three percent resolve within five minutes via polling. Together, you catch one hundred percent of transactions.
>
> [PAUSE 1s]
>
> If you only have callbacks, you lose three percent of your revenue to confused customers who paid but your system says they didn't. If you only have polling, every transaction takes thirty seconds to resolve, which feels broken. You need both.

### [SCREEN] 1:30–2:30
The stkpushquery endpoint explained.

### [ON-SCREEN TEXT] 1:30–2:30
> **POST `/mpesa/stkpushquery/v1/query`**
> Payload: BusinessShortCode, Password, Timestamp, CheckoutRequestID
> Response: ResultCode, ResultDesc (same codes as callback)

### [VO]
> The tool is stkpushquery. POST endpoint. You give it a BusinessShortCode, a Password, a Timestamp — same formula as STK push — and a CheckoutRequestID.
>
> [PAUSE 1s]
>
> Response: a ResultCode and ResultDesc using the same code table as callbacks. Zero for success. One-oh-three-two for cancelled. Etcetera. The response is synchronous — no callback for the query itself.

### [SCREEN] 2:30–4:00
Important gotchas with stkpushquery.

### [ON-SCREEN TEXT] 2:30–4:00
> **Gotchas:**
> • Only works within ~2 hours of original request
> • "Transaction being processed" response = still pending
> • Rate limit: don't poll aggressively
> • Must use SAME Password formula

### [VO]
> Three gotchas before we write code.
>
> [PAUSE 1s]
>
> One: stkpushquery only works for transactions less than about two hours old. After that, Safaricom's system no longer has state for the CheckoutRequestID. For older stuck transactions, there's no API — you'd have to go to Safaricom support with the receipt. That's why our reconciliation workflow filters by created_at within twenty-four hours — not realistic to recover older, but a safety ceiling.
>
> [PAUSE 1s]
>
> Two: if the transaction is still being processed — customer is literally in the middle of entering PIN — Daraja returns a ResultCode of "transaction being processed". Treat this as "still pending, try again later". Don't mark it failed.
>
> [PAUSE 1s]
>
> Three: rate limits. Don't poll aggressively. If you have five hundred pending transactions and query all of them every five seconds, Safaricom will rate limit you. We'll poll every five minutes with a two-minute minimum age. Reasonable.

### [SCREEN] 4:00–5:00
Design decision: push callbacks and reconciliation share the same handling.

### [VO]
> Design choice. The response from stkpushquery has the same ResultCode semantics as the callback. We can reuse the same status mapping logic. So when a reconciliation query resolves, we update the row the same way the callback would have. The customer gets the same confirmation. Downstream reporting doesn't care which path resolved it.
>
> [PAUSE 1s]
>
> Beautiful consequence: your code treats callback and reconciliation as interchangeable. Add a column to the transaction table called "resolved_by" with values "callback" or "reconciliation" if you want to know how each one was resolved. Optional, but useful for monitoring.

### [SCREEN] 5:00–5:50
End card.

### [ON-SCREEN TEXT] 5:00–5:50
> **Up next:** Building the reconciliation workflow

### [VO]
> Next lesson, we build the workflow. See you there.

---

## Lesson 6.2 : Building the reconciliation workflow *(10 min)*

### [SCREEN] 0:00–0:15
Import `04-reconciliation.json`.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 6.2 : The polling workflow**

### [VO]
> Import zero-four dash reconciliation dot json. Six nodes. Quick walkthrough.

### [SCREEN] 0:15–1:30
Node 1: Schedule Trigger, every 5 min.

### [VO]
> Node one: Schedule Trigger. Interval: every five minutes. Why five? Fast enough to catch missed callbacks quickly, slow enough to avoid rate limiting. If your business is high-volume, you could tune this down to one minute. If low-volume, every ten minutes is fine.

### [SCREEN] 1:30–3:00
Node 2: Postgres query to find pending transactions.

### [ON-SCREEN TEXT] 1:30–3:00
> ```sql
> SELECT checkout_request_id, reference, phone, amount
> FROM mpesa_transactions
> WHERE status = 'pending'
>   AND created_at < NOW() - INTERVAL '2 minutes'
>   AND created_at > NOW() - INTERVAL '24 hours'
> LIMIT 50;
> ```

### [VO]
> Node two: find pending transactions. SELECT where status is pending, created at least two minutes ago, created at most twenty-four hours ago. Limit fifty.
>
> [PAUSE 1s]
>
> The two-minute floor matters. If a transaction was created thirty seconds ago, give the callback a chance to arrive before you query. Querying too fast wastes Daraja calls and risks a race with the incoming callback.
>
> [PAUSE 1s]
>
> The twenty-four-hour ceiling matters because stkpushquery only works for ~two hours. Anything older is unrecoverable by this workflow — we'll handle those separately with a manual review process.
>
> [PAUSE 1s]
>
> Limit fifty prevents us from drowning Daraja with a massive backlog on first-run after an outage.

### [SCREEN] 3:00–3:30
Node 3: Execute Workflow — get token.

### [VO]
> Node three: Execute Workflow — our auth sub-workflow. One token per batch of fifty. Cached. Fast.

### [SCREEN] 3:30–5:00
Node 4: Build Query Payloads. Code node that fans out one payload per pending row.

### [ON-SCREEN TEXT] 3:30–5:00
> ```js
> const token = $json.access_token;
> const pending = $('Find Pending TX').all();
> const shortcode = $env.MPESA_SHORTCODE;
> const passkey = $env.MPESA_PASSKEY;
> const baseUrl = $env.MPESA_BASE_URL;
> // (timestamp + password computation)
> return pending.map(p => ({
>   json: {
>     url: `${baseUrl}/mpesa/stkpushquery/v1/query`,
>     authHeader: `Bearer ${token}`,
>     checkout_request_id: p.json.checkout_request_id,
>     payload: {
>       BusinessShortCode: parseInt(shortcode, 10),
>       Password: password,
>       Timestamp: timestamp,
>       CheckoutRequestID: p.json.checkout_request_id
>     }
>   }
> }));
> ```

### [VO]
> Node four: Code node that fans out. Takes the single token and the array of pending rows, computes one timestamp and one password — reused across all queries in this batch — and returns an array of items. One item per pending transaction.
>
> [PAUSE 1s]
>
> Remember from module one: n8n runs the next node once per item. So this one Code node returns fifty items, and the next node — the HTTP Request — fires fifty parallel queries.

### [SCREEN] 5:00–6:00
Node 5: HTTP Request node, fires in parallel.

### [VO]
> Node five: HTTP Request. POST to the url, authHeader as Authorization, body is the payload stringified. Same pattern as the STK push HTTP node.
>
> [PAUSE 1s]
>
> Here's the magic: because the previous node emitted an array of items, this node runs once per item in parallel. All fifty queries fire more or less simultaneously. Daraja usually handles the burst fine.
>
> [PAUSE 1s]
>
> If you want to rate-limit, add a "Loop Over Items" node or a Wait between queries. For most businesses this isn't necessary.

### [SCREEN] 6:00–7:30
Node 6: Update DB based on each query's result.

### [ON-SCREEN TEXT] 6:00–7:30
> ```sql
> UPDATE mpesa_transactions
> SET status = CASE
>   WHEN $1 = '0' THEN 'success'
>   WHEN $1 = '1032' THEN 'cancelled'
>   WHEN $1 IS NULL THEN status
>   ELSE 'failed'
> END,
>     result_code = $1,
>     result_desc = $2,
>     updated_at = NOW()
> WHERE checkout_request_id = $3
> RETURNING *;
> ```

### [VO]
> Node six: Postgres update. SQL has a CASE expression that maps ResultCode to our status enum. Zero becomes success. One-oh-three-two becomes cancelled. Null — meaning we got an error from Daraja, not a resolved status — leaves the row unchanged. Anything else becomes failed.
>
> [PAUSE 1s]
>
> The "null leaves unchanged" branch is important. If Daraja returned "transaction being processed", we don't want to mark the row as failed — we want to let the next poll five minutes later try again. So the Build Query Payloads Code node should also normalize that case: if the response from Daraja is a "still processing" state, output a null-ish ResultCode so the UPDATE skips.

### [SCREEN] 7:30–8:30
Save and activate. Observe first run.

### [VO]
> Save, activate. First run fires five minutes from now. Or click "Execute Workflow" to force-run immediately. Observe: find pending TX returns however many pending rows exist. Updates batch-apply. Rows flip from pending to success or cancelled.

### [SCREEN] 8:30–9:30
Observe idempotency with callback workflow.

### [VO]
> Important: this workflow and the callback workflow can race each other. Imagine a callback arrives at exactly the same moment as a reconciliation query resolves.
>
> [PAUSE 1s]
>
> Both update the row to the same status. Idempotent. No harm done. The customer may get two confirmations if we're not careful. Fix: add "AND status equals pending" to the UPDATE in both workflows — the second one to arrive sees status is no longer pending and no-ops.

### [SCREEN] 9:30–10:00
End card.

### [ON-SCREEN TEXT] 9:30–10:00
> **Up next:** Daily reconciliation reports

### [VO]
> Core polling done. Next lesson, we add a daily report that keeps finance happy. See you there.

---

## Lesson 6.3 : Daily reconciliation reports *(7 min)*

### [SCREEN] 0:00–0:15
New workflow: "Daily M-Pesa Report".

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 6.3 : Finance-ready daily reports**

### [VO]
> Short lesson. New workflow. Daily cron at six AM Nairobi time. Queries the previous day's transactions. Emails a summary to finance. Twenty minutes of work. Enormous business value.

### [SCREEN] 0:15–1:30
Schedule Trigger with cron: `0 6 * * *`.

### [VO]
> Schedule Trigger. Cron expression: zero six star star star — meaning every day at six AM. n8n honors the GENERIC_TIMEZONE env var we set to Africa Nairobi, so this fires at six AM Nairobi, not UTC.

### [SCREEN] 1:30–2:30
Postgres query against the daily summary view.

### [ON-SCREEN TEXT] 1:30–2:30
> ```sql
> SELECT * FROM mpesa_daily_summary
> WHERE day = CURRENT_DATE - INTERVAL '1 day';
> ```

### [VO]
> Postgres node. Query our pre-built view mpesa_daily_summary — remember from the schema, we defined that in module zero. It aggregates by day and status.
>
> [PAUSE 1s]
>
> Filter: yesterday's day. The view is populated as transactions happen, so this query is nearly instant even on millions of rows.

### [SCREEN] 2:30–4:00
Build the report HTML with a Code node.

### [ON-SCREEN TEXT] 2:30–4:00
> ```js
> const rows = $input.all().map(i => i.json);
> const totals = rows.reduce((acc, r) => {
>   acc.count += r.tx_count;
>   acc.amount += parseFloat(r.total_amount);
>   return acc;
> }, { count: 0, amount: 0 });
> const html = `
>   <h2>M-Pesa Daily Report — ${rows[0]?.day}</h2>
>   <p>Total: ${totals.count} transactions · KES ${totals.amount.toLocaleString()}</p>
>   <table border="1">
>     <tr><th>Status</th><th>Count</th><th>Amount</th></tr>
>     ${rows.map(r => `<tr><td>${r.status}</td><td>${r.tx_count}</td><td>${r.total_amount}</td></tr>`).join('')}
>   </table>
> `;
> return [{ json: { html, subject: `M-Pesa Report ${rows[0]?.day}` } }];
> ```

### [VO]
> Code node builds an HTML email body. Sum the counts and amounts, render a simple table. If finance wants CSV, write a second Code node that returns comma-separated instead.

### [SCREEN] 4:00–5:00
Email Send node with the HTML.

### [VO]
> Send Email node. To: finance at your company. From: ops. Subject: dollar json dot subject. HTML body: dollar json dot html. Enable "send as HTML". Done.

### [SCREEN] 5:00–6:00
Optional: upload CSV to Google Drive.

### [VO]
> Optional upgrade: upload a CSV copy to Google Drive. n8n has a Google Drive node. One click to create credentials. Append the CSV to a shared folder named "mpesa reports". Finance can download anytime, you have an off-site backup.

### [SCREEN] 6:00–7:00
Test by force-running the workflow.

### [VO]
> Test it. Click "execute workflow". Email arrives. If you have no transactions from yesterday, the email will say "no data" — that's intentional. Finance still gets confirmation the system is running.

### [SCREEN] 7:00–7:20
End card.

### [ON-SCREEN TEXT] 7:00–7:20
> **Up next:** Handling stuck transactions

### [VO]
> Finance covered. Next and final lesson of module six: what to do when a transaction is older than twenty-four hours and still pending. See you there.

---

## Lesson 6.4 : Handling stuck transactions *(7 min)*

### [SCREEN] 0:00–0:15
Title card.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 6.4 : Stuck transaction playbook**

### [VO]
> Rare case. A transaction has been pending for more than twenty-four hours. The reconciliation workflow stopped trying because stkpushquery no longer works for it. What now? Three strategies, in order of effort.

### [SCREEN] 0:15–1:30
Strategy 1: Timeout sweep.

### [ON-SCREEN TEXT] 0:15–1:30
> **Strategy 1: Auto-timeout after 24h**
> Mark pending → timeout.
> Customer can retry via UI.

### [VO]
> Strategy one: auto-timeout. Build another scheduled workflow — once an hour — that finds pending transactions older than twenty-four hours and marks them timeout. The customer-facing UI can show "we didn't receive confirmation of this payment — if you believe you paid, please contact support".
>
> [PAUSE 1s]
>
> Safe choice for ninety percent of businesses. Rare that these are actually successful payments. Easy to handle manually when they are.

### [SCREEN] 1:30–3:00
Strategy 2: Transaction status API.

### [ON-SCREEN TEXT] 1:30–3:00
> **Strategy 2: Transaction Status API**
> `POST /mpesa/transactionstatus/v1/query`
> Works for weeks-old transactions.
> Requires InitiatorName + SecurityCredential (prod only).

### [VO]
> Strategy two: Daraja's transaction status API. Different endpoint from stkpushquery. Works for weeks-old transactions. More expensive to set up — it requires an InitiatorName and an encrypted SecurityCredential — but it's the only way to recover ancient stuck transactions programmatically.
>
> [PAUSE 1s]
>
> We don't build this in the course because setup is production-only, but the handbook has notes. Add it when you need it.

### [SCREEN] 3:00–4:30
Strategy 3: Manual CS portal.

### [ON-SCREEN TEXT] 3:00–4:30
> **Strategy 3: CS lookup portal**
> Internal UI: input phone + date range
> Query by phone/amount/reference
> One-click resolve

### [VO]
> Strategy three: an internal customer support portal. A simple web page where support can input a phone number and a date range, see any pending transactions, and resolve each one manually with a note.
>
> [PAUSE 1s]
>
> Build this as a Retool, Appsmith, or Budibase app pointed at your database. Half a day of work. CS loves it. Reduces "where's my money" tickets dramatically.

### [SCREEN] 4:30–5:30
Build the timeout sweep workflow.

### [VO]
> Let's build strategy one quickly. New workflow. Schedule hourly. One Postgres node:

### [ON-SCREEN TEXT] 4:30–5:30
> ```sql
> UPDATE mpesa_transactions
> SET status = 'timeout',
>     result_desc = 'Auto-marked after 24h with no resolution',
>     updated_at = NOW()
> WHERE status = 'pending'
>   AND created_at < NOW() - INTERVAL '24 hours'
> RETURNING id, phone, amount, reference;
> ```

### [VO]
> Update any pending transaction older than twenty-four hours to timeout. Return the affected rows so we can log.
>
> [PAUSE 1s]
>
> Second node: email ops with a daily digest of transactions that got auto-timed-out. Rare, but ops should know.

### [SCREEN] 5:30–6:30
Save and activate.

### [VO]
> Save, activate. First run happens in about an hour. Mostly it will do nothing — your reconciliation workflow should resolve most things within minutes. But over months of operation, this will catch the fringe cases that fall through.

### [SCREEN] 6:30–7:00
End card. Module 6 summary.

### [ON-SCREEN TEXT] 6:30–7:00
> **Module 6 recap:**
> ✅ Why reconciliation exists
> ✅ stkpushquery mechanics
> ✅ Polling workflow built
> ✅ Idempotency between callback & polling
> ✅ Daily finance report
> ✅ Stuck transaction playbook

### [VO]
> Module six done. Your M-Pesa integration is now bulletproof against lost callbacks and stuck transactions. Next up: module seven, hardening for production. See you there.

---

## Recording checklist for Module 6

- [ ] Reconciliation workflow imported
- [ ] Several pending transactions in DB for live demos
- [ ] psql pane for live SQL demonstrations
- [ ] Report email HTML pre-rendered sample ready

