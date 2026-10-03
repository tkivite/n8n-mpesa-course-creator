# Module 1 : Introduction to n8n

**Target runtime:** ~45 min · **Lessons:** 6 · **Combined word count:** ~6,500

---

## Lesson 1.1 : What is n8n and why it beats Zapier for payments *(6 min)*

### [SCREEN] 0:00–0:10
Side-by-side logos: Zapier, Make.com, n8n. Price tags pop in: "$29/mo for 750 tasks" on Zapier, "$0 self-hosted" on n8n.

### [ON-SCREEN TEXT] 0:00–0:08
> **Lesson 1.1 · What is n8n?**

### [VO]
> If you've ever used Zapier or Make dot com, you already understand the mental model. You connect services. Trigger here, action there. Data flows through. n8n plays in the same arena — but it's built different.
>
> [PAUSE 1s]
>
> Three things make it the right tool for payments. One: it's open source. You can run it on your own server. No per-transaction fees. No "contact sales" for the plan that unlocks the feature you need. Two: it's code-friendly. When the visual nodes aren't enough — and with M-Pesa, they won't be — you drop into a JavaScript node and write exactly what you need. Three: four hundred plus integrations out of the box, with a vibrant community adding more every week.

### [SCREEN] 0:40–1:10
Open n8n.io homepage. Scroll through the integrations grid. Pause on Postgres, HTTP Request, Webhook, Code.

### [VO]
> For M-Pesa specifically, the four nodes we care about are: Webhook — to receive requests from your frontend. HTTP Request — to call Daraja. Code — for the password and timestamp logic. And Postgres — to store transactions. That's it. Four nodes. Those four nodes become every workflow in this course.

### [SCREEN] 1:10–1:40
Pricing comparison table.

### [ON-SCREEN TEXT] 1:10–1:40
> | Tool | 10k M-Pesa tx/mo | Self-host? |
> |---|---|---|
> | Zapier Pro | $73/mo | ❌ |
> | Make Teams | $29/mo + per-op | ❌ |
> | **n8n self-hosted** | **$6/mo VPS** | ✅ |

### [VO]
> Let's talk money. If you process ten thousand M-Pesa transactions a month on Zapier Pro, you're looking at seventy-three dollars. Make dot com, around twenty-nine plus overages. n8n self-hosted on a six-dollar-a-month Hetzner box? Six dollars. Flat.
>
> [PAUSE 1s]
>
> That cost difference is why every serious Kenyan automation agency has moved to n8n. And why we're going to as well.

### [SCREEN] 1:40–2:30
Open the final course demo workflow in n8n. Pan across all four nodes left to right.

### [VO]
> Here's a preview of what we'll build. Webhook receives a payment request from your frontend. A validation node checks the phone number format. The Execute Workflow node calls our reusable OAuth sub-workflow. The HTTP Request node fires the STK push to Safaricom. The Postgres node saves a pending transaction. Then we return the result to the caller. All visual. All editable. All in your browser.

### [SCREEN] 2:30–3:00
Open the executions view. Show successful runs with green checkmarks. Click into one to show the data flowing between nodes.

### [VO]
> One of the best things about n8n for payments: every execution is logged. You can click into any transaction and see exactly what data flowed between every node. When Safaricom's callback arrives, you can replay it. When a payment fails, you can see which node failed and why. In a traditional backend, that's a logging infrastructure you'd have to build yourself.

### [SCREEN] 3:00–3:40
Show the n8n community page, the templates library, GitHub stars count.

### [ON-SCREEN TEXT] 3:00–3:40
> **n8n at a glance:**
> ⭐ 50,000+ GitHub stars
> 🔌 400+ integrations
> 📜 Fair-code license (free self-host)
> 👥 Active community, templates library

### [VO]
> A quick note on the license. n8n is "fair-code" licensed. Translation: you can self-host it for free, for internal business use, forever. The only time you pay for a license is if you want to embed n8n inside a product you sell to customers. For everything we do in this course, you pay zero license fees.

### [SCREEN] 3:40–4:30
Split screen: Spring Boot M-Pesa code on the left (overwhelming walls of Java), n8n workflow on the right (clean visual nodes). Fade left to right.

### [B-ROLL]
Numbers overlay: "347 lines of Java" fades on left. "4 workflow nodes" fades on right.

### [VO]
> I want to show you something. On the left is a Spring Boot M-Pesa integration. Three hundred and forty-seven lines of Java, three Dockerfiles, a certificate configuration, a WSDL, and a Jenkins pipeline. On the right is the same functionality in n8n. Four nodes.
>
> [PAUSE 1s]
>
> I built the Java version in two thousand twenty-two. It took three weeks. I built the n8n version while filming this course. It took three hours. The n8n version has fewer bugs because there's less to break.

