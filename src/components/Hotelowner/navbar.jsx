
import React from 'react'
import { Link } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { assets } from '../../assets/assets'

const Navbar = () => {
  return (
    <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300">
      <Link to="/" className="flex items-center">
        <img src={assets.logo} alt="logo" className="h-9 invert opacity-80" />
      </Link>
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Website
        </Link>
        <UserButton fallbackRedirectUrl="/" />
      </div>
    </div>
  )
}

export default Navbar
