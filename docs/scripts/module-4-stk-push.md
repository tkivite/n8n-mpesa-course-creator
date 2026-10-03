# Module 4 : Building the STK Push Workflow

**Target runtime:** ~60 min · **Lessons:** 7 · **Combined word count:** ~8,800

---

## Lesson 4.1 : Designing the webhook endpoint *(7 min)*

### [SCREEN] 0:00–0:15
Blank n8n canvas. Title card.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 4.1 : Designing the STK Push API**

### [VO]
> Welcome to module four, the main event. In the next hour we build the production-grade STK Push workflow. Not a demo. The one you'd deploy to a client. It validates input, generates the password, calls Daraja, stores the transaction, and returns a response your frontend can act on.

### [SCREEN] 0:15–1:30
Design the API contract on a whiteboard.

### [ON-SCREEN TEXT] 0:15–1:30
> ```http
> POST /webhook/mpesa/stk-push
> {
>   "phone": "0712345678",
>   "amount": 100,
>   "reference": "ORDER-1001",
>   "description": "Payment"
> }
> ```

### [VO]
> First: the API contract. Your frontend will POST four fields. Phone in any format we can parse — the normalization lives in our workflow, not the frontend. Amount as an integer. Reference, which shows up on the customer's M-Pesa statement. Description, which shows up during the prompt.
>
> [PAUSE 1s]
>
> Why so few fields? Keep the frontend dumb. The more it does, the more places bugs can hide. We validate centrally in one workflow and give the frontend a clean response to render.

### [SCREEN] 1:30–2:30
Design the response contract.

### [ON-SCREEN TEXT] 1:30–2:30
> ```json
> {
>   "success": true,
>   "message": "STK push sent",
>   "checkout_request_id": "ws_CO_...",
>   "reference": "ORDER-1001"
> }
> ```

### [VO]
> Response contract. Four fields. Success boolean so the frontend can show a checkmark or an error. Message for user-facing text. Checkout request ID so the frontend can poll status if it wants. Reference echoed back so the frontend can correlate.
>
> [PAUSE 1s]
>
> Importantly: this response fires before the customer has even entered their PIN. All it means is "STK prompt sent successfully". The actual payment result arrives later via callback. Your frontend UX needs to reflect that: show "check your phone" after this response, then transition to "paid" only when your backend confirms the callback.

### [SCREEN] 2:30–3:30
Add Webhook node. Configure: path, method, response mode.

### [VO]
> Build time. Blank workflow. Add a Webhook node. Path: mpesa slash stk dash push. Method: POST. Response Mode: last node — meaning the final node's output becomes the HTTP response. Authentication: none for now, we'll add it in module seven.

### [SCREEN] 3:30–4:30
Click the test URL to copy it. Switch to Postman, show the empty request builder.

### [VO]
> n8n gives you two URLs: a test URL that fires once per click, and a production URL that fires forever when the workflow is active. We'll use the production URL via the Postman collection in a few minutes.
>
> [PAUSE 1s]
>
> Important detail: webhook paths are relative to your n8n host. Locally that's localhost five-six-seven-eight slash webhook slash mpesa slash stk dash push. On your VPS it's your domain slash the same path. The frontend's "pay" button targets whichever one you deploy to.

### [SCREEN] 4:30–5:30
Add response headers. CORS discussion.

### [VO]
> Quick note on CORS. If your frontend lives on a different origin — react dot yoursite dot com calling api dot yoursite dot com — browsers block the request unless you return CORS headers.
>
> [PAUSE 1s]
>
> In the Webhook node, under "Options", add "Response Headers". Set Access-Control-Allow-Origin to your frontend's origin, or star for development. Add Access-Control-Allow-Methods: POST, OPTIONS. If the browser sends an OPTIONS preflight, n8n handles it automatically.

### [SCREEN] 5:30–6:30
Save workflow with Ctrl-S. Name it "02 - STK Push".

### [VO]
> Save. Name it zero two dash STK push. Workflow saved but not yet active. We'll activate it after we've built and tested the full chain.

### [SCREEN] 6:30–6:50
End card.

### [ON-SCREEN TEXT] 6:30–6:50
> **Up next:** Input validation that catches bugs

### [VO]
> Next lesson: input validation. The code that rejects a nineteen-shilling payment, a Nigerian phone number, a thirty-character reference. Three minutes of logic that saves hundreds of support tickets. See you there.

