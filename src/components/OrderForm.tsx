'use client'

import { useEffect, useState } from 'react'
import { supabase, type Listing } from '@/lib/supabase'
import { useLanguage } from '@/lib/LanguageContext'

export function OrderForm({
  listing,
  onClose,
  onPlaced,
}: {
  listing: Listing
  onClose: () => void
  onPlaced: () => void
}) {
  const { t } = useLanguage()
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [note, setNote] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [showOfferField, setShowOfferField] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('farmeasy_buyer')
    if (stored) {
      const b = JSON.parse(stored) as { name: string; phone: string }
      setBuyerName(b.name)
      setBuyerPhone(b.phone)
    }
  }, [])

  const qtyNum = parseFloat(quantity)
  const offerNum = parseFloat(offerPrice)
  const hasValidOffer =
    showOfferField && !isNaN(offerNum) && offerNum > 0 && offerNum !== listing.price_per_kg
  const effectivePrice = hasValidOffer ? offerNum : listing.price_per_kg
  const total = !isNaN(qtyNum) && qtyNum > 0 ? qtyNum * effectivePrice : 0

  const resetForm = () => {
    setQuantity('1')
    setNote('')
    setOfferPrice('')
    setShowOfferField(false)
    setError(null)
  }

  const handleCancel = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (isNaN(qtyNum) || qtyNum <= 0) return setError(t('quantityRequired'))

    setSubmitting(true)
    localStorage.setItem('farmeasy_buyer', JSON.stringify({
      name: buyerName.trim(),
      phone: buyerPhone.trim(),
    }))
    localStorage.setItem('farmeasy_buyer_name', buyerName.trim())

    const isNegotiating = hasValidOffer
    const { error: dbErr } = await supabase.from('orders').insert({
      farmer_phone: listing.farmer_phone,
      buyer_name: buyerName.trim(),
      buyer_phone: buyerPhone.trim(),
      listing_id: listing.id,
      produce_name: listing.produce_name,
      quantity_kg: qtyNum,
      price_per_kg: listing.price_per_kg,
      status: isNegotiating ? 'negotiating' : 'pending',
      note: note.trim() || null,
      offered_price: isNegotiating ? offerNum : null,
      counter_price: null,
    })
    setSubmitting(false)
    if (dbErr) return setError(dbErr.message)
    resetForm()
    onPlaced()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-green-900 mb-1">{t('placeOrder')}</h2>
          <p className="text-sm text-gray-600 mb-4">
            {listing.produce_name} · ₹{listing.price_per_kg}/kg · {listing.farmer_name}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourName')}</label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder={t('yourNamePlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourPhone')}</label>
              <input
                type="tel"
                required
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder={t('phonePlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('quantityKg')}</label>
              <input
                type="number"
                required
                step="0.1"
                min="0.1"
                max={listing.quantity_kg}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">{listing.quantity_kg} {t('kgAvailable')}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-3">
              {!showOfferField ? (
                <button
                  type="button"
                  onClick={() => setShowOfferField(true)}
                  className="text-sm text-green-700 font-semibold hover:underline"
                >
                  {t('proposeYourPrice')}
                </button>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-green-800">{t('proposeYourPrice')}</label>
                    <button
                      type="button"
                      onClick={() => { setShowOfferField(false); setOfferPrice('') }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder={`${t('listedAt')} ₹${listing.price_per_kg}`}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('proposePriceHint')}</p>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('orderNote')}</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('orderNotePlaceholder')}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
              />
            </div>

            {total > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-700">{t('orderTotal')}</div>
                  {hasValidOffer && (
                    <div className="text-xs text-green-700 mt-0.5">
                      @ ₹{offerNum}/kg ({t('yourOffer')})
                    </div>
                  )}
                </div>
                <span className="text-xl font-bold text-green-700">₹{total.toFixed(2)}</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 font-medium py-3 rounded-lg disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
              >
                {submitting ? t('saving') : t('placeOrder')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
