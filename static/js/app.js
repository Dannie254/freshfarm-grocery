// FreshFarm Grocery - Frontend JavaScript

const API_BASE = '/api';
let currentUser = null;
let cartItems = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProducts();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            navigateTo(page);
        });
    });

    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', loadProducts);

    // Search input
    document.getElementById('searchInput').addEventListener('input', debounce(loadProducts, 300));

    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            document.getElementById('categoryFilter').value = category;
            navigateTo('products');
            loadProducts();
        });
    });

    // Cart button
    document.getElementById('cartBtn').addEventListener('click', toggleCart);

    // Close cart
    document.getElementById('closeCart').addEventListener('click', toggleCart);
    document.getElementById('cartOverlay').addEventListener('click', toggleCart);

    // Checkout
    document.getElementById('checkoutBtn').addEventListener('click', checkout);

    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Check authentication status
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/auth/check`);
        const data = await response.json();
        
        if (data.authenticated) {
            const userResponse = await fetch(`${API_BASE}/auth/me`);
            if (userResponse.ok) {
                const userData = await userResponse.json();
                currentUser = userData.user;
                updateUIForLoggedIn();
            }
        }
    } catch (error) {
        console.log('Not authenticated');
    }
}

// Update UI for logged in user
function updateUIForLoggedIn() {
    if (currentUser) {
        document.getElementById('authButtons').style.display = 'none';
        document.getElementById('userMenu').style.display = 'block';
        document.getElementById('userName').textContent = currentUser.username || currentUser.email;
        loadCart();
    }
}

// Update UI for logged out user
function updateUIForLoggedOut() {
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userMenu').style.display = 'none';
    currentUser = null;
    cartItems = [];
    updateCartBadge();
}

// Navigate to page
function navigateTo(page) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.style.display = 'none';
    });

    const target = document.getElementById(`${page}Page`);
    if (target) {
        target.style.display = 'block';
    }

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    // Load data for pages
    if (page === 'products') {
        loadProducts();
    } else if (page === 'orders') {
        loadOrders();
    }

    // Close cart if open
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('cartOverlay').classList.remove('active');
}

// Load products
async function loadProducts() {
    const category = document.getElementById('categoryFilter').value;
    const search = document.getElementById('searchInput').value;
    
    let url = `${API_BASE}/products`;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (params.toString()) url += `?${params.toString()}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        renderProducts(data.products || []);
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products');
    }
}

// Render products
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="bi bi-basket"></i>
                    <h4>No products found</h4>
                    <p>Try adjusting your search or filter</p>
                </div>
            </div>
        `;
        return;
    }

    const productIcons = {
        'Vegetables': 'carrot',
        'Fruits': 'egg-fried'
    };

    grid.innerHTML = products.map(product => `
        <div class="col-6 col-md-4 col-lg-3">
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image_url || 'https://via.placeholder.com/300x200'}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200'">
                    <span class="product-badge">${product.category}</span>
                    <i class="bi bi-${productIcons[product.category] || 'basket'} product-float-icon"></i>
                </div>
                <div class="product-info">
                    <h5 class="product-name">${product.name}</h5>
                    <p class="product-desc">${product.description || ''}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="product-price">$${parseFloat(product.price).toFixed(2)} <span class="product-unit">/${product.unit}</span></span>
                    </div>
                    <button class="btn btn-add-cart mt-3" onclick="addToCart(${product.id})" ${product.stock <= 0 ? 'disabled' : ''}>
                        <i class="bi bi-cart-plus me-2"></i>${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add to cart
async function addToCart(productId) {
    if (!currentUser) {
        showToast('Please login to add items to cart');
        new bootstrap.Modal(document.getElementById('loginModal')).show();
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Added to cart!');
            loadCart();
            animateCartButton();
        } else {
            showToast(data.error || 'Error adding to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Error adding to cart');
    }
}

// Load cart
async function loadCart() {
    if (!currentUser) {
        document.getElementById('cartItems').innerHTML = '<p class="text-muted">Please login to view cart</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/cart`);
        const data = await response.json();
        
        cartItems = data.cart || [];
        renderCart(data.cart, data.total);
        updateCartBadge();
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// Render cart
function renderCart(items, total) {
    const container = document.getElementById('cartItems');
    document.getElementById('cartTotal').textContent = `$${parseFloat(total || 0).toFixed(2)}`;

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-cart"></i>
                <h4>Your cart is empty</h4>
                <p>Add some fresh products!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="cart-item">
            <img src="${item.image_url || 'https://via.placeholder.com/70'}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/70'">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)}/${item.unit}</div>
                <div class="cart-item-qty">
                    <button onclick="updateCartItem(${item.id}, ${item.quantity - 1})"><i class="bi bi-dash"></i></button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartItem(${item.id}, ${item.quantity + 1})"><i class="bi bi-plus"></i></button>
                </div>
            </div>
            <button class="cart-item-delete" onclick="removeCartItem(${item.id})">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `).join('');
}

// Update cart badge
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Update cart item quantity
async function updateCartItem(itemId, quantity) {
    if (quantity < 1) {
        await removeCartItem(itemId);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/cart/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });

        if (response.ok) {
            loadCart();
        }
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}

// Remove cart item
async function removeCartItem(itemId) {
    try {
        const response = await fetch(`${API_BASE}/cart/${itemId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadCart();
            showToast('Item removed from cart');
        }
    } catch (error) {
        console.error('Error removing cart item:', error);
    }
}

