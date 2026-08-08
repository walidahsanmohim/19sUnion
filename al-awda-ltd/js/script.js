/* ================= CONSTANTS ================= */
const DISCOUNT_RATES = {
    WEIGHT_10_PLUS: 0.15, // 15% discount for 10kg+
    WEIGHT_6_PLUS: 0.10,  // 10% discount for 6kg+
    WEIGHT_5_PLUS: 0.08,  // 8% discount for 5kg+
    WEIGHT_3_PLUS: 0.05   // 5% discount for 3kg+
};

const SHIPPING_RATES = {
    CHITTAGONG_BASE: 50,   // 50tk base for 1kg inside Chittagong
    OUTSIDE_BASE: 120,     // 120tk base for 1kg outside Chittagong
    ADDITIONAL_PER_KG: 20, // 20tk per kg additional
    FREE_DELIVERY_MIN_WEIGHT: 3 // Free delivery for 3kg and above in Chittagong
};

const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info'
};

const STORAGE_KEYS = {
    CART: 'cart',
    THEME: 'theme'
};

/* ================= UTILITY FUNCTIONS ================= */

/**
 * Debounce function to limit the rate of function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Sanitize string to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Safe JSON parse with fallback
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Fallback value
 * @returns {*} Parsed object or fallback
 */
function safeJSONParse(jsonString, fallback = null) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn('Failed to parse JSON:', e);
        return fallback;
    }
}

/* ================= MOBILE NAV ================= */
const bar = document.getElementById("mobile");
const navbar = document.getElementById("navbar");

bar?.addEventListener("click", () => {
    navbar.classList.toggle("active");
});

/* ================= DARK MODE ================= */
const darkToggle = document.getElementById("dark-toggle");

darkToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
});

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

/* ================= CART SYSTEM ================= */
let cart = safeJSONParse(localStorage.getItem(STORAGE_KEYS.CART), []);

// Function to add item to cart
function addToCart(productElement) {
    const name = productElement.querySelector("h5").innerText;
    const priceText = productElement.querySelector("h4").innerText;
    const price = parseFloat(priceText.split('/')[1].replace('৳', '').trim());



    if (isNaN(price) || price <= 0) {
        showNotification("Invalid product price", "error");
        return;
    }

    const image = productElement.querySelector("img").src;
    const id = name.toLowerCase().replace(/\s+/g, '-');

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    showNotification("Added to cart ✔", "success");
}

// Function to update cart count in header
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartIcon = document.querySelector('#navbar li a[href="cart.html"]');
    if (cartIcon) {
        cartIcon.innerHTML = `<img width="48" height="48" src="https://img.icons8.com/parakeet-line/48/shopping-cart.png" alt="shopping-cart"/><span class="cart-count">${cartCount}</span>`;
    }
}

// Function to show notifications
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerText = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add event listeners to cart buttons
document.querySelectorAll(".cart").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        const product = btn.closest(".pro");
        addToCart(product);
    });
});

// Initialize cart count on page load
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    if (document.getElementById("cart-items")) {
        renderCart();
    }
});

/* ================= LOGIN MODAL ================= */
const loginModal = document.getElementById("login-modal");
const loginBtn = document.getElementById("login-btn");
const closeLogin = document.getElementById("close-login");

loginBtn?.addEventListener("click", () => {
    loginModal.classList.add("active");
});

closeLogin?.addEventListener("click", () => {
    loginModal.classList.remove("active");
});

/* ================= CART PAGE FUNCTIONS ================= */

// Function to render cart items
function renderCart() {
    const cartItemsContainer = document.getElementById("cart-items");
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 50px;">
                    <h3>Your cart is empty</h3>
                    <p>Add some delicious dates to get started!</p>
                    <a href="index.html" class="normal" style="margin-top: 20px; display: inline-block;">Continue Shopping</a>
                </td>
            </tr>
        `;
        updateCartTotals(0);
        return;
    }

    cart.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><a href="#" onclick="removeFromCart(${index})"><i class="fas fa-times-circle"></i></a></td>
            <td><img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"></td>
            <td>${item.name}</td>
            <td>${item.price}৳</td>
            <td><input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)"></td>
            <td>${(item.price * item.quantity)}৳</td>
        `;
        cartItemsContainer.appendChild(row);
    });

    updateCartTotals();
}

