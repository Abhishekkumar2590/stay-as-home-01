import React from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'
import { assets } from '../../assets/assets'

const Sidebar = () => {
  const { signOut } = useClerk()
  const navigate = useNavigate()

  const sidebarLinks = [
    { name: 'Dashboard', path: '/owner', icon: assets.dashboardIcon },
    { name: 'Add Rooms', path: '/owner/add-room', icon: assets.addIcon },
    { name: 'List Room', path: '/owner/list-room', icon: assets.listIcon },
  ]

  const handleLogout = async () => {
    await signOut({ redirectUrl: '/' })
    navigate('/')
  }

  return (
    <div className="flex w-full flex-col justify-between border-r border-gray-200 bg-white pt-4 md:w-64">
      <div className="flex flex-col gap-2">
        {sidebarLinks.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            end={item.path === '/owner'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                isActive
                  ? 'bg-gray-200 text-gray-900 font-medium'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <img src={item.icon} alt={item.name} className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="flex flex-col gap-1 border-t border-gray-200 p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <img src={assets.homeIcon} alt="Home" className="h-4 w-4 opacity-70" />
          <span>Back to Website</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
