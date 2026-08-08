// Products Management for Frontend

const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const productsContainer = document.getElementById('products-container');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const priceFilter = document.getElementById('price-filter');
const sortSelect = document.getElementById('sort-select');
const loadingSpinner = document.getElementById('loading-spinner');

// Current filters
let currentFilters = {
  search: '',
  category: 'all',
  minPrice: '',
  maxPrice: '',
  sort: 'createdAt_desc'
};

// Initialize products page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('shop.html')) {
        initializeShopPage();
    }
});

// Initialize shop page
function initializeShopPage() {
    setupFilters();
    loadProducts();
}

// Setup filter event listeners
function setupFilters() {
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleCategoryFilter);
    }

    if (priceFilter) {
        priceFilter.addEventListener('change', handlePriceFilter);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
}

// Load products from API
async function loadProducts() {
    try {
        showLoading();

        const queryParams = new URLSearchParams();

        if (currentFilters.search) queryParams.append('search', currentFilters.search);
        if (currentFilters.category && currentFilters.category !== 'all') queryParams.append('category', currentFilters.category);
        if (currentFilters.minPrice) queryParams.append('minPrice', currentFilters.minPrice);
        if (currentFilters.maxPrice) queryParams.append('maxPrice', currentFilters.maxPrice);
        if (currentFilters.sort) queryParams.append('sort', currentFilters.sort);

        const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
        const products = await response.json();

        if (response.ok) {
            displayProducts(products);
        } else {
            showError('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Error loading products');
    } finally {
        hideLoading();
    }
}

// Display products
function displayProducts(products) {
    if (!productsContainer) return;

    if (products.length === 0) {
        productsContainer.innerHTML = '<div class="no-products">No products found</div>';
        return;
    }

    productsContainer.innerHTML = '';

    products.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

// Create product card
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

// Handle search
function handleSearch() {
    currentFilters.search = searchInput.value.trim();
    loadProducts();
}

// Handle category filter
function handleCategoryFilter() {
    currentFilters.category = categoryFilter.value;
    loadProducts();
}

// Handle price filter
function handlePriceFilter() {
    const priceRange = priceFilter.value;
    if (priceRange === 'all') {
        currentFilters.minPrice = '';
        currentFilters.maxPrice = '';
    } else if (priceRange === '0-1000') {
        currentFilters.minPrice = '0';
        currentFilters.maxPrice = '1000';
    } else if (priceRange === '1000-2000') {
        currentFilters.minPrice = '1000';
        currentFilters.maxPrice = '2000';
    } else if (priceRange === '2000+') {
        currentFilters.minPrice = '2000';
        currentFilters.maxPrice = '';
    }
    loadProducts();
}

// Handle sort
function handleSort() {
    currentFilters.sort = sortSelect.value;
    loadProducts();
}

// View product details
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Load product details for product page
async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        showError('Product ID not found');
        return;
    }

    try {
        showLoading();

        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const product = await response.json();

        if (response.ok) {
            displayProductDetails(product);
        } else {
            showError('Product not found');
        }
    } catch (error) {
        console.error('Error loading product details:', error);
        showError('Error loading product details');
    } finally {
        hideLoading();
    }
}

// Display product details
function displayProductDetails(product) {
    // Update page title
    document.title = `${product.name} - Al-Awda`;

    // Update product information
    const productName = document.getElementById('product-name');
    const productPrice = document.getElementById('product-price');
    const productImage = document.getElementById('product-image');
    const productDescription = document.getElementById('product-description');
    const productCategory = document.getElementById('product-category');
    const productWeight = document.getElementById('product-weight');
    const productStock = document.getElementById('product-stock');
    const addToCartBtn = document.getElementById('add-to-cart-btn');

    if (productName) productName.textContent = product.name;
    if (productPrice) productPrice.textContent = `৳${product.price}`;
    if (productImage) productImage.src = product.image;
    if (productDescription) productDescription.textContent = product.description;
    if (productCategory) productCategory.textContent = product.category;
    if (productWeight) productWeight.textContent = product.weight;
    if (productStock) productStock.textContent = product.stock;
    if (addToCartBtn) {
        addToCartBtn.onclick = () => addToCart(product._id, product.name, product.price, product.weight, product.image, product.stock);
    }
}

// Load featured products for home page
async function loadFeaturedProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products?limit=8`);
        const products = await response.json();

        if (response.ok) {
            displayFeaturedProducts(products);
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

// Display featured products
function displayFeaturedProducts(products) {
    const featuredContainer = document.getElementById('featured-products');
    if (!featuredContainer) return;

    featuredContainer.innerHTML = '';

    products.forEach(product => {
        const productCard = createProductCard(product);
        featuredContainer.appendChild(productCard);
    });
}

// Utility functions
function showLoading() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'block';
    }
}

function hideLoading() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

function showError(message) {
    // You can implement a better notification system
    alert(message);
}

function showSuccess(message) {
    // You can implement a better notification system
    alert(message);
}

// Debounce function for search
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

// Initialize product page if on product.html
if (window.location.pathname.includes('product.html')) {
    document.addEventListener('DOMContentLoaded', loadProductDetails);
}

// Initialize home page featured products
if (window.location.pathname.includes('index.html')) {
    document.addEventListener('DOMContentLoaded', loadFeaturedProducts);
}
