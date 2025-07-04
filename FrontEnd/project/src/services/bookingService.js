import api from './api'

// Booking endpoints
export const getAllBookings = async (filters = {}) => {
  try {
    const response = await api.get('/bookings', { params: filters })
    return response.data
  } catch (error) {
    console.error('Error fetching all bookings:', error)
    throw error
  }
}

export const getBookingById = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching booking ${id}:`, error)
    throw error
  }
}

export const getLatestBookings = async () => {
  try {
    const response = await api.get('/bookings/latest')
    return response.data
  } catch (error) {
    console.error('Error fetching latest bookings:', error)
    throw error
  }
}

export const getUserLatestBookings = async (userId) => {
  try {
    const response = await api.get(`/bookings/user/${userId}/latest`)
    return response.data
  } catch (error) {
    console.error(`Error fetching latest bookings for user ${userId}:`, error)
    throw error
  }
}

export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData)
    return response.data
  } catch (error) {
    console.error('Error creating booking:', error)
    throw error
  }
}

export const updateBooking = async (id, bookingData) => {
  try {
    const response = await api.put(`/bookings/${id}`, bookingData)
    return response.data
  } catch (error) {
    console.error(`Error updating booking ${id}:`, error)
    throw error
  }
}

export const cancelBooking = async (id) => {
  try {
    const response = await api.delete(`/bookings/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error cancelling booking ${id}:`, error)
    throw error
  }
}

export const initiatePayment = async (bookingId) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/initiate-payment`)
    return response.data
  } catch (error) {
    console.error(`Error initiating payment for booking ${bookingId}:`, error)
    throw error
  }
}

export const getPaymentInfo = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}/payment-info`)
    return response.data
  } catch (error) {
    console.error(`Error getting payment info for booking ${bookingId}:`, error)
    throw error
  }
}

// Return a car (mark booking as completed)
export const returnCar = async (bookingId) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/return`)
    return response.data
  } catch (error) {
    console.error(`Error returning car for booking ${bookingId}:`, error)
    throw error
  }
}

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/status`, { status })
    return response.data
  } catch (error) {
    console.error(`Error updating booking status for ${bookingId}:`, error)
    throw error
  }
}

// Check and update expired bookings
export const checkExpiredBookings = async () => {
  try {
    const response = await api.post('/bookings/check-expired')
    return response.data
  } catch (error) {
    console.error('Error checking expired bookings:', error)
    throw error
  }
}

// Get payment status for a booking
export const getPaymentStatus = async (bookingId) => {
  try {
    const response = await api.get(`/payments/booking/${bookingId}/status`)
    return response.data
  } catch (error) {
    console.error(`Error getting payment status for booking ${bookingId}:`, error)
    throw error
  }
}

// Process refund for cancelled booking
export const processRefund = async (bookingId) => {
  try {
    const response = await api.post(`/payments/booking/${bookingId}/refund`)
    return response.data
  } catch (error) {
    console.error(`Error processing refund for booking ${bookingId}:`, error)
    throw error
  }
}

// Helper function for user bookings
export const getUserBookings = async () => {
  try {
    // Use the compatibility endpoint that works without authentication issues
    const response = await api.get('/users/current/bookings')
    return response.data
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    // Fallback to empty array if the endpoint fails
    return []
  }
}

// Get bookings for a specific user
export const getUserBookingsById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/bookings`)
    return response.data
  } catch (error) {
    console.error(`Error fetching bookings for user ${userId}:`, error)
    throw error
  }
}

// Get current and future bookings for the current user
export const getCurrentAndFutureBookings = async () => {
  try {
    // Use the dedicated backend endpoint for current and future bookings
    const response = await api.get('/users/bookings/current-future')
    return response.data
  } catch (error) {
    console.error('Error fetching current and future bookings:', error)
    // Fallback to getting all bookings and filtering
    try {
      const bookings = await getUserBookings()
      const now = new Date()

      // Filter bookings to include only current and future ones
      return bookings.filter(booking => {
        const endDate = new Date(booking.endDate)
        return endDate >= now
      })
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
      throw error
    }
  }
}

