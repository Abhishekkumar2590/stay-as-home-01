import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets, cities } from '../assets/assets.js'

const Hero = () => {
    const navigate = useNavigate()
    const [destination, setDestination] = useState('')
    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')
    const [guests, setGuests] = useState(1)

    const handleSearch = (e) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (destination) params.set('destination', destination)
        if (checkIn) params.set('checkIn', checkIn)
        if (checkOut) params.set('checkOut', checkOut)
        if (guests) params.set('guests', guests)

        navigate(`/rooms?${params.toString()}`)
        window.scrollTo(0, 0)
    }

    return (
        <section
            style={{ backgroundImage: `url(${assets.heroImage || assets.hero})` }}
            className="flex min-h-screen flex-col items-start justify-center bg-cover bg-center px-6 text-white md:px-16 lg:px-24 xl:px-32"
        >
            <p className="bg-[#49B9FF]/50 px-3.5 py-1 rounded-full mt-20 text-xs md:text-sm font-medium tracking-wide">The Ultimate Hotel Experience</p>
            <h1 className="font-playfair text-3xl md:text-5xl md:text-[56px] md:leading-[56px] font-bold md:font-extrabold max-w-xl mt-4">Discover Your Perfect Gateway Destination</h1>
            <p className="max-w-130 mt-2 text-sm md:text-base text-gray-200">Unparalleled luxury and comfort await at the world's most exclusive hotels and resorts. Start your journey today.</p>
             
            <form onSubmit={handleSearch} className='bg-white text-gray-700 rounded-xl px-6 py-4 mt-8 flex flex-col md:flex-row max-md:items-start gap-4 max-md:w-full max-md:mx-auto shadow-2xl'>
                <div>
                    <div className='flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                        <svg className="w-4 h-4 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16M8 14h8m-4-7V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z" />
                        </svg>
                        <label htmlFor="destinationInput">Destination</label>
                    </div>
                    <input
                        list='destinations'
                        id="destinationInput"
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none w-full focus:border-indigo-500"
                        placeholder="City (e.g. Paris)"
                    />
                    <datalist id='destinations'>
                        {cities.map((city, index) => (
                            <option value={city} key={index} />
                        ))}
                    </datalist>
                </div>

                <div>
                    <div className='flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                        <img src={assets.calenderIcon} alt="" className='h-4' />
                        <label htmlFor="checkIn">Check in</label>
                    </div>
                    <input
                        id="checkIn"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none w-full focus:border-indigo-500"
                    />
                </div>

                <div>
                    <div className='flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                        <img src={assets.calenderIcon} alt="" className='h-4' />
                        <label htmlFor="checkOut">Check out</label>
                    </div>
                    <input
                        id="checkOut"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none w-full focus:border-indigo-500"
                    />
                </div>

                <div className='flex md:flex-col max-md:gap-2 max-md:items-center'>
                    <label htmlFor="guests" className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Guests</label>
                    <input
                        min={1}
                        max={10}
                        id="guests"
                        type="number"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value) || 1)}
                        className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none max-w-16 w-full focus:border-indigo-500"
                        placeholder="1"
                    />
                </div>

                <button type="submit" className='flex items-center justify-center gap-2 rounded-lg bg-gray-900 hover:bg-black py-3 px-6 text-white my-auto cursor-pointer max-md:w-full transition-colors font-medium text-sm shadow-md' >
                    <img src={assets.searchIcon} alt="searchIcon" className='h-4 invert' />
                    <span>Search</span>
                </button>
            </form>
        </section>
    )
}

export default Hero

