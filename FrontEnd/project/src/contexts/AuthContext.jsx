import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { login, register, getCurrentUser } from '../services/authService'
import { getUserProfile } from '../services/userService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        console.log('Token found, fetching user profile')
        const userData = await getUserProfile()
        console.log('User profile:', userData)
        setUser(userData)
      } else {
        console.log('No token found')
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogin = async (credentials) => {
    try {
      setLoading(true)
      console.log('Attempting login with:', credentials)

      const response = await login(credentials)
      console.log('Login response:', response)

      const { user: userData, token } = response

      if (!token) {
        throw new Error('No token received from server')
      }

      localStorage.setItem('token', token)
      setUser(userData)

      toast.success('Login successful!')

      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard')
      } else {
        navigate('/user/dashboard')
      }

      return true
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (userData) => {
    try {
      setLoading(true)
      const { user: newUser, token } = await register(userData)

      localStorage.setItem('token', token)
      setUser(newUser)

      toast.success('Registration successful!')
      navigate('/user/dashboard')

      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.info('You have been logged out')
    navigate('/')
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    checkAuthStatus
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}