// Function to remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
    showNotification("Item removed from cart", "info");
}

// Function to update item quantity
function updateQuantity(index, newQuantity) {
    const quantity = parseInt(newQuantity);
    if (quantity < 1) {
        removeFromCart(index);
        return;
    }
    cart[index].quantity = quantity;
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// Function to calculate total weight from cart
function calculateTotalWeight() {
    return cart.reduce((total, item) => {
        // Extract weight from product name or assume 1kg per item if not specified
        const weightMatch = item.name.match(/(\d+)kg/i);
        const weight = weightMatch ? parseInt(weightMatch[1]) : 1;
        return total + (weight * item.quantity);
    }, 0);
}

/**
 * Calculate discount based on total weight
 * @param {number} totalWeight - Total weight of items in kg
 * @param {number} subtotal - Subtotal before discount
 * @returns {number} Discount amount
 */
function calculateDiscount(totalWeight, subtotal) {
    if (totalWeight >= 10) {
        return subtotal * DISCOUNT_RATES.WEIGHT_10_PLUS;
    } else if (totalWeight >= 6) {
        return subtotal * DISCOUNT_RATES.WEIGHT_6_PLUS;
    } else if (totalWeight >= 5) {
        return subtotal * DISCOUNT_RATES.WEIGHT_5_PLUS;
    } else if (totalWeight >= 3) {
        return subtotal * DISCOUNT_RATES.WEIGHT_3_PLUS;
    }
    return 0;
}

/**
 * Calculate shipping cost based on location and weight
 * @param {number} totalWeight - Total weight of items in kg
 * @param {string} location - Delivery location ('chittagong' or 'outside')
 * @returns {number} Shipping cost
 */
function calculateShipping(totalWeight, location) {
    if (!location) return 0;

    if (location === 'chittagong') {
        // Free delivery for 3kg and above
        if (totalWeight >= SHIPPING_RATES.FREE_DELIVERY_MIN_WEIGHT) {
            return 0;
        }
        // For other weights: 50tk base + 20tk per additional kg
        return 50 + 20 * (totalWeight - 1);
    } else if (location === 'outside') {
        // 120tk for 1kg, 150tk for 2kg, 170tk for 3kg, then +20tk per additional kg
        if (totalWeight === 1) return 120;
        if (totalWeight === 2) return 150;
        return 170 + 20 * (totalWeight - 3);
    }

    return 0;
}

// Function to update cart totals
function updateCartTotals() {
    const subtotalElement = document.querySelector("#subtotal table tr:nth-child(1) td:nth-child(2)");
    const shippingElement = document.querySelector("#subtotal table tr:nth-child(2) td:nth-child(2)");
    const totalElement = document.querySelector("#subtotal table tr:nth-child(3) td:nth-child(2)");

    if (!subtotalElement || !shippingElement || !totalElement) return;

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalWeight = calculateTotalWeight();
    const location = document.getElementById('delivery-location')?.value;

    const shipping = calculateShipping(totalWeight, location);
    const totalBeforeDiscount = subtotal + shipping;
    const discount = calculateDiscount(totalWeight, totalBeforeDiscount);
    const total = totalBeforeDiscount - discount;

    subtotalElement.textContent = `${subtotal.toFixed(0)}৳`;
    shippingElement.textContent = shipping === 0 ? 'Free' : `${shipping}৳`;
    totalElement.innerHTML = `<strong>${total.toFixed(0)}৳</strong>`;

    // Show discount information if applicable
    const discountRow = document.querySelector("#subtotal table tr:nth-child(2)");
    if (discount > 0) {
        if (!document.querySelector("#subtotal table tr.discount-row")) {
            const discountTr = document.createElement('tr');
            discountTr.className = 'discount-row';
            discountTr.innerHTML = `<td>Discount (${(discount/totalBeforeDiscount*100).toFixed(0)}%)</td><td>-${discount.toFixed(0)}৳</td>`;
            discountRow.parentNode.insertBefore(discountTr, discountRow);
        } else {
            document.querySelector("#subtotal table tr.discount-row td:nth-child(2)").textContent = `-${discount.toFixed(0)}৳`;
        }
    } else {
        const existingDiscountRow = document.querySelector("#subtotal table tr.discount-row");
        if (existingDiscountRow) {
            existingDiscountRow.remove();
        }
    }
}

// Function to clear cart
function clearCart() {
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
    showNotification("Cart cleared", "info");
}

// Function to apply coupon (placeholder)
function applyCoupon() {
    const couponInput = document.querySelector("#coupon input");
    const couponCode = couponInput.value.trim().toUpperCase();

    if (couponCode === "ALAWDA10") {
        showNotification("Coupon applied! 10% discount", "success");
        // Implement discount logic here
    } else if (couponCode) {
        showNotification("Invalid coupon code", "error");
    }
}

// Function to handle delivery form submission
async function handleOrderSubmission(e) {
    e.preventDefault();

    if (cart.length === 0) {
        showNotification("Your cart is empty!", "error");
        return;
    }

    const formData = new FormData(e.target);
    const customer = {
        name: formData.get('name'),
        email: '', // Can be added later
        phone: formData.get('phone'),
        address: formData.get('address')
    };

    const items = cart.map(item => ({
        product: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        weight: item.weight
    }));

    const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0) +
                       calculateShipping(calculateTotalWeight(), formData.get('location')) -
                       calculateDiscount(calculateTotalWeight(), cart.reduce((total, item) => total + (item.price * item.quantity), 0) + calculateShipping(calculateTotalWeight(), formData.get('location')));

    const orderData = {
        customer,
        items,
        totalAmount,
        paymentMethod: formData.get('payment'),
        orderNotes: `Delivery Location: ${formData.get('location')}`
    };

    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const result = await response.json();
            showNotification(`Order placed successfully! Order ID: ${result._id.slice(-8)}. We'll contact you soon.`, "success");

            // Clear cart after successful order
            clearCart();

            // Reset form
            e.target.reset();

            // Scroll to top
            window.scrollTo(0, 0);
        } else {
            const error = await response.json();
            showNotification(`Failed to place order: ${error.message}`, "error");
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showNotification("Failed to place order. Please try again.", "error");
    }
}

