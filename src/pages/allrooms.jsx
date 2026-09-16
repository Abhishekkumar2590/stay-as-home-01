import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { assets, facilityIcons, roomsDummyData } from '../assets/assets.js'
import StarRating from '../components/StarRating.jsx'
import { getRooms } from '../lib/api.js'

const roomTypes = ['Single Bed', 'Double Bed', 'Suite']
const priceRanges = [
    { label: '$0 to $500', min: 0, max: 500 },
    { label: '$500 to $1,000', min: 500, max: 1000 },
    { label: '$1,000 to $2,000', min: 1000, max: 2000 },
]
const sortOptions = ['Price: Low to High', 'Price: High to Low', 'Newest First']

const CheckBox = ({ label, selected = false, onChange = () => {} }) => (
    <label className="mt-2 flex cursor-pointer items-center gap-3 text-sm">
        <input type="checkbox" checked={selected} onChange={(event) => onChange(event.target.checked)} />
        <span className="select-none font-light">{label}</span>
    </label>
)

const RadioButton = ({ label, selected = false, onChange = () => {} }) => (
    <label className="mt-2 flex cursor-pointer items-center gap-3 text-sm">
        <input type="radio" name="sortOption" checked={selected} onChange={() => onChange(label)} />
        <span className="select-none font-light">{label}</span>
    </label>
)