---

## Lesson 4.2 : Input validation *(8 min)*

### [SCREEN] 0:00–0:15
Add a Code node after the Webhook. Rename to "Validate Input".

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 4.2 : Validating payment input**

### [VO]
> After the webhook, add a Code node. Rename it "Validate Input". This is where every piece of untrusted input from the outside world gets scrubbed before it ever touches Daraja.

### [SCREEN] 0:15–1:30
Paste the first chunk: phone normalization.

### [ON-SCREEN TEXT] 0:15–1:30
> ```js
> const body = $json.body || $json;
> let phone = String(body.phone || '').trim();
> phone = phone.replace(/[^0-9]/g, '');
> if (phone.startsWith('0')) phone = '254' + phone.slice(1);
> if (phone.startsWith('+')) phone = phone.slice(1);
> if (/^(7|1)/.test(phone)) phone = '254' + phone;
> if (!/^254(7|1)\d{8}$/.test(phone))
>   throw new Error('Invalid phone number. Use 2547XXXXXXXX format.');
> ```

### [VO]
> Phone normalization first. Grab the body, treat it as a string, strip everything that isn't a digit. Then handle the three common formats: zero-seven-one-two gets its zero replaced with two-five-four. Plus-two-five-four-seven loses the plus. Bare seven or one gets two-five-four prepended.
>
> [PAUSE 1s]
>
> Final check: must match two-five-four followed by seven or one, followed by exactly eight more digits. Thirteen characters total. If not, throw a clear error. The thrown error becomes the HTTP response because we didn't set the webhook to swallow errors.

### [SCREEN] 1:30–2:30
Paste amount validation.

### [ON-SCREEN TEXT] 1:30–2:30
> ```js
> const amount = parseInt(body.amount, 10);
> if (!amount || amount < 1)
>   throw new Error('Amount must be a positive integer');
> if (amount > 70_000)
>   throw new Error('Amount exceeds M-Pesa transaction limit');
> ```

### [VO]
> Amount next. Parse as integer. Reject anything less than one — Daraja's minimum. Reject anything over seventy thousand — Daraja's per-transaction cap for most shortcodes.
>
> [PAUSE 1s]
>
> Important: use parseInt base ten. JavaScript's loose number parsing has edge cases. One hundred point five becomes one hundred — a free fifty-cent discount for the customer. Don't be the business that gave away forty thousand shillings to a sneaky frontend.

### [SCREEN] 2:30–3:30
Paste reference and description validation.

### [ON-SCREEN TEXT] 2:30–3:30
> ```js
> const reference = String(body.reference || 'ORDER-' + Date.now()).slice(0, 12);
> const description = String(body.description || 'Payment').slice(0, 13);
> ```

### [VO]
> Reference and description. Both have strict length limits imposed by Daraja — twelve characters for reference, thirteen for description.
>
> [PAUSE 1s]
>
> We slice to the max rather than reject. If the frontend sends twenty characters, we take the first twelve. Debatable — some would reject. I prefer slice because it's a better user experience and the customer still sees enough context.
>
> [PAUSE 1s]
>
> Also note: if the frontend forgets to send a reference, we generate one — ORDER dash current-time-in-milliseconds. Prevents null references in the database.

### [SCREEN] 3:30–4:30
Final return statement.

### [ON-SCREEN TEXT] 3:30–4:30
> ```js
> return [{
>   json: { phone, amount, reference, description }
> }];
> ```

### [VO]
> Return the four cleaned fields. That's the whole Code node. About twenty lines of logic. Nothing clever. Just a wall of defensive checks between the outside world and your money-moving code.

### [SCREEN] 4:30–5:30
Test with Postman: send a bad phone, see the error response.

### [VO]
> Let's test. Open the Postman collection. Fire the "trigger STK push via n8n" request with phone "zero-one-two". Should fail. Response: four hundred, with message "Invalid phone number".
>
> [PAUSE 1s]
>
> Now send a valid phone and amount zero. Should fail with "amount must be positive".
>
> [PAUSE 1s]
>
> Finally send phone zero-seven-one-two-three-four-five-six-seven-eight, amount one hundred. Validation passes — but the next node will fail because we haven't built it yet. That's fine.

