# Module 9 : Beyond STK Push

**Target runtime:** ~30 min · **Lessons:** 4 · **Combined word count:** ~3,800

---

## Lesson 9.1 : B2C : paying money out *(10 min)*

### [SCREEN] 0:00–0:15
Title card.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 9.1 : B2C payments**

### [VO]
> Welcome to module nine. STK push is for receiving money. B2C is for sending it out. Payroll. Refunds. Winnings. Loan disbursements. Same Daraja API family, slightly different mechanics. Let's cover the essentials.

### [SCREEN] 0:15–1:30
Compare STK push vs B2C flow.

### [ON-SCREEN TEXT] 0:15–1:30
> **STK Push:** Prompt → Customer enters PIN → You get paid
> **B2C:** You trigger → Money arrives in customer's wallet (no PIN)

### [VO]
> Key difference. STK push is customer-authorized — the customer enters their PIN. B2C is business-authorized — your business enters your initiator credentials. The customer just receives money. No action required from them.
>
> [PAUSE 1s]
>
> This is powerful and dangerous. Powerful because disbursement is instant. Dangerous because a bug in your workflow could send money to the wrong recipient. Treat B2C with extra care.

### [SCREEN] 1:30–3:00
Prerequisites for B2C.

### [ON-SCREEN TEXT] 1:30–3:00
> **B2C requires:**
> • M-Pesa Business account with B2C enabled
> • InitiatorName + InitiatorPassword
> • SecurityCredential (RSA-encrypted password)
> • Separate shortcode (sometimes)
> • Float on your till

### [VO]
> Prerequisites. B2C is not available in the free sandbox the same way STK push is — Safaricom gives you specific B2C test credentials. Request them from your account manager.
>
> [PAUSE 1s]
>
> You need an InitiatorName, an InitiatorPassword, and a SecurityCredential. The SecurityCredential is your initiator password encrypted with Safaricom's public RSA key — SandboxCertificate dot cer for sandbox, production cert for production. One-time encryption with Node's crypto module.
>
> [PAUSE 1s]
>
> You also need actual float sitting on your business till. B2C debits from this float. If float is empty, every B2C fails. We'll build a float monitor in the next lesson.

### [SCREEN] 3:00–5:00
Walk through the B2C payload.

### [ON-SCREEN TEXT] 3:00–5:00
> ```json
> {
>   "InitiatorName": "testapi",
>   "SecurityCredential": "<RSA-encrypted>",
>   "CommandID": "BusinessPayment",
>   "Amount": 100,
>   "PartyA": 600987,
>   "PartyB": 254708374149,
>   "Remarks": "Refund order 123",
>   "QueueTimeOutURL": "...",
>   "ResultURL": "...",
>   "Occasion": ""
> }
> ```

### [VO]
> The B2C payload. Notice differences from STK push.
>
> [PAUSE 1s]
>
> InitiatorName and SecurityCredential replace Password and Timestamp. CommandID distinguishes business payment, salary payment, and promotional payment — each has slightly different handling. PartyA is YOUR shortcode. PartyB is the customer phone. Remarks appears on their M-Pesa statement.
>
> [PAUSE 1s]
>
> QueueTimeOutURL and ResultURL — two separate callback URLs. Daraja's B2C queues the request asynchronously; the result callback fires when the actual money movement completes. Build both URLs in your workflow.

### [SCREEN] 5:00–6:30
RSA-encrypt the initiator password.

### [ON-SCREEN TEXT] 5:00–6:30
> ```js
> import crypto from 'crypto';
> import { readFileSync } from 'fs';
> const certPem = readFileSync('/path/to/SandboxCertificate.cer');
> const encrypted = crypto.publicEncrypt(
>   { key: certPem, padding: crypto.constants.RSA_PKCS1_PADDING },
>   Buffer.from('your-initiator-password')
> );
> const securityCredential = encrypted.toString('base64');
> ```

