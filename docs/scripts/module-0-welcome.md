# Module 0 : Welcome & Setup

**Target runtime:** ~4 minutes · **Word count:** ~600 · **Lessons:** 1 (combined intro)

---

## Lesson 0.1 : Welcome *(4 min)*

### [SCREEN] 0:00–0:08
Open on the **final demo**: a phone showing the M-Pesa STK push prompt popping up, user enters PIN, confirmation SMS arrives. Quick cut to the n8n editor showing the completed workflow. Course logo fade-in.

### [ON-SCREEN TEXT] 0:00–0:03
> **"Build M-Pesa payments without writing a backend."**

### [VO]
> Imagine this. A customer taps "Pay with M-Pesa" on your website. Two seconds later, their phone buzzes. They enter their PIN. Money hits your account. Your database updates. A receipt is sent. All of it, automated.
>
> [PAUSE 1s]
>
> Now imagine building that — the entire payment system — without writing a single line of backend code. No Spring Boot. No Django. No Express server to maintain. Just a visual workflow you can see, modify, and ship in an afternoon.
>
> That's what this course is about.

### [SCREEN] 0:30–0:50
Zoom into the n8n editor. Show the 4 nodes of the STK push workflow: Webhook → Validate → Auth → STK Push → DB. Highlight each node with a soft green pulse.

### [B-ROLL] 0:30–0:50
Animated arrows showing data flowing between the nodes.

### [VO]
> I'm your instructor, and I've spent the last four years building M-Pesa integrations the hard way — maintaining microservices, chasing certificate renewals, debugging callback endpoints at two in the morning.
>
> Then I discovered n8n. And I realized the entire thing could be replaced by four visual workflows. That's what you're going to build.

### [ON-SCREEN TEXT] 0:50–0:55
> **What you'll build:**
> ✓ OAuth token flow
> ✓ STK Push integration
> ✓ Callback handler
> ✓ Reconciliation engine

### [SCREEN] 0:50–1:30
Show the 4 workflow thumbnails in a 2×2 grid, then zoom into each one as it's mentioned.

### [VO]
> By the end of this course you'll have four production-ready workflows. One: an OAuth token service. Two: an STK push trigger that validates input, generates the password, and calls Daraja. Three: a callback handler that parses Safaricom's response and updates your database. And four — the one most tutorials skip — a reconciliation workflow that catches transactions when the callback never arrives.
>
> [PAUSE 1s]
>
> You'll also get five real-world use case templates — e-commerce checkouts, SaaS subscription billing, school fee collection, donation forms, and a WhatsApp payment bot. Each one, importable in one click.

### [SCREEN] 1:30–1:50
Scroll through the Git repo on GitHub. Show the folder tree: `workflows/`, `docker/`, `postman/`, `docs/`, `deploy/`.

### [B-ROLL] 1:30–1:50
Overlay: file names zoom in as they appear in the directory tree.

### [VO]
> Everything you see on screen — every workflow, every database schema, every deployment script — lives in a public Git repo. You get the Postman collection. You get the handbook as a PDF. You get the Docker Compose file to run n8n locally in sixty seconds. No gatekeeping.

### [ON-SCREEN TEXT] 1:50–2:00
> **Who this course is for:**
> • Developers tired of Daraja boilerplate
> • Founders building Kenyan SaaS
> • Agencies offering automation
> • No-code builders adding real payments

### [VO]
> This course is for you if you've ever started a Daraja integration and thought, "there has to be a simpler way." If you're a founder in Kenya, Tanzania, Uganda, or anywhere in East Africa building a SaaS. If you run a no-code agency and want to add real M-Pesa payments to Bubble, WeWeb, or Softr. Or if you're a backend developer who's just plain tired of maintaining another payment microservice.
>
> You do not need to be an n8n expert. You do not need to know what OAuth is. You don't even need a Safaricom account yet — we'll create one together.

### [SCREEN] 2:30–2:50
Show prerequisites checklist as a clean animated list, items ticking in as they're mentioned.

### [ON-SCREEN TEXT] 2:30–2:50
> **You'll need:**
> ☐ A Mac, Linux, or Windows machine
> ☐ Docker Desktop installed
> ☐ A phone number for testing
> ☐ Six hours of focused time

### [VO]
> Here's what you do need. A Mac, Linux, or Windows machine. Docker Desktop installed — if you don't have it, pause here, install it, come back. A phone number for testing — any Safaricom or Airtel line will do. And about six hours of focused time, which you can spread across a weekend.
>
> [PAUSE 1s]
>
> That's it. No credit card for your first deploy — we run everything locally first. When you're ready for production, a six-dollar-a-month VPS is all you need.

### [SCREEN] 3:00–3:30
Show the course outline — 10 modules — as a numbered list that highlights as read.

### [ON-SCREEN TEXT] 3:00–3:30
> **Course roadmap:**
> 1. Intro to n8n
> 2. Daraja API deep-dive
> 3. OAuth in n8n
> 4. Building STK Push ⭐
> 5. Handling the callback
> 6. Reconciliation
> 7. Production deployment
> 8. Real-world use cases
> 9. Beyond STK Push
> 10. Selling your skill

### [VO]
> Here's how we'll move. Module one, we install n8n and tour the editor. Module two, we understand the Daraja API — the sandbox, the production flow, the gotchas. Module three, we build the OAuth workflow. Module four is the main event: the STK push itself. Module five, we handle the callback. Module six, reconciliation. Module seven, we deploy to a real server with HTTPS. Module eight, five real-world templates. Module nine, a bonus look at B2C and other Daraja APIs. And module ten — if you're on the agency tier — how to package all of this as a service you can sell for seventy-five thousand shillings a client.

### [SCREEN] 3:30–3:50
Show a Discord / Telegram community invite screen with a QR code.

### [ON-SCREEN TEXT] 3:30–3:50
> **Stuck? Join the community:**
> [Discord invite QR]

### [VO]
> One last thing. If you get stuck — and you will, Daraja is weird sometimes — the community link is in your course dashboard. Post your error, drop your workflow JSON, we'll figure it out together.
>
> [PAUSE 1s]
>
> Alright. Enough intro. Let's install n8n. See you in module one.

### [SCREEN] 3:50–4:00
Fade to course logo + "Next: Module 1 — Installing n8n" call-to-action.

### [ON-SCREEN TEXT] 3:50–4:00
> **Next:** Module 1 — Installing n8n →

---

## Recording checklist for this lesson

- [ ] Final demo clip ready (phone + n8n editor split-screen)
- [ ] n8n editor zoomed to 110%
- [ ] GitHub repo page bookmarked and logged in
- [ ] Prerequisites graphic designed in Canva
- [ ] Course roadmap graphic designed in Canva
- [ ] Discord QR code generated

