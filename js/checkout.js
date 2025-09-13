// js/checkout.js - Checkout page functionality

/**
 * Initialize checkout page
 */
function initCheckout() {
    // Redirect to homepage if cart is empty
    if (cart.length === 0) {
        alert('Your cart is empty. Redirecting to homepage...');
        window.location.href = '../index.html';
        return;
    }
    
    renderCheckoutItems();
    setupPaymentMethodToggle();
    setupFormValidation();
}

/**
 * Render checkout items
 */
function renderCheckoutItems() {
    const checkoutItemsElement = document.getElementById('checkout-items');
    const subtotalElement = document.getElementById('order-subtotal');
    const totalElement = document.getElementById('order-total');
    
    if (!checkoutItemsElement) return;
    
    const subtotal = getCartTotal();
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;
    
    // Render items
    checkoutItemsElement.innerHTML = cart.map(item => {
        const price = getProductPrice(item);
        const itemTotal = price * item.quantity;
        
        return `
            <div class="checkout-item">
                <div class="item-details">
                    <h4>${item.title}</h4>
                    <p>Quantity: ${item.quantity}</p>
                    <p>${formatPrice(price)} each</p>
                    ${item.onSale ? '<span class="sale-badge">On Sale!</span>' : ''}
                </div>
                <div class="item-price">
                    ${formatPrice(itemTotal)}
                </div>
            </div>
        `;
    }).join('');
    
    // Update totals
    if (subtotalElement) {
        subtotalElement.textContent = `Subtotal: ${formatPrice(subtotal)}`;
    }
    
    if (totalElement) {
        totalElement.innerHTML = `<strong>Total: ${formatPrice(total)}</strong>`;
    }
}

/**
 * Setup payment method toggle
 */
function setupPaymentMethodToggle() {
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const creditCardFields = document.getElementById('credit-card-fields');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            if (creditCardFields) {
                creditCardFields.style.display = e.target.value === 'credit-card' ? 'block' : 'none';
            }
        });
    });
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    const form = document.getElementById('checkout-form');
    
    if (!form) return;
    
    form.addEventListener('submit', handleCheckoutSubmit);
    
    // Real-time validation
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', clearFieldError);
    });
}

/**
 * Validate individual field
 * @param {Event} event - Input event
 */
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Remove existing error
    clearFieldError(event);
    
    if (!value && field.required) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Phone validation (basic)
    if (field.name === 'phone' && value) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    // Credit card validation
    if (field.name === 'cardNumber' && value) {
        const cardRegex = /^\d{13,19}$/;
        if (!cardRegex.test(value.replace(/\s/g, ''))) {
            showFieldError(field, 'Please enter a valid card number');
            return false;
        }
    }
    
    // Expiry date validation
    if (field.name === 'expiryDate' && value) {
        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expiryRegex.test(value)) {
            showFieldError(field, 'Please enter expiry date in MM/YY format');
            return false;
        }
    }
    
    // CVV validation
    if (field.name === 'cvv' && value) {
        const cvvRegex = /^\d{3,4}$/;
        if (!cvvRegex.test(value)) {
            showFieldError(field, 'Please enter a valid CVV');
            return false;
        }
    }
    
    return true;
}

/**
 * Show field error
 * @param {HTMLElement} field - Input field
 * @param {string} message - Error message
 */
function showFieldError(field, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = 'color: #e74c3c; font-size: 0.8rem; margin-top: 0.25rem;';
    
    field.style.borderColor = '#e74c3c';
    field.parentNode.appendChild(errorElement);
}

/**
 * Clear field error
 * @param {Event} event - Input event
 */
function clearFieldError(event) {
    const field = event.target;
    const existingError = field.parentNode.querySelector('.field-error');
    
    if (existingError) {
        existingError.remove();
    }
    
    field.style.borderColor = '';
}

/**
 * Handle checkout form submission
 * @param {Event} event - Form submit event
 */
async function handleCheckoutSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate all required fields
    let isValid = true;
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        alert('Please fix the errors above before submitting your order.');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Processing Order...';
    submitButton.disabled = true;
    
    try {
        // Simulate order processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Save order data to localStorage for confirmation page
        const orderData = {
            orderNumber: generateOrderNumber(),
            date: new Date().toLocaleDateString(),
            items: [...cart],
            total: getCartTotal(),
            customerInfo: Object.fromEntries(formData)
        };
        
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        
        // Clear cart
        clearCart();
        
        // Redirect to confirmation page
        window.location.href = 'confirmation/index.html';
        
    } catch (error) {
        alert('There was an error processing your order. Please try again.');
        console.error('Order processing error:', error);
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

/**
 * Generate random order number
 * @returns {string} Order number
 */
function generateOrderNumber() {
    const prefix = 'RD';
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${randomNum}`;
}

// Initialize checkout page when DOM is loaded
document.addEventListener('DOMContentLoaded', initCheckout);