### [SCREEN] 4:30–5:30
Zoom into the "Deploy to Production" button in n8n. Then switch to showing docker-compose up in a terminal.

### [VO]
> Here's the pitch for n8n specifically with M-Pesa. One: you can deploy locally in sixty seconds with Docker. Two: your workflows are stored as JSON files you can version control in Git. Three: when Safaricom changes the Daraja API — and they will — you fix one node, not a whole microservice. Four: non-technical team members can look at the workflow and understand what the payment system does. That last one is huge. Try explaining a Spring Boot controller to your product manager.

### [SCREEN] 5:30–5:50
End card: "What's next" preview.

### [ON-SCREEN TEXT] 5:30–5:50
> **Up next:** Install n8n with Docker in 60 seconds

### [VO]
> Alright. You know what n8n is and why we're using it. In the next lesson, we install it with Docker and have it running locally in less than a minute. Let's go.

---

## Lesson 1.2 : Self-hosted vs n8n Cloud *(5 min)*

### [SCREEN] 0:00–0:15
Split screen: n8n Cloud pricing page vs a Hetzner VPS pricing page.

### [ON-SCREEN TEXT] 0:00–0:08
> **Lesson 1.2 · Self-hosted vs Cloud**

### [VO]
> Before we install anything, let's answer the question I get asked most: should I use n8n Cloud or self-host? The answer, for M-Pesa specifically, is almost always self-host. Let me show you why.

### [SCREEN] 0:15–1:00
Pan over n8n Cloud pricing. Starter: $20/mo for 2,500 executions. Pro: $50/mo for 10,000.

### [VO]
> n8n Cloud is beautifully simple. You sign up, you get a hosted instance, Safaricom callbacks hit a public URL that already has HTTPS. No server management. The Starter plan is twenty dollars a month for twenty-five hundred executions. Pro is fifty dollars a month for ten thousand.
>
> [PAUSE 1s]
>
> Now, here's the problem for payments. Every M-Pesa transaction uses roughly three to four executions. The webhook that triggers it. The auth sub-workflow. The STK push itself. The callback. So that ten thousand executions a month only covers about twenty-five hundred transactions.

### [SCREEN] 1:00–1:50
Switch to Hetzner Cloud. Show the CPX11 plan: 2 vCPU, 2 GB RAM, 40 GB disk, 20 TB traffic — €4.59/mo.

### [VO]
> Compare that to self-hosting. A Hetzner CPX11 costs about five dollars a month. Two CPU cores. Two gigs of RAM. Twenty terabytes of traffic. On that box, n8n will happily handle a hundred thousand executions a day. For most Kenyan businesses, that's effectively unlimited.
>
> [PAUSE 1s]
>
> DigitalOcean, Vultr, Linode — all have similar five-to-six-dollar plans. The point is, five dollars a month gets you a server that outperforms n8n Cloud's fifty-dollar plan by about a hundred times.

### [SCREEN] 1:50–2:40
Draw a decision tree on screen (prepared graphic).

### [ON-SCREEN TEXT] 1:50–2:40
> **Decision tree:**
> → Prototype / < 100 tx/day → n8n Cloud ($20/mo)
> → Production / Kenyan business → Self-host ($5/mo)
> → Agency serving multiple clients → Self-host multi-tenant

### [VO]
> So when does n8n Cloud make sense? Three cases. One: you're prototyping and want to be live in five minutes. Two: your business genuinely does under a hundred transactions a day and you don't want to think about servers. Three: your team has zero DevOps capacity and the time saved is worth more than the money spent.
>
> [PAUSE 1s]
>
> For everyone else — self-host. And here's the kicker: in module seven I give you a one-command deploy script that provisions a Hetzner VPS with n8n, Postgres, Nginx, HTTPS, and firewalls, in about five minutes. The "self-hosting is scary" argument goes away.

### [SCREEN] 2:40–3:30
Terminal recording: paste the vps-setup.sh curl command. Watch it install.

### [VO]
> Here it is. One command. You run this on a fresh Ubuntu server, give it your domain and your email, and five minutes later you have a production-ready n8n instance with a valid TLS certificate. We'll do this together in module seven, but I want you to see it now so the fear is already gone.

### [SCREEN] 3:30–4:00
Show total cost of ownership comparison for 1 year.

### [ON-SCREEN TEXT] 3:30–4:00
> **1-year cost (10k tx/mo):**
> n8n Cloud Pro: **$600**
> Self-host (Hetzner): **$60**
> **Savings: $540/year**

