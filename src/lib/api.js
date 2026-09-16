import { assets, roomsDummyData, hotelDummyData, userBookingsDummyData } from '../assets/assets.js'

const LOCAL_API_URL = 'http://127.0.0.1:8000/api'

const getApiBaseUrl = () => {
    const configuredUrl = import.meta.env.VITE_API_URL
    if (configuredUrl) {
        return configuredUrl.replace(/\/+$/, '')
    }
    return LOCAL_API_URL
}

const API_BASE_URL = getApiBaseUrl()
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

// Helper for local storage persistence
const getLocalBookings = () => {
    try {
        const data = localStorage.getItem('quickstay_local_bookings')
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

const saveLocalBooking = (booking) => {
    try {
        const existing = getLocalBookings()
        const updated = [booking, ...existing.filter((b) => (b.id ?? b._id) !== (booking.id ?? booking._id))]
        localStorage.setItem('quickstay_local_bookings', JSON.stringify(updated))
    } catch {
        // Ignore storage quotas
    }
}

const getLocalRooms = () => {
    try {
        const data = localStorage.getItem('quickstay_local_rooms')
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

const saveLocalRoom = (room) => {
    try {
        const existing = getLocalRooms()
        const updated = [room, ...existing.filter((r) => (r.id ?? r._id) !== (room.id ?? room._id))]
        localStorage.setItem('quickstay_local_rooms', JSON.stringify(updated))
    } catch {
        // Ignore storage quotas
    }
}

export const toAbsoluteUrl = (url) => {
    if (!url) return null
    if (typeof url === 'object') {
        url = url.image_url || url.image || url.url || url.src || ''
    }
    if (!url || typeof url !== 'string') return null
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url
    }
    if (url.startsWith('/assets/') || url.startsWith('./assets/') || url.includes('assets/')) {
        return url
    }
    let cleanUrl = url.trim()
    if (!cleanUrl.startsWith('/')) {
        cleanUrl = `/${cleanUrl}`
    }
    if (!cleanUrl.startsWith('/media/') && (cleanUrl.startsWith('/hotels/') || cleanUrl.startsWith('/rooms/'))) {
        cleanUrl = `/media${cleanUrl}`
    }
    return `${API_ORIGIN}${cleanUrl}`
}

export const normalizeHotel = (hotel) => {
    if (!hotel) return null
    const hotelId = hotel.id ?? hotel._id ?? 'hotel-default'
    const rawImages = Array.isArray(hotel.images) ? hotel.images : []
    const parsedImages = rawImages.map(toAbsoluteUrl).filter(Boolean)
    const fallbackList = [assets.roomImg1, assets.roomImg2, assets.roomImg3, assets.roomImg4]

    return {
        ...hotel,
        id: hotelId,
        _id: hotelId,
        name: hotel.name || 'QuickStay Luxury Resort',
        address: hotel.address || 'Ocean View Boulevard',
        city: hotel.city || 'New York',
        images: parsedImages.length > 0 ? parsedImages : fallbackList,
    }
}

export const normalizeRoom = (room) => {
    if (!room) return null

    const rawImages = [
        ...(Array.isArray(room.images) ? room.images : []),
        ...(Array.isArray(room.hotel_images) ? room.hotel_images : []),
        ...(Array.isArray(room.hotel_details?.images) ? room.hotel_details.images : []),
        ...(Array.isArray(room.hotel?.images) ? room.hotel.images : []),
        ...(room.image ? [room.image] : []),
        ...(room.photo ? [room.photo] : []),
    ]

    const parsedImages = rawImages
        .map(toAbsoluteUrl)
        .filter(Boolean)

    const fallbackList = [assets.roomImg1, assets.roomImg2, assets.roomImg3, assets.roomImg4]
    const finalImages = parsedImages.length > 0 ? parsedImages : fallbackList

    const roomId = String(room.id ?? room._id ?? 'room-default')

    return {
        ...room,
        id: roomId,
        _id: roomId,
        roomType: room.room_type_display || (room.room_type === 'single' ? 'Single Bed' : room.room_type === 'double' ? 'Double Bed' : room.room_type === 'suite' ? 'Suite' : room.room_type || room.roomType || 'Standard Room'),
        pricePerNight: Number(room.price_per_night ?? room.pricePerNight ?? 299),
        isAvailable: room.is_available ?? room.isAvailable ?? true,
        createdAt: room.created_at || room.createdAt || new Date().toISOString(),
        amenities: Array.isArray(room.amenities) && room.amenities.length > 0 ? room.amenities : ['Free WiFi', 'Room Service', 'Pool Access'],
        images: finalImages,
        hotel: normalizeHotel(room.hotel_details || room.hotel) || {
            name: room.hotel_name || 'Urbanza Suites',
            address: room.hotel_address || 'Main Road 123 Street',
            city: room.hotel_city || 'New York',
        },
    }
}

export const normalizeBooking = (booking) => {
    if (!booking) return null
    const bookingId = String(booking.id ?? booking._id ?? `bk_${Date.now()}`)

    return {
        ...booking,
        id: bookingId,
        _id: bookingId,
        checkInDate: booking.check_in || booking.checkInDate || new Date().toISOString().split('T')[0],
        checkOutDate: booking.check_out || booking.checkOutDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        totalPrice: Number(booking.total_price ?? booking.totalPrice ?? 299),
        isPaid: booking.is_paid ?? (booking.status === 'confirmed') ?? true,
        status: booking.status || 'confirmed',
        guest_name: booking.guest_name || booking.guestName || 'Guest User',
        guest_email: booking.guest_email || booking.guestEmail || 'guest@quickstay.com',
        paymentMethod: booking.payment_method || booking.paymentMethod || 'Fake UPI (fake.hotelpay@okhdfcbank)',
        room: normalizeRoom(booking.room_details || booking.room) || roomsDummyData[0],
        hotel: booking.hotel || booking.room_details?.hotel_details || booking.room_details?.hotel || { name: booking.room_name || 'Urbanza Suites', address: 'Main Road 123 Street', city: 'New York' },
    }
}

const request = async (path, options = {}) => {
    const isFormData = options.body instanceof FormData
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            signal: controller.signal,
            headers: isFormData ? { ...options.headers } : { 'Content-Type': 'application/json', ...options.headers },
            ...options,
        })
        clearTimeout(timeoutId)

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.detail || Object.values(error).flat().join(' ') || 'API request failed')
        }
        return response.status === 204 ? null : response.json()
    } catch (err) {
        clearTimeout(timeoutId)
        throw err
    }
}

