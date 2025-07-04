import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaCar, FaGasPump, FaUsers, FaCog, FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa'
import { getCarImageUrl } from '../../utils/imageUtils'
import sampleCars from '../../data/sampleCars'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { getCarById, checkCarAvailability } from '../../services/carService'
import PageHeader from '../../components/UI/PageHeader'
import Spinner from '../../components/UI/Spinner'
import LoadingFallback from '../../components/UI/LoadingFallback'
import FallbackError from '../../components/UI/FallbackError'

const CarDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 3)))
  const [isAvailable, setIsAvailable] = useState(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true)

        // If no ID is provided, show the first available car
        if (!id) {
          const firstAvailableCar = sampleCars.find(car => car.status === 'available')
          if (firstAvailableCar) {
            console.log('No car ID provided, showing first available car:', firstAvailableCar)
            setCar(firstAvailableCar)
            // Update URL to reflect the car being shown
            navigate(`/user/cars/${firstAvailableCar.id}`, { replace: true })
            return
          } else {
            toast.info('No cars are currently available.')
            navigate('/user/dashboard')
            return
          }
        }

        const carData = await getCarById(id)
        setCar(carData)
      } catch (error) {
        console.error('Error fetching car details:', error)

        // Use sample car data when API fails
        const sampleCar = sampleCars.find(car => car.id.toString() === id);
        if (sampleCar) {
          console.log('Using sample car data:', sampleCar);
          setCar(sampleCar);
        } else {
          toast.info('Car information is currently unavailable.');
          navigate('/user/dashboard');
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCar()
  }, [id, navigate])

  useEffect(() => {
    // Calculate the total price whenever dates change
    if (car) {
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      setTotalPrice(car.pricePerDay * Math.max(1, days))
    }
  }, [car, startDate, endDate])

  const handleCheckAvailability = async () => {
    if (!car) return

    setCheckingAvailability(true)
    setIsAvailable(null)

    try {
      // Format dates to ISO string for API
      const formattedStartDate = startDate.toISOString().split('T')[0]
      const formattedEndDate = endDate.toISOString().split('T')[0]

      const availability = await checkCarAvailability(id, formattedStartDate, formattedEndDate)
      setIsAvailable(availability.available)
    } catch (error) {
      console.error('Error checking availability:', error)
      toast.info('This car is currently unavailable for the selected dates.')
      setIsAvailable(false)
    } finally {
      setCheckingAvailability(false)
    }
  }

  const handleDateChange = (dates) => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
    setIsAvailable(null) // Reset availability when dates change
  }

  const handleProceedToBooking = () => {
    if (car && isAvailable) {
      navigate(`/user/booking/${car.id}`, {
        state: {
          car,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalPrice
        }
      })
    }
  }

  if (loading) {
    return <LoadingFallback message="Loading car details..." />
  }

  if (!car) {
    return (
      <FallbackError 
        message="The car you're looking for is currently unavailable." 
        redirectPath="/user/dashboard"
        redirectText="Browse Other Cars"
      />
    )
  }

  return (
    <div>
      <PageHeader
        title={car.name || `${car.brand || ''} ${car.model || ''}`}
        subtitle={`${car.brand || ''} ${car.model || ''} · ${car.year || 'N/A'}`}
        image={getCarImageUrl(car)}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Car Details */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-card overflow-hidden mb-8">
              <img
                src={getCarImageUrl(car)}
                alt={car.name}
                className="w-full h-96 object-cover"
              />

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{car.name || `${car.brand || ''} ${car.model || ''}`}</h1>
                    {car.name && (car.brand || car.model) && (
                      <div className="text-lg text-gray-600">{car.brand || ''} {car.model || ''}</div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-primary-600">${car.pricePerDay}/day</div>
                </div>

                <p className="text-gray-700 mb-6">{car.description || 'No description available for this vehicle.'}</p>

                <h2 className="text-xl font-semibold mb-4">Specifications</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <FaCar className="text-primary-600 text-2xl mb-2" />
                    <div className="text-sm text-gray-600">Brand/Model</div>
                    <div className="font-medium">{car.brand || 'N/A'} {car.model}</div>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <FaGasPump className="text-primary-600 text-2xl mb-2" />
                    <div className="text-sm text-gray-600">Fuel</div>
                    <div className="font-medium">{car.fuelType}</div>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <FaUsers className="text-primary-600 text-2xl mb-2" />
                    <div className="text-sm text-gray-600">Year</div>
                    <div className="font-medium">{car.year || 'N/A'}</div>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <FaCog className="text-primary-600 text-2xl mb-2" />
                    <div className="text-sm text-gray-600">Transmission</div>
                    <div className="font-medium">{car.transmission}</div>
                  </div>
                </div>

                {car.registrationNumber && (
                  <div className="mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Registration Number</div>
                      <div className="font-medium">{car.registrationNumber}</div>
                    </div>
                  </div>
                )}

                <h2 className="text-xl font-semibold mb-4">Features</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                  {car.features ? (
                    // If features is an object with boolean properties
                    typeof car.features === 'object' && !Array.isArray(car.features) ? (
                      Object.entries(car.features).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          {value ? (
                            <FaCheck className="text-success-500 mr-2" />
                          ) : (
                            <FaTimes className="text-red-500 mr-2" />
                          )}
                          <span className={value ? '' : 'text-gray-400'}>
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </div>
                      ))
                    ) :
                    // If features is an array
                    Array.isArray(car.features) && car.features.length > 0 ? (
                      car.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <FaCheck className="text-success-500 mr-2" />
                          <span>{feature}</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-gray-500">No features listed for this vehicle</div>
                    )
                  ) : (
                    <div className="col-span-2 text-gray-500">No features listed for this vehicle</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Booking Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Book this car</h2>

              <div className="mb-4">
                <label className="label flex items-center mb-2">
                  <FaCalendarAlt className="mr-2 text-primary-600" />
                  Select Dates
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={handleDateChange}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  minDate={new Date()}
                  monthsShown={1}
                  className="input w-full"
                  placeholderText="Select date range"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span>${car.pricePerDay} x {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} days</span>
                  <span>${totalPrice}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2 font-semibold flex justify-between">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>

              {isAvailable === true && (
                <div className="flex items-center mb-4 p-2 bg-success-50 text-success-700 rounded-lg">
                  <FaCheck className="mr-2" />
                  <span>Available for selected dates!</span>
                </div>
              )}

              {isAvailable === false && (
                <div className="flex items-center mb-4 p-2 bg-red-50 text-red-700 rounded-lg">
                  <FaTimes className="mr-2" />
                  <span>Not available for selected dates. Please try different dates.</span>
                </div>
              )}

              {!isAvailable ? (
                <button
                  onClick={handleCheckAvailability}
                  className="btn-primary w-full mb-3 flex justify-center items-center"
                  disabled={checkingAvailability}
                >
                  {checkingAvailability ? <Spinner size="small" className="mr-2" /> : null}
                  Check Availability
                </button>
              ) : (
                <button
                  onClick={handleProceedToBooking}
                  className="btn-primary w-full mb-3"
                  disabled={!isAvailable}
                >
                  Proceed to Booking
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Car Selection Component for when no specific car ID is provided
const CarSelection = () => {
  const navigate = useNavigate()

  const availableCars = sampleCars.filter(car => car.status === 'available')

  return (
    <div>
      <PageHeader
        title="Select a Car"
        subtitle="Choose from our available vehicles"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCars.map((car) => (
            <motion.div
              key={car.id}
              className="bg-white rounded-xl shadow-card overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
              onClick={() => navigate(`/user/cars/${car.id}`)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <img
                src={getCarImageUrl(car)}
                alt={car.name}
                className="w-full h-48 object-cover"
              />

              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{car.name}</h3>
                <p className="text-gray-600 mb-4">{car.brand} {car.model} · {car.year}</p>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaCog className="mr-1" />
                    {car.transmission}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaGasPump className="mr-1" />
                    {car.fuelType}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-primary-600">
                    ${car.pricePerDay}/day
                  </div>
                  <button className="btn-primary-sm">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {availableCars.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No cars are currently available</div>
            <button
              onClick={() => navigate('/user/dashboard')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CarDetails