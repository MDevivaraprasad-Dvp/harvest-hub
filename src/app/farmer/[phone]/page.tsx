'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { supabase, type Listing, type Review } from '@/lib/supabase'
import { useLanguage, LanguageSelector } from '@/lib/LanguageContext'
import { computeBadges, averageRating } from '@/lib/badges'
import { StarRating, RatingSummary } from '@/components/StarRating'

export default function FarmerProfilePage({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = use(params)
  const decodedPhone = decodeURIComponent(phone)
  const { t } = useLanguage()

  const [listings, setListings] = useState<Listing[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const load = async () => {
    setLoading(true)
    const [lRes, rRes] = await Promise.all([
      supabase
        .from('listings')
        .select('*')
        .eq('farmer_phone', decodedPhone)
        .order('created_at', { ascending: false }),
      supabase
        .from('reviews')
        .select('*')
        .eq('farmer_phone', decodedPhone)
        .order('created_at', { ascending: false }),
    ])
    if (lRes.error) console.error(lRes.error)
    if (rRes.error) console.error(rRes.error)
    setListings(lRes.data ?? [])
    setReviews(rRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [decodedPhone])

  const farmerName = listings[0]?.farmer_name ?? null
  const badges = computeBadges(listings, reviews)
  const avg = averageRating(reviews)
  const earliestListing = listings.length > 0
    ? [...listings].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]
    : null

  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <span className="text-xl font-bold text-green-800">{t('appName')}</span>
          </Link>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/buyer" className="text-sm text-green-700 hover:underline mb-4 inline-block">
          ← {t('backToMarketplace')}
        </Link>

        {loading ? (
          <p className="text-gray-500 mt-8">{t('loading')}</p>
        ) : !farmerName ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center mt-8">
            <div className="text-5xl mb-4">🤔</div>
            <p className="text-gray-600">{t('farmerNotFound')}</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-green-900">{farmerName}</h1>
                  <p className="text-gray-600 mt-1">📞 {decodedPhone}</p>
                  {earliestListing && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t('activeSince')} {new Date(earliestListing.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <RatingSummary average={avg} count={reviews.length} size="md" />
                  <div className="mt-1 text-sm text-gray-600">
                    {listings.length} {t('listingsCount')} · {reviews.length} {t('reviewsCount')}
                  </div>
                </div>
              </div>

              {badges.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {badges.map((b) => (
                    <span
                      key={b.kind}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"
                    >
                      <span>{b.emoji}</span>
                      <span>{t(b.labelKey)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {listings.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-green-900 mb-4">
                  {t('listingsCount')} ({listings.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.map((l) => (
                    <div key={l.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      {l.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.image_url} alt={l.produce_name} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center text-4xl">
                          🥬
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="font-semibold text-green-900">{l.produce_name}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-gray-600">{l.quantity_kg} kg</span>
                          <span className="text-lg font-bold text-green-700">₹{l.price_per_kg}/kg</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-green-900">{t('ratingsAndReviews')}</h2>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
                >
                  ✍️ {t('leaveReview')}
                </button>
              </div>

              {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                  <p className="text-gray-500">{t('noReviewsYet')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-white rounded-xl shadow-sm p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-green-900">{r.buyer_name}</div>
                          <div className="mt-1">
                            <StarRating value={r.rating} readOnly size="sm" />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {r.comment && (
                        <p className="text-gray-700 mt-2 text-sm leading-relaxed">{r.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {showReviewForm && (
              <ReviewForm
                farmerPhone={decodedPhone}
                onClose={() => setShowReviewForm(false)}
                onSubmitted={() => { setShowReviewForm(false); load() }}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

function ReviewForm({
  farmerPhone,
  onClose,
  onSubmitted,
}: {
  farmerPhone: string
  onClose: () => void
  onSubmitted: () => void
}) {
  const { t } = useLanguage()
  const [buyerName, setBuyerName] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('farmeasy_buyer_name')
    if (stored) setBuyerName(stored)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (rating === 0) return setError(t('ratingRequired'))

    setSubmitting(true)
    localStorage.setItem('farmeasy_buyer_name', buyerName.trim())
    const { error: dbErr } = await supabase.from('reviews').insert({
      farmer_phone: farmerPhone,
      rating,
      comment: comment.trim() || null,
      buyer_name: buyerName.trim(),
    })
    setSubmitting(false)
    if (dbErr) return setError(dbErr.message)
    alert(t('reviewSubmitted'))
    onSubmitted()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-green-900 mb-4">{t('leaveReview')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourName')}</label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder={t('yourNamePlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('yourRating')}</label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourComment')}</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('commentPlaceholder')}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
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
                {submitting ? t('submittingReview') : t('submitReview')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