export const getRooms = async () => {
    try {
        const data = await request('/rooms/')
        if (Array.isArray(data) && data.length > 0) {
            return data.map(normalizeRoom)
        }
    } catch (error) {
        console.warn('Backend rooms API unreachable, using catalog catalog stays:', error.message)
    }

    const localRooms = getLocalRooms()
    const combined = [...localRooms, ...roomsDummyData]
    return combined.map(normalizeRoom)
}

export const getRoom = async (id) => {
    try {
        const data = await request(`/rooms/${id}/`)
        if (data) return normalizeRoom(data)
    } catch (error) {
        console.warn(`Backend room ${id} fetch error, checking local store:`, error.message)
    }

    const localRooms = getLocalRooms()
    const foundLocal = localRooms.find((r) => String(r.id ?? r._id) === String(id))
    if (foundLocal) return normalizeRoom(foundLocal)

    const foundDummy = roomsDummyData.find((r) => String(r.id ?? r._id) === String(id))
    if (foundDummy) return normalizeRoom(foundDummy)

    return normalizeRoom(roomsDummyData[0])
}

export const getHotels = async () => {
    try {
        const data = await request('/hotels/')
        if (Array.isArray(data) && data.length > 0) return data.map(normalizeHotel)
    } catch (error) {
        console.warn('Backend hotels API unreachable, using catalog:', error.message)
    }
    return [normalizeHotel(hotelDummyData)]
}

export const createHotel = async ({ name, address, city, description = '', owner_name = '', owner_email = '' }) => {
    try {
        const res = await request('/hotels/', {
            method: 'POST',
            body: JSON.stringify({
                name,
                address,
                city,
                description,
                owner_name,
                owner_email,
                is_active: true,
            }),
        })
        return normalizeHotel(res)
    } catch (error) {
        const newHotel = {
            id: `hotel_${Date.now()}`,
            _id: `hotel_${Date.now()}`,
            name,
            address,
            city,
            description,
            owner_name,
            owner_email,
            is_active: true,
            images: [assets.roomImg1, assets.roomImg2],
        }
        return normalizeHotel(newHotel)
    }
}

export const uploadHotelImage = async ({ hotelId, image, altText = '' }) => {
    const formData = new FormData()
    formData.append('hotel', hotelId)
    formData.append('image', image)
    formData.append('alt_text', altText)
    try {
        return await request('/hotel-images/', { method: 'POST', body: formData })
    } catch {
        return { id: Date.now(), image: URL.createObjectURL(image) }
    }
}

