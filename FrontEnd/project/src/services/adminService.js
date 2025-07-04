import api from './api'

// Admin Dashboard endpoints
export const getDashboardData = async () => {
  try {
    console.log('Fetching dashboard data from API...')
    const response = await api.get('/admin/dashboard')
    console.log('Dashboard data API response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw error
  }
}

// Admin Car Management endpoints
export const getAdminCars = async () => {
  try {
    console.log('Fetching all cars from API...')
    const response = await api.get('/admin/cars')
    console.log('Admin cars API response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching admin cars:', error)
    throw error
  }
}

export const getAdminCarById = async (id) => {
  try {
    console.log(`Fetching car ${id} from API...`)
    const response = await api.get(`/admin/cars/${id}`)
    console.log('Admin car API response:', response.data)
    return response.data
  } catch (error) {
    console.error(`Error fetching car ${id}:`, error)
    throw error
  }
}

export const createCar = async (carData) => {
  try {
    console.log('Creating new car with data:', carData)
    const response = await api.post('/admin/cars', carData)
    console.log('Create car API response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating car:', error)
    throw error
  }
}

export const updateCar = async (id, carData) => {
  try {
    console.log(`Updating car ${id} with data:`, carData)
    const response = await api.put(`/admin/cars/${id}`, carData)
    console.log('Update car API response:', response.data)
    return response.data
  } catch (error) {
    console.error(`Error updating car ${id}:`, error)
    throw error
  }
}

export const deleteCar = async (id) => {
  try {
    console.log(`Deleting car ${id}...`)
    const response = await api.delete(`/admin/cars/${id}`)
    console.log('Delete car API response:', response.data)
    return response.data
  } catch (error) {
    console.error(`Error deleting car ${id}:`, error)
    throw error
  }
}

// Admin Payment Management endpoints
export const getAdminPayments = async () => {
  try {
    console.log('Fetching all payments from API...')
    const response = await api.get('/admin/payments')
    console.log('Admin payments API response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching admin payments:', error)
    throw error
  }
}

export const getAdminPaymentById = async (id) => {
  try {
    console.log(`Fetching payment ${id} from API...`)
    const response = await api.get(`/admin/payments/${id}`)
    console.log('Admin payment API response:', response.data)
    return response.data
  } catch (error) {
    console.error(`Error fetching payment ${id}:`, error)
    throw error
  }
}

export const getAdminPaymentsByBookingId = async (bookingId) => {
  try {
    console.log(`Fetching payments for booking ${bookingId} from API...`)
    const response = await api.get(`/admin/payments/booking/${bookingId}`)
    console.log('Admin payments by booking API response:', response.data)
    return response.data
  } catch (error) {
    console.error(`Error fetching payments for booking ${bookingId}:`, error)
    throw error
  }
}

export const getAdminPaymentsByUserId = async (userId) => {
  try {
    console.log(`Fetching payments for user ${userId} from API...`)
    const response = await api.get(`/admin/payments/user/${userId}`)
    console.log('Admin payments by user API response:', response.data)
    return response.data
  } catch (error) {
    console.error(`Error fetching payments for user ${userId}:`, error)
    throw error
  }
}

// Admin Receipt Management endpoints
export const getAdminReceiptsByUserId = async (userId) => {
  try {
    console.log(`Fetching receipts for user ${userId} from API...`)
    const response = await api.get(`/admin/receipts/user/${userId}`)
    console.log('Admin receipts by user API response:', response.data)
    return response.data
  } catch (error) {
    console.error(`Error fetching receipts for user ${userId}:`, error)
    throw error
  }
}

export const getAdminReceiptByBookingId = async (bookingId) => {
  try {
    console.log(`Fetching receipt for booking ${bookingId} from API...`)
    const response = await api.get(`/admin/receipts/booking/${bookingId}`)
    console.log('Admin receipt by booking API response:', response.data)
    return response.data
  } catch (error) {
    console.error(`Error fetching receipt for booking ${bookingId}:`, error)
    throw error
  }
}

export const getAdminReceiptByTransactionId = async (transactionId) => {
  try {
    console.log(`Fetching receipt for transaction ${transactionId} from API...`)
    const response = await api.get(`/admin/receipts/transaction/${transactionId}`)
    console.log('Admin receipt by transaction API response:', response.data)
    return response.data
  } catch (error) {
    console.error(`Error fetching receipt for transaction ${transactionId}:`, error)
    throw error
  }
}

// Admin User Management endpoints
export const getAdminUsers = async () => {
  try {
    console.log('Fetching all users from API...')
    const response = await api.get('/admin/users')
    console.log('Admin users API response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching admin users:', error)
    throw error
  }
}

export const getAdminUserById = async (id) => {
  try {
    console.log(`Fetching user ${id} from API...`)
    const response = await api.get(`/admin/users/${id}`)
    console.log('Admin user API response:', response.data)
    return response.data
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error)
    throw error
  }
}

export const updateUserRole = async (userId, role) => {
  try {
    console.log(`Setting user ${userId} role to ${role}...`)
    const response = await api.put(`/admin/users/${userId}/role?role=${role}`)
    console.log('Update user role API response:', response.data)
    return response.data
  } catch (error) {
    console.error(`Error updating role for user ${userId}:`, error)
    throw error
  }
}

// Admin Test endpoint
export const testAdminAccess = async () => {
  try {
    console.log('Testing admin access...')
    const response = await api.get('/admin/test')
    console.log('Admin test API response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error testing admin access:', error)
    throw error
  }
}

// Legacy functions for backward compatibility
export const getAdminBookings = async () => {
  try {
    console.log('Fetching admin bookings from API...')
    const response = await api.get('/admin/bookings')
    console.log('Admin bookings API response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching admin bookings:', error)
    throw error
  }
}

export const getAllUsers = async () => {
  return getAdminUsers()
}

export const setUserRole = async (userId, role) => {
  return updateUserRole(userId, role)
}
