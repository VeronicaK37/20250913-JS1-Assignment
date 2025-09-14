// js/product.js - Product detail page functionality

let currentProduct = null;

/**
 * Get product ID from URL parameters
 * @returns {string|null} Product ID or null if not found
 */
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Initialize product detail page
 */
async function initProductPage() {
    const productId = getProductIdFromUrl();
    
    if (!productId) {
        showError('Invalid product link. Please return to the homepage and try again.');
        showBackToHomeButton();
        return;
    }
    
    showLoading(true);
    hideError();
    
    try {
        currentProduct = await fetchProductById(productId);
        
        if (!currentProduct) {
            throw new Error('Product data is empty or invalid.');
        }
        
        renderProductDetails();
        await loadRelatedProducts();
        
    } catch (error) {
        showError(error.message || 'Failed to load product details.');
        showBackToHomeButton();
        
    } finally {
        showLoading(false);
    }
}

// new addition back to home Button
function showBackToHomeButton() {
    const errorElement = document.getElementById('error-message');
    if (errorElement && !errorElement.querySelector('.back-home-button')) {
        const backButton = document.createElement('a');
        backButton.href = '../index.html';
        backButton.textContent = 'Back to Homepage';
        backButton.className = 'btn btn-primary back-home-button';
        backButton.style.marginTop = '1rem';
        backButton.style.display = 'inline-block';
        errorElement.appendChild(backButton);
    }
}

/**
 * Render product details
 */
function renderProductDetails() {
    const productDetailsElement = document.getElementById('product-details');
    
    if (!productDetailsElement || !currentProduct) return;
    
    const price = getProductPrice(currentProduct);
    const imageUrl = getProductImageUrl(currentProduct);
    
    productDetailsElement.innerHTML = `
        <div class="product-detail-grid">
            <div class="product-image-container">
                <img src="${imageUrl}" 
                     alt="${currentProduct.title}" 
                     class="product-detail-image"
                     onerror="this.src='https://via.placeholder.com/500x500?text=Image+Not+Found'">
            </div>
            
            <div class="product-detail-info">
                <h1>${currentProduct.title}</h1>
                
                <div class="product-price">
                    ${currentProduct.onSale ? `
                        <div class="price-container">
                            <span class="original-price">Original: ${formatPrice(currentProduct.price)}</span>
                            <span class="sale-price">Sale: ${formatPrice(currentProduct.discountedPrice)}</span>
                            <span class="discount-badge">
                                ${Math.round((1 - currentProduct.discountedPrice / currentProduct.price) * 100)}% OFF
                            </span>
                        </div>
                    ` : `
                        <span class="current-price">${formatPrice(price)}</span>
                    `}
                </div>
                
                <div class="product-meta">
                    <p><strong>Gender:</strong> ${currentProduct.gender || 'Not specified'}</p>
                    <p><strong>Sizes Available:</strong> ${currentProduct.sizes ? currentProduct.sizes.join(', ') : 'Not specified'}</p>
                    <p><strong>Base Color:</strong> ${currentProduct.baseColor || 'Not specified'}</p>
                    ${currentProduct.tags && currentProduct.tags.length > 0 ? 
                        `<p><strong>Tags:</strong> ${currentProduct.tags.join(', ')}</p>` : ''
                    }
                </div>
                
                <div class="product-description">
                    <h3>Description</h3>
                    <p>${currentProduct.description || 'No description available.'}</p>
                </div>
                
                <div class="product-actions">
                    <div class="quantity-selector">
                        <label for="quantity">Quantity:</label>
                        <div class="quantity-controls">
                            <button onclick="decreaseQuantity()" class="btn-quantity">-</button>
                            <input type="number" id="quantity" value="1" min="1" max="10">
                            <button onclick="increaseQuantity()" class="btn-quantity">+</button>
                        </div>
                    </div>
                    
                    <button onclick="handleAddToCartWithQuantity()" class="btn btn-success btn-large">
                        Add to Cart - ${formatPrice(price)}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Update page title
    document.title = `${currentProduct.title} - Rainy Days`;
}

/**
 * Load and display related products
 */
async function loadRelatedProducts() {
    try {
        const allProducts = await fetchProducts();
        
        // Filter products by same gender, excluding current product
        const relatedProducts = allProducts
            .filter(product => 
                product.id !== currentProduct.id && 
                product.gender === currentProduct.gender
            )
            .slice(0, 4); // Show max 4 related products
        
        if (relatedProducts.length > 0) {
            renderRelatedProducts(relatedProducts);
        } else {
            //new addition
            const relatedSection = document.getElementById('related-products');
            if (relatedSection) {
                relatedSection.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.warn('Error loading related products:', error.message);
    }
}

/**
 * Render related products
 * @param {Array} products - Array of related products
 */
function renderRelatedProducts(products) {
    const relatedSection = document.getElementById('related-products');
    const relatedGrid = document.getElementById('related-grid');
    
    if (!relatedSection || !relatedGrid) return;
    
    relatedGrid.innerHTML = products.map(product => {
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
                        <a href="index.html?id=${product.id}" class="btn btn-primary">View Details</a>
                        <button onclick="handleQuickAddToCart('${product.id}')" class="btn btn-success">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    relatedSection.style.display = 'block';
}

/**
 * Increase quantity
 */
function increaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 10) {
            quantityInput.value = currentValue + 1;
        }
    }
}

/**
 * Decrease quantity
 */
function decreaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    }
}

/**
 * Handle add to cart with selected quantity
 */
function handleAddToCartWithQuantity() {
    if (!currentProduct) return;
    
    const quantityInput = document.getElementById('quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    if (quantity < 1 || quantity > 10) {
        alert('Please select a quantity between 1 and 10.');
        return;
    }
    
    addToCart(currentProduct, quantity);
}

/**
 * Handle quick add to cart for related products
 * @param {string} productId - Product ID to add
 */
async function handleQuickAddToCart(productId) {
    try {
        const product = await fetchProductById(productId);
        addToCart(product);
    } catch (error) {
        showError('Failed to add product to cart. Please try again.');
    }
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

// Initialize product page when DOM is loaded
document.addEventListener('DOMContentLoaded', initProductPage);