### [VO]
> The SecurityCredential one-time computation. In a Code node — or a one-off Node script — load the Safaricom certificate PEM file, encrypt your initiator password with it using RSA PKCS one padding, base-sixty-four encode the result. That's your SecurityCredential.
>
> [PAUSE 1s]
>
> Compute it once per environment. Store it as an env var. Re-use forever — until the initiator password rotates. We don't want to encrypt per-request because it's expensive and the result doesn't change.

### [SCREEN] 6:30–8:00
B2C workflow in n8n.

### [VO]
> Workflow sketch. Webhook triggered by whatever upstream event — refund request, payroll button click. Validate: recipient phone, amount within business limits, authorized initiator.
>
> [PAUSE 1s]
>
> Execute Workflow to the auth sub-workflow we built. Build B2C payload. HTTP Request POST to the B2C endpoint. Postgres insert the pending disbursement with status "queued".
>
> [PAUSE 1s]
>
> Two callback workflows: one for ResultURL on success, one for QueueTimeOutURL on timeout. Update row accordingly.

### [SCREEN] 8:00–9:00
Safety guardrails.

### [ON-SCREEN TEXT] 8:00–9:00
> **B2C safeguards:**
> ✅ Max amount per day per recipient
> ✅ Max total disbursed per day (circuit breaker)
> ✅ 2-person approval for amounts > threshold
> ✅ Audit every attempt

### [VO]
> Safety guardrails. Because B2C spends your money without customer confirmation.
>
> [PAUSE 1s]
>
> Max amount per recipient per day. Max total disbursed per day — a circuit breaker that stops all B2C if something goes rogue. Two-person approval workflow for amounts above a threshold — the request creates a pending approval, a second user approves via a Slack button, then the actual STK fires. Audit every attempt whether successful, queued, or failed.

### [SCREEN] 9:00–10:00
End card.

### [ON-SCREEN TEXT] 9:00–10:00
> **Up next:** Checking balance and float

### [VO]
> B2C done. Next lesson: querying your float balance before you try to pay anyone. See you there.

---

## Lesson 9.2 : Account Balance and Transaction Status *(7 min)*

### [SCREEN] 0:00–0:15
Title card.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 9.2 : Balance & status**

### [VO]
> Two utility APIs. Account Balance queries your float. Transaction Status looks up any transaction by its Daraja ID. Both are simple once you understand B2C — they use the same InitiatorName and SecurityCredential pattern.

### [SCREEN] 0:15–1:30
Account Balance payload.

### [ON-SCREEN TEXT] 0:15–1:30
> ```json
> {
>   "InitiatorName": "testapi",
>   "SecurityCredential": "<RSA>",
>   "CommandID": "AccountBalance",
>   "PartyA": 600987,
>   "IdentifierType": 4,
>   "Remarks": "Check balance",
>   "QueueTimeOutURL": "...",
>   "ResultURL": "..."
> }
> ```

### [VO]
> Account Balance payload. Looks like B2C minus the recipient and amount. Returns an asynchronous callback with your float balance by account type — utility account, charges paid account, working account.
>
> [PAUSE 1s]
>
> Fire this via a scheduled workflow every hour. Store the balance in a Postgres table. Alert if below a threshold — say, if your working account float is under ten thousand shillings, Slack ops immediately.

### [SCREEN] 1:30–3:00
Build the float monitor workflow.

### [VO]
> Workflow sketch. Schedule hourly. Execute Workflow auth. Build Account Balance payload. HTTP Request POST. Return success response immediately — the actual balance arrives via ResultURL callback.
>
> [PAUSE 1s]
>
> Separate callback workflow: receives balance, parses the WorkingAccount AvailableFunds field, inserts into mpesa_float_history table. Checks threshold. If below, send ops alert.

### [SCREEN] 3:00–4:30
Transaction Status API.

### [ON-SCREEN TEXT] 3:00–4:30
> **Transaction Status (lookup any TX):**
> `POST /mpesa/transactionstatus/v1/query`
> Needs: TransactionID or OriginalConversationID
> Works weeks after original transaction

