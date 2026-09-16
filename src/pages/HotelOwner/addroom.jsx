import { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { createRoom, getHotels, uploadRoomImage } from '../../lib/api.js'

const AddRoom = () => {
  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  })

  const [inputs, setInputs] = useState({
    hotel: '',
    roomType: '',
    pricePerNight: 0,
    amenities: {
      'Free WiFi': false,
      'Free Breakfast': false,
      'Room Service': false,
      'Mountain View': false,
      'Pool Access': false,
    },
  })
  const [hotels, setHotels] = useState([])
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchHotels = () => {
      getHotels().then(setHotels).catch((error) => setMessage({ type: 'error', text: error.message }))
    }
    fetchHotels()
    window.addEventListener('hotel-created', fetchHotels)
    return () => window.removeEventListener('hotel-created', fetchHotels)
  }, [])


  const handleImageChange = (event, key) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImages((prev) => ({ ...prev, [key]: file }))
  }

  const handleAmenityChange = (amenity) => {
    setInputs((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity],
      },
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage({ type: '', text: '' })

    const selectedImages = Object.values(images).filter(Boolean)
    if (!inputs.hotel || !inputs.roomType || inputs.pricePerNight <= 0) {
      setMessage({ type: 'error', text: 'Select a hotel, room type, and valid price.' })
      return
    }
    if (!selectedImages.length) {
      setMessage({ type: 'error', text: 'Upload at least one room photo.' })
      return
    }

    setIsSaving(true)
    try {
      const room = await createRoom({
        hotel: inputs.hotel,
        roomType: inputs.roomType,
        pricePerNight: inputs.pricePerNight,
        amenities: Object.keys(inputs.amenities).filter((amenity) => inputs.amenities[amenity]),
      })
      await Promise.all(selectedImages.map((image) => uploadRoomImage({ roomId: room.id, image })))
      setMessage({ type: 'success', text: 'Room and photos uploaded successfully.' })
      setImages({ 1: null, 2: null, 3: null, 4: null })
      setInputs((current) => ({ ...current, roomType: '', pricePerNight: 0 }))
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Title
        align="left"
        font="outfit"
        title="Add Room"
        subTitle="Enter the details of the room you want to add."
      />

      <p className="mt-10 text-gray-800">Images</p>

      <div className="flex flex-wrap gap-4">
        {Object.keys(images).map((key) => (
          <label htmlFor={`roomImages${key}`} key={key} className="cursor-pointer">
            <img
              src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea}
              alt="Room preview"
              className="h-24 w-24 rounded-lg border border-gray-300 object-cover"
            />
            <input
              type="file"
              accept="image/*"
              id={`roomImages${key}`}
              hidden
              onChange={(e) => handleImageChange(e, key)}
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex w-full max-w-xl flex-col gap-4">
        <div>
          <p className="mt-4 text-gray-800">Hotel</p>
          <select
            value={inputs.hotel}
            onChange={(e) => setInputs({ ...inputs, hotel: e.target.value })}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5"
            required
          >
            <option value="">Select Hotel</option>
            {hotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name} - {hotel.city}</option>)}
          </select>
          {!hotels.length && <p className="mt-2 text-sm text-gray-500">Add a hotel from the Admin panel first.</p>}
        </div>

        <div>
          <p className="mt-4 text-gray-800">Room type</p>
          <select
            value={inputs.roomType}
            onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5"
          >
            <option value="">Select Room Type</option>
            <option value="single">Single Bed</option>
            <option value="double">Double Bed</option>
            <option value="suite">Suite</option>
          </select>
        </div>

        <div>
          <p className="mt-4 text-gray-800">
            Price <span className="text-xs">/night</span>
          </p>
          <input
            type="number"
            className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            placeholder="0"
            value={inputs.pricePerNight}
            onChange={(e) =>
              setInputs({ ...inputs, pricePerNight: Number(e.target.value) })
            }
          />
        </div>

        <div>
          <p className="mt-4 text-xs text-gray-500">Amenities</p>
          <div className="mt-2 flex max-w-sm flex-col gap-2 text-gray-600">
            {Object.keys(inputs.amenities).map((amenity, index) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inputs.amenities[amenity]}
                  onChange={() => handleAmenityChange(amenity)}
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isSaving || !hotels.length} className="mt-6 mr-auto rounded bg-indigo-500 px-6 py-2 text-white transition-all hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60">
          {isSaving ? 'Uploading...' : 'Add Room & Photos'}
        </button>
        {message.text && <p className={message.type === 'success' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>{message.text}</p>}
      </div>
    </form>
  )
}

export default AddRoom
