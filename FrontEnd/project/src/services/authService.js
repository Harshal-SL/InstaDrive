import api from './api'

// Auth endpoints
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials)
    // Extract token and user info from response
    const { token, email, name, role } = response.data
    return {
      token,
      user: {
        email,
        name,
        role
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData)
    // Extract token and user info from response
    const { token, email, name, role } = response.data
    return {
      token,
      user: {
        email,
        name,
        role
      }
    }
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

export const adminLogin = async (credentials) => {
  try {
    console.log('Attempting admin login with credentials:', {
      email: credentials.email,
      password: '********' // Don't log actual password
    })

    const response = await api.post('/auth/admin/login', credentials)
    console.log('Admin login response:', response.data)

    // Extract token and user info from response
    const { token, email, name, role } = response.data
    return {
      token,
      user: {
        email,
        name,
        role
      }
    }
  } catch (error) {
    console.error('Admin login error:', error)

    // Log more detailed error information
    if (error.response) {
      console.error('Error response data:', error.response.data)
      console.error('Error response status:', error.response.status)
    } else if (error.request) {
      console.error('No response received:', error.request)
    } else {
      console.error('Error setting up request:', error.message)
    }

    throw error
  }
}

export const testAuth = async () => {
  const response = await api.get('/auth/test')
  return response.data
}

// User profile endpoints
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/profile')
    return response.data
  } catch (error) {
    console.error('Get current user error:', error)
    throw error
  }
}