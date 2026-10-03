# Module 3 : OAuth in n8n

**Target runtime:** ~25 min · **Lessons:** 3 · **Combined word count:** ~3,700

---

## Lesson 3.1 : Why we build a reusable auth sub-workflow *(7 min)*

### [SCREEN] 0:00–0:15
Blank n8n canvas. Title card.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 3.1 : The auth sub-workflow pattern**

### [VO]
> Welcome to module three. Over the next twenty-five minutes we'll build a workflow whose only job is to fetch a Daraja access token. Nothing else. And then we'll make it callable from every other workflow in the course.
>
> [PAUSE 1s]
>
> Why dedicate a whole workflow to one HTTP call? Three reasons. One: every Daraja API we touch — STK push, status query, B2C, reversal — needs the same token. Writing the fetch logic once and reusing it is cleaner than copy-pasting. Two: we're going to add token caching, so we don't hit Daraja's OAuth endpoint on every single transaction. That caching logic lives in exactly one place. Three: when Safaricom eventually changes the auth mechanism — and they will — you fix one workflow, not ten.

### [SCREEN] 0:45–1:30
Diagram: central "auth" workflow with arrows coming in from "STK push", "status query", "B2C", "reversal" workflows.

### [B-ROLL]
Animated token flowing from the auth workflow out to each caller.

### [VO]
> Mental model. Picture a central auth node. Every other workflow is a caller. Caller says "give me a token". Auth node says "here's one, valid for the next hour". Caller uses it. The auth node handles the cache, the HTTP call, the error paths. Everyone else stays simple.
>
> [PAUSE 1s]
>
> This is the "sub-workflow" pattern in n8n. Any workflow with an "Execute Workflow Trigger" node can be called from any other workflow via the "Execute Workflow" action node. Inputs, outputs, errors — all propagate as if it were a single workflow.

### [SCREEN] 1:30–2:30
Open `workflows/01-mpesa-auth.json` from the repo, import into n8n.

### [VO]
> Let's build it. In your n8n editor, click "import from file", pick zero-one dash mpesa dash auth dot json from the course repo. The workflow appears with four nodes. We're going to go through each one, understand what it does, and then wire a caller to it.

### [SCREEN] 2:30–3:30
Zoom into node 1: "Execute Workflow Trigger".

### [VO]
> Node one: Execute Workflow Trigger. This is what makes the workflow callable from other workflows. There's no configuration — it just sits there, waiting to be invoked. The alternative would be a Webhook, but Execute Workflow Trigger is faster — no HTTP round trip. Everything stays in-process.

### [SCREEN] 3:30–4:30
Zoom into node 2: "Build Basic Auth" Code node. Show the JavaScript.

### [ON-SCREEN TEXT] 3:30–4:30
> ```js
> const key = $env.MPESA_CONSUMER_KEY;
> const secret = $env.MPESA_CONSUMER_SECRET;
> const token = Buffer.from(`${key}:${secret}`).toString('base64');
> return [{ json: { authHeader: `Basic ${token}`, baseUrl: ... } }];
> ```

### [VO]
> Node two: a Code node that builds the HTTP Basic Auth header. Reads your Consumer Key and Consumer Secret from env vars. Concatenates them with a colon. Base-sixty-four encodes. Returns the string "Basic" space the encoded value — that's the exact format HTTP Basic Auth expects.
>
> [PAUSE 1s]
>
> Why not use the HTTP Request node's built-in Basic Auth option? Because we also want to read the base URL from env — so switching sandbox to production is just an env change, no node edit. One Code node, two concerns, cleanly separated.

### [SCREEN] 4:30–5:30
Zoom into node 3: HTTP Request to `/oauth/v1/generate`.

