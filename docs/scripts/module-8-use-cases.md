# Module 8 : Real-World Use Cases

**Target runtime:** ~45 min · **Lessons:** 5 · **Combined word count:** ~5,500

---

## Lesson 8.1 : Use case A : WooCommerce e-commerce checkout *(10 min)*

### [SCREEN] 0:00–0:15
Title card.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 8.1 : WooCommerce + M-Pesa**

### [VO]
> Welcome to module eight. Over the next forty-five minutes we build five real integrations. Not toy examples. Working checkouts, billing, portals. Pick the one closest to your use case and ship it this week.
>
> [PAUSE 1s]
>
> First up: WooCommerce. The most-requested integration in Kenya because thousands of businesses run on WordPress and WooCommerce but struggle to add real M-Pesa payments without paying monthly to a plugin.

### [SCREEN] 0:30–2:00
Import `workflows/use-cases/ecommerce.json`.

### [VO]
> Import ecommerce dot json. Three nodes. Webhook, Code, Execute Workflow. We wire WooCommerce to fire the webhook on every new order.

### [SCREEN] 2:00–3:30
Configure WooCommerce webhook.

### [ON-SCREEN TEXT] 2:00–3:30
> **WooCommerce → Settings → Advanced → Webhooks**
> Topic: Order created
> Delivery URL: `https://your-domain/webhook/woo/order-created`

### [VO]
> In WordPress admin, go to WooCommerce, Settings, Advanced, Webhooks. Add webhook. Topic: order dot created. Delivery URL: your n8n webhook. Secret: a shared random string you'll verify.
>
> [PAUSE 1s]
>
> Woo fires a POST with the whole order object every time an order is placed. Our Code node extracts billing phone, total, and order ID.

### [SCREEN] 3:30–5:00
Walk through the Code node.

### [VO]
> Code node. Pulls order from the body. Phone from billing dot phone. Amount from the order total — Woo sends it as a float with decimals; we round because Daraja wants integers. Reference WOO dash the order ID. Description "Order" space the ID.
>
> [PAUSE 1s]
>
> Then returns a payload. Next node — Execute Workflow — fires our shared STK push sub-workflow with that payload. Done.

### [SCREEN] 5:00–6:30
Handle the "pay with M-Pesa" button on checkout.

### [VO]
> One missing piece. By default, WooCommerce fires the order-created webhook after the customer clicks "place order", regardless of payment method. We want to only fire STK push when the method is "M-Pesa".
>
> [PAUSE 1s]
>
> Add an IF node after the Code node. Condition: order dot payment_method equals "mpesa_custom". Only fire STK push on true. Install the "WooCommerce Payment Gateway" base plugin and register a custom gateway called "M-Pesa STK Push" that just stores the method on the order.
>
> [PAUSE 1s]
>
> We don't go into the PHP plugin code in this course, but the handbook has a copy-paste snippet you can drop into functions dot php.

### [SCREEN] 6:30–7:30
Handle the callback: mark order paid.

### [ON-SCREEN TEXT] 6:30–7:30
> **In your callback workflow:**
> IF reference starts with "WOO-"
> → PUT to WooCommerce REST API:
> &nbsp;&nbsp;`/wp-json/wc/v3/orders/{id}` with status=processing

### [VO]
> On the callback workflow, after the DB update, add a branch. If the reference starts with WOO-, extract the order ID and call the WooCommerce REST API to update the order status to "processing" or "completed". That triggers Woo's own emails and inventory updates.

### [SCREEN] 7:30–9:00
Test the full loop.

### [VO]
> Test. Add a product to a test WooCommerce store. Check out with M-Pesa. Enter your phone. Watch: Woo fires webhook, n8n fires STK push, your phone buzzes, you enter PIN, callback resolves, Woo marks order processing, customer gets email. End to end.
>
> [PAUSE 1s]
>
> Four minutes of work in n8n. Zero plugin cost. Full control.

### [SCREEN] 9:00–10:00
End card.

### [ON-SCREEN TEXT] 9:00–10:00
> **Up next:** SaaS subscription billing

### [VO]
> One down. Next: SaaS billing. Monthly recurring charges to your customers. See you there.

---

## Lesson 8.2 : Use case B : SaaS subscription billing *(9 min)*

### [SCREEN] 0:00–0:15
Import `saas-billing.json`.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 8.2 : Monthly SaaS billing**

### [VO]
> Second use case. SaaS billing. Every month, on a schedule, charge your active subscribers. If they pay, extend their subscription. If they don't, send dunning emails and eventually suspend.

