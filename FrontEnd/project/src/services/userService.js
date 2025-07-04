import api from './api'

// User endpoints
export const getAllUsers = async () => {
  try {
    const response = await api.get('/users')
    return response.data
  } catch (error) {
    console.error('Error fetching all users:', error)
    throw error
  }
}

export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error)
    throw error
  }
}

export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile')
    return response.data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error)
    throw error
  }
}

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error)
    throw error
  }
}

export const getUserBookings = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/bookings`)
    return response.data
  } catch (error) {
    console.error(`Error fetching bookings for user ${userId}:`, error)
    throw error
  }
}

export const getCurrentUserBookings = async () => {
  try {
    return getUserBookings('current')
  } catch (error) {
    console.error('Error fetching current user bookings:', error)
    throw error
  }
}

export const checkEmail = async (email) => {
  try {
    const response = await api.get(`/users/check/${email}`)
    return response.data
  } catch (error) {
    console.error(`Error checking email ${email}:`, error)
    throw error
  }
}