const AllRooms = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const destinationQuery = searchParams.get('destination') || ''

    const [searchTerm, setSearchTerm] = useState(destinationQuery)
    const [openFilters, setOpenFilters] = useState(false)
    const [selectedTypes, setSelectedTypes] = useState([])
    const [selectedRange, setSelectedRange] = useState(null)
    const [sortBy, setSortBy] = useState('Newest First')
    const [allRooms, setAllRooms] = useState(roomsDummyData)
    const [loadError, setLoadError] = useState('')

    useEffect(() => {
        if (destinationQuery) {
            setSearchTerm(destinationQuery)
        }
    }, [destinationQuery])

    useEffect(() => {
        getRooms()
            .then((data) => setAllRooms(data.length ? data : roomsDummyData))
            .catch((error) => {
                setAllRooms(roomsDummyData)
                setLoadError(`${error.message}. Showing catalog stays.`)
            })
    }, [])

    const rooms = useMemo(() => {
        const query = searchTerm.trim().toLowerCase()
        const filtered = allRooms.filter((room) => {
            const currentType = (room.roomType || '').toLowerCase()
            const hotelName = (room.hotel?.name || '').toLowerCase()
            const city = (room.hotel?.city || '').toLowerCase()
            const address = (room.hotel?.address || '').toLowerCase()

            const matchesSearch = !query || hotelName.includes(query) || city.includes(query) || address.includes(query) || currentType.includes(query)
            const matchesType = selectedTypes.length === 0 || selectedTypes.some((t) => t.toLowerCase() === currentType || currentType.includes(t.toLowerCase()))
            const matchesPrice = !selectedRange || (room.pricePerNight >= selectedRange.min && room.pricePerNight <= selectedRange.max)
            return matchesSearch && matchesType && matchesPrice
        })

        return [...filtered].sort((a, b) => {
            if (sortBy === 'Price: Low to High') return a.pricePerNight - b.pricePerNight
            if (sortBy === 'Price: High to Low') return b.pricePerNight - a.pricePerNight
            return new Date(b.createdAt) - new Date(a.createdAt)
        })
    }, [allRooms, searchTerm, selectedRange, selectedTypes, sortBy])

    const clearFilters = () => {
        setSelectedTypes([])
        setSelectedRange(null)
        setSearchTerm('')
        setSortBy('Newest First')
        setSearchParams({})
    }


    const toggleRoomType = (type, selected) => {
        setSelectedTypes((current) => selected ? [...current, type] : current.filter((item) => item !== type))
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 pb-12 pt-32 md:px-16 lg:px-24 xl:px-32">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="font-playfair text-4xl md:text-[40px]">Hotel Rooms</h1>
                    <p className="mt-2 max-w-3xl text-sm text-gray-500/90 md:text-base">Take advantage of our limited offers and special packages to enhance your stay and create unforgettable memories.</p>
                </div>

                <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                    <aside className="order-2 w-full rounded-xl border border-gray-200 bg-white text-gray-600 lg:sticky lg:top-28 lg:order-2 lg:w-80">
                        <div className="flex justify-between border-b border-gray-200 px-5 py-3">
                            <p className="font-medium text-gray-800">FILTERS</p>
                            <button type="button" onClick={() => setOpenFilters((open) => !open)} className="text-sm font-medium text-gray-800 lg:hidden">{openFilters ? 'HIDE' : 'SHOW'}</button>
                            <button type="button" onClick={clearFilters} className="hidden text-sm font-medium text-gray-800 lg:block">CLEAR</button>
                        </div>
                        <div className={`${openFilters ? 'block' : 'hidden'} space-y-5 px-5 py-5 lg:block`}>
                            <div>
                                <p className="font-medium text-gray-800">Room Type</p>
                                {roomTypes.map((type) => <CheckBox key={type} label={type} selected={selectedTypes.includes(type)} onChange={(selected) => toggleRoomType(type, selected)} />)}
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Price Range</p>
                                {priceRanges.map((range) => <CheckBox key={range.label} label={range.label} selected={selectedRange?.label === range.label} onChange={(selected) => setSelectedRange(selected ? range : null)} />)}
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Sort By</p>
                                {sortOptions.map((option) => <RadioButton key={option} label={option} selected={sortBy === option} onChange={setSortBy} />)}
                            </div>
                        </div>
                    </aside>

                    <div className="order-1 flex flex-1 flex-col gap-6 lg:order-1">
                        {loadError && <p className="rounded-xl bg-amber-50 p-4 text-center text-amber-800">{loadError}</p>}
                        {rooms.map((room) => {
                            const roomId = room.id || room._id
                            const hotelName = room.hotel?.name || 'Hotel'
                            const city = room.hotel?.city || ''
                            const address = room.hotel?.address || ''
                            const mainImg = room.images?.[0] || assets.roomImg1

                            return (
                                <div key={roomId} className="flex w-full flex-col gap-5 rounded-xl bg-white p-4 shadow-lg md:flex-row">
                                    <img
                                        onClick={() => { navigate(`/rooms/${roomId}`); window.scrollTo(0, 0) }}
                                        src={mainImg}
                                        alt={`${hotelName} ${room.roomType}`}
                                        title="View Room Details"
                                        className="h-64 w-full cursor-pointer rounded-xl object-cover md:w-1/2"
                                        onError={(e) => {
                                            e.target.onerror = null
                                            e.target.src = assets.roomImg1
                                        }}
                                    />
                                    <div className="flex flex-1 flex-col gap-2">
                                        {city && <p className="text-gray-500">{city}</p>}
                                        <p onClick={() => { navigate(`/rooms/${roomId}`); window.scrollTo(0, 0) }} className="cursor-pointer font-playfair text-3xl text-gray-800 hover:text-orange-600 transition-colors">{hotelName}</p>
                                        <p className="text-gray-600 font-medium">{room.roomType}</p>
                                        <div className="flex items-center"><StarRating /><p className="ml-2 text-sm text-gray-600">200+ reviews</p></div>
                                        {address && <div className="mt-2 flex items-center gap-1 text-sm text-gray-500"><img src={assets.locationIcon} alt="Location" className="h-4 w-4" /><span>{address}</span></div>}
                                        <div className="mb-6 mt-3 flex flex-wrap items-center gap-4">
                                            {(room.amenities || []).map((item) => (
                                                <div key={item} className="flex items-center gap-1.5 bg-gray-100 rounded-md px-2.5 py-1">
                                                    {facilityIcons[item] && <img src={facilityIcons[item]} alt={item} className="h-4 w-4" />}
                                                    <p className="text-xs text-gray-700">{item}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="mt-auto pt-4 text-lg font-semibold text-gray-900">${room.pricePerNight}<span className="text-sm font-normal text-gray-500"> / night</span></p>
                                    </div>
                                </div>
                            )
                        })}
                        {rooms.length === 0 && <p className="rounded-xl bg-white p-8 text-center text-gray-500">No rooms match the selected filters.</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AllRooms