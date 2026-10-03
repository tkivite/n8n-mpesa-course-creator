# Module 5 : Handling the Callback

**Target runtime:** ~45 min · **Lessons:** 5 · **Combined word count:** ~6,200

---

## Lesson 5.1 : Exposing a public callback URL *(10 min)*

### [SCREEN] 0:00–0:15
Title card.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 5.1 : Making your callback reachable**

### [VO]
> Welcome to module five. Over the next forty-five minutes we build the callback handler — the webhook that Safaricom hits with the final result of every STK push. Pending becomes paid. Paid becomes revenue. This is where the magic hardens into reality.
>
> [PAUSE 1s]
>
> First problem: Safaricom's servers can't reach your laptop. We need a public URL. Three options, in increasing order of production-worthiness.

### [SCREEN] 0:30–2:00
Option 1: ngrok. Show the docker-compose profile.

### [ON-SCREEN TEXT] 0:30–2:00
> **Option 1: ngrok (local dev)**
> `docker compose --profile tunnel up -d`
> Grab URL from `docker compose logs ngrok`

### [VO]
> Option one: ngrok. For local dev. In our docker-compose, there's an ngrok service behind a profile. Run docker compose dash dash profile tunnel up dash d. ngrok starts, opens a tunnel to your n8n container, and spits out a public URL in the logs.
>
> [PAUSE 1s]
>
> You need an ngrok auth token — free from dashboard dot ngrok dot com. Paste it into NGROK_AUTHTOKEN in dot env. On the free tier, the URL changes every restart. For paid plans — eight dollars a month — you get a reserved subdomain that stays the same forever.

### [SCREEN] 2:00–3:30
Grab the URL. Update `.env` with MPESA_CALLBACK_BASE_URL. Restart n8n.

### [VO]
> Grab the HTTPS URL from the ngrok logs. Looks like random dash subdomain dot ngrok dash free dot app. Paste it into MPESA_CALLBACK_BASE_URL in dot env.
>
> [PAUSE 1s]
>
> Restart n8n so the env change is picked up. docker compose up dash d — Docker only recreates services whose env changed.

### [SCREEN] 3:30–4:30
Verify callback URL works from external.

### [VO]
> Verify from outside your network. From a different machine, or just your phone's cellular connection, hit the ngrok URL plus slash webhook slash something. Should get an n8n response. If you get a connection refused, the tunnel isn't up.
>
> [PAUSE 1s]
>
> ngrok inspector at port forty forty is useful — docker compose logs show the URL, inspector shows every request that comes through. Great for debugging callbacks.

### [SCREEN] 4:30–5:30
Option 2: Cloudflare Tunnel.

### [ON-SCREEN TEXT] 4:30–5:30
> **Option 2: Cloudflare Tunnel**
> Free, stable URL, no ngrok dependency

### [VO]
> Option two: Cloudflare Tunnel. Free. Gives you a stable subdomain on your own Cloudflare account. No account expiry anxiety. If you already use Cloudflare DNS, this is cleaner than ngrok.
>
> [PAUSE 1s]
>
> Setup: install cloudflared, run cloudflared tunnel login, create a tunnel, map it to localhost five-six-seven-eight. Cloudflare gives you a stable URL. Three commands. Documented in the handbook.

### [SCREEN] 5:30–7:00
Option 3: VPS with a real domain.

### [ON-SCREEN TEXT] 5:30–7:00
> **Option 3: VPS + domain (production)**
> `deploy/vps-setup.sh yourdomain.co.ke you@email.com`

### [VO]
> Option three: a real VPS with a real domain. The only option acceptable for production, because that's what Safaricom requires for go-live.
>
> [PAUSE 1s]
>
> Our vps-setup script, which we'll run together in module seven, provisions a Hetzner box, installs n8n, Nginx, and Let's Encrypt certs in one command. Point your DNS at the box's IP, run the script, you're live in five minutes.

### [SCREEN] 7:00–8:30
Register the callback URL inside our STK Push payload. Show that it's dynamic from env.