### [VO]
> One more number. Over twelve months, processing ten thousand transactions a month, n8n Cloud costs six hundred dollars. Self-hosted on Hetzner costs sixty. That's five hundred and forty dollars a year back in your pocket. If you're running an agency with five M-Pesa clients, that's twenty-seven hundred dollars a year.

### [SCREEN] 4:00–4:40
Show a security advantage callout.

### [ON-SCREEN TEXT] 4:00–4:40
> **Self-host also means:**
> ✓ Your Daraja secrets never leave your infra
> ✓ Full logs under your control
> ✓ Compliance easier (Kenya DPA 2019)

### [VO]
> There's also a security angle. When you self-host, your Daraja Consumer Key and Secret live only on your server. They're never sent to a third party. For businesses handling customer financial data under Kenya's Data Protection Act, that's a compliance win worth having.

### [SCREEN] 4:40–5:00
End card.

### [ON-SCREEN TEXT] 4:40–5:00
> **Up next:** Installing n8n with Docker

### [VO]
> Verdict: self-host. In the next lesson, I'll show you the Docker Compose file we'll use for the rest of the course. Sixty seconds to running n8n. Let's go.

---

## Lesson 1.3 : Installing n8n locally with Docker *(8 min)*

### [SCREEN] 0:00–0:12
Open VS Code to the course repo. Highlight `docker/docker-compose.yml` and `docker/.env.example`.

### [ON-SCREEN TEXT] 0:00–0:08
> **Lesson 1.3 · Install n8n locally**

### [VO]
> Alright, hands on the keyboard. In this lesson we're going to install n8n locally with Docker Compose. You'll end up with a working n8n instance on localhost port five-six-seven-eight, backed by a Postgres database, with an ngrok tunnel ready to expose it to Safaricom. Everything in sixty seconds of actual work.

### [SCREEN] 0:12–0:40
Verify Docker is installed in terminal: `docker --version`, `docker compose version`.

### [VO]
> First, confirm you have Docker Desktop running. In your terminal, type "docker version". You should see version twenty-four or newer. Then "docker compose version" — you should see v two point something. If either command fails, pause the video, install Docker Desktop from docker dot com, and come back.

### [SCREEN] 0:40–1:30
Clone the course repo: `git clone https://github.com/<you>/n8n-mpesa-course.git`. `cd` into it. `cat docker/docker-compose.yml` highlighted.

### [VO]
> Next, clone the course repo. The URL is on your course dashboard. Clone it, cd into the folder. Everything we need for the next six hours of this course is in there.
>
> [PAUSE 1s]
>
> Open docker slash docker-compose dot yml. There are three services defined. One: Postgres sixteen, which stores both n8n's workflow data and our M-Pesa transactions table. Two: n8n itself, running the official image. Three: ngrok, which we'll use later to expose our callback URL to Safaricom. Notice the ngrok service is behind a profile — it only starts when we ask for it.

### [SCREEN] 1:30–2:30
Scroll through docker-compose.yml, highlighting environment variables.

### [ON-SCREEN TEXT] 1:30–2:30
> `GENERIC_TIMEZONE: Africa/Nairobi`
> `DB_TYPE: postgresdb`
> `N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}`

### [VO]
> A few things to notice. The timezone is set to Africa Nairobi. This matters — Daraja requires timestamps in Nairobi time, and if our n8n container is on UTC, every STK push will fail with a timestamp error. Set it once in the compose file, never think about it again.
>
> [PAUSE 1s]
>
> The database type is set to Postgres with credentials pulled from env vars. By default, n8n uses SQLite, which is fine for prototyping, but switching to Postgres from day one means we can later use the same database for our mpesa_transactions table — no second container needed.
>
> [PAUSE 1s]
>
> The encryption key — this is important. n8n encrypts your stored credentials with it. Change it after setup and your saved credentials become unreadable. We'll generate a strong one in the next step.

### [SCREEN] 2:30–3:20
Copy env file: `cp .env.example .env`. Open .env in editor.

### [VO]
> Now the environment file. Copy dot env example to dot env, then open it in your editor. We need to fill in a few things.
>
> [PAUSE 1s]
>
> First, the n8n basic auth user and password. This is the login you'll use at localhost five-six-seven-eight. Pick something you'll remember. For local dev, "admin" and a password you type easily is fine — nobody can reach your localhost from the internet.
>
> Second, the encryption key. Generate it with this command: openssl rand hex sixteen. Copy the output. Paste it into N8N_ENCRYPTION_KEY. If you're on Windows without openssl, any random thirty-two character string works.

