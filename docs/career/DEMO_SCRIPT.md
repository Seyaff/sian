# 2-Minute Portfolio Demo Script

Record with **Loom** (free) or **OBS**. Show: phone screen + terminal side-by-side, or terminal + browser.

**Before recording:**
```bash
cd backend
npm run dev          # terminal 1
npm run eval-agent   # terminal 2 — shows tests pass (optional 5 sec clip)
```

Ensure `.env` has valid `GROQ_API_KEY`, `MONGO_URI`, `DEFAULT_RESTAURANT_ID`.

---

## Shot list (2:00 total)

### 0:00 — Hook (15 sec)
**Say:**
> "I built a WhatsApp AI agent for restaurants. It doesn't just chat — it searches real menu prices, proposes validated orders, and requires the owner to approve before the kitchen sees anything."

**Show:** GitHub README architecture diagram or this repo open.

---

### 0:15 — Menu search (25 sec)
**Say:**
> "If a customer asks for biryani, the agent must call searchMenuTool first. It cannot invent prices."

**Do:** `POST /api/v1/agent/chat`

```bash
curl -X POST http://localhost:8000/api/v1/agent/chat \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"923001234567\", \"query\": \"chicken biryani ka price kya hai?\", \"restaurantId\": \"YOUR_RESTAURANT_ID\"}"
```

**Show:** Response with real prices from MongoDB.

---

### 0:40 — Place order + approval (35 sec)
**Say:**
> "When the customer orders, the agent proposes — backend validates every item against the database. The customer gets Approve and Deny buttons on WhatsApp."

**Do:** Send order message via curl or WhatsApp on phone:
> "2 chicken biryani order karna hai"

**Show:** WhatsApp with Approve/Deny buttons OR API response `"status": "REQUIRES_APPROVAL"`.

---

### 1:15 — Owner approves (20 sec)
**Say:**
> "Owner taps Approve. Order is placed with database prices — not whatever the LLM guessed."

**Do:** Tap Approve on WhatsApp, or:
```bash
curl -X POST http://localhost:8000/api/v1/agent/approval \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"923001234567\", \"approved\": true, \"restaurantId\": \"YOUR_RESTAURANT_ID\"}"
```

---

### 1:35 — B2B onboarding angle (15 sec)
**Say:**
> "I also built a B2B onboarding agent — create a case, generate welcome pack, provision a new restaurant in one API call."

```bash
curl http://localhost:8000/api/v1/onboarding/cases/CASE_ID/welcome-pack
```

**Show:** JSON with welcomeMessage, checklist, invoice draft.

---

### 1:50 — Close (10 sec)
**Say:**
> "Stack: TypeScript, Vercel AI SDK, Groq, MongoDB, Pinecone, Meta WhatsApp API. Link in description."

**Show:** GitHub repo URL on screen.

---

## Recording tips

- **1080p**, face cam optional (small corner builds trust)
- **Unlisted YouTube** or Loom link → add to LinkedIn Featured
- If WhatsApp token expired, demo via curl only — still valid
- Run `npm run eval-agent` for 3 seconds: "15 validation tests pass before deploy"

## Upload checklist

- [ ] Video uploaded (Loom / YouTube unlisted)
- [ ] Link added to LinkedIn Featured
- [ ] Link added to resume / cold DMs
- [ ] GitHub README updated with demo link (fill in `YOUR_DEMO_URL`)
