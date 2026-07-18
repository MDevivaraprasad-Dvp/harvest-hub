'use client'

import Link from 'next/link'
import { useLanguage, LanguageSelector } from '@/lib/LanguageContext'

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-linear-to-b from-green-50 to-white">
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🌾</span>
          <span className="text-2xl font-bold text-green-800">{t('appName')}</span>
        </div>
        <LanguageSelector />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl font-bold text-green-900 leading-tight mb-6">
          {t('heroLine1')}
          <br />
          <span className="text-green-600">{t('heroLine2')}</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mb-12">
          {t('heroSubtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link
            href="/farmer"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-colors text-lg"
          >
            🚜 {t('imFarmer')}
          </Link>
          <Link
            href="/buyer"
            className="flex-1 bg-white hover:bg-gray-50 text-green-700 font-semibold py-4 px-6 rounded-xl shadow-lg border-2 border-green-600 transition-colors text-lg"
          >
            🛒 {t('imBuyer')}
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-4xl w-full">
          <FeatureCard emoji="💰" title={t('feature1Title')} body={t('feature1Body')} />
          <FeatureCard emoji="🥬" title={t('feature2Title')} body={t('feature2Body')} />
          <FeatureCard emoji="🤝" title={t('feature3Title')} body={t('feature3Body')} />
        </div>
      </main>

      <footer className="w-full px-6 py-6 text-center text-sm text-gray-500">
        {t('footer')} 🌱
      </footer>
    </div>
  )
}

function FeatureCard({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="font-semibold text-lg text-green-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
    </div>
  )
}
