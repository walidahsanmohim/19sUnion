// ===== ADVANCED E-COMMERCE FEATURES =====

// Enhanced product data with ratings, reviews, stock, and related products
const enhancedProducts = products.map(product => ({
  ...product,
  stock: Math.floor(Math.random() * 50) + 1,
  rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
  reviews: Math.floor(Math.random() * 30) + 1,
  related: products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3).map(p => p.id),
  description: `${product.name} - Premium quality ${product.category.toLowerCase()} sourced directly from trusted growers.`
}));

// Update products array
products.splice(0, products.length, ...enhancedProducts);

// Wishlist functionality
let wishlist = JSON.parse(localStorage.getItem('alawda_wishlist') || '[]');

function toggleWishlist(productId) {
  const index = wishlist.indexOf(productId);
  if (index > -1) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push(productId);
  }
  localStorage.setItem('alawda_wishlist', JSON.stringify(wishlist));
  updateWishlistDisplay();
}

function updateWishlistDisplay() {
  const wishlistBtn = document.getElementById('wishlist-btn');
  if (wishlistBtn) {
    wishlistBtn.textContent = `Wishlist (${wishlist.length})`;
  }
}

// Product reviews and ratings
let productReviews = JSON.parse(localStorage.getItem('alawda_reviews') || '{}');

function addProductReview(productId, rating, review) {
  if (!productReviews[productId]) {
    productReviews[productId] = [];
  }
  productReviews[productId].push({
    rating: parseInt(rating),
    review: review,
    user: currentUser ? currentUser.name : 'Anonymous',
    date: new Date().toISOString()
  });
  localStorage.setItem('alawda_reviews', JSON.stringify(productReviews));
  updateProductRating(productId);
}

function updateProductRating(productId) {
  const product = products.find(p => p.id === productId);
  if (product && productReviews[productId]) {
    const reviews = productReviews[productId];
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    product.rating = Math.round(avgRating * 10) / 10;
    product.reviews = reviews.length;
  }
}

// Advanced filters
function applyAdvancedFilters() {
  const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
  const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;
  const sortBy = document.getElementById('sort-select').value;

  let filtered = products.filter(product =>
    product.price >= minPrice && product.price <= maxPrice
  );

  switch (sortBy) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