### [SCREEN] 3:20–3:50
Run `openssl rand -hex 16` in terminal, copy output, paste into .env.

### [VO]
> Third, the Postgres credentials. For local dev, leave them as default — n8n slash n8n. These never leave your laptop.
>
> [PAUSE 1s]
>
> Fourth, the M-Pesa variables. We'll come back and fill these in during module two when we have our Daraja sandbox credentials. For now, leave them blank — n8n will start fine without them, the workflows just won't execute successfully until they're set.

### [SCREEN] 3:50–4:30
Run `docker compose up -d` in `docker/` directory. Watch containers start.

### [VO]
> Now the magic. In the docker folder, run: docker compose up dash d. The dash d means "detached" — it runs in the background.
>
> [PAUSE 1s]
>
> First time, Docker pulls the n8n and Postgres images. On a decent connection, that's about ninety seconds. On subsequent runs, startup is five seconds.

### [SCREEN] 4:30–5:00
Run `docker compose ps`. Show both containers "healthy".

### [VO]
> When it's done, run docker compose ps. You should see both the n8n container and the Postgres container with status "healthy". If Postgres shows "starting" for more than thirty seconds, something's wrong — check the logs with docker compose logs postgres.

### [SCREEN] 5:00–5:50
Open browser to http://localhost:5678. Enter basic auth. Create n8n owner account.

### [ON-SCREEN TEXT] 5:00–5:30
> `http://localhost:5678`

### [VO]
> Open your browser. Go to localhost five-six-seven-eight. You'll be prompted for the basic auth username and password you set in dot env. Enter them.
>
> [PAUSE 1s]
>
> Next, n8n asks you to create an owner account. This is a second layer — the basic auth is for infrastructure access, this account is your n8n user. Pick an email, pick a strong password. This is the account you'll log in with every day.

### [SCREEN] 5:50–6:30
First look at empty n8n dashboard.

### [VO]
> And… you're in. You're looking at your own self-hosted n8n instance. No cloud. No tenant. Your data, your rules.
>
> [PAUSE 1s]
>
> Quick orientation. Top-left: workflows list — empty right now. Credentials: where API keys and database connections live. Executions: the audit log of every workflow run. Settings: user management, environment info, upgrade check.

### [SCREEN] 6:30–7:20
Click "New workflow". Show the empty canvas.

### [VO]
> Click "new workflow". This is the editor. On the left, every trigger and action node available to you. In the middle, the canvas. On the right, when you click a node, its properties panel appears.
>
> [PAUSE 1s]
>
> Save this workflow with ctrl-s or cmd-s. n8n asks you to name it. Call it "hello world" — we'll use it for our first test in the next lesson.

### [SCREEN] 7:20–7:50
Terminal: `docker compose logs n8n --tail 20`.

### [VO]
> Finally, a useful command. If anything ever misbehaves, docker compose logs n8n gives you the full output. You'll want this bookmarked when a workflow fails and you need to know why.

### [SCREEN] 7:50–8:00
End card.

### [ON-SCREEN TEXT] 7:50–8:00
> **Up next:** The n8n UI tour

### [VO]
> You've got n8n running locally. In the next lesson we take the full tour — nodes, workflows, executions, credentials, expressions. Then we build our first real workflow. See you there.

---

## Lesson 1.4 : n8n UI tour *(8 min)*

### [SCREEN] 0:00–0:15
Full n8n editor open. Mouse hovers over the left sidebar.

### [ON-SCREEN TEXT] 0:00–0:08
> **Lesson 1.4 · The n8n editor tour**

### [VO]
> In this lesson, I'm going to walk you through every corner of the n8n interface. By the end, you'll know where every setting lives, so when I say "open credentials and add a Postgres connection", you don't have to go searching.

### [SCREEN] 0:15–1:00
Click "Workflows" in left sidebar. Show the list (currently empty or with "hello world" from previous lesson).

### [VO]
> Left sidebar, top item: Workflows. This is your list of automations. Each workflow is a separate URL, a separate execution history, a separate set of nodes. Think of each one as a tiny microservice.
>
> [PAUSE 1s]
>
> You can tag workflows for organization. In this course, every workflow I give you is tagged "mpesa" and "course". When you have twenty workflows, tags save your life.

### [SCREEN] 1:00–1:50
Click "Credentials". Show the empty list. Click "Create new credential". Pick "Postgres" from the dropdown as a demo.

