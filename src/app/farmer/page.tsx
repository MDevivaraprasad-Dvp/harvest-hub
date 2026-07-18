'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Sprout, Tractor, Camera, MapPin, Plus, Pencil, Trash2,
  Phone, Package, ArrowRight, X, Check, LogOut, RefreshCw,
} from 'lucide-react'
import { supabase, type Listing, type Order, type OrderStatus } from '@/lib/supabase'
import { useLanguage, LanguageSelector } from '@/lib/LanguageContext'
import { MarketInsights } from '@/components/MarketInsights'

type FarmerProfile = { name: string; phone: string }

export default function FarmerPage() {
  const { t } = useLanguage()
  const [profile, setProfile] = useState<FarmerProfile | null>(null)
  const [showSignIn, setShowSignIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('farmeasy_farmer')
    if (stored) setProfile(JSON.parse(stored))
    setLoading(false)
  }, [])

  const handleSignIn = (name: string, phone: string) => {
    const p = { name, phone }
    localStorage.setItem('farmeasy_farmer', JSON.stringify(p))
    setProfile(p)
    setShowSignIn(false)
  }

  const handleSignOut = () => {
    localStorage.removeItem('farmeasy_farmer')
    setProfile(null)
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-white shadow-sm">
        <div className="w-full px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-green-800">{t('appName')}</span>
          </Link>
          <div className="flex items-center gap-4">
            {profile && (
              <span className="text-sm text-gray-600 hidden sm:inline">
                {t('hi')}, <span className="font-semibold text-green-800">{profile.name}</span>
              </span>
            )}
            <LanguageSelector />
            {profile && (
              <button
                onClick={handleSignOut}
                className="text-sm text-red-600 hover:underline inline-flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                {t('signOut')}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {profile ? (
          <Dashboard profile={profile} />
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-green-900">{t('marketInsights')}</h1>
              <p className="text-gray-600 mt-1">{t('insightsSubtitle')}</p>
            </div>

            <div className="bg-linear-to-r from-green-600 to-green-700 text-white rounded-2xl shadow-lg p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Tractor className="w-10 h-10 shrink-0" />
                <div>
                  <div className="text-xl font-bold">{t('welcomeFarmer')}</div>
                  <p className="text-green-50 text-sm mt-1">{t('signInPrompt')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSignIn(true)}
                className="bg-white text-green-700 hover:bg-green-50 font-semibold px-6 py-3 rounded-lg shadow whitespace-nowrap inline-flex items-center gap-2"
              >
                <span>{t('signInToSell')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <MarketInsights />

            {showSignIn && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-green-900">{t('welcomeFarmer')}</h2>
                      <button
                        onClick={() => setShowSignIn(false)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <SignInForm onSignIn={handleSignIn} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function SignInForm({ onSignIn }: { onSignIn: (name: string, phone: string) => void }) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && phone.trim()) onSignIn(name.trim(), phone.trim())
  }

  return (
    <div>
      <p className="text-gray-600 mb-4">{t('signInPrompt')}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourName')}</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('yourNamePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('phoneNumber')}</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('phonePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {t('continue')}
        </button>
      </form>
    </div>
  )
}

function Dashboard({ profile }: { profile: FarmerProfile }) {
  const { t } = useLanguage()
  const [tab, setTab] = useState<'listings' | 'orders' | 'insights'>('listings')
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const loadPendingCount = async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('farmer_phone', profile.phone)
        .eq('status', 'pending')
      setPendingCount(count ?? 0)
    }
    loadPendingCount()
  }, [profile.phone, tab])

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-gray-200 flex-wrap">
        <TabButton active={tab === 'listings'} onClick={() => setTab('listings')} label={t('myListingsTab')} />
        <TabButton
          active={tab === 'orders'}
          onClick={() => setTab('orders')}
          label={t('orders')}
          badge={pendingCount > 0 ? pendingCount : undefined}
        />
        <TabButton active={tab === 'insights'} onClick={() => setTab('insights')} label={t('tabInsights')} />
      </div>

      {tab === 'listings' && <ListingsView profile={profile} />}
      {tab === 'orders' && <OrdersView profile={profile} />}
      {tab === 'insights' && (
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-green-900">{t('marketInsights')}</h1>
            <p className="text-gray-600 mt-1">{t('insightsSubtitle')}</p>
          </div>
          <MarketInsights />
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  label: string
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 font-medium transition-colors ${
        active
          ? 'text-green-800 border-b-2 border-green-600'
          : 'text-gray-600 hover:text-green-700'
      }`}
    >
      {label}
      {badge !== undefined && (
        <span className="ml-2 inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
          {badge}
        </span>
      )}
    </button>
  )
}

function ListingsView({ profile }: { profile: FarmerProfile }) {
  const { t } = useLanguage()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Listing | null>(null)

  const fetchListings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('farmer_phone', profile.phone)
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    setListings(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchListings()
  }, [profile.phone])

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirmDelete'))) return
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) return alert(error.message)
    fetchListings()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900">{t('myListings')}</h1>
          <p className="text-gray-600 mt-1">
            {listings.length} {listings.length === 1 ? t('activeListings') : t('activeListingsPlural')}
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t('addProduce').replace('+ ', '')}</span>
        </button>
      </div>

      {showForm && (
        <ListingForm
          profile={profile}
          existing={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => { setShowForm(false); setEditing(null); fetchListings() }}
        />
      )}

      {loading ? (
        <p className="text-gray-500">{t('loading')}</p>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Sprout className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{t('noListingsYet')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {l.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.image_url} alt={l.produce_name} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-green-900">{l.produce_name}</h3>
                <p className="text-sm text-gray-600 mt-1 inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{l.location}</span>
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-700">₹{l.price_per_kg}<span className="text-sm font-normal text-gray-500">/kg</span></div>
                    <div className="text-xs text-gray-500">{l.quantity_kg} {t('kgAvailable')}</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => { setEditing(l); setShowForm(true) }}
                    className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 py-2 rounded-lg font-medium inline-flex items-center justify-center gap-1"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>{t('edit')}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(l.id)}
                    className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-lg font-medium inline-flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('delete')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function OrdersView({ profile }: { profile: FarmerProfile }) {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('farmer_phone', profile.phone)
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    setOrders(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [profile.phone])

  const updateStatus = async (id: number, newStatus: OrderStatus, confirmKey: 'confirmMarkCompleted' | 'confirmCancelOrder') => {
    if (!confirm(t(confirmKey))) return
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id)
    if (error) return alert(error.message)
    fetchOrders()
  }

  const groupedPending = orders.filter((o) => o.status === 'pending')
  const groupedCompleted = orders.filter((o) => o.status === 'completed')
  const groupedCancelled = orders.filter((o) => o.status === 'cancelled')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-900">{t('orders')}</h1>
      </div>

      {loading ? (
        <p className="text-gray-500">{t('loading')}</p>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Package className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <p className="text-gray-600">{t('noOrdersYet')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedPending.length > 0 && (
            <OrderGroup
              title={t('pendingOrders')}
              orders={groupedPending}
              onMarkCompleted={(id) => updateStatus(id, 'completed', 'confirmMarkCompleted')}
              onCancel={(id) => updateStatus(id, 'cancelled', 'confirmCancelOrder')}
            />
          )}
          {groupedCompleted.length > 0 && (
            <OrderGroup title={t('completedOrders')} orders={groupedCompleted} />
          )}
          {groupedCancelled.length > 0 && (
            <OrderGroup title={t('cancelledOrders')} orders={groupedCancelled} />
          )}
        </div>
      )}
    </div>
  )
}

function OrderGroup({
  title,
  orders,
  onMarkCompleted,
  onCancel,
}: {
  title: string
  orders: Order[]
  onMarkCompleted?: (id: number) => void
  onCancel?: (id: number) => void
}) {
  const { t } = useLanguage()
  return (
    <div>
      <h2 className="text-lg font-bold text-green-900 mb-3">{title} ({orders.length})</h2>
      <div className="space-y-3">
        {orders.map((o) => {
          const total = o.quantity_kg * o.price_per_kg
          const statusColor =
            o.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : o.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          const statusLabel =
            o.status === 'pending'
              ? t('orderStatusPending')
              : o.status === 'completed'
              ? t('orderStatusCompleted')
              : t('orderStatusCancelled')

          return (
            <div key={o.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-green-900">{o.produce_name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {o.quantity_kg} kg × ₹{o.price_per_kg}/kg =
                    <span className="font-bold text-green-700"> ₹{total.toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">{t('buyer')}:</span> {o.buyer_name}
                    {' · '}
                    <a href={`tel:${o.buyer_phone}`} className="text-green-700 hover:underline inline-flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {o.buyer_phone}
                    </a>
                  </p>
                  {o.note && (
                    <p className="text-sm text-gray-600 mt-1 italic">&ldquo;{o.note}&rdquo;</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(o.created_at).toLocaleString()}
                  </p>
                </div>
                {onMarkCompleted && onCancel && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => onMarkCompleted(o.id)}
                      className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg inline-flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>{t('markCompleted')}</span>
                    </button>
                    <button
                      onClick={() => onCancel(o.id)}
                      className="text-sm bg-red-50 hover:bg-red-100 text-red-700 font-medium px-3 py-2 rounded-lg inline-flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      <span>{t('cancelOrder')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ListingForm({
  profile,
  existing,
  onClose,
  onSaved,
}: {
  profile: FarmerProfile
  existing: Listing | null
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = useLanguage()
  const [produceName, setProduceName] = useState(existing?.produce_name ?? '')
  const [quantityKg, setQuantityKg] = useState(existing?.quantity_kg?.toString() ?? '')
  const [pricePerKg, setPricePerKg] = useState(existing?.price_per_kg?.toString() ?? '')
  const [location, setLocation] = useState(existing?.location ?? '')
  const [imageUrl, setImageUrl] = useState(existing?.image_url ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existing?.image_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setImageUrl('')
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imageUrl || null
    setUploading(true)
    setError(null)

    const ext = imageFile.name.split('.').pop() || 'jpg'
    const path = `${profile.phone}/${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('produce-images')
      .upload(path, imageFile, { contentType: imageFile.type, upsert: false })

    if (uploadErr) {
      setUploading(false)
      setError(uploadErr.message)
      return null
    }

    const { data } = supabase.storage.from('produce-images').getPublicUrl(path)
    setUploading(false)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!existing && !imageFile) {
      setError(t('photoRequired'))
      return
    }

    setSaving(true)
    const finalImageUrl = await uploadImage()
    if (imageFile && !finalImageUrl) {
      setSaving(false)
      return
    }

    const payload = {
      farmer_name: profile.name,
      farmer_phone: profile.phone,
      produce_name: produceName.trim(),
      quantity_kg: parseFloat(quantityKg),
      price_per_kg: parseFloat(pricePerKg),
      location: location.trim(),
      image_url: finalImageUrl,
    }
    const { error: dbErr } = existing
      ? await supabase.from('listings').update(payload).eq('id', existing.id)
      : await supabase.from('listings').insert(payload)
    setSaving(false)
    if (dbErr) return setError(dbErr.message)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-green-900 mb-4">
            {existing ? t('editListing') : t('addNewProduce')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label={t('produceName')} placeholder={t('producePlaceholder')} value={produceName} onChange={setProduceName} required />
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('quantityKg')} type="number" placeholder="50" value={quantityKg} onChange={setQuantityKg} required />
              <Field label={t('pricePerKg')} type="number" placeholder="25" value={pricePerKg} onChange={setPricePerKg} required />
            </div>
            <Field label={t('location')} placeholder={t('locationPlaceholder')} value={location} onChange={setLocation} required />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('capturePhoto')} {!existing && <span className="text-red-500">*</span>}
              </label>
              {previewUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg font-medium text-sm inline-flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{t('retakePhoto')}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-green-300 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-medium flex flex-col items-center gap-2"
                >
                  <Camera className="w-8 h-8" />
                  <span>{t('capturePhoto')}</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCapture}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">{t('photoHint')}</p>
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
                disabled={saving || uploading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 font-medium py-3 rounded-lg disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
              >
                {uploading ? t('uploadingPhoto') : saving ? t('saving') : existing ? t('update') : t('addListing')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={type === 'number' ? '0.01' : undefined}
        min={type === 'number' ? '0' : undefined}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
      />
    </div>
  )
}
