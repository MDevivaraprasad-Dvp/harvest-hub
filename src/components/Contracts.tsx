'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Handshake, Plus, X, MapPin, CalendarDays, IndianRupee,
  Package, User, Check, Sprout, Phone, Building2,
} from 'lucide-react'
import { supabase, type Contract, type ContractStatus } from '@/lib/supabase'
import { useLanguage } from '@/lib/LanguageContext'

type BuyerProfile = { name: string; phone: string }
type FarmerProfile = { name: string; phone: string }

const STATUS_META: Record<ContractStatus, { cls: string }> = {
  open: { cls: 'bg-blue-100 text-blue-800' },
  accepted: { cls: 'bg-amber-100 text-amber-800' },
  harvested: { cls: 'bg-purple-100 text-purple-800' },
  completed: { cls: 'bg-green-100 text-green-800' },
  cancelled: { cls: 'bg-gray-100 text-gray-600' },
}

export function BuyerContracts({ profile, onSignInRequired }: {
  profile: BuyerProfile | null
  onSignInRequired: () => void
}) {
  const { t } = useLanguage()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchContracts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    setContracts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  const myPosted = useMemo(
    () => profile ? contracts.filter((c) => c.buyer_phone === profile.phone) : [],
    [contracts, profile]
  )
  const otherOpen = useMemo(
    () => contracts.filter((c) =>
      c.status === 'open' && (!profile || c.buyer_phone !== profile.phone)
    ),
    [contracts, profile]
  )

  const markCompleted = async (c: Contract) => {
    if (!confirm(t('confirmMarkContractCompleted'))) return
    const { error } = await supabase
      .from('contracts')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', c.id)
    if (error) return alert(error.message)
    fetchContracts()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">{t('contractInboxTitle')}</h1>
          <p className="text-gray-600 mt-1">{t('contractInboxSubtitle')}</p>
        </div>
        <button
          onClick={() => profile ? setShowForm(true) : onSignInRequired()}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-lg shadow inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t('postContract')}</span>
        </button>
      </div>

      {showForm && profile && (
        <PostContractForm
          profile={profile}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchContracts() }}
        />
      )}

      <section>
        <h2 className="text-xl font-extrabold text-green-900 mb-3 tracking-tight">{t('myPostedContracts')}</h2>
        {loading ? (
          <SkeletonCards />
        ) : myPosted.length === 0 ? (
          <EmptyState message={t('myPostedContractsEmpty')} />
        ) : (
          <div className="space-y-3">
            {myPosted.map((c) => (
              <ContractCard
                key={c.id}
                contract={c}
                perspective="buyer"
                actions={
                  c.status === 'harvested' ? (
                    <button
                      onClick={() => markCompleted(c)}
                      className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg inline-flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>{t('markContractCompleted')}</span>
                    </button>
                  ) : null
                }
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-green-900 mb-3 tracking-tight">{t('openContractsTitle')}</h2>
        <p className="text-sm text-gray-500 mb-3">{t('openContractsSubtitle')}</p>
        {loading ? (
          <SkeletonCards />
        ) : otherOpen.length === 0 ? (
          <EmptyState message={t('noOpenContracts')} />
        ) : (
          <div className="space-y-3">
            {otherOpen.map((c) => (
              <ContractCard key={c.id} contract={c} perspective="buyer" actions={null} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export function FarmerContracts({ profile, onSignInRequired }: {
  profile: FarmerProfile | null
  onSignInRequired: () => void
}) {
  const { t } = useLanguage()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  const fetchContracts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .or(
        profile
          ? `status.eq.open,farmer_phone.eq.${profile.phone}`
          : 'status.eq.open'
      )
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    setContracts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchContracts()
  }, [profile?.phone])

  const openList = contracts.filter((c) => c.status === 'open')
  const myList = profile ? contracts.filter((c) => c.farmer_phone === profile.phone) : []

  const acceptContract = async (c: Contract) => {
    if (!profile) return onSignInRequired()
    if (!confirm(t('confirmAcceptContract'))) return
    const { error } = await supabase
      .from('contracts')
      .update({
        status: 'accepted',
        farmer_name: profile.name,
        farmer_phone: profile.phone,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', c.id)
      .eq('status', 'open')
    if (error) return alert(error.message)
    fetchContracts()
  }

  const markHarvested = async (c: Contract) => {
    if (!confirm(t('confirmMarkHarvested'))) return
    const { error } = await supabase
      .from('contracts')
      .update({ status: 'harvested', harvested_at: new Date().toISOString() })
      .eq('id', c.id)
    if (error) return alert(error.message)
    fetchContracts()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">{t('contractFarming')}</h1>
        <p className="text-gray-600 mt-1">{t('contractFarmingSubtitle')}</p>
      </div>

      {!profile && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
          {t('signInToAcceptContract')}
        </div>
      )}

      <section>
        <h2 className="text-xl font-extrabold text-green-900 mb-3 tracking-tight">{t('openContractsTitle')}</h2>
        <p className="text-sm text-gray-500 mb-3">{t('openContractsSubtitle')}</p>
        {loading ? (
          <SkeletonCards />
        ) : openList.length === 0 ? (
          <EmptyState message={t('noOpenContracts')} />
        ) : (
          <div className="space-y-3">
            {openList.map((c) => (
              <ContractCard
                key={c.id}
                contract={c}
                perspective="farmer"
                actions={
                  <button
                    onClick={() => acceptContract(c)}
                    className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg inline-flex items-center gap-1"
                  >
                    <Handshake className="w-4 h-4" />
                    <span>{t('acceptContract')}</span>
                  </button>
                }
              />
            ))}
          </div>
        )}
      </section>

      {profile && (
        <section>
          <h2 className="text-xl font-extrabold text-green-900 mb-3 tracking-tight">{t('myAcceptedContracts')}</h2>
          {loading ? (
            <SkeletonCards />
          ) : myList.length === 0 ? (
            <EmptyState message={t('myAcceptedContractsEmpty')} />
          ) : (
            <div className="space-y-3">
              {myList.map((c) => (
                <ContractCard
                  key={c.id}
                  contract={c}
                  perspective="farmer"
                  actions={
                    c.status === 'accepted' ? (
                      <button
                        onClick={() => markHarvested(c)}
                        className="text-sm bg-purple-600 hover:bg-purple-700 text-white font-medium px-3 py-2 rounded-lg inline-flex items-center gap-1"
                      >
                        <Sprout className="w-4 h-4" />
                        <span>{t('markHarvested')}</span>
                      </button>
                    ) : null
                  }
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function ContractCard({
  contract,
  perspective,
  actions,
}: {
  contract: Contract
  perspective: 'buyer' | 'farmer'
  actions: React.ReactNode
}) {
  const { t } = useLanguage()
  const c = contract
  const statusLabel: Record<ContractStatus, string> = {
    open: t('contractStatusOpen'),
    accepted: t('contractStatusAccepted'),
    harvested: t('contractStatusHarvested'),
    completed: t('contractStatusCompleted'),
    cancelled: t('contractStatusCancelled'),
  }
  const total = Number(c.quantity_kg) * Number(c.price_per_kg)

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-[220px]">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <h3 className="font-extrabold text-green-900 text-xl tracking-tight">{c.produce_name}</h3>
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_META[c.status].cls}`}>
              {statusLabel[c.status]}
            </span>
          </div>
          <div className="text-sm text-gray-700 inline-flex items-center gap-1.5 flex-wrap">
            <Building2 className="w-4 h-4 text-green-600" strokeWidth={2.25} />
            <span className="font-bold text-green-900">{c.buyer_business_name}</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-600 font-medium">{c.buyer_name}</span>
          </div>
          {c.location && (
            <div className="text-xs text-gray-500 inline-flex items-center gap-1 mt-1 font-semibold">
              <MapPin className="w-3 h-3" />
              <span>{c.location}</span>
            </div>
          )}
          {c.notes && (
            <p className="text-sm text-gray-600 mt-2 italic font-medium">&ldquo;{c.notes}&rdquo;</p>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="text-3xl font-extrabold text-green-700 inline-flex items-center tabular-nums leading-none">
            <IndianRupee className="w-6 h-6" strokeWidth={2.5} />
            {Number(c.funding_amount).toLocaleString()}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{t('funding')}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <MetricPill Icon={Package} label={t('contractQuantity')} value={`${c.quantity_kg} kg`} />
        <MetricPill Icon={IndianRupee} label={t('contractPricePerKg')} value={`₹${c.price_per_kg}`} />
        <MetricPill Icon={IndianRupee} label={t('contractTotalValue')} value={`₹${total.toLocaleString()}`} />
        <MetricPill Icon={CalendarDays} label={t('dueBy')} value={new Date(c.deadline).toLocaleDateString()} />
      </div>

      {(c.farmer_name || perspective === 'buyer') && c.farmer_phone && (
        <div className="mt-3 bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-900 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <User className="w-4 h-4 text-green-700" />
            <span>
              <span className="font-medium">{t('acceptedByFarmer')}:</span> {c.farmer_name}
            </span>
          </div>
          <a href={`tel:${c.farmer_phone}`} className="inline-flex items-center gap-1 text-green-700 hover:underline text-sm">
            <Phone className="w-3.5 h-3.5" />
            {c.farmer_phone}
          </a>
        </div>
      )}

      {perspective === 'farmer' && c.status !== 'open' && (
        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-900 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-700" />
            <span>
              <span className="font-medium">{t('postedByBuyer')}:</span> {c.buyer_business_name}
            </span>
          </div>
          <a href={`tel:${c.buyer_phone}`} className="inline-flex items-center gap-1 text-blue-700 hover:underline text-sm">
            <Phone className="w-3.5 h-3.5" />
            {c.buyer_phone}
          </a>
        </div>
      )}

      {actions && (
        <div className="mt-4 flex justify-end">
          {actions}
        </div>
      )}
    </div>
  )
}

function MetricPill({ Icon, label, value }: {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2">
      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold inline-flex items-center gap-1">
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </div>
      <div className="text-base font-extrabold text-green-900 mt-0.5 truncate tabular-nums">{value}</div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
      <Handshake className="w-14 h-14 text-green-200 mx-auto mb-3" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  )
}

function SkeletonCards() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
          <div className="h-5 w-1/3 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-1/2 bg-gray-100 rounded mb-3" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-12 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PostContractForm({
  profile,
  onClose,
  onSaved,
}: {
  profile: BuyerProfile
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = useLanguage()
  const [businessName, setBusinessName] = useState('')
  const [produceName, setProduceName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [pricePerKg, setPricePerKg] = useState('')
  const [funding, setFunding] = useState('')
  const [deadline, setDeadline] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const { error: dbErr } = await supabase.from('contracts').insert({
      buyer_business_name: businessName.trim(),
      buyer_name: profile.name,
      buyer_phone: profile.phone,
      produce_name: produceName.trim(),
      quantity_kg: parseFloat(quantity),
      price_per_kg: parseFloat(pricePerKg),
      funding_amount: parseFloat(funding),
      deadline,
      location: location.trim() || null,
      notes: notes.trim() || null,
    })
    setSaving(false)
    if (dbErr) return setError(dbErr.message)
    alert(t('contractPosted'))
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[92vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-green-900">{t('newContractTitle')}</h2>
              <p className="text-sm text-gray-600">{t('postedByBuyer')}: {profile.name}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label={t('businessName')} placeholder={t('businessNamePlaceholder')} value={businessName} onChange={setBusinessName} required />
            <Field label={t('produceName')} placeholder={t('producePlaceholder')} value={produceName} onChange={setProduceName} required />
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('quantityKg')} type="number" placeholder="1000" value={quantity} onChange={setQuantity} required />
              <Field label={t('pricePerKg')} type="number" placeholder="25" value={pricePerKg} onChange={setPricePerKg} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('fundingAmount')} type="number" placeholder="15000" value={funding} onChange={setFunding} required />
              <Field label={t('deadlineLabel')} type="date" value={deadline} onChange={setDeadline} required />
            </div>
            <p className="text-xs text-gray-500 -mt-1">{t('fundingHint')}</p>
            <Field label={t('location')} placeholder={t('locationPlaceholder')} value={location} onChange={setLocation} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('contractNotes')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('contractNotesPlaceholder')}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 bg-gray-100 hover:bg-gray-200 font-medium py-3 rounded-lg disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <Handshake className="w-4 h-4" />
                <span>{saving ? t('saving') : t('saveContract')}</span>
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
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
      />
    </div>
  )
}
