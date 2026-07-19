import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buyer Marketplace",
  description:
    "Buy fresh produce directly from Indian farmers. Browse live listings, search by location, negotiate prices, save favourites, and post contract-farming proposals — no middlemen.",
  openGraph: {
    title: "Buyer Marketplace · FarmEasy",
    description:
      "Fresh produce direct from farmers. Search, save, negotiate, and order — no middlemen.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Buyer Marketplace · FarmEasy",
    description:
      "Fresh produce direct from farmers. Search, save, negotiate, and order — no middlemen.",
  },
  robots: { index: true, follow: true },
};

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
