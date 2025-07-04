import { motion } from 'framer-motion'
import Spinner from './Spinner'

const LoadingFallback = ({ 
  message = "Loading...", 
  size = "medium",
  showSpinner = true,
  className = ""
}) => {
  return (
    <motion.div 
      className={`flex flex-col items-center justify-center py-12 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {showSpinner && (
        <div className="mb-4">
          <Spinner size={size} />
        </div>
      )}
      
      <motion.p 
        className="text-gray-600 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {message}
      </motion.p>
    </motion.div>
  )
}

export default LoadingFallback
