import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaCar, FaUser, FaEnvelope, FaPhone, FaIdCard, FaCheckCircle } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { createBooking } from '../../services/bookingService'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/UI/PageHeader'
import Spinner from '../../components/UI/Spinner'

const Booking = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Get car and date info from location state, or use empty defaults
  const { car = null, startDate = null, endDate = null, totalPrice = 0 } = location.state || {}

  const [bookingInfo, setBookingInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    driverLicense: '',
    pickupLocation: 'Main Office - 123 Rental St',
    specialRequests: ''
  })

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // If navigated directly without state, fetch car data
  useEffect(() => {
    if (!car && id) {
      // Redirect to car details to start the booking process properly
      navigate(`/user/cars/${id}`)
    }
  }, [car, id, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBookingInfo(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!bookingInfo.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!bookingInfo.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(bookingInfo.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!bookingInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!bookingInfo.driverLicense.trim()) {
      newErrors.driverLicense = 'Driver license is required'
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const bookingData = {
        carId: car.id,
        startDate,
        endDate,
        ...bookingInfo
      }

      console.log('Creating booking with data:', bookingData)
      const response = await createBooking(bookingData)
      console.log('Booking created successfully:', response)

      // Extract booking ID from response (backend returns nested structure)
      const bookingId = response.bookingId || response.booking?.id || response.id
      const bookingDetails = response.booking || response

      if (!bookingId) {
        throw new Error('No booking ID received from server')
      }

      const navigationState = {
        bookingId: bookingId,
        totalPrice,
        car,
        booking: bookingDetails
      }

      console.log('Navigating to payment with state:', navigationState)

      toast.success('Booking created successfully!')

      // Navigate to payment page with booking data
      navigate(`/user/payment/${bookingId}`, {
        state: navigationState
      })
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Could not create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Format dates for display
  const formatDateForDisplay = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, 'MMM dd, yyyy')
    } catch {
      return 'Invalid Date'
    }
  }

  // If navigated directly without required info, show error
  if (!car || !startDate || !endDate) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Booking Information Missing</h2>
        <p className="mb-6">Please select a car and dates before proceeding to booking.</p>
        <button
          onClick={() => navigate('/user/dashboard')}
          className="btn-primary"
        >
          Browse Cars
        </button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Complete Your Booking"
        subtitle="Just a few more details to secure your reservation"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-2xl font-semibold mb-6">Your Information</h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="form-group">
                    <label htmlFor="name" className="label flex items-center">
                      <FaUser className="mr-2 text-primary-600" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={bookingInfo.name}
                      onChange={handleInputChange}
                      className={`input ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="John Doe"
                      disabled={loading}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="label flex items-center">
                      <FaEnvelope className="mr-2 text-primary-600" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={bookingInfo.email}
                      onChange={handleInputChange}
                      className={`input ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="john@example.com"
                      disabled={loading}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="label flex items-center">
                      <FaPhone className="mr-2 text-primary-600" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={bookingInfo.phone}
                      onChange={handleInputChange}
                      className={`input ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="+1 (555) 123-4567"
                      disabled={loading}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="driverLicense" className="label flex items-center">
                      <FaIdCard className="mr-2 text-primary-600" />
                      Driver License Number
                    </label>
                    <input
                      type="text"
                      id="driverLicense"
                      name="driverLicense"
                      value={bookingInfo.driverLicense}
                      onChange={handleInputChange}
                      className={`input ${errors.driverLicense ? 'border-red-500' : ''}`}
                      placeholder="DL123456789"
                      disabled={loading}
                    />
                    {errors.driverLicense && <p className="text-red-500 text-sm mt-1">{errors.driverLicense}</p>}
                  </div>
                </div>

                <div className="form-group mb-6">
                  <label htmlFor="pickupLocation" className="label">Pickup Location</label>
                  <select
                    id="pickupLocation"
                    name="pickupLocation"
                    value={bookingInfo.pickupLocation}
                    onChange={handleInputChange}
                    className="input"
                    disabled={loading}
                  >
                    <option value="Main Office - 123 Rental St">Main Office - 123 Rental St</option>
                    <option value="Downtown Branch - 456 City Ave">Downtown Branch - 456 City Ave</option>
                    <option value="Airport Terminal - 789 Flight Blvd">Airport Terminal - 789 Flight Blvd</option>
                  </select>
                </div>

                <div className="form-group mb-6">
                  <label htmlFor="specialRequests" className="label">Special Requests (Optional)</label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={bookingInfo.specialRequests}
                    onChange={handleInputChange}
                    className="input h-24"
                    placeholder="Any special requirements or requests..."
                    disabled={loading}
                  ></textarea>
                </div>

                <div className="mb-6">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={() => setTermsAccepted(!termsAccepted)}
                      className="mt-1"
                      disabled={loading}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the <a href="#" className="text-primary-600 hover:underline">Terms and Conditions</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>. I confirm that I am at least 21 years old and have a valid driver's license.
                    </label>
                  </div>
                  {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms}</p>}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary px-8"
                    disabled={loading}
                  >
                    {loading ? <Spinner size="small" className="mr-2" /> : null}
                    Proceed to Payment
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>

              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={car.imageUrl || "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800"}
                    alt={car.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">{car.name}</h3>
                  <p className="text-sm text-gray-600">{car.year} · {car.transmission}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex items-center mb-2">
                  <FaCalendarAlt className="text-primary-600 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">Pickup Date</div>
                    <div>{formatDateForDisplay(startDate)}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-primary-600 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">Return Date</div>
                    <div>{formatDateForDisplay(endDate)}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span>Base Rate</span>
                  <span>${car.pricePerDay}/day</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Duration</span>
                  <span>{Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} days</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Insurance</span>
                  <span>Included</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2 font-semibold flex justify-between">
                  <span>Total Price</span>
                  <span className="text-primary-600">${totalPrice}</span>
                </div>
              </div>

              <div className="mt-4 bg-gray-50 p-3 rounded-lg text-sm">
                <div className="flex items-start">
                  <FaCheckCircle className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                  <p>Free cancellation up to 48 hours before pickup.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Booking