### [SCREEN] 0:15–1:30
Database schema: subscriptions table.

### [ON-SCREEN TEXT] 0:15–1:30
> ```sql
> CREATE TABLE subscriptions (
>   id UUID PRIMARY KEY,
>   phone VARCHAR(15),
>   plan_name TEXT,
>   plan_amount NUMERIC,
>   status TEXT, -- active, past_due, cancelled
>   next_bill_date DATE,
>   -- ...
> );
> ```

### [VO]
> First, a subscriptions table. Phone number as the billing identifier. Plan name and amount. Status: active, past due, or cancelled. Next bill date. That's all you need for a simple SaaS.
>
> [PAUSE 1s]
>
> Schema in the course repo under db slash saas slash schema dot sql.

### [SCREEN] 1:30–3:00
Walk through the workflow.

### [VO]
> Workflow. Schedule trigger: every day at nine AM. Postgres query: find subscriptions where next_bill_date is today and status is active. For each, build an STK push payload. Fire STK push.
>
> [PAUSE 1s]
>
> Reference convention: SUB dash subscription ID. That's how the callback matches back to the subscription for status updates.

### [SCREEN] 3:00–4:30
Callback-side: update subscription on success.

### [VO]
> On the callback workflow, branch on reference starting with SUB-. On success: update subscription's next_bill_date to add a month, status active. On failure: update status to past_due, send dunning email, retry in three days.
>
> [PAUSE 1s]
>
> Dunning logic is a separate workflow. Daily cron that finds past_due subscriptions and re-fires STK push. After three attempts, status becomes "cancelled" and the customer loses access.

### [SCREEN] 4:30–6:00
Handle plan upgrades and downgrades.

### [VO]
> Upgrades. A new workflow with a webhook that your SaaS frontend hits. Updates the subscription's plan amount and bills immediately for the pro-rated difference. Simple pattern — Postgres read, Postgres update, Execute Workflow to STK push.

### [SCREEN] 6:00–7:30
Trial handling.

### [VO]
> Trials. Add a trial_ends_at column. If trial_ends_at is in the future, don't bill. If it's in the past and no first bill yet, bill now.
>
> [PAUSE 1s]
>
> One daily workflow handles trial conversion automatically. The customer never experiences a gap.

### [SCREEN] 7:30–8:30
Churn metrics.

### [VO]
> Bonus: metrics. Weekly email to the founder with new subs, churned subs, MRR, and payment success rate. Postgres aggregations in a few Code nodes. Email as HTML. Twenty minutes of work. Beats a dashboard you never check.

### [SCREEN] 8:30–9:00
End card.

### [ON-SCREEN TEXT] 8:30–9:00
> **Up next:** School fees with Google Forms

### [VO]
> Billing covered. Next up: school fees. See you there.

---

## Lesson 8.3 : Use case C : School fees via Google Form *(10 min)*

### [SCREEN] 0:00–0:15
Import `school-fees.json`.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 8.3 : School fees portal**

### [VO]
> Third use case. School fees. Many Kenyan schools collect fees through M-Pesa PayBill, but parents call all day asking "did you receive my payment?". We solve it with a parent-facing Google Form plus automatic receipt generation.

### [SCREEN] 0:15–1:30
Build the Google Form.

### [ON-SCREEN TEXT] 0:15–1:30
> **Form fields:**
> • Pupil admission number
> • Pupil name (prefilled from DB if possible)
> • Parent phone
> • Parent email
> • Amount
> • Term (Term 1 / 2 / 3)

### [VO]
> The Google Form. Five fields. Admission number, pupil name, parent phone, parent email, amount, term. Standard form. Takes ten minutes to build.
>
> [PAUSE 1s]
>
> Connect Google Form to n8n via a Google Apps Script that POSTs the form submission to our webhook. Snippet in the handbook. One-time setup per form.

### [SCREEN] 1:30–3:00
Workflow: validate, STK push, on success generate PDF receipt.

### [VO]
> Workflow. Google Form webhook fires on every submission. Code node validates admission number against a Google Sheets of enrolled pupils — reject payments for unknown admission numbers. Execute Workflow fires STK push with reference FEES dash admission number.
>
> [PAUSE 1s]
>
> On the callback workflow, if reference starts with FEES-, generate a PDF receipt and email it to the parent.

### [SCREEN] 3:00–5:00
PDF receipt generation.

### [ON-SCREEN TEXT] 3:00–5:00
> **PDF via PDF.co or HTML-to-PDF node:**
> Template: school logo + receipt table
> Attach to email

