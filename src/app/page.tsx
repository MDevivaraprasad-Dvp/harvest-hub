"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Tractor,
  ShoppingCart,
  IndianRupee,
  Leaf,
  Handshake,
  Sprout,
  Camera,
  Eye,
  MessageCircle,
  Truck,
  Users,
  Package,
  MapPin,
  X,
  Check,
  ArrowRight,
  ArrowDown,
  Sparkles,
  Brain,
  Building2,
  Activity,
  TrendingUp,
  HeartHandshake,
  Store,
  BarChart3,
  Globe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage, LanguageSelector } from "@/lib/LanguageContext";
import { HeroIllustration } from "@/components/HeroIllustration";
import { FarmToMarketStory } from "@/components/FarmToMarketStory";
import { StatusPill } from "@/components/StatusPill";
import { supabase, type Listing } from "@/lib/supabase";
import { useProduceImage } from "@/lib/produceImage";
import { prefetchListings, prefetchContracts } from "@/lib/prefetch";
import { backfillListingImages } from "@/lib/backfillImages";

type Stats = { farmers: number; kg: number; locations: number };
type LiveStats = {
  health: number;
  activeFarmers: number;
  ordersToday: number;
  topCrop: string | null;
  avgPrice: number | null;
};

export default function Home() {
  const { t } = useLanguage();
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [stats, setStats] = useState<Stats>({
    farmers: 0,
    kg: 0,
    locations: 0,
  });
  const [live, setLive] = useState<LiveStats>({
    health: 0,
    activeFarmers: 0,
    ordersToday: 0,
    topCrop: null,
    avgPrice: null,
  });

  useEffect(() => {
    const load = async () => {
      const todayIso = new Date().toISOString().slice(0, 10);
      const [listingsRes, ordersRes, todayOrdersRes] = await Promise.all([
        supabase
          .from("listings")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("quantity_kg, produce_name, status")
          .neq("status", "cancelled"),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .gte("created_at", todayIso),
      ]);
      const allListings = listingsRes.data ?? [];
      const orders = ordersRes.data ?? [];
      // Show the 6 newest listings on the landing.
      setFeatured(allListings.slice(0, 6));

      // Fire-and-forget: for any listing without an image, resolve one via
      // Wikipedia and write the URL back to Supabase. Runs at most once per
      // session (see backfillListingImages). Future page loads read image_url
      // straight from the DB — no more per-load Openverse fetches.
      backfillListingImages(allListings).then((n) => {
        if (n > 0) console.info(`[FarmEasy] Backfilled ${n} listing image_url values`);
      });
      setStats({
        farmers: new Set(allListings.map((l) => l.farmer_phone)).size,
        kg: Math.round(orders.reduce((s, o) => s + Number(o.quantity_kg), 0)),
        locations: new Set(allListings.map((l) => l.location)).size,
      });

      // Live stats
      const activeFarmers = new Set(allListings.map((l) => l.farmer_phone))
        .size;
      const ordersToday = todayOrdersRes.count ?? 0;
      const cropCounts = new Map<string, number>();
      for (const o of orders)
        cropCounts.set(
          o.produce_name,
          (cropCounts.get(o.produce_name) ?? 0) + 1,
        );
      const topCrop =
        [...cropCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      const avgPrice =
        allListings.length > 0
          ? allListings.reduce((s, l) => s + Number(l.price_per_kg), 0) /
            allListings.length
          : null;
      const health = Math.min(
        100,
        activeFarmers * 5 + orders.length * 2 + ordersToday * 3,
      );
      setLive({ health, activeFarmers, ordersToday, topCrop, avgPrice });
    };
    load();
  }, []);

  return (
    <div className="h-dvh bg-linear-to-b from-green-50 to-emerald-100 py-2 sm:py-3 flex flex-col overflow-hidden">
      <div className="w-full flex-1 flex flex-col min-h-0">
        {/* Roof / Awning */}
        <header className="relative bg-green-600 rounded-t-[80px] sm:rounded-t-[120px] lg:rounded-t-[160px] px-6 sm:px-10 lg:px-14 pt-6 sm:pt-8 pb-4 shadow-lg shrink-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shadow-sm">
                <Sprout className="w-6 h-6 text-green-700" strokeWidth={2.25} />
              </div>
              <span className="font-display text-3xl font-black text-white tracking-tight">
                {t("appName")}
              </span>
            </div>
            <SubNav />
            <div className="[&_button]:!bg-white/15 [&_button]:!border-white/20 [&_button]:!text-white [&_svg]:!text-white">
              <LanguageSelector />
            </div>
          </div>
        </header>

        {/* Scalloped awning fringe */}
        <svg
          viewBox="0 0 120 8"
          preserveAspectRatio="none"
          className="block w-full h-6 sm:h-7 lg:h-9 -mt-px drop-shadow-md relative z-10 shrink-0"
          aria-hidden="true"
        >
          <path
            d="M0 0 L120 0 L120 1 Q 112.5 10 105 1 Q 97.5 10 90 1 Q 82.5 10 75 1 Q 67.5 10 60 1 Q 52.5 10 45 1 Q 37.5 10 30 1 Q 22.5 10 15 1 Q 7.5 10 0 1 Z"
            fill="#16a34a"
          />
        </svg>

        {/* Hut body — scrollable */}
        <main className="flex-1 bg-white border-x-4 sm:border-x-6 lg:border-x-8 border-b-4 sm:border-b-6 lg:border-b-8 border-green-600 rounded-b-[36px] sm:rounded-b-[44px] shadow-2xl -mt-4 sm:-mt-5 lg:-mt-6 mx-3 sm:mx-6 lg:mx-10 relative z-0 overflow-y-auto overflow-x-hidden min-h-0">
          <div className="px-6 sm:px-10 lg:px-14 py-10 lg:py-14 space-y-20 lg:space-y-28">
            <section id="hero">
              <HeroSection />
            </section>
            <FarmToMarketStory />
            <section id="solutions">
              <SolutionsGridSection />
            </section>
            <ProblemSolutionSection />
            <HowItWorksSection />
            <section id="serve">
              <WhoWeServeSection />
            </section>
            <NewFeaturesSection />
            <section id="live">
              <LiveDataSection live={live} />
            </section>
            <section id="farms">
              <FarmNodesSection listings={featured} />
            </section>
            <WhyFarmEasySection />
            <ImpactSection stats={stats} />
            <CtaSection />
            <FooterSection />
          </div>
        </main>
      </div>
    </div>
  );
}

function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div>
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t("heroTagline")}</span>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-green-900 leading-[1.02] mb-6">
          {t("heroLine1")}
          <br />
          <span className="bg-linear-to-r from-green-500 to-lime-400 bg-clip-text text-transparent">
            {t("heroLine2")}
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 mb-6 max-w-xl leading-relaxed font-medium">
          {t("heroSubtitle")}
        </p>

        <div className="flex flex-wrap gap-2 mb-7">
          <StatusPill label={t("trustDirectFromFarm")} variant="green" pulse />
          <StatusPill label={t("trustLivePhotos")} variant="emerald" />
          <StatusPill label={t("trustFourLanguages")} variant="blue" />
          <StatusPill label={t("trustNoMiddleman")} variant="amber" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md">
          <Link
            href="/farmer"
            onMouseEnter={() => prefetchListings()}
            onFocus={() => prefetchListings()}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-extrabold text-base sm:text-lg tracking-tight py-4 px-6 rounded-xl shadow-lg transition-colors"
          >
            <Tractor className="w-5 h-5" />
            <span>{t("imFarmer")}</span>
          </Link>
          <Link
            href="/buyer"
            onMouseEnter={() => { prefetchListings(); prefetchContracts() }}
            onFocus={() => { prefetchListings(); prefetchContracts() }}
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-green-700 font-extrabold text-base sm:text-lg tracking-tight py-4 px-6 rounded-xl shadow-lg border-2 border-green-600 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{t("imBuyer")}</span>
          </Link>
        </div>
      </div>

      <div className="lg:pl-8 relative">
        {/* Animated sun */}
        <div className="absolute top-4 right-6 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none animate-spin-slow z-0">
          <div className="absolute inset-2 rounded-full bg-yellow-300 shadow-[0_0_40px_rgba(253,224,71,0.7)]" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <div
              key={deg}
              className="absolute top-1/2 left-1/2 w-1 h-3 bg-yellow-400 rounded-full origin-bottom"
              style={{
                transform: `translate(-50%, -100%) rotate(${deg}deg) translateY(-4px)`,
              }}
            />
          ))}
        </div>
        <div className="animate-float-y relative z-10">
          <HeroIllustration className="w-full h-auto drop-shadow-xl" />
        </div>
      </div>
    </section>
  );
}

