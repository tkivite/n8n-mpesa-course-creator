# Module 2 : Understanding the Daraja API

**Target runtime:** ~40 min · **Lessons:** 7 · **Combined word count:** ~5,800

---

## Lesson 2.1 : Daraja overview: what it is & how it works *(5 min)*

### [SCREEN] 0:00–0:12
Open developer.safaricom.co.ke homepage.

### [ON-SCREEN TEXT] 0:00–0:08
> **Lesson 2.1 · Meet Daraja**

### [VO]
> Welcome to module two. The next forty minutes are about the thing on the other end of your HTTP calls — Safaricom's Daraja API. If you understand Daraja deeply, you can debug any M-Pesa issue, and you can explain to a client why their payment failed. If you don't, you'll be copy-pasting Stack Overflow answers and hoping.

### [SCREEN] 0:12–1:00
Zoom into the Daraja homepage, highlight the API categories.

### [VO]
> Daraja — which means "bridge" in Swahili — is Safaricom's developer portal. It exposes M-Pesa as a REST API. Before Daraja existed, you integrated M-Pesa by generating cryptographic signatures with X-five-oh-nine certificates and calling a SOAP endpoint through an IP-whitelisted VPN. I'm not making that up. Daraja launched in two thousand sixteen and replaced all of that with Bearer tokens and JSON. We're the lucky generation.

### [SCREEN] 1:00–2:00
Zoom into the Daraja API catalogue. Highlight: STK Push, C2B, B2C, Account Balance, Transaction Status, Reversal.

### [VO]
> Daraja has eight-ish main APIs. We're going to focus on just one — STK Push, also called "Lipa Na M-Pesa Online" — because it's the most common and it teaches patterns that apply to the others.
>
> [PAUSE 1s]
>
> Just so you know what's out there. STK Push: prompts the customer's phone for payment, they enter PIN, you get paid. This is what checkout pages use. C2B — Customer to Business: handles unprompted payments like when someone sends money to your till. B2C — Business to Customer: you send money out, like salary disbursement or refunds. Account Balance: query your till balance. Transaction Status: check what happened to a specific transaction. Reversal: refund within seven days.
>
> [PAUSE 1s]
>
> Every one of these uses the exact same authentication, the exact same callback pattern, and most of the exact same request shape. Learn STK Push well, you've basically learned Daraja.

### [SCREEN] 2:00–3:00
Show a horizontal sequence diagram: user → merchant → Daraja → phone → Daraja → merchant.

### [B-ROLL]
Animated arrows showing the sequence step by step.

### [VO]
> Here's how STK Push works at a high level. Six steps.
>
> [PAUSE 1s]
>
> One. Customer clicks "pay with M-Pesa" on your website and enters their phone number.
>
> [PAUSE 1s]
>
> Two. Your server — or in our case, your n8n workflow — gets an OAuth token from Daraja.
>
> [PAUSE 1s]
>
> Three. Your workflow calls Daraja's STK push endpoint with the phone, the amount, your shortcode, a timestamp, and a password derived from your passkey.
>
> [PAUSE 1s]
>
> Four. Daraja validates the request, acknowledges it synchronously with a Checkout Request ID, and then — asynchronously — pushes a prompt to the customer's phone.
>
> [PAUSE 1s]
>
> Five. Customer enters their M-Pesa PIN. The money moves.
>
> [PAUSE 1s]
>
> Six. Daraja posts the final result to a callback URL that you registered in step three. Success includes the receipt number. Failure includes a reason code.
>
> [PAUSE 1s]
>
> That's it. That's the whole flow. Everything we build in this course is some variation of these six steps.

### [SCREEN] 3:00–4:00
Compare sandbox URL to production URL.

### [ON-SCREEN TEXT] 3:00–4:00
> **Sandbox:** `https://sandbox.safaricom.co.ke`
> **Production:** `https://api.safaricom.co.ke`
> *Same endpoints, different base.*

