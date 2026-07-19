'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Route error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-extrabold text-green-900 tracking-tight mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          {error.message || 'The page hit an unexpected error. Try again, or head back home.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
            Retry
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-white border-2 border-green-600 text-green-700 font-bold py-3 rounded-lg hover:bg-green-50"
          >
            <Home className="w-4 h-4" strokeWidth={2.5} />
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