### [VO]
> Node three: HTTP Request. GET to the OAuth endpoint, with the Authorization header we just built. Timeout: ten seconds — generous, but we never want to hang the caller forever. If Daraja is down, we want to fail fast and let the caller decide what to do.
>
> [PAUSE 1s]
>
> Expected response: a JSON object with "access_token" and "expires_in". The expires_in is almost always three-five-nine-nine seconds — one second shy of an hour. That one-second gap is Safaricom being paranoid about clock drift.

### [SCREEN] 5:30–6:20
Zoom into node 4: "Return Token" Code node.

### [VO]
> Node four: Return Token. Simple Code node that pulls access_token and expires_in out of the HTTP response, computes an absolute expires_at timestamp, and returns them. The caller — our STK push workflow — only cares about the access_token string, but having expires_at available means we can later add caching with no API change.
>
> [PAUSE 1s]
>
> Also throws a clear error if the response doesn't contain an access_token. If Daraja returns an error page or a rate-limit response, we fail loud. Silent failures in payment systems are how you lose money.

### [SCREEN] 6:20–6:50
Click the "Execute Workflow" button on the Execute Workflow Trigger node. Watch it run.

### [VO]
> Click execute. The workflow runs. Four green checkmarks. Click the last node — Return Token — and you see a real access_token string. Copy it, head to Postman, you can use it to hit any Daraja endpoint for the next hour.

### [SCREEN] 6:50–7:00
End card.

### [ON-SCREEN TEXT] 6:50–7:00
> **Up next:** Token caching with static data

### [VO]
> Next lesson: we add caching. Right now every call to this workflow hits Daraja. Sixty transactions a minute means sixty OAuth calls. We're about to make it one OAuth call an hour, no matter the traffic. See you there.

---

## Lesson 3.2 : Caching tokens with workflow static data *(9 min)*

### [SCREEN] 0:00–0:15
Open the auth workflow. Highlight the two Code nodes we'll modify.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 3.2 : Token caching that scales**

### [VO]
> Caching time. In module one we touched on getWorkflowStaticData. Now we use it for real.

### [SCREEN] 0:15–1:00
Diagram: cache hit vs cache miss paths through the workflow.

### [VO]
> The pattern. Before fetching a new token, check the cache. If a cached token exists and expires in more than sixty seconds, return it directly. Skip the HTTP call entirely. If no cache, or the cache is about to expire, hit Daraja, store the result, return it.
>
> [PAUSE 1s]
>
> That sixty-second buffer is a trick. Daraja tokens are valid for about an hour. If we cache until the exact expiry moment, we risk serving a token to a transaction that's about to call Daraja — only for Daraja to reject it as "just expired". Returning the cache only if more than a minute of life remains means every token we serve has safe runway.

### [SCREEN] 1:00–2:30
Add a new Code node at the start of the workflow. Paste the cache-check code.

### [ON-SCREEN TEXT] 1:00–2:30
> ```js
> const data = $getWorkflowStaticData('global');
> if (data.token && new Date(data.expires_at) > new Date(Date.now() + 60_000)) {
>   return [{ json: {
>     access_token: data.token,
>     expires_in: Math.floor((new Date(data.expires_at) - Date.now())/1000),
>     expires_at: data.expires_at,
>     cached: true
>   }}];
> }
> return [{ json: { needsFetch: true } }];
> ```

### [VO]
> Add a Code node right after the trigger. Call it "Check Cache". Paste this.
>
> [PAUSE 1s]
>
> Get workflow static data with scope "global" — which just means "shared across all executions of this workflow". If a token exists and the expiry is more than sixty seconds in the future, return it with a cached flag set to true. Otherwise return a marker object saying "needs fetch".

### [SCREEN] 2:30–3:30
Add an IF node after Check Cache. True branch: skip to the end. False branch: continue to the original Build Basic Auth node.

### [VO]
> Now an IF node. Condition: does the output have "needsFetch" equal to true? Yes branch continues to the original Basic Auth logic. No branch — meaning we have a cache hit — jumps directly to the final Return Token node, bypassing the HTTP call.
>
> [PAUSE 1s]
>
> This "if cache miss, do the expensive thing; if cache hit, skip to the end" pattern is standard in production workflows. You'll use it any time you have an API call that doesn't need to run every time.

