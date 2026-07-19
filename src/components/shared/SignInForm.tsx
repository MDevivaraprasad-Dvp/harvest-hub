'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { PHONE_LENGTH, isValidPhone, sanitizePhone } from '@/lib/validation'

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
  const [phoneError, setPhoneError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidPhone(phone)) {
      setPhoneError(true)
      return
    }
    if (name.trim()) {
      onSignIn(name.trim(), phone)
      setName('')
      setPhone('')
      setPhoneError(false)
    }
  }

  const phoneInputClass = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none font-medium ${
    phoneError
      ? 'border-red-400 focus:ring-red-500'
      : 'border-gray-300 focus:ring-green-500'
  }`

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
            inputMode="numeric"
            autoComplete="tel"
            required
            maxLength={PHONE_LENGTH}
            pattern="\d{10}"
            value={phone}
            onChange={(e) => {
              setPhone(sanitizePhone(e.target.value))
              if (phoneError) setPhoneError(false)
            }}
            placeholder={t('phonePlaceholder')}
            aria-invalid={phoneError}
            className={phoneInputClass}
          />
          {phoneError && (
            <p className="text-xs text-red-600 mt-1">{t('invalidPhone')}</p>
          )}
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
