import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: Promise<{ phone: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { phone } = await params;
  const maskedPhone = phone.replace(/^(\d{2})\d+(\d{2})$/, "$1••••••$2");
  const title = `Farmer ${maskedPhone}`;
  const description = `View this farmer's live produce listings, reviews, trust badges, and average rating on FarmEasy.`;
  return {
    title,
    description,
    openGraph: {
      title: `${title} · FarmEasy`,
      description,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${title} · FarmEasy`,
      description,
    },
    robots: { index: false, follow: true },
  };
}

export default function FarmerPhoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
