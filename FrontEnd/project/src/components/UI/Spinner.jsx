import { FaSpinner } from 'react-icons/fa'

const Spinner = ({ size = 'medium', className = '' }) => {
  const sizeClass = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-10 h-10'
  }[size] || 'w-6 h-6'
  
  return (
    <FaSpinner 
      className={`animate-spin text-primary-600 ${sizeClass} ${className}`} 
      aria-label="Loading" 
    />
  )
}

export default Spinner