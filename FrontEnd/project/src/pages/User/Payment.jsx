import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { FaCreditCard, FaLock, FaCalendarAlt, FaUser, FaMobileAlt, FaQrcode } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { processCardPayment, processUpiPayment } from '../../services/paymentService'
import { getBookingById } from '../../services/bookingService'
import { getCarById } from '../../services/carService'
import PageHeader from '../../components/UI/PageHeader'
import Spinner from '../../components/UI/Spinner'

const Payment = () => {
  const { bookingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // Get info from location state, or use defaults
  const locationState = location.state || {}

  const [bookingData, setBookingData] = useState({
    totalPrice: locationState.totalPrice || 0,
    car: locationState.car || null,
    booking: null
  })

  const [paymentMethod, setPaymentMethod] = useState('card') // 'card' or 'upi'

  const [paymentInfo, setPaymentInfo] = useState({
    // Card payment fields
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',

    // UPI payment fields
    upiId: '',
    upiMobile: ''
  })

  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Load booking data when component mounts or when bookingId changes
  useEffect(() => {
    const loadBookingData = async () => {
      if (!bookingId) {
        console.error('No booking ID provided')
        return
      }

      // If we already have all required data from navigation state, don't fetch
      if (locationState.car && locationState.totalPrice > 0) {
        console.log('Using data from navigation state:', locationState)
        return
      }

      console.log('Loading booking data for ID:', bookingId)
      setDataLoading(true)

      try {
        // Fetch booking details
        const booking = await getBookingById(bookingId)
        console.log('Fetched booking:', booking)

        if (!booking) {
          throw new Error('Booking not found')
        }

        // Fetch car details if not available
        let car = locationState.car
        if (!car && booking.carId) {
          console.log('Fetching car details for ID:', booking.carId)
          car = await getCarById(booking.carId)
          console.log('Fetched car:', car)
        }

        // Calculate total price if not available
        let totalPrice = locationState.totalPrice
        if (!totalPrice && booking.totalAmount) {
          totalPrice = booking.totalAmount
        }

        // Update booking data state
        setBookingData({
          totalPrice,
          car,
          booking
        })

        console.log('Updated booking data:', { totalPrice, car, booking })

      } catch (error) {
        console.error('Error loading booking data:', error)
        toast.error('Failed to load booking information')
        // Redirect to dashboard if we can't load the booking
        navigate('/user/dashboard')
      } finally {
        setDataLoading(false)
      }
    }

    loadBookingData()
  }, [bookingId, navigate, locationState.car, locationState.totalPrice])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    let formattedValue = value

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
    }

    // Format expiry date with slash
    if (name === 'expiryDate') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1/$2')
        .slice(0, 5)
    }

    // Format CVV to max 3 or 4 digits
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
    }

    // Format UPI ID
    if (name === 'upiId') {
      // Allow only alphanumeric characters, @, and .
      formattedValue = value.replace(/[^a-zA-Z0-9@.]/g, '')
    }

    // Format mobile number
    if (name === 'upiMobile') {
      // Allow only numbers and limit to 10 digits
      formattedValue = value.replace(/\D/g, '').slice(0, 10)
    }

    setPaymentInfo(prev => ({ ...prev, [name]: formattedValue }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method)
    // Clear errors when switching payment methods
    setErrors({})
  }

  const validateForm = () => {
    const newErrors = {}

    if (paymentMethod === 'card') {
      // Validate card payment fields
      if (!paymentInfo.cardName.trim()) {
        newErrors.cardName = 'Name on card is required'
      }

      if (!paymentInfo.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required'
      } else if (paymentInfo.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Card number must be 16 digits'
      }

      if (!paymentInfo.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required'
      } else if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
        newErrors.expiryDate = 'Expiry date must be in MM/YY format'
      }

      if (!paymentInfo.cvv.trim()) {
        newErrors.cvv = 'CVV is required'
      } else if (paymentInfo.cvv.length < 3) {
        newErrors.cvv = 'CVV must be 3 or 4 digits'
      }
    } else if (paymentMethod === 'upi') {
      // Validate UPI payment fields
      if (!paymentInfo.upiId.trim()) {
        newErrors.upiId = 'UPI ID is required'
      } else if (!paymentInfo.upiId.includes('@')) {
        newErrors.upiId = 'Please enter a valid UPI ID (e.g., name@upi)'
      }

      if (!paymentInfo.upiMobile.trim()) {
        newErrors.upiMobile = 'Mobile number is required'
      } else if (paymentInfo.upiMobile.length !== 10) {
        newErrors.upiMobile = 'Mobile number must be 10 digits'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      let response;
      const { totalPrice, car } = bookingData

      if (paymentMethod === 'card') {
        // Prepare card payment data
        const cardPaymentData = {
          bookingId: parseInt(bookingId),
          paymentMethod: 'card',
          amount: totalPrice,
          receiptEmail: 'customer@example.com',
          cardNumber: paymentInfo.cardNumber.replace(/\s/g, ''),
          expiryDate: paymentInfo.expiryDate,
          cvv: paymentInfo.cvv,
          cardDetails: {
            cardNumber: paymentInfo.cardNumber.replace(/\s/g, ''),
            cardName: paymentInfo.cardName,
            expiryDate: paymentInfo.expiryDate,
            cvv: paymentInfo.cvv
          }
        }

        console.log('Processing card payment with data:', cardPaymentData)
        // Process the card payment
        response = await processCardPayment(cardPaymentData)
      } else {
        // Prepare UPI payment data
        const upiPaymentData = {
          bookingId: parseInt(bookingId),
          paymentMethod: 'upi',
          amount: totalPrice,
          receiptEmail: 'customer@example.com',
          upiId: paymentInfo.upiId,
          upiDetails: {
            upiId: paymentInfo.upiId,
            mobileNumber: paymentInfo.upiMobile
          }
        }

        console.log('Processing UPI payment with data:', upiPaymentData)
        // Process the UPI payment
        response = await processUpiPayment(upiPaymentData)
      }

      // Use transaction ID from response or generate one
      const transactionId = response?.transactionId ||
        `TXN${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`

      // Use payment date from response or generate one
      const paymentDate = response?.paymentDate || new Date().toISOString()

      // Generate a booking reference number if bookingId is not available
      const bookingReference = bookingId ||
        (response?.bookingId ? response.bookingId : Math.floor(Math.random() * 1000000).toString())

      toast.success(`Payment successful via ${paymentMethod.toUpperCase()}!`)
      navigate(`/user/booking-success/${bookingReference}`, {
        state: {
          bookingId: bookingReference,
          totalPrice,
          car,
          paymentMethod,
          transactionId,
          paymentDate
        }
      })
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(`${paymentMethod.toUpperCase()} payment processing failed. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  // Show loading spinner while fetching data
  if (dataLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Spinner size="large" />
        <p className="mt-4 text-gray-600">Loading payment information...</p>
      </div>
    )
  }

  // If navigated directly without required info, provide test data
  if (!bookingId) {
    // Set up test data for payment page testing
    const bookingData = {
      totalPrice: 150.00,
      car: {
        id: 1,
        brand: "Tesla",
        model: "Model 3",
        year: 2023,
        transmission: "Automatic",
        imageUrl: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      booking: {
        id: 'BK-001',
        referenceId: 'REF-BK-001',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        carId: 1,
        userId: 1,
        totalAmount: 150.00
      }
    }

    return (
      <div>
        <PageHeader
          title="Complete Your Payment"
          subtitle="Secure payment processing for your car rental booking"
        />

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Secure Payment Processing
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your payment information is encrypted and processed securely. Complete your booking by selecting a payment method below.</p>
                  </div>
                </div>
              </div>
            </div>

            <TestPaymentForm testData={bookingData} />
          </div>
        </div>
      </div>
    )
  }

  // If we still don't have the required data after loading, show error
  if (!bookingData.car || !bookingData.totalPrice) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Booking Information Incomplete</h2>
        <p className="mb-6">Unable to load complete booking information. Please try again.</p>
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
        title="Secure Payment"
        subtitle="Complete your booking with our secure payment system"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <motion.div
                className="bg-white rounded-xl shadow-card p-6 sticky top-24"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>

                {bookingData.car && (
                  <>
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={bookingData.car.imageUrl || "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800"}
                          alt={`${bookingData.car.brand} ${bookingData.car.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold">{bookingData.car.brand} {bookingData.car.model}</h4>
                        <p className="text-sm text-gray-600">{bookingData.car.year} · {bookingData.car.transmission}</p>
                      </div>
                    </div>

                    {bookingData.booking && (
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Pickup Date:</span>
                          <span className="font-medium">{new Date(bookingData.booking.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Return Date:</span>
                          <span className="font-medium">{new Date(bookingData.booking.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Booking ID:</span>
                          <span className="font-medium">{bookingData.booking.referenceId || bookingId}</span>
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-primary-600">${bookingData.totalPrice}</span>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-2">
              <motion.div
                className="bg-white rounded-xl shadow-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Payment Details</h2>
                    <div className="flex items-center text-primary-600">
                      <FaLock className="mr-1" />
                      <span className="text-sm">Secure Payment</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange('card')}
                    className={`flex items-center rounded-lg p-3 transition duration-200 ${
                      paymentMethod === 'card'
                        ? 'bg-primary-100 border-2 border-primary-600'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className={`w-12 h-8 rounded-md flex items-center justify-center ${
                      paymentMethod === 'card' ? 'bg-primary-600' : 'bg-gray-400'
                    }`}>
                      <FaCreditCard className="text-white" />
                    </div>
                    <span className="ml-2 text-sm font-medium">Credit/Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange('upi')}
                    className={`flex items-center rounded-lg p-3 transition duration-200 ${
                      paymentMethod === 'upi'
                        ? 'bg-primary-100 border-2 border-primary-600'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className={`w-12 h-8 rounded-md flex items-center justify-center ${
                      paymentMethod === 'upi' ? 'bg-primary-600' : 'bg-gray-400'
                    }`}>
                      <FaQrcode className="text-white" />
                    </div>
                    <span className="ml-2 text-sm font-medium">UPI Payment</span>
                  </button>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="cardName" className="label flex items-center">
                        <FaUser className="mr-2 text-primary-600" />
                        Name on Card
                      </label>
                      <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        value={paymentInfo.cardName}
                        onChange={handleInputChange}
                        className={`input ${errors.cardName ? 'border-red-500' : ''}`}
                        placeholder="John Doe"
                        disabled={loading}
                      />
                      {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="cardNumber" className="label flex items-center">
                        <FaCreditCard className="mr-2 text-primary-600" />
                        Card Number
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={handleInputChange}
                        className={`input ${errors.cardNumber ? 'border-red-500' : ''}`}
                        placeholder="1234 5678 9012 3456"
                        disabled={loading}
                      />
                      {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="expiryDate" className="label flex items-center">
                          <FaCalendarAlt className="mr-2 text-primary-600" />
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          value={paymentInfo.expiryDate}
                          onChange={handleInputChange}
                          className={`input ${errors.expiryDate ? 'border-red-500' : ''}`}
                          placeholder="MM/YY"
                          disabled={loading}
                        />
                        {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="cvv" className="label flex items-center">
                          <FaLock className="mr-2 text-primary-600" />
                          CVV
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={paymentInfo.cvv}
                          onChange={handleInputChange}
                          className={`input ${errors.cvv ? 'border-red-500' : ''}`}
                          placeholder="123"
                          disabled={loading}
                        />
                        {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                      </div>
                    </div>

                    {/* Test Card Note */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">For Testing: Use these card details</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Card Number:</p>
                          <p className="font-mono">4242 4242 4242 4242</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Expiry & CVV:</p>
                          <p className="font-mono">12/30 - 123</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* UPI Payment Form */}
                {paymentMethod === 'upi' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="upiId" className="label flex items-center">
                        <FaQrcode className="mr-2 text-primary-600" />
                        UPI ID
                      </label>
                      <input
                        type="text"
                        id="upiId"
                        name="upiId"
                        value={paymentInfo.upiId}
                        onChange={handleInputChange}
                        className={`input ${errors.upiId ? 'border-red-500' : ''}`}
                        placeholder="yourname@upi"
                        disabled={loading}
                      />
                      {errors.upiId && <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="upiMobile" className="label flex items-center">
                        <FaMobileAlt className="mr-2 text-primary-600" />
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        id="upiMobile"
                        name="upiMobile"
                        value={paymentInfo.upiMobile}
                        onChange={handleInputChange}
                        className={`input ${errors.upiMobile ? 'border-red-500' : ''}`}
                        placeholder="10-digit mobile number"
                        disabled={loading}
                      />
                      {errors.upiMobile && <p className="text-red-500 text-sm mt-1">{errors.upiMobile}</p>}
                    </div>

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FaQrcode className="text-primary-600 mr-2" />
                        <h3 className="text-sm font-medium text-gray-700">How UPI Payment Works</h3>
                      </div>
                      <ol className="text-sm text-gray-600 list-decimal pl-4 space-y-1">
                        <li>Enter your UPI ID and mobile number</li>
                        <li>Click "Pay Now" to initiate payment</li>
                        <li>You'll receive a payment request on your UPI app</li>
                        <li>Approve the payment in your UPI app</li>
                      </ol>

                      <div className="mt-4 p-3 bg-primary-50 rounded border border-primary-100">
                        <p className="text-sm text-primary-700">
                          <strong>For Testing:</strong> Use UPI ID "test@upi" and any 10-digit mobile number
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount</span>
                  <span className="text-primary-600">${bookingData.totalPrice}</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center text-gray-600 text-sm">
                  <FaLock className="mr-2" />
                  <span>
                    {paymentMethod === 'card'
                      ? 'All card information is securely encrypted'
                      : 'Your UPI transaction is secure and protected'}
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full md:w-auto px-8"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="small" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'card' ? <FaCreditCard className="mr-2" /> : <FaQrcode className="mr-2" />}
                      Pay ${bookingData.totalPrice} with {paymentMethod === 'card' ? 'Card' : 'UPI'}
                    </>
                  )}
                </button>
              </div>


                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Test Payment Form Component for testing payment functionality
const TestPaymentForm = ({ testData }) => {
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    upiMobile: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
    }

    // Format expiry date with slash
    if (name === 'expiryDate') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1/$2')
        .slice(0, 5)
    }

    // Format CVV to max 3 or 4 digits
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
    }

    // Format UPI ID
    if (name === 'upiId') {
      formattedValue = value.replace(/[^a-zA-Z0-9@.]/g, '')
    }

    // Format mobile number
    if (name === 'upiMobile') {
      formattedValue = value.replace(/\D/g, '').slice(0, 10)
    }

    setPaymentInfo(prev => ({ ...prev, [name]: formattedValue }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (paymentMethod === 'card') {
      if (!paymentInfo.cardName.trim()) {
        newErrors.cardName = 'Name on card is required'
      }
      if (!paymentInfo.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required'
      } else if (paymentInfo.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Card number must be 16 digits'
      }
      if (!paymentInfo.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required'
      } else if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
        newErrors.expiryDate = 'Expiry date must be in MM/YY format'
      }
      if (!paymentInfo.cvv.trim()) {
        newErrors.cvv = 'CVV is required'
      } else if (paymentInfo.cvv.length < 3) {
        newErrors.cvv = 'CVV must be 3 or 4 digits'
      }
    } else if (paymentMethod === 'upi') {
      if (!paymentInfo.upiId.trim()) {
        newErrors.upiId = 'UPI ID is required'
      } else if (!paymentInfo.upiId.includes('@')) {
        newErrors.upiId = 'Please enter a valid UPI ID (e.g., name@upi)'
      }
      if (!paymentInfo.upiMobile.trim()) {
        newErrors.upiMobile = 'Mobile number is required'
      } else if (paymentInfo.upiMobile.length !== 10) {
        newErrors.upiMobile = 'Mobile number must be 10 digits'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      let response
      const { totalPrice, car } = testData

      if (paymentMethod === 'card') {
        const cardPaymentData = {
          bookingId: 999, // Test booking ID
          paymentMethod: 'card',
          amount: totalPrice,
          receiptEmail: 'test@example.com',
          cardNumber: paymentInfo.cardNumber.replace(/\s/g, ''),
          expiryDate: paymentInfo.expiryDate,
          cvv: paymentInfo.cvv,
          cardDetails: {
            cardNumber: paymentInfo.cardNumber.replace(/\s/g, ''),
            cardName: paymentInfo.cardName,
            expiryDate: paymentInfo.expiryDate,
            cvv: paymentInfo.cvv
          }
        }

        console.log('Processing test card payment:', cardPaymentData)
        response = await processCardPayment(cardPaymentData)
      } else {
        const upiPaymentData = {
          bookingId: 999, // Test booking ID
          paymentMethod: 'upi',
          amount: totalPrice,
          receiptEmail: 'test@example.com',
          upiId: paymentInfo.upiId,
          upiDetails: {
            upiId: paymentInfo.upiId,
            mobileNumber: paymentInfo.upiMobile
          }
        }

        console.log('Processing test UPI payment:', upiPaymentData)
        response = await processUpiPayment(upiPaymentData)
      }

      // Store test booking in localStorage for persistence
      const finalBookingData = {
        bookingId: 'TEST-999',
        referenceId: 'REF-TEST-999',
        car: testData.car,
        startDate: testData.booking.startDate,
        endDate: testData.booking.endDate,
        totalAmount: totalPrice,
        paymentMethod: paymentMethod.toUpperCase(),
        transactionId: response?.transactionId || `TEST-TXN-${Date.now()}`,
        paymentDate: response?.paymentDate || new Date().toISOString(),
        status: 'CONFIRMED',
        userId: 1,
        createdAt: new Date().toISOString(),
        isTestBooking: true
      }

      // Store in localStorage
      const existingBookings = JSON.parse(localStorage.getItem('testBookings') || '[]')
      existingBookings.push(finalBookingData)
      localStorage.setItem('testBookings', JSON.stringify(existingBookings))

      const transactionId = response?.transactionId || `TEST-TXN-${Date.now()}`
      const paymentDate = response?.paymentDate || new Date().toISOString()

      toast.success(`🎉 Booking confirmed! Payment successful via ${paymentMethod.toUpperCase()}`)
      toast.info(`📧 Booking confirmation sent to your email`)

      navigate(`/user/booking-success/TEST-999`, {
        state: {
          bookingId: 'TEST-999',
          referenceId: 'REF-TEST-999',
          totalPrice,
          car: testData.car,
          paymentMethod: paymentMethod.toUpperCase(),
          transactionId,
          paymentDate,
          startDate: testData.booking.startDate,
          endDate: testData.booking.endDate,
          isTestBooking: true
        }
      })
    } catch (error) {
      console.error('Test payment error:', error)
      // Create mock booking even on error for testing
      const mockBookingData = {
        bookingId: 'TEST-999',
        referenceId: 'REF-TEST-999',
        car: testData.car,
        startDate: testData.booking.startDate,
        endDate: testData.booking.endDate,
        totalAmount: testData.totalPrice,
        paymentMethod: paymentMethod.toUpperCase(),
        transactionId: `MOCK-TXN-${Date.now()}`,
        paymentDate: new Date().toISOString(),
        status: 'CONFIRMED',
        userId: 1,
        createdAt: new Date().toISOString(),
        isTestBooking: true,
        isMockBooking: true
      }

      // Store mock booking
      const existingBookings = JSON.parse(localStorage.getItem('testBookings') || '[]')
      existingBookings.push(mockBookingData)
      localStorage.setItem('testBookings', JSON.stringify(existingBookings))

      toast.success(`✅ Booking confirmed! ${paymentMethod.toUpperCase()} payment processed successfully`)

      // Navigate to success page even on error for testing
      navigate(`/user/booking-success/TEST-999`, {
        state: {
          bookingId: 'TEST-999',
          referenceId: 'REF-TEST-999',
          totalPrice: testData.totalPrice,
          car: testData.car,
          paymentMethod: paymentMethod.toUpperCase(),
          transactionId: `MOCK-TXN-${Date.now()}`,
          paymentDate: new Date().toISOString(),
          startDate: testData.booking.startDate,
          endDate: testData.booking.endDate,
          isTestBooking: true,
          isMockBooking: true
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Test Booking Summary */}
      <div className="lg:col-span-1">
        <motion.div
          className="bg-white rounded-xl shadow-card p-6 sticky top-24"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-semibold mb-4">Test Booking Summary</h3>
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={testData.car.imageUrl}
                alt={`${testData.car.brand} ${testData.car.model}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-3">
              <h4 className="font-semibold">{testData.car.brand} {testData.car.model}</h4>
              <p className="text-sm text-gray-600">{testData.car.year} · {testData.car.transmission}</p>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pickup Date:</span>
              <span className="font-medium">{new Date(testData.booking.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Return Date:</span>
              <span className="font-medium">{new Date(testData.booking.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-medium">{testData.booking.referenceId}</span>
            </div>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span className="text-primary-600">${testData.totalPrice}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Test Payment Form */}
      <div className="lg:col-span-2">
        <motion.div
          className="bg-white rounded-xl shadow-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Payment Details</h2>
              <div className="flex items-center text-primary-600">
                <FaLock className="mr-1" />
                <span className="text-sm">Secure Payment</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center rounded-lg p-3 transition duration-200 ${
                    paymentMethod === 'card'
                      ? 'bg-primary-100 border-2 border-primary-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className={`w-12 h-8 rounded-md flex items-center justify-center ${
                    paymentMethod === 'card' ? 'bg-primary-600' : 'bg-gray-400'
                  }`}>
                    <FaCreditCard className="text-white" />
                  </div>
                  <span className="ml-2 text-sm font-medium">Credit/Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex items-center rounded-lg p-3 transition duration-200 ${
                    paymentMethod === 'upi'
                      ? 'bg-primary-100 border-2 border-primary-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className={`w-12 h-8 rounded-md flex items-center justify-center ${
                    paymentMethod === 'upi' ? 'bg-primary-600' : 'bg-gray-400'
                  }`}>
                    <FaQrcode className="text-white" />
                  </div>
                  <span className="ml-2 text-sm font-medium">UPI Payment</span>
                </button>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <>
                  <div className="form-group">
                    <label htmlFor="cardName" className="label flex items-center">
                      <FaUser className="mr-2 text-primary-600" />
                      Name on Card
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={paymentInfo.cardName}
                      onChange={handleInputChange}
                      className={`input ${errors.cardName ? 'border-red-500' : ''}`}
                      placeholder="John Doe"
                      disabled={loading}
                    />
                    {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardNumber" className="label flex items-center">
                      <FaCreditCard className="mr-2 text-primary-600" />
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={paymentInfo.cardNumber}
                      onChange={handleInputChange}
                      className={`input ${errors.cardNumber ? 'border-red-500' : ''}`}
                      placeholder="4242 4242 4242 4242"
                      disabled={loading}
                    />
                    {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="expiryDate" className="label flex items-center">
                        <FaCalendarAlt className="mr-2 text-primary-600" />
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={handleInputChange}
                        className={`input ${errors.expiryDate ? 'border-red-500' : ''}`}
                        placeholder="12/30"
                        disabled={loading}
                      />
                      {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="cvv" className="label flex items-center">
                        <FaLock className="mr-2 text-primary-600" />
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={paymentInfo.cvv}
                        onChange={handleInputChange}
                        className={`input ${errors.cvv ? 'border-red-500' : ''}`}
                        placeholder="123"
                        disabled={loading}
                      />
                      {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Sample Card Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Card Number:</p>
                        <p className="font-mono">4242 4242 4242 4242</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Expiry & CVV:</p>
                        <p className="font-mono">12/30 - 123</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* UPI Payment Form */}
              {paymentMethod === 'upi' && (
                <>
                  <div className="form-group">
                    <label htmlFor="upiId" className="label flex items-center">
                      <FaQrcode className="mr-2 text-primary-600" />
                      UPI ID
                    </label>
                    <input
                      type="text"
                      id="upiId"
                      name="upiId"
                      value={paymentInfo.upiId}
                      onChange={handleInputChange}
                      className={`input ${errors.upiId ? 'border-red-500' : ''}`}
                      placeholder="test@upi"
                      disabled={loading}
                    />
                    {errors.upiId && <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="upiMobile" className="label flex items-center">
                      <FaMobileAlt className="mr-2 text-primary-600" />
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      id="upiMobile"
                      name="upiMobile"
                      value={paymentInfo.upiMobile}
                      onChange={handleInputChange}
                      className={`input ${errors.upiMobile ? 'border-red-500' : ''}`}
                      placeholder="9876543210"
                      disabled={loading}
                    />
                    {errors.upiMobile && <p className="text-red-500 text-sm mt-1">{errors.upiMobile}</p>}
                  </div>

                  <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-100">
                    <p className="text-sm text-primary-700">
                      <strong>Sample UPI Details:</strong> Use UPI ID "user@upi" and mobile number "9876543210"
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount</span>
                <span className="text-primary-600">${testData.totalPrice}</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center text-gray-600 text-sm">
                <FaLock className="mr-2" />
                <span>Your payment is secured with 256-bit SSL encryption</span>
              </div>

              <button
                type="submit"
                className="btn-primary w-full md:w-auto px-8"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="small" className="mr-2" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'card' ? <FaCreditCard className="mr-2" /> : <FaQrcode className="mr-2" />}
                    Pay ${testData.totalPrice} with {paymentMethod === 'card' ? 'Card' : 'UPI'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default Payment