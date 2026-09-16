import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { assets, dashboardDummyData } from '../../assets/assets'
import { getAnalytics, getBookings, getFeedbacks, getRooms } from '../../lib/api.js'

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalBookings: dashboardDummyData.totalBookings,
    totalRevenue: dashboardDummyData.totalRevenue,
    totalUsers: 18,
    activeUsers: 6,
    avgRating: 4.9,
    totalFeedbacks: 12,
    bookings: dashboardDummyData.bookings,
    feedbacks: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadData = () => {
    Promise.allSettled([getBookings(), getRooms(), getAnalytics(), getFeedbacks()])
      .then(([bookingsRes, roomsRes, analyticsRes, feedbacksRes]) => {
        const liveBookings = bookingsRes.status === 'fulfilled' && bookingsRes.value?.length ? bookingsRes.value : null
        const analytics = analyticsRes.status === 'fulfilled' ? analyticsRes.value : null
        const liveFeedbacks = feedbacksRes.status === 'fulfilled' && feedbacksRes.value ? feedbacksRes.value : []

        const totalRevenue = liveBookings
          ? liveBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0)
          : (analytics?.total_revenue || dashboardDummyData.totalRevenue)

        setMetrics({
          totalBookings: liveBookings ? liveBookings.length : (analytics?.total_bookings || dashboardDummyData.totalBookings),
          totalRevenue,
          totalUsers: analytics?.total_users || 18,
          activeUsers: analytics?.active_users || 6,
          avgRating: analytics?.average_rating || 4.9,
          totalFeedbacks: liveFeedbacks.length || analytics?.total_feedbacks || 4,
          bookings: liveBookings ? liveBookings.slice(0, 8) : dashboardDummyData.bookings,
          feedbacks: liveFeedbacks.slice(0, 5),
        })
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Title
          align="left"
          font="outfit"
          title="Dashboard & Analytics"
          subTitle="Monitor room listings, track reservations, revenue, active user engagement, and customer reviews in real time."
        />
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="rounded-lg bg-indigo-50 p-3.5">
            <img src={assets.totalBookingIcon} alt="Total bookings" className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalBookings}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="rounded-lg bg-emerald-50 p-3.5">
            <img src={assets.totalRevenueIcon} alt="Total revenue" className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-15 w-15 items-center justify-center rounded-lg bg-blue-50 text-2xl text-blue-600">
            👥
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active / Registered</p>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.activeUsers} <span className="text-xs font-normal text-gray-500">/ {metrics.totalUsers} users</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-15 w-15 items-center justify-center rounded-lg bg-amber-50 text-2xl text-amber-500">
            ★
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest Feedback</p>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.avgRating}★ <span className="text-xs font-normal text-gray-500">({metrics.totalFeedbacks} reviews)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">Recent Bookings</h2>
        <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-600">Guest Name</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-600 max-sm:hidden">Hotel &amp; Room</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">Payment</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-sm">
              {metrics.bookings.map((item, index) => {
                const guestName = item.guest_name || item.user?.username || 'Guest'
                const hotelName = item.hotel?.name || item.room?.hotel?.name || ''
                const roomType = item.room?.roomType || item.room?.room_type || 'Standard Room'
                const amount = item.totalPrice || item.total_price || 0
                const isPaid = item.isPaid || item.status === 'confirmed'
                const paymentMethod = item.payment_method || item.paymentMethod || 'Online'

                return (
                  <tr key={item.id || item._id || index} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {guestName}
                      {item.guest_email && <p className="text-xs text-gray-500">{item.guest_email}</p>}
                    </td>
                    <td className="px-5 py-4 text-gray-600 max-sm:hidden">
                      <p className="font-medium text-gray-800">{hotelName}</p>
                      <p className="text-xs text-gray-500">{roomType}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-semibold text-gray-900">${amount}</span>
                      <p className="text-[11px] text-gray-500">{paymentMethod}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

