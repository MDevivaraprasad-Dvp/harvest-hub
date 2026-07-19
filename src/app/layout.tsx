import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import { ToastProvider } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://harvest-hub.vercel.app"),
  title: {
    default: "FarmEasy — From farm to cart, no middleman",
    template: "%s · FarmEasy",
  },
  description:
    "Direct-to-buyer marketplace for Indian farmers. Fresh produce, fair prices, zero middlemen. Contract farming, live camera listings, and AI knowledge network — available in English, Hindi, Telugu, and Tamil.",
  applicationName: "FarmEasy",
  keywords: [
    "FarmEasy",
    "farmers marketplace",
    "direct from farm",
    "fresh produce",
    "Indian agriculture",
    "contract farming",
    "farm to table",
    "kisan",
    "produce marketplace",
    "agri-tech India",
  ],
  authors: [{ name: "FarmEasy" }],
  creator: "FarmEasy",
  publisher: "FarmEasy",
  category: "marketplace",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "FarmEasy",
    title: "FarmEasy — From farm to cart, no middleman",
    description:
      "Direct-to-buyer marketplace for Indian farmers. Fresh produce, fair prices, zero middlemen.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FarmEasy — From farm to cart, no middleman",
    description:
      "Direct-to-buyer marketplace for Indian farmers. Fresh produce, fair prices, zero middlemen.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <ToastProvider>{children}</ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
