import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { FaCar, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  // Change navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
  }`

  const linkClasses = ({ isActive }) =>
    `font-medium transition-colors duration-200 ${
      isActive
        ? 'text-primary-600'
        : `${isScrolled ? 'text-gray-800' : 'text-gray-800'} hover:text-primary-600`
    }`

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <FaCar className="text-2xl text-primary-600" />
          <span className="text-xl font-heading font-bold">DriveLuxe</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" className={linkClasses} end>Home</NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
                className={linkClasses}
              >
                Dashboard
              </NavLink>

              {!isAdmin && isAuthenticated && (
                <NavLink
                  to="/user/my-bookings"
                  className={linkClasses}
                >
                  My Bookings
                </NavLink>
              )}

              <div className="relative group">
                <button className="flex items-center space-x-1">
                  <FaUserCircle className="text-primary-600" />
                  <span className="font-medium">{user?.name || 'User'}</span>
                </button>

                <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="px-4 py-3">
                    <p className="text-sm">{user?.email}</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {isAdmin ? 'Administrator' : 'Customer'}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClasses}>Sign In</NavLink>
              <NavLink to="/register" className="btn-primary">Register</NavLink>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-800" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <NavLink to="/" className={linkClasses} end>Home</NavLink>

              {isAuthenticated ? (
                <>
                  <NavLink
                    to={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
                    className={linkClasses}
                  >
                    Dashboard
                  </NavLink>

                  {!isAdmin && (
                    <NavLink
                      to="/user/my-bookings"
                      className={linkClasses}
                    >
                      My Bookings
                    </NavLink>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaUserCircle className="text-primary-600" />
                      <span>{user?.name || 'User'}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{user?.email}</p>
                    <button
                      onClick={logout}
                      className="w-full btn-outline text-sm"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={linkClasses}>Sign In</NavLink>
                  <NavLink to="/register" className="btn-primary text-center">Register</NavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar