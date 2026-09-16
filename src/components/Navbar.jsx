import { useEffect, useState } from 'react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import Hotelreg from './Hotelreg.jsx'


const LOCAL_ADMIN_URL = 'http://127.0.0.1:8000/manage/'

const getAdminUrl = () => {
  const configuredApiUrl = import.meta.env.VITE_API_URl
  if (configuredApiUrl) {
    return `${configuredApiUrl.replace(/\/api\/?$/, '')}/manage/`
  }
  return LOCAL_ADMIN_URL
}

const adminUrl = getAdminUrl()

const Navbar = () => {
  const navigate = useNavigate()
  const [isHotelRegOpen, setIsHotelRegOpen] = useState(false)
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Hotels', path: '/rooms' },
    { name: 'Experience', path: '/#experience' },
    { name: 'About', path: '/#about' },
  ]

  const handleNavClick = (event, path) => {
    if (path.startsWith('/#')) {
      event.preventDefault()

      const targetId = path.replace('/#', '')
      const target = document.getElementById(targetId)

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (window.location.pathname !== '/') {
        window.location.href = path
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const [isScrolled, setIsScrolled] = useState(() => window.location.pathname !== '/')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  useEffect(() => {
    if (window.location.pathname !== '/') {
      return undefined;
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const buttonStyle = isScrolled ? 'text-white bg-black' : 'bg-white text-black'
  const outlineStyle = isScrolled ? 'border-gray-700 text-gray-700' : 'border-white text-white'
  const bookingIcon = (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path d="M6 3v3m12-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm4 8h6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
  const dashboardIcon = (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path d="M4 4h6v8H4V4zm10 0h6v5h-6V4zm0 9h6v7h-6v-7zM4 16h6v4H4v-4z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )

  return (
    <>
      <nav className={`fixed top-0 left-0 z-50 flex w-full items-center justify-between px-4 transition-all duration-500 md:px-16 lg:px-24 xl:px-32 ${isScrolled ? 'bg-white/80 py-3 text-gray-700 shadow-md backdrop-blur-lg md:py-4' : 'py-4 md:py-6'}`}>
        <a href="/" className="flex items-center">
          <img src={assets.logo} alt="Hotel logo" className={`h-9 ${isScrolled ? 'invert opacity-80' : ''}`} />
        </a>

        <div className="hidden items-center gap-4 md:flex lg:gap-8">
          {navLinks.map((link) => (
            <a key={link.name} href={link.path} onClick={(event) => handleNavClick(event, link.path)} className={`group flex flex-col gap-0.5 ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
              {link.name}
              <div className={`${isScrolled ? 'bg-gray-700' : 'bg-white'} h-0.5 w-0 transition-all duration-300 group-hover:w-full`} />
            </a>
          ))}
          <button
            type="button"
            onClick={() => setIsHotelRegOpen(true)}
            className={`text-sm font-medium transition-colors hover:underline cursor-pointer ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            List Hotel
          </button>
          <a
            href="/owner"
            className={`text-sm font-medium transition-colors hover:underline cursor-pointer ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            Manage
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a href={adminUrl} target="_blank" rel="noreferrer" className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${isScrolled ? 'border-gray-700 text-gray-700 hover:bg-gray-900 hover:text-white' : 'border-white text-white hover:bg-white hover:text-gray-900'}`}>
            Admin Panel
          </a>
          <button
            type="button"
            onClick={() => { navigate('/rooms'); window.scrollTo(0, 0) }}
            className="cursor-pointer"
            title="Search Hotels"
          >
            <img src={assets.searchIcon} alt="Search" className={`h-7 transition-all duration-500 ${isScrolled ? 'invert' : ''}`} />
          </button>
          <SignedOut>
            <SignInButton mode="modal"><button type="button" className={`rounded-full px-5 py-2.5 transition-all duration-500 cursor-pointer ${buttonStyle}`}>Sign in</button></SignInButton>
            <SignUpButton mode="modal"><button type="button" className={`rounded-full border px-5 py-2.5 transition-all duration-500 cursor-pointer ${outlineStyle}`}>Sign up</button></SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton fallbackRedirectUrl="/">
              <UserButton.MenuItems>
                <UserButton.Link href="/my-bookings" label="My bookings" labelIcon={bookingIcon} />
                <UserButton.Link href="/owner" label="Manage / Owner Dashboard" labelIcon={dashboardIcon} />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
        </div>


        <div className="flex items-center gap-3 md:hidden">
          <SignedIn>
            <UserButton fallbackRedirectUrl="/">
              <UserButton.MenuItems>
                <UserButton.Link href="/my-bookings" label="My bookings" labelIcon={bookingIcon} />
                <UserButton.Link href="/owner" label="Owner Dashboard" labelIcon={dashboardIcon} />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
          <button type="button" aria-label="Open navigation menu" onClick={() => setIsMenuOpen(true)}>
            <img src={assets.menuIcon} alt="" className={`h-7 transition-all duration-500 ${isScrolled ? 'invert' : ''}`} />
          </button>
        </div>

        <div className={`fixed top-0 left-0 flex h-screen w-full flex-col items-center justify-center gap-6 bg-white text-base font-medium text-gray-800 transition-all duration-500 md:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button type="button" className="absolute top-4 right-4" aria-label="Close navigation menu" onClick={() => setIsMenuOpen(false)}>
            <img src={assets.closeIcon} alt="" className="h-5" />
          </button>
          {navLinks.map((link) => <a key={link.name} href={link.path} onClick={(event) => { handleNavClick(event, link.path); setIsMenuOpen(false) }}>{link.name}</a>)}
          <button
            type="button"
            onClick={() => { setIsMenuOpen(false); setIsHotelRegOpen(true) }}
            className="text-indigo-600 font-medium"
          >
            List Your Hotel
          </button>
          <a href={adminUrl} target="_blank" rel="noreferrer" onClick={() => setIsMenuOpen(false)} className="rounded-full bg-gray-900 px-8 py-2.5 text-white transition-colors hover:bg-gray-700">
            Admin Panel
          </a>
          <SignedOut>
            <SignInButton mode="modal"><button type="button" className="rounded-full bg-black px-8 py-2.5 text-white">Sign in</button></SignInButton>
            <SignUpButton mode="modal"><button type="button" className="rounded-full border border-black px-8 py-2.5">Sign up</button></SignUpButton>
          </SignedOut>
          <SignedIn>
            <a
              href="/my-bookings"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-full border border-gray-800 px-6 py-2 text-sm font-normal transition-colors hover:bg-gray-900 hover:text-white"
            >
              My Bookings
            </a>
            <a
              href="/owner"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-normal text-white transition-colors hover:bg-indigo-700"
            >
              Owner Dashboard
            </a>
          </SignedIn>
        </div>
      </nav>
      <Hotelreg isOpen={isHotelRegOpen} onClose={() => setIsHotelRegOpen(false)} onSuccess={() => window.dispatchEvent(new CustomEvent('hotel-created'))} />
    </>
  )
}

export default Navbar

