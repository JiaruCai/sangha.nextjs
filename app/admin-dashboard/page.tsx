// app/admin-dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: string
  email: string
  role: string
}

interface StudioOverview {
  organizer_id: string
  name: string
  email: string
  created_at: string
  total_events: number
  active_events: number
  total_revenue: number
  total_bookings: number
  revenue_in_period: number
  bookings_in_period: number
  referral_code: string | null
  referrals_generated: number
}

interface UserStats {
  total_users: number
  new_users_today: number
  new_users_week: number
  new_users_month: number
  new_users_in_period: number
  active_subscribers: number
  trial_users: number
  referred_users: number
  referred_users_in_period: number
}

interface SubscriptionStats {
  total_active: number
  monthly_subscribers: number
  yearly_subscribers: number
  trial_subscribers: number
  new_subscribers_in_period: number
  monthly_revenue: number
  yearly_revenue: number
  total_mrr: number
  churn_rate: number
}

interface ReferralStats {
  total_referrals: number
  completed_referrals: number
  pending_referrals: number
  studio_referrals: number
  user_referrals: number
  referrals_in_period: number
  completed_in_period: number
  top_referrers: Array<{
    referrer_name: string
    referrer_type: 'user' | 'studio'
    referral_count: number
    completed_count: number
  }>
}

interface RecentUser {
  user_id: string
  full_name: string | null
  email: string | null
  created_at: string
  subscription_status: string | null
  referral_source: string | null
  referrer_name: string | null
}

interface Pagination {
  page: number
  pageSize: number
  totalUsers: number
  totalPages: number
}

interface DateFilterInfo {
  filter: string
  startDate: string | null
  endDate: string
}

interface DashboardData {
  studios: StudioOverview[]
  userStats: UserStats
  subscriptionStats: SubscriptionStats
  referralStats: ReferralStats
  recentUsers: RecentUser[]
  pagination: Pagination
  dateFilter: DateFilterInfo
}