### [SCREEN] 5:30–6:30
Discuss: additional validations you might add.

### [ON-SCREEN TEXT] 5:30–6:30
> **You could also validate:**
> ✓ Max amount per phone per day
> ✓ Reference uniqueness
> ✓ Rate limit per IP
> ✓ Phone belongs to logged-in user

### [VO]
> Four more validations you might add, depending on your use case. Max amount per phone per day — prevents fraud with a cap, say ten thousand shillings per phone per day. Reference uniqueness — reject if the same reference already exists in the database. Rate limit per IP — prevents a bot from hammering your endpoint. And phone-belongs-to-user — if you have authenticated users, require the phone to match the one on their profile.
>
> [PAUSE 1s]
>
> We keep it simple in this course. You can add these as a Postgres lookup after the validation Code node — same pattern.

### [SCREEN] 6:30–7:30
Open the executions tab. Show the failed execution's rich debug info.

### [VO]
> Debugging tip. When validation fails during development, open the executions tab. Click into the failed run. Click the Validate Input node. You see the exact input that caused the throw. No guessing. In Spring Boot, you'd be grepping logs.

### [SCREEN] 7:30–8:00
End card.

### [ON-SCREEN TEXT] 7:30–8:00
> **Up next:** Fetching the auth token

### [VO]
> Validation done. Next lesson, we wire in the auth sub-workflow from module three. Thirty seconds of config. See you there.

---

## Lesson 4.3 : Fetching the auth token *(4 min)*

### [SCREEN] 0:00–0:15
Add Execute Workflow node after Validate Input.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 4.3 : Chain in the auth workflow**

### [VO]
> This is the shortest lesson in the module. Add an Execute Workflow node after Validate Input. Workflow dropdown: pick zero-one dash M dash Pesa auth, the one we built in module three. Save. Done.

### [SCREEN] 0:15–1:30
Click execute, show the token appearing on the Execute Workflow node's output.

### [VO]
> Trigger a test request. The Execute Workflow node runs the auth sub-workflow, which — thanks to our caching — probably hits the cache and returns a token in milliseconds. The token appears in the node's output panel.
>
> [PAUSE 1s]
>
> From here, downstream nodes reference the token with dollar json dot access_token. We'll use that in the next lesson to build the Authorization header.

### [SCREEN] 1:30–2:30
Discuss: what if auth fails?

### [VO]
> One thing to think about: what if auth fails? Say your Consumer Secret rotated and the sub-workflow throws. By default, the Execute Workflow node propagates the error, your main workflow stops, and the webhook returns five hundred to the frontend.
>
> [PAUSE 1s]
>
> That's the right behavior for payments. Don't try to push an STK with a bad token — you'll just confuse the customer. Fail loud, let your frontend show "payment temporarily unavailable", and alert ops to fix the credentials.

### [SCREEN] 2:30–3:30
Show how to add error handling (optional).

### [VO]
> If you really want graceful degradation, you can set the Execute Workflow node to "continue on error" in Settings. Then route the error output to a Code node that returns a custom error response. For a course demo I keep it simple — propagate.

### [SCREEN] 3:30–4:00
End card.

### [ON-SCREEN TEXT] 3:30–4:00
> **Up next:** Building the STK Push payload

### [VO]
> Next up: the big one. The timestamp, the password, the twelve-field payload. See you there.

---

## Lesson 4.4 : Building the STK Push payload *(10 min)*

### [SCREEN] 0:00–0:15
Add a Code node after Execute Workflow. Rename "Build STK Payload".

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 4.4 : Building the payload**

### [VO]
> Add a Code node after the Execute Workflow. Name it "Build STK Payload". This is where the twelve fields we studied in module two come together, built fresh for every single request.

### [SCREEN] 0:15–1:30
First chunk: pull inputs from previous nodes.

### [ON-SCREEN TEXT] 0:15–1:30
> ```js
> const input = $('Validate Input').item.json;
> const token = $json.access_token;
> const shortcode = $env.MPESA_SHORTCODE || '174379';
> const passkey = $env.MPESA_PASSKEY;
> const callbackBase = $env.MPESA_CALLBACK_BASE_URL;
> const baseUrl = $env.MPESA_BASE_URL;
> if (!passkey) throw new Error('MPESA_PASSKEY env var not set');
> ```