### [VO]
> One critical thing before we move on. Daraja has two environments: sandbox and production. They have different base URLs, different credentials, and they are completely isolated.
>
> [PAUSE 1s]
>
> We'll spend ninety percent of this course in sandbox. In sandbox, Safaricom gives you a test shortcode, a test passkey, and the STK push always resolves quickly — the sandbox doesn't actually move money, it just simulates the response.
>
> [PAUSE 1s]
>
> When you go live, you swap three things: the base URL, the Consumer Key, and the Consumer Secret. Everything else — your workflow logic, your database — stays identical. We'll do that switch together in module seven, and I'll give you a go-live checklist to make sure you don't miss anything.

### [SCREEN] 4:00–4:40
End card with next lesson teaser.

### [ON-SCREEN TEXT] 4:00–4:40
> **Up next:** Creating your Daraja account

### [VO]
> Next lesson, we create your Daraja developer account together. I'll walk you through the signup — it's not obvious — and we'll generate your sandbox credentials. See you there.

---

## Lesson 2.2 : Creating a Safaricom developer account *(5 min)*

### [SCREEN] 0:00–0:15
developer.safaricom.co.ke homepage. Click "Sign Up" top right.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 2.2 · Get your Daraja account**

### [VO]
> Head to developer dot safaricom dot co dot ke. Top right, click sign up. If you've ever signed up for a developer portal, this will feel familiar — email, phone, password. Use your real phone number: Safaricom sometimes sends OTP verifications.

### [SCREEN] 0:15–1:00
Fill the sign-up form. Submit. Check inbox for verification email.

### [VO]
> Fill it out. Verify your email. Log in. You're now in the Daraja developer dashboard.
>
> [PAUSE 1s]
>
> A note: this is a free, self-service portal. You do not need to be a registered business to use the sandbox. Any individual can sign up and start building. You only need business paperwork when you go to production.

### [SCREEN] 1:00–2:00
Dashboard tour. Click "My Apps". Click "Add a new app".

### [VO]
> Tour. Left sidebar. "My apps" is where your credentials live. "Documentation" is Safaricom's reference — bookmark it, but honestly, the docs are inconsistent, so lean on the course handbook. "APIs" lists everything available. "Test credentials" is the shortcut to sandbox details.
>
> [PAUSE 1s]
>
> Click "my apps", then "add a new app". This is where you create your first app.

### [SCREEN] 2:00–3:00
Fill app form: name "n8n-mpesa-course", select products.

### [ON-SCREEN TEXT] 2:00–3:00
> **App name:** n8n-mpesa-course
> **Products:**
> ✅ Lipa Na M-Pesa Sandbox
> ✅ M-Pesa Sandbox
> ✅ Daraja APIs

### [VO]
> App name: anything, I'm calling mine "n8n-mpesa-course". Products: tick Lipa Na M-Pesa Sandbox, M-Pesa Sandbox, and Daraja APIs. Create.

### [SCREEN] 3:00–3:40
App created. Show Consumer Key and Consumer Secret on the app page. Copy both.

### [B-ROLL]
Burn-in blur over the actual values so viewers don't see real credentials.

### [VO]
> You now have a Consumer Key and a Consumer Secret. These are the OAuth credentials we use to get Bearer tokens. Treat them like passwords — never commit them to Git. If they ever leak, come back here and regenerate them.
>
> [PAUSE 1s]
>
> Copy them. Open the dot env file in the course repo. Paste Consumer Key into MPESA_CONSUMER_KEY and Consumer Secret into MPESA_CONSUMER_SECRET. Save.

### [SCREEN] 3:40–4:30
Open .env in editor, paste values, save. Restart docker compose.

### [VO]
> Important: after editing dot env, you need to restart n8n so it picks up the new environment variables. In the docker folder, run docker compose down, then docker compose up dash d. Thirty seconds, you're back.

### [SCREEN] 4:30–5:00
Terminal: run the test-token.sh script.

### [VO]
> Let's verify the credentials work. In the scripts folder of the repo, there's test dash token dot sh. Run it. It uses curl to hit the OAuth endpoint and prints the token. If you see an access underscore token in the output, you're wired up correctly. If you see "invalid credentials", double-check your copy-paste. Trailing newlines are the usual culprit.

### [SCREEN] 5:00–5:20
End card.

### [ON-SCREEN TEXT] 5:00–5:20
> **Up next:** Shortcode, passkey, and the password formula

### [VO]
> You have credentials. Next lesson, we talk about the other three things you need to make an STK push — shortcode, passkey, and the password formula. These confuse most newcomers. We'll make them simple.

