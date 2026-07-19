# FarmEasy 🌾

**A direct-to-buyer marketplace for Indian farmers — zero middlemen, live photos, four languages, and a whole farm-to-market flow that fits in your pocket.**

FarmEasy connects small and mid-scale farmers directly with buyers (households, retailers, restaurants, agri-businesses) so that fresh produce moves from the field to the plate without brokers taking a cut. Alongside spot listings, it now supports **contract farming**, **price negotiation**, **buyer favorites**, **per-listing analytics**, and a prototype **AI Knowledge Network** for farming Q&A.

Live at: https://harvest-hub-six-beta.vercel.app/. Repo: `MDevivaraprasad-Dvp/harvest-hub`.

---

## ✨ Highlights

- 📸 **Live camera capture** — farmers photograph produce with the rear camera; images go straight into Supabase Storage
- 💸 **Zero middlemen** — buyers pay the farmer's asking price directly
- 🤝 **Price negotiation** — buyers propose a price, farmers accept/counter/reject, everyone sees the trail
- 📃 **Contract farming** — buyers commit to a future harvest with a deadline, quantity, and funding; farmers fulfill and get paid
- 🧠 **Knowledge Network — AI + Human, working together** — quick FAQs go to AI; complex, local questions route to a directory of expert farmers and agri-engineers you can tap-to-call. AI usage is deliberately capped so it stays affordable for farmers and human experts stay in the loop where their judgement matters.
- 🌐 **Four languages** — English, Hindi, Telugu, Tamil (full UI translated end-to-end)
- ⚡ **Feels-instant navigation** — hover-prefetch on nav items primes the cache so pages mount with data already loaded
- 📊 **Insights** — farmer market insights, per-listing analytics, buyer insights on trusted farmers and fast-selling produce

---

## 🧑‍🌾 App at a glance

Two roles, one shared marketplace:

### Farmer

- Sign in with **name + phone** (no password — localStorage-scoped)
- Add listings with a live camera photo, price per kg, quantity, and location
- Get orders, negotiate counter-offers, and mark completed
- View per-listing analytics (views, orders, conversion, best day of week)
- Accept contract-farming proposals from buyers
- Public profile at `/farmer/[phone]` — buyers see reviews, trust badges, and full stock

### Buyer

- Browse the marketplace, filter by location, search, or scroll
- Save favorite listings, place orders, and negotiate on price
- View order history with a one-tap **Reorder**
- Post contract-farming proposals to any farmer
- (Optional) sign in for auto-filled forms and personal My Orders tab

---

## 🔁 Core flows

### 1) Spot-market order flow

```
Farmer creates listing  ─▶  Buyer opens marketplace
                                       │
                                       ▼
                            (Optional) propose a price
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
Order = 'pending'                                          Order = 'negotiating'
        │                                                             │
        │                                        Farmer taps ─────────┤
        │                                        Accept / Counter / Reject
        │                                                             │
        │                                            Counter → 'counter_offered'
        │                                                             │
        │                                       Buyer Accepts → 'pending'
        │                                                             │
        └────────────────────────────────┬────────────────────────────┘
                                         ▼
                     Farmer marks completed → Order = 'completed'
                                         ▼
                     Buyer can now leave a rating + review
```

**Statuses**: `pending | completed | cancelled | negotiating | counter_offered`

### 2) Contract-farming flow

```
Buyer posts contract  ─▶  status = 'open'
       (business name, produce, quantity kg,
        price/kg, funding, deadline, location)
                │
                ▼
Any farmer accepts  ─▶  status = 'accepted'
                                       │
                                       ▼
              Farmer marks harvested  ─▶  status = 'harvested'
                                       │
                                       ▼
              Buyer marks completed   ─▶  status = 'completed'
```

### 3) Knowledge Network — AI + Human (prototype)

The core idea: **AI and human experts working together, not AI replacing humans.**

- Buyer or farmer opens the Knowledge tab
- **AI layer** — 5 free questions per day (localStorage quota) for quick FAQs. Sample chips for common asks (pest control, water schedules, storage).
- **Human layer** — directory of **expert farmers** and **agri-engineers** with one-tap-to-call for complex, local, judgement-heavy problems that a language model shouldn't answer alone
- **Why the cap?** AI usage is deliberately limited so (a) the app stays affordable for small farmers and (b) human experts stay employed where their local knowledge is irreplaceable
- ₹299/month premium waitlist for unlimited AI + priority expert callback

---

## 🎬 Scenarios

**"I grew 200 kg of tomatoes and want to sell without a broker."**
Farmer signs in → adds a listing with a rear-camera photo → sets price → listing appears in the marketplace. Buyers can browse, favorite, negotiate, or buy outright.

**"I run a small restaurant and want steady weekly supply."**
Buyer posts a contract for 50 kg of okra every Friday, funding upfront. Any interested farmer accepts. Farmer marks harvested each week; buyer marks completed on delivery.

