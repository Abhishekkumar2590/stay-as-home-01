import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useParams } from 'react-router-dom'
import { assets, facilityIcons, roomCommonData, roomsDummyData } from '../assets/assets'
import StarRating from '../components/StarRating'
import PaymentModal from '../components/PaymentModal.jsx'
import { createBooking, getRoom, trackRoomView } from '../lib/api.js'

const getTodayStr = () => {
    const d = new Date()
    return d.toISOString().split('T')[0]
}

const getTomorrowStr = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
}

const RoomDetails = () => {
    const { id } = useParams()
    const { isSignedIn, user } = useUser()
    const [room, setRoom] = useState(null)
    const [viewsCount, setViewsCount] = useState(1)
    const [loadError, setLoadError] = useState('')
    const [mainImage, setMainImage] = useState(null)
    const [booking, setBooking] = useState({
        checkInDate: getTodayStr(),
        checkOutDate: getTomorrowStr(),
        guests: 1,
    })
    const [bookingMessage, setBookingMessage] = useState({ type: '', text: '' })
    const [isBooking, setIsBooking] = useState(false)
    const [isPaymentOpen, setIsPaymentOpen] = useState(false)

    useEffect(() => {
        getRoom(id).then(setRoom).catch((error) => {
            const earlierRoom = roomsDummyData.find((roomItem) => roomItem._id === id)
            if (earlierRoom) setRoom(earlierRoom)
            else setLoadError(error.message)
        })

        // Track live room view
        trackRoomView(id).then((res) => {
            if (res?.views) setViewsCount(res.views)
        }).catch(() => {})
    }, [id])


    if (loadError) {
        return <div className='py-20 text-center text-red-600'>{loadError}</div>
    }

    if (!room) {
        return <div className='py-20 text-center text-gray-500'>Loading room details...</div>
    }

    const checkInTime = booking.checkInDate ? new Date(booking.checkInDate) : null
    const checkOutTime = booking.checkOutDate ? new Date(booking.checkOutDate) : null
    const computedNights = (checkInTime && checkOutTime && checkOutTime > checkInTime)
        ? Math.max(1, Math.ceil((checkOutTime - checkInTime) / (1000 * 60 * 60 * 24)))
        : 1
    const computedTotal = computedNights * (room.pricePerNight || 0)

    const handleInitiatePayment = (event) => {
        event.preventDefault()
        setBookingMessage({ type: '', text: '' })

        if (!booking.checkInDate || !booking.checkOutDate) {
            setBookingMessage({ type: 'error', text: 'Please choose check-in and check-out dates.' })
            return
        }

        setIsPaymentOpen(true)
    }

    const handleConfirmPayment = async ({ paymentMethod, isPaid, guestName, guestEmail }) => {
        setIsBooking(true)
        const email = guestEmail || user?.primaryEmailAddress?.emailAddress || 'guest@example.com'
        const name = guestName || user?.fullName || user?.firstName || 'Guest'

        try {
            const created = await createBooking({
                roomId: room.id || room._id,
                guestName: name,
                guestEmail: email,
                checkIn: booking.checkInDate,
                checkOut: booking.checkOutDate,
                guests: booking.guests,
                paymentMethod,
                isPaid,
            })
            setBookingMessage({ type: 'success', text: `Booking confirmed! Receipt sent to ${email}.` })
            return created
        } catch (error) {
            throw error
        } finally {
            setIsBooking(false)
        }
    }



    return (
        <div className='py-20 md:py-35 px-6 md:px-16 lg:px-24 xl:px-32'>
            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                bookingDetails={{
                    hotelName: room.hotel?.name || 'Hotel',
                    roomType: room.roomType,
                    checkIn: booking.checkInDate,
                    checkOut: booking.checkOutDate,
                    nights: computedNights,
                    guests: booking.guests,
                    pricePerNight: room.pricePerNight,
                    totalPrice: computedTotal,
                    guestName: user?.fullName || user?.firstName || '',
                    guestEmail: user?.primaryEmailAddress?.emailAddress || '',
                }}
                onConfirmPayment={handleConfirmPayment}
                isProcessing={isBooking}
            />
            <div className='flex items-center justify-between flex-wrap gap-2'>
                <h1 className='text-3xl font-semibold text-gray-800 font-playfair'>
                    {room.hotel?.name || 'QuickStay Hotel'}
                    <span className='font-inter text-sm'> ({room.roomType})</span>
                </h1>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs text-red-700 font-medium animate-pulse">
                        <span>🔥</span>
                        <span>{viewsCount} {viewsCount === 1 ? 'guest' : 'guests'} viewing now</span>
                    </div>
                    <p className='text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full font-semibold'>20% OFF</p>
                </div>
            </div>


            <div className='flex items-center mt-3'>
                <StarRating />
                <p className='ml-2'>200+ reviews</p>
            </div>

            <div className='flex items-center gap-1 text-gray-500 mt-2'>
                <img src={assets.locationIcon} alt='location-icon' className='w-4 h-4' />
                <span>{room.hotel?.address || ''}</span>
            </div>

            <div className='flex flex-col lg:flex-row gap-6 mt-8'>
                <div className='lg:w-1/2 w-full'>
                    <img
                        src={mainImage || room.images?.[0]}
                        alt='room main view'
                        className='w-full h-[420px] rounded-xl shadow-lg object-cover'
                        onError={(e) => {
                            e.target.onerror = null
                            e.target.src = assets.roomImg1
                        }}
                    />
                </div>

                <div className='lg:w-1/2 w-full'>
                    <div className='grid grid-cols-3 gap-2'>
                        {room.images?.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`room ${index + 1}`}
                                className={`w-full h-24 rounded-lg shadow-md object-cover cursor-pointer transition-all ${
                                    mainImage === image ? 'outline outline-2 outline-orange-500' : ''
                                }`}
                                onClick={() => setMainImage(image)}
                                onError={(e) => {
                                    e.target.onerror = null
                                    e.target.src = assets.roomImg1
                                }}
                            />
                        ))}
                    </div>


                    <div className='mt-6'>
                        <h2 className='text-2xl font-semibold text-gray-800 font-playfair mb-4'>
                            Experience Luxury Like Never Before
                        </h2>

                        <div className='grid grid-cols-2 gap-3 mb-6'>
                            {room.amenities?.map((item, index) => (
                                <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100'>
                                    <img src={facilityIcons[item]} alt={item} className='w-5 h-5' />
                                    <p className='text-gray-600 text-sm'>{item}</p>
                                </div>
                            ))}
                        </div>

                        <div className='mb-6'>
                            <p className='text-3xl font-semibold text-gray-800 font-playfair'>
                                ${room.pricePerNight}/night
                            </p>
                        </div>

                        <form onSubmit={handleInitiatePayment} className='flex flex-col gap-4 bg-white shadow-lg p-6 rounded-xl'>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                <div className='flex flex-col'>
                                    <label htmlFor='checkInDate' className='text-gray-700 font-medium mb-2'>
                                        Check-in
                                    </label>
                                    <input
                                        type='date'
                                        id='checkInDate'
                                        value={booking.checkInDate}
                                        onChange={(event) => setBooking({ ...booking, checkInDate: event.target.value })}
                                        className='w-full rounded border border-gray-300 py-2 px-3 outline-none focus:border-orange-500'
                                        required
                                    />
                                </div>

                                <div className='flex flex-col'>
                                    <label htmlFor='checkoutDate' className='text-gray-700 font-medium mb-2'>
                                        Check-out
                                    </label>
                                    <input
                                        type='date'
                                        id='checkoutDate'
                                        value={booking.checkOutDate}
                                        onChange={(event) => setBooking({ ...booking, checkOutDate: event.target.value })}
                                        className='w-full rounded border border-gray-300 py-2 px-3 outline-none focus:border-orange-500'
                                        required
                                    />
                                </div>

                                <div className='flex flex-col'>
                                    <label htmlFor='guests' className='text-gray-700 font-medium mb-2'>
                                        Guests
                                    </label>
                                    <input
                                        type='number'
                                        id='guests'
                                        min='1'
                                        max='10'
                                        value={booking.guests}
                                        onChange={(event) => setBooking({ ...booking, guests: Number(event.target.value) || 1 })}
                                        placeholder='Guests'
                                        className='w-full rounded border border-gray-300 py-2 px-3 outline-none focus:border-orange-500'
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type='submit'
                                disabled={isBooking}
                                className='bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white rounded-xl py-3.5 font-semibold cursor-pointer shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2'
                            >
                                {isBooking ? 'Processing...' : computedTotal > 0 ? `Proceed to Payment • $${computedTotal}` : 'Proceed to Payment'}
                            </button>
                            {bookingMessage.text && (
                                <p className={`text-sm ${bookingMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {bookingMessage.text}
                                </p>
                            )}
                        </form>


                        <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {roomCommonData.map((spec, index) => (
                                <div key={index} className='flex items-start gap-3 rounded-lg bg-gray-100 p-3'>
                                    <img src={spec.icon} alt={`${spec.title}-icon`} className='w-5 h-5 mt-1' />
                                    <div>
                                        <p className='font-medium text-gray-800'>{spec.title}</p>
                                        <p className='text-sm text-gray-500'>{spec.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5 text-gray-600 leading-relaxed'>
                            Guests will be allocated on the ground floor according to availability. You get a comfortable two-bedroom apartment with a true city feeling. The price quoted is for two guests. Please mark the number of guests to get the exact price for your group.
                        </div>

                        <div className='mt-8 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4'>
                            <div className='flex items-center gap-3'>
                                <img
                                    src={room.hotel.owner?.image}
                                    alt='Host'
                                    className='h-14 w-14 rounded-full object-cover'
                                />
                                <div>
                                    <p className='text-lg md:text-xl font-semibold text-gray-800'>
                                        Hosted by Abhishek Kumar
                                    </p>
                                    <div className='flex items-center mt-1'>
                                        <StarRating />
                                        <p className='ml-2 text-sm'>200+ reviews</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type='button'
                                className='bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white rounded-md py-3 px-5 font-semibold cursor-pointer'
                            >
                                Contact Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoomDetails
