const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'freshfarm_db'
};

const JWT_SECRET = process.env.JWT_SECRET || 'freshfarm-jwt-secret-2024';

let pool;

async function initDB() {
    pool = mysql.createPool(dbConfig);
    console.log('MySQL connection pool created');
}

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        req.user = null;
        return next();
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        req.user = null;
        next();
    }
};

app.use(authenticateToken);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'FreshFarm API is running' });
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, fullName, phone, address } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        
        const passwordHash = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password_hash, full_name, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, passwordHash, fullName || null, phone || null, address || null]
        );
        
        const token = jwt.sign({ id: result.insertId, username, email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const [users] = await pool.execute(
            'SELECT id, username, email, password_hash, full_name, phone, address FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const [users] = await pool.execute(
            'SELECT id, username, email, full_name, phone, address, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = users[0];
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            phone: user.phone,
            address: user.address,
            createdAt: user.created_at
        });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

app.get('/api/auth/check', (req, res) => {
    if (req.user) {
        res.json({ authenticated: true, user: { id: req.user.id, username: req.user.username, email: req.user.email } });
    } else {
        res.json({ authenticated: false });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const { category, search, limit = 50, offset = 0 } = req.query;
        
        let query = 'SELECT * FROM products WHERE is_available = TRUE';
        const params = [];
        
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        
        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const [products] = await pool.execute(query, params);
        
        res.json(products);
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ error: 'Failed to get products' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const [products] = await pool.execute(
            'SELECT * FROM products WHERE id = ? AND is_available = TRUE',
            [req.params.id]
        );
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(products[0]);
    } catch (err) {
        console.error('Get product error:', err);
        res.status(500).json({ error: 'Failed to get product' });
    }
});

app.get('/api/products/category/:category', async (req, res) => {
    try {
        const [products] = await pool.execute(
            'SELECT * FROM products WHERE category = ? AND is_available = TRUE ORDER BY name',
            [req.params.category]
        );
        
        res.json(products);
    } catch (err) {
        console.error('Get products by category error:', err);
        res.status(500).json({ error: 'Failed to get products' });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await pool.execute(
            'SELECT DISTINCT category FROM products WHERE is_available = TRUE ORDER BY category'
        );
        
        res.json(categories.map(c => c.category));
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: 'Failed to get categories' });
    }
});

app.get('/api/cart', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const [items] = await pool.execute(
            `SELECT ci.id, ci.quantity, ci.added_at, 
                    p.id as product_id, p.name, p.description, p.category, 
                    p.price, p.unit, p.image_url 
             FROM cart_items ci 
             JOIN products p ON ci.product_id = p.id 
             WHERE ci.user_id = ?`,
            [req.user.id]
        );
        
        res.json(items);
    } catch (err) {
        console.error('Get cart error:', err);
        res.status(500).json({ error: 'Failed to get cart' });
    }
});

app.post('/api/cart', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const { productId, quantity = 1 } = req.body;
        
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }
        
        const [products] = await pool.execute(
            'SELECT id, stock FROM products WHERE id = ? AND is_available = TRUE',
            [productId]
        );
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        if (products[0].stock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }
        
        const [existing] = await pool.execute(
            'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [req.user.id, productId]
        );
        
        if (existing.length > 0) {
            const newQty = existing[0].quantity + quantity;
            if (products[0].stock < newQty) {
                return res.status(400).json({ error: 'Insufficient stock' });
            }
            await pool.execute(
                'UPDATE cart_items SET quantity = ? WHERE id = ?',
                [newQty, existing[0].id]
            );
        } else {
            await pool.execute(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [req.user.id, productId, quantity]
            );
        }
        
        res.json({ message: 'Item added to cart' });
    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

app.put('/api/cart/:id', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const { quantity } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'Valid quantity is required' });
        }
        
        const [items] = await pool.execute(
            'SELECT ci.*, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.user_id = ?',
            [req.params.id, req.user.id]
        );
        
        if (items.length === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        
        if (items[0].stock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }
        
        await pool.execute(
            'UPDATE cart_items SET quantity = ? WHERE id = ?',
            [quantity, req.params.id]
        );
        
        res.json({ message: 'Cart updated' });
    } catch (err) {
        console.error('Update cart error:', err);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

app.delete('/api/cart/:id', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const [result] = await pool.execute(
            'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        
        res.json({ message: 'Item removed from cart' });
    } catch (err) {
        console.error('Remove from cart error:', err);
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
});

app.delete('/api/cart', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        await pool.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        console.error('Clear cart error:', err);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

app.post('/api/orders', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const [cartItems] = await connection.execute(
            `SELECT ci.*, p.price, p.stock, p.name 
             FROM cart_items ci 
             JOIN products p ON ci.product_id = p.id 
             WHERE ci.user_id = ?`,
            [req.user.id]
        );
        
        if (cartItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Cart is empty' });
        }
        
        for (const item of cartItems) {
            if (item.stock < item.quantity) {
                await connection.rollback();
                return res.status(400).json({ error: `Insufficient stock for ${item.name}` });
            }
        }
        
        let totalAmount = 0;
        for (const item of cartItems) {
            totalAmount += item.price * item.quantity;
        }
        
        const { shippingAddress } = req.body;
        
        const [orderResult] = await connection.execute(
            'INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)',
            [req.user.id, totalAmount, shippingAddress || null]
        );
        
        const orderId = orderResult.insertId;
        
        for (const item of cartItems) {
            const subtotal = item.price * item.quantity;
            await connection.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price, subtotal]
            );
            
            await connection.execute(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }
        
        await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
        
        await connection.commit();
        
        res.status(201).json({ message: 'Order placed successfully', orderId });
    } catch (err) {
        await connection.rollback();
        console.error('Place order error:', err);
        res.status(500).json({ error: 'Failed to place order' });
    } finally {
        connection.release();
    }
});

app.get('/api/orders', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const [orders] = await pool.execute(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        
        res.json(orders);
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

app.get('/api/orders/:id', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const [orders] = await pool.execute(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const [items] = await pool.execute(
            `SELECT oi.*, p.name, p.image_url 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = ?`,
            [req.params.id]
        );
        
        res.json({ ...orders[0], items });
    } catch (err) {
        console.error('Get order error:', err);
        res.status(500).json({ error: 'Failed to get order' });
    }
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
    await initDB();
    app.listen(PORT, () => {
        console.log(`FreshFarm server running on port ${PORT}`);
    });
}

startServer().catch(console.error);

module.exports = app;