### [SCREEN] 3:30–4:30
Modify the Return Token node to also write to static data on cache miss.

### [ON-SCREEN TEXT] 3:30–4:30
> ```js
> const data = $getWorkflowStaticData('global');
> if (!$json.cached) {   // fresh token: store it
>   data.token = $json.access_token;
>   data.expires_at = $json.expires_at;
> }
> return $input.all();
> ```

### [VO]
> Finally, modify the Return Token node. Before returning, check if the input came from a cache hit — if not, this is a fresh token from Daraja, so store it in static data. Static data persists between executions, so the next caller gets the cache hit.
>
> [PAUSE 1s]
>
> Note: static data mutations only persist when the workflow is saved and active. In test mode, they're discarded. So activate the workflow before running your cache tests.

### [SCREEN] 4:30–5:30
Save, activate. Trigger the workflow twice from another test workflow. First run shows "cached: false". Second run shows "cached: true".

### [VO]
> Let me prove it works. Save, activate. Trigger it once from a test workflow — I'm using a simple Execute Workflow node that fires it manually. First run: cached is false, we made the HTTP call. Trigger again. Second run: cached is true, no HTTP call, instant response.

### [SCREEN] 5:30–6:20
Open the executions log. Point out the ~800ms first run vs ~5ms cached runs.

### [VO]
> Look at the execution times. First run: eight hundred milliseconds — that's the round trip to Safaricom. Second run: five milliseconds. On a busy day processing thousands of transactions, this cache saves seconds of latency per transaction and keeps you well under Daraja's rate limits.

### [SCREEN] 6:20–7:30
Discuss cache invalidation.

### [ON-SCREEN TEXT] 6:20–7:30
> **Cache invalidation:**
> ✓ Automatic: expiry check
> ✓ Manual: clear in Settings → Variables
> ✓ On error: clear + retry

### [VO]
> One thing to think about: cache invalidation. Three scenarios where you might want to blow the cache away.
>
> [PAUSE 1s]
>
> One: you rotated your Consumer Secret and the cached token is now using the old credentials. Fix: the next Daraja call will fail with four-oh-one, and you catch that and clear the cache. We'll wire this up in a moment.
>
> [PAUSE 1s]
>
> Two: you want to manually test what happens on a fresh fetch. Fix: in n8n, open the workflow, go to settings, scroll down to "clear static data". One click, cache gone.
>
> [PAUSE 1s]
>
> Three: you're deploying a new environment. Fix: static data is per-workflow and lives in n8n's database. Fresh deploys start empty, which is what you want.

### [SCREEN] 7:30–8:30
Add error handling: on HTTP error, clear static data and bubble up.

### [ON-SCREEN TEXT] 7:30–8:30
> ```js
> // In the HTTP Request node settings:
> // On Error → Continue (using error output)
> // Then a Code node:
> const data = $getWorkflowStaticData('global');
> delete data.token;
> delete data.expires_at;
> throw new Error('Daraja auth failed: ' + $json.error);
> ```

### [VO]
> Last upgrade. On the HTTP Request node, open Settings. Set "On Error" to "Continue using error output". That gives the node a second output port on the bottom, which fires only when the HTTP call fails.
>
> [PAUSE 1s]
>
> Wire that error output to a new Code node. In that Code node, clear the static data entries for token and expires_at, then throw an error so the caller knows the auth failed. This way, a bad cached token can't persist. The next caller forces a fresh fetch.

### [SCREEN] 8:30–8:50
End card.

### [ON-SCREEN TEXT] 8:30–8:50
> **Up next:** Calling the auth workflow from everywhere else

### [VO]
> Caching, invalidation, error handling. In the next lesson we show how any other workflow calls this one with a single node. Then we move on to module four, the main event.

---