// Add event listeners for cart page
document.addEventListener("DOMContentLoaded", () => {
    // Coupon apply button
    const applyCouponBtn = document.querySelector("#coupon button");
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener("click", applyCoupon);
    }

    // Delivery location change event
    const deliveryLocation = document.getElementById('delivery-location');
    if (deliveryLocation) {
        deliveryLocation.addEventListener('change', updateCartTotals);
    }

    // Delivery form submission
    const deliveryForm = document.getElementById('delivery-form');
    if (deliveryForm) {
        deliveryForm.addEventListener('submit', handleOrderSubmission);
    }

    // Clear cart functionality (can be added to a clear cart button if needed)
    // const clearCartBtn = document.getElementById("clear-cart");
    // if (clearCartBtn) {
    //     clearCartBtn.addEventListener("click", clearCart);
    // }
});

/* ================= SEARCH AND FILTER FUNCTIONALITY ================= */

// Product data for filtering
let allProducts = [];
let filteredProducts = [];

// Function to initialize products from API
async function initializeProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const products = await response.json();

        // Clear existing products
        const productContainers = document.querySelectorAll('.pro-container');
        productContainers.forEach(container => {
            // Keep only the first container for featured products, clear others
            if (container.closest('#product1')) {
                container.innerHTML = '';
            }
        });

        // Create product elements from API data
        products.forEach(product => {
            const productElement = createProductElement(product);
            // Add to appropriate container based on some logic (you can customize this)
            const container = document.querySelector('.pro-container');
            if (container) {
                container.appendChild(productElement);
            }
        });

        // Store product data for filtering
        allProducts = products.map(product => ({
            ...product,
            element: document.querySelector(`[data-product-id="${product._id}"]`)
        }));
        filteredProducts = [...allProducts];

    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to static products if API fails
        initializeStaticProducts();
    }
}

