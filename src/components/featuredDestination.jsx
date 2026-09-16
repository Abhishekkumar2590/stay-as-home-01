import { useEffect, useState } from 'react'
import { roomsDummyData } from '../assets/assets.js'
import HotelCard from './HostelCard.jsx'
import Title from './Title.jsx'
import { getRooms } from '../lib/api.js'

const FeaturedDestination = () => {
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    getRooms()
      .then((data) => setRooms(data.length ? data.slice(0, 4) : roomsDummyData.slice(0, 4)))
      .catch(() => setRooms(roomsDummyData.slice(0, 4)))
  }, [])

  return (
    <section className="bg-[#f7f8fa] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="Featured Destination"
        subTitle="Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences."
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(rooms || []).map((room, index) => (
          <HotelCard key={room._id || room.id || index} room={room} index={index} />
        ))}
      </div>
      
      <button onClick={() => { window.location.href = '/rooms'; window.scrollTo(0, 0) }} className="my-16 cursor-pointer rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium transition-all hover:bg-gray-100">
        view all Destination 
      </button>
      </div>
    </section>
  )
}

export default FeaturedDestination
