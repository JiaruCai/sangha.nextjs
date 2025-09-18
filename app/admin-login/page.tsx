'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'email' | 'code' | 'password'

export default function AdminLogin() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [passcode, setPasscode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/admin/request-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send verification code')
        return
      }

      setCurrentStep('code')
    } catch (error) {
      console.error('Email submission error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/admin/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: verificationCode 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid verification code')
        return
      }

      setCurrentStep('password')
    } catch (error) {
      console.error('Code verification error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passcode }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      if (data.success) {
        router.push('/admin-dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetFlow = () => {
    setCurrentStep('email')
    setEmail('')
    setVerificationCode('')
    setPasscode('')
    setError('')
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'email':
        return 'We\'ll send you a verification code'
      case 'code':
        return 'Check your email for the 6-digit code'
      case 'password':
        return 'Enter the admin passcode to continue'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Familia Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {getStepDescription()}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          <div className={`h-2 w-16 rounded-full ${currentStep === 'email' ? 'bg-[#BF608F]' : 'bg-gray-300'}`} />
          <div className={`h-2 w-16 rounded-full ${currentStep === 'code' ? 'bg-[#BF608F]' : 'bg-gray-300'}`} />
          <div className={`h-2 w-16 rounded-full ${currentStep === 'password' ? 'bg-[#BF608F]' : 'bg-gray-300'}`} />
        </div>

        {currentStep === 'email' && (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#BF608F] focus:border-[#BF608F] focus:z-10 sm:text-sm"
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#BF608F] hover:bg-[#A5527A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF608F]'
                }`}
              >
                {isSubmitting ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          </form>
        )}

        {currentStep === 'code' && (
          <form className="mt-8 space-y-6" onSubmit={handleCodeSubmit}>
            <div>
              <label htmlFor="code" className="sr-only">
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                autoComplete="one-time-code"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#BF608F] focus:border-[#BF608F] focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#BF608F] hover:bg-[#A5527A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF608F]'
                }`}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Code'}
              </button>
              <button
                type="button"
                onClick={resetFlow}
                className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF608F]"
              >
                Start Over
              </button>
            </div>
          </form>
        )}

        {currentStep === 'password' && (
          <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit}>
            <div>
              <label htmlFor="passcode" className="sr-only">
                Admin Passcode
              </label>
              <input
                id="passcode"
                name="passcode"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#BF608F] focus:border-[#BF608F] focus:z-10 sm:text-sm"
                placeholder="Enter admin passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#BF608F] hover:bg-[#A5527A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF608F]'
                }`}
              >
                {isSubmitting ? 'Verifying...' : 'Access Dashboard'}
              </button>
              <button
                type="button"
                onClick={resetFlow}
                className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF608F]"
              >
                Start Over
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}