import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaSearch, FaCar, FaCreditCard, FaCheckCircle } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { getAllCars } from '../services/carService'
import LoadingFallback from '../components/UI/LoadingFallback'
import CarCard from '../components/Cars/CarCard'

const Home = () => {
  const [featuredCars, setFeaturedCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        console.log('Fetching featured cars...')
        const cars = await getAllCars({ limit: 6 })
        console.log('Featured cars:', cars)
        setFeaturedCars(cars)
        setError(null)
      } catch (error) {
        console.error('Error fetching featured cars:', error)

        // Don't show toast for now as it might be annoying during development
        // toast.error('Failed to load featured cars. Please try again later.')

        setError(null)

        // Set empty array for now - cars will be loaded from API
        setFeaturedCars([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedCars()
  }, [])

  // Hero section animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)',
            filter: 'brightness(0.7)'
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-2xl text-white"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
              variants={itemVariants}
            >
              Experience Luxury on Wheels
            </motion.h1>

            <motion.p
              className="text-xl mb-8"
              variants={itemVariants}
            >
              Rent the perfect car for your next adventure. Premium vehicles, flexible bookings, and exceptional service.
            </motion.p>

            <motion.div variants={itemVariants}>
              <Link
                to="/user/dashboard"
                className="btn-primary text-lg px-8 py-3"
              >
                Browse Cars
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white p-8 rounded-xl shadow-md text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="inline-flex items-center justify-center h-16 w-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                <FaCar className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Vehicles</h3>
              <p className="text-gray-600">
                Choose from our fleet of luxury and well-maintained vehicles for any occasion.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-xl shadow-md text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="inline-flex items-center justify-center h-16 w-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                <FaCreditCard className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Book with confidence using our secure and transparent payment system.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-xl shadow-md text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="inline-flex items-center justify-center h-16 w-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                <FaCheckCircle className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Simple and streamlined rental process from booking to return.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Cars</h2>
            <Link to="/user/dashboard" className="btn-outline">
              View All
            </Link>
          </div>

          {loading ? (
            <LoadingFallback message="Loading featured cars..." />
          ) : featuredCars.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured cars available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map(car => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Hit the Road?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who enjoy premium rental experiences with us.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/login" className="btn bg-white text-primary-700 hover:bg-gray-100">
              Sign In
            </Link>
            <Link to="/register" className="btn bg-accent-600 text-white hover:bg-accent-700">
              Register Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home