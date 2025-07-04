import { useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { FaCheckCircle, FaCar, FaCalendarAlt, FaMapMarkerAlt, FaPrint, FaCreditCard, FaQrcode } from 'react-icons/fa'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

const BookingSuccess = () => {
  const { bookingId } = useParams()
  const location = useLocation()

  // Get info from location state, or use defaults
  const {
    totalPrice = 0,
    car = null,
    paymentMethod = 'card',
    transactionId = `TXN-${Math.floor(Math.random() * 1000000)}`,
    paymentDate = new Date().toISOString()
  } = location.state || {}

  // Launch confetti effect on page load
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }, [])

  // Generate booking reference with proper formatting
  const bookingReference = bookingId
    ? `BOOK-${bookingId.toString().padStart(6, '0')}`
    : `BOOK-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto bg-white rounded-xl shadow-card overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center px-6 py-8 bg-primary-600 text-white">
            <FaCheckCircle className="text-6xl mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-lg">Your car rental has been successfully booked.</p>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div>
                  <p className="text-gray-600 mb-1">Booking Reference</p>
                  <p className="text-xl font-bold">{bookingReference}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(paymentDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Transaction ID</p>
                  <p className="text-lg font-medium font-mono">{transactionId}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Payment via {paymentMethod === 'card' ? 'Credit/Debit Card' : 'UPI'}
                  </p>
                </div>
              </div>
              <div className="flex mt-4 md:mt-0">
                <button
                  className="btn-outline flex items-center"
                  onClick={() => window.print()}
                >
                  <FaPrint className="mr-2" />
                  Print
                </button>
              </div>
            </div>

            <div className="border-b pb-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Booking Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mt-1">
                    <FaCar />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Car</p>
                    <p className="font-medium">{car?.name || `${car?.brand || ''} ${car?.model || ''}`}</p>
                    <div className="mt-1 text-sm text-gray-600">
                      {car && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {car.brand && <div><span className="font-medium">Brand:</span> {car.brand}</div>}
                          {car.model && <div><span className="font-medium">Model:</span> {car.model}</div>}
                          {car.year && <div><span className="font-medium">Year:</span> {car.year}</div>}
                          {car.transmission && <div><span className="font-medium">Transmission:</span> {car.transmission}</div>}
                          {car.fuelType && <div><span className="font-medium">Fuel:</span> {car.fuelType}</div>}
                          {car.registrationNumber && (
                            <div className="col-span-2">
                              <span className="font-medium">Registration:</span> {car.registrationNumber}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                    <FaCalendarAlt />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Rental Period</p>
                    <p className="font-medium">
                      {location.state?.startDate && location.state?.endDate ? (
                        `${new Date(location.state.startDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} - ${new Date(location.state.endDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}`
                      ) : (
                        'Dates not available'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Pickup Location</p>
                    <p className="font-medium">{location.state?.pickupLocation || 'Main Office'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center">
                    {paymentMethod === 'card' ? <FaCreditCard /> : <FaQrcode />}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Payment</p>
                    <p className="font-medium">${totalPrice} - Paid via {paymentMethod === 'card' ? 'Credit/Debit Card' : 'UPI'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b pb-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">What's Next?</h2>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Pickup Instructions</h3>
                  <p className="text-gray-700">
                    Please arrive at the rental location at least 15 minutes before your scheduled pickup time.
                    Bring your driver's license, the payment card used for booking, and your booking confirmation.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Need to Make Changes?</h3>
                  <p className="text-gray-700">
                    You can modify or cancel your booking up to 48 hours before the scheduled pickup without any fees.
                    For any changes, please contact our customer service.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">Thank you for choosing DriveLuxe for your rental needs!</p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link to="/user/my-bookings" className="btn-primary">
                  View My Bookings
                </Link>
                <Link to="/" className="btn-outline">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default BookingSuccess