import api from './api'

/**
 * Get file by filename
 * @param {string} filename - Filename
 * @returns {Promise<Blob>} File blob
 */
export const getFile = async (filename) => {
  try {
    const response = await api.get(`/files/${filename}`, {
      responseType: 'blob'
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching file ${filename}:`, error)
    throw error
  }
}

/**
 * Get file URL
 * @param {string} filename - Filename
 * @returns {string} File URL
 */
export const getFileUrl = (filename) => {
  return `${api.defaults.baseURL}/files/${filename}`
}

/**
 * Download file
 * @param {string} filename - Filename
 * @param {string} downloadName - Name for the downloaded file
 */
export const downloadFile = async (filename, downloadName = null) => {
  try {
    const blob = await getFile(filename)
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob)
    
    // Create a link element
    const link = document.createElement('a')
    link.href = url
    link.download = downloadName || filename
    
    // Append to the document
    document.body.appendChild(link)
    
    // Trigger download
    link.click()
    
    // Clean up
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    console.error(`Error downloading file ${filename}:`, error)
    throw error
  }
}
