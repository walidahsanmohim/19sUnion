// Main JavaScript for Al-Awda E-commerce

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    setupNavigation();
    setupMobileMenu();
    setupSearch();
    setupModals();
    loadPageSpecificContent();
}

// Setup Navigation
function setupNavigation() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    // Add active class to current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = navbar.querySelectorAll('a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

// Setup Mobile Menu
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile');
    const navbar = document.getElementById('navbar');

    if (mobileMenuBtn && navbar) {
        mobileMenuBtn.addEventListener('click', function() {
            navbar.classList.toggle('active');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
        });
    }
}

// Setup Search Functionality
function setupSearch() {
    const searchBox = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');

    if (searchBox && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchBox.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

// Perform Search
function performSearch() {
    const searchTerm = document.querySelector('.search-box input').value.trim();
    if (searchTerm) {
        // Redirect to shop page with search parameter
        window.location.href = `shop.html?search=${encodeURIComponent(searchTerm)}`;
    }
}

// Setup Modals
function setupModals() {
    // Login Modal
    const loginModal = document.getElementById('login-modal');
    const closeLogin = document.getElementById('close-login');

    if (loginModal && closeLogin) {
        closeLogin.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }

    // Product Modal
    const productModal = document.getElementById('product-modal');
    const closeProductModal = document.getElementById('close-product-modal');

    if (productModal && closeProductModal) {
        closeProductModal.addEventListener('click', () => {
            productModal.style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === productModal) {
                productModal.style.display = 'none';
            }
        });
    }
}

// Load Page Specific Content
function loadPageSpecificContent() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    switch (currentPage) {
        case 'index.html':
            loadHomePageContent();
            break;
        case 'shop.html':
            loadShopPageContent();
            break;
        case 'product.html':
            loadProductPageContent();
            break;
        case 'cart.html':
            loadCartPageContent();
            break;
        case 'checkout.html':
            loadCheckoutPageContent();
            break;
    }
}

// Load Home Page Content
function loadHomePageContent() {
    // Load featured products or banners
    loadFeaturedProducts();
}

// Load Shop Page Content
function loadShopPageContent() {
    // This will be handled by products.js
}

// Load Product Page Content
function loadProductPageContent() {
    // Load product details based on URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        loadProductDetails(productId);
    }
}

// Load Cart Page Content
function loadCartPageContent() {
    // This will be handled by cart.js
}

// Load Checkout Page Content
function loadCheckoutPageContent() {
    // This will be handled by checkout.js
}

// Load Featured Products
async function loadFeaturedProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products?limit=4`);
        const products = await response.json();

        displayFeaturedProducts(products);
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

// Display Featured Products
function displayFeaturedProducts(products) {
    const featuredContainer = document.getElementById('featured-products');
    if (!featuredContainer) return;

    featuredContainer.innerHTML = '';

    products.forEach(product => {
        const productCard = createProductCard(product);
        featuredContainer.appendChild(productCard);
    });
}

// Create Product Card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'pro';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" onclick="viewProduct('${product._id}')">
        <div class="des">
            <span>${product.category}</span>
            <h5>${product.name}</h5>
            <div class="star">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star-half-alt"></i>
            </div>
            <h4>৳${product.price} <span>(${product.weight})</span></h4>
        </div>
        <button class="add-to-cart-btn" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.weight}', '${product.image}', ${product.stock})">
            <i class="fa-solid fa-cart-shopping"></i>
        </button>
    `;
    return card;
}

// View Product Details
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Add to Cart (global function)
function addToCart(productId, name, price, weight, image, stock) {
    // This function is defined in cart.js
    if (typeof window.addToCart === 'function') {
        window.addToCart(productId, name, price, weight, image, stock);
    } else {
        // Fallback: store in localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.productId === productId);

        if (existingItem) {
            if (existingItem.quantity < stock) {
                existingItem.quantity += 1;
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
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification('Product added to cart!', 'success');
    }
}

// Update Cart Count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');

    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Load Product Details
async function loadProductDetails(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const product = await response.json();

        displayProductDetails(product);
    } catch (error) {
        console.error('Error loading product details:', error);
        showNotification('Error loading product details', 'error');
    }
}

// Display Product Details
function displayProductDetails(product) {
    // Update page title
    document.title = `${product.name} - Al-Awda`;

    // Update product information
    const productName = document.getElementById('product-name');
    const productPrice = document.getElementById('product-price');
    const productImage = document.getElementById('product-image');
    const productDescription = document.getElementById('product-description');

    if (productName) productName.textContent = product.name;
    if (productPrice) productPrice.textContent = `৳${product.price}`;
    if (productImage) productImage.src = product.image;
    if (productDescription) productDescription.textContent = product.description;
}

// Utility Functions
function formatPrice(price) {
    return `৳${parseFloat(price).toFixed(2)}`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Initialize cart count on page load
updateCartCount();
