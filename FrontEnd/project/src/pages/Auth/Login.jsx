import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import Spinner from '../../components/UI/Spinner'

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // If user is already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/user/dashboard" replace />
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setSubmitting(true)

    try {
      await login(formData)
      // No need to redirect here - the auth context handles that
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen py-20 px-4 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-card p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="label">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="name@example.com"
                disabled={submitting}
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="form-group">
            <div className="flex justify-between">
              <label htmlFor="password" className="label">Password</label>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-800">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input pl-10 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••"
                disabled={submitting}
              />
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="btn-primary w-full flex justify-center items-center"
              disabled={submitting || loading}
            >
              {submitting || loading ? (
                <Spinner size="small" className="mr-2" />
              ) : (
                <FaSignInAlt className="mr-2" />
              )}
              Sign In
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:text-primary-800">
              Register now
            </Link>
          </p>
        </div>

        {/* Sample Login Credentials */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Sample Login Credentials</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-600">User:</p>
              <p className="font-mono">user@example.com</p>
              <p className="font-mono">password123</p>
            </div>
            <div>
              <p className="text-gray-600">Admin:</p>
              <p className="font-mono">admin@gmail.com</p>
              <p className="font-mono">admin@123</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login