### [VO]
> Second item: Credentials. This is where every API key, database password, and OAuth token lives. Encrypted at rest using the encryption key we set in dot env.
>
> [PAUSE 1s]
>
> Important behavior: credentials are workflow-scoped by reference. Multiple workflows can share one credential. If you rotate a Daraja Consumer Secret, you update it in one place and every workflow that uses it is updated.
>
> [PAUSE 1s]
>
> Let me show you how to create one. Click new. Pick Postgres. Host: the container name "postgres". Database: n8n. User and password: whatever you set in dot env. Click test — green checkmark means it works. Save. Done.

### [SCREEN] 1:50–2:40
Click "Executions" in the sidebar.

### [VO]
> Third: Executions. This is where you spend a lot of time debugging. Every workflow run — successful, failed, in progress — logs here with the full data that flowed through every node.
>
> [PAUSE 1s]
>
> When a payment fails in production, you come here, filter by workflow and status "error", click into the failed execution, and you see exactly which node broke and with what input. In a traditional backend that would be a logging pipeline you build. In n8n it's free.
>
> [PAUSE 1s]
>
> One caveat for production: executions are kept forever by default. If you're processing thousands of transactions a day, add N8N_EXECUTIONS_DATA_PRUNE equals true and N8N_EXECUTIONS_DATA_MAX_AGE equals three thirty six — that's two weeks — to your dot env. We'll cover that in module seven.

### [SCREEN] 2:40–3:30
Click "Variables". Show the empty list.

### [VO]
> Fourth: Variables. These are plaintext globals — things like shortcode numbers, base URLs, reference prefixes. Anything that's not a secret but you don't want to hardcode.
>
> [PAUSE 1s]
>
> Important distinction. Secrets go in Credentials. Non-secrets go in Variables. Both are referenceable from any workflow with dollar sign vars dot YOUR_NAME.

### [SCREEN] 3:30–4:20
Open the "hello world" workflow from lesson 1.3. Click the plus button to add a node.

### [VO]
> Now the editor itself. Open your "hello world" workflow. Click the big plus button in the middle to add your first node.

### [SCREEN] 4:20–5:00
Node picker opens. Scroll through categories: Triggers, Actions, Flow, Data transformation.

### [VO]
> The node picker. Four categories matter for us. Triggers — these start a workflow: Webhook, Schedule, Execute Workflow Trigger. Actions — these do things: HTTP Request, Postgres, Email. Flow — logic: IF, Switch, Merge. Data transformation — Set and Code are the two you'll use most.
>
> [PAUSE 1s]
>
> Search is your friend. Type "webhook" — pick the Webhook node.

### [SCREEN] 5:00–5:50
Add Webhook node. Properties panel opens. Walk through: HTTP method, path, authentication, response mode.

### [VO]
> Webhook node properties. HTTP Method: POST, since M-Pesa callbacks are always POST. Path: whatever URL segment you want — I'll use "hello" for now. Authentication: none for this test, but you have options including header, basic, and JWT. Response Mode is interesting — "last node" means the webhook waits for your workflow to finish and returns the final output; "on received" means it returns a two hundred immediately and processes in the background. For callbacks from Safaricom, we always use "on received". We'll come back to that.

### [SCREEN] 5:50–6:40
Click the "Test workflow" button. Show the pending state. Call the webhook URL from a terminal with curl.

### [VO]
> Click "test workflow". n8n gives you a test URL and listens for one incoming request. In another terminal, hit it with curl.

### [SCREEN] 5:50–6:40
Overlay terminal: `curl -X POST http://localhost:5678/webhook-test/hello -H 'Content-Type: application/json' -d '{"name":"Titus"}'`

### [VO]
> You should see the request pop into the n8n editor. Click the webhook node — you can see the body you just sent. This is the n8n debugging superpower: every node, after it runs, shows you the exact data it received. If a payment is misbehaving, this is where you investigate.

### [SCREEN] 6:40–7:30
Add a Set node. Show expression syntax `{{ $json.body.name }}`.

### [VO]
> Add a Set node. In the Set node, we're going to add a field called "message" with the value "hello" space, then the name from the webhook. To reference data from a previous node, we use expressions. The syntax is double curly brace, dollar sign json dot body dot name, close curly braces.
>
> [PAUSE 1s]
>
> Expressions are JavaScript. Anything you can do in a JS expression, you can do here. If-else, math, string formatting, dot access, array methods. We'll use expressions constantly throughout the course.

### [SCREEN] 7:30–8:00
Save with cmd-s. Toggle the "Active" switch at the top-right.

### [VO]
> Save the workflow. Then — critical — toggle "Active" at the top-right. In test mode, the workflow only runs once per test click. In active mode, it listens forever at a production URL. For every M-Pesa workflow in this course, we toggle it active.
>
> [PAUSE 1s]
>
> That's the UI tour. In the next lesson, we build our first real workflow — a webhook that returns a JSON response — and I'll teach you expressions in depth. See you there.