### [VO]
> Pull in inputs. The validated phone, amount, reference, description from the Validate Input node — notice we reference it by name using dollar paren "Validate Input" paren dot item dot json. That lets us jump past the Execute Workflow node, which is between us and the validation output.
>
> [PAUSE 1s]
>
> The access_token from the immediately previous Execute Workflow node — dollar json dot access_token.
>
> [PAUSE 1s]
>
> Shortcode, passkey, callback base URL, and base URL from env vars. If passkey is missing, we throw an early error with a clear message. Beats a cryptic Daraja response.

### [SCREEN] 1:30–3:00
Second chunk: timestamp generation.

### [ON-SCREEN TEXT] 1:30–3:00
> ```js
> const now = new Date();
> const pad = (n) => String(n).padStart(2, '0');
> const timestamp =
>   now.getFullYear().toString() +
>   pad(now.getMonth() + 1) +
>   pad(now.getDate()) +
>   pad(now.getHours()) +
>   pad(now.getMinutes()) +
>   pad(now.getSeconds());
> ```

### [VO]
> Timestamp. The format Daraja wants is Y-Y-Y-Y-M-M-D-D-H-H-M-M-S-S as a string, in Africa Nairobi time.
>
> [PAUSE 1s]
>
> Note the padStart call. If the month is January, getMonth returns zero, we add one to get one, we have to pad to "zero-one" so the final string is fourteen characters. Without padding, January tenth would produce a thirteen-character timestamp that Daraja rejects.
>
> [PAUSE 1s]
>
> Also note I'm not calling toLocaleString with a timezone. That's because our docker-compose sets the container timezone to Africa Nairobi via the TZ env var — so new Date and getHours already return Nairobi time. If you ever run this without that config, you must add explicit timezone handling.

### [SCREEN] 3:00–4:00
Third chunk: password.

### [ON-SCREEN TEXT] 3:00–4:00
> ```js
> const password = Buffer.from(
>   shortcode + passkey + timestamp
> ).toString('base64');
> ```

### [VO]
> Password. The formula we memorized in module two. Concatenate the three strings — shortcode first, passkey second, timestamp third — Buffer them, base-sixty-four them. One line.
>
> [PAUSE 1s]
>
> Order matters. Passkey after shortcode. Timestamp last. Swap any pair and the result is a different password, which Daraja rejects.

### [SCREEN] 4:00–6:00
Final chunk: the twelve-field payload.

### [ON-SCREEN TEXT] 4:00–6:00
> ```js
> return [{
>   json: {
>     url: `${baseUrl}/mpesa/stkpush/v1/processrequest`,
>     authHeader: `Bearer ${token}`,
>     payload: {
>       BusinessShortCode: parseInt(shortcode, 10),
>       Password: password,
>       Timestamp: timestamp,
>       TransactionType: 'CustomerPayBillOnline',
>       Amount: input.amount,
>       PartyA: parseInt(input.phone, 10),
>       PartyB: parseInt(shortcode, 10),
>       PhoneNumber: parseInt(input.phone, 10),
>       CallBackURL: `${callbackBase}/webhook/mpesa/stk-callback`,
>       AccountReference: input.reference,
>       TransactionDesc: input.description
>     }
>   }
> }];
> ```

### [VO]
> The payload. Every field we studied in lesson two point four. BusinessShortCode and PartyB both the shortcode, as integers. Phone three times — PartyA, PhoneNumber, both integers. Callback URL constructed from the base URL plus our callback path.
>
> [PAUSE 1s]
>
> I return the URL and auth header alongside the payload. That's a small convenience — it means the next node, the HTTP Request, just references dollar json dot url and dollar json dot authHeader instead of hardcoding anything. Clean separation.

### [SCREEN] 6:00–7:00
Test it: pin the output of the Validate Input node, execute just the Build STK Payload node.

### [VO]
> Smart debugging move. In n8n, you can "pin" the output of any node. Right-click the Validate Input node, pick "pin data". Now when you execute downstream nodes individually, they use that pinned data instead of re-running the webhook. Faster iteration while you tweak the Build STK Payload Code.

### [SCREEN] 7:00–8:00
Discuss transaction type gotcha.

