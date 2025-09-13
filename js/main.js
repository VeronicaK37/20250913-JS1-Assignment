// js/main.js - Homepage functionality

let allProducts = [];
let filteredProducts = [];

/**
 * Initialize the homepage
 */
async function initHomepage() {
    showLoading(true);
    
    try {
        allProducts = await fetchProducts();
        filteredProducts = [...allProducts];
        
        renderProducts();
        populateFilters();
        hideError();
        
    } catch (error) {
        showError('Failed to load products. Please check your internet connection and try again.');
    } finally {
        showLoading(false);
    }
}

/**
 * Render products grid
 */
function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    
    if (!productsGrid) return;
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p class="no-products">No products found matching your criteria.</p>';
        return;
    }
    
    productsGrid.innerHTML = filteredProducts.map(product => {
        const price = getProductPrice(product);
        const imageUrl = getProductImageUrl(product);
        
        return `
            <div class="product-card">
                <img src="${imageUrl}" 
                     alt="${product.title}" 
                     class="product-image"
                     onerror="this.src='https://via.placeholder.com/280x250?text=Image+Not+Found'">
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-price">
                        ${product.onSale ? 
                            `<span class="original-price">${formatPrice(product.price)}</span>
                             <span class="sale-price">${formatPrice(product.discountedPrice)}</span>` 
                            : formatPrice(price)}
                    </div>
                    <div class="product-actions">
                        <a href="product/index.html?id=${product.id}" class="btn btn-primary">View Details</a>
                        <button onclick="handleAddToCart('${product.id}')" class="btn btn-success">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Populate filter options
 */
function populateFilters() {
    const genderFilter = document.getElementById('gender-filter');
    
    if (!genderFilter) return;
    
    // Get unique genders from products
    const genders = [...new Set(allProducts.map(product => product.gender).filter(Boolean))];
    
    genderFilter.innerHTML = '<option value="">All Genders</option>' + 
        genders.map(gender => `<option value="${gender}">${gender}</option>`).join('');
}

/**
 * Apply filters to products
 */
function applyFilters() {
    const genderFilter = document.getElementById('gender-filter');
    const searchInput = document.getElementById('search-input');
    
    const selectedGender = genderFilter ? genderFilter.value : '';
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    filteredProducts = allProducts.filter(product => {
        // Gender filter
        const matchesGender = !selectedGender || product.gender === selectedGender;
        
        // Search filter
        const matchesSearch = !searchTerm || 
            product.title.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            (product.baseColor && product.baseColor.toLowerCase().includes(searchTerm));
        
        return matchesGender && matchesSearch;
    });
    
    renderProducts();
}

/**
 * Handle add to cart button click
 * @param {string} productId - Product ID to add
 */
async function handleAddToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) {
        showError('Product not found. Please try again.');
        return;
    }
    
    addToCart(product);
}

/**
 * Show loading indicator
 * @param {boolean} show - Whether to show or hide loading
 */
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

/**
 * Hide error message
 */
function hideError() {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Filter change listeners
    const genderFilter = document.getElementById('gender-filter');
    const searchInput = document.getElementById('search-input');
    
    if (genderFilter) {
        genderFilter.addEventListener('change', applyFilters);
    }
    
    if (searchInput) {
        // Debounce search input
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(applyFilters, 300);
        });
    }
}

// Initialize homepage when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initHomepage();
    setupEventListeners();
});