---

## Lesson 2.3 : Shortcodes, passkeys, and the password *(6 min)*

### [SCREEN] 0:00–0:15
A diagram showing the three ingredients labeled: Shortcode + Passkey + Timestamp → Password.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 2.3 · The password formula**

### [VO]
> This is the lesson that trips most people. Three concepts: shortcode, passkey, and password. Let's untangle them.

### [SCREEN] 0:15–1:30
Diagram of M-Pesa account types: PayBill number (6-7 digits) and BuyGoods Till (4-6 digits).

### [VO]
> Concept one: shortcode. This is the number customers see on their phone when they pay you. There are two types.
>
> [PAUSE 1s]
>
> PayBill — a six or seven digit number, typically used when customers also need to enter an account reference. Example: NHIF, KPLC, your rent landlord. You get this by registering a merchant account with Safaricom.
>
> [PAUSE 1s]
>
> BuyGoods — a four to six digit till number. Simpler: customer pays, no account reference needed. Supermarkets, restaurants, kiosks. Also a merchant account registration.
>
> [PAUSE 1s]
>
> For STK Push, both work. In the API request, you specify TransactionType: Customer PayBill Online or Customer BuyGoods Online. In sandbox, Safaricom gives you a test PayBill — one-seven-four-three-seven-nine — which is what we use throughout this course.

### [SCREEN] 1:30–2:30
Show the "Lipa Na M-Pesa Online" section of the Daraja portal. Highlight the test passkey.

### [VO]
> Concept two: passkey. This is a secret string Safaricom gives you per shortcode. It's not an OAuth secret — this is only used for one thing: building the password for STK push requests.
>
> [PAUSE 1s]
>
> In sandbox, there's one well-known passkey everyone uses. I'll show it on screen. In production, Safaricom gives you a unique passkey when they issue your shortcode. Guard it as carefully as your Consumer Secret.

### [SCREEN] 2:30–4:00
On-screen formula with highlighted colors:
`Password = Base64( Shortcode + Passkey + Timestamp )`

### [ON-SCREEN TEXT] 2:30–4:00
> ```
> Password = Base64( Shortcode + Passkey + Timestamp )
> Timestamp = YYYYMMDDHHmmss  (Africa/Nairobi)
> ```

### [VO]
> Concept three: the password. This is the one that confuses everyone.
>
> [PAUSE 1s]
>
> For every STK push request, you build a password by concatenating three things — your shortcode, your passkey, and a timestamp — and base-sixty-four encoding the result. That's the formula. There's no HMAC, no signing, no PKI. Just string concatenation and base-sixty-four.
>
> [PAUSE 1s]
>
> The timestamp format is Y-Y-Y-Y-M-M-D-D-H-H-M-M-S-S, in Africa Nairobi time, twenty-four-hour. So for October first, twenty twenty-six at ten-fifteen-thirty AM, that's two-zero-two-six-one-zero-zero-one-one-zero-one-five-three-zero.
>
> [PAUSE 1s]
>
> The timestamp has to be within about five minutes of Safaricom's server time. If your server clock drifts, the password becomes invalid and Daraja rejects every request. On a VPS, run time-date-ctl set-ntp true. On a Mac, you're fine by default.

### [SCREEN] 4:00–5:00
Show two implementations side by side: JavaScript and bash.

### [ON-SCREEN TEXT] 4:00–5:00
> ```js
> // JavaScript
> const pwd = Buffer.from(
>   shortcode + passkey + timestamp
> ).toString('base64');
> ```
> ```bash
> # Bash
> echo -n "${CODE}${KEY}${TS}" | base64
> ```

### [VO]
> Here's the implementation in JavaScript — this is what the Code node in our STK push workflow does. Buffer from the three strings concatenated, converted to base-sixty-four. Three lines.
>
> [PAUSE 1s]
>
> Same thing in bash, for sanity testing: echo dash n your three values, pipe to base-sixty-four. The dash n is critical — without it, echo adds a trailing newline that corrupts the password.

### [SCREEN] 5:00–5:40
Live demo: run the computation in a Node REPL.

