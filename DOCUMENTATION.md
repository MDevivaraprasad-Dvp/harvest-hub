# FarmEasy — Full Documentation

This document walks through how FarmEasy works end-to-end: setting it up, using it as a farmer or buyer, and understanding the code behind each flow. For a quick overview, see [README.md](./README.md).

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Setup & first run](#2-setup--first-run)
3. [Architecture at a glance](#3-architecture-at-a-glance)
4. [Data model](#4-data-model)
5. [User flows](#5-user-flows)
   - 5.1 [Farmer flow](#51-farmer-flow)
   - 5.2 [Buyer flow](#52-buyer-flow)
   - 5.3 [Negotiation flow](#53-negotiation-flow)
   - 5.4 [Contract farming flow](#54-contract-farming-flow)
   - 5.5 [Knowledge Network flow](#55-knowledge-network-flow)
6. [How to use — step-by-step](#6-how-to-use--step-by-step)
7. [Under the hood](#7-under-the-hood)
8. [Development guide](#8-development-guide)
9. [Deployment](#9-deployment)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Project overview

**FarmEasy** is a direct-to-buyer produce marketplace built for Indian farmers. It removes middlemen from the crop-to-cart chain and adds three modern layers on top:

| Layer | What it does |
|---|---|
| **Spot marketplace** | Farmers list fresh produce with camera photos; buyers browse, favourite, negotiate, and order |
| **Contract farming** | Buyers commit to future harvests with a deadline, quantity, and funding; farmers accept and fulfill |
| **Knowledge Network** | AI-assisted farming Q&A (prototype) + directory of expert farmers and agri-engineers |

Everything is multilingual (English, Hindi, Telugu, Tamil) and works on mobile as a lightweight web app — no install, no auth server.

---

## 2. Setup & first run

### Prerequisites

- Node.js ≥ 20
- A free [Supabase](https://supabase.com) project
- Git

### 1) Clone

```bash
git clone https://github.com/MDevivaraprasad-Dvp/harvest-hub.git
cd harvest-hub
npm install
```

### 2) Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and paste + run each file in `/sql/`, in date order:
   - `2026-07-18-negotiation-and-views.sql`
   - `2026-07-18-seed-views-and-negotiations.sql` (optional demo seed)
   - `2026-07-19-contracts.sql`
3. Go to **Storage** → create a public bucket named **`produce-images`** with a 10 MB per-file limit and an anon-insert policy.
4. Copy your project URL and `anon` key from **Settings → API**.

### 3) Environment

Create `.env.local` in the repo root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 4) Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page should load with the animated farm-to-market SVG.

---

## 3. Architecture at a glance

```
┌───────────────────────── Browser (React 19) ─────────────────────────┐
│                                                                       │
│   Landing (/)          Farmer (/farmer)        Buyer (/buyer)         │
│      │                     │                       │                   │
│      ▼                     ▼                       ▼                   │
│   Hero + Story        Sidebar shell           Sidebar shell            │
│   FarmToMarket SVG    Listings | Orders       Marketplace | Orders    │
│   Live stats          Insights | Contracts    Saved | Contracts       │
│                       Knowledge Network       Insights                 │
│                                                                       │
│              localStorage identity (name + phone)                     │
│                            │                                          │
│              module-level prefetch cache (60s TTL)                    │
│                            │                                          │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │  Supabase (REST)   │
                    │  Postgres + Auth   │
                    │  Storage bucket    │
                    └────────────────────┘
```

- **App Router (Next.js 16, Turbopack).** All page components are client components.
- **No auth server.** Identity is stored in localStorage as `{ name, phone }`. RLS is off for hackathon simplicity.
- **In-memory prefetch cache** (`src/lib/prefetch.ts`) with 60s TTL. Sidebar hover / hero-CTA hover primes the cache so target pages mount with `loading = false`.
- **Images** live in Supabase Storage bucket `produce-images`. Farmers upload via `<input type="file" capture="environment">` — mobile opens the rear camera directly.

---

## 4. Data model

RLS is **off**. Every query happens under the anon key. Identity checks are done in code (e.g. "does buyer_phone match a completed order?" gates reviews).

```
listings ─┬──< orders            (orders.listing_id → listings.id)
          └──< listing_views     (listing_views.listing_id → listings.id, cascade)

reviews   (matched by farmer_phone + buyer_phone against a completed order)

contracts (independent; buyer posts, farmer accepts)
```

See [README §Database schema](./README.md#-database-schema-supabase) for column-level detail.

---

## 5. User flows

### 5.1 Farmer flow

```
Sign in (name + phone)  →  Sidebar
                              ├── Listings — add / edit / delete
                              │      └── each listing has an "Analytics" modal
                              ├── Orders — see incoming, act on offers
                              ├── Contracts — buyer proposals waiting for a farmer
                              ├── Insights — public + signed-in analytics
                              └── Knowledge — AI Q&A + expert directory
```

Sign-in is stored in `farmeasy_farmer` (localStorage). The value `{ name, phone }` scopes every read/write to that farmer.

### 5.2 Buyer flow

```
Land on /buyer (optionally sign in)  →  Sidebar
                                            ├── Marketplace — browse, filter, search, order
                                            ├── Saved — hearted listings (localStorage)
                                            ├── My Orders — active + history + negotiations
                                            ├── Contracts — post + view your proposals
                                            └── Insights — trusted farmers, price ranges
```

Sign-in for buyers is **optional**. Browsing works without it, but signing in auto-fills the order form and unlocks the My Orders tab. Buyer identity lives in `farmeasy_buyer` (localStorage).

### 5.3 Negotiation flow

```
Buyer opens a listing → OrderForm
    ├── (Default) confirm and submit         →  order.status = 'pending'
    └── Expand "Propose your price" + submit →  order.status = 'negotiating'
                                                order.offered_price = <buyer's price>

Farmer opens the negotiating order:
    ├── Accept  →  price_per_kg = offered_price,  status = 'pending'
    ├── Counter →  set counter_price,             status = 'counter_offered'
    └── Reject  →  status = 'cancelled'

Buyer opens the counter-offered order:
    ├── Accept  →  price_per_kg = counter_price,  status = 'pending'
    └── Reject  →  status = 'cancelled'

Farmer marks the pending order as delivered  →  status = 'completed'

Buyer can now leave a rating + review (only completed orders unlock reviews).
```

### 5.4 Contract farming flow

```
Buyer posts contract (from /buyer → Contracts tab)
    business_name, produce_name, quantity_kg, price_per_kg,
    funding_amount, deadline, location, notes
                        │
                        ▼
              status = 'open'

Any farmer accepts (from /farmer → Contracts tab)
    farmer_name, farmer_phone, accepted_at recorded
                        │
                        ▼
              status = 'accepted'

Farmer marks harvested  →  status = 'harvested'
Buyer marks completed   →  status = 'completed'

(Either side can cancel  →  status = 'cancelled')
```

### 5.5 Knowledge Network flow

```
Open Knowledge tab (farmer or buyer)
    │
    ├── Ask a question in the chat  (5 free per day, quota in localStorage)
    │        └── Prototype AI reply (mocked; ready to swap with real LLM)
    │
    ├── Tap a sample chip           (pest control / water schedule / storage / …)
    │
    ├── Browse expert farmers       → one-tap-to-call
    ├── Browse agri-engineers       → one-tap-to-call
    │
    └── Join premium waitlist ₹299/mo — unlimited questions + priority experts
```

---

## 6. How to use — step-by-step

### As a **farmer**

1. Open the site → tap **"I'm a farmer"** on the landing hero (or go to `/farmer`).
2. Enter **name + phone** in the sign-in card. This is what buyers will see. No password.
3. In the sidebar, tap **Listings → Add listing**:
   - Produce name (e.g. "Tomato")
   - Quantity (kg)
   - Price per kg
   - Location
   - Tap the camera icon and take a photo — this uploads directly to Supabase Storage
4. Save. Your listing is now live on the buyer marketplace.
5. Tap **Orders** in the sidebar to see incoming orders. For each:
   - `pending` → tap **Mark completed** when you've delivered
   - `negotiating` → tap **Accept**, **Counter**, or **Reject**
6. Tap **Insights** for market-wide trends. Tap **View analytics** on any listing for its own KPIs.
7. Tap **Contracts** to see buyer contract proposals and accept the ones you can fulfill.

### As a **buyer**

1. Open the site → tap **"I'm a buyer"** on the landing hero (or go to `/buyer`).
2. Optional: sign in (top-right welcome banner). Not required to browse.
3. In the marketplace grid:
   - Search by produce name
   - Filter by location
   - Tap the **♡** to save a listing (Saved tab)
   - Tap a card → **Order** → set quantity → optionally tap **Propose your price** → confirm
4. Tap **My Orders** to see order status. If a farmer counter-offered, you'll see accept / reject buttons.
5. Tap **Contracts → Post contract** to propose a bulk future harvest (great for restaurants and shops).
6. Once an order is **completed**, a review form appears in **My Orders** for that farmer.

---

## 7. Under the hood

### 7.1 Routing (App Router)

```
src/app/
├── layout.tsx                   Root — global metadata, fonts, LanguageProvider, ToastProvider
├── page.tsx                     Landing
├── error.tsx                    Route-level error boundary (Retry + Home)
├── icon.svg                     Favicon (hand-cradling-sprout)
├── farmer/
│   ├── layout.tsx               Farmer route metadata
│   ├── page.tsx                 Farmer app
│   └── [phone]/
│       ├── layout.tsx           Dynamic generateMetadata (masked phone)
│       └── page.tsx             Public farmer profile
└── buyer/
    ├── layout.tsx               Buyer route metadata
    └── page.tsx                 Buyer app
```

Each route has its own metadata via `layout.tsx` — this works because `page.tsx` files are marked `"use client"` and can't export metadata directly.

### 7.2 Data hooks and prefetch

- `src/lib/hooks/useListings.ts`, `useOrders.ts`, `useContracts.ts` — thin wrappers around Supabase queries. **Cache-first**: they read `getCached*()` from `src/lib/prefetch.ts` before hitting the network.
- `src/lib/prefetch.ts` exposes `prefetchListings`, `prefetchOrders`, `prefetchContracts`, `invalidate*`. 60-second TTL, in-flight promise dedup.
- The `Sidebar` component takes an `onPrefetch?: () => void` per item and fires it on `mouseenter` + `focus`. By the time the click lands, the target tab's data is usually already in cache.

### 7.3 State

- **UI state:** local `useState` in each page. No Redux, no Zustand.
- **Identity:** `farmeasy_farmer` / `farmeasy_buyer` in localStorage.
- **Favourites:** `farmeasy_favorites` in localStorage. `FavoriteHeart` broadcasts a `farmeasy:favorites-changed` custom event so every heart re-renders on change.
- **AI quota:** `farmeasy_ai_quota` (5 questions/day) and `farmeasy_premium_waitlist` in localStorage.
- **Tab persistence:** `useUrlTab<T>()` stores the current tab in `?tab=` via `history.replaceState()` — no dynamic route needed.

### 7.4 Design system

- **Icons:** Lucide only. No emojis in the app UI.
- **Selects:** `CustomSelect` and `LanguageSelector`. Never native `<select>`.
- **Loading:** `Skeleton`, `SkeletonGrid`, `SkeletonRow` from `src/components/ui/`. Not spinners.
- **Toasts:** `useToast().push()` for success/error. Only remaining `alert()` calls are on the farmer side (documented tech debt).
- **Pills:** `StatusPill` + `NewPill` for consistent statuses and "NEW" badges.
- **Metadata:** Root layout defines a title template (`%s · FarmEasy`), and each route layout adds its own segment.

### 7.5 Animation

The `FarmToMarketStory` component on the landing page is a hand-written SVG scene with 20+ animated elements: rotating sun rays and windmill blades, drifting clouds and birds, growing plants, a walking farmer, a chicken, a produce basket that moves along a `<animateMotion>` path to a bouncing delivery truck, a rainbow between the barn and the market, a rooster on the barn roof, a butterfly, two bees, and a pond with a floating duck.

Everything is pure inline SVG + `<animate>` / `<animateTransform>` — no external animation library.

---

## 8. Development guide

### Running

```bash
npm run dev       # Turbopack dev server on :3000
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # ESLint
```

### Adding a new page

1. Create `src/app/<route>/page.tsx` (client component is fine).
2. Add `src/app/<route>/layout.tsx` with a `metadata` export.
3. If the route needs data on mount, add the tab to `Sidebar.tsx` with an `onPrefetch` prop pointing to the relevant `prefetch*` function.

### Adding a new translation string

1. Add the key to **all four** language dictionaries in `src/lib/i18n.ts` (en, hi, te, ta). No silent English fallback.
2. Use `const { t } = useLanguage();` and `t('yourKey')` in components.
3. Placeholders use `{n}`-style tokens, replaced with `t('key', { n: 3 })`.

### Adding a new sidebar section

1. Add an entry to the items array in `Sidebar.tsx` with `icon`, `label`, `isNew?`, and `onPrefetch?`.
2. Wire the section in the parent page's tab switch.
3. If it's a new-feature launch, set `isNew: true` to get the amber NEW pill.

### Adding a new Supabase table

1. Write an **idempotent** `sql/YYYY-MM-DD-<slug>.sql`. Every `CREATE TABLE` should use `IF NOT EXISTS`. Every seed should be `ON CONFLICT DO NOTHING`.
2. Update `src/lib/supabase.ts` with the new TypeScript type.
3. If it needs prefetching, add a `prefetch<Thing>` and `invalidate<Thing>` in `src/lib/prefetch.ts`, plus a `use<Thing>` hook in `src/lib/hooks/`.

### File-size heuristic

If `farmer/page.tsx` or `buyer/page.tsx` grows past ~500 lines, extract sub-components into `src/components/`. `BuyerOrders`, `OrderForm`, `FavoriteHeart`, `ListingAnalytics`, `Contracts`, and `KnowledgeNetwork` were all extracted this way.

### Conventions that matter

- Camera capture: `<input type="file" accept="image/*" capture="environment">`. Never use plain file pickers.
- No native `<select>` — use `CustomSelect`.
- No emojis in UI — use Lucide icons.
- Every UI string in all four languages.
- Reviews are gated in code: a matching **completed** order between the farmer's and buyer's phone must exist.
- Status maps live in `src/lib/domain/` (`orderStatus.ts`, `contractStatus.ts`), not inline in components.

---

## 9. Deployment

Push to `main`. Vercel auto-deploys. Set the two env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in **Vercel → Project → Settings → Environment Variables**.

If images don't load in production, check `next.config.ts` — Supabase Storage and Openverse (for fallback thumbnails) are configured as remote image patterns.

---

## 10. Troubleshooting

**"Failed to fetch" when accepting a counter-offer.**
Usually a browser-level block on the Supabase REST preflight. Try:
1. Disabling ad-blockers / privacy extensions on the FarmEasy origin.
2. Opening the site in an incognito window.
3. Checking the browser console — the accept handlers already log the error.

**Camera doesn't open on mobile.**
The `<input>` uses `capture="environment"`. Make sure you granted camera permission to the browser. iOS Safari sometimes needs a full page reload after granting the permission.

**Listings appear empty even after adding one.**
Check that your Supabase `anon` key has insert permission on `listings` and the `produce-images` bucket. RLS is off, but bucket policies still apply.

**"Knowledge tab shows 0 questions remaining."**
The quota is stored in `farmeasy_ai_quota` in localStorage. Clear it in DevTools → Application → Local Storage to reset, or wait until midnight. The 5-per-day limit is intentional (prototype).

**Prefetch cache is stale after a mutation.**
Every write helper calls the matching `invalidate*` in `src/lib/prefetch.ts`. If you add a new mutation, remember to invalidate the corresponding cache key.

**Sidebar drawer doesn't close on mobile after navigation.**
The sidebar listens for route changes. If a click doesn't trigger navigation (e.g. same-tab click), close it manually — this is a known minor quirk.

---

## Contributing

This is a solo hackathon project — but PRs, ideas, and issue reports are welcome. When contributing:

- Keep the localStorage-identity + RLS-off pattern unless you're explicitly overhauling auth.
- Every user-facing string ships in en/hi/te/ta.
- Use Lucide icons, `CustomSelect`, `Skeleton*`, and `StatusPill`.
- Follow the file layout conventions above.

---

**Last updated:** 2026-07-19