### [VO]
> One potential pitfall. TransactionType is hardcoded to CustomerPayBillOnline. If your real shortcode is a BuyGoods till, change it to CustomerBuyGoodsOnline — or make it configurable via env var, which is what I'd do in production. Let me show you.

### [SCREEN] 7:30–8:30
Edit to make transaction type env-driven.

### [ON-SCREEN TEXT] 7:30–8:30
> ```js
> const txType = $env.MPESA_TX_TYPE || 'CustomerPayBillOnline';
> // ...
> TransactionType: txType,
> ```

### [VO]
> Add an env var MPESA_TX_TYPE defaulting to PayBill. Now swapping to a till is just an env change, no node edit. Same philosophy as the base URL — environment-driven, not code-driven.

### [SCREEN] 8:30–9:30
Add to .env.example and docker-compose.yml.

### [VO]
> Don't forget to add it to dot env dot example and the n8n service's environment block in docker compose yml. Future-you will thank present-you for the clear default.

### [SCREEN] 9:30–10:00
End card.

### [ON-SCREEN TEXT] 9:30–10:00
> **Up next:** Firing the STK Push HTTP call

### [VO]
> Payload built. Next lesson, we actually call Daraja. See you there.

---

## Lesson 4.5 : Calling Daraja and handling the response *(9 min)*

### [SCREEN] 0:00–0:15
Add HTTP Request node after Build STK Payload.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 4.5 : The HTTP call to Daraja**

### [VO]
> Add an HTTP Request node after Build STK Payload. This is the node that actually hits Safaricom's servers.

### [SCREEN] 0:15–1:30
Configure the HTTP Request: method, URL, headers, body.

### [ON-SCREEN TEXT] 0:15–1:30
> **Method:** POST
> **URL:** `{{ $json.url }}`
> **Headers:**
> &nbsp;&nbsp;Authorization: `{{ $json.authHeader }}`
> &nbsp;&nbsp;Content-Type: application/json
> **Body (JSON):** `{{ JSON.stringify($json.payload) }}`
> **Timeout:** 15000ms

### [VO]
> Method POST. URL: an expression — curly braces dollar json dot url — because we built the URL in the previous node. Same for Authorization: dollar json dot authHeader.
>
> [PAUSE 1s]
>
> Content-Type: application json. Body: specify JSON, then the expression curly braces JSON dot stringify dollar json dot payload. We stringify so the entire payload object becomes the raw request body.
>
> [PAUSE 1s]
>
> Timeout: fifteen seconds. Daraja is usually fast but occasionally slow. Fifteen seconds is long enough for ninety-nine point nine percent of real responses and short enough that if something hangs, we don't block the webhook forever.

### [SCREEN] 1:30–2:30
Settings tab: On Error = continue with error output.

### [VO]
> Open Settings on the HTTP Request node. "On Error": set to "continue using error output". This gives the node two output ports. Success goes out the top. Errors — timeouts, network failures, five-hundred responses — go out the bottom.
>
> [PAUSE 1s]
>
> We want this because we're going to save every attempted transaction to the database, including failed attempts. The error branch feeds into the same "save transaction" node with a status of "failed-to-send".

### [SCREEN] 2:30–3:30
Trigger a test request. Watch the Daraja response.

### [VO]
> Fire a test request from Postman. Watch the HTTP Request node light up. Click it. The response has three fields that matter: ResponseCode zero for success, CheckoutRequestID — the ID we use to match callbacks later — and CustomerMessage, which Safaricom gives you to show to the user.

### [SCREEN] 3:30–4:30
Zoom into the response.

### [ON-SCREEN TEXT] 3:30–4:30
> ```json
> {
>   "MerchantRequestID": "29115-...",
>   "CheckoutRequestID": "ws_CO_...",
>   "ResponseCode": "0",
>   "ResponseDescription": "Success. Request accepted for processing",
>   "CustomerMessage": "Success. Request accepted for processing"
> }
> ```

### [VO]
> ResponseCode zero is important. It only means "request accepted" — not "payment completed". The actual payment happens asynchronously on the customer's phone. We'll handle that in module five.
>
> [PAUSE 1s]
>
> CheckoutRequestID looks like "w s underscore C O underscore" followed by a long string. Capture it. Store it. It's the primary key you'll use to match callbacks back to this request.

### [SCREEN] 4:30–5:30
Common error responses from Daraja.

