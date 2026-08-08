// Cart Management
let cart = [];

// DOM Elements
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');
const emptyCartMessage = document.getElementById('empty-cart');

// Initialize cart
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartDisplay();
    setupCartEventListeners();
});

// Setup cart event listeners
function setupCartEventListeners() {
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
}

// Load cart from localStorage
function loadCart() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count in header
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Update cart display
function updateCartDisplay() {
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'block';
        }
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
        }
        updateCartTotal();
        return;
    }

    if (emptyCartMessage) {
        emptyCartMessage.style.display = 'none';
    }
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
    }

    cartItemsContainer.innerHTML = '';
    cart.forEach((item, index) => {
        const cartItem = createCartItem(item, index);
        cartItemsContainer.appendChild(cartItem);
    });

    updateCartTotal();
}

// Create cart item element
function createCartItem(item, index) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
        <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
            <h4>${item.name}</h4>
            <p class="cart-item-weight">${item.weight}</p>
            <div class="cart-item-price">৳${item.price}</div>
        </div>
        <div class="cart-item-quantity">
            <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
            <input type="number" value="${item.quantity}" min="1" max="${item.stock}" onchange="changeQuantity(${index}, this.value)">
            <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
        </div>
        <div class="cart-item-total">৳${(item.price * item.quantity).toFixed(2)}</div>
        <div class="cart-item-remove">
            <button class="remove-btn" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return itemDiv;
}

// Update item quantity
function updateQuantity(index, change) {
    const newQuantity = cart[index].quantity + change;
    if (newQuantity >= 1 && newQuantity <= cart[index].stock) {
        cart[index].quantity = newQuantity;
        saveCart();
        updateCartDisplay();
    }
}

// Change quantity directly
function changeQuantity(index, newQuantity) {
    const qty = parseInt(newQuantity);
    if (qty >= 1 && qty <= cart[index].stock) {
        cart[index].quantity = qty;
        saveCart();
        updateCartDisplay();
    } else {
        // Reset to previous value
        updateCartDisplay();
    }
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartDisplay();
    showSuccess('Item removed from cart');
}

// Update cart total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotalElement) {
        cartTotalElement.textContent = `৳${total.toFixed(2)}`;
    }
}

// Add item to cart (called from products page)
function addToCart(productId, name, price, weight, image, stock) {
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        if (existingItem.quantity < stock) {
            existingItem.quantity += 1;
            showSuccess('Quantity updated in cart');
        } else {
            showError('Maximum stock reached');
            return;
        }
    } else {
        cart.push({
            productId,
            name,
            price: parseFloat(price),
            weight,
            image,
            quantity: 1,
            stock: parseInt(stock)
        });
        showSuccess('Product added to cart');
    }

    saveCart();
    updateCartDisplay();
}

// Clear cart
function clearCart() {
    cart = [];
    saveCart();
    updateCartDisplay();
    showSuccess('Cart cleared');
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showError('Your cart is empty');
        return;
    }

    // Store cart data for checkout page
    sessionStorage.setItem('checkoutCart', JSON.stringify(cart));

    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

// Get cart data for checkout
function getCartForCheckout() {
    return cart;
}

// Utility functions
function showError(message) {
    // You can implement a better notification system
    alert(message);
}

function showSuccess(message) {
    // You can implement a better notification system
    alert(message);
}

// Initialize cart count on page load
updateCartCount();
