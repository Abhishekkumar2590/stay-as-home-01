import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/home'
import AllRooms from './pages/allrooms.jsx'
import RoomDetails from './pages/Roomseatils.jsx'
import MyBookings from './pages/MyBookings.jsx'
import Layout from './pages/HotelOwner/layout.jsx'
import Dashboard from './pages/HotelOwner/dashboard.jsx'
import AddRoom from './pages/HotelOwner/addroom.jsx'
import ListRoom from './pages/HotelOwner/listroom.jsx'

const App = () => {
  const isOwnerPath = useLocation().pathname.includes('owner')

  return (
    <div>
      {!isOwnerPath && <Navbar />}

      <main className="min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<AllRooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/my-bookings" element={<MyBookings />} />

          <Route path="/owner/*" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-room" element={<AddRoom />} />
            <Route path="list-room" element={<ListRoom />} />
          </Route>
        </Routes>
      </main>

      {!isOwnerPath && <Footer />}
    </div>
  )
}

export default App