import React, { useState } from 'react'
import { assets, cities } from '../assets/assets'
import { createHotel, uploadHotelImage } from '../lib/api.js'

const Hotelreg = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: cities[0] || 'Paris',
    description: '',
  })
  const [image, setImage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      const hotel = await createHotel({
        name: formData.name,
        address: formData.address,
        city: formData.city,
        description: formData.description || `Luxury accommodation in ${formData.city}. Contact: ${formData.phone}`,
        owner_name: 'Hotel Partner',
        owner_email: '',
      })

      if (image && hotel?.id) {
        await uploadHotelImage({ hotelId: hotel.id, image, altText: formData.name })
      }

      setMessage({ type: 'success', text: 'Hotel registered successfully!' })
      setFormData({ name: '', phone: '', address: '', city: cities[0] || 'Paris', description: '' })
      setImage(null)
      if (onSuccess) onSuccess(hotel)
      setTimeout(() => {
        if (onClose) onClose()
      }, 1500)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to register hotel.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl relative">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex flex-col md:w-1/2">
            <label htmlFor="regHotelImage" className="cursor-pointer group relative block h-48 md:h-full rounded-xl overflow-hidden bg-gray-100 border border-dashed border-gray-300">
              <img
                src={image ? URL.createObjectURL(image) : assets.regImage}
                alt="Hotel register"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {image ? 'Change Photo' : 'Click to Upload Photo'}
              </div>
              <input
                id="regHotelImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-playfair text-2xl font-semibold text-gray-800">Register Your Hotel</p>
              <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
                <img src={assets.closeIcon} alt="close" className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 w-full">
              <label htmlFor="name" className="text-xs font-medium text-gray-600">Hotel Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Grand Palace Resort"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="mt-3 w-full">
              <label htmlFor="contact" className="text-xs font-medium text-gray-600">Phone / Contact</label>
              <input
                id="contact"
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 890"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="mt-3 w-full">
              <label htmlFor="address" className="text-xs font-medium text-gray-600">Address</label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 124 Ocean Avenue"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="mt-3">
              <label htmlFor="city" className="text-xs font-medium text-gray-600">City</label>
              <select
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {message.text && (
              <p className={`mt-3 text-xs font-medium ${message.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                {message.text}
              </p>
            )}

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-medium text-white transition-all hover:bg-indigo-700 disabled:opacity-60 cursor-pointer shadow-sm"
              >
                {isSubmitting ? 'Registering...' : 'Register Hotel'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Hotelreg