### [VO]
> Important: your callback URL is passed in every single STK push payload, as the CallBackURL field. Not registered once with Daraja. Passed per request. That means you can have different callback URLs for different workflows, if you ever need to.
>
> [PAUSE 1s]
>
> We built this into the payload Code node in module four. It reads MPESA_CALLBACK_BASE_URL from env and appends slash webhook slash m pesa slash s t k dash callback. Change the env, change the URL. No code edit.

### [SCREEN] 8:30–9:30
Discuss production IP whitelisting.

### [ON-SCREEN TEXT] 8:30–9:30
> **Production IP whitelist (if required):**
> Safaricom publishes callback source IPs.
> Allow only those via `ufw` or your firewall.

### [VO]
> One production consideration. Some Safaricom shortcodes require you to tell them which IP will receive callbacks, so they can whitelist you. Other shortcodes don't care. Check with your business account manager during go-live.
>
> [PAUSE 1s]
>
> If they require it, you give them your VPS's IP. Hetzner, DigitalOcean — all these providers give you a static IP by default. You can also narrow your firewall so only Safaricom's known IPs can POST to your callback endpoint. The handbook has their current IP ranges.

### [SCREEN] 9:30–10:00
End card.

### [ON-SCREEN TEXT] 9:30–10:00
> **Up next:** The callback webhook

### [VO]
> URL exposed. Next lesson, we build the callback webhook that receives Safaricom's POST. See you there.

---

## Lesson 5.2 : Building the callback webhook *(10 min)*

### [SCREEN] 0:00–0:15
Open the course repo, import `03-stk-callback.json`.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 5.2 : The callback webhook**

### [VO]
> New workflow. Import zero three dash stk dash callback dot json from the course repo. Six nodes.

### [SCREEN] 0:15–1:30
Zoom into the Webhook node. Key setting: Response Mode = "On Received".

### [ON-SCREEN TEXT] 0:15–1:30
> **Webhook config:**
> Path: `mpesa/stk-callback`
> Method: POST
> **Response Mode: On Received** ← critical
> Response Data: `{"ResultCode":0,"ResultDesc":"Accepted"}`

### [VO]
> Node one: Webhook. Path matches what we set in our callback URL — mpesa slash stk dash callback. Method POST. Critical setting: Response Mode "On Received".
>
> [PAUSE 1s]
>
> On Received means: the moment the request arrives, send back a two hundred OK. Don't wait for downstream nodes to finish. Don't wait for the database write. Nothing. Just acknowledge, and process asynchronously.
>
> [PAUSE 1s]
>
> This is the single most important setting in this workflow. If you leave it on default — "last node" — Safaricom's thirty-second timeout kicks in when your database is slow and you lose callbacks. Set it to On Received. Move on.

### [SCREEN] 1:30–2:30
Response Data field with Safaricom's expected acknowledgment.

### [ON-SCREEN TEXT] 1:30–2:30
> ```json
> {"ResultCode": 0, "ResultDesc": "Accepted"}
> ```

### [VO]
> Response Data: Safaricom expects you to acknowledge with a JSON body containing ResultCode zero and ResultDesc "Accepted". It's not strictly enforced — a plain two hundred would work — but it's the documented format. Follow it.

### [SCREEN] 2:30–3:30
Parse Callback Code node.

### [ON-SCREEN TEXT] 2:30–3:30
> ```js
> const body = $json.body || $json;
> const cb = body?.Body?.stkCallback;
> if (!cb) throw new Error('Not a valid STK callback payload');
> const isSuccess = cb.ResultCode === 0;
> const meta = {};
> if (cb.CallbackMetadata?.Item) {
>   for (const item of cb.CallbackMetadata.Item) {
>     meta[item.Name] = item.Value;
>   }
> }
> return [{ json: {
>   checkout_request_id: cb.CheckoutRequestID,
>   merchant_request_id: cb.MerchantRequestID,
>   result_code: cb.ResultCode,
>   result_desc: cb.ResultDesc,
>   status: isSuccess ? 'success' : 'failed',
>   amount: meta.Amount || null,
>   mpesa_receipt_number: meta.MpesaReceiptNumber || null,
>   transaction_date: meta.TransactionDate ? String(meta.TransactionDate) : null,
>   phone_number: meta.PhoneNumber ? String(meta.PhoneNumber) : null,
>   raw: cb
> }}];
> ```

