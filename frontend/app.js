(function() {
    'use strict';

    const API_BASE = 'http://localhost:5001/api';

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

    async function register(username, email, password, fullName) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: { username, email, password, fullName }
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
        updateAuthUI();
        renderCart();
        switchView('home');
    }

    async function checkAuth() {
        state.auth.loading = true;
        try {
            const data = await apiRequest('/auth/me');
            state.user = data;
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
            state.products = data;
            return state.products;
        } catch (error) {
            showToast('Failed to load products', 'error');
            throw error;
        }
    }

    async function fetchCategories() {
        try {
            const data = await apiRequest('/categories');
            state.categories = data;
            return state.categories;
        } catch (error) {
            showToast('Failed to load categories', 'error');
            throw error;
        }
    }

    function renderProducts(products = state.products) {
        const containers = [document.getElementById('productsGrid'), document.getElementById('productsGridPage')].filter(Boolean);
        if (containers.length === 0) return;

        const content = (!products || products.length === 0) ? '<div class="col-12 text-center py-5"><p class="text-muted">No products found</p></div>' : products.map(product => `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="product-card h-100 p-3" data-id="${product.id}">
                    <div class="product-image mb-3" style="border-radius: 10px; overflow: hidden; height: 150px; display:flex; align-items:center; justify-content:center; background:#f8fff4;">
                        ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" style="max-height:100%; max-width:100%; object-fit:contain;">` : '<i class="fas fa-leaf fa-3x text-success"></i>'}
                    </div>
                    <div class="product-info d-flex flex-column" style="height: calc(100% - 166px);">
                        <h5 class="mb-1 text-truncate">${product.name}</h5>
                        <p class="product-description small text-muted mb-2">${product.description || ''}</p>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <div class="product-price fw-bold text-success" style="font-size:1.1rem">$${parseFloat(product.price).toFixed(2)}</div>
                            <button class="btn btn-sm btn-success add-to-cart-btn" data-id="${product.id}">
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        containers.forEach(c => c.innerHTML = content);
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
            state.cart.items = data;
            return state.cart;
        } catch (error) {
            showToast('Failed to load cart', 'error');
            throw error;
        }
    }

    async function addToCart(productId, quantity = 1) {
        try {
            await apiRequest('/cart', {
                method: 'POST',
                body: { productId, quantity }
            });
            showToast('Added to cart!', 'success');
            await getCart();
            renderCart();
        } catch (error) {
            showToast('Failed to add to cart', 'error');
            throw error;
        }
    }

    async function updateCartItem(itemId, quantity) {
        try {
            await apiRequest(`/cart/${itemId}`, {
                method: 'PUT',
                body: { quantity }
            });
            await getCart();
            renderCart();
        } catch (error) {
            showToast('Failed to update cart', 'error');
            throw error;
        }
    }

    async function removeCartItem(itemId) {
        try {
            await apiRequest(`/cart/${itemId}`, {
                method: 'DELETE'
            });
            showToast('Item removed', 'success');
            await getCart();
            renderCart();
        } catch (error) {
            showToast('Failed to remove item', 'error');
            throw error;
        }
    }

    async function clearCart() {
        try {
            await apiRequest('/cart', { method: 'DELETE' });
            state.cart.items = [];
            renderCart();
            showToast('Cart cleared', 'success');
        } catch (error) {
            showToast('Failed to clear cart', 'error');
            throw error;
        }
    }

    function renderCart() {
        const container = document.getElementById('cartItems');
        const totalEl = document.getElementById('cartTotal');
        const badge = document.getElementById('cartBadge');
        if (!container) return;

        if (!state.cart.items || state.cart.items.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-4">Your cart is empty</p>';
            if (totalEl) totalEl.textContent = '$0.00';
            if (badge) {
                badge.style.display = 'none';
                badge.textContent = '0';
            }
            return;
        }

        container.innerHTML = state.cart.items.map(item => `
            <div class="cart-item border-bottom pb-3 mb-3" data-id="${item.id}">
                <div class="row align-items-center">
                    <div class="col-auto">
                        ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">` : '<div class="bg-light d-flex align-items-center justify-content-center" style="width: 60px; height: 60px; border-radius: 8px;"><i class="fas fa-leaf text-success"></i></div>'}
                    </div>
                    <div class="col">
                        <h6 class="mb-1">${item.name}</h6>
                        <p class="mb-1 text-success fw-bold">$${parseFloat(item.price).toFixed(2)}</p>
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-sm btn-outline-secondary qty-btn decrease" data-id="${item.id}">-</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary qty-btn increase" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <div class="col-auto text-end">
                        <div class="fw-bold">$${(item.price * item.quantity).toFixed(2)}</div>
                        <button class="btn btn-sm btn-link text-danger remove-item-btn p-0" data-id="${item.id}">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');

        const total = state.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
        
        if (badge) {
            const itemCount = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = itemCount;
            badge.style.display = itemCount > 0 ? 'flex' : 'none';
        }
    }

    async function placeOrder(shippingAddress) {
        try {
            const data = await apiRequest('/orders', {
                method: 'POST',
                body: { shippingAddress }
            });
            state.orders.unshift(data);
            state.cart.items = [];
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
            state.orders = data;
            return state.orders;
        } catch (error) {
            showToast('Failed to load orders', 'error');
            throw error;
        }
    }

    function renderOrders() {
        const container = document.getElementById('ordersList');
        if (!container) return;

        if (!state.orders || state.orders.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-4">No orders yet</p>';
            return;
        }

        container.innerHTML = state.orders.map(order => `
            <div class="order-card">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5 class="mb-1">Order #${order.id}</h5>
                        <small class="text-muted">${new Date(order.created_at).toLocaleDateString()}</small>
                    </div>
                    <span class="order-status ${order.status}">${order.status}</span>
                </div>
                <div class="order-items mb-3">
                    ${(order.items || []).map(item => `
                        <div class="d-flex justify-content-between py-2 border-bottom">
                            <span>${item.name} x${item.quantity}</span>
                            <span>$${(item.unit_price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span>$${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    }

    function showToast(message, type = 'info') {
        const toastEl = document.getElementById('toastNotification');
        const toastBody = document.getElementById('toastMessage');
        const toastIcon = toastEl.querySelector('.toast-header i');
        
        if (!toastEl || !toastBody) return;

        toastBody.textContent = message;
        
        toastEl.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'text-white');
        toastIcon.className = 'fas me-2';
        
        if (type === 'success') {
            toastEl.classList.add('bg-success', 'text-white');
            toastIcon.classList.add('fa-check-circle', 'text-white');
        } else if (type === 'error') {
            toastEl.classList.add('bg-danger', 'text-white');
            toastIcon.classList.add('fa-exclamation-circle', 'text-white');
        } else if (type === 'warning') {
            toastEl.classList.add('bg-warning', 'text-dark');
            toastIcon.classList.add('fa-exclamation-triangle', 'text-dark');
        } else {
            toastEl.classList.add('bg-info', 'text-white');
            toastIcon.classList.add('fa-info-circle', 'text-white');
        }

        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
    }

    function showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'flex';
    }

    function hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'none';
    }

    function switchView(viewName) {
        document.querySelectorAll('.page-section').forEach(view => {
            view.style.display = 'none';
        });

        const targetView = document.getElementById(`${viewName}Page`);
        if (targetView) {
            targetView.style.display = 'block';
        }

        if (viewName === 'products') {
            renderProducts();
        } else if (viewName === 'orders' && state.auth.isAuthenticated) {
            getOrders().then(renderOrders);
        } else if (viewName === 'orders' && !state.auth.isAuthenticated) {
            const ordersList = document.getElementById('ordersList');
            if (ordersList) {
                ordersList.innerHTML = '<p class="text-muted">Please log in to view your orders.</p>';
            }
        }
    }

    function toggleCart() {
        const cartModalEl = document.getElementById('cartModal');
        if (cartModalEl) {
            const modal = bootstrap.Modal.getInstance(cartModalEl) || new bootstrap.Modal(cartModalEl);
            modal.toggle();
        }
    }

    function toggleAuthModal(mode = 'login') {
        try {
            const loginModalEl = document.getElementById('loginModal');
            const registerModalEl = document.getElementById('registerModal');
            
            if (loginModalEl) {
                const loginModal = bootstrap.Modal.getInstance(loginModalEl);
                if (loginModal) loginModal.hide();
            }
            if (registerModalEl) {
                const registerModal = bootstrap.Modal.getInstance(registerModalEl);
                if (registerModal) registerModal.hide();
            }

            if (mode === 'login' && loginModalEl) {
                new bootstrap.Modal(loginModalEl).show();
            } else if (mode === 'register' && registerModalEl) {
                new bootstrap.Modal(registerModalEl).show();
            }
        } catch (e) {
            console.error('Modal toggle error', e);
        }
    }

    function updateAuthUI() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        
        if (state.auth.isAuthenticated && state.user) {
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'block';
                const nameEl = document.getElementById('userName');
                if (nameEl) nameEl.textContent = state.user.fullName || state.user.username || state.user.email;
            }
        } else {
            if (authButtons) authButtons.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
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
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initApp);
        } else {
            initApp();
        }

        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productId = e.target.dataset.id;
                const product = state.products.find(p => p.id === productId);
                if (product) {
                    await addToCart(productId, 1);
                }
            }

            if (e.target.classList.contains('qty-btn')) {
                const itemId = e.target.dataset.id;
                const isIncrease = e.target.classList.contains('increase');
                const item = state.cart.items.find(i => i.id === itemId);
                
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

            const pageTarget = e.target.closest('[data-page]');
            if (pageTarget) {
                e.preventDefault();
                const view = pageTarget.dataset.page;
                if (view === 'orders' && !state.auth.isAuthenticated) {
                    showToast('Please login to view orders', 'error');
                    toggleAuthModal('login');
                    return;
                }
                switchView(view);
            }

            if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
                await logout();
                showToast('Logged out successfully', 'success');
            }

            if (e.target.id === 'cartBtn') {
                if (!state.auth.isAuthenticated) {
                    showToast('Please login to view cart', 'error');
                    toggleAuthModal('login');
                    return;
                }
                await getCart();
                renderCart();
                toggleCart();
            }

            if (e.target.id === 'checkoutBtn') {
                if (!state.auth.isAuthenticated) {
                    showToast('Please login to checkout', 'error');
                    return;
                }
                if (!state.cart.items || state.cart.items.length === 0) {
                    showToast('Cart is empty', 'error');
                    return;
                }
                const address = prompt('Enter shipping address:');
                if (address) {
                    await placeOrder(address);
                    const cartModalEl = document.getElementById('cartModal');
                    if (cartModalEl) {
                        const modal = bootstrap.Modal.getInstance(cartModalEl);
                        if (modal) modal.hide();
                    }
                    cleanupModals();
                }
            }
        });

        const searchInputs = [document.getElementById('searchInput'), document.getElementById('productsSearchInput')];
        searchInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase();
                    const filtered = state.products.filter(p => 
                        p.name.toLowerCase().includes(query) ||
                        (p.description && p.description.toLowerCase().includes(query))
                    );
                    renderProducts(filtered);
                });
            }
        });

        const categoryFilterDrop = document.getElementById('categoryFilter');
        if (categoryFilterDrop) {
            categoryFilterDrop.addEventListener('change', (e) => {
                const category = e.target.value;
                filterByCategory(category === '' ? null : category);
            });
        }

        document.addEventListener('click', (e) => {
            const catBtn = e.target.closest('.category-btn');
            if (catBtn) {
                const category = catBtn.dataset.category;
                switchView('products');
                if (categoryFilterDrop) categoryFilterDrop.value = category === 'all' ? '' : category;
                filterByCategory(category === 'all' ? null : category);
            }
        });

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail')?.value;
                const password = document.getElementById('loginPassword')?.value;
                
                showLoading();
                try {
                    await login(email, password);
                    cleanupModals();
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

        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('registerUsername')?.value;
                const email = document.getElementById('registerEmail')?.value;
                const password = document.getElementById('registerPassword')?.value;
                const fullName = document.getElementById('registerFullName')?.value;
                
                showLoading();
                try {
                    await register(username, email, password, fullName);
                    cleanupModals();
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
    }

    function cleanupModals() {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(b => b.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
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
        updateAuthUI,
        cleanupModals
    };
})();