'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase, type Listing } from '@/lib/supabase'

export default function BuyerPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [revealedPhone, setRevealedPhone] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) console.error(error)
      setListings(data ?? [])
      setLoading(false)
    }
    fetchListings()
  }, [])

  const locations = useMemo(() => {
    const set = new Set(listings.map((l) => l.location))
    return Array.from(set).sort()
  }, [listings])

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const matchesSearch = search.trim() === '' || l.produce_name.toLowerCase().includes(search.toLowerCase())
      const matchesLocation = locationFilter === '' || l.location === locationFilter
      return matchesSearch && matchesLocation
    })
  }, [listings, search, locationFilter])

  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <span className="text-xl font-bold text-green-800">FarmEasy</span>
          </Link>
          <span className="text-sm text-gray-600">Buyer Marketplace</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-green-900">Fresh from the Farm</h1>
          <p className="text-gray-600 mt-1">Browse produce directly from farmers near you.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="🔍 Search produce (e.g. tomato)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading fresh produce...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">🥬</div>
            <p className="text-gray-600">
              {listings.length === 0
                ? 'No listings yet. Check back soon!'
                : 'No listings match your filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((l) => (
              <div key={l.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {l.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.image_url} alt={l.produce_name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center text-6xl">
                    🥬
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg text-green-900">{l.produce_name}</h3>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-700">₹{l.price_per_kg}<span className="text-xs font-normal text-gray-500">/kg</span></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">📍 {l.location}</p>
                  <p className="text-sm text-gray-500 mt-1">🌾 {l.quantity_kg} kg available</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Farmer:</span> {l.farmer_name}
                    </p>
                    {revealedPhone[l.id] ? (
                      <a
                        href={`tel:${l.farmer_phone}`}
                        className="mt-3 block w-full bg-green-600 hover:bg-green-700 text-white text-center font-semibold py-2.5 rounded-lg transition-colors"
                      >
                        📞 Call {l.farmer_phone}
                      </a>
                    ) : (
                      <button
                        onClick={() => setRevealedPhone((p) => ({ ...p, [l.id]: true }))}
                        className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                      >
                        Contact Farmer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