### [VO]
> Node two: Parse Callback. The gnarly nested structure we studied in lesson two point five. First, drill into Body dot stkCallback. If it's missing, throw — not a valid callback.
>
> [PAUSE 1s]
>
> If CallbackMetadata exists — meaning payment succeeded — iterate its Item array and flatten into a plain object keyed by Name. Now meta dot MpesaReceiptNumber is directly accessible instead of iterating.
>
> [PAUSE 1s]
>
> Return a flat, friendly object with all the fields we care about: checkout request ID for matching, status, amount, receipt, phone. Plus "raw" for the audit trail.

### [SCREEN] 3:30–4:30
Match callback to transaction with Postgres update.

### [ON-SCREEN TEXT] 3:30–4:30
> ```sql
> UPDATE mpesa_transactions
> SET status = $1,
>     result_code = $2,
>     result_desc = $3,
>     mpesa_receipt_number = $4,
>     transaction_date = $5,
>     updated_at = NOW()
> WHERE checkout_request_id = $6
> RETURNING *;
> ```

### [VO]
> Node three: Postgres, operation "execute query". Update the row where checkout_request_id matches, set status, result_code, result_desc, receipt number, transaction date. Return the updated row so downstream nodes can use it.
>
> [PAUSE 1s]
>
> Why update by checkout_request_id? Because that's the one identifier that's in both the STK push response and the callback. Safaricom guarantees it. Our schema has it unique indexed. One row updated per callback.

### [SCREEN] 4:30–6:00
Discuss idempotency.

### [ON-SCREEN TEXT] 4:30–6:00
> **Idempotency check (optional but recommended):**
> Only update if status = 'pending'.
> Prevents double-processing on retries.

### [VO]
> Important consideration: idempotency. Safaricom doesn't retry, but weird things happen. A reconciliation query might also update the row seconds before the callback arrives. Or someone pokes your callback URL with Postman as a test.
>
> [PAUSE 1s]
>
> Defensive move: add "AND status equals pending" to the WHERE clause. This way, if the row already has a resolved status, the update is a no-op. Zero rows returned. Downstream nodes see no data and skip the notification. No double receipts to the customer.
>
> [PAUSE 1s]
>
> I'd call this a production-grade upgrade. Add it when you deploy.

### [SCREEN] 6:00–7:30
Save callback audit log — separate table.

### [ON-SCREEN TEXT] 6:00–7:30
> **Also insert into `mpesa_callbacks` table:**
> Full raw payload, timestamp, source IP.
> Immutable audit trail.

### [VO]
> Second database write — the audit trail. Insert the raw callback payload into our mpesa_callbacks table. Never update that table. Append only. If a customer disputes a transaction two years from now, the full original Safaricom payload is still exactly there.
>
> [PAUSE 1s]
>
> Compliance teams love this. Finance teams love this. You should love this. One extra Postgres node, you're bulletproof.

### [SCREEN] 7:30–8:30
Branching: IF success / IF failure.

### [VO]
> Node four: an IF node. True branch for success. False branch for failures. We branch here because the handling is different. Success triggers a confirmation to the customer. Failure triggers an internal alert.

### [SCREEN] 8:30–9:30
Build the confirmation payload on the success branch.

### [VO]
> Success branch: Code node that builds a confirmation payload. Pull the row we just updated for the reference. Pull the parsed callback for the receipt and amount. Build a string: "Hi, we received your payment of KES amount. Receipt: receipt. Reference: reference. Thank you."
>
> [PAUSE 1s]
>
> This payload then feeds into Email, SMS, WhatsApp — whatever channel you use. We'll wire up WhatsApp in module eight.

### [SCREEN] 9:30–10:00
End card.

### [ON-SCREEN TEXT] 9:30–10:00
> **Up next:** Sending notifications

### [VO]
> Callback captured, DB updated, audit logged, branches split. Next lesson, we send the customer a confirmation.

---

## Lesson 5.3 : Sending the confirmation *(8 min)*

### [SCREEN] 0:00–0:15
After the success branch Code node, discuss notification channels.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 5.3 : Confirming the payment**

### [VO]
> We have the confirmation payload. Now, how do we deliver it? Four common options for Kenyan businesses. Email, SMS, WhatsApp, and Slack to internal ops. Let's build email first — simplest — then WhatsApp.