---

## Lesson 1.5 : Your first workflow (Hello Webhook) *(7 min)*

### [SCREEN] 0:00–0:15
Open a blank workflow canvas.

### [ON-SCREEN TEXT] 0:00–0:08
> **Lesson 1.5 · Your first workflow**

### [VO]
> We're going to build a tiny but real workflow in this lesson. It accepts a POST request with a phone number, validates it, and returns either a success response or an error. By the end, you'll understand triggers, expressions, code nodes, and conditional logic — which is literally every pattern we'll use for M-Pesa.

### [SCREEN] 0:15–1:00
Add Webhook node. Path = "validate-phone". Method = POST. Response Mode = "last node".

### [VO]
> New workflow. Add a Webhook node. Path: validate-phone. Method: POST. Response mode: last node — meaning whatever the final node outputs, that's what the caller receives.

### [SCREEN] 1:00–2:00
Add a Code node. Paste a phone normalisation JavaScript function.

### [VO]
> Add a Code node after it. Code nodes are where n8n becomes a real programming environment. You get a full JavaScript runtime, access to Node's built-in modules, and the input from previous nodes as a variable called "items" or using the shorthand "$input".
>
> [PAUSE 1s]
>
> Paste this. Grab the phone number from the request body. Strip everything that isn't a digit. If it starts with zero, replace the zero with two-five-four. If it starts with plus, drop the plus. If it just starts with seven or one, prepend two-five-four.

### [SCREEN] 2:00–2:50
Show the code block clearly on screen.

### [ON-SCREEN TEXT] 2:00–2:50
> ```js
> let phone = $json.body.phone || '';
> phone = phone.replace(/[^0-9]/g, '');
> if (phone.startsWith('0')) phone = '254' + phone.slice(1);
> if (phone.startsWith('+')) phone = phone.slice(1);
> if (/^(7|1)/.test(phone)) phone = '254' + phone;
> const valid = /^254(7|1)\d{8}$/.test(phone);
> return [{ json: { phone, valid } }];
> ```

### [VO]
> Return format. n8n expects an array of objects, each with a "json" key. This is because n8n is built around the concept of items — a single workflow run can process multiple items in parallel. We're returning one item, but it still has to be wrapped in an array.

### [SCREEN] 2:50–3:40
Add an IF node after the Code node.

### [VO]
> Add an IF node. The IF node has two outputs: true branch on top, false branch on bottom. We're going to route valid phones one way and invalid phones the other.
>
> [PAUSE 1s]
>
> Condition: value one is the "valid" field from the Code node — expression: curly braces dollar json dot valid. Operation: equals. Value two: boolean true. Save.

### [SCREEN] 3:40–4:30
Add two Set nodes, one on each IF branch. True branch: "Build Success Response". False branch: "Build Error Response".

### [VO]
> On the true branch, add a Set node. Fields: "status" equals "ok", "phone" equals the normalised phone from the Code node, "message" equals "phone number is valid". Mode: "keep only set" — meaning throw away everything else from previous nodes, only output what I define here.
>
> [PAUSE 1s]
>
> On the false branch, another Set node. "Status" equals "error". "Reason" equals "invalid phone format". "Expected" equals the string "two five four seven X X X X X X X X X".
>
> [PAUSE 1s]
>
> This is the pattern you'll use for every M-Pesa validation. Normalise. Branch. Respond.

### [SCREEN] 4:30–5:30
Save. Activate. Test with curl from terminal.

### [VO]
> Save. Activate. Open a terminal and let's hit it.

### [SCREEN] 4:30–5:30
Terminal: `curl -X POST http://localhost:5678/webhook/validate-phone -H 'Content-Type: application/json' -d '{"phone":"0712345678"}'`

### [VO]
> Zero-seven-one-two-three-four-five-six-seven-eight. That's a Kenyan Safaricom number in local format. Should come back as valid.

### [SCREEN] 5:30–6:00
Show the JSON response: `{"status":"ok","phone":"254712345678","message":"phone number is valid"}`

### [VO]
> There we go. Normalised to the two-five-four format, flagged as valid. Now let's break it on purpose.

### [SCREEN] 6:00–6:30
Terminal: `curl -X POST http://localhost:5678/webhook/validate-phone -H 'Content-Type: application/json' -d '{"phone":"+1234567890"}'`

### [VO]
> A US-format number. Should come back as invalid.

### [SCREEN] 6:30–7:00
Show the error response.

