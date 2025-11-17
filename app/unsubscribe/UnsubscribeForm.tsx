// app/unsubscribe/UnsubscribeForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type UnsubscribeStatus = 'form' | 'processing' | 'success' | 'error' | 'not-found'

export default function UnsubscribeForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<UnsubscribeStatus>('form')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // Get email from URL params if provided
    const emailParam = searchParams?.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('processing')
    setErrorMessage('')

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          setStatus('not-found')
        } else {
          setStatus('error')
          setErrorMessage(data.error || 'Failed to unsubscribe')
        }
        return
      }

      setStatus('success')
    } catch (error) {
      console.error('Unsubscribe error:', error)
      setStatus('error')
      setErrorMessage('An unexpected error occurred')
    }
  }

  const resetForm = () => {
    setStatus('form')
    setEmail('')
    setErrorMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Familia Newsletter
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {status === 'form' && 'Manage your newsletter subscription'}
            {status === 'processing' && 'Processing your request...'}
            {status === 'success' && 'Successfully unsubscribed'}
            {status === 'not-found' && 'Email not found'}
            {status === 'error' && 'Something went wrong'}
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          {(status === 'form' || status === 'processing') && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'processing'}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#BF608F] focus:border-[#BF608F] sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{errorMessage}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={status === 'processing'}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    status === 'processing'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#BF608F] hover:bg-[#A5527A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF608F]'
                  }`}
                >
                  {status === 'processing' ? 'Processing...' : 'Unsubscribe'}
                </button>
              </div>

              <div className="text-center text-sm">
                <p className="text-gray-600">
                  We&apos;re sorry to see you go.
                </p>
              </div>
            </form>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Successfully unsubscribed</h3>
                <p className="mt-2 text-sm text-gray-600">
                  You have been removed from our newsletter list.
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Email: <span className="font-medium">{email}</span>
                </p>
                <div className="mt-6">
                  <Link
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF608F]"
                  >
                    Return to website
                  </Link>
                </div>
              </div>
            </div>
          )}

          {status === 'not-found' && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Email not found</h3>
                <p className="mt-2 text-sm text-gray-600">
                  The email address <span className="font-medium">{email}</span> is not subscribed to our newsletter.
                </p>
              </div>
              <div className="mt-6 space-y-2">
                <button
                  onClick={resetForm}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF608F]"
                >
                  Try another email
                </button>
                <Link
                  href="/"
                  className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-[#BF608F] hover:text-[#A5527A]"
                >
                  Return to website
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {errorMessage || 'We were unable to process your request. Please try again.'}
                </p>
              </div>
              <div className="mt-6 space-y-2">
                <button
                  onClick={resetForm}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#BF608F] hover:bg-[#A5527A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF608F]"
                >
                  Try again
                </button>
                <Link
                  href="/"
                  className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Return to website
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}