### [SCREEN] 0:15–1:30
Add an Email Send node. Configure SMTP credential (Gmail app password or SendGrid).

### [VO]
> Email first. Add the "Send Email" node. Credential: SMTP. If you use Gmail, create an app password at myaccount dot google dot com slash security. Host smtp dot gmail dot com, port five-eight-seven. SSL/TLS enabled.
>
> [PAUSE 1s]
>
> From address: whatever your business email is. To address: an expression pulling from our confirmation payload. For now, you'll need the customer's email — not something Daraja gives you — so this assumes you have it from their account registration.
>
> [PAUSE 1s]
>
> Subject: curly braces dollar json dot subject. Body: curly braces dollar json dot message.

### [SCREEN] 1:30–2:30
Add SMS via Twilio or Africa's Talking.

### [VO]
> SMS is often more valuable than email for Kenyan customers — most people read SMS, not all read email. Africa's Talking is the local option, roughly a shilling per SMS.
>
> [PAUSE 1s]
>
> There's no built-in Africa's Talking n8n node, but HTTP Request works fine. POST to api dot africastalking dot com slash restricted slash sendfromstore. Form-encoded body with "to" and "message". Header "api key" with your API key.

### [SCREEN] 2:30–4:00
Build WhatsApp confirmation via Cloud API.

### [ON-SCREEN TEXT] 2:30–4:00
> **WhatsApp Cloud API:**
> `POST https://graph.facebook.com/v18.0/{phone_number_id}/messages`
> Auth: Bearer <PERMANENT_TOKEN>
> Template message, pre-approved

### [VO]
> WhatsApp is the fancy one. For transactional messages — payment confirmations — Meta requires you to use a pre-approved template. You create the template in Meta Business Suite, Meta reviews it in twenty-four hours, then you can send it to anyone.
>
> [PAUSE 1s]
>
> HTTP Request node. POST to graph dot facebook dot com slash v eighteen slash your phone number ID slash messages. Bearer token in Authorization. Body is a specific JSON shape — template name, language code, and components containing your variable values.
>
> [PAUSE 1s]
>
> We'll build the full template config in module eight's WhatsApp bot use case. For now, add the HTTP Request node skeleton.

### [SCREEN] 4:00–5:00
Discuss ops notifications.

### [VO]
> Fourth channel: ops notifications. Not for the customer. For your team. When a payment fails for an interesting reason — like insufficient float on your till — ops needs to know fast.
>
> [PAUSE 1s]
>
> On the failure branch of our IF node, add a Slack node — or an email to ops — with the error details. Include checkout request ID, reference, phone, result code, and result desc. Ops has everything they need to investigate without logging into n8n.

### [SCREEN] 5:00–6:30
Full workflow end-to-end: fire a test callback with Postman, see email arrive.

### [VO]
> Let's test. Postman has the "Simulate Safaricom Callback" request. Fire it with ResultCode zero. Watch n8n executions light up. The row in Postgres flips from pending to success. The email arrives in your inbox. End to end, under two seconds.

### [SCREEN] 6:30–7:30
Test the failure case.

### [VO]
> Now fire the "simulate cancelled" request. Row updates to cancelled. No customer email. Ops alert fires. Different flow, same workflow. The IF branching handled it cleanly.

### [SCREEN] 7:30–8:00
End card.

### [ON-SCREEN TEXT] 7:30–8:00
> **Up next:** Handling edge cases

### [VO]
> Confirmation done. Next lesson: the ugly cases. Partial payloads. Replay attacks. Out-of-order callbacks. See you there.

---

## Lesson 5.4 : Edge cases and defensive coding *(9 min)*

### [SCREEN] 0:00–0:15
Title card.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 5.4 : When things go weird**

### [VO]
> Five edge cases that bite payment systems. We handle each one explicitly. If you ship without these, your pager will ring eventually. Let's prevent that.

### [SCREEN] 0:15–1:30
Edge case 1: duplicate callbacks.

### [ON-SCREEN TEXT] 0:15–1:30
> **1. Duplicate callback**
> Safaricom usually doesn't retry, but testing / proxies can replay.
> Fix: idempotent UPDATE (WHERE status = 'pending')