export const createRoom = async ({ hotel, roomType, pricePerNight, amenities, isAvailable = true }) => {
    try {
        const res = await request('/rooms/', {
            method: 'POST',
            body: JSON.stringify({
                hotel,
                room_type: roomType,
                price_per_night: Number(pricePerNight),
                amenities,
                is_available: isAvailable,
            }),
        })
        const normalized = normalizeRoom(res)
        saveLocalRoom(normalized)
        return normalized
    } catch (error) {
        const localRoom = normalizeRoom({
            id: `room_${Date.now()}`,
            _id: `room_${Date.now()}`,
            hotel: hotelDummyData,
            roomType: roomType || 'Double Bed',
            pricePerNight: Number(pricePerNight) || 299,
            amenities: amenities || ['Free WiFi', 'Room Service'],
            isAvailable,
            images: [assets.roomImg1, assets.roomImg2, assets.roomImg3],
            createdAt: new Date().toISOString(),
        })
        saveLocalRoom(localRoom)
        return localRoom
    }
}

export const uploadRoomImage = async ({ roomId, image, altText = '' }) => {
    const formData = new FormData()
    formData.append('room', roomId)
    formData.append('image', image)
    formData.append('alt_text', altText)
    try {
        return await request('/room-images/', { method: 'POST', body: formData })
    } catch {
        return { id: Date.now(), image: URL.createObjectURL(image) }
    }
}