### [ON-SCREEN TEXT] 4:30–5:30
> **Common Daraja errors:**
> `errorCode: 500.001.1001` — "Invalid Credentials"
> `errorCode: 400.002.02` — "Bad Request"
> `errorCode: 500.001.1032` — "Invalid Timestamp"

### [VO]
> Not every response is success. Here are the three errors you'll see most. Five hundred dot zero zero one dot one zero zero one: invalid credentials — your token is stale or wrong. Four hundred dot zero zero two dot zero two: bad request — usually a malformed field. Five hundred dot zero zero one dot one zero three two: invalid timestamp — clock drift.
>
> [PAUSE 1s]
>
> Each of these should land in a database row with status "failed" and the error code logged. Your support team can look at the row and know exactly what went wrong without reading Daraja logs.

### [SCREEN] 5:30–7:00
Build the "Build API Response" Code node.

### [ON-SCREEN TEXT] 5:30–7:00
> ```js
> const resp = $json;
> const input = $('Validate Input').item.json;
> const success = resp.ResponseCode === '0';
> return [{
>   json: {
>     success,
>     message: resp.CustomerMessage || resp.errorMessage || 'Unknown',
>     checkout_request_id: resp.CheckoutRequestID,
>     reference: input.reference,
>     phone: input.phone,
>     amount: input.amount
>   }
> }];
> ```

### [VO]
> One more node. A Code node called "Build API Response" after the HTTP Request. This translates Daraja's response into our clean API contract we designed in lesson one. Success boolean derived from ResponseCode. Message from CustomerMessage or errorMessage. Checkout request ID, reference, phone, amount — the data your frontend needs.
>
> [PAUSE 1s]
>
> Return this as the last node's output. Because the webhook is set to "last node" response mode, this becomes the HTTP response your frontend receives.

### [SCREEN] 7:00–8:00
End-to-end test with Postman.

### [VO]
> End to end test. Hit the webhook URL from Postman with a valid payload. The chain fires: webhook, validate, auth, build payload, HTTP, build response. The last node returns the clean JSON, which Postman displays.
>
> [PAUSE 1s]
>
> And — if you used your real phone number — your phone just vibrated with an STK prompt. Enter PIN. Daraja moves money. But we won't see the callback yet because we haven't built the callback workflow. That's module five.

### [SCREEN] 8:00–8:30
End card.

### [ON-SCREEN TEXT] 8:00–8:30
> **Up next:** Saving transactions to the database

### [VO]
> We have a working STK push. Next lesson: persist every attempt to Postgres. See you there.

---

## Lesson 4.6 : Persisting the transaction *(7 min)*

### [SCREEN] 0:00–0:15
Add a Postgres node between HTTP Request and Build API Response.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 4.6 : Database persistence**

### [VO]
> Add a Postgres node between HTTP Request and Build API Response. Call it "Save Transaction (Pending)".

### [SCREEN] 0:15–1:30
Configure credential pointing to the Postgres container.

### [VO]
> Click into the Postgres node. Credential dropdown — create new. Host: the container name "postgres". Database: "n8n". User: n8n. Password: whatever you set in dot env. Click test — green checkmark. Save.

### [SCREEN] 1:30–3:00
Operation: insert. Table: mpesa_transactions. Column mapping.

### [ON-SCREEN TEXT] 1:30–3:00
> **Operation:** Insert
> **Table:** mpesa_transactions
> **Columns:**
> &nbsp;&nbsp;checkout_request_id → `{{ $json.CheckoutRequestID }}`
> &nbsp;&nbsp;merchant_request_id → `{{ $json.MerchantRequestID }}`
> &nbsp;&nbsp;phone → `{{ $('Validate Input').item.json.phone }}`
> &nbsp;&nbsp;amount → `{{ $('Validate Input').item.json.amount }}`
> &nbsp;&nbsp;reference → `{{ $('Validate Input').item.json.reference }}`
> &nbsp;&nbsp;status → `pending`

### [VO]
> Operation: insert. Table: mpesa_transactions — the one our schema SQL created when Postgres first started up. Mapping mode: define below.
>
> [PAUSE 1s]
>
> Six columns to set. Checkout request ID and merchant request ID from the HTTP response. Phone, amount, reference from the validation step — referenced by node name. Status: the string "pending". We don't know yet if the customer will complete the payment. That's resolved later by the callback workflow.

