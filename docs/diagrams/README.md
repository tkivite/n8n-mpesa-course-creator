# Course Diagrams

Mermaid source files. GitHub renders them natively in Markdown. Export to PNG with `@mermaid-js/mermaid-cli` if you want to embed in slides / videos.

```bash
npm i -g @mermaid-js/mermaid-cli
mmdc -i stk-push-sequence.mmd -o stk-push-sequence.png -w 1920 -H 1080
```

## Files

| File | Used in | Description |
|---|---|---|
| `stk-push-sequence.mmd` | Module 2.1, Module 4 | End-to-end STK Push flow |
| `callback-flow.mmd` | Module 5.2 | Callback → DB update → confirmation |
| `reconciliation-flow.mmd` | Module 6.2 | Poll pending TX, resolve via `stkpushquery` |
| `architecture.mmd` | Module 7.1 | Production topology (Nginx, n8n, Postgres, Daraja) |
| `auth-caching.mmd` | Module 3.2 | Token cache hit/miss decision tree |

---

## Preview (rendered by GitHub)

### STK Push sequence

```mermaid
sequenceDiagram
    autonumber
    participant U as Customer
    participant F as Frontend
    participant N as n8n Workflow
    participant D as Daraja
    participant P as Customer Phone

    U->>F: Click "Pay with M-Pesa"
    F->>N: POST /webhook/mpesa/stk-push<br/>{phone, amount, ref}
    N->>N: Validate input
    N->>D: GET /oauth/v1/generate
    D-->>N: access_token
    N->>N: Build password (shortcode+passkey+ts)
    N->>D: POST /stkpush/v1/processrequest
    D-->>N: CheckoutRequestID
    N-->>F: {success:true, checkout_request_id}
    F-->>U: "Check your phone"
    D->>P: STK prompt
    U->>P: Enter PIN
    P->>D: PIN confirmed
    D->>N: POST /webhook/mpesa/stk-callback<br/>{ResultCode:0, Receipt}
    N->>N: Update DB → status=success
    N-->>U: Send confirmation (SMS/WhatsApp)
```

### Reconciliation flow

```mermaid
flowchart TD
    A[⏰ Every 5 min] --> B[Query pending TX<br/>age > 2 min, < 24 h]
    B -->|rows found| C[Get auth token<br/>cached]
    B -->|empty| Z[End]
    C --> D[Fan out:<br/>one query per TX]
    D --> E[POST /stkpushquery]
    E --> F{ResultCode}
    F -->|0| G[UPDATE status=success]
    F -->|1032| H[UPDATE status=cancelled]
    F -->|processing| I[Leave pending<br/>retry next cycle]
    F -->|other| J[UPDATE status=failed]
    G --> Z
    H --> Z
    I --> Z
    J --> Z
```