### [VO]
> Let's compute one right now. Open Node REPL. Shortcode: one-seven-four-three-seven-nine. Passkey — paste in the sandbox passkey. Timestamp — I'll pick a fresh one. Run the formula. We get a base-sixty-four string that looks like gibberish. That's the password Daraja will accept for this request, for the next five minutes.
>
> [PAUSE 1s]
>
> After five minutes, you regenerate. You never cache the password. Every STK push gets a fresh timestamp and a fresh password. We'll see this exact pattern in the Code node in module four.

### [SCREEN] 5:40–6:00
End card.

### [ON-SCREEN TEXT] 5:40–6:00
> **Up next:** The STK Push payload explained

### [VO]
> Shortcode, passkey, password. Now you understand the ingredients. Next lesson we look at the full STK push payload, field by field. See you there.

---

## Lesson 2.4 : Dissecting the STK Push request *(6 min)*

### [SCREEN] 0:00–0:15
Show a full JSON STK push payload on screen with field names labelled.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 2.4 · The STK Push payload**

### [VO]
> Here's a complete STK push payload. Twelve fields. We're going to go through every single one, because getting one of them wrong — and I've seen all twelve go wrong — kills the request with a cryptic error.

### [SCREEN] 0:15–1:30
Highlight BusinessShortCode, Password, Timestamp.

### [ON-SCREEN TEXT] 0:15–1:30
> ```json
> {
>   "BusinessShortCode": 174379,
>   "Password": "<base64>",
>   "Timestamp": "20261001101530",
>   ...
> }
> ```

### [VO]
> Field one: BusinessShortCode. Integer. Your PayBill or Till. In sandbox, one-seven-four-three-seven-nine. Watch the type — if you send it as a string, some Daraja endpoints accept it, others return a four hundred. Always send it as a number.
>
> [PAUSE 1s]
>
> Field two: Password. The base-sixty-four we computed last lesson. String.
>
> [PAUSE 1s]
>
> Field three: Timestamp. The same timestamp used to build the password. String. Must match exactly — down to the second — or the password won't match.

### [SCREEN] 1:30–2:30
Highlight TransactionType.

### [ON-SCREEN TEXT] 1:30–2:30
> ```json
> "TransactionType": "CustomerPayBillOnline"
> // or
> "TransactionType": "CustomerBuyGoodsOnline"
> ```

### [VO]
> Field four: TransactionType. Two legal values. CustomerPayBillOnline for PayBill shortcodes — this is what you'll use ninety percent of the time. CustomerBuyGoodsOnline for till numbers.
>
> [PAUSE 1s]
>
> If your shortcode is a PayBill but you send BuyGoods, you get a cryptic "Bad Request - Invalid TransactionType" error. Match the type to your shortcode.

### [SCREEN] 2:30–3:30
Highlight Amount, PartyA, PartyB, PhoneNumber.

### [ON-SCREEN TEXT] 2:30–3:30
> ```json
> "Amount": 100,
> "PartyA": 254708374149,
> "PartyB": 174379,
> "PhoneNumber": 254708374149
> ```

### [VO]
> Field five: Amount. Integer. Shillings, no decimals. The minimum is one. The maximum per transaction in production is seventy thousand for most shortcodes. Fractional amounts — like fifty shillings and fifty cents — will be rejected. If you need fractional pricing, round at the application layer.
>
> [PAUSE 1s]
>
> Field six: PartyA. The payer's phone number. Format two-five-four-seven-X-X-X-X-X-X-X-X-X, as a number.
>
> [PAUSE 1s]
>
> Field seven: PartyB. The receiver — your shortcode. Yes, this duplicates BusinessShortCode. No, I don't know why Safaricom designed it this way. Just make them match.
>
> [PAUSE 1s]
>
> Field eight: PhoneNumber. Same as PartyA. Another duplicate. Make them match.
>
> [PAUSE 1s]
>
> Why three fields for essentially two values? Historical. Daraja's internals share schemas across APIs — in B2C, these three fields are different. For STK push, redundant. Live with it.

### [SCREEN] 3:30–4:30
Highlight CallBackURL.

### [ON-SCREEN TEXT] 3:30–4:30
> ```json
> "CallBackURL": "https://your-domain/webhook/mpesa/stk-callback"
> ```

