(function() {
    'use strict';

    const API_BASE = 'http://localhost:5000/api';

    const state = {
        products: [],
        categories: [],
        cart: { items: [], total: 0 },
        orders: [],
        user: null,
        auth: { isAuthenticated: false, loading: true }
    };

    async function apiRequest(endpoint, options = {}) {
        const config = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, config);
            const data = await response.json().catch(() => ({ message: 'Invalid response' }));

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async function register(email, password, name) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: { email, password, name }
        });
        state.user = data.user;
        state.auth.isAuthenticated = true;
        return data;
    }

    async function login(email, password) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        state.user = data.user;
        state.auth.isAuthenticated = true;
        return data;
    }

    async function logout() {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Logout error:', e);
        }
        state.user = null;
        state.auth.isAuthenticated = false;
        state.cart = { items: [], total: 0 };
        switchView('home');
    }

    async function checkAuth() {
        state.auth.loading = true;
        try {
            const data = await apiRequest('/auth/me');
            state.user = data.user;
            state.auth.isAuthenticated = true;
        } catch (e) {
            state.user = null;
            state.auth.isAuthenticated = false;
        }
        state.auth.loading = false;
    }

    async function getCurrentUser() {
        if (!state.auth.isAuthenticated) {
            await checkAuth();
        }
        return state.user;
    }

    async function fetchProducts(category = null) {
        try {
            const endpoint = category ? `/products?category=${encodeURIComponent(category)}` : '/products';
            const data = await apiRequest(endpoint);
            state.products = data.products || data;
            return state.products;
        } catch (error) {
            showToast('Failed to load products', 'error');
            throw error;
        }
    }

    async function fetchCategories() {
        try {
            const data = await apiRequest('/categories');
            state.categories = data.categories || data;
            return state.categories;
        } catch (error) {
            showToast('Failed to load categories', 'error');
            throw error;
        }
    }

    function renderProducts(products = state.products) {
        const container = document.getElementById('products-container');
        if (!container) return;

        if (!products || products.length === 0) {
            container.innerHTML = '<div class="no-products">No products found</div>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card" data-id="${product._id || product.id}">
                <div class="product-image">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<div class="placeholder-image">FreshFarm</div>'}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description || ''}</p>
                    <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                    <button class="add-to-cart-btn" data-id="${product._id || product.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }

    function filterByCategory(category) {
        const filtered = category 
            ? state.products.filter(p => p.category === category)
            : state.products;
        renderProducts(filtered);
        
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
    }

    async function getCart() {
        try {
            const data = await apiRequest('/cart');
            state.cart = data;
            return state.cart;
        } catch (error) {
            showToast('Failed to load cart', 'error');
            throw error;
        }
    }

    async function addToCart(productId, quantity = 1) {
        try {
            const data = await apiRequest('/cart/items', {
                method: 'POST',
                body: { productId, quantity }
            });
            state.cart = data;
            showToast('Added to cart!', 'success');
            renderCart();
            return data;
        } catch (error) {
            showToast('Failed to add to cart', 'error');
            throw error;
        }
    }

    async function updateCartItem(itemId, quantity) {
        try {
            const data = await apiRequest(`/cart/items/${itemId}`, {
                method: 'PUT',
                body: { quantity }
            });
            state.cart = data;
            renderCart();
            return data;
        } catch (error) {
            showToast('Failed to update cart', 'error');
            throw error;
        }
    }

    async function removeCartItem(itemId) {
        try {
            const data = await apiRequest(`/cart/items/${itemId}`, {
                method: 'DELETE'
            });
            state.cart = data;
            showToast('Item removed', 'success');
            renderCart();
            return data;
        } catch (error) {
            showToast('Failed to remove item', 'error');
            throw error;
        }
    }

    async function clearCart() {
        try {
            const data = await apiRequest('/cart/clear', { method: 'DELETE' });
            state.cart = { items: [], total: 0 };
            renderCart();
            showToast('Cart cleared', 'success');
            return data;
        } catch (error) {
            showToast('Failed to clear cart', 'error');
            throw error;
        }
    }

    function renderCart() {
        const container = document.getElementById('cart-items');
        if (!container) return;

        if (!state.cart.items || state.cart.items.length === 0) {
            container.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
            updateCartTotal();
            return;
        }

        container.innerHTML = state.cart.items.map(item => `
            <div class="cart-item" data-id="${item._id || item.id}">
                <div class="cart-item-info">
                    <h4>${item.product?.name || item.name}</h4>
                    <p class="cart-item-price">$${parseFloat(item.price).toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn decrease" data-id="${item._id || item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn increase" data-id="${item._id || item.id}">+</button>
                </div>
                <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-item-btn" data-id="${item._id || item.id}">&times;</button>
            </div>
        `).join('');

        updateCartTotal();
    }

    function updateCartTotal() {
        const totalEl = document.getElementById('cart-total');
        if (totalEl) {
            const total = state.cart.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
            totalEl.textContent = `$${total.toFixed(2)}`;
        }
    }

    async function placeOrder(shippingAddress) {
        try {
            const data = await apiRequest('/orders', {
                method: 'POST',
                body: { shippingAddress }
            });
            state.orders.unshift(data.order);
            state.cart = { items: [], total: 0 };
            renderCart();
            showToast('Order placed successfully!', 'success');
            switchView('orders');
            return data;
        } catch (error) {
            showToast('Failed to place order', 'error');
            throw error;
        }
    }

    async function getOrders() {
        try {
            const data = await apiRequest('/orders');
            state.orders = data.orders || data;
            return state.orders;
        } catch (error) {
            showToast('Failed to load orders', 'error');
            throw error;
        }
    }

    function renderOrders() {
        const container = document.getElementById('orders-container');
        if (!container) return;

        if (!state.orders || state.orders.length === 0) {
            container.innerHTML = '<div class="no-orders">No orders yet</div>';
            return;
        }

        container.innerHTML = state.orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Order #${order._id || order.id}</span>
                    <span class="order-status status-${order.status}">${order.status}</span>
                </div>
                <div class="order-date">${new Date(order.createdAt || order.date).toLocaleDateString()}</div>
                <div class="order-items">
                    ${(order.items || []).map(item => `
                        <div class="order-item">
                            <span>${item.name || item.product?.name} x${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">Total: $${parseFloat(order.total).toFixed(2)}</div>
            </div>
        `).join('');
    }

    function showToast(message, type = 'info') {
        const existing = document.querySelector('.toast-container');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.className = `toast-container toast-${type}`;
        container.textContent = message;

        document.body.appendChild(container);

        requestAnimationFrame(() => {
            container.classList.add('show');
        });

        setTimeout(() => {
            container.classList.remove('show');
            setTimeout(() => container.remove(), 300);
        }, 3000);
    }

    function showLoading() {
        let loader = document.querySelector('.loading-overlay');
        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'loading-overlay';
            loader.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(loader);
        }
        loader.classList.add('show');
    }

    function hideLoading() {
        const loader = document.querySelector('.loading-overlay');
        if (loader) {
            loader.classList.remove('show');
            setTimeout(() => loader.remove(), 300);
        }
    }

    function switchView(viewName) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
        }

        if (viewName === 'products') {
            renderProducts();
        } else if (viewName === 'orders' && state.auth.isAuthenticated) {
            getOrders().then(renderOrders);
        }
    }

    function toggleCart() {
        const cart = document.getElementById('cart-sidebar');
        if (cart) {
            cart.classList.toggle('open');
        }
    }

    function toggleAuthModal(mode = 'login') {
        const modal = document.getElementById('auth-modal');
        if (!modal) return;

        modal.classList.toggle('open');
        
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (mode === 'login') {
            loginForm?.classList.add('active');
            registerForm?.classList.remove('active');
        } else {
            loginForm?.classList.remove('active');
            registerForm?.classList.add('active');
        }
    }

    function updateAuthUI() {
        const authButtons = document.getElementById('auth-buttons');
        const userInfo = document.getElementById('user-info');
        
        if (state.auth.isAuthenticated && state.user) {
            if (authButtons) authButtons.style.display = 'none';
            if (userInfo) {
                userInfo.style.display = 'flex';
                const nameEl = userInfo.querySelector('.user-name');
                if (nameEl) nameEl.textContent = state.user.name || state.user.email;
            }
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';
        }
    }

    async function initApp() {
        showLoading();
        
        try {
            await checkAuth();
            await fetchCategories();
            await fetchProducts();
            
            renderProducts();
            updateAuthUI();
            
            if (state.auth.isAuthenticated) {
                await getCart();
                renderCart();
            }
        } catch (error) {
            console.error('Init error:', error);
            showToast('Failed to initialize app', 'error');
        } finally {
            hideLoading();
        }
    }

    function setupEventListeners() {
        document.addEventListener('DOMContentLoaded', initApp);

        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productId = e.target.dataset.id;
                const product = state.products.find(p => (p._id || p.id) === productId);
                if (product) {
                    await addToCart(productId, 1);
                }
            }

            if (e.target.classList.contains('qty-btn')) {
                const itemId = e.target.dataset.id;
                const isIncrease = e.target.classList.contains('increase');
                const item = state.cart.items.find(i => (i._id || i.id) === itemId);
                
                if (item) {
                    const newQty = isIncrease ? item.quantity + 1 : item.quantity - 1;
                    if (newQty > 0) {
                        await updateCartItem(itemId, newQty);
                    } else {
                        await removeCartItem(itemId);
                    }
                }
            }

            if (e.target.classList.contains('remove-item-btn')) {
                const itemId = e.target.dataset.id;
                await removeCartItem(itemId);
            }

            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                const view = e.target.dataset.view;
                if (view === 'orders' && !state.auth.isAuthenticated) {
                    showToast('Please login to view orders', 'error');
                    toggleAuthModal('login');
                    return;
                }
                switchView(view);
            }

            if (e.target.id === 'logout-btn') {
                await logout();
                showToast('Logged out successfully', 'success');
            }

            if (e.target.id === 'cart-toggle') {
                toggleCart();
            }

            if (e.target.id === 'login-btn' || e.target.id === 'show-login') {
                toggleAuthModal('login');
            }

            if (e.target.id === 'register-btn' || e.target.id === 'show-register') {
                toggleAuthModal('register');
            }

            if (e.target.id === 'close-auth') {
                toggleAuthModal();
            }

            if (e.target.id === 'checkout-btn') {
                if (!state.auth.isAuthenticated) {
                    showToast('Please login to checkout', 'error');
                    toggleCart();
                    toggleAuthModal('login');
                    return;
                }
                if (!state.cart.items || state.cart.items.length === 0) {
                    showToast('Cart is empty', 'error');
                    return;
                }
                const address = prompt('Enter shipping address:');
                if (address) {
                    await placeOrder(address);
                    toggleCart();
                }
            }
        });

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const filtered = state.products.filter(p => 
                    p.name.toLowerCase().includes(query) ||
                    (p.description && p.description.toLowerCase().includes(query))
                );
                renderProducts(filtered);
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                const category = e.target.dataset.category;
                filterByCategory(category === 'all' ? null : category);
            }
        });

        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = loginForm.querySelector('#login-email')?.value;
                const password = loginForm.querySelector('#login-password')?.value;
                
                showLoading();
                try {
                    await login(email, password);
                    toggleAuthModal();
                    updateAuthUI();
                    await getCart();
                    renderCart();
                    showToast('Welcome back!', 'success');
                } catch (error) {
                    showToast(error.message || 'Login failed', 'error');
                } finally {
                    hideLoading();
                }
            });
        }

        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = registerForm.querySelector('#register-name')?.value;
                const email = registerForm.querySelector('#register-email')?.value;
                const password = registerForm.querySelector('#register-password')?.value;
                
                showLoading();
                try {
                    await register(email, password, name);
                    toggleAuthModal();
                    updateAuthUI();
                    showToast('Account created successfully!', 'success');
                } catch (error) {
                    showToast(error.message || 'Registration failed', 'error');
                } finally {
                    hideLoading();
                }
            });
        }

        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    toggleAuthModal();
                }
            });
        }

        const cartClose = document.getElementById('cart-close');
        if (cartClose) {
            cartClose.addEventListener('click', toggleCart);
        }
    }

    if (!document.readyState || document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setupEventListeners());
    } else {
        setupEventListeners();
    }

    window.FreshFarm = {
        state,
        apiRequest,
        register,
        login,
        logout,
        checkAuth,
        getCurrentUser,
        fetchProducts,
        fetchCategories,
        renderProducts,
        filterByCategory,
        getCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        renderCart,
        placeOrder,
        getOrders,
        renderOrders,
        showToast,
        showLoading,
        hideLoading,
        switchView,
        toggleCart,
        toggleAuthModal,
        updateAuthUI
    };
})();