// Function to create product element from API data
function createProductElement(product) {
    const pro = document.createElement('div');
    pro.className = 'pro';
    pro.setAttribute('data-product-id', product._id);

    const stars = generateStars(product.rating || 4.5);

    pro.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="des">
            <span>Dates</span>
            <h5>${product.name}</h5>
            <div class="star">
                ${stars}
            </div>
            <h4>${product.weight}/ ${product.price}৳</h4>
        </div>
        <a href="#" class="cart"><i class="fa-solid fa-cart-shopping"></i></a>
    `;

    // Add cart functionality
    const cartBtn = pro.querySelector('.cart');
    cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addToCartFromAPI(product);
    });

    // Add modal functionality
    const img = pro.querySelector('img');
    const title = pro.querySelector('h5');

    img.addEventListener('click', () => openProductModalAPI(product));
    title.addEventListener('click', () => openProductModalAPI(product));

    return pro;
}

// Function to generate star rating HTML
function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fa-solid fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = Math.ceil(rating); i < 5; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

// Function to add to cart from API data
function addToCartFromAPI(product) {
    const existingItem = cart.find(item => item.id === product._id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            weight: product.weight
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    showNotification("Added to cart ✔", "success");
}

// Fallback function for static products
function initializeStaticProducts() {
    const productElements = document.querySelectorAll('.pro-container .pro');
    allProducts = Array.from(productElements).map(product => {
        const name = product.querySelector('h5').innerText;
        const priceText = product.querySelector('h4').innerText;
        const price = parseFloat(priceText.split('/')[1].replace('৳', '').trim());
        const category = getProductCategory(name);
        const quality = getProductQuality(name);
        return {
            element: product,
            name: name,
            price: price,
            category: category,
            quality: quality
        };
    });
    filteredProducts = [...allProducts];
}

// Function to determine product category (variety)
function getProductCategory(name) {
    if (name.includes('Ajwa')) return 'ajwa';
    if (name.includes('Medjool')) return 'medjool';
    if (name.includes('Maryam')) return 'maryam';
    if (name.includes('Mabroom')) return 'mabroom';
    if (name.includes('Mashrook')) return 'mashrook';
    if (name.includes('Safawi')) return 'safawi';
    if (name.includes('Sukkari')) return 'sukkari';
    if (name.includes('Jahedi')) return 'jahedi';
    if (name.includes('Nagal')) return 'nagal';
    if (name.includes('Alzerian')) return 'alzerian';
    if (name.includes('Deglet Noor')) return 'deglet-noor';
    return 'regular';
}

// Function to determine product quality
function getProductQuality(name) {
    if (name.includes('Ajwa') || name.includes('Medjool') || name.includes('Maryam') || name.includes('Deglet Noor')) {
        return 'premium';
    } else if (name.includes('Safawi') || name.includes('Sukkari') || name.includes('Mabroom')) {
        return 'deluxe';
    } else if (name.includes('Nagal') || name.includes('Alzerian')) {
        return 'organic';
    } else if (name.includes('Jahedi')) {
        return 'seedless';
    }
    return 'regular';
}

// Function to filter products
function filterProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const qualityFilter = document.getElementById('quality-filter').value;
    const priceFilter = document.getElementById('price-filter').value;

    filteredProducts = allProducts.filter(product => {
        // Search filter
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);

        // Category filter
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

        // Quality filter
        const matchesQuality = qualityFilter === 'all' || product.quality === qualityFilter;

        // Price filter
        let matchesPrice = true;
        if (priceFilter !== 'all') {
            switch (priceFilter) {
                case 'under-500':
                    matchesPrice = product.price < 500;
                    break;
                case '500-1000':
                    matchesPrice = product.price >= 500 && product.price <= 1000;
                    break;
                case '1000-1500':
                    matchesPrice = product.price >= 1000 && product.price <= 1500;
                    break;
                case 'above-1500':
                    matchesPrice = product.price > 1500;
                    break;
            }
        }

        return matchesSearch && matchesCategory && matchesQuality && matchesPrice;
    });

    renderFilteredProducts();
}

// Function to render filtered products
function renderFilteredProducts() {
    const productContainers = document.querySelectorAll('.pro-container');

    // Hide all products first
    allProducts.forEach(product => {
        product.element.style.display = 'none';
    });

    // Show filtered products
    filteredProducts.forEach(product => {
        product.element.style.display = 'block';
    });

    // Show "no results" message if no products match
    productContainers.forEach(container => {
        const visibleProducts = Array.from(container.children).filter(child =>
            child.style.display !== 'none'
        );

        // Remove existing no-results message
        const existingMessage = container.querySelector('.no-results');
        if (existingMessage) {
            existingMessage.remove();
        }

        if (visibleProducts.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <div style="text-align: center; padding: 50px; grid-column: 1 / -1;">
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                    <button onclick="clearAllFilters()" class="normal" style="margin-top: 20px;">Clear All Filters</button>
                </div>
            `;
            container.appendChild(noResults);
        }
    });
}

