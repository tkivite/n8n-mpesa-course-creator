# M-Pesa Daraja API : Cheat Sheet

> One-page reference for the course. Export to PDF with Pandoc or your Markdown previewer.

## 🔗 Endpoints

| Purpose | Method | Sandbox URL |
|---|---|---|
| OAuth token | GET | `https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials` |
| STK Push | POST | `https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest` |
| STK Query | POST | `https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query` |
| C2B Register URL | POST | `https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl` |
| C2B Simulate | POST | `https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate` |
| B2C Payment | POST | `https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest` |
| Account Balance | POST | `https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query` |
| Reversal | POST | `https://sandbox.safaricom.co.ke/mpesa/reversal/v1/request` |

Production: replace `sandbox.safaricom.co.ke` with `api.safaricom.co.ke`.

## 🔑 Sandbox Test Credentials

| Field | Value |
|---|---|
| Shortcode (PayBill) | `174379` |
| Passkey | `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919` |
| Test phone | `254708374149` (or your own — Daraja PINs any sandbox phone) |

## 🧮 Password Formula

```
Password = Base64( Shortcode + Passkey + Timestamp )
Timestamp = YYYYMMDDHHmmss  (Africa/Nairobi, 24-hour)
```

Example (JS):
```js
Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
```

## 📞 Phone Number Format

Always **`2547XXXXXXXX`** or **`2541XXXXXXXX`** (Safaricom + Airtel).
Strip `+`, spaces, dashes. Replace leading `0` with `254`.

## 📨 STK Push Request (minimum)

```json
{
  "BusinessShortCode": 174379,
  "Password": "<base64>",
  "Timestamp": "20261001101530",
  "TransactionType": "CustomerPayBillOnline",   // or "CustomerBuyGoodsOnline"
  "Amount": 1,
  "PartyA": 254708374149,
  "PartyB": 174379,
  "PhoneNumber": 254708374149,
  "CallBackURL": "https://your-domain/webhook/mpesa/stk-callback",
  "AccountReference": "ORDER-1001",   // max 12 chars
  "TransactionDesc": "Payment"        // max 13 chars
}
```

## 📩 Callback Shape

```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34620561-1",
      "CheckoutRequestID": "ws_CO_...",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount",              "Value": 1 },
          { "Name": "MpesaReceiptNumber",  "Value": "SGH1A2B3C4" },
          { "Name": "TransactionDate",     "Value": 20261001101545 },
          { "Name": "PhoneNumber",         "Value": 254708374149 }
        ]
      }
    }
  }
}
```

## ⚠️ Common Result Codes

| Code | Meaning | Action |
|---|---|---|
| `0` | Success | Mark paid, send receipt |
| `1` | Insufficient funds | Ask user to top up |
| `17` | Internal M-Pesa error | Retry via STK Query |
| `20` | Unable to lock subscriber | Retry later |
| `1032` | User cancelled | Mark cancelled, no retry |
| `1037` | DS timeout — user didn't respond | Mark timeout |
| `2001` | Wrong PIN | Mark failed |

## 🧪 Testing Tips

- Sandbox tokens expire after **~3599 seconds** — cache them.
- Timestamp must be within **±5 minutes** of M-Pesa server time (use NTP on your VPS).
- Callbacks **don't retry** — always 200 OK immediately, then process async.
- Safaricom whitelists production callback IPs; keep them static.
- Logs: enable n8n execution logging, store raw callback in `mpesa_callbacks` table.

## 🚀 Go-Live Checklist

- [ ] Production app approved in Daraja portal
- [ ] Business shortcode allocated (PayBill or Till)
- [ ] Production Consumer Key / Secret / Passkey saved to `.env`
- [ ] Callback URL uses HTTPS with valid cert
- [ ] Callback URL IP whitelisted (if required by your org)
- [ ] All test numbers removed from code
- [ ] Load test: 10 concurrent STK pushes complete under 5s each
- [ ] Reconciliation workflow scheduled & tested
- [ ] Alerting configured (Slack/email on failed TX > threshold)
- [ ] DB backups scheduled

