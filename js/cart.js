// js/cart.js - Shopping Cart Management

// Cart state
let cart = JSON.parse(localStorage.getItem('rainyDaysCart')) || [];

/**
 * Add product to cart
 * @param {Object} product - Product to add
 * @param {number} quantity - Quantity to add (default: 1)
 */
function addToCart(product, quantity = 1) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartDisplay();
    showCartMessage(`${product.title} added to cart!`);
}

/**
 * Remove product from cart
 * @param {string} productId - ID of product to remove
 */
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    renderCartModal();
}

/**
 * Update product quantity in cart
 * @param {string} productId - Product ID
 * @param {number} newQuantity - New quantity
 */
function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartDisplay();
        renderCartModal();
    }
}

/**
 * Get cart total count
 * @returns {number} Total number of items in cart
 */
function getCartCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Get cart total price
 * @returns {number} Total price of all items in cart
 */
function getCartTotal() {
    return cart.reduce((total, item) => {
        const price = getProductPrice(item);
        return total + (price * item.quantity);
    }, 0);
}

/**
 * Clear entire cart
 */
function clearCart() {
    cart = [];
    saveCart();
    updateCartDisplay();
}

/**
 * Save cart to localStorage
 */
function saveCart() {
    localStorage.setItem('rainyDaysCart', JSON.stringify(cart));
}

/**
 * Update cart count display in header
 */
function updateCartDisplay() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = getCartCount();
    }
}

/**
 * Show cart modal
 */
function showCart() {
    renderCartModal();
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Hide cart modal
 */
function hideCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Render cart items in modal
 */
function renderCartModal() {
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (!cartItemsElement || !cartTotalElement) return;
    
    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p>Your cart is empty.</p>';
        cartTotalElement.innerHTML = '';
        return;
    }
    
    cartItemsElement.innerHTML = cart.map(item => {
        const price = getProductPrice(item);
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p>${formatPrice(price)} x ${item.quantity} = ${formatPrice(price * item.quantity)}</p>
                    ${item.onSale ? '<span class="sale-badge">On Sale!</span>' : ''}
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" class="btn-quantity">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" class="btn-quantity">+</button>
                    <button onclick="removeFromCart('${item.id}')" class="btn-remove">Remove</button>
                </div>
            </div>
        `;
    }).join('');
    
    cartTotalElement.innerHTML = `Total: ${formatPrice(getCartTotal())}`;
}

/**
 * Show cart notification message
 * @param {string} message - Message to show
 */
function showCartMessage(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('cart-modal');
        if (event.target === modal) {
            hideCart();
        }
    };
});

// CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
        border-bottom: 1px solid #eee;
    }
    
    .cart-item-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .btn-quantity {
        width: 30px;
        height: 30px;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
        border-radius: 3px;
    }
    
    .btn-quantity:hover {
        background: #f0f0f0;
    }
    
    .quantity {
        min-width: 30px;
        text-align: center;
        font-weight: bold;
    }
    
    .btn-remove {
        background: #e74c3c;
        color: white;
        border: none;
        padding: 0.25rem 0.5rem;
        border-radius: 3px;
        cursor: pointer;
        font-size: 0.8rem;
    }
    
    .btn-remove:hover {
        background: #c0392b;
    }
    
    .sale-badge {
        background: #e74c3c;
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 3px;
        font-size: 0.8rem;
    }
`;
document.head.appendChild(style);