## Lesson 3.3 : Calling the auth workflow from other workflows *(6 min)*

### [SCREEN] 0:00–0:15
Open a fresh test workflow.

### [ON-SCREEN TEXT] 0:00–0:10
> **Lesson 3.3 : The Execute Workflow node**

### [VO]
> Quick lesson. We built a sub-workflow. Now let's see how any other workflow calls it. One node. Thirty seconds of config.

### [SCREEN] 0:15–1:30
Add a manual trigger. Add an Execute Workflow node. Point it to "01 - M-Pesa Auth".

### [VO]
> New workflow. Add a manual trigger — just so we can click to run it. Then add an "Execute Workflow" action node — the one that calls another workflow by reference.
>
> [PAUSE 1s]
>
> In the node config, pick the workflow from the dropdown. "Zero one dash M dash Pesa auth". That's it. No parameters to pass — our auth workflow takes no inputs. If you ever build a sub-workflow that needs inputs, you'd pass them as items here.

### [SCREEN] 1:30–2:30
Execute. Show the output: access_token, expires_in, expires_at.

### [VO]
> Execute. The sub-workflow runs. Its final output appears as the input to whatever comes after the Execute Workflow node. In this case: access_token, expires_in, expires_at, and possibly cached: true.
>
> [PAUSE 1s]
>
> From here, you can chain any downstream node. HTTP Request to call Daraja with that Bearer token. Code node to decorate the token with other data. Whatever your workflow needs.

### [SCREEN] 2:30–3:30
Reference the token downstream: show expression `{{ $json.access_token }}` in an HTTP Request Authorization header.

### [ON-SCREEN TEXT] 2:30–3:30
> `Authorization: Bearer {{ $json.access_token }}`

### [VO]
> Here's the pattern. HTTP Request node after the Execute Workflow. Authorization header value: "Bearer" space, then an expression — curly braces dollar json dot access_token. The expression resolves at runtime to the fresh token from your sub-workflow.
>
> [PAUSE 1s]
>
> This exact pattern — Execute Workflow then HTTP Request with Bearer — appears in modules four, six, and nine. Learn it once, you've learned the whole course's auth story.

### [SCREEN] 3:30–4:30
Show the executions view. Click an execution, see the sub-workflow nested inside.

### [VO]
> One more cool thing. Open executions. Click any run that used the sub-workflow. Scroll into the execution detail. You can see the sub-workflow's own nodes nested as a group inside the parent. All the data visible, all the timing visible. If auth is slow or failing, you drill in without leaving the executions view.

### [SCREEN] 4:30–5:30
Discuss error propagation.

### [VO]
> Error handling. If the sub-workflow throws — say, Daraja returned four-oh-one — the Execute Workflow node in the caller throws too. The caller's workflow stops unless you've set it to continue on error.
>
> [PAUSE 1s]
>
> For STK push, we want the caller to stop. If we can't auth, we can't push. Return an error to the frontend, don't try to continue. That's the default behavior — nothing to configure.

### [SCREEN] 5:30–5:50
End card. Module 3 summary.

### [ON-SCREEN TEXT] 5:30–5:50
> **Module 3 recap:**
> ✅ Reusable auth workflow
> ✅ Token caching with static data
> ✅ Error-driven cache invalidation
> ✅ Sub-workflow invocation pattern

### [VO]
> Module three done. You have a production-quality auth sub-workflow with caching and error handling. Every other workflow in the course calls it. Next up: module four, the STK push itself. The main event. Let's go.

### [SCREEN] 5:50–6:00
End card.

### [ON-SCREEN TEXT] 5:50–6:00
> **Module 4 →** Building the STK Push workflow

---

## Recording checklist for Module 3

- [ ] `01-mpesa-auth.json` imported and visible
- [ ] Fresh test workflow for the caller demo
- [ ] Executions tab cleared before each demo for a clean log
- [ ] Carbon.now.sh snippets for the three Code nodes prepared