### [VO]
> PDF receipt. Two options.
>
> [PAUSE 1s]
>
> Option one: a free HTML-to-PDF n8n community node. Install from the Community Nodes section. Feed it HTML, out comes a PDF buffer. Attach to the email.
>
> [PAUSE 1s]
>
> Option two: PDF.co or Documint — paid APIs for template-based PDF generation. More polished output but costs about one cent per PDF. For high-volume schools, option one is cheaper.
>
> [PAUSE 1s]
>
> The template: school logo at top, receipt heading, pupil name, admission number, term, amount, M-Pesa receipt number, date, head teacher's signature image. HTML-plus-CSS in a Code node.

### [SCREEN] 5:00–6:30
Email with PDF attached.

### [VO]
> Email Send node. To: the parent email from the form. Subject: "Fees receipt for pupil-name, Term x". Body: short text. Attachments: the PDF buffer from the previous node, filename FEES dash admission number dot pdf.
>
> [PAUSE 1s]
>
> Parent gets a receipt within seconds. Head teacher's phone stops ringing. Everybody wins.

### [SCREEN] 6:30–8:00
Admin dashboard: who paid, who didn't.

### [VO]
> Admin dashboard. A simple admin interface showing all pupils and payment status per term. Build with Retool, Appsmith, or an n8n workflow that returns an HTML page.
>
> [PAUSE 1s]
>
> Columns: pupil, admission number, Term 1 paid, Term 2 paid, Term 3 paid, total outstanding. One row per pupil. Head teacher opens this once a week and knows exactly who to follow up.

### [SCREEN] 8:00–9:00
Automated reminders.

### [VO]
> Automated reminders. Another scheduled workflow. Finds parents whose fees are more than seven days overdue and sends a polite SMS or WhatsApp message. Weekly cadence.
>
> [PAUSE 1s]
>
> This workflow alone — automated reminders — has transformed collections for schools we've deployed to. Weekly, three AM, zero human work.

### [SCREEN] 9:00–10:00
End card.

### [ON-SCREEN TEXT] 9:00–10:00
> **Up next:** Donation form on Bubble.io

### [VO]
> Three down. Next: donations with a Bubble.io frontend. See you there.

---

## Lesson 8.4 : Use case D : Donation form (Bubble.io) *(8 min)*

### [SCREEN] 0:00–0:15
Import `donations.json`.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 8.4 : Donation page**

### [VO]
> Fourth use case. Donations. A NGO or church wants a one-click donation page. Bubble.io, WeWeb, or Softr for the frontend — no code — plus our n8n backend for the actual payment.

### [SCREEN] 0:15–1:30
Build the Bubble donation page.

### [VO]
> Bubble.io page. Three elements. A text input for amount with suggested buttons — one hundred, five hundred, one thousand. A phone input. A "donate now" button.
>
> [PAUSE 1s]
>
> On button click: Bubble sends an API request to our n8n webhook with amount and phone. Receives back the success response. Shows the "check your phone" screen.
>
> [PAUSE 1s]
>
> Bubble API Connector plugin handles this. Documentation link in the handbook.

### [SCREEN] 1:30–3:00
Our workflow builds the STK push.

### [VO]
> Workflow. Donation webhook receives phone, amount, optional name, optional cause. Validate. Fire STK push with reference DON dash current timestamp.
>
> [PAUSE 1s]
>
> On the callback workflow, if reference starts with DON-, send a thank-you WhatsApp message. Also update a Supabase "donations" table with donor name and amount, for the running total display.

### [SCREEN] 3:00–5:00
Live running-total display.

### [VO]
> Running total. The Bubble page displays "KES x raised so far" using a Supabase query. Updates in real-time as donations come in. Great social proof.
>
> [PAUSE 1s]
>
> Supabase row-level security policy: anonymous can SELECT the aggregate but can't SELECT individual rows with donor names. Protects privacy, shows the number.

### [SCREEN] 5:00–6:30
Thank-you WhatsApp message.

### [VO]
> Thank-you message. In the callback branch for DON references, call the WhatsApp Cloud API template. Template: "Thank you for your generous donation of KES amount. May you be blessed."
>
> [PAUSE 1s]
>
> Pre-approved template in Meta Business. First-time setup takes a day. After that, every donor receives the message within seconds of completing payment.

### [SCREEN] 6:30–7:30
Weekly donor report to the organization.