### [VO]
> Field nine: CallBackURL. The URL Safaricom will POST the final result to. Three absolute requirements.
>
> [PAUSE 1s]
>
> One: must be HTTPS. HTTP is rejected outright in production.
>
> [PAUSE 1s]
>
> Two: must be publicly reachable. Daraja's servers call you — localhost doesn't work. In local dev, this is where ngrok comes in.
>
> [PAUSE 1s]
>
> Three: must respond with HTTP two hundred within thirty seconds. If you respond with a four hundred, Safaricom marks your endpoint unhealthy. If you take too long, same thing. We'll build the callback endpoint in module five with "respond on receive" mode so it always returns two hundred instantly.
>
> [PAUSE 1s]
>
> Also — Safaricom does NOT retry callbacks. If your endpoint is down when the callback is sent, you miss it. That's why module six's reconciliation workflow exists.

### [SCREEN] 4:30–5:20
Highlight AccountReference and TransactionDesc.

### [ON-SCREEN TEXT] 4:30–5:20
> ```json
> "AccountReference": "ORDER-1001",  // max 12 chars
> "TransactionDesc": "Payment"       // max 13 chars
> ```

### [VO]
> Field ten: AccountReference. A short string you choose. Max twelve characters. Shows up on the customer's phone during the prompt and on their M-Pesa statement after. Use it to identify what they're paying for — ORDER dash one thousand and one, or STUDENT dash a-two-four, or INVOICE five-five.
>
> [PAUSE 1s]
>
> Field eleven: TransactionDesc. Also customer-facing. Max thirteen characters. Something like "Course payment" or "Fees Term 2".
>
> [PAUSE 1s]
>
> Both fields are strict on length. Fourteen characters in TransactionDesc returns an "Invalid Transaction Description" error. We'll enforce the limit in our validation Code node.

### [SCREEN] 5:20–5:50
Complete payload shown with all fields highlighted.

### [VO]
> Twelve fields. We skipped BusinessShortCode because that's field one duplicated with PartyB. Memorize this payload — you'll build it from scratch in module four, by hand, in a Code node.

### [SCREEN] 5:50–6:00
End card.

### [ON-SCREEN TEXT] 5:50–6:00
> **Up next:** The callback payload explained

### [VO]
> Next lesson: what Safaricom sends back. The callback shape has its own quirks. See you there.

---

## Lesson 2.5 : The callback payload *(5 min)*

### [SCREEN] 0:00–0:15
Full callback JSON on screen.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 2.5 · The callback payload**

### [VO]
> We've seen the request shape. Now the response. This is what Safaricom POSTs to your callback URL after the customer either pays, cancels, or runs out of time.

### [SCREEN] 0:15–1:30
Show full success callback JSON with nested structure.

### [ON-SCREEN TEXT] 0:15–1:30
> ```json
> {
>   "Body": {
>     "stkCallback": {
>       "MerchantRequestID": "29115-...",
>       "CheckoutRequestID": "ws_CO_...",
>       "ResultCode": 0,
>       "ResultDesc": "The service request is processed successfully.",
>       "CallbackMetadata": {
>         "Item": [
>           { "Name": "Amount", "Value": 1 },
>           { "Name": "MpesaReceiptNumber", "Value": "SGH1A2B3C4" },
>           { "Name": "TransactionDate", "Value": 20261001101545 },
>           { "Name": "PhoneNumber", "Value": 254708374149 }
>         ]
>       }
>     }
>   }
> }
> ```

### [VO]
> Here's a successful callback. Observe three annoying things about this shape.
>
> [PAUSE 1s]
>
> First, everything is nested inside Body dot stkCallback. Two layers of wrapping before you get to anything useful. Our callback workflow will unwrap this immediately in a Code node.
>
> [PAUSE 1s]
>
> Second, the useful fields — the amount, the receipt number — are not plain JSON properties. They're inside an array called Item, where each entry has a Name and a Value. So to get the receipt number, you can't just read dot MpesaReceiptNumber — you have to iterate the Item array, find the entry where Name equals MpesaReceiptNumber, then read its Value.
>
> [PAUSE 1s]
>
> Third, CallbackMetadata is only present on success. If the user cancelled, there is no CallbackMetadata key at all. You have to check its existence before iterating.

### [SCREEN] 1:30–2:30
Show the parsing Code node pattern.

