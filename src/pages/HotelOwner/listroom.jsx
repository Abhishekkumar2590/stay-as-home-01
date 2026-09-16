import { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { getRooms, updateRoom, deleteRoom as removeRoom } from '../../lib/api.js'

export default function ListRoom() {
  const [rooms, setRooms] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    getRooms().then(setRooms).catch((error) => setMessage(error.message))
  }, [])

  const toggleAvailability = async (room) => {
    try {
      const updatedRoom = await updateRoom(room.id, { is_available: !room.isAvailable })
      setRooms((prevRooms) => prevRooms.map((item) => item.id === room.id ? { ...item, ...updatedRoom, isAvailable: updatedRoom.is_available } : item))
    } catch (error) {
      setMessage(error.message)
    }
  }

  const deleteRoom = async (roomId) => {
    try {
      await removeRoom(roomId)
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId))
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="space-y-6">
      <Title
        align="left"
        font="outfit"
        title="List Room"
        subTitle="View, edit, or manage all listed rooms. Keep the information up to date to provide the best experience for users."
      />

      <p className="text-gray-800 mt-10">All Rooms</p>
      {message && <p className="text-sm text-red-600">{message}</p>}

      <div className="w-full max-w-5xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-gray-800 font-medium text-left">Name</th>
              <th className="px-6 py-3 text-gray-800 font-medium text-left">Facility</th>
              <th className="px-6 py-3 text-gray-800 font-medium text-left">Price/night</th>
              <th className="px-6 py-3 text-gray-800 font-medium text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rooms.map((room, index) => (
              <tr key={room.id ?? room._id ?? index} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3 px-4 text-gray-800 border-t border-gray-200 font-medium">
                  <p>{room.hotel?.name || 'Hotel'}</p>
                  <p className="text-xs font-normal text-gray-500">{room.roomType}</p>
                </td>
                <td className="py-3 px-4 text-gray-600 border-t border-gray-200 max-w-sm:hidden text-xs">
                  {(room.amenities || []).join(', ') || 'Standard amenities'}
                </td>
                <td className="py-3 px-4 text-gray-900 border-t border-gray-200 font-semibold">${room.pricePerNight}</td>
                <td className="py-3 px-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer text-gray-900" title="Toggle availability">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={room.isAvailable}
                        onChange={() => toggleAvailability(room)}
                      />
                      <div className="w-12 h-7 bg-slate-300 rounded-full peer-checked:bg-green-500 transition-colors duration-300 relative">
                        <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5" />
                      </div>
                    </label>

                    <button
                      onClick={() => deleteRoom(room.id || room._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 text-xs rounded transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-500 text-sm">
                  No rooms created yet. <a href="/owner/add-room" className="text-indigo-600 font-medium hover:underline">Add your first room</a>.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  )
}