import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import Navbar from '../../components/Hotelowner/navbar.jsx'
import Sidebar from '../../components/Hotelowner/sidebar.jsx'

const Layout = () => {
  return (
    <>
      <SignedIn>
        <div className="flex h-screen flex-col bg-white">
          <Navbar />

          <div className="flex flex-1 overflow-hidden">
            <Sidebar />

            <div className="flex-1 overflow-y-auto p-4 pt-10 md:px-10">
              <Outlet />
            </div>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <Navigate to="/" replace />
      </SignedOut>
    </>
  )
}

export default Layout
