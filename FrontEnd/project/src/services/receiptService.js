import api from './api'

/**
 * Get receipt details by ID
 * @param {string} id - Receipt ID
 * @returns {Promise<Object>} Receipt details
 */
export const getReceiptById = async (id) => {
  try {
    const response = await api.get(`/receipts/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching receipt ${id}:`, error)
    throw error
  }
}

/**
 * Download receipt as PDF
 * @param {string} id - Receipt ID
 * @returns {Promise<Blob>} PDF blob
 */
export const downloadReceipt = async (id) => {
  try {
    const response = await api.get(`/receipts/download/${id}`, {
      responseType: 'blob'
    })
    return response.data
  } catch (error) {
    console.error(`Error downloading receipt ${id}:`, error)
    throw error
  }
}

/**
 * Helper function to trigger browser download of receipt PDF
 * @param {string} id - Receipt ID
 * @param {string} filename - Filename for the downloaded PDF
 */
export const downloadReceiptFile = async (id, filename = null) => {
  try {
    const blob = await downloadReceipt(id)
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob)
    
    // Create a link element
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `receipt-${id}.pdf`
    
    // Append to the document
    document.body.appendChild(link)
    
    // Trigger download
    link.click()
    
    // Clean up
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    console.error(`Error downloading receipt file ${id}:`, error)
    throw error
  }
}