### [VO]
> Edge case one: duplicate callback. We touched this already. Someone's test rig replays an old callback. Someone proxies through a buggy middleware. Doesn't matter — our idempotent UPDATE handles it. Only pending rows get updated. Resolved rows stay as-is. No double receipts.

### [SCREEN] 1:30–2:30
Edge case 2: callback arrives before STK response is saved.

### [ON-SCREEN TEXT] 1:30–2:30
> **2. Callback arrives before INSERT**
> Rare race, but possible on slow networks.
> Fix: UPDATE affects 0 rows → log + save callback for later

### [VO]
> Edge case two: the callback arrives before our STK push workflow finished inserting the pending row. Rare but possible, especially under load.
>
> [PAUSE 1s]
>
> Symptom: our UPDATE affects zero rows because the row doesn't exist yet. Fix: after the UPDATE, check the rows affected count. If zero, we still have the audit log row — the raw callback was inserted in step one — so recovery is possible. Add a Code node that logs a warning. The reconciliation workflow in module six will pick up the pending row later and resolve it from the audit log.

### [SCREEN] 2:30–3:30
Edge case 3: malformed payload.

### [ON-SCREEN TEXT] 2:30–3:30
> **3. Malformed payload**
> Not from Safaricom — from test tools, bots, etc.
> Fix: validate shape, 200 OK anyway, log + alert

### [VO]
> Edge case three: malformed payload. Someone pokes your public callback URL with a POST body that isn't an STK callback at all. Could be a test tool. Could be a bot scanning the internet for exposed endpoints.
>
> [PAUSE 1s]
>
> Our Parse Callback node already throws if Body dot stkCallback is missing. But the webhook has already returned two hundred — we don't want to return a four hundred, because that would signal Safaricom to retry if it was legit.
>
> [PAUSE 1s]
>
> Better: wrap the Parse Callback in a try-catch. On error, insert into a separate "weird_calls" audit table and send a Slack alert. Don't error-propagate.

### [SCREEN] 3:30–5:00
Edge case 4: ResultCode we don't recognize.

### [ON-SCREEN TEXT] 3:30–5:00
> **4. Unknown ResultCode**
> Daraja adds new codes occasionally.
> Fix: use CASE statement with sensible default = 'failed'

### [VO]
> Edge case four: a ResultCode we don't recognize. Safaricom adds new codes over time. If your code checks only for zero, one-oh-three-two, one-oh-three-seven, and treats anything else as success, you'll mark a mysterious new failure code as a successful payment. Then your frontend tells the customer "paid", but no money arrived. Angry customer.
>
> [PAUSE 1s]
>
> Fix: build a lookup table in a Code node. Known success codes map to "success". Known failure codes map to specific statuses. Unknown codes map to "failed" and emit a Slack alert that says "unknown ResultCode seen, investigate". Fail safe.

### [SCREEN] 5:00–6:30
Edge case 5: timestamp parsing.

### [ON-SCREEN TEXT] 5:00–6:30
> **5. TransactionDate format**
> Safaricom sends `20261001101545` as a number.
> JS: beware of 15-digit precision loss, use String().

### [VO]
> Edge case five: transaction date parsing. Safaricom sends it as a fourteen-digit NUMBER. In JavaScript, that's within safe integer range but barely. If your code does any arithmetic on it — say, converting to a Date — JS might truncate.
>
> [PAUSE 1s]
>
> Fix: always treat it as a string. In our Parse Callback Code node, we do exactly that: String of meta dot TransactionDate. Then if you want a real Date, parse the string piece by piece. Our schema stores it as TEXT, not TIMESTAMP, so we never do date math on it in SQL either. Safe.

### [SCREEN] 6:30–7:30
Edge case 6 (bonus): callback URL changed.

### [ON-SCREEN TEXT] 6:30–7:30
> **Bonus: You changed MPESA_CALLBACK_BASE_URL**
> Old pending transactions still expect the old URL.
> Fix: reconciliation workflow (Module 6)

