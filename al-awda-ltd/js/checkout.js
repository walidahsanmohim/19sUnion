// Checkout JavaScript for Al-Awda E-commerce Website

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Get Current User ID (Simplified - in real app, from auth context)
function getCurrentUserId() {
    return localStorage.getItem('userId') || 'guest';
}

// Load Checkout Page
async function loadCheckout() {
    try {
        const userId = getCurrentUserId();
        const cartResponse = await fetch(`${API_BASE_URL}/cart/${userId}`);
        const cart = await cartResponse.json();

        if (!cart.items || cart.items.length === 0) {
            displayEmptyCheckout();
            return;
        }

        displayCheckoutForm(cart);
    } catch (error) {
        console.error('Error loading checkout:', error);
        alert('Error loading checkout page');
    }
}

// Display Checkout Form
function displayCheckoutForm(cart) {
    const checkoutContainer = document.querySelector('.checkout-container');
    if (!checkoutContainer) return;

    checkoutContainer.innerHTML = `
        <div class="checkout-layout">
            <div class="checkout-form">
                <h2>Billing Details</h2>
                <form id="checkout-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="name">Full Name *</label>
                            <input type="text" id="name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email Address *</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone Number *</label>
                        <input type="tel" id="phone" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label for="address">Delivery Address *</label>
                        <textarea id="address" name="address" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="order-notes">Order Notes (Optional)</label>
                        <textarea id="order-notes" name="order-notes" rows="2" placeholder="Any special instructions for delivery"></textarea>
                    </div>

                    <h3>Payment Method</h3>
                    <div class="payment-methods">
                        <div class="payment-method">
                            <input type="radio" id="cod" name="payment-method" value="cash_on_delivery" checked>
                            <label for="cod">
                                <span class="payment-icon">💵</span>
                                Cash on Delivery
                            </label>
                        </div>
                        <div class="payment-method">
                            <input type="radio" id="bkash" name="payment-method" value="bkash">
                            <label for="bkash">
                                <span class="payment-icon">📱</span>
                                bKash
                            </label>
                        </div>
                        <div class="payment-method">
                            <input type="radio" id="nagad" name="payment-method" value="nagad">
                            <label for="nagad">
                                <span class="payment-icon">📱</span>
                                Nagad
                            </label>
                        </div>
                    </div>

                    <button type="submit" class="btn-primary place-order-btn">Place Order</button>
                </form>
            </div>

            <div class="order-summary">
                <h3>Order Summary</h3>
                <div class="order-items">
                    ${cart.items.map(item => createOrderItemElement(item)).join('')}
                </div>
                <div class="order-totals">
                    <div class="subtotal">
                        <span>Subtotal:</span>
                        <span>৳${cart.total.toFixed(2)}</span>
                    </div>
                    <div class="shipping">
                        <span>Shipping:</span>
                        <span>Free</span>
                    </div>
                    <div class="total">
                        <strong>Total: ৳${cart.total.toFixed(2)}</strong>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add form submission handler
    initCheckoutForm();
}

// Create Order Item Element
function createOrderItemElement(item) {
    return `
        <div class="order-item">
            <div class="item-image">
                <img src="${item.image || 'image/Product/placeholder.jpg'}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h4>${item.name}</h4>
                <p class="item-weight">${item.weight}</p>
                <p class="item-quantity">Qty: ${item.quantity}</p>
            </div>
            <div class="item-price">
                ৳${(item.price * item.quantity).toFixed(2)}
            </div>
        </div>
    `;
}

// Display Empty Checkout
function displayEmptyCheckout() {
    const checkoutContainer = document.querySelector('.checkout-container');
    if (!checkoutContainer) return;

    checkoutContainer.innerHTML = `
        <div class="empty-checkout">
            <h2>Your Cart is Empty</h2>
            <p>You need to add items to your cart before checkout.</p>
            <button id="shop-now" class="btn-primary">Start Shopping</button>
        </div>
    `;

    const shopNowBtn = document.getElementById('shop-now');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', () => {
            window.location.href = 'shop.html';
        });
    }
}

// Initialize Checkout Form
function initCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (form) {
        form.addEventListener('submit', handleOrderSubmission);
    }
}

// Handle Order Submission
async function handleOrderSubmission(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const orderData = {
        customer: {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address')
        },
        paymentMethod: formData.get('payment-method'),
        orderNotes: formData.get('order-notes')
    };

    try {
        // Get cart items
        const userId = getCurrentUserId();
        const cartResponse = await fetch(`${API_BASE_URL}/cart/${userId}`);
        const cart = await cartResponse.json();

        if (!cart.items || cart.items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        // Prepare order items
        orderData.items = cart.items.map(item => ({
            product: item.productId,
            quantity: item.quantity
        }));

        // Submit order
        const orderResponse = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (orderResponse.ok) {
            const order = await orderResponse.json();
            // Clear cart after successful order
            await clearCartAfterOrder(userId);
            // Redirect to order confirmation
            window.location.href = `order-confirmation.html?orderId=${order._id}`;
        } else {
            const error = await orderResponse.json();
            alert(`Order failed: ${error.message}`);
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('Error placing order. Please try again.');
    }
}

// Clear Cart After Successful Order
async function clearCartAfterOrder(userId) {
    try {
        await fetch(`${API_BASE_URL}/cart/${userId}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
}

// Payment Method Selection
function initPaymentMethods() {
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // Hide all payment details
            document.querySelectorAll('.payment-details').forEach(detail => {
                detail.style.display = 'none';
            });

            // Show selected payment details
            const selectedMethod = this.value;
            const paymentDetails = document.getElementById(`${selectedMethod}-details`);
            if (paymentDetails) {
                paymentDetails.style.display = 'block';
            }
        });
    });
}

// Validate Form Fields
function validateCheckoutForm() {
    const requiredFields = ['name', 'email', 'phone', 'address'];
    let isValid = true;

    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        if (!element.value.trim()) {
            element.classList.add('error');
            isValid = false;
        } else {
            element.classList.remove('error');
        }
    });

    return isValid;
}

// Show Loading State
function showLoadingState() {
    const submitBtn = document.querySelector('.place-order-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
    }
}

// Hide Loading State
function hideLoadingState() {
    const submitBtn = document.querySelector('.place-order-btn');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Order';
    }
}

// Initialize Checkout Page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('checkout.html')) {
        loadCheckout();
        initPaymentMethods();
    }
});

// Export functions for use in other scripts
window.CheckoutUtils = {
    loadCheckout,
    validateCheckoutForm,
    showLoadingState,
    hideLoadingState
};
