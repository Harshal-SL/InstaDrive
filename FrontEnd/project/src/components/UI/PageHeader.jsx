import { motion } from 'framer-motion'

const PageHeader = ({ title, subtitle, image, alignment = 'center' }) => {
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  }[alignment] || 'text-center items-center'
  
  return (
    <div className="relative bg-gradient-to-r from-primary-900 to-primary-700 text-white py-16 md:py-24">
      {image && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20" 
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div className="relative container mx-auto px-4">
        <motion.div 
          className={`flex flex-col ${alignmentClasses} max-w-4xl mx-auto`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-gray-100 max-w-3xl">{subtitle}</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default PageHeader