### [VO]
> Perfect. Status error, reason invalid phone format, expected the two-five-four prefix.
>
> [PAUSE 1s]
>
> Congratulations. You just built a working validation API without writing a line of backend code. No Express. No routes file. No deployment. The exact same pattern — webhook, validate, branch, respond — is what we'll use for the STK push workflow in module four. Only the business logic will change.

### [SCREEN] 7:00–7:20
End card.

### [ON-SCREEN TEXT] 7:00–7:20
> **Up next:** Core n8n concepts — expressions, items, static data

### [VO]
> In the next lesson, we go deeper on expressions, how items work, and how to persist data across executions with static data. That's the last concept before we hit Daraja. Let's keep moving.

---

## Lesson 1.6 : Core concepts: triggers, actions, expressions *(10 min)*

### [SCREEN] 0:00–0:15
Clean canvas with a glossary graphic on screen.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 1.6 · The five concepts that run everything**

### [VO]
> Last lesson of module one. In this one we lock in the five mental models you need before we touch Daraja. Triggers. Items. Expressions. Credentials. Static data. If you understand these five, every workflow in the rest of the course will feel obvious.

### [SCREEN] 0:15–1:30
Show a visual grid of trigger types: Webhook, Schedule, Execute Workflow, Manual, Error Trigger, Chat Trigger.

### [VO]
> Concept one: triggers. Every workflow starts with exactly one trigger. The common ones for payments.
>
> [PAUSE 1s]
>
> Webhook — when an external system calls your URL. Our STK push workflow uses this.
>
> [PAUSE 1s]
>
> Schedule — fires on a cron expression. Our reconciliation workflow uses this: every five minutes, check pending transactions.
>
> [PAUSE 1s]
>
> Execute Workflow Trigger — makes the workflow callable from another workflow. We use this for the OAuth sub-workflow — one place that fetches tokens, called from everywhere else.
>
> [PAUSE 1s]
>
> Error Trigger — a special one. Fires when any other workflow throws an error. We'll use this in module seven to send Slack alerts when payments fail.

### [SCREEN] 1:30–2:30
Show a diagram: workflow processing 3 items in parallel.

### [ON-SCREEN TEXT] 1:30–2:30
> **Items model:**
> One run → many items → each flows through all nodes

### [VO]
> Concept two: items. This is the one that trips people up.
>
> [PAUSE 1s]
>
> n8n doesn't process one request at a time. Each node outputs an array of "items", and the next node runs once per item. So if you fetch a hundred rows from Postgres, the next node runs a hundred times in parallel.
>
> [PAUSE 1s]
>
> For webhooks, this is simple: one incoming request equals one item. For scheduled workflows, it's where power comes from: in our reconciliation workflow, "find pending transactions" returns thirty items — one per pending transaction — and the next node makes thirty parallel status queries to Daraja.
>
> [PAUSE 1s]
>
> Return format from Code nodes: always an array of objects with a "json" key. Even if you have one item. The array wrapper is non-negotiable.

### [SCREEN] 2:30–4:00
Open the previous lesson's workflow. Show expression editor on the Set node.

### [ON-SCREEN TEXT] 2:30–4:00
> `{{ $json.body.phone }}`
> `{{ $('Webhook').item.json.body.phone }}`
> `{{ $env.MPESA_SHORTCODE }}`
> `{{ DateTime.now().toFormat('yyyyMMddHHmmss') }}`

### [VO]
> Concept three: expressions. The curly braces. These are mini-JavaScript expressions evaluated at runtime.
>
> [PAUSE 1s]
>
> Four flavors you need to know.
>
> [PAUSE 1s]
>
> Dollar json — reference data from the immediately previous node. This is what you use ninety percent of the time.
>
> [PAUSE 1s]
>
> Dollar paren node name paren dot item dot json — reference data from a specific earlier node by name. You use this when the data you want is three nodes back, not the one right before you.
>
> [PAUSE 1s]
>
> Dollar env — environment variables. The Daraja Consumer Key, the shortcode, the callback URL — all of these come through dollar env. This keeps secrets out of the workflow JSON.
>
> [PAUSE 1s]
>
> DateTime — n8n's built-in date library. For our Daraja timestamp, we'll use DateTime dot now dot setZone Africa Nairobi dot toFormat.

### [SCREEN] 4:00–5:00
Open Credentials panel. Add a new HTTP Request credential with Bearer token auth.

