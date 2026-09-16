import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const UPI_ID = 'fake.hotelpay@okhdfcbank'
const PAYEE_NAME = 'QuickStay Demo Hotels'


const PaymentModal = ({
  isOpen,
  onClose,
  bookingDetails,
  onConfirmPayment,
  isProcessing = false,
}) => {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [utrNumber, setUtrNumber] = useState('')
  const [senderUpiId, setSenderUpiId] = useState('')
  const [guestName, setGuestName] = useState(bookingDetails?.guestName || '')
  const [guestEmail, setGuestEmail] = useState(bookingDetails?.guestEmail || '')
  const [isSuccess, setIsSuccess] = useState(false)
  const [localProcessing, setLocalProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (bookingDetails) {
      setGuestName(bookingDetails.guestName || '')
      setGuestEmail(bookingDetails.guestEmail || '')
    }
  }, [bookingDetails])

  if (!isOpen || !bookingDetails) return null

  const {
    hotelName = 'Hotel Stay',
    roomType = 'Standard Room',
    checkIn = '',
    checkOut = '',
    nights = 1,
    guests = 1,
    pricePerNight = 0,
    totalPrice = 0,
  } = bookingDetails

  const tax = Math.round(totalPrice * 0.08)
  const finalTotal = totalPrice + tax

  // Dynamic UPI Deep Link
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${finalTotal}&cu=INR&tn=${encodeURIComponent(`Hotel Booking - ${hotelName}`)}`
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiDeepLink)}`

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFillFakeUtr = () => {
    const randomUtr = Math.floor(100000000000 + Math.random() * 900000000000).toString()
    setUtrNumber(`UTR-${randomUtr}`)
  }

  const handleSubmitPayment = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const effectiveEmail = (guestEmail || bookingDetails.guestEmail || 'guest@example.com').trim()
    const effectiveName = (guestName || bookingDetails.guestName || 'Guest User').trim()

    setLocalProcessing(true)

    try {
      // Simulate fast payment verification
      await new Promise((resolve) => setTimeout(resolve, 600))

      const generatedUtr = utrNumber.trim() || `UTR-${Math.floor(100000000000 + Math.random() * 900000000000)}`
      const paymentMethodLabel = `Fake UPI (${UPI_ID}) - ${generatedUtr}`

      await onConfirmPayment({
        paymentMethod: paymentMethodLabel,
        isPaid: true,
        totalAmount: finalTotal,
        guestName: effectiveName,
        guestEmail: effectiveEmail,
        utrNumber: generatedUtr,
      })

      setIsSuccess(true)
      window.dispatchEvent(new CustomEvent('bookings-updated'))
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process payment. Please try again.')
    } finally {
      setLocalProcessing(false)
    }
  }

  const handleFinish = () => {
    setIsSuccess(false)
    onClose()
    navigate('/my-bookings')
    window.scrollTo(0, 0)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold">
              ₹
            </div>
            <h2 className="font-playfair text-xl font-bold text-gray-900">
              {isSuccess ? 'Payment Confirmed' : 'Instant UPI Payment'}
            </h2>
            <div>
              <h2 className="font-playfair text-xl font-bold text-gray-900">
                {isSuccess ? 'Payment Confirmed' : 'Instant UPI Payment'}
              </h2>
              <p className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                Demo Test Mode
              </p>
            </div>
          </div>
          {!localProcessing && !isProcessing && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <img src={assets.closeIcon} alt="Close" className="h-4 w-4" />
            </button>
          )}
        </div>

        {isSuccess ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10 fill-none stroke-current" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">Payment Complete &amp; Verified!</h3>
              <p className="text-sm text-gray-500">
                Your UPI payment of <span className="font-bold text-gray-900">₹{finalTotal}</span> to <span className="font-semibold text-gray-800">{UPI_ID}</span> was received and processed.
                Your demo UPI payment of <span className="font-bold text-gray-900">₹{finalTotal}</span> was verified and processed.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-left text-sm space-y-2.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Hotel:</span>
                <span className="font-medium text-gray-900">{hotelName} ({roomType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dates:</span>
                <span className="font-medium text-gray-900">{checkIn} to {checkOut} ({nights} nights)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Guests:</span>
                <span className="font-medium text-gray-900">{guests} Guest(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method:</span>
                <span className="font-medium text-gray-900">UPI ({UPI_ID})</span>
                <span className="font-medium text-gray-900">Demo UPI ({UPI_ID})</span>
              </div>
              {utrNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-500">UTR Reference:</span>
                  <span className="font-mono text-gray-900">{utrNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  Confirmed &amp; Paid
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-all hover:bg-black active:scale-[0.99] cursor-pointer"
            >
              View in My Bookings
            </button>
          </div>
        ) : (
          /* Dedicated UPI Payment Flow */
          <div className="grid gap-6 p-6 md:grid-cols-2">
            {/* Left: Booking Summary */}
            <div className="flex flex-col justify-between rounded-xl bg-gray-50 p-5 border border-gray-200">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">Booking Summary</span>
                <h3 className="mt-1 font-playfair text-xl font-bold text-gray-900">{hotelName}</h3>
                <p className="text-xs text-gray-500">{roomType}</p>

                <div className="mt-4 space-y-2 border-t border-gray-200 pt-3 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Check-in:</span>
                    <span className="font-medium text-gray-800">{checkIn || 'Selected Date'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out:</span>
                    <span className="font-medium text-gray-800">{checkOut || 'Selected Date'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guests:</span>
                    <span className="font-medium text-gray-800">{guests} Guest(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nights:</span>
                    <span className="font-medium text-gray-800">{nights} Night(s)</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>₹{pricePerNight} &times; {nights} nights</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes &amp; Service fees (8%)</span>
                    <span>₹{tax}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-base font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-2xl text-emerald-600">₹{finalTotal}</span>
                </div>
              </div>
            </div>

            {/* Right: Dedicated UPI QR & ID */}
            <form onSubmit={handleSubmitPayment} className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Contact Information (if not provided) */}
                {(!bookingDetails.guestEmail || !bookingDetails.guestName) && (
                  <div className="space-y-2 rounded-lg bg-orange-50/40 p-3 border border-orange-100">
                    <span className="text-xs font-semibold text-gray-700">Contact Details</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-medium text-gray-600">Name</label>
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="mt-0.5 w-full rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-orange-500 bg-white"
                          className="mt-0.5 w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-orange-500 bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-gray-600">Email</label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="mt-0.5 w-full rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-orange-500 bg-white"
                          className="mt-0.5 w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-orange-500 bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI ID & QR Code Box */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-900">
                    <span>⚡ Pay using Any UPI App</span>
                    <span>⚡ Pay using Any UPI App (Demo Mode)</span>
                  </div>

                  {/* Dynamic UPI QR Code */}
                  <div className="mx-auto flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-white p-2.5 shadow-sm max-w-[170px]">
                    <img
                      src={upiQrUrl}
                      alt="UPI QR Code"
                      className="h-36 w-36 rounded-lg object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div style={{ display: 'none' }} className="h-36 w-36 items-center justify-center flex-col text-xs text-gray-600">
                      <span className="font-mono text-xs">{UPI_ID}</span>
                    </div>
                    <span className="mt-1 text-[10px] font-semibold text-gray-600">Scan with GPay / PhonePe / Paytm</span>
                  </div>

                  {/* UPI ID Display & Copy Button */}
                  {/* Fake UPI ID Display & Copy Button */}
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-emerald-200 shadow-xs text-left">
                    <div className="min-w-0 pr-2">
                      <p className="text-[10px] text-gray-500 font-medium">Official UPI ID</p>
                      <p className="text-[10px] text-gray-500 font-medium">Demo UPI ID</p>
                      <p className="font-mono text-xs font-bold text-emerald-800 truncate">{UPI_ID}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="shrink-0 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Pay via UPI App Direct link for Mobile */}
                  <a
                    href={upiDeepLink}
                    className="inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                  >
                    <span>📱 Open in UPI App (GPay / PhonePe)</span>
                  </a>
                </div>

                {/* UTR / Transaction Reference Input */}
                {/* UTR / Transaction Reference Input with Auto-Fill Fake UTR */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-700">
                    UPI Transaction / UTR Ref No. <span className="text-gray-400 font-normal">(Optional / 12 Digits)</span>
                  </label>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-gray-700">
                      UPI Reference / UTR No.
                    </label>
                    <button
                      type="button"
                      onClick={handleFillFakeUtr}
                      className="text-[10px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      ⚡ Auto-Fill Fake UTR
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 423589123456"
                    placeholder="e.g. UTR-984321045612"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    maxLength={20}
                    maxLength={30}
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {errorMsg && <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded border border-red-200">{errorMsg}</p>}
              </div>

              {/* Confirm Payment Button */}
              <button
                type="submit"
                disabled={localProcessing || isProcessing}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {localProcessing || isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing &amp; Verifying Payment...
                  </span>
                ) : (
                  `Confirm Payment of ₹${finalTotal}`
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentModal