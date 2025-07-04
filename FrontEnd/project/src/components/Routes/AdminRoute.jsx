import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Spinner from '../UI/Spinner'

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="large" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/user/dashboard" replace />
  }

  return children
}

export default AdminRoute