### [VO]
> Concept four: credentials, in more depth than the UI tour. There are two patterns.
>
> [PAUSE 1s]
>
> Pattern one: a credential attached to a node. The HTTP Request node, the Postgres node, every API integration — they all have a "credential" dropdown in their config. You create the credential once, pick it from the dropdown everywhere you need it.
>
> [PAUSE 1s]
>
> Pattern two: secrets via environment variables. For things that aren't nicely-shaped credentials — like the M-Pesa passkey, which is just a string — you put them in dot env and read them in Code nodes with dollar env dot MPESA_PASSKEY. We use this pattern a lot in this course because Daraja isn't a built-in n8n integration.

### [SCREEN] 5:00–6:30
Open the OAuth sub-workflow. Show a Code node with `$getWorkflowStaticData` for token caching.

### [ON-SCREEN TEXT] 5:00–6:30
> ```js
> const data = $getWorkflowStaticData('global');
> if (data.token && new Date(data.expires_at) > new Date()) {
>   return [{ json: { access_token: data.token, cached: true } }];
> }
> // ...fetch new token...
> data.token = newToken;
> data.expires_at = newExpiry;
> ```

### [VO]
> Concept five: static data. This is the one that elevates your workflows from "demo" to "production".
>
> [PAUSE 1s]
>
> Dollar getWorkflowStaticData gives you a persistent key-value store scoped to one workflow. It survives executions. It survives restarts. It's perfect for caching things like OAuth tokens.
>
> [PAUSE 1s]
>
> Daraja tokens expire after about one hour. If you fetch a new token on every single STK push, you're hitting the OAuth endpoint hundreds of times a day for no reason, and you'll eventually get rate limited. With static data, you fetch once an hour, cache it, and every subsequent request uses the cached version. We'll implement this exact pattern in the auth workflow in module three.
>
> [PAUSE 1s]
>
> One gotcha: static data persists only when you call it on a saved, active workflow. In test mode, changes are discarded. So test your caching with the workflow active, not with "test workflow".

### [SCREEN] 6:30–7:30
Show a comparison: webhook with and without an error branch.

### [VO]
> Bonus concept — error handling. Every n8n node has a "settings" tab, bottom option "On Error". Three choices.
>
> [PAUSE 1s]
>
> Stop workflow — the default. If the node fails, the whole workflow stops with an error.
>
> [PAUSE 1s]
>
> Continue — the workflow keeps going, the failed node outputs an empty item. Dangerous for payments — you probably want to know when a Daraja call fails.
>
> [PAUSE 1s]
>
> Continue on fail with error output — this is the one you want for M-Pesa. The node gets a second output port, bottom-right. On error, data flows out that port, and you can route it to logging, alerting, or a retry.
>
> [PAUSE 1s]
>
> We'll use this on the Daraja HTTP calls in modules three and four.

### [SCREEN] 7:30–8:30
Mini-exercise on screen: build a workflow that logs every incoming payment to a Google Sheet. Walk through the solution briefly.

### [VO]
> Quick exercise before we move on. Can you build a workflow that logs every incoming payment request to a Google Sheet? You'd need: a webhook trigger, maybe a Set node to pull out the fields you want, and a Google Sheets node with "append" operation.
>
> [PAUSE 1s]
>
> That's the whole thing. Six nodes maximum. Try it on your own, then compare to the finished template in your workflows folder.

### [SCREEN] 8:30–9:00
Module 1 summary slide.

### [ON-SCREEN TEXT] 8:30–9:00
> **Module 1 recap:**
> ✅ n8n installed & running
> ✅ UI mastered
> ✅ First workflow built
> ✅ Triggers, items, expressions, credentials, static data

### [VO]
> Recap. You know what n8n is and why we chose it. You've installed it locally with Docker. You've toured the UI. You've built your first validation workflow. And you understand the five concepts that make everything else possible.
>
> [PAUSE 1s]
>
> Next up — module two. We leave n8n for a bit and go understand the Daraja API inside out. You can't build a solid payment system if you don't deeply understand what Safaricom is doing on the other end. Thirty-five minutes of pure Daraja. Let's go.

### [SCREEN] 9:00–9:30
End card.

### [ON-SCREEN TEXT] 9:00–9:30
> **Module 2 →** Understanding the Daraja API

---

## Recording checklist for Module 1

- [ ] Fresh n8n install, zero workflows (record UI tour first)
- [ ] Docker Desktop running, images pre-pulled
- [ ] Terminal styled consistently (dark theme, large font ≥ 16pt)
- [ ] Hetzner pricing page screenshotted + n8n Cloud pricing page screenshotted
- [ ] Spring Boot code screenshot ready for the comparison in 1.1
- [ ] All code snippets rendered in Carbon.now.sh or VS Code with Dracula theme
- [ ] CapCut project set up with brand green (#2b7a3e) for callouts

