import { assets } from '../assets/assets.js'

const HotelCard = ({ room, index }) => {
    if (!room) return null
    const hotelName = room.hotel?.name || room.hotel_name || 'QuickStay Hotel'
    const hotelAddress = room.hotel?.address || room.hotel_address || 'Main Road'
    const roomImage = (Array.isArray(room.images) && room.images[0]) || assets.roomImg1

    return (
        <a href={`/rooms/${room._id || room.id}`} onClick={() => window.scrollTo(0, 0)} className="group relative overflow-hidden rounded-xl bg-white shadow-[0px_4px_24px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-1">
            <div className="relative">
                <img
                    src={roomImage}
                    alt={`${hotelName} ${room.roomType || ''}`}
                    className="h-64 w-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null
                        e.target.src = assets.roomImg1
                    }}
                />
                {index % 2 === 0 && <p className="absolute top-4 left-4 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-800">Best Seller</p>}
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="font-playfair text-xl font-medium text-gray-800">{hotelName}</h3>
                        <p className="mt-1 text-sm text-gray-500">{room.roomType || 'Standard Room'}</p>
                    </div>
                    <span className="flex items-center gap-1 text-base font-medium text-gray-700"><span className="text-xl leading-none text-orange-500">★</span>4.5</span>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-gray-500"><img src={assets.locationIcon} alt="" className="h-4 w-4" />{hotelAddress}</p>
                <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-gray-900">${room.pricePerNight || 299}<span className="text-sm font-normal text-gray-500"> / night</span></p>
                    <span className="rounded-full border border-gray-800 px-4 py-2 text-sm font-medium transition-colors group-hover:bg-gray-800 group-hover:text-white">Book now</span>
                </div>
            </div>
        </a>
    )
}
export default HotelCard