// Function to clear all filters
function clearAllFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = 'all';
    document.getElementById('quality-filter').value = 'all';
    document.getElementById('price-filter').value = 'all';
    filteredProducts = [...allProducts];
    renderFilteredProducts();
}

// Initialize search and filter functionality
document.addEventListener("DOMContentLoaded", () => {
    // Initialize products if on index page
    if (document.querySelector('.pro-container')) {
        initializeProducts();
    }

    // Search input event listener
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    // Filter select event listeners
    const categoryFilter = document.getElementById('category-filter');
    const qualityFilter = document.getElementById('quality-filter');
    const priceFilter = document.getElementById('price-filter');
    const clearFiltersBtn = document.getElementById('clear-filters');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }

    if (qualityFilter) {
        qualityFilter.addEventListener('change', filterProducts);
    }

    if (priceFilter) {
        priceFilter.addEventListener('change', filterProducts);
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
});

/* ================= PRODUCT MODAL FUNCTIONALITY ================= */

// Product data for modal
const productData = {
    'ajwa-dates': {
        name: 'Ajwa Dates',
        price: 1150,
        originalPrice: 1300,
        rating: 4.5,
        description: 'Premium Ajwa dates from Saudi Arabia, known for their rich flavor and numerous health benefits. These dates are naturally sweet and packed with essential nutrients.',
        specs: [
            'Origin: Saudi Arabia',
            'Weight: 1kg',
            'Grade: Premium',
            'Shelf Life: 2 years',
            'Storage: Cool, dry place'
        ],
        images: [
            'image/Product/Ajwa.JPG',
            'image/Product/Ajwa.JPG',
            'image/Product/Ajwa.JPG'
        ]
    },
    'medjool-dates': {
        name: 'Medjool Dates',
        price: 1850,
        originalPrice: 2000,
        rating: 4.8,
        description: 'Large, soft, and caramel-like Medjool dates from Israel. Often called the "King of Dates" for their superior taste and texture.',
        specs: [
            'Origin: Israel',
            'Weight: 1kg',
            'Grade: Jumbo',
            'Shelf Life: 2 years',
            'Storage: Cool, dry place'
        ],
        images: [
            'image/Product/Medjool.JPG',
            'image/Product/Medjool.JPG',
            'image/Product/Medjool.JPG'
        ]
    },
    'maryam-dates': {
        name: 'Maryam Dates',
        price: 1250,
        originalPrice: 1400,
        rating: 4.6,
        description: 'Delicious Maryam dates with a perfect balance of sweetness and moisture. Ideal for snacking and cooking.',
        specs: [
            'Origin: Middle East',
            'Weight: 1kg',
            'Grade: Premium',
            'Shelf Life: 2 years',
            'Storage: Cool, dry place'
        ],
        images: [
            'image/Product/Maryam.JPG',
            'image/Product/Maryam.JPG',
            'image/Product/Maryam.JPG'
        ]
    },
    'safawi-dates': {
        name: 'Safawi Dates',
        price: 1000,
        originalPrice: 1100,
        rating: 4.4,
        description: 'Popular Safawi dates known for their distinctive taste and texture. Perfect for everyday consumption.',
        specs: [
            'Origin: Saudi Arabia',
            'Weight: 1kg',
            'Grade: Standard',
            'Shelf Life: 2 years',
            'Storage: Cool, dry place'
        ],
        images: [
            'image/Product/Safavi.JPG',
            'image/Product/Safavi.JPG',
            'image/Product/Safavi.JPG'
        ]
    },
    'sukkari-dates': {
        name: 'Sukkari Dates',
        price: 950,
        originalPrice: 1050,
        rating: 4.3,
        description: 'Sweet and crunchy Sukkari dates, perfect for those who prefer a firmer texture with excellent flavor.',
        specs: [
            'Origin: Middle East',
            'Weight: 1kg',
            'Grade: Standard',
            'Shelf Life: 2 years',
            'Storage: Cool, dry place'
        ],
        images: [
            'image/Product/sukkari.jpg',
            'image/Product/sukkari.jpg',
            'image/Product/sukkari.jpg'
        ]
    },
    'jahedi-dates': {
        name: 'Jahedi Dates',
        price: 350,
        originalPrice: 400,
        rating: 4.0,
        description: 'Affordable and delicious Jahedi dates, perfect for everyday consumption and cooking purposes.',
        specs: [
            'Origin: Middle East',
            'Weight: 1kg',
            'Grade: Standard',
            'Shelf Life: 2 years',
            'Storage: Cool, dry place'
        ],
        images: [
            'image/Product/Jahedi.JPG',
            'image/Product/Jahedi.JPG',
            'image/Product/Jahedi.JPG'
        ]
    },
    'nagal-dates': {
        name: 'Nagal Dates',
        price: 400,
        originalPrice: 450,
        rating: 4.1,
        description: 'Fresh Nagal dates with a unique flavor profile. Great for both eating fresh and cooking.',
        specs: [
            'Origin: Middle East',
            'Weight: 1kg',
            'Grade: Standard',
            'Shelf Life: 2 years',
            'Storage: Cool, dry place'
        ],
        images: [
            'image/Product/Nagal.jpg',
            'image/Product/Nagal.jpg',
            'image/Product/Nagal.jpg'
        ]
    },
    'alzerian-dates': {
        name: 'Alzerian Dates',
        price: 620,
        originalPrice: 700,
        rating: 4.2,
        description: 'Quality Algerian dates with excellent taste and nutritional value. Perfect for health-conscious consumers.',
        specs: [
            'Origin: Algeria',
            'Weight: 1kg',
            'Grade: Standard',
            'Shelf Life: 2 years',
            'Storage: Cool, dry place'
        ],
        images: [
            'image/Product/Alzerian.jpg',
            'image/Product/Alzerian.jpg',
            'image/Product/Alzerian.jpg'
        ]
    },
    'deglet-noor-dates': {
        name: 'Deglet Noor Dates',
        price: 1100,
        originalPrice: 1200,
        rating: 4.5,
        description: 'Premium Deglet Noor dates, also known as "finger dates" for their elongated shape. Rich in flavor and nutrients.',
        specs: [
            'Origin: Tunisia',
            'Weight: 1kg',
            'Grade: Premium',
            'Shelf Life: 2 years',
            'Storage: Cool, dry place'
        ],
        images: [
            'image/Product/Deglet Noor.jpg',
            'image/Product/Deglet Noor.jpg',
            'image/Product/Deglet Noor.jpg'
        ]
    }
};

