// js/api.js - API functions for Rainy Days

const API_BASE = 'https://v2.api.noroff.dev/rainy-days';

/**
 * Fetch all products from the Rainy Days API
 * @returns {Promise<Array>} Array of products
 */
async function fetchProducts() {
    try {
      const response = await fetch(API_BASE);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Products not found. Please try again later.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.status === 429) {
            throw new Error('Too many requests. Please wait a moment and try again.');
        } else {
            throw new Error(`Unable to load products (Error ${response.status}). Please check your connection and try again.`);
        }
      }
      
      const data = await response.json();
      // check data format
      if (!data || !Array.isArray(data.data)) {
        throw new Error('Invalid product data received. Please refresh the page.');
    }

      return data.data || [];
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network connection failed. Please check your internet connection and try again.');
        }
      throw error;
    }
  }

/**
 * Fetch a single product by ID
 * @param {string} productId - The product ID
 * @returns {Promise<Object>} Single product object
 */
async function fetchProductById(productId) {
    try {
        const response = await fetch(`${API_BASE}/${productId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Product not found. It may have been removed or the link is incorrect.');
            }
            throw new Error(`Unable to load product details (Error ${response.status}).`);
        }
        
        const data = await response.json();

        if (!data || !data.data) {
            throw new Error('Invalid product data received.');
        }

        return data.data;
    } catch (error) {
         if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network connection failed. Please check your connection.');
        }
        throw error;
    }
}

/**
 * Get product price (handles sale prices)
 * @param {Object} product - Product object
 * @returns {number} Current price
 */
function getProductPrice(product) {
    return product.onSale ? product.discountedPrice : product.price;
}

/**
 * Format price for display
 * @param {number} price - Price to format
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

/**
 * Get product image URL with fallback
 * @param {Object} product - Product object
 * @returns {string} Image URL
 */
function getProductImageUrl(product) {
    return product.image?.url || 'https://via.placeholder.com/300x300?text=No+Image';
}