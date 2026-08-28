# Production checklist

What is already in the repo vs what you still need before going live.

## Already set up

- [x] GitHub Actions CI (typecheck, build, lint, Docker build on every PR)
- [x] GitHub Actions Deploy (pushes Docker images to GHCR on `main`)
- [x] Backend Dockerfile + production `npm start` (runs via tsx)
- [x] Frontend Dockerfile
- [x] `docker-compose.yml` for local prod-like testing
- [x] `backend/.env.example` — all required env vars documented
- [x] Health endpoint: `GET /api/v1/health`

---

## 1. Hosting (pick one)

| Service | Backend | Frontend | Notes |
|---------|---------|----------|-------|
| **Railway** | Docker or Node | Docker or Vercel | Easy, good for startups |
| **Render** | Docker | Static / Vercel | Free tier available |
| **Vercel** | — | Next.js native | Best for frontend only |
| **VPS** (Hetzner, DO) | `docker compose up` | same | Most control, you manage SSL |

**Recommended split:**
- Backend → Railway or Render (always-on, webhook URL)
- Frontend → Vercel (free, fast)
- MongoDB → MongoDB Atlas (free M0 tier)
- Pinecone → existing cloud index

---

## 2. Environment variables (production)

Copy `backend/.env.example` → set in your host's secret manager.

**Required:**
```
MONGO_URI
GROQ_API_KEY
GOOGLE_GENERATIVE_AI_API_KEY
PINECONE_API_KEY
WHATSAPP_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID
WHATSAPP_VERIFY_TOKEN
DEFAULT_RESTAURANT_ID
```

**Recommended:**
```
OWNER_WHATSAPP_PHONE
STAFF_WHATSAPP_PHONES
DEFAULT_PREP_MINUTES=30
NODE_ENV=production
USE_DB_SESSIONS=true
```

**Frontend (Vercel / build args):**
```
NEXT_PUBLIC_API_URL=https://your-api.com/api/v1
NEXT_PUBLIC_RESTAURANT_ID=da-pakhtun-dera
```

---

## 3. WhatsApp webhook (Meta)

1. Deploy backend and get a **public HTTPS URL** (e.g. `https://api.yourdomain.com`)
2. In Meta Developer Console → WhatsApp → Configuration:
   - **Callback URL:** `https://api.yourdomain.com/api/v1/whatsapp/webhook`
   - **Verify token:** same as `WHATSAPP_VERIFY_TOKEN` in env
3. Subscribe to `messages` field
4. Test with a real message

---

## 4. Database

- [ ] MongoDB Atlas cluster (not local Mongo)
- [ ] IP allowlist: `0.0.0.0/0` or your host's egress IPs
- [ ] Backups enabled (Atlas M10+ or manual exports)
- [ ] Run RAG ingest once: `npm run ingest -- --restaurant da-pakhtun-dera --file ./Da_Pakhtun_Dera_RAG_Knowledge_Base.pdf`

---

## 5. DNS & SSL

- [ ] Domain pointed to backend (e.g. `api.yourdomain.com`)
- [ ] Domain pointed to frontend (e.g. `app.yourdomain.com`)
- [ ] HTTPS everywhere (Railway/Render/Vercel handle this automatically)

---

## 6. GitHub repo settings

For deploy workflow to work on `main`:

1. **Settings → Actions → General** → allow workflows
2. **Settings → Variables** (repository variables):
   - `NEXT_PUBLIC_API_URL` = your production API URL
   - `NEXT_PUBLIC_RESTAURANT_ID` = `da-pakhtun-dera`
3. Images publish to **GitHub Container Registry** (`ghcr.io/<your-repo>/backend`)

Pull on your server:
```bash
docker pull ghcr.io/seyaff/sian/backend:latest
```

---

## 7. Security (before real customers)

- [ ] Remove verbose request logging in `app.ts` (logs all headers — dev only)
- [ ] Restrict CORS from `*` to your frontend domain
- [ ] Add API auth for dashboard/admin routes (orders, campaigns)
- [ ] Rotate WhatsApp token if ever leaked
- [ ] Never commit `.env` files

---

## 8. Monitoring & alerts

- [ ] Uptime check on `/api/v1/health` (UptimeRobot, Better Stack — free)
- [ ] Error alerts (Sentry — optional)
- [ ] MongoDB Atlas alerts (disk, connections)
- [ ] WhatsApp webhook delivery failures → check Meta dashboard

---

## 9. WhatsApp marketing (campaigns)

- [ ] Create and get **Meta-approved templates** (`reorder_nudge`, `event_announcement`)
- [ ] Test `POST /api/v1/campaigns` on staging first
- [ ] Respect 7-day campaign cooldown (already in code)

---

## 10. Run locally like production

```bash
# Copy env
cp backend/.env.example backend/.env
# Fill in real values

# Build and run
docker compose up --build
```

- Backend: http://localhost:8000/api/v1/health
- Frontend: http://localhost:3000

---

## 11. Still optional (nice to have)

| Item | Why |
|------|-----|
| Langfuse / LangSmith | Agent trace UI when debugging production |
| Staging environment | Test webhooks before prod |
| Automated tests in CI | Catch regressions |
| Rate limiting | Protect API from abuse |
| Redis | Session cache if MongoDB gets slow |
| CDN for menu images | Faster WhatsApp image sends |

---

## Quick deploy commands

**CI runs automatically** on push to `main` or PRs.

**Manual deploy trigger:** GitHub → Actions → Deploy → Run workflow

**Local production test:**
```bash
cd backend && npm run build && npm start
cd frontend && npm run build && npm start
```