### [SCREEN] 3:00–4:00
Open psql. Query the table before and after a test transaction.

### [VO]
> Let me show you the result. Open psql in a terminal. "docker compose exec postgres psql dash U n8n". Query: select from mpesa_transactions. Empty.
>
> [PAUSE 1s]
>
> Fire a test STK push from Postman. Query again. One row, status pending, with the checkout request ID that matches the one Daraja returned.

### [SCREEN] 4:00–5:00
Discuss: why save even failed attempts.

### [VO]
> One philosophy point. We save every transaction attempt, even ones Daraja rejected. Why? Because when a customer says "I was charged but didn't get my service", you need an audit trail. If there's no row in the database for their reference, you have proof Daraja never processed it. If there's a row with status failed, you can show the exact reason.
>
> [PAUSE 1s]
>
> To save failures too, wire the error output of the HTTP Request node to another insert node with status equal to "failed-to-send" and the error message captured. Or — simpler — write a Code node that handles both branches and inserts the right row. Same table, different status.

### [SCREEN] 5:00–6:00
Add a conditional for failure case.

### [VO]
> Here's the clean way. Delete the current insert. Add an IF node right after HTTP Request checking if ResponseCode equals zero. True branch: insert with status pending. False branch: insert with status failed and populate the error_message column. Both branches then merge into Build API Response.
>
> [PAUSE 1s]
>
> Three extra nodes, but your database now has a complete audit log. Ops, finance, and support will love you.

### [SCREEN] 6:00–7:00
End card.

### [ON-SCREEN TEXT] 6:00–7:00
> **Up next:** Testing with Postman + sandbox numbers

### [VO]
> Next lesson is the capstone of module four. Full end-to-end testing with Postman. We hit the webhook, we watch the database, we check Daraja's dashboard. Then module five — the callback. See you there.

---

## Lesson 4.7 : End-to-end testing *(5 min)*

### [SCREEN] 0:00–0:15
Open Postman collection.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 4.7 : End-to-end test**

### [VO]
> Final lesson of module four. We tie it all together. Postman, workflow, database, Daraja dashboard. Four tests, five minutes.

### [SCREEN] 0:15–1:30
Test 1: happy path.

### [VO]
> Test one: happy path. Postman request "Trigger STK Push via n8n". Body: your phone number, amount one, reference TEST dash one. Send.
>
> [PAUSE 1s]
>
> Response: success true, checkout request ID populated. Phone buzzes within three seconds. Database query: one row, status pending.

### [SCREEN] 1:30–2:30
Test 2: invalid phone.

### [VO]
> Test two: invalid phone. Body: phone zero-one-two. Send. Response: five hundred, error "Invalid phone number". Database: no new row. Daraja: never hit. Validation did its job.

### [SCREEN] 2:30–3:30
Test 3: amount over limit.

### [VO]
> Test three: amount over limit. Body: valid phone, amount seventy-five thousand. Response: five hundred, error "exceeds M-Pesa transaction limit". Daraja: never hit.

### [SCREEN] 3:30–4:30
Test 4: broken env var — simulate missing passkey.

### [VO]
> Test four: deliberately break the config. Temporarily unset MPESA_PASSKEY. Restart docker compose. Fire a valid request. Response: five hundred, error "MPESA_PASSKEY env var not set". Clear error, no mystery.
>
> [PAUSE 1s]
>
> Restore the env var. Restart. Fire again. Working.

### [SCREEN] 4:30–5:00
End card. Module 4 summary.

### [ON-SCREEN TEXT] 4:30–5:00
> **Module 4 recap:**
> ✅ Webhook API designed
> ✅ Input validation hardened
> ✅ Auth chained in
> ✅ Payload built
> ✅ Daraja called
> ✅ Transaction persisted
> ✅ End-to-end tested

### [VO]
> Module four complete. You've built the heart of an M-Pesa integration. Next up: module five, the callback handler. The piece that turns "pending" into "paid". See you there.

---

## Recording checklist for Module 4

- [ ] Postman collection pre-loaded with test transactions
- [ ] psql terminal in a split-screen pane for live DB queries
- [ ] Phone handy for real STK prompt demos
- [ ] All Code node snippets pre-rendered in Carbon
- [ ] `.env` has sandbox creds; back up to restore between demos

