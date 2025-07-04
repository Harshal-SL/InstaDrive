import { useState } from 'react'
import { FaTimes, FaCheckCircle, FaMoneyBillWave, FaSpinner } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { cancelBooking, returnCar, processRefund } from '../services/bookingService'

const BookingActions = ({ booking, onUpdate }) => {
  const [loading, setLoading] = useState({
    cancel: false,
    return: false,
    refund: false
  })

  const handleCancel = async () => {
    if (loading.cancel) return

    if (!window.confirm('Are you sure you want to cancel this booking? This will also process a refund if payment was made.')) {
      return
    }

    setLoading(prev => ({ ...prev, cancel: true }))

    try {
      await cancelBooking(booking.id || booking.bookingId)
      
      // Try to process refund automatically
      try {
        await processRefund(booking.id || booking.bookingId)
        toast.success('Booking cancelled and refund processed successfully')
      } catch (refundError) {
        console.warn('Booking cancelled but refund failed:', refundError)
        toast.success('Booking cancelled successfully. Refund will be processed separately.')
      }
      
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Failed to cancel booking. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, cancel: false }))
    }
  }

  const handleReturn = async () => {
    if (loading.return) return

    if (!window.confirm('Are you sure you want to return this car and complete the booking?')) {
      return
    }

    setLoading(prev => ({ ...prev, return: true }))

    try {
      await returnCar(booking.id || booking.bookingId)
      toast.success('Car returned successfully. Booking completed.')
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error returning car:', error)
      toast.error('Failed to return car. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, return: false }))
    }
  }

  const handleRefund = async () => {
    if (loading.refund) return

    if (!window.confirm('Are you sure you want to process a refund for this cancelled booking?')) {
      return
    }

    setLoading(prev => ({ ...prev, refund: true }))

    try {
      await processRefund(booking.id || booking.bookingId)
      toast.success('Refund processed successfully')
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error processing refund:', error)
      toast.error('Failed to process refund. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, refund: false }))
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'text-blue-600 bg-blue-100'
      case 'ACTIVE':
        return 'text-green-600 bg-green-100'
      case 'COMPLETED':
        return 'text-gray-600 bg-gray-100'
      case 'CANCELLED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Status Badge */}
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
        {booking.status || 'Unknown'}
      </span>

      {/* Action Buttons */}
      {booking.status === 'CONFIRMED' && (
        <button
          className="btn-danger-sm flex items-center"
          onClick={handleCancel}
          disabled={loading.cancel}
        >
          {loading.cancel ? (
            <FaSpinner className="mr-1 animate-spin" />
          ) : (
            <FaTimes className="mr-1" />
          )}
          Cancel
        </button>
      )}

      {booking.status === 'ACTIVE' && (
        <button
          className="btn-success-sm flex items-center"
          onClick={handleReturn}
          disabled={loading.return}
        >
          {loading.return ? (
            <FaSpinner className="mr-1 animate-spin" />
          ) : (
            <FaCheckCircle className="mr-1" />
          )}
          Return Car
        </button>
      )}

      {booking.status === 'CANCELLED' && (
        <button
          className="btn-warning-sm flex items-center"
          onClick={handleRefund}
          disabled={loading.refund}
        >
          {loading.refund ? (
            <FaSpinner className="mr-1 animate-spin" />
          ) : (
            <FaMoneyBillWave className="mr-1" />
          )}
          Process Refund
        </button>
      )}
    </div>
  )
}

export default BookingActions