export const updateRoom = async (roomId, data) => {
    try {
        return await request(`/rooms/${roomId}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        })
    } catch {
        return { id: roomId, ...data }
    }
}

export const deleteRoom = async (roomId) => {
    try {
        await request(`/rooms/${roomId}/`, { method: 'DELETE' })
    } catch {
        // remove from local storage
        const existing = getLocalRooms()
        localStorage.setItem('quickstay_local_rooms', JSON.stringify(existing.filter((r) => String(r.id ?? r._id) !== String(roomId))))
    }
}

export const getBookings = async () => {
    let apiBookings = []
    try {
        const data = await request('/bookings/')
        if (Array.isArray(data)) {
            apiBookings = data.map(normalizeBooking)
        }
    } catch (error) {
        console.warn('Backend bookings fetch fallback to local:', error.message)
    }

    const localBookings = getLocalBookings().map(normalizeBooking)
    const combined = [...localBookings, ...apiBookings, ...userBookingsDummyData.map(normalizeBooking)]
    const seen = new Set()
    return combined.filter((item) => {
        const key = item.id || item._id
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

export const getBookingsByEmail = async (email) => {
    let apiBookings = []
    try {
        const data = await request(`/bookings/by-email/?email=${encodeURIComponent(email)}`)
        if (Array.isArray(data)) {
            apiBookings = data.map(normalizeBooking)
        }
    } catch (error) {
        console.warn('Backend email bookings fallback to local:', error.message)
    }

    const localBookings = getLocalBookings().map(normalizeBooking)
    const normalizedEmail = (email || '').toLowerCase().trim()
    const matchedLocal = localBookings.filter((b) =>
        !normalizedEmail ||
        (b.guest_email || '').toLowerCase().includes(normalizedEmail) ||
        (b.guestEmail || '').toLowerCase().includes(normalizedEmail)
    )

    const combined = [...matchedLocal, ...apiBookings]
    if (combined.length === 0) {
        return userBookingsDummyData.map(normalizeBooking)
    }
    return combined
}

export const createBooking = async ({ roomId, guestName, guestEmail, checkIn, checkOut, guests, paymentMethod = 'Fake UPI (fake.hotelpay@okhdfcbank)', isPaid = true }) => {
    try {
        const booking = await request('/bookings/', {
            method: 'POST',
            body: JSON.stringify({
                room: roomId,
                guest_name: guestName,
                guest_email: guestEmail,
                check_in: checkIn,
                check_out: checkOut,
                guests: Number(guests) || 1,
                payment_method: paymentMethod,
                is_paid: isPaid,
            }),
        })
        const normalized = normalizeBooking(booking)
        saveLocalBooking(normalized)
        return normalized
    } catch (error) {
        console.warn('Backend booking creation fallback to client persistence:', error.message)
        const roomObj = await getRoom(roomId)
        const checkInDate = new Date(checkIn)
        const checkOutDate = new Date(checkOut)
        const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) || 1)
        const totalPrice = nights * (roomObj.pricePerNight || 299)

        const fallbackBooking = normalizeBooking({
            id: `bk_${Date.now()}`,
            _id: `bk_${Date.now()}`,
            room: roomObj,
            hotel: roomObj.hotel || hotelDummyData,
            guest_name: guestName,
            guest_email: guestEmail,
            check_in: checkIn,
            check_out: checkOut,
            guests: Number(guests) || 1,
            total_price: totalPrice,
            payment_method: paymentMethod,
            is_paid: isPaid,
            status: 'confirmed',
            created_at: new Date().toISOString(),
        })

        saveLocalBooking(fallbackBooking)
        return fallbackBooking
    }
}

export const payBooking = async (bookingId, paymentMethod = 'Fake UPI (fake.hotelpay@okhdfcbank)') => {
    try {
        const booking = await request(`/bookings/${bookingId}/pay/`, {
            method: 'POST',
            body: JSON.stringify({ payment_method: paymentMethod }),
        })
        const normalized = normalizeBooking(booking)
        saveLocalBooking(normalized)
        return normalized
    } catch (error) {
        const local = getLocalBookings()
        const found = local.find((b) => String(b.id ?? b._id) === String(bookingId))
        if (found) {
            found.isPaid = true
            found.status = 'confirmed'
            found.paymentMethod = paymentMethod
            saveLocalBooking(found)
            return normalizeBooking(found)
        }
        return normalizeBooking({ id: bookingId, isPaid: true, status: 'confirmed', paymentMethod })
    }
}

export const cancelBooking = async (bookingId) => {
    try {
        const booking = await request(`/bookings/${bookingId}/cancel/`, {
            method: 'POST',
        })
        const normalized = normalizeBooking(booking)
        saveLocalBooking(normalized)
        return normalized
    } catch (error) {
        const local = getLocalBookings()
        const found = local.find((b) => String(b.id ?? b._id) === String(bookingId))
        if (found) {
            found.status = 'cancelled'
            found.isPaid = false
            saveLocalBooking(found)
            return normalizeBooking(found)
        }
        return { id: bookingId, status: 'cancelled' }
    }
}

export const getFeedbacks = async () => {
    try {
        const res = await request('/feedbacks/')
        if (Array.isArray(res) && res.length > 0) return res
    } catch {
        // Ignore fallback
    }
    return []
}

export const submitFeedback = async ({ hotelId, roomId, userName, userEmail, rating = 5, comment }) => {
    try {
        return await request('/feedbacks/', {
            method: 'POST',
            body: JSON.stringify({
                hotel: hotelId || null,
                room: roomId || null,
                user_name: userName,
                user_email: userEmail || '',
                rating: Number(rating),
                comment,
            }),
        })
    } catch {
        return {
            id: Date.now(),
            user_name: userName,
            rating: Number(rating),
            comment,
            created_at: new Date().toISOString(),
        }
    }
}

export const getAnalytics = async () => {
    try {
        const res = await request('/analytics/summary/')
        if (res) return res
    } catch {
        // Fallback calculation
    }

    const allBookings = await getBookings()
    const totalRev = allBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0)
    return {
        total_hotels: 4,
        total_rooms: 8,
        total_bookings: allBookings.length || 3,
        total_revenue: totalRev || 1290,
        recent_bookings: allBookings.slice(0, 5),
    }
}

export const createCashfreeOrder = async ({ bookingId, amount, customerName, customerEmail, customerPhone }) => {
    return request('/payments/cashfree/create-order/', {
        method: 'POST',
        body: JSON.stringify({
            booking_id: bookingId,
            order_amount: amount,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone || '9999999999',
            currency: 'INR',
        }),
    })
}

export const verifyCashfreeOrder = async ({ orderId, bookingId }) => {
    return request('/payments/cashfree/verify/', {
        method: 'POST',
        body: JSON.stringify({
            order_id: orderId,
            booking_id: bookingId,
        }),
    })
}



export const trackRoomView = async (roomId) => {
    try {
        return await request(`/rooms/${roomId}/views/`, {
            method: 'POST',
        })
    } catch {
        return { views: Math.floor(Math.random() * 10) + 1 }
    }
}

export const getRoomViews = async (roomId) => {
    try {
        return await request(`/rooms/${roomId}/views/`)
    } catch {
        return { views: 5 }
    }
}

export const getKafkaStatus = async () => {
    try {
        return await request('/kafka/status/')
    } catch {
        return {
            enabled: true,
            connected: false,
            mode: 'In-Memory Event Streaming Buffer',
            topics: ['hotel.bookings', 'hotel.payments', 'hotel.rooms', 'hotel.feedbacks', 'hotel.notifications'],
            metrics: { total_published: 0, by_topic: {} },
            recent_events: [],
        }
    }
}

export const publishKafkaTestEvent = async (topic = 'hotel.notifications', message = 'Test Event from Frontend') => {
    return request('/kafka/publish-test/', {
        method: 'POST',
        body: JSON.stringify({ topic, message }),
    })
}