function ProblemSolutionSection() {
  const { t } = useLanguage();
  const old = [t("oldWayItem1"), t("oldWayItem2"), t("oldWayItem3")];
  const nu = [t("newWayItem1"), t("newWayItem2"), t("newWayItem3")];
  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="font-display text-4xl sm:text-5xl font-black text-green-900 leading-tight">
          {t("problemSolutionTitle")}
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-black text-red-700 tracking-tight">
              {t("oldWayLabel")}
            </span>
          </div>
          <ul className="space-y-3">
            {old.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <X
                  className="w-4 h-4 text-red-500 mt-1 shrink-0"
                  strokeWidth={2.5}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-green-100 opacity-50" />
          <div className="flex items-center gap-2 mb-5 relative">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
              <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-black text-green-800 tracking-tight">
              {t("newWayLabel")}
            </span>
          </div>
          <ul className="space-y-3 relative">
            {nu.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <Check
                  className="w-4 h-4 text-green-600 mt-1 shrink-0"
                  strokeWidth={2.5}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const HOW_STEPS: { Icon: LucideIcon; titleKey: string; bodyKey: string }[] = [
  { Icon: Camera, titleKey: "step1Title", bodyKey: "step1Body" },
  { Icon: Eye, titleKey: "step2Title", bodyKey: "step2Body" },
  { Icon: MessageCircle, titleKey: "step3Title", bodyKey: "step3Body" },
  { Icon: Truck, titleKey: "step4Title", bodyKey: "step4Body" },
];

function HowItWorksSection() {
  const { t } = useLanguage();
  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="font-display text-4xl sm:text-5xl font-black text-green-900 mb-2 leading-tight">
          {t("howItWorksTitle")}
        </h2>
        <p className="text-lg text-gray-600 font-medium">
          {t("howItWorksSubtitle")}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative">
        {HOW_STEPS.map(({ Icon, titleKey, bodyKey }, i) => (
          <div key={i} className="relative">
            <div className="bg-white border-2 border-green-100 rounded-2xl p-6 text-center hover:border-green-300 hover:shadow-md transition-all h-full">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-2xl bg-green-100 animate-grow-bob" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-green-700" strokeWidth={2} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shadow">
                  {i + 1}
                </div>
              </div>
              <h3 className="font-extrabold text-green-900 text-lg mb-2 tracking-tight">
                {t(titleKey as never)}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {t(bodyKey as never)}
              </p>
            </div>
            {i < HOW_STEPS.length - 1 && (
              <>
                <ArrowRight
                  className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 text-green-300 -translate-y-1/2 animate-drift-x z-10"
                  strokeWidth={2.5}
                />
                <ArrowDown
                  className="lg:hidden mx-auto my-2 w-5 h-5 text-green-300 animate-float-y"
                  strokeWidth={2.5}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SubNav() {
  const { t } = useLanguage();
  const [active, setActive] = useState("hero");

  const items: {
    id: string;
    label: string;
    Icon: LucideIcon;
    href?: string;
  }[] = [
    { id: "solutions", label: t("subnavSolutions"), Icon: Sparkles },
    { id: "serve", label: t("subnavServe"), Icon: Users },
    { id: "live", label: t("subnavLive"), Icon: Activity },
    { id: "farms", label: t("subnavFarms"), Icon: Sprout },
    {
      id: "contracts-out",
      label: t("subnavContracts"),
      Icon: Handshake,
      href: "/buyer",
    },
  ];

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  }, []);

  useEffect(() => {
    const scroller = document.querySelector(
      "main.overflow-y-auto",
    ) as HTMLElement | null;
    if (!scroller) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const id = e.target.getAttribute("id");
            if (id) setActive(id);
          }
        }
      },
      { root: scroller, rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    ["solutions", "serve", "live", "farms"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar order-3 lg:order-none w-full lg:w-auto -mx-2 lg:mx-0 px-2 lg:px-0 pl-0.5">
      {items.map(({ id, label, Icon, href }) => {
        const isActive = !href && id === active;
        const cls = `shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold tracking-tight transition-colors border ${
          isActive
            ? "bg-white text-green-800 border-white shadow-[0_2px_6px_-1px_rgba(0,0,0,0.12)]"
            : "bg-white/15 text-white border-white/10 hover:bg-white/25 backdrop-blur-sm"
        }`;
        return href ? (
          <Link key={label} href={href} className={cls}>
            <Icon className="w-4 h-4" strokeWidth={2.5} />
            <span>{label}</span>
          </Link>
        ) : (
          <button key={label} onClick={() => scrollTo(id)} className={cls}>
            <Icon className="w-4 h-4" strokeWidth={2.5} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

const SOLUTION_CARDS = [
  {
    Icon: Store,
    titleKey: "solMarketplace",
    b: ["solMarketplaceB1", "solMarketplaceB2", "solMarketplaceB3"],
    hue: "green" as const,
  },
  {
    Icon: Handshake,
    titleKey: "solContract",
    b: ["solContractB1", "solContractB2", "solContractB3"],
    hue: "amber" as const,
  },
  {
    Icon: Brain,
    titleKey: "solKnowledge",
    b: ["solKnowledgeB1", "solKnowledgeB2", "solKnowledgeB3"],
    hue: "emerald" as const,
  },
  {
    Icon: BarChart3,
    titleKey: "solInsights",
    b: ["solInsightsB1", "solInsightsB2", "solInsightsB3"],
    hue: "blue" as const,
  },
  {
    Icon: MessageCircle,
    titleKey: "solNegotiation",
    b: ["solNegotiationB1", "solNegotiationB2", "solNegotiationB3"],
    hue: "purple" as const,
  },
  {
    Icon: Globe,
    titleKey: "solLanguages",
    b: ["solLanguagesB1", "solLanguagesB2", "solLanguagesB3"],
    hue: "teal" as const,
  },
];

const HUE_MAP: Record<
  string,
  { bg: string; text: string; ring: string; dot: string }
> = {
  green: {
    bg: "bg-green-100",
    text: "text-green-700",
    ring: "hover:border-green-300",
    dot: "bg-green-500",
  },
  amber: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    ring: "hover:border-amber-300",
    dot: "bg-amber-500",
  },
  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    ring: "hover:border-emerald-300",
    dot: "bg-emerald-500",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    ring: "hover:border-blue-300",
    dot: "bg-blue-500",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    ring: "hover:border-purple-300",
    dot: "bg-purple-500",
  },
  teal: {
    bg: "bg-teal-100",
    text: "text-teal-700",
    ring: "hover:border-teal-300",
    dot: "bg-teal-500",
  },
};

function SolutionsGridSection() {
  const { t } = useLanguage();
  return (
    <section>
      <div className="text-center mb-10 lg:mb-12">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
          <Sparkles className="w-3 h-3" strokeWidth={2.5} />
          <span>Solutions</span>
        </div>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-green-900 mb-3 leading-[1.05]">
          {t("solutionsTitle")}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          {t("solutionsSubtitle")}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {SOLUTION_CARDS.map(({ Icon, titleKey, b, hue }) => {
          const h = HUE_MAP[hue];
          return (
            <div
              key={titleKey}
              className={`bg-white border-2 border-green-100 rounded-2xl p-5 lg:p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 ${h.ring}`}
            >
              <div
                className={`w-12 h-12 rounded-2xl ${h.bg} flex items-center justify-center mb-4`}
              >
                <Icon className={`w-6 h-6 ${h.text}`} strokeWidth={2.25} />
              </div>
              <h3 className="font-extrabold text-green-900 text-xl mb-3 tracking-tight">
                {t(titleKey as never)}
              </h3>
              <ul className="space-y-1.5">
                {b.map((k) => (
                  <li
                    key={k}
                    className="flex items-start gap-2 text-sm text-gray-600 font-medium"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${h.dot} mt-1.5 shrink-0`}
                    />
                    <span>{t(k as never)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FarmNodesSection({ listings }: { listings: Listing[] }) {
  const { t } = useLanguage();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const [now] = useState(() => Date.now());
  return (
    <section>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <StatusPill
              label={t("liveOnline")}
              variant="green"
              pulse
              size="sm"
            />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-green-900 leading-[1.05]">
            {t("farmNodesTitle")}
          </h2>
          <p className="text-gray-600 mt-2 text-lg">{t("farmNodesSubtitle")}</p>
        </div>
        <Link
          href="/buyer"
          className="text-green-700 font-bold text-sm inline-flex items-center gap-1 hover:underline"
        >
          <span>{t("browseAll")}</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-10 text-center">
          <Leaf className="w-12 h-12 text-green-300 mx-auto mb-3 animate-sway" />
          <p className="text-gray-600 text-sm font-medium">
            {t("farmNodesEmpty")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {listings.map((l) => {
            const isFresh = now - new Date(l.created_at).getTime() < SEVEN_DAYS;
            return <FarmNodeTile key={l.id} l={l} isFresh={isFresh} />;
          })}
        </div>
      )}
    </section>
  );
}

function FarmNodeTile({ l, isFresh }: { l: Listing; isFresh: boolean }) {
  const { t } = useLanguage();
  const autoImage = useProduceImage(l.produce_name, l.image_url);
  const [imgFailed, setImgFailed] = useState(false);
  const imgSrc = imgFailed ? null : autoImage;
  return (
    <Link
      href="/buyer"
      className="group flex items-center gap-3 bg-white border border-green-100 rounded-2xl p-3 hover:border-green-300 hover:shadow-md transition-all"
    >
      <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden">
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={l.produce_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center">
            <Leaf className="w-8 h-8 text-green-600" />
          </div>
        )}
        <span className="absolute top-1 left-1">
          <StatusPill
            label={
              isFresh ? t("farmNodeStatusFresh") : t("farmNodeStatusActive")
            }
            variant={isFresh ? "green" : "emerald"}
            pulse={isFresh}
            size="sm"
          />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-extrabold text-green-900 truncate tracking-tight">
            {l.produce_name}
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">
            · {l.farmer_name}
          </span>
        </div>
        <div className="text-xs text-gray-500 inline-flex items-center gap-1 mt-0.5 font-semibold">
          <MapPin className="w-3 h-3 text-green-600" />
          <span className="truncate">{l.location}</span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
              {t("farmNodeKgPrice")}
            </div>
            <div className="text-base font-extrabold text-green-700 tabular-nums leading-none">
              ₹{l.price_per_kg}
            </div>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
              {t("farmNodeKgAvailable")}
            </div>
            <div className="text-base font-extrabold text-green-900 tabular-nums leading-none">
              {l.quantity_kg}
            </div>
          </div>
        </div>
      </div>
      <ArrowRight
        className="w-4 h-4 text-green-500 shrink-0 group-hover:translate-x-0.5 transition-transform"
        strokeWidth={2.5}
      />
    </Link>
  );
}

function WhyFarmEasySection() {
  const { t } = useLanguage();
  const items: { Icon: LucideIcon; title: string; body: string }[] = [
    { Icon: Globe, title: t("whyExpertTitle"), body: t("whyExpertBody") },
    { Icon: Camera, title: t("whyRealDataTitle"), body: t("whyRealDataBody") },
    { Icon: Brain, title: t("whyEcosystemTitle"), body: t("whyEcosystemBody") },
  ];
  return (
    <section>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
          <span>{t("whyTitle")}</span>
        </div>
        <h2 className="font-display text-4xl sm:text-5xl font-black text-green-900 mb-2 leading-[1.05]">
          {t("whyTitle")}
        </h2>
        <p className="text-gray-600 text-lg">{t("whySubtitle")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
        {items.map(({ Icon, title, body }) => (
          <div key={title}>
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-green-700" strokeWidth={2.25} />
            </div>
            <h3 className="text-xl font-extrabold text-green-900 mb-2 tracking-tight leading-tight">
              {title}
            </h3>
            <p className="text-gray-600 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhoWeServeSection() {
  const { t } = useLanguage();
  const cards: {
    Icon: LucideIcon;
    title: string;
    body: string;
    hue: string;
  }[] = [
    {
      Icon: Tractor,
      title: t("audienceFarmerTitle"),
      body: t("audienceFarmerBody"),
      hue: "green",
    },
    {
      Icon: ShoppingCart,
      title: t("audienceBuyerTitle"),
      body: t("audienceBuyerBody"),
      hue: "emerald",
    },
    {
      Icon: Building2,
      title: t("audienceBusinessTitle"),
      body: t("audienceBusinessBody"),
      hue: "amber",
    },
    {
      Icon: HeartHandshake,
      title: t("audienceCommunityTitle"),
      body: t("audienceCommunityBody"),
      hue: "blue",
    },
  ];
  const hueMap: Record<string, { bg: string; text: string; ring: string }> = {
    green: {
      bg: "bg-green-100",
      text: "text-green-700",
      ring: "hover:border-green-300",
    },
    emerald: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      ring: "hover:border-emerald-300",
    },
    amber: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      ring: "hover:border-amber-300",
    },
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      ring: "hover:border-blue-300",
    },
  };
  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="font-display text-4xl sm:text-5xl font-black text-green-900 mb-2 leading-tight">
          {t("whoWeServeTitle")}
        </h2>
        <p className="text-lg text-gray-600 font-medium">
          {t("whoWeServeSubtitle")}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ Icon, title, body, hue }) => {
          const h = hueMap[hue];
          return (
            <div
              key={title}
              className={`bg-white border-2 border-green-100 rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${h.ring}`}
            >
              <div
                className={`w-11 h-11 rounded-xl ${h.bg} flex items-center justify-center mb-3`}
              >
                <Icon className={`w-6 h-6 ${h.text}`} strokeWidth={2} />
              </div>
              <h3 className="font-extrabold text-green-900 text-xl mb-1.5 tracking-tight">
                {title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LiveDataSection({ live }: { live: LiveStats }) {
  const { t } = useLanguage();
  const hasData = live.activeFarmers > 0 || live.ordersToday > 0;

  return (
    <section>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <StatusPill
              label={t("liveOnline")}
              variant="green"
              pulse
              size="sm"
            />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-green-900 leading-tight">
            {t("liveDataTitle")}
          </h2>
          <p className="text-lg text-gray-600 mt-1 font-medium">
            {t("liveDataSubtitle")}
          </p>
        </div>
      </div>

      <div className="bg-linear-to-br from-green-800 via-emerald-800 to-green-900 text-white rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3" />

        {!hasData ? (
          <div className="relative p-10 text-center text-green-100">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-60" />
            <p>{t("liveNoData")}</p>
          </div>
        ) : (
          <div className="relative p-6 lg:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Health score — big hero metric */}
            <div className="md:col-span-1 flex flex-col items-center justify-center bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-sm font-semibold text-green-200 uppercase tracking-wider mb-3">
                {t("liveHealth")}
              </div>
              <HealthRing value={live.health} />
            </div>

            {/* Metric grid */}
            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              <LiveMetric
                Icon={Users}
                label={t("liveActiveFarmers")}
                value={String(live.activeFarmers)}
                accent="green"
              />
              <LiveMetric
                Icon={ShoppingCart}
                label={t("liveOrdersToday")}
                value={String(live.ordersToday)}
                accent="emerald"
              />
              <LiveMetric
                Icon={TrendingUp}
                label={t("liveTopCrop")}
                value={live.topCrop ?? "—"}
                accent="amber"
              />
              <LiveMetric
                Icon={IndianRupee}
                label={t("liveAvgPrice")}
                value={
                  live.avgPrice != null ? `₹${live.avgPrice.toFixed(1)}` : "—"
                }
                accent="teal"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function HealthRing({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - clamped / 100);
  const strokeColor =
    clamped >= 70 ? "#4ade80" : clamped >= 40 ? "#facc15" : "#f87171";
  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke={strokeColor}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 800ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold tabular-nums">{clamped}</div>
        <div className="text-[10px] uppercase tracking-widest text-green-200">
          / 100
        </div>
      </div>
    </div>
  );
}

function LiveMetric({
  Icon,
  label,
  value,
  accent,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  accent: "green" | "emerald" | "amber" | "teal";
}) {
  const dotCls = {
    green: "bg-green-400",
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    teal: "bg-teal-400",
  }[accent];
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${dotCls} animate-pulse`} />
        <span className="text-[11px] uppercase tracking-widest text-green-100/80 font-semibold">
          {label}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <Icon className="w-5 h-5 text-green-200/70 shrink-0 mb-1" />
        <div className="text-2xl lg:text-3xl font-bold tabular-nums leading-tight truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

function NewFeaturesSection() {
  const { t } = useLanguage();
  return (
    <section>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New</span>
        </div>
        <h2 className="font-display text-4xl sm:text-5xl font-black text-green-900 mb-2 leading-tight">
          {t("newFeaturesTitle")}
        </h2>
        <p className="text-lg text-gray-600 font-medium">
          {t("newFeaturesSubtitle")}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <NewFeatureCard
          Icon={Building2}
          gradient="from-amber-400 to-orange-500"
          title={t("landingContractCardTitle")}
          body={t("landingContractCardBody")}
          ctaHref="/buyer"
          ctaLabel={t("exploreContracts")}
        />
        <NewFeatureCard
          Icon={Brain}
          gradient="from-emerald-500 to-teal-600"
          title={t("landingKnowledgeCardTitle")}
          body={t("landingKnowledgeCardBody")}
          ctaHref="/farmer"
          ctaLabel={t("exploreKnowledge")}
        />
      </div>
    </section>
  );
}

function NewFeatureCard({
  Icon,
  gradient,
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  Icon: LucideIcon;
  gradient: string;
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="relative bg-white border border-green-100 rounded-2xl p-6 lg:p-7 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div
        className={`w-14 h-14 rounded-2xl bg-linear-to-br ${gradient} flex items-center justify-center shadow-lg mb-4`}
      >
        <Icon className="w-7 h-7 text-white" strokeWidth={2} />
      </div>
      <h3 className="text-xl font-extrabold text-green-900 mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{body}</p>
      <Link
        href={ctaHref}
        className="inline-flex items-center gap-1 text-green-700 font-semibold text-sm hover:underline"
      >
        <span>{ctaLabel}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function ImpactSection({ stats }: { stats: Stats }) {
  const { t } = useLanguage();
  const cards: {
    Icon: LucideIcon;
    value: number;
    label: string;
    hue: string;
  }[] = [
    {
      Icon: Users,
      value: stats.farmers,
      label: t("impactFarmers"),
      hue: "green",
    },
    {
      Icon: Package,
      value: stats.kg,
      label: t("impactKgSold"),
      hue: "emerald",
    },
    {
      Icon: MapPin,
      value: stats.locations,
      label: t("impactLocations"),
      hue: "teal",
    },
  ];
  return (
    <section className="bg-linear-to-br from-green-600 to-emerald-700 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4" />

      <div className="text-center mb-8 relative">
        <h2 className="font-display text-4xl sm:text-5xl font-black mb-2 leading-tight">
          {t("impactTitle")}
        </h2>
        <p className="text-green-50">{t("impactSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 relative">
        {cards.map(({ Icon, value, label }, i) => (
          <div
            key={i}
            className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 animate-count-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/25 flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div className="font-display text-5xl lg:text-6xl font-black tabular-nums leading-none">
              {value.toLocaleString()}
            </div>
            <div className="text-sm text-green-50 mt-1 font-semibold uppercase tracking-widest text-[11px]">
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  const { t } = useLanguage();
  return (
    <section className="text-center relative">
      <div className="max-w-2xl mx-auto">
        <div className="inline-flex mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-green-300 animate-ping opacity-30" />
          <div className="relative w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-grow-bob">
            <Handshake className="w-8 h-8 text-green-700" strokeWidth={2} />
          </div>
        </div>
        <h2 className="font-display text-4xl sm:text-5xl font-black text-green-900 mb-3 leading-tight">
          {t("ctaTitle")}
        </h2>
        <p className="text-lg text-gray-600 mb-8 font-medium">
          {t("ctaSubtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Link
            href="/farmer"
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-extrabold text-base sm:text-lg tracking-tight py-4 px-6 rounded-xl shadow-lg transition-colors"
          >
            <Tractor className="w-5 h-5" />
            <span>{t("imFarmer")}</span>
          </Link>
          <Link
            href="/buyer"
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-green-700 font-extrabold text-base sm:text-lg tracking-tight py-4 px-6 rounded-xl shadow-lg border-2 border-green-600 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{t("imBuyer")}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  const { t } = useLanguage();
  return (
    <footer className="pt-6 border-t border-green-100 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
      <FooterFeature
        Icon={IndianRupee}
        title={t("feature1Title")}
        body={t("feature1Body")}
      />
      <FooterFeature
        Icon={Leaf}
        title={t("feature2Title")}
        body={t("feature2Body")}
      />
      <FooterFeature
        Icon={Handshake}
        title={t("feature3Title")}
        body={t("feature3Body")}
      />
      <div className="sm:col-span-3 text-center text-gray-500 inline-flex items-center justify-center gap-2 pt-4 border-t border-green-100 mt-2">
        <Sprout className="w-4 h-4 text-green-600 animate-sway" />
        <span>{t("footer")}</span>
      </div>
    </footer>
  );
}

function FooterFeature({
  Icon,
  title,
  body,
}: {
  Icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-2">
        <Icon className="w-5 h-5 text-green-700" />
      </div>
      <h4 className="font-semibold text-green-900 mb-1">{title}</h4>
      <p className="text-gray-600 text-xs leading-relaxed">{body}</p>
    </div>
  );
}
