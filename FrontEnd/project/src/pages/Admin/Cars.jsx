import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { getCarImageUrl } from '../../utils/imageUtils'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { getAllCars, deleteCar } from '../../services/carService'
import sampleCars from '../../data/sampleCars'
import PageHeader from '../../components/UI/PageHeader'
import Spinner from '../../components/UI/Spinner'
import LoadingFallback from '../../components/UI/LoadingFallback'

const AdminCars = () => {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true)
        const carsData = await getAllCars(filters)
        setCars(carsData)
      } catch (error) {
        console.error('Error fetching cars:', error)
        // Use sample cars data when API fails
        console.log('Using sample car data')
        setCars(sampleCars)
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [filters])

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters({ ...filters, search: searchTerm })
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleApplyFilters = () => {
    // Filters are already being applied when changed, but you could
    // batch them here if needed
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    setFilters({})
    setSearchTerm('')
    setIsFilterOpen(false)
  }

  const handleDeleteClick = (carId) => {
    setDeleteConfirmation(carId)
  }

  const handleConfirmDelete = async (carId) => {
    try {
      await deleteCar(carId)
      setCars(prev => prev.filter(car => car.id !== carId))
      toast.success('Car deleted successfully')
    } catch (error) {
      console.error('Error deleting car:', error)
      toast.info('Unable to delete car at this time. Please try again later.')
    } finally {
      setDeleteConfirmation(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmation(null)
  }

  // Filter cars by search term on the client side if API doesn't support it
  const filteredCars = searchTerm && !filters.search
    ? cars.filter(car =>
        car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cars

  return (
    <div>
      <PageHeader
        title="Manage Cars"
        subtitle="View, add, update, and remove cars from your fleet"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div className="flex-grow md:mr-4 mb-4 md:mb-0">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search cars by name, model, year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 pr-4 w-full"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FaSearch className="text-gray-400" />
              </div>
              <button type="submit" className="sr-only">Search</button>
            </form>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="btn-outline flex items-center"
            >
              <FaFilter className="mr-2" />
              Filter
              {isFilterOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
            </button>

            <Link to="/admin/cars/new" className="btn-primary flex items-center">
              <FaPlus className="mr-2" />
              Add New Car
            </Link>
          </div>
        </div>

        {/* Filters */}
        {isFilterOpen && (
          <motion.div
            className="bg-white rounded-xl shadow-md p-6 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="form-group">
                <label className="label">Car Type</label>
                <select
                  name="carType"
                  value={filters.carType || ''}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">All Types</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Sports">Sports</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Year</label>
                <select
                  name="year"
                  value={filters.year || ''}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">All Years</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Availability</label>
                <select
                  name="availability"
                  value={filters.availability || ''}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">All</option>
                  <option value="available">Available</option>
                  <option value="rented">Currently Rented</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleResetFilters}
                className="btn-outline"
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilters}
                className="btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Cars Table */}
        {loading ? (
          <LoadingFallback message="Loading cars..." />
        ) : (
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Car
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCars.map((car) => (
                    <tr key={car.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded overflow-hidden">
                            <img
                              src={getCarImageUrl(car)}
                              alt={car.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {car.name || `${car.brand || ''} ${car.model || ''}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {car.brand && car.model ? `${car.brand} ${car.model}` : ''}
                              {car.year ? (car.brand && car.model ? ` · ${car.year}` : car.year) : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {car.fuelType ? `${car.fuelType}` : 'N/A'}
                          {car.transmission ? ` · ${car.transmission}` : ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          {car.seats ? `${car.seats} Seats` : 'Seats: N/A'}
                        </div>
                        {car.registrationNumber && (
                          <div className="text-xs text-gray-500">Reg: {car.registrationNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${car.pricePerDay}/day</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          car.status === 'available' ? 'bg-green-100 text-green-800' :
                          car.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {car.status || 'Available'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          to={`/admin/cars/edit/${car.id}`}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <FaEdit className="inline mr-1" /> Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(car.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash className="inline mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCars.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No cars found</p>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
              <p className="mb-6">Are you sure you want to delete this car? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmDelete(deleteConfirmation)}
                  className="btn bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCars