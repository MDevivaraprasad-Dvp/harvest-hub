'use client'

import Link from 'next/link'
import { Tractor, ShoppingCart, IndianRupee, Leaf, Handshake, Sprout } from 'lucide-react'
import { useLanguage, LanguageSelector } from '@/lib/LanguageContext'
import { HeroIllustration } from '@/components/HeroIllustration'

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-linear-to-b from-green-50 to-white">
      <header className="w-full px-6 lg:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-sm">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-green-800">{t('appName')}</span>
        </div>
        <LanguageSelector />
      </header>

      <main className="flex-1 px-6 py-8 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-16">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-900 leading-tight mb-6">
              {t('heroLine1')}
              <br />
              <span className="text-green-600">{t('heroLine2')}</span>
            </h1>

            <p className="text-lg text-gray-700 mb-8">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md">
              <Link
                href="/farmer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-colors"
              >
                <Tractor className="w-5 h-5" />
                <span>{t('imFarmer')}</span>
              </Link>
              <Link
                href="/buyer"
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-green-700 font-semibold py-4 px-6 rounded-xl shadow-lg border-2 border-green-600 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{t('imBuyer')}</span>
              </Link>
            </div>
          </div>

          <div className="lg:pl-8">
            <HeroIllustration className="w-full h-auto drop-shadow-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <FeatureCard
            icon={<IndianRupee className="w-6 h-6 text-green-700" />}
            title={t('feature1Title')}
            body={t('feature1Body')}
          />
          <FeatureCard
            icon={<Leaf className="w-6 h-6 text-green-700" />}
            title={t('feature2Title')}
            body={t('feature2Body')}
          />
          <FeatureCard
            icon={<Handshake className="w-6 h-6 text-green-700" />}
            title={t('feature3Title')}
            body={t('feature3Body')}
          />
        </div>
      </main>

      <footer className="w-full px-6 py-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
        <Sprout className="w-4 h-4 text-green-600" />
        <span>{t('footer')}</span>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-green-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
    </div>
  )
}