### [VO]
> Bonus edge case. You changed MPESA_CALLBACK_BASE_URL — maybe you moved domains, maybe you rotated ngrok. Old pending transactions in your database were created with the old callback URL baked into the Daraja request. The callbacks for those go to the old URL. Which doesn't exist anymore.
>
> [PAUSE 1s]
>
> Fix: the reconciliation workflow we build in module six polls the status of pending transactions and resolves them even if the callback was lost. We don't need the callback to be the only source of truth. Great design — always have a reconciliation safety net.

### [SCREEN] 7:30–8:30
Add alerting with the Error Trigger workflow.

### [VO]
> Last thing. Add an Error Trigger workflow — just one. Any time any workflow throws uncaught, fire a Slack alert with the workflow name, the error message, and the stack. One alert workflow protects everything else.

### [SCREEN] 8:30–9:00
End card.

### [ON-SCREEN TEXT] 8:30–9:00
> **Up next:** Testing the callback flow

### [VO]
> Six defensive patterns in your pocket. Next lesson, we test the whole chain, callback included. See you there.

---

## Lesson 5.5 : Testing the full flow *(8 min)*

### [SCREEN] 0:00–0:15
Postman + n8n + psql split screen.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 5.5 : End-to-end flow test**

### [VO]
> Final lesson of module five. We test the complete flow: STK push triggers prompt, customer pays, callback arrives, database updates, confirmation sends. Five tests, eight minutes.

### [SCREEN] 0:15–2:00
Test 1: happy path with sandbox.

### [VO]
> Test one: sandbox happy path. Hit the STK push webhook with your real phone number. Phone buzzes. Enter PIN two-four-five-six — the sandbox PIN. Callback workflow fires. Database row flips to success. Email arrives. Perfect.

### [SCREEN] 2:00–3:30
Test 2: user cancels on phone.

### [VO]
> Test two: cancel. Same STK push. On the phone, press cancel. Callback arrives with ResultCode one-oh-three-two. Database row flips to cancelled. No customer email — because our IF node routed to the failure branch. Ops alert fires. Correct.

### [SCREEN] 3:30–5:00
Test 3: user doesn't respond (timeout).

### [VO]
> Test three: timeout. STK push, ignore the prompt. After about sixty seconds, callback arrives with ResultCode one-oh-three-seven. Row updates to timeout — because our status mapping treats one-oh-three-seven as timeout, not just failure. Clear status for support team to understand.

### [SCREEN] 5:00–6:00
Test 4: simulated callback (bypass real STK).

### [VO]
> Test four: simulated callback. Scripts folder has simulate-callback dot sh. Takes a checkout request ID and a status. Fires a fake Safaricom callback at your webhook. Useful during development when you don't want to actually touch Daraja repeatedly.
>
> [PAUSE 1s]
>
> Run it with a known pending row's checkout request ID and "success". Row updates. Email sends. Full flow validated without burning Daraja quota.

### [SCREEN] 6:00–7:00
Test 5: duplicate callback replay.

### [VO]
> Test five: idempotency. Fire the same success callback twice. First call: row updates, email sends. Second call: row already resolved, UPDATE affects zero rows, no second email. Idempotent. Good.

### [SCREEN] 7:00–7:40
Open executions. Point out the ~2 second end-to-end latency.

### [VO]
> Open the executions view. Each callback execution takes about two hundred milliseconds end to end. Within that: Postgres update, audit insert, IF branching, email send. Under Safaricom's thirty-second timeout by a factor of a hundred and fifty. Comfortable.

### [SCREEN] 7:40–8:00
End card. Module 5 summary.

### [ON-SCREEN TEXT] 7:40–8:00
> **Module 5 recap:**
> ✅ Public callback URL exposed
> ✅ Callback webhook with "On Received" response
> ✅ Nested payload parsed cleanly
> ✅ DB update + audit log
> ✅ Confirmation delivered
> ✅ Six edge cases hardened
> ✅ Idempotency proven

### [VO]
> Module five done. The callback is the piece that turns pending into revenue. You've just built it, hardened it, and tested it. Next up: module six, reconciliation — the safety net for the two percent of callbacks that never arrive. See you there.

---

## Recording checklist for Module 5

- [ ] ngrok running with tunnel profile
- [ ] Real sandbox phone handy for live prompts
- [ ] psql pane for live DB observation
- [ ] Email SMTP creds set up and tested
- [ ] Postman "Simulate Callback" requests ready for all three ResultCodes