// Function to open product modal
function openProductModal(productId) {
    const modal = document.getElementById('product-modal');
    const product = productData[productId];

    if (!product) return;

    // Populate modal with product data
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-main-image').src = product.images[0];
    document.getElementById('modal-product-price').textContent = `${product.price}৳`;

    if (product.originalPrice) {
        document.getElementById('modal-original-price').textContent = `${product.originalPrice}৳`;
        document.getElementById('modal-original-price').style.display = 'inline';
    } else {
        document.getElementById('modal-original-price').style.display = 'none';
    }

    // Add rating stars
    const ratingContainer = document.getElementById('modal-product-rating');
    ratingContainer.innerHTML = '';
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        ratingContainer.innerHTML += '<i class="fa-solid fa-star"></i>';
    }
    if (hasHalfStar) {
        ratingContainer.innerHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = Math.ceil(product.rating); i < 5; i++) {
        ratingContainer.innerHTML += '<i class="far fa-star"></i>';
    }

    document.getElementById('modal-product-description').textContent = product.description;

    // Add specifications
    const specsList = document.getElementById('modal-product-specs');
    specsList.innerHTML = '';
    product.specs.forEach(spec => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${spec.split(':')[0]}:</strong> ${spec.split(':')[1]}`;
        specsList.appendChild(li);
    });

    // Add thumbnail images
    const thumbnailGallery = document.getElementById('thumbnail-gallery');
    thumbnailGallery.innerHTML = '';
    product.images.forEach((image, index) => {
        const img = document.createElement('img');
        img.src = image;
        img.alt = `${product.name} ${index + 1}`;
        img.onclick = () => changeMainImage(image, img);
        if (index === 0) img.classList.add('active');
        thumbnailGallery.appendChild(img);
    });

    // Reset quantity
    document.getElementById('product-quantity').value = 1;

    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Function to change main image
function changeMainImage(src, thumbnail) {
    document.getElementById('modal-main-image').src = src;

    // Update active thumbnail
    document.querySelectorAll('#thumbnail-gallery img').forEach(img => {
        img.classList.remove('active');
    });
    thumbnail.classList.add('active');
}

// Function to close product modal
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Function to update modal quantity
function updateModalQuantity(change) {
    const quantityInput = document.getElementById('product-quantity');
    let quantity = parseInt(quantityInput.value) + change;
    if (quantity < 1) quantity = 1;
    if (quantity > 10) quantity = 10;
    quantityInput.value = quantity;
}

// Function to open product modal from API data
function openProductModalAPI(product) {
    const modal = document.getElementById('product-modal');

    // Populate modal with product data
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-main-image').src = product.image;
    document.getElementById('modal-product-price').textContent = `${product.price}৳`;

    // Hide original price for now (can be added later)
    document.getElementById('modal-original-price').style.display = 'none';

    // Add rating stars
    const ratingContainer = document.getElementById('modal-product-rating');
    ratingContainer.innerHTML = '';
    const rating = product.rating || 4.5;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        ratingContainer.innerHTML += '<i class="fa-solid fa-star"></i>';
    }
    if (hasHalfStar) {
        ratingContainer.innerHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = Math.ceil(rating); i < 5; i++) {
        ratingContainer.innerHTML += '<i class="far fa-star"></i>';
    }

    document.getElementById('modal-product-description').textContent = product.description || 'Premium quality dates from Al-Awda Ltd.';

    // Add specifications
    const specsList = document.getElementById('modal-product-specs');
    specsList.innerHTML = '';
    const specs = [
        `Weight: ${product.weight}`,
        `Quality: ${product.quality}`,
        `Category: ${product.category}`,
        'Origin: Middle East',
        'Shelf Life: 2 years'
    ];
    specs.forEach(spec => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${spec.split(':')[0]}:</strong> ${spec.split(':')[1]}`;
        specsList.appendChild(li);
    });

    // Add thumbnail images (use same image for now)
    const thumbnailGallery = document.getElementById('thumbnail-gallery');
    thumbnailGallery.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = `${product.name} ${i + 1}`;
        img.onclick = () => changeMainImage(product.image, img);
        if (i === 0) img.classList.add('active');
        thumbnailGallery.appendChild(img);
    }

    // Reset quantity
    document.getElementById('product-quantity').value = 1;

    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Function to add to cart from modal