**"I want to compare prices before ordering."**
Buyer filters by location, opens Buyer Insights → sees trusted farmers, price ranges, fast-selling produce by area, and fresh arrivals.

**"I want to know why my brinjal listing isn't selling."**
Farmer opens the listing's analytics modal → sees it has 40 views but 0 orders → drops the price → conversion picks up.

**"I'm a farmer with a pest problem on my chilli crop."**
Farmer opens Knowledge → asks the AI for the generic first pass → for the local, judgement-heavy call (which pesticide, what dose, this week's weather) taps an expert farmer or agri-engineer to call. AI handles the FAQ; a human handles the nuance.

**"I don't like the buyer's offered price."**
Farmer opens the order → taps **Counter** → sets a new price → buyer either accepts or rejects. Once accepted, the order becomes a normal pending order at the agreed price.

---

## 🧱 Tech stack

| Layer     | Choice                                                                   |
| --------- | ------------------------------------------------------------------------ |
| Framework | **Next.js 16** (App Router, Turbopack, React 19)                         |
| Language  | **TypeScript**                                                           |
| Styling   | **Tailwind CSS v4** (no CSS-in-JS, no component library)                 |
| Backend   | **Supabase** (Postgres + Storage + REST) — RLS off for hackathon speed   |
| Charts    | **Recharts** (v3) — market insights, per-listing analytics               |
| Icons     | **lucide-react** — no emojis; every UI icon is a Lucide SVG              |
| Hosting   | **Vercel** — auto-deploys on push to `main`                              |
| Fonts     | `next/font` with Geist                                                   |
| State     | React hooks + a small in-memory `prefetch` cache (`src/lib/prefetch.ts`) |
| Identity  | localStorage-scoped `name + phone` (no auth server)                      |
| i18n      | Custom `LanguageContext` + `src/lib/i18n.ts` (en/hi/te/ta)               |

**No mocking libraries, no auth provider, no state management library** — kept intentionally lean.

---

## 🗺️ Project structure

```
src/
├── app/
│   ├── page.tsx                     Landing page (hero, story, insights, CTAs)
│   ├── layout.tsx                   Root layout + LanguageProvider + ToastProvider
│   ├── error.tsx                    Route-level error boundary
│   ├── icon.svg                     Sprout favicon
│   ├── globals.css                  Tailwind + custom animations
│   ├── buyer/page.tsx               Buyer app (marketplace, orders, favorites, contracts)
│   └── farmer/
│       ├── page.tsx                 Farmer app (listings, orders, insights, contracts, KN)
│       └── [phone]/page.tsx         Public farmer profile
├── components/
│   ├── Sidebar.tsx                  Shared FarmEasy-OS sidebar (both roles)
│   ├── HeroIllustration.tsx         Custom hero SVG on landing
│   ├── FarmToMarketStory.tsx        Animated field→market SVG (cow, pond, windmill)
│   ├── OrderForm.tsx                Buyer order modal with "propose your price"
│   ├── BuyerOrders.tsx              Buyer's My Orders + counter-offer accept/reject
│   ├── Contracts.tsx                BuyerContracts + FarmerContracts
│   ├── KnowledgeNetwork.tsx         AI Q&A prototype + expert directory
│   ├── MarketInsights.tsx           Farmer KPIs, top-selling, sales by location
│   ├── BuyerInsights.tsx            Trusted farmers, price ranges, fresh arrivals
│   ├── ListingAnalytics.tsx         Per-listing analytics modal (views vs orders)
│   ├── FavoriteHeart.tsx            Heart button (localStorage-backed)
│   ├── StatusPill.tsx / StarRating.tsx / CustomSelect.tsx …
│   ├── shared/SignInForm.tsx        Shared name+phone form
│   └── ui/                          Skeleton, Toast, Field, TabButton primitives
├── lib/
│   ├── supabase.ts                  Supabase client + type definitions
│   ├── LanguageContext.tsx          Language provider + LanguageSelector
│   ├── i18n.ts                      en/hi/te/ta translation dictionary
│   ├── produceImage.ts              Openverse fallback for missing photos
│   ├── produceCategory.ts           Category badges
│   ├── badges.ts                    Trust-badge computation
│   ├── favorites.ts                 localStorage helpers
│   ├── prefetch.ts                  Module-level cache + hover-prefetch API
│   ├── domain/                      orderStatus.ts, contractStatus.ts
│   └── hooks/                       useListings, useOrders, useContracts, useDebounced, useUrlTab
└── sql/                             Idempotent SQL migrations (see below)
```

---

## 🗄️ Database schema (Supabase)

RLS is **disabled** for hackathon simplicity — identity is localStorage-scoped on the client.

### `listings`

```
id, created_at, farmer_name, farmer_phone,
produce_name, quantity_kg, price_per_kg,
location, image_url
```

### `orders`

```
id, created_at, farmer_phone, buyer_name, buyer_phone,
listing_id, produce_name, quantity_kg, price_per_kg,
status, note,
offered_price, counter_price
```

`status` is CHECK-constrained to: `pending | completed | cancelled | negotiating | counter_offered`

### `reviews`

```
id, created_at, farmer_phone, rating (1–5), comment, buyer_name
```

Reviews are gated: a matching **completed** order must exist between (farmer_phone, buyer_phone).

### `listing_views`

```
id, created_at, listing_id (FK → listings, ON DELETE CASCADE), viewer_phone (nullable)
```

Logged from buyer marketplace via `IntersectionObserver` (threshold 0.5, deduped per card).

### `contracts`

```
id, created_at,
buyer_name, buyer_phone, buyer_business,
produce_name, quantity_kg, price_per_kg, funding_amount,
deadline, location, notes,
farmer_name, farmer_phone, accepted_at,
status
```

`status`: `open | accepted | harvested | completed | cancelled`

### Storage bucket: `produce-images`

Public read, anon insert policy, 10 MB per file. Farmer camera uploads land here.

### SQL migrations (`/sql/`)

Idempotent, safe to re-run:

- `2026-07-18-negotiation-and-views.sql` — adds `offered_price`, `counter_price`, extends status check, creates `listing_views`
- `2026-07-18-seed-views-and-negotiations.sql` — demo seed data
- `2026-07-19-contracts.sql` — creates `contracts` table + indexes

Run them in **Supabase → SQL Editor** in order.

---

## 🚀 Getting started

### 1. Clone and install

```bash
git clone https://github.com/MDevivaraprasad-Dvp/harvest-hub.git
cd harvest-hub
npm install
```

### 2. Set up Supabase

- Create a project at [supabase.com](https://supabase.com)
- In **SQL Editor**, run every file in `/sql/` (in date order)
- Create a public storage bucket named `produce-images` (10 MB limit, anon insert)
- Copy the project URL and `anon` key

### 3. Environment variables

Create `.env.local` (gitignored):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy

Push to `main` — Vercel auto-deploys. Set the two env vars in Vercel's project settings.

---

## 🎨 Design & UX conventions

- **No emojis** — every icon is a Lucide SVG (`<Sprout />`, `<Handshake />`, …)
- **No native `<select>`** — use `CustomSelect` or `LanguageSelector`
- **All strings translated** — every new UI string ships in en/hi/te/ta (`src/lib/i18n.ts`)
- **Skeletons over spinners** — `SkeletonGrid`/`SkeletonRow` for loading states
- **Toasts over `alert()`** — `useToast().push(...)` in the buyer flow (farmer alerts pending migration)
- **Camera-only capture** — `<input type="file" accept="image/*" capture="environment">` opens the rear camera on mobile
- **Prefetch on hover** — sidebar and hero CTAs prime the cache before the click lands
- **StatusPill / NewPill** — reusable pills for statuses and "NEW" tags
- **Trust badges** — computed client-side from listings + reviews, no DB column

---

## 🛣️ Roadmap

Things that are shipped as prototypes today and up for full implementation:

- **AI Knowledge Network** — swap the mocked responses for a real LLM, preserve the 5-question quota (keeps costs down + keeps human experts in the loop) and premium waitlist
- **SMS/WhatsApp notifications** for order state changes (negotiating → accepted, harvested, completed)
- **Payments** — integrate UPI/Razorpay so contract funding + spot orders can be paid inside the app
- **Real auth** — replace localStorage identity with Supabase Auth (phone OTP), turn RLS back on
- **Logistics** — pluggable delivery partners; farmer picks a courier at listing time
- **Weather + crop advisory** on the farmer dashboard (IMD + soil data)
- **Multi-photo listings** — carousel of 3–5 photos per listing
- **Buyer subscription plans** — monthly veggie/fruit boxes from favorite farmers
- **Ratings for buyers** too (currently only farmers are rated)
- **Offline-first PWA** for patchy rural connectivity
- **Regional produce trends** — an analytics view for MSP/procurement officers

---

## 🧪 Development notes

- **Next.js 16** — this repo uses Next.js 16 (App Router, Turbopack). Some conventions differ from older Next.js — check `node_modules/next/dist/docs/` before writing new API/route code.
- **Prefetch cache** — 60s TTL, in-flight promise dedup. Use `prefetchListings`, `prefetchOrders`, `prefetchContracts` on hover; hooks read cache-first.
- **Sidebar `isNew` flag** — set on new features so they get the NEW pill.
- **i18n workflow** — add a key to all four language dictionaries at once; no fallback to English is done silently in components.

---

## 📄 License

Personal / hackathon project. If you want to use it commercially, open an issue.

---

**Built for a hackathon. Ideas, PRs, and issue reports are welcome.**