### [ON-SCREEN TEXT] 1:30–2:30
> ```js
> const cb = $json.body.Body.stkCallback;
> const meta = {};
> for (const i of cb.CallbackMetadata?.Item ?? []) {
>   meta[i.Name] = i.Value;
> }
> // meta.Amount, meta.MpesaReceiptNumber, etc.
> ```

### [VO]
> Here's the parsing pattern we use. Loop the Item array, build a flat object keyed by Name. Now meta dot Amount, meta dot MpesaReceiptNumber, meta dot PhoneNumber are all directly accessible. This is the first node of our callback workflow in module five.

### [SCREEN] 2:30–3:30
Show a failure callback (cancelled by user).

### [ON-SCREEN TEXT] 2:30–3:30
> ```json
> {
>   "Body": {
>     "stkCallback": {
>       "MerchantRequestID": "...",
>       "CheckoutRequestID": "ws_CO_...",
>       "ResultCode": 1032,
>       "ResultDesc": "Request cancelled by user"
>     }
>   }
> }
> ```

### [VO]
> Here's a failure. Same wrapper, but no CallbackMetadata. ResultCode non-zero. ResultDesc is a human-readable reason.
>
> [PAUSE 1s]
>
> ResultCode zero means success. Anything else means some kind of failure. We'll see the full table of codes in the next lesson.

### [SCREEN] 3:30–4:00
Highlight CheckoutRequestID.

### [VO]
> Critical field: CheckoutRequestID. This is the one you use to match the callback back to the original request. When we fire the STK push, Daraja returns a CheckoutRequestID synchronously. We save it in our database as the primary key. When the callback arrives, we look up that row by CheckoutRequestID and update the status.
>
> [PAUSE 1s]
>
> MerchantRequestID is also returned, but you rarely use it. CheckoutRequestID is the one that matters.

### [SCREEN] 4:00–4:40
Important box: respond immediately.

### [ON-SCREEN TEXT] 4:00–4:40
> ⚠️ **Callback best practice:**
> Respond 200 OK **immediately**.
> Process async.
> No retries from Safaricom.

### [VO]
> One rule that saves your business. Your callback endpoint should return two hundred OK the moment the request arrives. Don't wait for the database update. Don't wait for the SMS send. Return two hundred, then process asynchronously.
>
> [PAUSE 1s]
>
> Why? Safaricom does not retry callbacks. They send it once. If your endpoint is slow, times out, or errors, they will NOT send it again. You just lost that transaction's final status.
>
> [PAUSE 1s]
>
> In n8n, this is controlled by the Webhook node's Response Mode. We set it to "on received". The two hundred fires instantly, and the rest of the workflow runs in the background. We'll build this in module five.

### [SCREEN] 4:40–5:00
End card.

### [ON-SCREEN TEXT] 4:40–5:00
> **Up next:** Daraja result codes decoded

### [VO]
> Next up: the result codes. There are about twenty you'll see in the wild. We'll cover the twelve that actually matter.

---

## Lesson 2.6 : Result codes you'll actually see *(5 min)*

### [SCREEN] 0:00–0:15
Full result-code reference table on screen.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 2.6 · Daraja result codes**

### [VO]
> Safaricom documents dozens of result codes. In practice, you'll see twelve. Memorize these — they come up in support tickets constantly.

### [SCREEN] 0:15–1:00
Highlight code 0.

### [ON-SCREEN TEXT] 0:15–1:00
> **0 — Success**
> Mark transaction paid. Send receipt.

### [VO]
> Zero: success. The customer entered their PIN, the money moved. Mark the transaction paid, send a receipt, celebrate. In sandbox, with the test number, this is what you'll see most of the time.

### [SCREEN] 1:00–1:30
Highlight code 1.

### [ON-SCREEN TEXT] 1:00–1:30
> **1 — Insufficient funds**
> Not an error on your end.

### [VO]
> One: insufficient funds. Customer tried to pay but didn't have the balance. Not your fault. In your UI, show a friendly "please top up and try again". Don't retry automatically — the result code was clear.

### [SCREEN] 1:30–2:30
Highlight codes 17 and 20.

### [ON-SCREEN TEXT] 1:30–2:30
> **17 — Internal M-Pesa error**
> **20 — Unable to lock subscriber**
> Both: transient. Retry via STK Query.

