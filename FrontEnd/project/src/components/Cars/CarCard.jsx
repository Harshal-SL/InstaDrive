import { Link } from 'react-router-dom'
import { FaCar, FaGasPump, FaUsers, FaCog } from 'react-icons/fa'
import { motion } from 'framer-motion'

const CarCard = ({ car }) => {
  return (
    <motion.div
      className="card overflow-hidden hover:translate-y-[-5px]"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="relative">
        <img
          src={car.imageUrl || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={car.name}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded-lg text-sm font-medium">
          ${car.price_per_day || car.pricePerDay || 0}/day
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white px-3 py-2">
          <div className="text-sm font-medium">{car.brand || ''} {car.model || ''}</div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">
            {car.name || `${car.brand || ''} ${car.model || ''}`}
          </h3>
          <div className="flex items-center text-sm text-gray-600">
            <FaCar className="mr-1" /> {car.year || 'N/A'}
          </div>
        </div>

        <div className="text-gray-700 mb-4 line-clamp-2">
          {car.description || 'No description available'}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center text-gray-700">
            <FaGasPump className="text-primary-600 mb-1" />
            <span className="text-sm">{car.fuelType || 'N/A'}</span>
          </div>
          <div className="flex flex-col items-center text-gray-700">
            <FaUsers className="text-primary-600 mb-1" />
            <span className="text-sm">{car.seats ? `${car.seats} Seats` : 'N/A'}</span>
          </div>
          <div className="flex flex-col items-center text-gray-700">
            <FaCog className="text-primary-600 mb-1" />
            <span className="text-sm">{car.transmission || 'N/A'}</span>
          </div>
        </div>

        <Link
          to={`/user/cars/${car.id}`}
          className="btn-primary w-full text-center block"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  )
}

export default CarCard