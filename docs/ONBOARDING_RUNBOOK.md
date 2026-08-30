# Onboarding runbook — customer call tomorrow

Use this when the restaurant owner (70–80 orders/day branch) contacts you.

## Before the call (5 min)

1. Restart backend with latest code
2. Have menu PDF ready (or ask them to WhatsApp it during call)
3. Know your pricing: setup fee + monthly (decide tonight)

## Step 1 — Create onboarding case (as soon as they call)

```bash
curl -X POST http://localhost:8000/api/v1/onboarding/cases \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Restaurant Name",
    "branchName": "Branch location",
    "ownerName": "Owner name",
    "ownerPhone": "923001234567",
    "ownerEmail": "owner@example.com",
    "dailyOrderVolume": 75,
    "plan": "sales",
    "setupFee": 30000,
    "monthlyFee": 20000
  }'
```

Save the returned `caseId`.

## Step 2 — Chat with onboarding agent (optional, during call)

```bash
curl -X POST http://localhost:8000/api/v1/onboarding/cases/CASE_ID/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Owner agreed to pilot. They have 75 orders per day. Need menu PDF and WhatsApp Business access."}'
```

## Step 3 — Send welcome pack (WhatsApp or email)

```bash
curl http://localhost:8000/api/v1/onboarding/cases/CASE_ID/welcome-pack
```

Copy `welcomeMessage`, `checklist`, `serviceAgreement`, `setupInvoice` and send to owner.

## Step 4 — Collect during / after call

| Item | Ask owner |
|------|-----------|
| Menu | PDF or photos — full prices |
| WhatsApp | Their WhatsApp Business number OR use yours for pilot |
| Hours & address | For knowledge base |
| Owner alert phone | Gets new order notifications |
| Staff phones | Optional — mark orders ready |

Update case:

```bash
curl -X PATCH http://localhost:8000/api/v1/onboarding/cases/CASE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "whatsappPhoneNumberId": "THEIR_OR_YOUR_PHONE_NUMBER_ID",
    "menuFilePath": "./uploads/their-menu.pdf",
    "checklist": { "menu_pdf_received": true, "contract_agreed": true }
  }'
```

## Step 5 — Provision (when menu + WhatsApp ID ready)

```bash
curl -X POST http://localhost:8000/api/v1/onboarding/cases/CASE_ID/provision \
  -H "Content-Type: application/json" \
  -d '{"ingestMenu": true}'
```

This creates the restaurant in DB, ingests menu to Pinecone, marks case `go_live`.

## Step 6 — Test before you promise go-live

1. Send "menu?" to their WhatsApp number
2. Place a test order → Approve
3. Owner phone receives order alert

## What to say on the call (script)

**Open:** "Assalam o Alaikum — thanks for reaching out. You mentioned 70–80 orders a day — we help restaurants capture and confirm those WhatsApp orders automatically, with correct menu prices."

**Pain:** "How many orders come on WhatsApp today? Who replies — counter staff? What happens when they're busy?"

**Demo offer:** "We can run a short pilot on your branch — your customers message WhatsApp, bot answers menu and takes orders, you approve before kitchen gets it."

**Close:** "I'll send a welcome pack today with checklist and setup invoice. If you share menu PDF and WhatsApp access, we can go live in 48 hours."

**Do not say:** AI agent, RAG, LLM, Pinecone.

## If they want multi-branch later

- Start with **one branch** only for pilot
- Same system scales — mention after first branch works

## API quick reference

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/onboarding/cases` | Start case |
| GET | `/api/v1/onboarding/cases` | List all |
| GET | `/api/v1/onboarding/cases/:id` | Status + checklist |
| PATCH | `/api/v1/onboarding/cases/:id` | Update info |
| POST | `/api/v1/onboarding/cases/:id/chat` | Onboarding agent |
| GET | `/api/v1/onboarding/cases/:id/welcome-pack` | Documents to send |
| POST | `/api/v1/onboarding/cases/:id/provision` | Create restaurant + ingest |
