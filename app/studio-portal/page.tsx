// app/studio-portal/page.tsx
'use client'

import { useState, useEffect } from 'react'

interface StudioAuthUser {
  authId: string
  organizerId: string
  email: string
}

interface StudioData {
  organizer_id: string
  name: string
  description: string
  image_url?: string
  contact_email?: string
  phone?: string
  address?: string
  website_url?: string
  social_media_links?: Record<string, string>
  business_hours?: Record<string, string>
  referral_code?: string
  created_at?: string
  updated_at?: string
}

interface User {
  userId: string
  fullName: string | null
  email: string | null
  profilePhotoUrl: string | null
}

interface Registration {
  registrationId: string
  userId: string
  status: string
  registeredAt: string
  isAttending: boolean | null
  user: User | null
}

interface Event {
  eventId: string
  title: string
  description: string
  startTime: string
  endTime: string
  location: string
  price: number
  capacity: number | null
  imageUrl: string | null
  isActive: boolean
  status: 'upcoming' | 'ongoing' | 'completed'
  registrations: Registration[]
  totalRegistrations: number
}

interface PayoutData {
  currentBalance: number
  pendingPayouts: number
  totalEarnings: number
  lastPayout: string | null
}

interface AnalyticsData {
  totalBookings: number
  monthlyBookings: number
  activeEvents: number
  completedEvents: number
  popularEvents: Array<{
    title: string
    eventId: string
    bookings: number
    startTime: string
    price: number
  }>
  monthlyRevenue: Array<{
    month: string
    amount: number
  }>
  totalRevenue: number
}

interface ReferralTracking {
  referral_tracking_id: string
  referred_user_id: string
  referral_code: string
  status: 'pending' | 'completed'
  premium_months_granted: number
  created_at: string
  referredUser?: {
    fullName: string | null
    email: string | null
  }
}

interface ReferralStats {
  totalReferrals: number
  pendingReferrals: number
  completedReferrals: number
  totalMonthsGranted: number
  referrals: ReferralTracking[]
}

interface DashboardData {
  events: Event[]
  analytics: AnalyticsData
  payouts: PayoutData
}

interface StudioDashboardProps {
  user: StudioAuthUser
  studioData: StudioData | null
  onLogout: () => void
}