### [VO]
> Seventeen and twenty are transient failures on Safaricom's side. Seventeen is "internal M-Pesa error". Twenty is "unable to lock subscriber" — means the customer is in the middle of another transaction. Both are safe to retry — give it thirty seconds, then query status via stkpushquery. If still failing, log and move on.

### [SCREEN] 2:30–3:30
Highlight code 1032.

### [ON-SCREEN TEXT] 2:30–3:30
> **1032 — User cancelled**
> Mark cancelled. Do NOT retry.

### [VO]
> One-oh-three-two: user cancelled. They pressed cancel on their phone instead of entering PIN. This is a hard no. Mark the transaction cancelled, do not retry — if you resend an STK push after they explicitly cancelled, they'll be annoyed.
>
> [PAUSE 1s]
>
> UX recommendation: in your app, show "payment cancelled" with a "try again" button. Let the user choose to retry.

### [SCREEN] 3:30–4:00
Highlight code 1037.

### [ON-SCREEN TEXT] 3:30–4:00
> **1037 — DS timeout, user didn't respond**

### [VO]
> One-oh-three-seven: DS timeout. User didn't enter PIN within sixty seconds. Phone was in their pocket, they got distracted, whatever. Treat this like cancellation — mark it timeout, let them retry.

### [SCREEN] 4:00–4:30
Highlight code 2001.

### [ON-SCREEN TEXT] 4:00–4:30
> **2001 — Wrong PIN**
> User entered wrong PIN. Mark failed.

### [VO]
> Two thousand one: wrong PIN. User typed the wrong M-Pesa PIN. Daraja won't retry — you'd have to send a fresh STK push, and if you do that automatically, the customer may be annoyed. UX: show "incorrect PIN, try again?" with a retry button.

### [SCREEN] 4:30–5:00
Full table reappears on screen.

### [VO]
> One pattern across all these codes. Zero is success. One, two thousand one, and one-oh-three-two are "don't retry". Seventeen and twenty are "retry once". Everything else — log it, surface it in your dashboard, and investigate manually.
>
> [PAUSE 1s]
>
> The handbook PDF in your repo has the complete table with recommended handling. Keep it bookmarked. Next lesson: common pitfalls that waste days when you don't know about them.

---

## Lesson 2.7 : Common pitfalls & how to avoid them *(5 min)*

### [SCREEN] 0:00–0:15
Big "DANGER" sign graphic.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 2.7 · Daraja pitfalls**

### [VO]
> Last lesson of module two. These are the pitfalls that have cost me weekends. If I'd watched this video four years ago I'd have shipped integrations twice as fast. Let's save you the pain.

### [SCREEN] 0:15–1:00
Highlight: timestamp drift.

### [ON-SCREEN TEXT] 0:15–1:00
> **Pitfall 1: Clock drift**
> Server clock > 5 min off → every STK push fails.

### [VO]
> Pitfall one: clock drift. Your VPS is off by six minutes. Every password you generate is based on a timestamp Daraja considers invalid. Every single STK push fails with a cryptic error, usually something like "invalid access token" even though the token is fine.
>
> [PAUSE 1s]
>
> Fix: on Ubuntu, "sudo timedatectl set-ntp true". That's it. Permanent fix. On Docker Compose, make sure you set the timezone env var — we do that in our compose file.

### [SCREEN] 1:00–1:50
Highlight: using sandbox base URL in production.

### [ON-SCREEN TEXT] 1:00–1:50
> **Pitfall 2: Wrong base URL**
> Sandbox URL + production creds = silent failure

### [VO]
> Pitfall two: wrong base URL. You go to production. You switch Consumer Key and Secret. You forget to switch the base URL. Now you're sending production credentials to the sandbox endpoint. The sandbox returns a token because it looks valid, but no actual money moves. You think your integration is live. It's not.
>
> [PAUSE 1s]
>
> Fix: in our dot env, MPESA_BASE_URL and MPESA_ENV are separate variables. In module seven, we add a startup check that logs the environment loudly. "Running in SANDBOX" or "Running in PRODUCTION" in giant letters. If you ever see "SANDBOX" when you expected production, you catch it immediately.

