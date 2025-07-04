import { useState } from 'react'
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa'

const CarFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    carType: initialFilters.carType || '',
    fuelType: initialFilters.fuelType || '',
    transmission: initialFilters.transmission || '',
    seats: initialFilters.seats || '',
    ...initialFilters
  })
  
  const [isExpanded, setIsExpanded] = useState(false)
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onFilterChange(filters)
  }
  
  const handleReset = () => {
    const resetFilters = {
      minPrice: '',
      maxPrice: '',
      carType: '',
      fuelType: '',
      transmission: '',
      seats: '',
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }
  
  const carTypes = ['Sedan', 'SUV', 'Sports', 'Luxury', 'Hybrid', 'Electric']
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid']
  const transmissions = ['Automatic', 'Manual']
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <FaFilter className="text-primary-600 mr-2" />
          <h3 className="font-semibold text-lg">Filters</h3>
        </div>
        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      
      {isExpanded && (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Price Range */}
            <div>
              <label className="label">Price Range ($/day)</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={handleInputChange}
                  className="input flex-1"
                  min="0"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={handleInputChange}
                  className="input flex-1"
                  min="0"
                />
              </div>
            </div>
            
            {/* Car Type */}
            <div>
              <label className="label">Car Type</label>
              <select
                name="carType"
                value={filters.carType}
                onChange={handleInputChange}
                className="input"
              >
                <option value="">Any</option>
                {carTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Fuel Type */}
            <div>
              <label className="label">Fuel Type</label>
              <select
                name="fuelType"
                value={filters.fuelType}
                onChange={handleInputChange}
                className="input"
              >
                <option value="">Any</option>
                {fuelTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Transmission */}
            <div>
              <label className="label">Transmission</label>
              <select
                name="transmission"
                value={filters.transmission}
                onChange={handleInputChange}
                className="input"
              >
                <option value="">Any</option>
                {transmissions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Seats */}
            <div>
              <label className="label">Seats</label>
              <select
                name="seats"
                value={filters.seats}
                onChange={handleInputChange}
                className="input"
              >
                <option value="">Any</option>
                {[2, 4, 5, 7, 8].map(seat => (
                  <option key={seat} value={seat}>{seat}+</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="btn-outline"
            >
              Reset
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Apply Filters
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default CarFilters