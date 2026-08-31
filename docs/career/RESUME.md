# Resume / CV Content

Copy into Word, Google Docs, or [flowcv.io](https://flowcv.io). Keep to 1–2 pages.

---

## [Your Name]
**Applied AI Engineer · Full-Stack**  
Pakistan · Remote  
[email] · [phone] · [LinkedIn URL] · [GitHub URL]  
Demo: [YOUR_DEMO_URL]

---

## Summary

Full-stack engineer building production-style AI agents with tool-calling, RAG, and human-in-the-loop guardrails. Shipped a restaurant WhatsApp ordering system with validated menu prices, session memory, and B2B onboarding. Open to remote AI engineering roles.

---

## Technical Skills

**AI / Agents:** Vercel AI SDK, tool-calling agents, RAG, prompt engineering, Pinecone, Groq/Gemini  
**Backend:** TypeScript, Node.js, Express, MongoDB, REST APIs, Zod validation  
**Integrations:** Meta WhatsApp Business API, PDF ingestion, webhooks  
**Planned:** LangChain, LangGraph, Langfuse (inventory agent roadmap)

---

## Projects

### Restaurant WhatsApp AI Agent | Personal Project | 2025 – 2026
*GitHub: github.com/Seyaff/sian · Demo: [URL]*

- Built end-to-end ordering agent for restaurants: menu search, cart, reservations, Roman Urdu / Hinglish support
- Designed propose → validate → approve order flow; backend enforces DB prices via `OrderValidationService` (agent cannot hallucinate prices)
- Integrated Meta WhatsApp Business API with session memory, customer profiles, and staff notifications
- Added RAG pipeline (Pinecone + PDF ingestion) for non-menu restaurant knowledge
- Built B2B onboarding API + agent for post-sale restaurant provisioning (menu ingest, checklist, welcome pack)
- Wrote offline eval script (`npm run eval-agent`) for menu search and order validation regression tests

**Stack:** TypeScript, Vercel AI SDK, Groq, MongoDB, Pinecone, Express

---

## Education
[Your degree, university, year]

---

## Additional (optional)

**Languages:** English, Urdu  
**Work authorization:** Pakistan, open to remote international

---

## After pilot call — update this line

Change summary to:
> Deployed pilot WhatsApp ordering agent for [Restaurant Name] (~75 orders/day branch). Owner-approved order flow live on Meta WhatsApp Business API.

Add bullet:
> Onboarded restaurant owner via B2B onboarding agent; provisioned tenant + menu ingest in 48-hour target window
