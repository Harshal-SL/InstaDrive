import api from './api'

// Payment endpoints
export const processUpiPayment = async (paymentData) => {
  try {
    if (!paymentData.bookingId) {
      throw new Error('Booking ID is required for UPI payment')
    }

    // Transform the payment data to match backend expectations
    const upiPaymentRequest = {
      bookingId: paymentData.bookingId,
      amount: paymentData.amount,
      paymentMode: 'UPI',
      currency: 'USD',
      receiptEmail: paymentData.receiptEmail || 'customer@example.com',
      upiId: paymentData.upiDetails?.upiId || paymentData.upiId,
      userId: paymentData.userId
    }

    console.log('Sending UPI payment request:', upiPaymentRequest)
    const response = await api.post('/payments/upi', upiPaymentRequest)
    return response.data
  } catch (error) {
    console.error('UPI payment error:', error)

    // For development, return a mock payment response
    if (import.meta.env.DEV) {
      console.warn('Returning mock UPI payment response for development')
      return {
        success: true,
        status: 'SUCCESS',
        transactionId: `UPI${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        paymentDate: new Date().toISOString(),
        amount: paymentData.amount || 0,
        message: 'Payment processed successfully'
      }
    }

    throw error
  }
}

export const processCardPayment = async (paymentData) => {
  try {
    if (!paymentData.bookingId) {
      throw new Error('Booking ID is required for card payment')
    }

    // Transform the payment data to match backend expectations
    const cardPaymentRequest = {
      bookingId: paymentData.bookingId,
      amount: paymentData.amount,
      paymentMode: 'CREDIT_CARD',
      currency: 'USD',
      receiptEmail: paymentData.receiptEmail || 'customer@example.com',
      cardNumber: paymentData.cardDetails?.cardNumber || paymentData.cardNumber,
      cardExpiry: paymentData.cardDetails?.expiryDate || paymentData.expiryDate,
      cardCvc: paymentData.cardDetails?.cvv || paymentData.cvv,
      userId: paymentData.userId
    }

    console.log('Sending card payment request:', cardPaymentRequest)
    const response = await api.post('/payments/card', cardPaymentRequest)
    return response.data
  } catch (error) {
    console.error('Card payment error:', error)

    // For development, return a mock payment response
    if (import.meta.env.DEV) {
      console.warn('Returning mock card payment response for development')
      return {
        success: true,
        status: 'SUCCESS',
        transactionId: `CARD${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        paymentDate: new Date().toISOString(),
        amount: paymentData.amount || 0,
        message: 'Payment processed successfully'
      }
    }

    throw error
  }
}

export const confirmPaymentTransaction = async (transactionId) => {
  try {
    const response = await api.get(`/payments/confirm/${transactionId}`)
    return response.data
  } catch (error) {
    console.error(`Error confirming payment transaction ${transactionId}:`, error)
    throw error
  }
}

export const getPaymentHistory = async () => {
  try {
    const response = await api.get('/payments/history')
    return response.data
  } catch (error) {
    console.error('Error fetching payment history:', error)
    throw error
  }
}

// Helper functions for payment flow
export const processPayment = async (paymentData) => {
  try {
    // Validate inputs
    if (!paymentData.bookingId) {
      throw new Error('Booking ID is required for payment')
    }

    if (!paymentData.paymentMethod) {
      throw new Error('Payment method is required')
    }

    // Process payment based on method
    if (paymentData.paymentMethod.toLowerCase() === 'upi') {
      return processUpiPayment(paymentData)
    } else if (paymentData.paymentMethod.toLowerCase() === 'card') {
      return processCardPayment(paymentData)
    } else {
      throw new Error(`Unsupported payment method: ${paymentData.paymentMethod}`)
    }
  } catch (error) {
    console.error(`Error processing payment for booking ${paymentData.bookingId}:`, error)
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