### [VO]
> Transaction Status. Different from stkpushquery — this one can look up ANY M-Pesa transaction by its ID, including transactions from weeks ago. Useful for customer service: "I paid two Tuesdays ago, I have the receipt, where's my service?"
>
> [PAUSE 1s]
>
> Build a workflow with a webhook that takes a receipt number — like the M-Pesa confirmation code "SGH1A2B3C4" — and queries Transaction Status. Returns the full details to your CS portal.

### [SCREEN] 4:30–6:00
CS lookup portal flow.

### [VO]
> CS portal flow. CS agent gets a complaint. Opens internal tool. Enters receipt number. Internal tool calls our n8n workflow. Workflow calls Transaction Status. Returns full details — sender, receiver, amount, time, status.
>
> [PAUSE 1s]
>
> Agent sees whether the transaction was successful, who it went to, what time, what reference. Resolves most "where's my money" tickets in one minute.

### [SCREEN] 6:00–7:00
End card.

### [ON-SCREEN TEXT] 6:00–7:00
> **Up next:** C2B — register URL

### [VO]
> Two utility APIs down. Next: C2B. Customer-initiated payments without an STK prompt. See you there.

---

## Lesson 9.3 : C2B : Register URL and unprompted payments *(6 min)*

### [SCREEN] 0:00–0:15
Title card.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 9.3 : Customer-to-Business**

### [VO]
> C2B handles unprompted payments. A customer pays your till from their M-Pesa menu — "lipa na M-Pesa", "pay bill", enter your shortcode and account number. Daraja notifies you via callback. You update their account.

### [SCREEN] 0:15–1:30
Register the two URLs.

### [ON-SCREEN TEXT] 0:15–1:30
> ```json
> // POST /mpesa/c2b/v1/registerurl
> {
>   "ShortCode": 600987,
>   "ResponseType": "Completed",
>   "ConfirmationURL": "https://your-domain/webhook/mpesa/c2b-confirm",
>   "ValidationURL": "https://your-domain/webhook/mpesa/c2b-validate"
> }
> ```

### [VO]
> Setup. Call the Register URL endpoint ONCE per shortcode. Give Daraja two URLs. Validation: optional pre-payment check. Confirmation: post-payment notification. ResponseType "Completed" means Safaricom auto-accepts if your validation URL is unreachable.
>
> [PAUSE 1s]
>
> Build a one-shot workflow with a manual trigger that calls Register URL. Run once per environment setup.

### [SCREEN] 1:30–3:00
Validation URL workflow.

### [VO]
> Validation workflow. Webhook receives the pre-payment payload. Code node checks: is this account number valid in our DB? If yes, respond with ResultCode zero. If no, respond with ResultCode C-two-B zero zero zero one one — a special code that tells M-Pesa to reject the payment with a specific error message to the customer.
>
> [PAUSE 1s]
>
> Use this to prevent payments to non-existent accounts. The customer sees "invalid account" before they're charged. Saves refund workload.

### [SCREEN] 3:00–4:30
Confirmation URL workflow.

### [VO]
> Confirmation workflow. Fires AFTER the customer has paid. Payload includes TransID, Amount, MSISDN, BillRefNumber — the account number.
>
> [PAUSE 1s]
>
> Code node parses it. Postgres: insert into transactions table and update the user's account balance. Return ResultCode zero to acknowledge receipt.
>
> [PAUSE 1s]
>
> Important: respond fast. Same thirty-second rule as STK callbacks. Use Response Mode "On Received".

### [SCREEN] 4:30–5:30
Use case: SACCO loan repayments.

### [VO]
> Common use case: SACCO loan repayments. Members pay via M-Pesa with their member number as the account reference. The confirmation workflow matches member number to the SACCO database and reduces their loan balance.
>
> [PAUSE 1s]
>
> Fully automated. No staff tracking payments by hand. We've built this for three SACCOs.

### [SCREEN] 5:30–6:00
End card.

### [ON-SCREEN TEXT] 5:30–6:00
> **Up next:** Reversals

### [VO]
> C2B covered. Final API: reversals. See you there.