### [VO]
> Weekly report workflow. Every Monday at eight AM, email the organization a list of donations from the previous week. Grouped by cause if you have multiple campaigns. Total raised. Top donors — if they consented to being named.
>
> [PAUSE 1s]
>
> Builds a feedback loop. Volunteers see impact. Keeps engagement high.

### [SCREEN] 7:30–8:00
End card.

### [ON-SCREEN TEXT] 7:30–8:00
> **Up next:** WhatsApp chatbot payments

### [VO]
> Four down. Final use case next: a WhatsApp chatbot where customers can pay by typing "pay five hundred". See you there.

---

## Lesson 8.5 : Use case E : WhatsApp payment chatbot *(8 min)*

### [SCREEN] 0:00–0:15
Import `whatsapp-bot.json`.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 8.5 : WhatsApp chatbot payments**

### [VO]
> Fifth and final use case. A WhatsApp chatbot. Customers message your business number with "pay five hundred" and instantly receive an STK prompt on the same phone. No app downloads. No clicks on web pages. Just WhatsApp.

### [SCREEN] 0:15–2:00
WhatsApp Cloud API setup.

### [ON-SCREEN TEXT] 0:15–2:00
> **Meta Business → WhatsApp Business API:**
> • Phone number verified
> • App token (permanent, not test)
> • Webhook URL + verify token

### [VO]
> Prerequisites. Meta Business account. WhatsApp Business API phone number — register through Meta's Cloud API — free for the first thousand conversations a month. Permanent access token — not the test token which expires.
>
> [PAUSE 1s]
>
> In Meta's App dashboard, under WhatsApp, add a webhook. URL: your n8n webhook domain. Verify token: a shared string. Subscribe to the "messages" field. Meta will test the webhook with a GET challenge — our Webhook node handles that automatically.

### [SCREEN] 2:00–3:30
Our workflow parses the "pay N" command.

### [VO]
> Workflow. WhatsApp Cloud sends a POST on every incoming message. Code node parses: check if message type is text, extract text body, match "pay" followed by a number.
>
> [PAUSE 1s]
>
> If match: build STK payload with phone from msg dot from — which WhatsApp provides in two-five-four format already — and amount from the regex capture. Fire STK push. Reference WA dash timestamp.
>
> [PAUSE 1s]
>
> If no match: send a WhatsApp reply "To pay, send 'pay' followed by the amount, e.g., pay 500".

### [SCREEN] 3:30–5:00
Handle the help command.

### [VO]
> Expand with more commands. "Help" sends usage. "Balance" queries their open invoice from your database. "History" sends their last five payments.
>
> [PAUSE 1s]
>
> Build each as a branch of an IF node — or if you have many commands, a Switch node. Keeps the workflow readable.

### [SCREEN] 5:00–6:30
Confirmation flow.

### [VO]
> After the STK push fires, send a WhatsApp reply: "Payment prompt sent to your phone. Enter PIN to complete".
>
> [PAUSE 1s]
>
> On the callback workflow, if reference starts with WA-, send another WhatsApp reply: "Payment of KES amount received. Receipt: receipt. Thank you".
>
> [PAUSE 1s]
>
> Full conversational payment flow. Zero clicks. Zero app downloads.

### [SCREEN] 6:30–7:30
UX tips.

### [ON-SCREEN TEXT] 6:30–7:30
> **UX wins:**
> • Reply within 3 seconds (users feel "snappy")
> • Use emoji sparingly
> • Confirm after success, not just after prompt sent

### [VO]
> UX tips. Reply within three seconds — WhatsApp Cloud API is fast enough that this is easy. Use emoji sparingly — too many and messages feel spammy. Confirm after actual success, not just after STK prompt sent. Users remember being promised success before paying.

### [SCREEN] 7:30–8:00
End card. Module 8 summary.

### [ON-SCREEN TEXT] 7:30–8:00
> **Module 8 recap:**
> ✅ WooCommerce checkout
> ✅ SaaS subscription billing
> ✅ School fees portal
> ✅ Bubble.io donation page
> ✅ WhatsApp chatbot payments

### [VO]
> Module eight done. Five complete integrations, each production-grade. Pick the one closest to your business, adapt, deploy. Next up: module nine — a teaser of what's beyond STK push. See you there.

---

## Recording checklist for Module 8

- [ ] Test WooCommerce installed and connected to n8n
- [ ] Sample subscriptions in Postgres
- [ ] Google Form linked via Apps Script
- [ ] Bubble.io demo app pre-built
- [ ] WhatsApp Cloud sandbox number ready

