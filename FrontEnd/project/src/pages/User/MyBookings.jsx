import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaCalendarAlt, FaCar, FaMapMarkerAlt, FaEye, FaTimes, FaExclamationTriangle, FaUndo, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { getCurrentAndFutureBookings, cancelBooking, returnCar, processRefund, getPaymentStatus } from '../../services/bookingService'
import PageHeader from '../../components/UI/PageHeader'
import Spinner from '../../components/UI/Spinner'

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingBooking, setCancellingBooking] = useState(null)
  const [returningCar, setReturningCar] = useState(null)
  const [processingRefund, setProcessingRefund] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      // Fetch real bookings from API
      let apiBookings = []
      try {
        const data = await getCurrentAndFutureBookings()
        if (Array.isArray(data)) {
          apiBookings = data
        } else {
          console.warn('Unexpected API response format:', data)
        }
      } catch (apiError) {
        console.warn('API bookings not available:', apiError)
      }

      // Get test bookings from localStorage
      const testBookings = JSON.parse(localStorage.getItem('testBookings') || '[]')

      // Combine and sort bookings (newest first)
      const allBookings = [...apiBookings, ...testBookings].sort((a, b) =>
        new Date(b.createdAt || b.bookingDate || 0) - new Date(a.createdAt || a.bookingDate || 0)
      )

      console.log('All bookings (API + Test):', allBookings)
      setBookings(allBookings)

      if (testBookings.length > 0 && apiBookings.length === 0) {
        toast.info(`Showing ${testBookings.length} recent booking(s).`)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)

      // Fallback to just test bookings
      const testBookings = JSON.parse(localStorage.getItem('testBookings') || '[]')
      setBookings(testBookings)

      if (testBookings.length > 0) {
        toast.info('Showing recent bookings.')
      } else {
        toast.error('Failed to load your bookings. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }



  const handleCancelBooking = async (bookingId) => {
    if (cancellingBooking) return

    if (!window.confirm('Are you sure you want to cancel this booking? This will also process a refund if payment was made.')) {
      return
    }

    setCancellingBooking(bookingId)

    try {
      // Cancel the booking
      await cancelBooking(bookingId)

      // Try to process refund automatically
      try {
        await processRefund(bookingId)
        toast.success('Booking cancelled and refund processed successfully')
      } catch (refundError) {
        console.warn('Booking cancelled but refund failed:', refundError)
        toast.success('Booking cancelled successfully. Refund will be processed separately.')
      }

      fetchBookings() // Refresh the bookings list
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Failed to cancel booking. Please check your connection and try again.')
    } finally {
      setCancellingBooking(null)
    }
  }

  const handleReturnCar = async (bookingId) => {
    if (returningCar) return

    if (!window.confirm('Are you sure you want to return this car and complete the booking?')) {
      return
    }

    setReturningCar(bookingId)

    try {
      await returnCar(bookingId)
      toast.success('Car returned successfully. Booking completed.')
      fetchBookings() // Refresh the bookings list
    } catch (error) {
      console.error('Error returning car:', error)
      toast.error('Failed to return car. Please check your connection and try again.')
    } finally {
      setReturningCar(null)
    }
  }

  const handleProcessRefund = async (bookingId) => {
    if (processingRefund) return

    if (!window.confirm('Are you sure you want to process a refund for this cancelled booking?')) {
      return
    }

    setProcessingRefund(bookingId)

    try {
      await processRefund(bookingId)
      toast.success('Refund processed successfully')
      fetchBookings() // Refresh the bookings list
    } catch (error) {
      console.error('Error processing refund:', error)
      toast.error('Failed to process refund. Please check your connection and try again.')
    } finally {
      setProcessingRefund(null)
    }
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const clearTestBookings = () => {
    if (window.confirm('Are you sure you want to clear all recent bookings? This action cannot be undone.')) {
      localStorage.removeItem('testBookings')
      fetchBookings()
      toast.success('Recent bookings cleared successfully')
    }
  }

  const hasTestBookings = bookings.some(booking => booking.isTestBooking || booking.isMockBooking)

  return (
    <div>
      <PageHeader
        title="My Bookings"
        subtitle="View and manage your current and upcoming car rentals"
        image="https://images.pexels.com/photos/3786091/pexels-photo-3786091.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="large" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-card p-8">
            <FaCalendarAlt className="text-5xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Bookings Found</h2>
            <p className="text-gray-600 mb-6">You don't have any current or upcoming bookings.</p>
            <Link to="/user/dashboard" className="btn-primary">
              Browse Cars
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Your Bookings</h2>
              {hasTestBookings && (
                <button
                  onClick={clearTestBookings}
                  className="btn-outline-sm text-red-600 border-red-300 hover:bg-red-50"
                >
                  Clear Recent Bookings
                </button>
              )}
            </div>

            <div className="space-y-6">
              {bookings.map(booking => (
                <motion.div
                  key={booking.bookingId || booking.id}
                  className="bg-white rounded-xl shadow-card overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {booking.car?.brand} {booking.car?.model} {booking.car?.year || ''}
                        </h3>
                        <p className="text-gray-600">
                          {booking.referenceId || booking.bookingReference || `BOOK-${(booking.bookingId || booking.id).toString().padStart(6, '0')}`} • {booking.status}
                          {(booking.isTestBooking || booking.isMockBooking) && (
                            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              {booking.isMockBooking ? 'Demo' : 'Recent'}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                        <Link
                          to={`/user/booking/${booking.bookingId || booking.id}`}
                          className="btn-outline-sm flex items-center"
                        >
                          <FaEye className="mr-1" />
                          Details
                        </Link>

                        {booking.status === 'CONFIRMED' && (
                          <button
                            className="btn-danger-sm flex items-center"
                            onClick={() => handleCancelBooking(booking.bookingId || booking.id)}
                            disabled={cancellingBooking === (booking.bookingId || booking.id)}
                          >
                            {cancellingBooking === (booking.bookingId || booking.id) ? (
                              <span className="animate-spin mr-1">⏳</span>
                            ) : (
                              <FaTimes className="mr-1" />
                            )}
                            Cancel
                          </button>
                        )}

                        {booking.status === 'ACTIVE' && (
                          <button
                            className="btn-success-sm flex items-center"
                            onClick={() => handleReturnCar(booking.bookingId || booking.id)}
                            disabled={returningCar === (booking.bookingId || booking.id)}
                          >
                            {returningCar === (booking.bookingId || booking.id) ? (
                              <span className="animate-spin mr-1">⏳</span>
                            ) : (
                              <FaCheckCircle className="mr-1" />
                            )}
                            Return Car
                          </button>
                        )}

                        {booking.status === 'CANCELLED' && (
                          <button
                            className="btn-warning-sm flex items-center"
                            onClick={() => handleProcessRefund(booking.bookingId || booking.id)}
                            disabled={processingRefund === (booking.bookingId || booking.id)}
                          >
                            {processingRefund === (booking.bookingId || booking.id) ? (
                              <span className="animate-spin mr-1">⏳</span>
                            ) : (
                              <FaMoneyBillWave className="mr-1" />
                            )}
                            Process Refund
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                          <FaCar />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-600">Car</p>
                          <p className="font-medium">
                            {booking.car?.brand} {booking.car?.model} {booking.car?.year || ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                          <FaCalendarAlt />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-600">Rental Period</p>
                          <p className="font-medium">
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                          <FaMapMarkerAlt />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-medium">${booking.totalAmount || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {booking.status === 'PENDING' && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                        <FaExclamationTriangle className="text-yellow-500 mr-2" />
                        <p className="text-sm text-yellow-700">
                          Your booking is pending confirmation. We'll notify you once it's confirmed.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default MyBookings
