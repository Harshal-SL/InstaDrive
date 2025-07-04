import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaSearch, FaCalendarAlt, FaCar, FaEye } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { getAllCars } from '../../services/carService'
import { getCurrentAndFutureBookings } from '../../services/bookingService'
import PageHeader from '../../components/UI/PageHeader'
import CarCard from '../../components/Cars/CarCard'
import CarFilters from '../../components/Cars/CarFilters'
import Spinner from '../../components/UI/Spinner'

const UserDashboard = () => {
  const [cars, setCars] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true)
        const carsData = await getAllCars(filters)
        setCars(carsData)
      } catch (error) {
        console.error('Error fetching cars:', error)
        toast.error('Failed to load cars. Please try again later.')
        setCars([])
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [filters])

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setBookingsLoading(true)
        const bookingsData = await getCurrentAndFutureBookings()
        setBookings(bookingsData)
      } catch (error) {
        console.error('Error fetching bookings:', error)
        // Don't show error toast for bookings as it's not critical
        setBookings([])
      } finally {
        setBookingsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters({ ...filters, search: searchTerm })
  }

  // Filter cars by search term on the client side if API doesn't support it
  const filteredCars = searchTerm && !filters.search
    ? cars.filter(car =>
        car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cars

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div>
      <PageHeader
        title="User Dashboard"
        subtitle="Manage your bookings and browse our premium car collection"
        image="https://images.pexels.com/photos/3786091/pexels-photo-3786091.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />

      <div className="container mx-auto px-4 py-8">
        {/* My Bookings Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Bookings</h2>
            <Link to="/user/my-bookings" className="btn-outline">
              View All Bookings
            </Link>
          </div>

          {bookingsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="medium" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-card p-8 text-center">
              <FaCalendarAlt className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Bookings</h3>
              <p className="text-gray-600 mb-4">You don't have any current or upcoming bookings.</p>
              <p className="text-gray-500">Browse our cars below to make your first booking!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.slice(0, 3).map(booking => (
                <motion.div
                  key={booking.bookingId}
                  className="bg-white rounded-xl shadow-card overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{booking.car?.brand} {booking.car?.model}</h3>
                        <p className="text-sm text-gray-600">{booking.referenceId}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <FaCalendarAlt className="mr-2" />
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FaCar className="mr-2" />
                        ${booking.totalAmount}
                      </div>
                    </div>

                    <Link
                      to={`/user/booking/${booking.bookingId}`}
                      className="btn-outline-sm w-full flex items-center justify-center"
                    >
                      <FaEye className="mr-2" />
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Browse Cars Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Browse Our Fleet</h2>

          {/* Search */}
          <div className="mb-6">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for cars, models, brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 pr-16 py-3"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FaSearch className="text-gray-400" />
                </div>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary py-1"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Filters */}
          <CarFilters onFilterChange={handleFilterChange} initialFilters={filters} />

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="large" />
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold mb-2">No cars found</h3>
              <p className="text-gray-600">Try adjusting your search filters</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {filteredCars.map(car => (
                <CarCard key={car.id} car={car} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard