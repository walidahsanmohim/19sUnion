const defaultConfig = {
      company_name: "Al-awda Ltd.",
      tagline: "Premium Quality Dates",
      hero_title: "Fresh & Premium Dates",
      hero_subtitle: "Directly from the source to your table",
      cta_button: "Shop Now",
      background_color: "#ffffff",
      secondary_surface_color: "#f8f8f8",
      text_color: "#333333",
      primary_action_color: "#d2691e",
      secondary_action_color: "#8b4513",
      font_family: "system-ui",
      font_size: 16
    };

    const products = [
      { id: 1, name: "Premium Medjool Dates", price: 1650, category: "Medjool", weight: "1kg", image: "image/Product/Medjool.jpg"},
      { id: 2, name: "Medjhool Delux", price: 1850, category: "Medjool", weight: "1kg", image: "image/Product/Medjhol Delux.jpg" },
      { id: 3, name: "Ajwa Premium", price: 1150, category: "Ajwa", weight: "1kg", image: "image/Product/Ajwa.JPG" },
      { id: 4, name: "Ajwa Delux", price: 1250, category: "Ajwa", weight: "1kg", image: "image/Product/Ajwa Delux.jpg" },
      { id: 5, name: "Safawi Dates Premium", price: 1000, category: "Safawi", weight: "1kg", image: "image/Product/Safawi.jpg"},
      { id: 6, name: "Maryam Dates", price: 1450, category: "Maryam", weight: "1kg", image: "image/Product/Maryam.JPG" },
      { id: 7, name: "Mabroom Dates", price: 1450, category: "Mabroom", weight: "1kg", image: "image/Product/Mabroom.jpeg" },
      { id: 8, name: "Sukkari Dates", price: 800, category: "Sukkari", weight: "1kg", image: "image/Product/sukkari.jpg"},
      { id: 9, name: "Sukkari Mufattal Dates", price: 950, category: "Sukkari Mufattal", weight: "1kg", image: "image/Product/sukkary mufattal.jpeg" },
      { id: 10, name: "Mashrook Dates", price: 750, category: "Mashrook", weight: "1kg", image: "image/Product/Mashrook.jpg"},
      { id: 11, name: "Jahedi Dates", price: 320, category: "Jahedi", weight: "1kg", image: "image/Product/Jahedi.JPG" },
      { id: 12, name: "Alzerian Dates", price: 2800, category: "Alzerian", weight: "5kg", image: "image/Product/Alzerian.jpg"},
      { id: 13, name: "Nagal Dates", price: 500, category: "Nagal", weight: "1kg", image: "image/Product/Nagal.jpg"},
      { id: 14, name: "Kajo Nuts", price: 1450, category: "Nuts", weight: "1kg", image: "image/Product/kaju.jfif"},
      { id: 15, name: "Kath Nuts", price: 1350, category: "Nuts", weight: "1kg", image: "image/Product/kath.jfif" },
      { id: 16, name: "Kishmish", price: 950, category: "Kishmish", weight: "1kg", image: "image/Product/kishmish.jfif" },
    ];

    let cart = JSON.parse(localStorage.getItem('alawda_cart') || '[]');

    function renderProducts() {
      const grid = document.getElementById('products-grid');
      const config = window.elementSdk?.config || defaultConfig;
      const customFont = config.font_family || defaultConfig.font_family;
      const baseFontStack = 'system-ui, -apple-system, sans-serif';
      const baseSize = config.font_size || defaultConfig.font_size;
      
      grid.innerHTML = products.map(product => `
        <div class="product-card rounded-lg overflow-hidden shadow-md" style="background-color: ${config.secondary_surface_color || defaultConfig.secondary_surface_color};">
          <div class="aspect-square overflow-hidden">
            <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
          </div>
          <div class="p-4">
            <h4 class="font-bold mb-2" style="color: ${config.text_color || defaultConfig.text_color}; font-family: ${customFont}, ${baseFontStack}; font-size: ${baseSize * 1.125}px;">${product.name}</h4>
            <p class="text-sm mb-2" style="color: ${config.text_color || defaultConfig.text_color}; opacity: 0.7; font-family: ${customFont}, ${baseFontStack}; font-size: ${baseSize * 0.875}px;">${product.weight} | ${product.category}</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold" style="color: ${config.secondary_action_color || defaultConfig.secondary_action_color}; font-family: ${customFont}, ${baseFontStack}; font-size: ${baseSize * 1.25}px;">৳${product.price}</span>
              <button class="add-to-cart px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity" style="background-color: ${config.primary_action_color || defaultConfig.primary_action_color}; color: ${config.background_color || defaultConfig.background_color}; font-family: ${customFont}, ${baseFontStack}; font-size: ${baseSize * 0.875}px;" data-id="${product.id}">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `).join('');

      document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const productId = parseInt(e.target.dataset.id);
          addToCart(productId);
        });
      });
    }

    function addToCart(productId) {
      const product = products.find(p => p.id === productId);
      const existingItem = cart.find(item => item.id === productId);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      
      updateCartDisplay();
    }

    function updateCartDisplay() {
      const cartCount = document.getElementById('cart-count');
      const mobileCartCount = document.getElementById('mobile-cart-count');
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
      cartCount.classList.add('cart-badge');
      setTimeout(() => cartCount.classList.remove('cart-badge'), 300);

      // Update mobile cart count
      if (mobileCartCount) {
        mobileCartCount.textContent = totalItems;
      }

      // Save cart to localStorage
      localStorage.setItem('alawda_cart', JSON.stringify(cart));
    }

    function renderCart() {
      const config = window.elementSdk?.config || defaultConfig;
      const customFont = config.font_family || defaultConfig.font_family;
      const baseFontStack = 'system-ui, -apple-system, sans-serif';
      const baseSize = config.font_size || defaultConfig.font_size;
      const cartItems = document.getElementById('cart-items');
      const cartTotal = document.getElementById('cart-total');
      
      if (cart.length === 0) {
        cartItems.innerHTML = `<p class="text-center py-8" style="color: ${config.text_color || defaultConfig.text_color}; opacity: 0.6; font-family: ${customFont}, ${baseFontStack}; font-size: ${baseSize}px;">Your cart is empty</p>`;
        cartTotal.textContent = '৳0.00';
        return;
      }
      
      cartItems.innerHTML = cart.map(item => `
        <div class="flex items-center justify-between p-4 rounded-lg" style="background-color: ${config.secondary_surface_color || defaultConfig.secondary_surface_color};">
          <div class="flex-1">
            <h4 class="font-semibold" style="color: ${config.text_color || defaultConfig.text_color}; font-family: ${customFont}, ${baseFontStack}; font-size: ${baseSize}px;">${item.name}</h4>
            <p class="text-sm" style="color: ${config.text_color || defaultConfig.text_color}; opacity: 0.7; font-family: ${customFont}, ${baseFontStack}; font-size: ${baseSize * 0.875}px;">৳${item.price} × ${item.quantity}</p>
          </div>
          <div class="flex items-center space-x-2">
            <button class="decrease-qty w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80" style="background-color: ${config.secondary_surface_color || defaultConfig.secondary_surface_color}; border: 2px solid ${config.primary_action_color || defaultConfig.primary_action_color}; color: ${config.primary_action_color || defaultConfig.primary_action_color}; font-family: ${customFont}, ${baseFontStack}; font-size: ${baseSize}px;" data-id="${item.id}">-</button>
            <span class="w-8 text-center font-semibold" style="color: ${config.text_color || defaultConfig.text_color}; font-family: ${customFont}, ${baseFontStack}; font-size: ${baseSize}px;">${item.quantity}</span>
            <button class="increase-qty w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80" style="background-color: ${config.primary_action_color || defaultConfig.primary_action_color}; color: ${config.background_color || defaultConfig.background_color}; font-family: ${customFont}, ${baseFontStack}; font-size: ${baseSize}px;" data-id="${item.id}">+</button>
            <button class="remove-item p-2 rounded-full hover:opacity-80" style="background-color: ${config.secondary_surface_color || defaultConfig.secondary_surface_color}; color: ${config.text_color || defaultConfig.text_color};" data-id="${item.id}">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      `).join('');
      
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cartTotal.textContent = `৳${total.toFixed(2)}`;
      
      document.querySelectorAll('.increase-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.dataset.id);
          const item = cart.find(i => i.id === id);
          if (item) item.quantity += 1;
          updateCartDisplay();
          renderCart();
        });
      });
      
      document.querySelectorAll('.decrease-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.dataset.id);
          const item = cart.find(i => i.id === id);
          if (item && item.quantity > 1) {
            item.quantity -= 1;
            updateCartDisplay();
            renderCart();
          }
        });
      });
      
      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.closest('button').dataset.id);
          cart = cart.filter(i => i.id !== id);
          updateCartDisplay();
          renderCart();
        });
      });
    }

    async function onConfigChange(config) {
      const customFont = config.font_family || defaultConfig.font_family;
      const baseFontStack = 'system-ui, -apple-system, sans-serif';
      const baseSize = config.font_size || defaultConfig.font_size;
      
      document.getElementById('company-name').textContent = config.company_name || defaultConfig.company_name;
      document.getElementById('company-name').style.fontFamily = `${customFont}, ${baseFontStack}`;
      document.getElementById('company-name').style.fontSize = `${baseSize * 1.5}px`;
      
      document.getElementById('tagline').textContent = config.tagline || defaultConfig.tagline;
      document.getElementById('tagline').style.fontFamily = `${customFont}, ${baseFontStack}`;
      document.getElementById('tagline').style.fontSize = `${baseSize * 0.875}px`;
      
      document.getElementById('hero-title').textContent = config.hero_title || defaultConfig.hero_title;
      document.getElementById('hero-title').style.fontFamily = `${customFont}, ${baseFontStack}`;
      document.getElementById('hero-title').style.fontSize = `${baseSize * 3}px`;
      
      document.getElementById('hero-subtitle').textContent = config.hero_subtitle || defaultConfig.hero_subtitle;
      document.getElementById('hero-subtitle').style.fontFamily = `${customFont}, ${baseFontStack}`;
      document.getElementById('hero-subtitle').style.fontSize = `${baseSize * 1.25}px`;
      
      document.getElementById('cta-button').textContent = config.cta_button || defaultConfig.cta_button;
      document.getElementById('cta-button').style.fontFamily = `${customFont}, ${baseFontStack}`;
      document.getElementById('cta-button').style.fontSize = `${baseSize * 1.125}px`;
      
      renderProducts();
      renderCart();
    }

    document.getElementById('cart-btn').addEventListener('click', () => {
      document.getElementById('cart-modal').classList.remove('hidden');
      document.getElementById('cart-modal').classList.add('flex');
      renderCart();
    });

    document.getElementById('close-cart').addEventListener('click', () => {
      document.getElementById('cart-modal').classList.add('hidden');
      document.getElementById('cart-modal').classList.remove('flex');
    });

    document.getElementById('cta-button').addEventListener('click', () => {
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });

    // Cart order form submission
    document.getElementById('cart-order-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const orderDetails = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };

      // Here you would typically send the order to a server
      console.log('Order placed:', orderDetails);
      alert('Thank you for your order! We will contact you soon.');

      // Reset cart and close modal
      cart = [];
      updateCartDisplay();
      document.getElementById('cart-modal').classList.add('hidden');
      document.getElementById('cart-modal').classList.remove('flex');
    });

    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange,
        mapToCapabilities: (config) => ({
          recolorables: [
            {
              get: () => config.background_color || defaultConfig.background_color,
              set: (value) => {
                config.background_color = value;
                window.elementSdk.setConfig({ background_color: value });
              }
            },
            {
              get: () => config.secondary_surface_color || defaultConfig.secondary_surface_color,
              set: (value) => {
                config.secondary_surface_color = value;
                window.elementSdk.setConfig({ secondary_surface_color: value });
              }
            },
            {
              get: () => config.text_color || defaultConfig.text_color,
              set: (value) => {
                config.text_color = value;
                window.elementSdk.setConfig({ text_color: value });
              }
            },
            {
              get: () => config.primary_action_color || defaultConfig.primary_action_color,
              set: (value) => {
                config.primary_action_color = value;
                window.elementSdk.setConfig({ primary_action_color: value });
              }
            },
            {
              get: () => config.secondary_action_color || defaultConfig.secondary_action_color,
              set: (value) => {
                config.secondary_action_color = value;
                window.elementSdk.setConfig({ secondary_action_color: value });
              }
            }
          ],
          borderables: [],
          fontEditable: {
            get: () => config.font_family || defaultConfig.font_family,
            set: (value) => {
              config.font_family = value;
              window.elementSdk.setConfig({ font_family: value });
            }
          },
          fontSizeable: {
            get: () => config.font_size || defaultConfig.font_size,
            set: (value) => {
              config.font_size = value;
              window.elementSdk.setConfig({ font_size: value });
            }
          }
        }),
        mapToEditPanelValues: (config) => new Map([
          ["company_name", config.company_name || defaultConfig.company_name],
          ["tagline", config.tagline || defaultConfig.tagline],
          ["hero_title", config.hero_title || defaultConfig.hero_title],
          ["hero_subtitle", config.hero_subtitle || defaultConfig.hero_subtitle],
          ["cta_button", config.cta_button || defaultConfig.cta_button]
        ])
      });
    }

    renderProducts();

    // Checkout functionality
    document.querySelector('.border-t button').addEventListener('click', (e) => {
      e.preventDefault(); // Prevent form submission
      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      document.getElementById('checkout-total').textContent = `৳${total.toFixed(2)}`;
      document.getElementById('cart-modal').classList.add('hidden');
      document.getElementById('cart-modal').classList.remove('flex');
      document.getElementById('checkout-modal').classList.remove('hidden');
      document.getElementById('checkout-modal').classList.add('flex');
    });

    document.getElementById('close-checkout').addEventListener('click', () => {
      document.getElementById('checkout-modal').classList.add('hidden');
      document.getElementById('checkout-modal').classList.remove('flex');
    });

    // Form validation functions
    function validateName(name) {
      return name.length >= 2 && /^[a-zA-Z\s]+$/.test(name);
    }

    function validatePhone(phone) {
      // Bangladesh phone number validation (supports +880 and 01 formats)
      const phoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;
      return phoneRegex.test(phone.replace(/\s+/g, ''));
    }

    function validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    function validateAddress(address) {
      return address.length >= 10;
    }

    function showError(elementId, message) {
      const element = document.getElementById(elementId);
      if (element) {
        // Remove existing error message
        const existingError = element.parentNode.querySelector('.error-message');
        if (existingError) existingError.remove();

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-500 text-sm mt-1';
        errorDiv.textContent = message;
        element.parentNode.appendChild(errorDiv);

        // Add error styling to input
        element.classList.add('border-red-500');
        element.classList.remove('border-gray-300');
      }
    }

    function clearErrors(formId) {
      const form = document.getElementById(formId);
      if (form) {
        // Remove all error messages
        form.querySelectorAll('.error-message').forEach(error => error.remove());

        // Reset input styling
        form.querySelectorAll('input, textarea').forEach(input => {
          input.classList.remove('border-red-500');
          input.classList.add('border-gray-300');
        });
      }
    }

    document.getElementById('place-order-btn').addEventListener('click', () => {
      const name = document.getElementById('customer-name').value.trim();
      const phone = document.getElementById('customer-phone').value.trim();
      const address = document.getElementById('customer-address').value.trim();

      // Clear previous errors
      clearErrors('checkout-modal');

      // Validate fields
      let hasErrors = false;

      if (!validateName(name)) {
        showError('customer-name', 'Please enter a valid name (at least 2 characters, letters only)');
        hasErrors = true;
      }

      if (!validatePhone(phone)) {
        showError('customer-phone', 'Please enter a valid Bangladesh phone number');
        hasErrors = true;
      }

      if (!validateAddress(address)) {
        showError('customer-address', 'Please enter a complete delivery address (at least 10 characters)');
        hasErrors = true;
      }

      if (hasErrors) return;

      const orderDetails = {
        name,
        phone,
        address,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        orderDate: new Date().toISOString(),
        orderId: 'ALAWDA-' + Date.now()
      };

      // Here you would typically send the order to a server
      console.log('Order placed:', orderDetails);

      // Store order in localStorage for demo purposes
      const orders = JSON.parse(localStorage.getItem('alawda_orders') || '[]');
      orders.push(orderDetails);
      localStorage.setItem('alawda_orders', JSON.stringify(orders));

      alert(`Thank you for your order! Your order ID is ${orderDetails.orderId}. We will contact you soon.`);

      // Reset cart and close modal
      cart = [];
      updateCartDisplay();
      document.getElementById('checkout-modal').classList.add('hidden');
      document.getElementById('checkout-modal').classList.remove('flex');
    });

    // Chatbot functionality
    const chatbotResponses = {
      products: "We offer a wide variety of premium dates and nuts including Medjool, Ajwa, Safawi, Maryam, and more! You can browse our products in the 'Products' section above.",
      pricing: "Our prices vary by product and quantity. For example:\n• Premium Medjool Dates: ৳1650/kg\n• Medjhool Delux: ৳1850/kg\n• Ajwa Premium: ৳1150/kg\n• Ajwa Delux: ৳1250/kg\n• Safawi Dates: ৳1000/kg\nCheck our products section for current pricing.",
      contact: "You can reach us at:\n📞 Phone: +880 1788-544111\n📧 Email: alawda.ltd@gmail.com\n💬 Facebook Messenger: https://www.facebook.com/alawda0/\n📱 WhatsApp: https://wa.me/8801788544111",
      order: "To place an order:\n1. Browse our products\n2. Add items to your cart\n3. Click the cart icon\n4. Fill in your details\n5. Submit your order\n\nWe'll contact you to confirm delivery details!",
      default: "I'm here to help! You can ask about our products, pricing, contact information, or how to place an order. Or click one of the quick reply buttons above."
    };

    function addMessage(message, isUser = false) {
      const messagesContainer = document.getElementById('chat-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = isUser ? 'user-message bg-orange-600 text-white p-3 rounded-lg mb-2 shadow-sm ml-auto max-w-xs' : 'bot-message bg-white p-3 rounded-lg mb-2 shadow-sm';
      messageDiv.innerHTML = `<p class="text-sm">${message.replace(/\n/g, '<br>')}</p>`;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function getBotResponse(userMessage) {
      const lowerMessage = userMessage.toLowerCase();

      // Check for specific product prices first
      for (const product of products) {
        const productName = product.name.toLowerCase();
        if (lowerMessage.includes(productName.split(' ')[0]) && (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate'))) {
          return `The ${product.name} costs ৳${product.price} for ${product.weight}.`;
        }
      }

      // General responses
      if (lowerMessage.includes('product') || lowerMessage.includes('date') || lowerMessage.includes('nut')) {
        return chatbotResponses.products;
      } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate')) {
        return chatbotResponses.pricing;
      } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('reach')) {
        return chatbotResponses.contact;
      } else if (lowerMessage.includes('order') || lowerMessage.includes('buy') || lowerMessage.includes('purchase') || lowerMessage.includes('delivery')) {
        return chatbotResponses.order;
      } else {
        return chatbotResponses.default;
      }
    }

    // Chatbot event listeners
    document.getElementById('chatbot-button').addEventListener('click', () => {
      document.getElementById('chatbot-window').classList.toggle('hidden');
    });

    document.getElementById('close-chatbot').addEventListener('click', () => {
      document.getElementById('chatbot-window').classList.add('hidden');
    });

    document.querySelectorAll('.quick-reply').forEach(button => {
      button.addEventListener('click', (e) => {
        const topic = e.target.textContent.toLowerCase();
        addMessage(e.target.textContent, true);
        setTimeout(() => {
          addMessage(chatbotResponses[topic] || chatbotResponses.default);
        }, 500);
      });
    });

    document.getElementById('send-message').addEventListener('click', () => {
      const input = document.getElementById('chat-input');
      const message = input.value.trim();
      if (message) {
        addMessage(message, true);
        input.value = '';
        setTimeout(() => {
          const response = getBotResponse(message);
          addMessage(response);
        }, 500);
      }
    });

    document.getElementById('chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('send-message').click();
      }
    });

    // Authentication functionality
    let currentUser = null;

    // Load user from localStorage on page load
    function loadUser() {
      const userData = localStorage.getItem('alawda_user');
      if (userData) {
        currentUser = JSON.parse(userData);
        updateUIForLoggedInUser();
      }
    }

    function updateUIForLoggedInUser() {
      // Update footer modal content for My Account
      footerContents['my-account'] = {
        title: 'My Account',
        content: `
          <h4 class="text-xl font-semibold mb-4">Welcome back, ${currentUser.name}!</h4>
          <div class="bg-orange-50 p-4 rounded-lg mb-4">
            <h5 class="font-semibold mb-2">Account Information</h5>
            <p class="mb-1"><strong>Name:</strong> ${currentUser.name}</p>
            <p class="mb-1"><strong>Email:</strong> ${currentUser.email}</p>
            <p class="mb-1"><strong>Phone:</strong> ${currentUser.phone}</p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg mb-4">
            <h5 class="font-semibold mb-2">Account Features</h5>
            <ul class="list-disc list-inside">
              <li>View order history and status</li>
              <li>Manage delivery addresses</li>
              <li>Update contact information</li>
              <li>Access exclusive offers and updates</li>
            </ul>
          </div>
          <button id="logout-btn" class="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">Logout</button>
        `
      };
    }

    function showAuthModal(isLogin = true) {
      document.getElementById('auth-modal-title').textContent = isLogin ? 'Login' : 'Register';
      document.getElementById('login-form').classList.toggle('hidden', !isLogin);
      document.getElementById('register-form').classList.toggle('hidden', isLogin);
      document.getElementById('auth-modal').classList.remove('hidden');
      document.getElementById('auth-modal').classList.add('flex');
    }

    function closeAuthModal() {
      document.getElementById('auth-modal').classList.add('hidden');
      document.getElementById('auth-modal').classList.remove('flex');
    }

    function loginUser(email, password) {
      const users = JSON.parse(localStorage.getItem('alawda_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        currentUser = user;
        localStorage.setItem('alawda_user', JSON.stringify(user));
        updateUIForLoggedInUser();
        closeAuthModal();
        alert('Login successful!');
        return true;
      }
      return false;
    }

    function registerUser(name, email, phone, password) {
      const users = JSON.parse(localStorage.getItem('alawda_users') || '[]');
      if (users.find(u => u.email === email)) {
        alert('Email already registered!');
        return false;
      }
      const newUser = { name, email, phone, password };
      users.push(newUser);
      localStorage.setItem('alawda_users', JSON.stringify(users));
      currentUser = newUser;
      localStorage.setItem('alawda_user', JSON.stringify(newUser));
      updateUIForLoggedInUser();
      closeAuthModal();
      alert('Registration successful!');
      return true;
    }

    function logoutUser() {
      currentUser = null;
      localStorage.removeItem('alawda_user');
      footerContents['my-account'] = {
        title: 'My Account',
        content: `
          <h4 class="text-xl font-semibold mb-4">My Account</h4>
          <p class="mb-4">Manage your Al-Awda Ltd. account to track orders, view order history, and update your preferences.</p>
          <div class="bg-orange-50 p-4 rounded-lg mb-4">
            <h5 class="font-semibold mb-2">Account Features</h5>
            <ul class="list-disc list-inside">
              <li>View order history and status</li>
              <li>Manage delivery addresses</li>
              <li>Update contact information</li>
              <li>Access exclusive offers and updates</li>
            </ul>
          </div>
          <p class="mb-4">To access your account or create a new one, please contact our customer support team. We're here to help you manage your account and ensure a smooth shopping experience.</p>
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm">Contact us at +880 1788-544111 or alawda.ltd@gmail.com for account assistance.</p>
          </div>
        `
      };
      alert('Logged out successfully!');
    }

    // Auth modal event listeners
    document.getElementById('close-auth-modal').addEventListener('click', closeAuthModal);
    document.getElementById('auth-modal').addEventListener('click', (e) => {
      if (e.target.id === 'auth-modal') {
        closeAuthModal();
      }
    });

    document.getElementById('switch-to-register').addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal(false);
    });

    document.getElementById('switch-to-login').addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal(true);
    });

    // Login form submission
    document.getElementById('login-form-element').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const email = formData.get('email');
      const password = formData.get('password');
      if (loginUser(email, password)) {
        e.target.reset();
      } else {
        alert('Invalid email or password!');
      }
    });

    // Register form submission
    document.getElementById('register-form-element').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const name = formData.get('name');
      const email = formData.get('email');
      const phone = formData.get('phone');
      const password = formData.get('password');
      registerUser(name, email, phone, password);
      e.target.reset();
    });

    // Load user on page load
    loadUser();
    updateAuthButton();

    // Mobile menu functionality
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
      const mobileMenu = document.getElementById('mobile-menu');
      mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('#mobile-menu a').forEach(link => {
      link.addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.add('hidden');
      });
    });

    // Mobile auth button functionality
    document.getElementById('mobile-auth-btn').addEventListener('click', () => {
      document.getElementById('mobile-menu').classList.add('hidden');
      showAuthModal(currentUser ? false : true);
    });

    // Mobile cart button functionality
    document.getElementById('mobile-cart-btn').addEventListener('click', () => {
      document.getElementById('mobile-menu').classList.add('hidden');
      document.getElementById('cart-modal').classList.remove('hidden');
      document.getElementById('cart-modal').classList.add('flex');
      renderCart();
    });

    // Product search and filter functionality
    let filteredProducts = [...products];

    function filterProducts() {
      const searchTerm = document.getElementById('product-search').value.toLowerCase();
      const categoryFilter = document.getElementById('category-filter').value;

      filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                             product.category.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
      });

      renderFilteredProducts();
    }

    function renderFilteredProducts() {
      const grid = document.getElementById('products-grid');
      const config = window.elementSdk?.config || defaultConfig;
      const customFont = config.font_family || defaultConfig.font_family;
      const baseFontStack = 'system-ui, -apple-system, sans-serif';
      const baseSize = config.font_size || defaultConfig.font_size;

      if (filteredProducts.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12">
          <p class="text-gray-500 text-lg" style="font-family: ${customFont}, ${baseFontStack}; font-size: ${baseSize * 1.125}px;">No products found matching your criteria.</p>
        </div>`;
        return;
      }

      grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card rounded-lg overflow-hidden shadow-md" style="background-color: ${config.secondary_surface_color || defaultConfig.secondary_surface_color};">
          <div class="aspect-square overflow-hidden">
            <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" loading="lazy">
          </div>
          <div class="p-4">
            <h4 class="font-bold mb-2" style="color: ${config.text_color || defaultConfig.text_color}; font-family: ${customFont}, ${baseFontStack}; font-size: ${baseSize * 1.125}px;">${product.name}</h4>
            <p class="text-sm mb-2" style="color: ${config.text_color || defaultConfig.text_color}; opacity: 0.7; font-family: ${customFont}, ${baseFontStack}; font-size: ${baseSize * 0.875}px;">${product.weight} | ${product.category}</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold" style="color: ${config.secondary_action_color || defaultConfig.secondary_action_color}; font-family: ${customFont}, ${baseFontStack}; font-size: ${baseSize * 1.25}px;">৳${product.price}</span>
              <button class="add-to-cart px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity" style="background-color: ${config.primary_action_color || defaultConfig.primary_action_color}; color: ${config.background_color || defaultConfig.background_color}; font-family: ${customFont}, ${baseFontStack}; font-size: ${baseSize * 0.875}px;" data-id="${product.id}">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `).join('');

      document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const productId = parseInt(e.target.dataset.id);
          addToCart(productId);
        });
      });
    }

    // Search and filter event listeners
    document.getElementById('product-search').addEventListener('input', filterProducts);
    document.getElementById('category-filter').addEventListener('change', filterProducts);

    // Loading animation for initial render
    function showLoading() {
      document.getElementById('loading-spinner').classList.remove('hidden');
      document.getElementById('products-grid').innerHTML = '';
    }

    function hideLoading() {
      document.getElementById('loading-spinner').classList.add('hidden');
    }



    // Update auth button based on login status
    function updateAuthButton() {
      const authBtn = document.getElementById('auth-btn');
      const mobileAuthBtn = document.getElementById('mobile-auth-btn');
      if (currentUser) {
        authBtn.textContent = 'Logout';
        authBtn.classList.remove('bg-orange-600', 'hover:bg-orange-700');
        authBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        if (mobileAuthBtn) {
          mobileAuthBtn.textContent = 'Logout';
          mobileAuthBtn.classList.remove('bg-orange-600', 'hover:bg-orange-700');
          mobileAuthBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        }
      } else {
        authBtn.textContent = 'Login';
        authBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
        authBtn.classList.add('bg-orange-600', 'hover:bg-orange-700');
        if (mobileAuthBtn) {
          mobileAuthBtn.textContent = 'Login';
          mobileAuthBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
          mobileAuthBtn.classList.add('bg-orange-600', 'hover:bg-orange-700');
        }
      }
    }

    // Auth button event listener
    document.getElementById('auth-btn').addEventListener('click', () => {
      if (currentUser) {
        logoutUser();
        updateAuthButton();
      } else {
        showAuthModal(true);
      }
    });

    // Footer modal functionality
    const footerContents = {
      'about-us': {
        title: 'About Us',
        content: `
          <h4 class="text-xl font-semibold mb-4">Welcome to Al-Awda Ltd.</h4>
          <p class="mb-4">Al-Awda Ltd. is dedicated to providing the finest quality dates and nuts directly from the source. We believe in delivering premium products with authenticity, purity, and exceptional taste.</p>
          <p class="mb-4">Our commitment to quality ensures that every date and nut we offer meets the highest standards of freshness and nutrition. From traditional varieties to exotic selections, we source our products from trusted growers around the world.</p>
          <p class="mb-4">With "Relief In Belief" as our motto, we strive to bring you the best of nature's bounty, ensuring every bite is a moment of pure satisfaction.</p>
          <div class="bg-orange-50 p-4 rounded-lg">
            <h5 class="font-semibold mb-2">Our Mission</h5>
            <p>To connect you with the world's finest dates and nuts, fostering health, happiness, and culinary delight.</p>
          </div>
        `
      },
      'privacy-policy': {
        title: 'Privacy Policy',
        content: `
          <h4 class="text-xl font-semibold mb-4">Privacy Policy</h4>
          <p class="mb-4">At Al-Awda Ltd., we are committed to protecting your privacy and ensuring the security of your personal information.</p>
          <h5 class="font-semibold mb-2">Information We Collect</h5>
          <ul class="list-disc list-inside mb-4">
            <li>Name, phone number, and delivery address for order processing</li>
            <li>Email address for communication (optional)</li>
            <li>Order history and preferences</li>
          </ul>
          <h5 class="font-semibold mb-2">How We Use Your Information</h5>
          <ul class="list-disc list-inside mb-4">
            <li>Process and deliver your orders</li>
            <li>Provide customer support</li>
            <li>Improve our services and products</li>
            <li>Send order confirmations and updates</li>
          </ul>
          <h5 class="font-semibold mb-2">Information Sharing</h5>
          <p class="mb-4">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as necessary to fulfill your orders (e.g., delivery services).</p>
          <h5 class="font-semibold mb-2">Data Security</h5>
          <p class="mb-4">We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm">For any privacy concerns, please contact us at alawda.ltd@gmail.com or +880 1788-544111.</p>
          </div>
        `
      },
      'terms-conditions': {
        title: 'Terms & Conditions',
        content: `
          <h4 class="text-xl font-semibold mb-4">Terms & Conditions</h4>
          <p class="mb-4">Welcome to Al-Awda Ltd. By accessing and using our website and services, you agree to comply with the following terms and conditions.</p>
          <h5 class="font-semibold mb-2">Products & Orders</h5>
          <ul class="list-disc list-inside mb-4">
            <li>All orders are subject to availability and confirmation</li>
            <li>Prices are subject to change without notice</li>
            <li>We reserve the right to refuse or cancel orders at our discretion</li>
            <li>Delivery times are estimates and may vary</li>
          </ul>
          <h5 class="font-semibold mb-2">Payment & Delivery</h5>
          <ul class="list-disc list-inside mb-4">
            <li>Payment is due at the time of order placement</li>
            <li>We accept cash on delivery and other secure payment methods</li>
            <li>Delivery charges may apply based on location</li>
            <li>Risk of loss passes to the buyer upon delivery</li>
          </ul>
          <h5 class="font-semibold mb-2">Returns & Refunds</h5>
          <ul class="list-disc list-inside mb-4">
            <li>Products must be returned within 24 hours if damaged or incorrect</li>
            <li>Refunds will be processed within 3-5 business days</li>
            <li>Custom orders are not eligible for returns</li>
          </ul>
          <h5 class="font-semibold mb-2">Limitation of Liability</h5>
          <p class="mb-4">Al-Awda Ltd. shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
          <div class="bg-green-50 p-4 rounded-lg">
            <p class="text-sm">These terms are governed by the laws of Bangladesh. For any disputes, please contact our customer support.</p>
          </div>
        `
      },
      'my-account': {
        title: 'My Account',
        content: `
          <h4 class="text-xl font-semibold mb-4">My Account</h4>
          <p class="mb-4">Manage your Al-Awda Ltd. account to track orders, view order history, and update your preferences.</p>
          <div class="bg-orange-50 p-4 rounded-lg mb-4">
            <h5 class="font-semibold mb-2">Account Features</h5>
            <ul class="list-disc list-inside">
              <li>View order history and status</li>
              <li>Manage delivery addresses</li>
              <li>Update contact information</li>
              <li>Access exclusive offers and updates</li>
            </ul>
          </div>
          <p class="mb-4">To access your account or create a new one, please contact our customer support team. We're here to help you manage your account and ensure a smooth shopping experience.</p>
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm">Contact us at +880 1788-544111 or alawda.ltd@gmail.com for account assistance.</p>
          </div>
        `
      },
      'track-order': {
        title: 'Track Your Order',
        content: `
          <h4 class="text-xl font-semibold mb-4">Track Your Order</h4>
          <p class="mb-4">Stay updated on your Al-Awda Ltd. order status with our easy tracking system.</p>
          <div class="bg-green-50 p-4 rounded-lg mb-4">
            <h5 class="font-semibold mb-2">Order Tracking Steps</h5>
            <ol class="list-decimal list-inside">
              <li>Order Confirmation - We confirm your order within 1 hour</li>
              <li>Processing - Your order is prepared for delivery</li>
              <li>Shipped - Order is on its way to you</li>
              <li>Delivered - Order successfully delivered</li>
            </ol>
          </div>
          <p class="mb-4">To track your order, please provide your order number and contact details to our support team. We'll provide you with real-time updates on your order status.</p>
          <div class="bg-orange-50 p-4 rounded-lg">
            <p class="text-sm">Call us at +880 1788-544111 or email alawda.ltd@gmail.com for order tracking assistance.</p>
          </div>
        `
      },
      'customer-support': {
        title: 'Customer Support',
        content: `
          <h4 class="text-xl font-semibold mb-4">Customer Support</h4>
          <p class="mb-4">We're here to help! Our dedicated customer support team is available to assist you with any questions or concerns.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <h5 class="font-semibold mb-2">📞 Phone Support</h5>
              <p class="text-sm">Call us: +880 1788-544111</p>
              <p class="text-sm">Available: 9 AM - 9 PM (BST)</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <h5 class="font-semibold mb-2">💬 WhatsApp</h5>
              <p class="text-sm">Chat with us: https://wa.me/8801788544111</p>
              <p class="text-sm">Quick responses guaranteed</p>
            </div>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg mb-4">
            <h5 class="font-semibold mb-2">📧 Email Support</h5>
            <p class="text-sm">Email us: alawda.ltd@gmail.com</p>
            <p class="text-sm">We respond within 24 hours</p>
          </div>
          <p class="mb-4">Our chatbot is also available 24/7 for quick answers to common questions. For complex issues, our human support team is ready to assist you.</p>
          <div class="bg-yellow-50 p-4 rounded-lg">
            <p class="text-sm font-semibold">Quality Guarantee: We're committed to your satisfaction. If you're not happy with our service, we'll make it right!</p>
          </div>
        `
      }
    };

    function showFooterModal(linkType) {
      const content = footerContents[linkType];
      if (content) {
        document.getElementById('footer-modal-title').textContent = content.title;
        document.getElementById('footer-modal-content').innerHTML = content.content;
        document.getElementById('footer-modal').classList.remove('hidden');
        document.getElementById('footer-modal').classList.add('flex');
      }
    }

    function closeFooterModal() {
      document.getElementById('footer-modal').classList.add('hidden');
      document.getElementById('footer-modal').classList.remove('flex');
    }

    // Footer link event listeners
    document.querySelectorAll('.footer-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const linkType = e.target.dataset.link;
        showFooterModal(linkType);
      });
    });

    // Close footer modal
    document.getElementById('close-footer-modal').addEventListener('click', closeFooterModal);

    // Close modal when clicking outside
    document.getElementById('footer-modal').addEventListener('click', (e) => {
      if (e.target.id === 'footer-modal') {
        closeFooterModal();
      }
    });

    // Logout button event listener (added dynamically)
    document.addEventListener('click', (e) => {
      if (e.target.id === 'logout-btn') {
        logoutUser();
        closeFooterModal();
      }
    });
