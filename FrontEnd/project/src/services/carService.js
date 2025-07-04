import api from './api'

// Car endpoints
export const getAllCars = async (filters = {}) => {
  try {
    const response = await api.get('/cars', { params: filters })
    return response.data
  } catch (error) {
    console.error('Get all cars error:', error)
    throw error
  }
}

export const getAvailableCars = async (filters = {}) => {
  try {
    const response = await api.get('/cars/available', { params: filters })
    return response.data
  } catch (error) {
    console.error('Get available cars error:', error)
    throw error
  }
}

export const getCarById = async (id) => {
  try {
    const response = await api.get(`/cars/${id}`)
    return response.data
  } catch (error) {
    console.error(`Get car ${id} error:`, error)
    throw error
  }
}

// Admin only
export const createCar = async (carData) => {
  try {
    const response = await api.post('/cars', carData)
    return response.data
  } catch (error) {
    console.error('Create car error:', error)
    throw error
  }
}

// Admin only
export const updateCar = async (id, carData) => {
  try {
    const response = await api.put(`/cars/${id}`, carData)
    return response.data
  } catch (error) {
    console.error(`Update car ${id} error:`, error)
    throw error
  }
}

// Admin only
export const deleteCar = async (id) => {
  try {
    const response = await api.delete(`/cars/${id}`)
    return response.data
  } catch (error) {
    console.error(`Delete car ${id} error:`, error)
    throw error
  }
}

// Car image operations
export const uploadCarImage = async (carId, imageFile) => {
  try {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await api.post(`/cars/${carId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  } catch (error) {
    console.error(`Upload image for car ${carId} error:`, error)
    throw error
  }
}

export const getCarImages = async (carId) => {
  try {
    const response = await api.get(`/cars/${carId}/images`)
    return response.data
  } catch (error) {
    console.error(`Get images for car ${carId} error:`, error)
    throw error
  }
}

export const deleteCarImage = async (carId, imageId) => {
  try {
    const response = await api.delete(`/cars/${carId}/images/${imageId}`)
    return response.data
  } catch (error) {
    console.error(`Delete image ${imageId} for car ${carId} error:`, error)
    throw error
  }
}

// Helper function for availability check
export const checkCarAvailability = async (carId, startDate, endDate) => {
  try {
    // Try to use the availability endpoint if it exists
    const response = await api.get(`/cars/${carId}/availability`, {
      params: { startDate, endDate }
    })
    return response.data
  } catch (error) {
    console.warn('Availability endpoint not found, checking bookings instead')

    // If the availability endpoint doesn't exist, check bookings for the car
    // and determine availability manually
    try {
      // Get all bookings for this car
      const bookingsResponse = await api.get('/bookings', {
        params: { carId, status: 'ACTIVE' }
      })

      const bookings = bookingsResponse.data

      // Check if there are any overlapping bookings
      const requestStart = new Date(startDate)
      const requestEnd = new Date(endDate)

      const isOverlapping = bookings.some(booking => {
        const bookingStart = new Date(booking.startDate)
        const bookingEnd = new Date(booking.endDate)

        // Check for overlap
        return (
          (requestStart >= bookingStart && requestStart <= bookingEnd) ||
          (requestEnd >= bookingStart && requestEnd <= bookingEnd) ||
          (requestStart <= bookingStart && requestEnd >= bookingEnd)
        )
      })

      return { available: !isOverlapping }
    } catch (secondError) {
      console.error('Error checking bookings:', secondError)
      // Default to available if we can't determine
      return { available: true }
    }
  }
}