import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Farmer Dashboard",
  description:
    "Sell your produce directly to buyers on FarmEasy. Add listings with live camera photos, manage orders, negotiate prices, review market insights, and accept contract-farming proposals.",
  openGraph: {
    title: "Farmer Dashboard · FarmEasy",
    description:
      "Manage your farm listings, orders, contracts, and market insights on FarmEasy.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Farmer Dashboard · FarmEasy",
    description:
      "Manage your farm listings, orders, and contracts on FarmEasy.",
  },
  robots: { index: true, follow: true },
};

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
