'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export function SignInForm({
  onSignIn,
  submitLabel,
  intro,
}: {
  onSignIn: (name: string, phone: string) => void
  submitLabel?: string
  intro?: string
}) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && phone.trim()) {
      onSignIn(name.trim(), phone.trim())
      setName('')
      setPhone('')
    }
  }

  return (
    <div>
      {intro && <p className="text-gray-600 mb-4">{intro}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t('yourName')}</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('yourNamePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-medium"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t('phoneNumber')}</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('phonePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-medium"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold tracking-tight py-3 rounded-lg transition-colors"
        >
          {submitLabel ?? t('continue')}
        </button>
      </form>
    </div>
  )
}