export default function AdminDashboard() {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  type TabId = 'overview' | 'studios' | 'users' | 'subscriptions' | 'referrals'
  const [selectedView, setSelectedView] = useState<TabId>('overview')
  const [dateFilter, setDateFilter] = useState('7days')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(100)

  useEffect(() => {
    checkAdminAuth()
    fetchDashboardData()
  }, [dateFilter, currentPage])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin/verify')
      const data = await response.json()

      if (!data.authenticated || data.user?.role !== 'admin') {
        router.push('/admin-login')
        return
      }

      setAdminUser(data.user)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin-login')
    }
  }

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(
        `/api/admin/dashboard?dateFilter=${dateFilter}&page=${currentPage}&pageSize=${pageSize}`
      )
      
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

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin-login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getFilteredStudios = () => {
    if (!dashboardData) return []
    return dashboardData.studios.filter(studio => 
      studio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studio.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getFilteredUsers = () => {
    if (!dashboardData) return []
    return dashboardData.recentUsers.filter(user => 
      (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    )
  }

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case '24hours': return 'Last 24 Hours'
      case '7days': return 'Last 7 Days'
      case '30days': return 'Last 30 Days'
      case '90days': return 'Last 90 Days'
      case 'all': return 'All Time'
      default: return 'Last 7 Days'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BF608F]"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Failed to load dashboard data</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Familia Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{adminUser?.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-[#BF608F] hover:text-[#A5527A] font-medium"
              >
                Sign Out
              </button>
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
              { id: 'studios', label: 'Studios' },
              { id: 'users', label: 'Users' },
              { id: 'subscriptions', label: 'Subscriptions' },
              { id: 'referrals', label: 'Referrals' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedView(tab.id as TabId)
                  setCurrentPage(1) // Reset pagination when changing tabs
                }}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedView === tab.id
                    ? 'border-[#BF608F] text-[#BF608F]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Date Filter */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-2">
            {[
              { value: '24hours', label: 'Last 24 Hours' },
              { value: '7days', label: 'Last 7 Days' },
              { value: '30days', label: 'Last 30 Days' },
              { value: '90days', label: 'Last 90 Days' },
              { value: 'all', label: 'All Time' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setDateFilter(filter.value)
                  setCurrentPage(1) // Reset pagination when changing date filter
                }}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                  dateFilter === filter.value
                    ? 'bg-[#BF608F] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input for Studios and Users */}
        {(selectedView === 'studios' || selectedView === 'users') && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Overview Tab */}
        {selectedView === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.userStats.total_users}</p>
                <p className="text-sm text-green-600 mt-2">
                  +{dashboardData.userStats.new_users_in_period} {dateFilter === 'all' ? 'total' : 'in period'}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Active Subscribers</h3>
                <p className="text-3xl font-bold text-[#BF608F]">{dashboardData.subscriptionStats.total_active}</p>
                <p className="text-sm text-gray-600 mt-2">
                  +{dashboardData.subscriptionStats.new_subscribers_in_period} new {dateFilter === 'all' ? 'total' : 'in period'}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Monthly Recurring Revenue</h3>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(dashboardData.subscriptionStats.total_mrr)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {dashboardData.subscriptionStats.churn_rate.toFixed(1)}% churn rate
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Referrals</h3>
                <p className="text-3xl font-bold text-[#D67BA5]">{dashboardData.referralStats.total_referrals}</p>
                <p className="text-sm text-gray-600 mt-2">
                  +{dashboardData.referralStats.referrals_in_period} {dateFilter === 'all' ? 'total' : 'in period'}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {dashboardData.recentUsers.slice(0, 5).map((user) => (
                    <div key={user.user_id} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || 'No name'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        {user.referral_source && (
                          <p className="text-xs text-[#BF608F]">
                            via {user.referrer_name || user.referral_source}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Studios */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Studios by Revenue ({getDateFilterLabel()})
                </h3>
                <div className="space-y-3">
                  {dashboardData.studios
                    .sort((a, b) => b.revenue_in_period - a.revenue_in_period)
                    .slice(0, 5)
                    .map((studio) => (
                      <div key={studio.organizer_id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium text-gray-900">{studio.name}</p>
                          <p className="text-sm text-gray-500">{studio.bookings_in_period} bookings in period</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(studio.revenue_in_period)}
                          </p>
                          <p className="text-xs text-gray-500">{studio.active_events} active events</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Studios Tab */}
        {selectedView === 'studios' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Studios Performance - {getDateFilterLabel()}
              </h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Studio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue (Period)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings (Period)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredStudios().map((studio) => (
                  <tr key={studio.organizer_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{studio.name}</div>
                        {studio.referral_code && (
                          <div className="text-xs text-gray-500">Code: {studio.referral_code}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {studio.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {studio.total_events} total
                      </div>
                      <div className="text-sm text-gray-500">
                        {studio.active_events} active
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(studio.revenue_in_period)}
                      </div>
                      {dateFilter !== 'all' && (
                        <div className="text-sm text-gray-500">
                          Total: {formatCurrency(studio.total_revenue)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {studio.bookings_in_period}
                      </div>
                      {dateFilter !== 'all' && (
                        <div className="text-sm text-gray-500">
                          Total: {studio.total_bookings}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {studio.referrals_generated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(studio.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin-dashboard/studios/${studio.organizer_id}`)}
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

        {/* Users Tab */}
        {selectedView === 'users' && (
          <div className="space-y-6">
            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">New in Period</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.userStats.new_users_in_period}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {getDateFilterLabel()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">New This Week</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.userStats.new_users_week}
                </p>
                <p className="text-xs text-gray-400 mt-1">Fixed time period</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.userStats.total_users}
                </p>
                <p className="text-xs text-gray-400 mt-1">All time</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Referred in Period</h3>
                <p className="text-2xl font-bold text-[#BF608F]">
                  {dashboardData.userStats.referred_users_in_period}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Total: {dashboardData.userStats.referred_users}
                </p>
              </div>
            </div>

            {/* Recent Users Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Users {dateFilter === 'all' ? '(All Time)' : 'in Selected Period'} ({dashboardData.pagination.totalUsers} total)
                </h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referral Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredUsers().map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.full_name || 'No name'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email || 'No email'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.subscription_status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : user.subscription_status === 'trialing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.subscription_status || 'Free'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.referral_source ? (
                          <span className="text-[#BF608F]">
                            {user.referrer_name || user.referral_source}
                          </span>
                        ) : (
                          'Direct'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(dashboardData.pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === dashboardData.pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(currentPage - 1) * pageSize + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, dashboardData.pagination.totalUsers)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{dashboardData.pagination.totalUsers}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        Page {currentPage} of {dashboardData.pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(dashboardData.pagination.totalPages, currentPage + 1))}
                        disabled={currentPage === dashboardData.pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {selectedView === 'subscriptions' && (
          <div className="space-y-8">
            {/* Subscription Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Monthly Subscriptions</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.subscriptionStats.monthly_subscribers}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {formatCurrency(dashboardData.subscriptionStats.monthly_revenue)}/month
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Yearly Subscriptions</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.subscriptionStats.yearly_subscribers}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {formatCurrency(dashboardData.subscriptionStats.yearly_revenue)}/year
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Trial Users</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboardData.subscriptionStats.trial_subscribers}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Potential MRR: {formatCurrency(dashboardData.subscriptionStats.trial_subscribers * 9.99)}
                </p>
              </div>
            </div>

            {/* Period Statistics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Subscription Activity - {getDateFilterLabel()}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500">New Subscriptions</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{dashboardData.subscriptionStats.new_subscribers_in_period}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.userStats.new_users_in_period > 0 
                      ? ((dashboardData.subscriptionStats.new_subscribers_in_period / dashboardData.userStats.new_users_in_period) * 100).toFixed(1)
                      : '0.0'}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Churn Rate</p>
                  <p className="text-2xl font-bold text-red-600">
                    {dashboardData.subscriptionStats.churn_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Revenue Chart Placeholder */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Chart placeholder - integrate with your preferred charting library
              </div>
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {selectedView === 'referrals' && (
          <div className="space-y-8">
            {/* Referral Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Referrals</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.referralStats.total_referrals}
                </p>
                <p className="text-xs text-gray-400 mt-1">All time</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Referrals in Period</h3>
                <p className="text-2xl font-bold text-[#BF608F]">
                  {dashboardData.referralStats.referrals_in_period}
                </p>
                <p className="text-xs text-gray-400 mt-1">{getDateFilterLabel()}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Completed</h3>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.referralStats.completed_referrals}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {dashboardData.referralStats.total_referrals > 0
                    ? ((dashboardData.referralStats.completed_referrals / dashboardData.referralStats.total_referrals) * 100).toFixed(1)
                    : '0.0'}% conversion
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">By Type</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Studios: {dashboardData.referralStats.studio_referrals}
                  </p>
                  <p className="text-sm text-gray-600">
                    Users: {dashboardData.referralStats.user_referrals}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Referrers */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Referrers (All Time)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referrer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Referrals
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conversion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.referralStats.top_referrers.map((referrer, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {referrer.referrer_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            referrer.referrer_type === 'studio'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {referrer.referrer_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {referrer.referral_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {referrer.completed_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {((referrer.completed_count / referrer.referral_count) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}