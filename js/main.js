// js/main.js - Homepage functionality

let allProducts = [];
let filteredProducts = [];

/**
 * Initialize the homepage
 */
async function initHomepage() {
    showLoading(true);
    hideError(); 
    
    try {
        allProducts = await fetchProducts();
        
        // Check if there is product data
        if (!allProducts || allProducts.length === 0) {
            showError('No products available at the moment. Please check back later.');
            return;
        }
        
        filteredProducts = [...allProducts];
        renderProducts();
        populateFilters();
        
    } catch (error) {
        // Show specific error message
        showError(error.message || 'Failed to load products. Please refresh the page or try again later.');
        showRetryButton();
        
    } finally {
        showLoading(false);
    }
}

/**
 * Render products grid with enhanced no-results handling
 */
function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    
    if (!productsGrid) return;
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = getNoResultsMessage();
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
 * Generate appropriate no-results message based on current state
 */
function getNoResultsMessage() {
    const searchInput = document.getElementById('search-input');
    const genderFilter = document.getElementById('gender-filter');
    
    const hasSearchTerm = searchInput && searchInput.value.trim();
    const hasGenderFilter = genderFilter && genderFilter.value;
    
    if (hasSearchTerm || hasGenderFilter) {
        return `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No products found</h3>
                <p>We couldn't find any products matching your search criteria.</p>
                <div class="no-results-actions">
                    <button onclick="clearFilters()" class="btn btn-secondary">Clear Filters</button>
                    <button onclick="showAllProducts()" class="btn btn-primary">View All Products</button>
                </div>
            </div>
        `;
    } else if (allProducts.length === 0) {
        return `
            <div class="no-results">
                <div class="no-results-icon">📦</div>
                <h3>No products available</h3>
                <p>We're currently updating our inventory. Please check back soon!</p>
                <button onclick="initHomepage()" class="btn btn-primary">Refresh</button>
            </div>
        `;
    } else {
        return '<p class="no-products">No products to display.</p>';
    }
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
 * Clear all filters and show all products
 */
function clearFilters() {
    const genderFilter = document.getElementById('gender-filter');
    const searchInput = document.getElementById('search-input');
    
    if (genderFilter) genderFilter.value = '';
    if (searchInput) searchInput.value = '';
    
    applyFilters();
}

/**
 * Show all products (alias for clearFilters)
 */
function showAllProducts() {
    clearFilters();
}

/**
 * Handle add to cart button click
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
 * Show retry button for failed API calls
 */
function showRetryButton() {
    const errorElement = document.getElementById('error-message');
    if (errorElement && !errorElement.querySelector('.retry-button')) {
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Retry Loading';
        retryButton.className = 'btn btn-primary retry-button';
        retryButton.style.marginTop = '1rem';
        retryButton.onclick = () => {
            errorElement.removeChild(retryButton);
            initHomepage();
        };
        errorElement.appendChild(retryButton);
    }
}

/**
 * Show loading indicator
 */
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

/**
 * Show error message
 */
function showError(message, canRetry = false) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        const messageElement = document.createElement('p');
        messageElement.textContent = message; // security automatically escape html！！
        
        errorElement.innerHTML = `
            <div class="error-content">
                <strong>Oops! Something went wrong</strong>
            </div>
        `;
        errorElement.querySelector('.error-content').appendChild(messageElement);
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
        errorElement.innerHTML = '';
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
        // Debounce search input for better performance
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