# Future features and business roadmap

Deferred work — not required for tomorrow's onboarding or first pilot.

## North-star metrics

| Metric | Target |
|--------|--------|
| WhatsApp order capture rate | 15% → 30% of inbound chats |
| Order accuracy | <2% validation failures at confirm |
| Median reply time | <30 seconds |
| 30-day repeat order rate | +10% with memory/campaigns |
| Time to go-live | 48 hours |

## Phase 1 — Retain pilots (weeks 3–6)

- Live orders dashboard (wire `frontend/src/app/dashboard/orders` to real API)
- Today KPIs: orders count, revenue, active chats
- Conversation log read-only
- Customer list + last order
- Export orders CSV

## Phase 2 — Grow revenue (weeks 7–12)

- Meta-approved reorder template
- 30-day win-back segment
- Real insights page (replace mock data)
- Suggested actions ("nudge 128 customers")
- Weekend promo template

## Phase 3 — Scale (months 4–6)

- Full onboarding agent automation (email, e-sign, billing)
- Multi-restaurant admin
- Subscription billing (Stripe / JazzCash)
- White-label weekly PDF reports

## Phase 4 — Moat (6+ months)

- Branch-level analytics
- POS / delivery integrations
- Campaign A/B tests
- Industry benchmarks

## Pricing reference (Pakistan)

- Rs 20,000/mo + Rs 30,000 setup (single outlet)
- Tiers: Host / Sales / Multi-branch

## Sales pitch (outcomes, not tech)

- "Har WhatsApp message ka jawab, order capture"
- "Galat price ya item kitchen mein nahi jayega"
- "Purane customer wapas laate hain"

See also: [ONBOARDING_RUNBOOK.md](./ONBOARDING_RUNBOOK.md) for tomorrow's customer call.
