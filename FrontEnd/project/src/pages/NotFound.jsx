import { Link } from 'react-router-dom'
import { FaCar, FaHome } from 'react-icons/fa'
import { motion } from 'framer-motion'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div 
        className="text-center max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FaCar className="mx-auto text-6xl text-primary-600 mb-6" />
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Page Not Found</h2>
        
        <p className="text-gray-600 mb-8">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link to="/" className="btn-primary flex items-center justify-center">
            <FaHome className="mr-2" />
            Return Home
          </Link>
          <Link to="/user/dashboard" className="btn-outline flex items-center justify-center">
            <FaCar className="mr-2" />
            Browse Cars
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound