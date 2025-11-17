// app/unsubscribe/page.tsx
'use client'

import { Suspense } from 'react'
import UnsubscribeForm from './UnsubscribeForm'

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<UnsubscribeLoadingFallback />}>
      <UnsubscribeForm />
    </Suspense>
  )
}

function UnsubscribeLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Familia Newsletter
          </h2>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  )
}
