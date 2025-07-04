import { motion } from 'framer-motion'
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa'

const FallbackError = ({ 
  message = "Something went wrong", 
  onRetry = null,
  showRetry = true,
  className = ""
}) => {
  return (
    <motion.div 
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="text-red-500 mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      >
        <FaExclamationTriangle size={48} />
      </motion.div>
      
      <motion.h3 
        className="text-xl font-semibold text-gray-800 mb-2 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        Oops! Something went wrong
      </motion.h3>
      
      <motion.p 
        className="text-gray-600 text-center mb-6 max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        {message}
      </motion.p>
      
      {showRetry && onRetry && (
        <motion.button
          onClick={onRetry}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaRedo size={16} />
          Try Again
        </motion.button>
      )}
    </motion.div>
  )
}

export default FallbackError
