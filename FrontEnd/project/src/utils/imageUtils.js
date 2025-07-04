/**
 * Image utilities for car images
 */

// Base path for car images
const CAR_IMAGES_BASE_PATH = '/images/cars/';

// Default fallback image
const DEFAULT_CAR_IMAGE = 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800';

// Car image mapping based on brand and model
const CAR_IMAGE_MAP = {
  'toyota-camry': 'toyota-camry.jpg',
  'honda-civic': 'honda-civic.jpg',
  'bmw-3': 'bmw-3.jpg',
  'toyota-rav4': 'toyota-rav4.jpg',
  'honda-crv': 'honda-crv.jpg',
  'bmw-x5': 'bmw-x5.jpg',
  'mercedes-s': 'mercedes-s.jpg',
  'audi-a8': 'audi-a8.jpg',
  'porsche-911': 'porsche-911.jpg',
  'ferrari-f8': 'ferrari-f8.jpg'
};

/**
 * Get the appropriate image URL for a car
 * @param {Object} car - Car object with brand, model, imageUrl properties
 * @returns {string} - Image URL
 */
export const getCarImageUrl = (car) => {
  // If car has a specific imageUrl, use it
  if (car?.imageUrl && car.imageUrl.trim() !== '') {
    // If it's a relative URL, make it absolute
    if (car.imageUrl.startsWith('/api/')) {
      return `http://localhost:8080${car.imageUrl}`;
    }
    return car.imageUrl;
  }

  // If car has an ID, try to get image from backend
  if (car?.id) {
    return `http://localhost:8080/api/cars/${car.id}/image?t=${new Date().getTime()}`;
  }

  // Try to generate image URL based on brand and model
  if (car?.brand && car?.model) {
    const key = `${car.brand.toLowerCase()}-${car.model.toLowerCase().replace(/\s+/g, '-')}`;
    const imageName = CAR_IMAGE_MAP[key];
    
    if (imageName) {
      return `${CAR_IMAGES_BASE_PATH}${imageName}`;
    }
  }

  // Try brand-only mapping
  if (car?.brand) {
    const brandKey = car.brand.toLowerCase();
    const brandImage = Object.keys(CAR_IMAGE_MAP).find(key => key.startsWith(brandKey));
    
    if (brandImage) {
      return `${CAR_IMAGES_BASE_PATH}${CAR_IMAGE_MAP[brandImage]}`;
    }
  }

  // Return default image as fallback
  return DEFAULT_CAR_IMAGE;
};

/**
 * Get all available car image paths
 * @returns {Array} - Array of image paths
 */
export const getAllCarImagePaths = () => {
  return Object.values(CAR_IMAGE_MAP).map(imageName => `${CAR_IMAGES_BASE_PATH}${imageName}`);
};

/**
 * Check if an image URL is valid (exists)
 * @param {string} imageUrl - Image URL to check
 * @returns {Promise<boolean>} - Promise that resolves to true if image exists
 */
export const checkImageExists = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
  });
};

/**
 * Get a placeholder image URL
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderImage = () => {
  return DEFAULT_CAR_IMAGE;
};

/**
 * Generate image URL for car based on ID
 * @param {number|string} carId - Car ID
 * @returns {string} - Image URL
 */
export const getCarImageById = (carId) => {
  if (!carId) return DEFAULT_CAR_IMAGE;
  return `http://localhost:8080/api/cars/${carId}/image?t=${new Date().getTime()}`;
};