function addToCartFromModal() {
    const productName = document.getElementById('modal-product-name').textContent;
    const quantity = parseInt(document.getElementById('product-quantity').value);

    // Find the product in allProducts array
    const product = allProducts.find(p => p.name === productName);
    if (product) {
        // Add multiple quantities if needed
        for (let i = 0; i < quantity; i++) {
            addToCartFromAPI(product);
        }
        closeProductModal();
    }
}

// Initialize product modal functionality
document.addEventListener("DOMContentLoaded", () => {
    // Add click event listeners to product images and names
    document.querySelectorAll('.pro img').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', (e) => {
            e.preventDefault();
            const productElement = img.closest('.pro');
            const productName = productElement.querySelector('h5').textContent;
            const productId = productName.toLowerCase().replace(/\s+/g, '-');
            openProductModal(productId);
        });
    });

    document.querySelectorAll('.pro h5').forEach(title => {
        title.style.cursor = 'pointer';
        title.addEventListener('click', (e) => {
            e.preventDefault();
            const productElement = title.closest('.pro');
            const productName = productElement.querySelector('h5').textContent;
            const productId = productName.toLowerCase().replace(/\s+/g, '-');
            openProductModal(productId);
        });
    });

    // Modal close events
    const closeBtn = document.getElementById('close-product-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('product-modal');
        if (e.target === modal) {
            closeProductModal();
        }
    });

    // Quantity controls
    const decreaseBtn = document.getElementById('decrease-qty');
    const increaseBtn = document.getElementById('increase-qty');

    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => updateModalQuantity(-1));
    }
    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => updateModalQuantity(1));
    }

    // Add to cart from modal
    const addToCartBtn = document.getElementById('add-to-cart-modal');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCartFromModal);
    }

    // Buy now button (placeholder)
    const buyNowBtn = document.getElementById('buy-now');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            showNotification("Buy Now feature coming soon!", "info");
        });
    }
});