// Toggle cart
function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('active');
    document.getElementById('cartOverlay').classList.toggle('active');
}

// Checkout
async function checkout() {
    if (!currentUser) {
        showToast('Please login to checkout');
        toggleCart();
        new bootstrap.Modal(document.getElementById('loginModal')).show();
        return;
    }

    if (cartItems.length === 0) {
        showToast('Your cart is empty');
        return;
    }

    const address = prompt('Enter shipping address:');
    if (!address) return;

    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shipping_address: address })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Order placed successfully!');
            toggleCart();
            loadCart();
            navigateTo('orders');
        } else {
            showToast(data.error || 'Error placing order');
        }
    } catch (error) {
        console.error('Error checkout:', error);
        showToast('Error placing order');
    }
}

// Load orders
async function loadOrders() {
    const container = document.getElementById('ordersList');

    if (!currentUser) {
        container.innerHTML = '<p class="text-muted">Please login to view your orders.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/orders`);
        const data = await response.json();
        
        const orders = data.orders || [];

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-bag"></i>
                    <h4>No orders yet</h4>
                    <p>Start shopping to see your orders here!</p>
                    <button class="btn btn-success" data-page="products">Shop Now</button>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-status ${order.status}">${order.status}</span>
                </div>
                <div class="text-muted mb-2">${new Date(order.created_at).toLocaleDateString()}</div>
                <div class="order-total">Total: $${parseFloat(order.total_amount).toFixed(2)}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    errorDiv.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            updateUIForLoggedIn();
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            document.getElementById('loginForm').reset();
            showToast('Welcome back!');
            loadProducts();
            loadOrders();
        } else {
            errorDiv.textContent = data.error || 'Login failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = 'Error during login';
        errorDiv.style.display = 'block';
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const fullName = document.getElementById('registerFullName').value;
    const password = document.getElementById('registerPassword').value;
    const errorDiv = document.getElementById('registerError');

    errorDiv.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, full_name: fullName, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            updateUIForLoggedIn();
            bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
            document.getElementById('registerForm').reset();
            showToast('Account created successfully!');
            loadProducts();
            loadOrders();
        } else {
            errorDiv.textContent = data.error || 'Registration failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = 'Error during registration';
        errorDiv.style.display = 'block';
    }
}

// Handle logout
async function handleLogout(e) {
    e.preventDefault();
    
    try {
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch (error) {
        console.log('Logout error (expected)');
    }

    updateUIForLoggedOut();
    showToast('Logged out successfully');
    navigateTo('home');
}

// Animate cart button
function animateCartButton() {
    const btn = document.getElementById('cartBtn');
    btn.classList.add('bounce');
    setTimeout(() => btn.classList.remove('bounce'), 300);
}

// Show toast
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Debounce helper
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