// app/admin-dashboard/studios/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface StudioDetails {
  organizer_id: string
  name: string
  description: string
  email: string
  contact_email: string | null
  phone: string | null
  address: string | null
  website_url: string | null
  referral_code: string | null
  created_at: string
  updated_at: string
  auth_status: {
    last_login: string | null
    login_attempts: number
    is_active: boolean
    default_password: boolean
  }
}

interface EventDetails {
  event_id: string
  title: string
  description: string
  start_time: string
  end_time: string
  location: string
  price: number
  capacity: number | null
  is_active: boolean
  created_at: string
  registration_count: number
  total_revenue: number
  attendee_list: Array<{
    user_name: string | null
    user_email: string | null
    registration_status: string
    payment_amount: number
    registered_at: string
  }>
}

interface ReferralDetails {
  referral_id: string
  referred_user_name: string | null
  referred_user_email: string | null
  status: string
  created_at: string
  completed_at: string | null
  first_booking_date: string | null
}

interface FinancialSummary {
  total_revenue: number
  total_bookings: number
  average_booking_value: number
  revenue_by_month: Array<{
    month: string
    revenue: number
    bookings: number
  }>
  pending_payouts: number
  completed_payouts: number
}

interface StudioDetailData {
  studio: StudioDetails
  events: EventDetails[]
  referrals: ReferralDetails[]
  financial: FinancialSummary
}

