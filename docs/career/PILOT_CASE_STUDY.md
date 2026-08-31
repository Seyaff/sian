# Pilot Case Study — Interview Story (STAR Format)

Use this after tomorrow's restaurant owner call. Fill in `[brackets]` with real details.

---

## One-liner (elevator pitch)

> "I built a WhatsApp AI agent for a restaurant doing ~75 orders a day, sat with the owner to onboard them, and designed the system so wrong prices never reach the kitchen."

---

## STAR story — Situation

**S:** A restaurant branch in [city] handles 70–80 orders per day mostly on WhatsApp. Messages get missed, staff reply late, and manual order taking causes price mistakes.

**T:** Build an AI agent that captures orders on WhatsApp with correct menu prices and owner control before the kitchen acts.

---

## STAR story — Action

**A:** I built and deployed:

1. **Customer agent** — Roman Urdu / English, menu search against MongoDB, reservations, customer memory
2. **Validated order flow** — agent proposes → `OrderValidationService` checks items/prices → owner gets Approve/Deny on WhatsApp
3. **B2B onboarding** — API + agent to create tenant, welcome pack, menu ingest, provision in 48h target
4. **Guardrails** — Zod tool schemas, text-only session history (fixed Groq tool-replay bugs), offline eval script

**Pilot steps I ran with the owner:**
- Created onboarding case (`POST /api/v1/onboarding/cases`)
- Sent welcome pack (agreement, checklist, setup invoice)
- Collected menu PDF + WhatsApp Business phone number ID
- Provisioned restaurant + ingested menu to Pinecone
- Tested live order flow with owner approval

---

## STAR story — Result

**R:** (Update after call — examples:)

- Owner agreed to pilot at Rs [X]/month setup + Rs [Y]/month
- Live test order placed with correct DB prices and owner approval
- Go-live target: 48 hours from menu + WhatsApp access
- Identified gaps: [e.g. token refresh, Roman Urdu edge cases, peak-hour latency]

If pilot is unpaid discovery:
> "Validated product-market fit with a high-volume branch owner; captured requirements for hours, menu, and approval workflow. Next step: paid pilot."

---

## Technical deep-dive answers (from this pilot)

**Why human approval?**
Restaurant owners don't trust fully autonomous orders on day one. Approve/Deny builds trust; we can relax later per tenant.

**What broke in production?**
- Expired WhatsApp token (401 on send — agent logic worked)
- Groq session history with raw tool blobs — fixed with text-only stored messages
- LLM sending `null` for optional fields — fixed with `nullableString()` Zod helpers

**How do you prevent wrong prices?**
Agent calls `proposeOrderTool` → backend resolves prices from MongoDB → owner sees summary → only on Approve does `placeOrderAction` run.

---

## Questions to ask the owner tomorrow (fill answers after call)

| Question | Answer |
|----------|--------|
| Biggest WhatsApp pain? | |
| % orders via WhatsApp vs phone? | |
| Willing to pay monthly? Amount? | |
| Who approves orders — owner or manager? | |
| Menu update frequency? | |

---

## Slide-free talking points (60 sec)

1. Problem: missed WhatsApp orders, wrong prices
2. Solution: AI agent + validated orders + owner approval
3. Demo: customer orders biryani → approve → kitchen
4. Business: Rs 20k/mo + setup, 48h go-live
5. Ask: "Can we run a 2-week pilot on your branch?"

---

## Update resume after call

See `RESUME.md` — replace "pilot stage" with restaurant name and order volume.
