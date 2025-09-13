// js/confirmation.js - Order confirmation page functionality

/**
 * Initialize confirmation page
 */
function initConfirmation() {
    const orderData = getOrderData();
    
    if (!orderData) {
        // No order data found, redirect to homepage
        alert('No order information found. Redirecting to homepage...');
        window.location.href = '../../index.html';
        return;
    }
    
    renderOrderDetails(orderData);
    renderOrderItems(orderData.items);
    renderCustomerInfo(orderData.customerInfo);
    
    // Clear the order data from localStorage after displaying
    setTimeout(() => {
        localStorage.removeItem('lastOrder');
    }, 1000);
}

/**
 * Get order data from localStorage
 * @returns {Object|null} Order data or null if not found
 */
function getOrderData() {
    try {
        const orderDataString = localStorage.getItem('lastOrder');
        return orderDataString ? JSON.parse(orderDataString) : null;
    } catch (error) {
        console.error('Error parsing order data:', error);
        return null;
    }
}

/**
 * Render order details
 * @param {Object} orderData - Order data object
 */
function renderOrderDetails(orderData) {
    // Update order number
    const orderNumberElement = document.getElementById('order-number');
    if (orderNumberElement) {
        orderNumberElement.textContent = orderData.orderNumber;
    }
    
    // Update order date
    const orderDateElement = document.getElementById('order-date');
    if (orderDateElement) {
        orderDateElement.textContent = orderData.date;
    }
    
    // Update totals
    const subtotal = orderData.total;
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;
    
    const subtotalElement = document.getElementById('final-subtotal');
    const totalElement = document.getElementById('final-total');
    
    if (subtotalElement) {
        subtotalElement.textContent = formatPrice(subtotal);
    }
    
    if (totalElement) {
        totalElement.innerHTML = `<strong>${formatPrice(total)}</strong>`;
    }
}

/**
 * Render ordered items
 * @param {Array} items - Array of ordered items
 */
function renderOrderItems(items) {
    const orderedItemsElement = document.getElementById('ordered-items');
    
    if (!orderedItemsElement || !items || items.length === 0) return;
    
    orderedItemsElement.innerHTML = `
        <h4>Items Ordered:</h4>
        ${items.map(item => {
            const price = getProductPrice(item);
            const itemTotal = price * item.quantity;
            
            return `
                <div class="ordered-item">
                    <div class="item-info">
                        <strong>${item.title}</strong>
                        <br>
                        <small>Quantity: ${item.quantity} × ${formatPrice(price)}</small>
                        ${item.onSale ? '<br><span class="sale-badge">Sale Item</span>' : ''}
                    </div>
                    <div class="item-total">
                        ${formatPrice(itemTotal)}
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

/**
 * Render customer information
 * @param {Object} customerInfo - Customer information object
 */
function renderCustomerInfo(customerInfo) {
    const deliveryAddressElement = document.getElementById('delivery-address');
    
    if (!deliveryAddressElement || !customerInfo) return;
    
    const address = `
        <p><strong>${customerInfo.fullName}</strong></p>
        <p>${customerInfo.address}</p>
        <p>${customerInfo.city}, ${customerInfo.postalCode}</p>
        <p>${customerInfo.country}</p>
        ${customerInfo.email ? `<p>Email: ${customerInfo.email}</p>` : ''}
        ${customerInfo.phone ? `<p>Phone: ${customerInfo.phone}</p>` : ''}
    `;
    
    deliveryAddressElement.innerHTML = address;
}

/**
 * Format price for display (using the same function from api.js)
 * @param {number} price - Price to format
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
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
 * Setup print functionality
 */
function setupPrintButton() {
    const printButton = document.querySelector('button[onclick="window.print()"]');
    
    if (printButton) {
        printButton.addEventListener('click', () => {
            // Add print-specific styles
            const printStyles = `
                <style media="print">
                    body { font-family: Arial, sans-serif; }
                    header, footer, .confirmation-actions { display: none !important; }
                    .confirmation-content { box-shadow: none; margin: 0; }
                    .success-icon { color: #000 !important; }
                    .sale-badge { background: #000 !important; color: white !important; }
                </style>
            `;
            
            document.head.insertAdjacentHTML('beforeend', printStyles);
            
            setTimeout(() => {
                window.print();
            }, 100);
        });
    }
}

/**
 * Setup page animations
 */
function setupAnimations() {
    // Animate success icon
    const successIcon = document.querySelector('.success-icon');
    if (successIcon) {
        setTimeout(() => {
            successIcon.style.transform = 'scale(1.2)';
            successIcon.style.transition = 'transform 0.3s ease';
            
            setTimeout(() => {
                successIcon.style.transform = 'scale(1)';
            }, 300);
        }, 500);
    }
    
    // Fade in content
    const confirmationContent = document.querySelector('.confirmation-content');
    if (confirmationContent) {
        confirmationContent.style.opacity = '0';
        confirmationContent.style.transform = 'translateY(20px)';
        confirmationContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            confirmationContent.style.opacity = '1';
            confirmationContent.style.transform = 'translateY(0)';
        }, 100);
    }
}

// Initialize confirmation page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initConfirmation();
    setupPrintButton();
    setupAnimations();
    
    // Update cart count to 0 (since cart was cleared)
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = '0';
    }
});