export default function StudioPortal() {
  const [user, setUser] = useState<StudioAuthUser | null>(null)
  const [studioData, setStudioData] = useState<StudioData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [requiresPasswordReset, setRequiresPasswordReset] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/studio-auth/verify')
      const data = await response.json()

      if (data.authenticated && data.user) {
        setUser({
          authId: data.user.authId,
          organizerId: data.user.organizerId,
          email: data.user.email
        })
        
        // Set studio data if available
        if (data.user.studioData) {
          setStudioData(data.user.studioData)
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setLoginError('')

    try {
      const response = await fetch('/api/studio-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoginError(data.error || 'Login failed')
        return
      }

      if (data.success && data.user) {
        setUser({
          authId: data.user.auth_id,
          organizerId: data.user.organizer_id,
          email: data.user.email
        })
        
        // Set studio data if available
        if (data.user.studioData) {
          setStudioData(data.user.studioData)
        }

        // Check if password reset is required
        if (data.requiresPasswordReset) {
          setRequiresPasswordReset(true)
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setLoginError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/studio-auth/logout', {
        method: 'POST',
      })
      
      setUser(null)
      setStudioData(null)
      setRequiresPasswordReset(false)
      setLoginForm({ email: '', password: '' })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (isLoading) {
    return (
      <section className="relative min-h-screen bg-gradient-to-b from-[#F9E3E0] via-[#FFFFFF] to-[#F9E3E0] px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-25 overflow-hidden flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-[-8px_2px_5px_0px] shadow-pink-100 p-8 sm:p-10 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BF608F] mx-auto mb-4"></div>
          <p className="font-arsenal text-gray-700">Loading...</p>
        </div>
      </section>
    )
  }

  // Show password reset screen if required
  if (requiresPasswordReset) {
    return <PasswordResetRequired user={user!} onComplete={() => setRequiresPasswordReset(false)} />
  }

  if (!user) {
    return (
      <section className="relative min-h-screen bg-gradient-to-b from-[#F9E3E0] via-[#FFFFFF] to-[#F9E3E0] px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-25 overflow-hidden flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-[-8px_2px_5px_0px] shadow-pink-100 p-8 sm:p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-arsenal font-bold text-black text-3xl sm:text-4xl mb-4">
              Studio Portal
            </h1>
            <p className="font-arsenal text-gray-700 text-base">
              Sign in to access your studio dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 transition-colors duration-200 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
                placeholder="studio@example.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 transition-colors duration-200 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>

            {loginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-arsenal text-sm">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full text-white font-arsenal font-bold
                py-4 px-6 rounded-lg
                transform transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
                ${isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#BF608F] to-[#D67BA5] hover:from-[#A5527A] hover:to-[#C26A94] hover:-translate-y-1 hover:shadow-lg'
                }
              `}
            >
              {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => {/* TODO: Implement forgot password */}}
              className="font-arsenal text-sm text-[#BF608F] hover:text-[#A5527A] transition-colors duration-200"
            >
              Forgot your password?
            </button>
          </div>
        </div>
      </section>
    )
  }

  return <StudioDashboard user={user} studioData={studioData} onLogout={handleLogout} setStudioData={setStudioData} />
}

function PasswordResetRequired({ 
  //user, 
  onComplete 
}: { 
  user: StudioAuthUser
  onComplete: () => void 
}) {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match')
      setIsSubmitting(false)
      return
    }

    if (passwords.new.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/studio-auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to change password')
        return
      }

      if (data.success) {
        onComplete()
      }
    } catch (error) {
      console.error('Password change error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-[#F9E3E0] via-[#FFFFFF] to-[#F9E3E0] px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-25 overflow-hidden flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-[-8px_2px_5px_0px] shadow-pink-100 p-8 sm:p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-arsenal font-bold text-black text-3xl sm:text-4xl mb-4">
            Password Reset Required
          </h1>
          <p className="font-arsenal text-gray-700 text-base">
            Please change your default password to continue
          </p>
        </div>

        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div>
            <label htmlFor="current" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
              Current Password
            </label>
            <input
              type="password"
              id="current"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 transition-colors duration-200 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
              value={passwords.current}
              onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="new" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
              New Password
            </label>
            <input
              type="password"
              id="new"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 transition-colors duration-200 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
              value={passwords.new}
              onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirm"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 transition-colors duration-200 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
              value={passwords.confirm}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-arsenal text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full text-white font-arsenal font-bold
              py-4 px-6 rounded-lg
              transform transition-all duration-200 ease-out
              focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
              ${isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#BF608F] to-[#D67BA5] hover:from-[#A5527A] hover:to-[#C26A94] hover:-translate-y-1 hover:shadow-lg'
              }
            `}
          >
            {isSubmitting ? 'UPDATING PASSWORD...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </section>
  )
}

function StudioDashboard({ 
  user, 
  studioData, 
  onLogout,
  setStudioData
}: StudioDashboardProps & { setStudioData: React.Dispatch<React.SetStateAction<StudioData | null>> }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    fetchReferralStats()
  }, [user.organizerId])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/studio-auth/dashboard')
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReferralStats = async () => {
    try {
      const response = await fetch('/api/studio-auth/referral-stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch referral stats')
      }

      const data = await response.json()
      setReferralStats(data)
    } catch (error) {
      console.error('Error fetching referral stats:', error)
    }
  }

  const generateReferralCode = async () => {
    setIsGeneratingCode(true)
    try {
      const response = await fetch('/api/studio-auth/generate-referral-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate referral code')
      }

      const data = await response.json()
      if (data.referralCode && studioData) {
        setStudioData({ ...studioData, referral_code: data.referralCode })
      }
    } catch (error) {
      console.error('Error generating referral code:', error)
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const copyReferralCode = () => {
    if (studioData?.referral_code) {
      navigator.clipboard.writeText(studioData.referral_code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <section className="relative min-h-screen bg-gradient-to-b from-[#F9E3E0] via-[#FFFFFF] to-[#F9E3E0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BF608F]"></div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-[#F9E3E0] via-[#FFFFFF] to-[#F9E3E0]">
      {/* Header */}
      <header className="bg-white border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="font-arsenal font-bold text-black text-xl">Studio Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-arsenal text-gray-700">Welcome, {studioData?.name || user.email}</span>
              <button
                onClick={onLogout}
                className="font-arsenal text-sm text-[#BF608F] hover:text-[#A5527A] font-medium transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-pink-100 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'events', label: 'Events' },
              { id: 'payouts', label: 'Payouts' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'referrals', label: 'Referrals' },
              { id: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-arsenal font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#BF608F] text-[#BF608F]'
                    : 'border-transparent text-gray-700 hover:text-[#BF608F] hover:border-pink-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-lg mb-2">Current Balance</h3>
                <p className="font-arsenal text-3xl font-bold text-green-600">
                  ${dashboardData.payouts.currentBalance.toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-lg mb-2">Monthly Bookings</h3>
                <p className="font-arsenal text-3xl font-bold text-[#BF608F]">
                  {dashboardData.analytics.monthlyBookings}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-lg mb-2">Active Events</h3>
                <p className="font-arsenal text-3xl font-bold text-[#D67BA5]">
                  {dashboardData.analytics.activeEvents}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-lg mb-2">Total Referrals</h3>
                <p className="font-arsenal text-3xl font-bold text-purple-600">
                  {referralStats?.totalReferrals || 0}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
              <h3 className="font-arsenal font-bold text-black text-xl mb-6">Upcoming Events</h3>
              <div className="space-y-4">
                {dashboardData.events
                  .filter(event => event.status === 'upcoming')
                  .slice(0, 5)
                  .map((event) => (
                    <div key={event.eventId} className="flex justify-between items-center py-3 border-b border-pink-100">
                      <div>
                        <span className="font-arsenal text-gray-900 font-medium">{event.title}</span>
                        <p className="font-arsenal text-sm text-gray-500">{formatDate(event.startTime)}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-arsenal text-sm font-bold text-[#BF608F]">
                          {event.totalRegistrations} registered
                        </span>
                        {event.capacity && (
                          <p className="font-arsenal text-xs text-gray-500">
                            of {event.capacity} capacity
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && dashboardData && (
          <div className="space-y-8">
            {selectedEvent ? (
              // Event Details View
              <div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="mb-4 font-arsenal text-[#BF608F] hover:text-[#A5527A] transition-colors duration-200"
                >
                  ← Back to Events
                </button>
                
                <div className="bg-white rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100 overflow-hidden">
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="font-arsenal font-bold text-black text-2xl mb-2">{selectedEvent.title}</h2>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedEvent.status)}`}>
                          {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                        </span>
                      </div>
                      <p className="font-arsenal text-2xl font-bold text-green-600">${selectedEvent.price}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h4 className="font-arsenal font-medium text-gray-700 mb-2">Event Details</h4>
                        <div className="space-y-2">
                          <p className="font-arsenal text-gray-600">
                            <span className="font-medium">Start:</span> {formatDate(selectedEvent.startTime)}
                          </p>
                          <p className="font-arsenal text-gray-600">
                            <span className="font-medium">End:</span> {formatDate(selectedEvent.endTime)}
                          </p>
                          <p className="font-arsenal text-gray-600">
                            <span className="font-medium">Location:</span> {selectedEvent.location}
                          </p>
                          <p className="font-arsenal text-gray-600">
                            <span className="font-medium">Capacity:</span> {selectedEvent.capacity || 'Unlimited'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-arsenal font-medium text-gray-700 mb-2">Description</h4>
                        <p className="font-arsenal text-gray-600 text-sm">{selectedEvent.description}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-arsenal font-bold text-black text-xl mb-4">
                        Registered Attendees ({selectedEvent.totalRegistrations})
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-pink-100">
                              <th className="text-left font-arsenal font-medium text-gray-700 py-3 px-4">Name</th>
                              <th className="text-left font-arsenal font-medium text-gray-700 py-3 px-4">Email</th>
                              <th className="text-left font-arsenal font-medium text-gray-700 py-3 px-4">Status</th>
                              <th className="text-left font-arsenal font-medium text-gray-700 py-3 px-4">Registered</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedEvent.registrations.map((registration) => (
                              <tr key={registration.registrationId} className="border-b border-pink-50">
                                <td className="font-arsenal text-gray-900 py-3 px-4">
                                  {registration.user?.fullName || 'N/A'}
                                </td>
                                <td className="font-arsenal text-gray-600 py-3 px-4">
                                  {registration.user?.email || 'N/A'}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                    registration.status === 'confirmed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {registration.status}
                                  </span>
                                </td>
                                <td className="font-arsenal text-gray-600 text-sm py-3 px-4">
                                  {new Date(registration.registeredAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Events List View
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dashboardData.events.map((event) => (
                  <div 
                    key={event.eventId} 
                    className="bg-white p-6 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100 cursor-pointer hover:shadow-[-6px_3px_10px_0px] transition-shadow duration-200"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-arsenal font-bold text-black text-lg">{event.title}</h4>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(event.status)}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="font-arsenal text-gray-600 text-sm">
                        <span className="font-medium">Start:</span> {formatDate(event.startTime)}
                      </p>
                      <p className="font-arsenal text-gray-600 text-sm">
                        <span className="font-medium">Location:</span> {event.location}
                      </p>
                      <p className="font-arsenal text-gray-600 text-sm">
                        <span className="font-medium">Price:</span> ${event.price}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-pink-100">
                      <span className="font-arsenal text-sm font-bold text-[#BF608F]">
                        {event.totalRegistrations} registered
                      </span>
                      {event.capacity && (
                        <span className="font-arsenal text-sm text-gray-500">
                          Capacity: {event.capacity}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && dashboardData && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-lg mb-2">Available Balance</h3>
                <p className="font-arsenal text-3xl font-bold text-green-600 mb-4">
                  ${dashboardData.payouts.currentBalance.toFixed(2)}
                </p>
                {/* <button className="w-full bg-gradient-to-r from-[#BF608F] to-[#D67BA5] hover:from-[#A5527A] hover:to-[#C26A94] text-white font-arsenal font-bold px-4 py-3 rounded-lg transform transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
                  Request Payout
                </button> */}
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-lg mb-2">Pending Payouts</h3>
                <p className="font-arsenal text-3xl font-bold text-yellow-600 mb-2">
                  ${dashboardData.payouts.pendingPayouts.toFixed(2)}
                </p>
                <p className="font-arsenal text-sm text-gray-600">Processing time: 3-5 business days</p>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-lg mb-2">Total Earnings</h3>
                <p className="font-arsenal text-3xl font-bold text-[#BF608F] mb-2">
                  ${dashboardData.payouts.totalEarnings.toFixed(2)}
                </p>
                <p className="font-arsenal text-sm text-gray-600">All time</p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && dashboardData && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-lg mb-2">Total Bookings</h3>
                <p className="font-arsenal text-3xl font-bold text-[#BF608F]">{dashboardData.analytics.totalBookings}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-lg mb-2">Completed Events</h3>
                <p className="font-arsenal text-3xl font-bold text-[#D67BA5]">{dashboardData.analytics.completedEvents}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-lg mb-2">Active Events</h3>
                <p className="font-arsenal text-3xl font-bold text-green-600">{dashboardData.analytics.activeEvents}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-xl mb-6">Popular Events</h3>
                <div className="space-y-4">
                  {dashboardData.analytics.popularEvents.map((event, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-pink-50">
                      <div>
                        <span className="font-arsenal text-gray-700">{event.title}</span>
                        <p className="font-arsenal text-xs text-gray-500">
                          {new Date(event.startTime).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-arsenal font-bold text-black">{event.bookings} bookings</span>
                        <p className="font-arsenal text-xs text-gray-500">${event.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-xl mb-6">Revenue Breakdown</h3>
                <div className="space-y-4">
                  {dashboardData.analytics.monthlyRevenue.map((month, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-pink-50">
                      <span className="font-arsenal text-gray-700">{month.month}</span>
                      <span className="font-arsenal font-bold text-black">${month.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-pink-100">
                  <div className="flex justify-between items-center">
                    <span className="font-arsenal font-bold text-gray-700">Total Revenue</span>
                    <span className="font-arsenal font-bold text-xl text-[#BF608F]">
                      ${dashboardData.analytics.totalRevenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div className="space-y-8">
            {/* Referral Code Section */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
              <h3 className="font-arsenal font-bold text-black text-xl mb-6">Your Referral Code</h3>
              
              {studioData?.referral_code ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="font-arsenal text-sm text-gray-600 mb-1">Share this code with new users</p>
                      <p className="font-arsenal text-2xl font-bold text-[#BF608F]">{studioData.referral_code}</p>
                    </div>
                    <button
                      onClick={copyReferralCode}
                      className="px-6 py-3 bg-gradient-to-r from-[#BF608F] to-[#D67BA5] hover:from-[#A5527A] hover:to-[#C26A94] text-white font-arsenal font-bold rounded-lg transform transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
                    >
                      {copiedCode ? 'COPIED!' : 'COPY CODE'}
                    </button>
                  </div>
                  
                  <p className="font-arsenal text-sm text-gray-600">
                    Earn 1 month of premium for each user who signs up with your referral code and completes their first booking.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="font-arsenal text-gray-600 mb-4">You don&apos;t have a referral code yet.</p>
                  <button
                    onClick={generateReferralCode}
                    disabled={isGeneratingCode}
                    className={`px-6 py-3 font-arsenal font-bold rounded-lg transform transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
                      isGeneratingCode 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-gradient-to-r from-[#BF608F] to-[#D67BA5] hover:from-[#A5527A] hover:to-[#C26A94] text-white hover:-translate-y-1 hover:shadow-lg'
                    }`}
                  >
                    {isGeneratingCode ? 'GENERATING...' : 'GENERATE REFERRAL CODE'}
                  </button>
                </div>
              )}
            </div>

            {/* Referral Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-lg mb-2">Total Referrals</h3>
                <p className="font-arsenal text-3xl font-bold text-[#BF608F]">{referralStats?.totalReferrals || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-lg mb-2">Pending</h3>
                <p className="font-arsenal text-3xl font-bold text-yellow-600">{referralStats?.pendingReferrals || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-lg mb-2">Completed</h3>
                <p className="font-arsenal text-3xl font-bold text-green-600">{referralStats?.completedReferrals || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-lg mb-2">Months Earned</h3>
                <p className="font-arsenal text-3xl font-bold text-purple-600">{referralStats?.totalMonthsGranted || 0}</p>
              </div>
            </div>

            {/* Referral History */}
            {referralStats && referralStats.referrals.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-xl mb-6">Referral History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-pink-100">
                        <th className="text-left font-arsenal font-medium text-gray-700 py-3 px-4">User</th>
                        <th className="text-left font-arsenal font-medium text-gray-700 py-3 px-4">Email</th>
                        <th className="text-left font-arsenal font-medium text-gray-700 py-3 px-4">Status</th>
                        <th className="text-left font-arsenal font-medium text-gray-700 py-3 px-4">Referred On</th>
                        <th className="text-left font-arsenal font-medium text-gray-700 py-3 px-4">Months Granted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralStats.referrals.map((referral) => (
                        <tr key={referral.referral_tracking_id} className="border-b border-pink-50">
                          <td className="font-arsenal text-gray-900 py-3 px-4">
                            {referral.referredUser?.fullName || 'N/A'}
                          </td>
                          <td className="font-arsenal text-gray-600 py-3 px-4">
                            {referral.referredUser?.email || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              referral.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {referral.status}
                            </span>
                          </td>
                          <td className="font-arsenal text-gray-600 text-sm py-3 px-4">
                            {new Date(referral.created_at).toLocaleDateString()}
                          </td>
                          <td className="font-arsenal text-gray-900 text-center py-3 px-4">
                            {referral.premium_months_granted}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
              <h3 className="font-arsenal font-bold text-black text-xl mb-6">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-arsenal text-gray-700 text-sm font-medium mb-2">Studio Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
                    value={studioData?.name || ''}
                    readOnly
                    placeholder="Studio Name"
                    title="Studio Name"
                  />
                </div>
                <div>
                  <label className="block font-arsenal text-gray-700 text-sm font-medium mb-2">Login Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
                    value={user.email || ''}
                    readOnly
                    placeholder="Login Email"
                    title="Login Email"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block font-arsenal text-gray-700 text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
                  rows={4}
                  value={studioData?.description || ''}
                  readOnly
                  placeholder="Studio description"
                  title="Studio description"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
              <h3 className="font-arsenal font-bold text-black text-xl mb-6">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-arsenal text-gray-700 text-sm font-medium mb-2">Contact Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
                    value={studioData?.contact_email || ''}
                    readOnly
                    placeholder="Contact Email"
                    title="Contact Email"
                  />
                </div>
                <div>
                  <label className="block font-arsenal text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
                    value={studioData?.phone || ''}
                    readOnly
                    placeholder="Phone Number"
                    title="Phone Number"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block font-arsenal text-gray-700 text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
                  value={studioData?.address || ''}
                  readOnly
                  placeholder="Studio Address"
                  title="Studio Address"
                />
              </div>
              <div className="mt-6">
                <label className="block font-arsenal text-gray-700 text-sm font-medium mb-2">Website</label>
                <input
                  type="url"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
                  value={studioData?.website_url || ''}
                  readOnly
                  placeholder="Website URL"
                  title="Website URL"
                />
              </div>
            </div>

            {/* Business Hours */}
            {studioData?.business_hours && Object.keys(studioData.business_hours).length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-xl mb-6">Business Hours</h3>
                <div className="space-y-3">
                  {Object.entries(studioData.business_hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center py-2 border-b border-pink-50">
                      <span className="font-arsenal text-gray-700 capitalize">{day}</span>
                      <span className="font-arsenal text-gray-900">{hours as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media Links */}
            {studioData?.social_media_links && Object.keys(studioData.social_media_links).length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
                <h3 className="font-arsenal font-bold text-black text-xl mb-6">Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(studioData.social_media_links).map(([platform, url]) => (
                    <div key={platform} className="flex items-center space-x-3">
                      <span className="font-arsenal text-gray-700 capitalize min-w-[100px]">{platform}:</span>
                      <a 
                        href={url as string} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-arsenal text-[#BF608F] hover:text-[#A5527A] transition-colors duration-200 truncate"
                      >
                        {url as string}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Information */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[-4px_2px_8px_0px] shadow-pink-100">
              <h3 className="font-arsenal font-bold text-black text-xl mb-6">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-pink-100">
                  <span className="font-arsenal text-gray-700">Organizer ID</span>
                  <span className="font-arsenal text-gray-900 font-mono text-sm">{user.organizerId}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-pink-100">
                  <span className="font-arsenal text-gray-700">Account Created</span>
                  <span className="font-arsenal text-gray-900">
                    {studioData?.created_at ? new Date(studioData.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-arsenal text-gray-700">Password</span>
                  <button 
                    className="font-arsenal text-sm text-[#BF608F] hover:text-[#A5527A] font-medium transition-colors duration-200"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}