### [SCREEN] 1:50–2:40
Highlight: callback URL not public.

### [ON-SCREEN TEXT] 1:50–2:40
> **Pitfall 3: Localhost callback URL**
> Daraja can't reach your laptop.

### [VO]
> Pitfall three: localhost callback URL. In sandbox, you set CallBackURL to localhost five-six-seven-eight. Daraja returns success. You expect the callback to arrive. It never does. Because Daraja's servers in some data center cannot reach your laptop on localhost.
>
> [PAUSE 1s]
>
> Fix for local dev: ngrok. The docker compose profile called "tunnel" starts ngrok automatically. Your webhook becomes publicly reachable at a dot ngrok-free dot app URL. We'll do this together in module five.
>
> [PAUSE 1s]
>
> Fix for production: a real domain pointing to your VPS with HTTPS. Our vps-setup script handles cert issuance via Let's Encrypt.

### [SCREEN] 2:40–3:30
Highlight: callback response time.

### [ON-SCREEN TEXT] 2:40–3:30
> **Pitfall 4: Slow callback endpoint**
> Takes > 30s → Safaricom marks you unhealthy.

### [VO]
> Pitfall four: slow callback endpoint. Your callback does a database write, then calls a WhatsApp API to send a confirmation, then renders a PDF receipt. Total time: thirty-two seconds. Safaricom times out at thirty. They mark your endpoint unhealthy. Future callbacks start getting delayed.
>
> [PAUSE 1s]
>
> Fix: return two hundred immediately, do everything else asynchronously. In n8n, that's Response Mode: on received. The webhook returns two hundred the moment the request arrives — regardless of whether downstream nodes have run.

### [SCREEN] 3:30–4:10
Highlight: whitespace in credentials.

### [ON-SCREEN TEXT] 3:30–4:10
> **Pitfall 5: Trailing whitespace in secrets**
> Copy-paste from Daraja portal → invisible newline.

### [VO]
> Pitfall five: trailing whitespace. You copy Consumer Secret from the Daraja portal and paste it into dot env. The portal added an invisible newline at the end. Every OAuth attempt returns "invalid credentials". You spend two hours convinced your credentials are revoked.
>
> [PAUSE 1s]
>
> Fix: when editing dot env, double-click to select the value — never triple-click or shift-end which grab the newline. If in doubt, use "echo dash n your value pipe xxd" to inspect for stray bytes.

### [SCREEN] 4:10–4:40
Highlight: phone format.

### [ON-SCREEN TEXT] 4:10–4:40
> **Pitfall 6: Phone format**
> `0712...` or `+254712...` → rejected.
> Only `254712...` works.

### [VO]
> Pitfall six: phone format. You pass phone as zero-seven-one-two. Daraja returns "invalid party A". Must be two-five-four with no plus and no leading zero.
>
> [PAUSE 1s]
>
> Fix: we normalize in our validation Code node — the same code we built in lesson one-five. Zero prefix becomes two-five-four. Plus prefix dropped. Just-seven-prefix gets two-five-four prepended.

### [SCREEN] 4:40–5:00
Module summary slide.

### [ON-SCREEN TEXT] 4:40–5:00
> **Module 2 recap:**
> ✅ Daraja basics
> ✅ Account created
> ✅ Shortcode + passkey + password
> ✅ STK push payload mastered
> ✅ Callback shape understood
> ✅ Result codes memorized
> ✅ Six pitfalls dodged

### [VO]
> Module two complete. You now understand Daraja better than most people who've been integrating with it for years. In module three, we leave theory and build our first n8n workflow: the OAuth sub-workflow that every other workflow in this course will call. See you there.

### [SCREEN] 5:00–5:20
End card.

### [ON-SCREEN TEXT] 5:00–5:20
> **Module 3 →** OAuth in n8n

---

## Recording checklist for Module 2

- [ ] Daraja portal demo account ready (don't show real production creds)
- [ ] All credentials in demos blurred in post-processing
- [ ] Sequence diagrams prepared in Excalidraw (export as PNG)
- [ ] Payload JSON snippets rendered in Carbon.now.sh
- [ ] Result code table designed in Figma / Canva
- [ ] Terminal theme consistent with Module 1
- [ ] Pitfall section uses a "warning" visual motif consistently