---

## Lesson 9.4 : Reversals and where to go next *(7 min)*

### [SCREEN] 0:00–0:15
Title card.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 9.4 : Reversals + next steps**

### [VO]
> Reversals. A customer paid in error. You want to refund the exact transaction. Daraja offers reversal within seven days of the original transaction.

### [SCREEN] 0:15–1:30
Reversal payload.

### [ON-SCREEN TEXT] 0:15–1:30
> ```json
> {
>   "InitiatorName": "...",
>   "SecurityCredential": "...",
>   "CommandID": "TransactionReversal",
>   "TransactionID": "SGH1A2B3C4",
>   "Amount": 100,
>   "ReceiverParty": 600987,
>   "RecieverIdentifierType": 11,
>   "ResultURL": "...",
>   "QueueTimeOutURL": "...",
>   "Remarks": "Refund for order ABC",
>   "Occasion": ""
> }
> ```

### [VO]
> Payload. TransactionID is the original M-Pesa receipt number. Amount must match the original. ReceiverParty is YOUR shortcode. The reversal returns the money to the customer's phone.
>
> [PAUSE 1s]
>
> Note the misspelling: "RecieverIdentifierType" with "cie" not "cei". Yes, Safaricom's API has a typo. If you spell it correctly, Daraja rejects. Not a joke.

### [SCREEN] 1:30–3:00
Reversal workflow.

### [VO]
> Workflow. Webhook: refund request from your admin tool. Validation: original transaction exists in our DB, not already reversed, original was successful, less than seven days ago.
>
> [PAUSE 1s]
>
> Execute Workflow for auth. Build reversal payload. HTTP Request POST. Save pending reversal row. Two callback workflows for ResultURL and QueueTimeOutURL to resolve the status.

### [SCREEN] 3:00–4:30
Two-person approval for reversals.

### [VO]
> Important: reversals are fraud vectors. A bad actor with access to your admin tool could refund themselves repeatedly. Always build two-person approval for reversals above a threshold.
>
> [PAUSE 1s]
>
> Also log every reversal attempt with the admin user's identity. Compliance will appreciate it.

### [SCREEN] 4:30–6:00
Where to go next: broader n8n ecosystem.

### [ON-SCREEN TEXT] 4:30–6:00
> **Expand your n8n skills:**
> ✓ AI nodes (OpenAI, Claude, local LLMs)
> ✓ Database CRUD workflows
> ✓ Multi-tenant SaaS patterns
> ✓ External triggers (webhooks everywhere)

### [VO]
> Where to go next. Three directions.
>
> [PAUSE 1s]
>
> One: AI nodes. n8n has OpenAI, Claude, local LLM nodes. Combine with payment data — "summarize this customer's payment history", "detect anomalies", "classify refund requests". Massive leverage.
>
> [PAUSE 1s]
>
> Two: multi-tenant SaaS patterns. Build a single n8n instance that handles payments for multiple business clients. Separate credentials per tenant. Dynamic routing. A whole business model.
>
> [PAUSE 1s]
>
> Three: other African payments. Airtel Money, MTN MoMo, Flutterwave, Paystack. Same patterns as Daraja — OAuth, webhook, callback — different endpoints. Easy to adapt once you've built one.

### [SCREEN] 6:00–7:00
End card. Module 9 summary.

### [ON-SCREEN TEXT] 6:00–7:00
> **Module 9 recap:**
> ✅ B2C disbursements
> ✅ Account Balance monitor
> ✅ Transaction Status lookups
> ✅ C2B unprompted payments
> ✅ Reversals (with the typo)

### [VO]
> Module nine done. You've seen the full Daraja landscape. One final module ahead — module ten — on how to package what you've learned into a service you can sell. See you there.

---

## Recording checklist for Module 9

- [ ] B2C sandbox credentials requested & stored
- [ ] RSA cert for SecurityCredential ready
- [ ] Example float threshold alert tested
- [ ] Reversal typo (`RecieverIdentifierType`) called out clearly

