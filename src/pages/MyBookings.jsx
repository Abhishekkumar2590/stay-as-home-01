import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { assets } from '../assets/assets.js'
import Title from '../components/Title.jsx'
import PaymentModal from '../components/PaymentModal.jsx'
import { cancelBooking, getBookingsByEmail, payBooking } from '../lib/api.js'

const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const LocationIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-gray-500">
    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
)

const GuestsIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-gray-500">
    <circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 8a3 3 0 0 1 0 6m.5 1.5a5 5 0 0 1 4 3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </svg>
)

const MyBookings = () => {
  const { isSignedIn, user } = useUser()
  const [bookings, setBookings] = useState([])
  const [loadError, setLoadError] = useState('')
  const [activePaymentBooking, setActivePaymentBooking] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress
    if (!isSignedIn || !email) return undefined

    const refreshBookings = () => {
      getBookingsByEmail(email).then(setBookings).catch((error) => setLoadError(error.message))
    }

    refreshBookings()
    window.addEventListener('bookings-updated', refreshBookings)
    return () => window.removeEventListener('bookings-updated', refreshBookings)
  }, [isSignedIn, user])

  const handlePayNow = (booking) => {
    setActivePaymentBooking(booking)
  }

  const handleConfirmPay = async ({ paymentMethod }) => {
    if (!activePaymentBooking) return
    setIsProcessing(true)
    try {
      const updated = await payBooking(activePaymentBooking.id || activePaymentBooking._id, paymentMethod)
      setBookings((prev) =>
        prev.map((b) => ((b.id || b._id) === (activePaymentBooking.id || activePaymentBooking._id) ? updated : b))
      )
      return updated
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    try {
      await cancelBooking(bookingId)
      setBookings((prev) =>
        prev.map((b) => ((b.id || b._id) === bookingId ? { ...b, status: 'cancelled', isPaid: false } : b))
      )
    } catch (err) {
      alert(err.message || 'Failed to cancel booking')
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <PaymentModal
        isOpen={Boolean(activePaymentBooking)}
        onClose={() => setActivePaymentBooking(null)}
        bookingDetails={
          activePaymentBooking
            ? {
                id: activePaymentBooking.id || activePaymentBooking._id,
                guestName: activePaymentBooking.guest_name || activePaymentBooking.guestName || user?.fullName || user?.firstName || 'Guest',
                guestEmail: activePaymentBooking.guest_email || activePaymentBooking.guestEmail || user?.primaryEmailAddress?.emailAddress || '',
                hotelName: activePaymentBooking.hotel?.name || 'Hotel Stay',
                roomType: activePaymentBooking.room?.roomType || activePaymentBooking.room?.room_type || 'Standard Room',
                checkIn: activePaymentBooking.checkInDate || activePaymentBooking.check_in,
                checkOut: activePaymentBooking.checkOutDate || activePaymentBooking.check_out,
                nights: Math.max(
                  1,
                  Math.ceil(
                    (new Date(activePaymentBooking.checkOutDate || activePaymentBooking.check_out) -
                      new Date(activePaymentBooking.checkInDate || activePaymentBooking.check_in)) /
                      (1000 * 60 * 60 * 24)
                  ) || 1
                ),
                guests: activePaymentBooking.guests || 1,
                pricePerNight: activePaymentBooking.room?.pricePerNight || activePaymentBooking.room?.price_per_night || 0,
                totalPrice: activePaymentBooking.totalPrice || activePaymentBooking.total_price || 0,
              }
            : null
        }

        onConfirmPayment={handleConfirmPay}
        isProcessing={isProcessing}
      />

      <Title
        title="My Bookings"
        subTitle="Easily manage your past, current, and upcoming hotel reservations in one place. Plan your trips seamlessly with just a few clicks"
        align="left"
      />

      <div className="mt-14 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {!isSignedIn && <p className="p-8 text-center text-gray-500">Please sign in to view your bookings.</p>}
        {loadError && <p className="p-8 text-center text-red-600">{loadError}</p>}
        <div className="hidden grid-cols-[1.45fr_1fr_0.7fr] border-b border-gray-200 bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-700 md:grid lg:px-8">
          <p>Hotel &amp; Room</p>
          <p>Dates &amp; Stay</p>
          <p>Status &amp; Action</p>
        </div>

        <div>
          {bookings.map((booking) => {
            const isPaid = booking.isPaid
            const isCancelled = booking.status === 'cancelled'
            const bookingId = booking.id || booking._id
            const hotelName = booking.hotel?.name || 'Hotel'
            const roomType = booking.room?.roomType || 'Room'
            const address = booking.hotel?.address || booking.hotel?.city || ''
            const roomImage = booking.room?.images?.[0] || assets.roomImg1

            return (
              <article
                key={bookingId}
                className="grid gap-6 border-b border-gray-200 px-4 py-7 last:border-b-0 md:grid-cols-[1.45fr_1fr_0.7fr] md:items-center md:px-6 lg:px-8 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex gap-5">
                  <img
                    src={roomImage}
                    alt={`${hotelName} ${roomType}`}
                    className="h-32 w-40 shrink-0 rounded-lg object-cover sm:h-36 sm:w-48 shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = assets.roomImg1
                    }}
                  />
                  <div className="min-w-0 space-y-2">
                    <h2 className="font-playfair text-2xl leading-tight text-gray-900 font-bold">
                      {hotelName}{' '}
                      <span className="font-inter text-sm font-normal text-gray-500">({roomType})</span>
                    </h2>
                    {address && (
                      <p className="flex items-start gap-2 text-sm text-gray-500">
                        <LocationIcon />
                        <span>{address}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-2 text-sm text-gray-500">
                      <GuestsIcon />
                      <span>Guests: {booking.guests}</span>
                    </p>
                    <p className="pt-1 text-base font-bold text-gray-900">
                      Total: ${booking.totalPrice}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-gray-800 text-sm">
                  <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Check-In</p>
                    <p className="mt-1 font-medium">{formatDate(booking.checkInDate)}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Check-Out</p>
                    <p className="mt-1 font-medium">{formatDate(booking.checkOutDate)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-start md:justify-center">
                  <div className="flex flex-col items-start md:items-center gap-3">
                    <p className={`flex items-center gap-2 font-semibold text-sm ${isCancelled ? 'text-gray-400' : isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${isCancelled ? 'bg-gray-400' : isPaid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      {isCancelled ? 'Cancelled' : isPaid ? 'Confirmed & Paid' : 'Payment Pending'}
                    </p>
                    {!isPaid && !isCancelled && (
                      <button
                        type="button"
                        onClick={() => handlePayNow(booking)}
                        className="rounded-lg bg-orange-500 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition cursor-pointer"
                      >
                        Pay Now
                      </button>
                    )}
                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => handleCancel(bookingId)}
                        className="text-xs text-gray-400 hover:text-red-600 underline transition-colors cursor-pointer"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
          {isSignedIn && bookings.length === 0 && (
            <div className="py-16 text-center text-gray-500">
              <p className="text-lg">No reservations found.</p>
              <a href="/rooms" className="mt-3 inline-block rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-black transition-colors">
                Explore Hotels &amp; Rooms
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default MyBookings
