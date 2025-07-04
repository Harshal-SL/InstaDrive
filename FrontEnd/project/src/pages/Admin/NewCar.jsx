import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaSave, FaTimes, FaUpload, FaImage } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { createCar, updateCar, getCarById, uploadCarImage } from '../../services/carService'
import PageHeader from '../../components/UI/PageHeader'
import Spinner from '../../components/UI/Spinner'

const NewCar = () => {
  const navigate = useNavigate()
  const { id } = useParams() // Get car ID from URL if editing
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEditMode)
  const [imageLoading, setImageLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const [carData, setCarData] = useState({
    name: '',
    brand: '',
    model: '',
    description: '',
    imageUrl: '',
    pricePerDay: '',
    registrationNumber: '',
    year: new Date().getFullYear(),
    fuelType: 'Petrol',
    seats: 5,
    transmission: 'Automatic',
    carType: 'Sedan',
    features: {
      airConditioning: true,
      bluetooth: true,
      gpsNavigation: true,
      leatherSeats: false,
      sunroof: false,
      backupCamera: false,
      parkingSensors: false,
      keylessEntry: false,
      heatedSeats: false,
      appleCarPlay: false,
      androidAuto: false
    }
  })

  // Fetch car data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchCarData = async () => {
        try {
          const car = await getCarById(id)

          // Convert features array to object if needed
          let features = car.features
          if (Array.isArray(car.features)) {
            features = {}
            car.features.forEach(feature => {
              // Convert feature name to camelCase
              const featureName = feature.toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
              features[featureName] = true
            })
          } else if (!car.features) {
            // Default features if none exist
            features = {
              airConditioning: false,
              bluetooth: false,
              gpsNavigation: false,
              leatherSeats: false,
              sunroof: false,
              backupCamera: false,
              parkingSensors: false,
              keylessEntry: false,
              heatedSeats: false,
              appleCarPlay: false,
              androidAuto: false
            }
          }

          // Set car data
          setCarData({
            name: car.name || '',
            brand: car.brand || '',
            model: car.model || '',
            description: car.description || '',
            imageUrl: car.imageUrl || '',
            pricePerDay: car.pricePerDay || '',
            registrationNumber: car.registrationNumber || '',
            year: car.year || new Date().getFullYear(),
            fuelType: car.fuelType || 'Petrol',
            seats: car.seats || 5,
            transmission: car.transmission || 'Automatic',
            carType: car.carType || 'Sedan',
            features
          })
        } catch (error) {
          console.error('Error fetching car data:', error)
          toast.error('Failed to load car data. Please try again.')
          navigate('/admin/cars')
        } finally {
          setFetchLoading(false)
        }
      }

      fetchCarData()
    }
  }, [id, isEditMode, navigate])

  const handleInputChange = (e) => {
    const { name, value, type } = e.target

    if (type === 'number') {
      setCarData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }))
    } else {
      setCarData(prev => ({ ...prev, [name]: value }))
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFeatureToggle = (feature) => {
    setCarData(prev => {
      return {
        ...prev,
        features: {
          ...prev.features,
          [feature]: !prev.features[feature]
        }
      }
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!carData.name.trim()) {
      newErrors.name = 'Car name is required'
    }

    if (!carData.brand.trim()) {
      newErrors.brand = 'Brand is required'
    }

    if (!carData.model.trim()) {
      newErrors.model = 'Model is required'
    }

    if (!carData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!carData.pricePerDay) {
      newErrors.pricePerDay = 'Price per day is required'
    } else if (carData.pricePerDay <= 0) {
      newErrors.pricePerDay = 'Price must be greater than 0'
    }

    if (!carData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required'
    }

    if (!carData.year) {
      newErrors.year = 'Year is required'
    } else if (carData.year < 1950 || carData.year > new Date().getFullYear() + 1) {
      newErrors.year = `Year must be between 1950 and ${new Date().getFullYear() + 1}`
    }

    if (!carData.seats) {
      newErrors.seats = 'Number of seats is required'
    } else if (carData.seats < 1 || carData.seats > 12) {
      newErrors.seats = 'Number of seats must be between 1 and 12'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      let carId

      if (isEditMode) {
        // Update existing car
        await updateCar(id, carData)
        carId = id
        toast.success('Car updated successfully!')
      } else {
        // Create new car
        const createdCar = await createCar(carData)
        carId = createdCar.id
        toast.success('Car added successfully!')
      }

      // If we have a file selected, upload the image
      if (selectedFile) {
        await handleImageUpload(carId)
      }

      navigate('/admin/cars')
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} car:`, error)
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} car. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/cars')
  }

  const handleImageUpload = async (carId) => {
    if (!selectedFile) {
      return
    }

    setImageLoading(true)

    try {
      const response = await uploadCarImage(carId, selectedFile)

      // Update the car data with the new image URL
      setCarData(prev => ({
        ...prev,
        imageUrl: response.imageUrl || `http://localhost:8080/api/cars/${carId}/image?t=${new Date().getTime()}`
      }))

      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setImageLoading(false)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      <PageHeader
        title={isEditMode ? "Edit Car" : "Add New Car"}
        subtitle={isEditMode ? "Update vehicle details in your rental fleet" : "Add a new vehicle to your rental fleet"}
      />

      <div className="container mx-auto px-4 py-8">
        {fetchLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="large" />
            <p className="mt-4 text-gray-600">Loading car details...</p>
          </div>
        ) : (
          <motion.div
            className="bg-white rounded-xl shadow-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Car Details */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-semibold mb-4">Car Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="brand" className="label">Brand</label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={carData.brand}
                      onChange={handleInputChange}
                      className={`input ${errors.brand ? 'border-red-500' : ''}`}
                      placeholder="e.g. BMW"
                      disabled={loading}
                    />
                    {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="model" className="label">Model</label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={carData.model}
                      onChange={handleInputChange}
                      className={`input ${errors.model ? 'border-red-500' : ''}`}
                      placeholder="e.g. 5 Series"
                      disabled={loading}
                    />
                    {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="name" className="label">Car Name (Display Name)</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={carData.name}
                    onChange={handleInputChange}
                    className={`input ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="e.g. BMW 5 Series Luxury Sedan"
                    disabled={loading}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="label">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={carData.description}
                    onChange={handleInputChange}
                    className={`input h-32 ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Describe the car's features, performance, and unique selling points..."
                    disabled={loading}
                  ></textarea>
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="pricePerDay" className="label">Price Per Day ($)</label>
                    <input
                      type="number"
                      id="pricePerDay"
                      name="pricePerDay"
                      value={carData.pricePerDay}
                      onChange={handleInputChange}
                      className={`input ${errors.pricePerDay ? 'border-red-500' : ''}`}
                      placeholder="e.g. 150"
                      min="0"
                      step="0.01"
                      disabled={loading}
                    />
                    {errors.pricePerDay && <p className="text-red-500 text-sm mt-1">{errors.pricePerDay}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="registrationNumber" className="label">Registration Number</label>
                    <input
                      type="text"
                      id="registrationNumber"
                      name="registrationNumber"
                      value={carData.registrationNumber}
                      onChange={handleInputChange}
                      className={`input ${errors.registrationNumber ? 'border-red-500' : ''}`}
                      placeholder="e.g. ABC123"
                      disabled={loading}
                    />
                    {errors.registrationNumber && <p className="text-red-500 text-sm mt-1">{errors.registrationNumber}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="year" className="label">Year</label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={carData.year}
                      onChange={handleInputChange}
                      className={`input ${errors.year ? 'border-red-500' : ''}`}
                      placeholder="e.g. 2023"
                      min="1950"
                      max={new Date().getFullYear() + 1}
                      disabled={loading}
                    />
                    {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="seats" className="label">Number of Seats</label>
                    <input
                      type="number"
                      id="seats"
                      name="seats"
                      value={carData.seats}
                      onChange={handleInputChange}
                      className={`input ${errors.seats ? 'border-red-500' : ''}`}
                      placeholder="e.g. 5"
                      min="1"
                      max="12"
                      disabled={loading}
                    />
                    {errors.seats && <p className="text-red-500 text-sm mt-1">{errors.seats}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="fuelType" className="label">Fuel Type</label>
                    <select
                      id="fuelType"
                      name="fuelType"
                      value={carData.fuelType}
                      onChange={handleInputChange}
                      className="input"
                      disabled={loading}
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="transmission" className="label">Transmission</label>
                    <select
                      id="transmission"
                      name="transmission"
                      value={carData.transmission}
                      onChange={handleInputChange}
                      className="input"
                      disabled={loading}
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="carType" className="label">Car Type</label>
                  <select
                    id="carType"
                    name="carType"
                    value={carData.carType}
                    onChange={handleInputChange}
                    className="input"
                    disabled={loading}
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Sports">Sports</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="imageUrl" className="label">Image URL</label>
                  <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={carData.imageUrl}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="e.g. https://example.com/car-image.jpg"
                    disabled={loading || selectedFile !== null}
                  />
                  <div className="flex items-start mt-1">
                    <div className="text-sm text-gray-500">
                      {selectedFile ? (
                        <p className="text-primary-600">Image will be uploaded when you save the car.</p>
                      ) : (
                        <p>Enter a URL for the car image, or use the image uploader below.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Features</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {Object.entries(carData.features).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`feature-${feature}`}
                          checked={enabled}
                          onChange={() => handleFeatureToggle(feature)}
                          className="mr-2"
                          disabled={loading}
                        />
                        <label htmlFor={`feature-${feature}`} className="text-sm">
                          {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Image Preview</h2>

                <div className="bg-gray-100 rounded-lg overflow-hidden h-60 flex items-center justify-center mb-4">
                  {carData.imageUrl ? (
                    <img
                      src={carData.imageUrl}
                      alt="Car Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800";
                      }}
                    />
                  ) : (
                    <div className="text-center p-6">
                      <FaImage className="text-4xl text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Upload or provide a URL for the car image</p>
                    </div>
                  )}
                </div>

                {selectedFile && (
                  <div className="bg-primary-50 p-3 rounded-lg mb-4 text-sm">
                    <div className="flex items-center">
                      <FaImage className="text-primary-600 mr-2" />
                      <span className="font-medium">Selected file:</span>
                      <span className="ml-2 text-gray-700 truncate">
                        {selectedFile.name}
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2">Car Summary</h3>
                  {carData.brand && carData.model ? (
                    <div>
                      <p className="font-medium">{carData.name || `${carData.brand} ${carData.model}`}</p>
                      <p className="text-sm text-gray-600">{carData.brand} {carData.model} · {carData.year}</p>
                      <p className="text-sm text-gray-600">{carData.fuelType} · {carData.seats} Seats</p>
                      <p className="text-sm text-gray-600 mt-1">${carData.pricePerDay} per day</p>
                      {carData.registrationNumber && (
                        <p className="text-sm text-gray-600 mt-1">Reg: {carData.registrationNumber}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Complete the form to see a summary</p>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    // Preview the selected image
                    if (e.target.files?.length > 0) {
                      const file = e.target.files[0]
                      setSelectedFile(file)
                      const imageUrl = URL.createObjectURL(file)
                      setCarData(prev => ({ ...prev, imageUrl }))
                    } else {
                      setSelectedFile(null)
                    }
                  }}
                />

                <button
                  type="button"
                  className="btn-outline w-full flex items-center justify-center mb-2"
                  disabled={loading || imageLoading}
                  onClick={handleFileSelect}
                >
                  {imageLoading ? (
                    <>
                      <Spinner size="small" className="mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload className="mr-2" />
                      Select Image
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Supported formats: JPG, PNG, WebP<br />
                  Max size: 5MB
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-8 pt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-outline flex items-center"
                disabled={loading}
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="small" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    {isEditMode ? 'Update Car' : 'Save Car'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
        )}
      </div>
    </div>
  )
}

export default NewCar