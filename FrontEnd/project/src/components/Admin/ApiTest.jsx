import { useState } from 'react'
import { adminLogin, testAuth } from '../../services/authService'
import { testAdminAccess, getDashboardData } from '../../services/adminService'

const ApiTest = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleAdminLogin = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const credentials = {
        email: 'admin@gmail.com',
        password: 'admin@123'
      }

      const response = await adminLogin(credentials)
      setResult({
        type: 'Admin Login',
        data: response
      })
    } catch (error) {
      console.error('Admin login test error:', error)
      setError({
        type: 'Admin Login',
        message: error.message,
        details: error.response?.data || 'No response data'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestAuth = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await testAuth()
      setResult({
        type: 'Test Auth',
        data: response
      })
    } catch (error) {
      console.error('Test auth error:', error)
      setError({
        type: 'Test Auth',
        message: error.message,
        details: error.response?.data || 'No response data'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestAdminAccess = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await testAdminAccess()
      setResult({
        type: 'Test Admin Access',
        data: response
      })
    } catch (error) {
      console.error('Test admin access error:', error)
      setError({
        type: 'Test Admin Access',
        message: error.message,
        details: error.response?.data || 'No response data'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGetDashboardData = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await getDashboardData()
      setResult({
        type: 'Dashboard Data',
        data: response
      })
    } catch (error) {
      console.error('Get dashboard data error:', error)
      setError({
        type: 'Dashboard Data',
        message: error.message,
        details: error.response?.data || 'No response data'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">API Test</h2>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button 
          onClick={handleAdminLogin}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Admin Login
        </button>
        
        <button 
          onClick={handleTestAuth}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Auth
        </button>
        
        <button 
          onClick={handleTestAdminAccess}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test Admin Access
        </button>
        
        <button 
          onClick={handleGetDashboardData}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        >
          Get Dashboard Data
        </button>
      </div>
      
      {loading && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p className="text-gray-600">Loading...</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 rounded border border-red-300">
          <h3 className="text-lg font-semibold text-red-700">{error.type} Error</h3>
          <p className="text-red-600 mb-2">{error.message}</p>
          <pre className="bg-red-50 p-2 rounded text-sm overflow-auto max-h-40">
            {JSON.stringify(error.details, null, 2)}
          </pre>
        </div>
      )}
      
      {result && (
        <div className="p-4 bg-green-100 rounded border border-green-300">
          <h3 className="text-lg font-semibold text-green-700">{result.type} Result</h3>
          <pre className="bg-green-50 p-2 rounded text-sm overflow-auto max-h-80">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default ApiTest