export default function StudioDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const studioId = params?.id as string
  
  const [studioData, setStudioData] = useState<StudioDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  type TabId = 'overview' | 'events' | 'referrals' | 'financial' | 'settings'
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null)

  useEffect(() => {
    fetchStudioDetails()
  }, [studioId])

  const fetchStudioDetails = async () => {
    try {
      const response = await fetch(`/api/admin/studios/${studioId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch studio details')
      }

      const data = await response.json()
      setStudioData(data)
    } catch (error) {
      console.error('Error fetching studio details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!confirm('Are you sure you want to reset this studio\'s password?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/studios/${studioId}/reset-password`, {
        method: 'POST'
      })

      if (response.ok) {
        alert('Password has been reset. The studio will be required to change it on next login.')
        fetchStudioDetails()
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Failed to reset password')
    }
  }

  const handleToggleActive = async () => {
    if (!confirm(`Are you sure you want to ${studioData?.studio.auth_status.is_active ? 'deactivate' : 'activate'} this studio?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/studios/${studioId}/toggle-active`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchStudioDetails()
      }
    } catch (error) {
      console.error('Error toggling studio status:', error)
      alert('Failed to update studio status')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BF608F]"></div>
      </div>
    )
  }

  if (!studioData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Studio not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin-dashboard')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
              <h1 className="text-xl font-bold text-gray-900">{studioData.studio.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                studioData.studio.auth_status.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {studioData.studio.auth_status.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'events', label: 'Events' },
              { id: 'referrals', label: 'Referrals' },
              { id: 'financial', label: 'Financial' },
              { id: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#BF608F] text-[#BF608F]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(studioData.financial.total_revenue)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Bookings</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {studioData.financial.total_bookings}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Active Events</h3>
                <p className="text-2xl font-bold text-[#BF608F]">
                  {studioData.events.filter(e => e.is_active).length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Referrals Generated</h3>
                <p className="text-2xl font-bold text-[#D67BA5]">
                  {studioData.referrals.length}
                </p>
              </div>
            </div>

            {/* Studio Information */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Studio Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-900">{studioData.studio.description || 'No description'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contact Email</p>
                  <p className="text-gray-900">{studioData.studio.contact_email || studioData.studio.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="text-gray-900">{studioData.studio.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="text-gray-900">{studioData.studio.address || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Website</p>
                  {studioData.studio.website_url ? (
                    <a href={studioData.studio.website_url} target="_blank" rel="noopener noreferrer" 
                       className="text-[#BF608F] hover:text-[#A5527A]">
                      {studioData.studio.website_url}
                    </a>
                  ) : (
                    <p className="text-gray-900">Not provided</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Referral Code</p>
                  <p className="text-gray-900 font-mono">{studioData.studio.referral_code || 'Not generated'}</p>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Login</p>
                  <p className="text-gray-900">{formatDate(studioData.studio.auth_status.last_login)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Login Attempts</p>
                  <p className="text-gray-900">{studioData.studio.auth_status.login_attempts}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created</p>
                  <p className="text-gray-900">{formatDate(studioData.studio.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Default Password</p>
                  <p className={`font-semibold ${
                    studioData.studio.auth_status.default_password 
                      ? 'text-yellow-600' 
                      : 'text-green-600'
                  }`}>
                    {studioData.studio.auth_status.default_password ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {selectedEvent ? (
              // Event Details View
              <div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="mb-4 text-gray-500 hover:text-gray-700"
                >
                  ← Back to Events
                </button>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedEvent.title}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <p className="text-gray-900">{selectedEvent.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Event Time</p>
                      <p className="text-gray-900">
                        {formatDate(selectedEvent.start_time)} - {formatDate(selectedEvent.end_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="text-gray-900">{selectedEvent.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Price</p>
                      <p className="text-gray-900 font-semibold">{formatCurrency(selectedEvent.price)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Capacity</p>
                      <p className="text-gray-900">{selectedEvent.capacity || 'Unlimited'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Registrations</p>
                      <p className="text-gray-900">{selectedEvent.registration_count}</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendees</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedEvent.attendee_list.map((attendee, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {attendee.user_name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {attendee.user_email || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                attendee.registration_status === 'confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {attendee.registration_status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(attendee.payment_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(attendee.registered_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              // Events List
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registrations</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studioData.events.map((event) => (
                      <tr key={event.event_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-500">{event.location}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(event.start_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(event.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.registration_count}
                          {event.capacity && ` / ${event.capacity}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(event.total_revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="text-[#BF608F] hover:text-[#A5527A]"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Referrals</h3>
                <p className="text-2xl font-bold text-gray-900">{studioData.referrals.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Completed</h3>
                <p className="text-2xl font-bold text-green-600">
                  {studioData.referrals.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Pending</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {studioData.referrals.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referred On</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Booking</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studioData.referrals.map((referral) => (
                    <tr key={referral.referral_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {referral.referred_user_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {referral.referred_user_email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          referral.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(referral.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(referral.first_booking_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(studioData.financial.total_revenue)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Average Booking Value</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(studioData.financial.average_booking_value)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Payouts</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(studioData.financial.pending_payouts)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Completed Payouts</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(studioData.financial.completed_payouts)}
                </p>
              </div>
            </div>

            {/* Revenue by Month */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Booking</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studioData.financial.revenue_by_month.map((month) => (
                      <tr key={month.month}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {month.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(month.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {month.bookings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(month.revenue / month.bookings || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Actions</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b">
                  <div>
                    <p className="font-medium text-gray-900">Reset Password</p>
                    <p className="text-sm text-gray-500">
                      Force the studio to set a new password on next login
                    </p>
                  </div>
                  <button
                    onClick={handleResetPassword}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Reset Password
                  </button>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-gray-900">Account Status</p>
                    <p className="text-sm text-gray-500">
                      {studioData.studio.auth_status.is_active 
                        ? 'Account is currently active' 
                        : 'Account is currently deactivated'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleActive}
                    className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                      studioData.studio.auth_status.is_active
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {studioData.studio.auth_status.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Login History</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Login</span>
                  <span className="text-gray-900">
                    {formatDate(studioData.studio.auth_status.last_login)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Failed Login Attempts</span>
                  <span className="text-gray-900">
                    {studioData.studio.auth_status.login_attempts}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Account Created</span>
                  <span className="text-gray-900">
                    {formatDate(studioData.studio.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}