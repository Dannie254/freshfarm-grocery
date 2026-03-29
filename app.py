import os
from datetime import timedelta
from functools import wraps

import bcrypt
import pymysql
from flask import Flask, jsonify, request, make_response, render_template
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, get_jwt
)

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'freshfarm-secret-key-2024')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'freshfarm-jwt-secret-2024')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_COOKIE_CSRF_PROTECT'] = False

CORS(app, supports_credentials=True, origins=['http://localhost:5000', 'http://127.0.0.1:5000'])
jwt = JWTManager(app)

DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', ''),
    'database': os.environ.get('DB_NAME', 'freshfarm_db'),
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

def get_db_connection():
    return pymysql.connect(**DB_CONFIG)

def init_db():
    conn = pymysql.connect(
        host=DB_CONFIG['host'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        charset='utf8mb4'
    )
    cursor = conn.cursor()
    
    schema_path = os.path.join(os.path.dirname(__file__), 'database', 'schema.sql')
    if os.path.exists(schema_path):
        with open(schema_path, 'r') as f:
            schema = f.read()
        statements = [s.strip() for s in schema.split(';') if s.strip()]
        for statement in statements:
            try:
                cursor.execute(statement)
            except Exception as e:
                print(f"Statement error (may be expected): {e}")
    
    schema_path = os.path.join(os.path.dirname(__file__), 'database', 'schema.sql')
    if os.path.exists(schema_path):
        with open(schema_path, 'r') as f:
            schema = f.read()
        statements = schema.split(';')
        for statement in statements:
            if statement.strip():
                try:
                    cursor.execute(statement)
                except:
                    pass
    
    conn.commit()
    conn.close()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    if not tables:
        with open(schema_path, 'r') as f:
            sql = f.read()
        statements = [s.strip() + ';' for s in sql.split(';') if s.strip()]
        for stmt in statements:
            if stmt and 'INSERT' not in stmt[:20]:
                try:
                    cursor.execute(stmt)
                except Exception as e:
                    print(f"Error: {e}")
        conn.commit()
    conn.close()

def token_blocklist():
    return set()

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/health')
def health():
    try:
        conn = get_db_connection()
        conn.close()
        return jsonify({'status': 'healthy', 'database': 'connected'})
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    
    if not username or not email or not password:
        return jsonify({'error': 'Username, email and password are required'}), 400
    
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT id FROM users WHERE username = %s OR email = %s', (username, email))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Username or email already exists'}), 409
        
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=12)).decode('utf-8')
        
        cursor.execute(
            'INSERT INTO users (username, email, password_hash, full_name) VALUES (%s, %s, %s, %s)',
            (username, email, password_hash, full_name)
        )
        conn.commit()
        
        user_id = cursor.lastrowid
        conn.close()
        
        access_token = create_access_token(
            identity={'user_id': user_id, 'email': email, 'username': username}
        )
        
        response = make_response(jsonify({
            'message': 'Registration successful',
            'user': {'id': user_id, 'username': username, 'email': email}
        }))
        response.set_cookie(
            'access_token',
            access_token,
            httponly=True,
            samesite='Strict',
            secure=False,
            max_age=86400
        )
        return response, 201
        
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, username, email, password_hash FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            conn.close()
            return jsonify({'error': 'Invalid email or password'}), 401
        
        conn.close()
        
        access_token = create_access_token(
            identity={'user_id': user['id'], 'email': user['email'], 'username': user['username']}
        )
        
        response = make_response(jsonify({
            'message': 'Login successful',
            'user': {'id': user['id'], 'username': user['username'], 'email': user['email']}
        }))
        response.set_cookie(
            'access_token',
            access_token,
            httponly=True,
            samesite='Strict',
            secure=False,
            max_age=86400
        )
        return response, 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/api/auth/logout', methods=['POST', 'OPTIONS'])
def logout():
    if request.method == 'OPTIONS':
        return '', 204
    
    response = make_response(jsonify({'message': 'Logout successful'}))
    response.set_cookie('access_token', '', expires=0)
    return response, 200

@app.route('/api/auth/me', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_current_user():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        identity = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT id, username, email, full_name, phone, address, created_at FROM users WHERE id = %s',
            (identity['user_id'],)
        )
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user['created_at'] = str(user['created_at'])
        
        return jsonify({'user': user}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['GET', 'OPTIONS'])
def get_products():
    if request.method == 'OPTIONS':
        return '', 204
    
    category = request.args.get('category')
    search = request.args.get('search')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = 'SELECT * FROM products WHERE is_available = TRUE'
        params = []
        
        if category:
            query += ' AND category = %s'
            params.append(category)
        
        if search:
            query += ' AND (name LIKE %s OR description LIKE %s)'
            search_term = f'%{search}%'
            params.extend([search_term, search_term])
        
        query += ' ORDER BY created_at DESC'
        
        cursor.execute(query, params)
        products = cursor.fetchall()
        conn.close()
        
        for product in products:
            if product.get('price'):
                product['price'] = float(product['price'])
            if product.get('created_at'):
                product['created_at'] = str(product['created_at'])
        
        return jsonify({'products': products}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['GET', 'OPTIONS'])
def get_product(product_id):
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM products WHERE id = %s AND is_available = TRUE', (product_id,))
        product = cursor.fetchone()
        conn.close()
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        if product.get('price'):
            product['price'] = float(product['price'])
        if product.get('created_at'):
            product['created_at'] = str(product['created_at'])
        
        return jsonify({'product': product}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/category/<category>', methods=['GET', 'OPTIONS'])
def get_products_by_category(category):
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT * FROM products WHERE category = %s AND is_available = TRUE ORDER BY name',
            (category,)
        )
        products = cursor.fetchall()
        conn.close()
        
        for product in products:
            if product.get('price'):
                product['price'] = float(product['price'])
            if product.get('created_at'):
                product['created_at'] = str(product['created_at'])
        
        return jsonify({'products': products, 'category': category}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/categories', methods=['GET', 'OPTIONS'])
def get_categories():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT DISTINCT category FROM products WHERE is_available = TRUE ORDER BY category')
        categories = cursor.fetchall()
        conn.close()
        
        return jsonify({'categories': [c['category'] for c in categories]}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cart', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_cart():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        identity = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT ci.id, ci.quantity, ci.added_at, 
                   p.id as product_id, p.name, p.price, p.unit, p.image_url
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = %s
            ORDER BY ci.added_at DESC
        ''', (identity['user_id'],))
        
        cart_items = cursor.fetchall()
        conn.close()
        
        total = 0
        for item in cart_items:
            if item.get('price'):
                item['price'] = float(item['price'])
                item['subtotal'] = float(item['price']) * item['quantity']
                total += item['subtotal']
            if item.get('added_at'):
                item['added_at'] = str(item['added_at'])
        
        return jsonify({'cart': cart_items, 'total': total}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cart', methods=['POST', 'OPTIONS'])
@jwt_required()
def add_to_cart():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        identity = get_jwt_identity()
        data = request.get_json()
        
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        
        if not product_id or quantity < 1:
            return jsonify({'error': 'Invalid product or quantity'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, stock FROM products WHERE id = %s AND is_available = TRUE', (product_id,))
        product = cursor.fetchone()
        
        if not product:
            conn.close()
            return jsonify({'error': 'Product not found'}), 404
        
        cursor.execute(
            'SELECT id, quantity FROM cart_items WHERE user_id = %s AND product_id = %s',
            (identity['user_id'], product_id)
        )
        existing = cursor.fetchone()
        
        if existing:
            new_quantity = existing['quantity'] + quantity
            if new_quantity > product['stock']:
                new_quantity = product['stock']
            cursor.execute(
                'UPDATE cart_items SET quantity = %s WHERE id = %s',
                (new_quantity, existing['id'])
            )
        else:
            cursor.execute(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (%s, %s, %s)',
                (identity['user_id'], product_id, quantity)
            )
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Added to cart'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cart/<int:item_id>', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_cart_item(item_id):
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        identity = get_jwt_identity()
        data = request.get_json()
        
        quantity = data.get('quantity', 1)
        
        if quantity < 1:
            return jsonify({'error': 'Quantity must be at least 1'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT quantity FROM cart_items WHERE id = %s AND user_id = %s', (item_id, identity['user_id']))
        item = cursor.fetchone()
        
        if not item:
            conn.close()
            return jsonify({'error': 'Cart item not found'}), 404
        
        if quantity > item['quantity']:
            cursor.execute('SELECT stock FROM products p JOIN cart_items ci ON p.id = ci.product_id WHERE ci.id = %s', (item_id,))
            product = cursor.fetchone()
            if product and quantity > product['stock']:
                quantity = product['stock']
        
        cursor.execute('UPDATE cart_items SET quantity = %s WHERE id = %s', (quantity, item_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Cart updated'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cart/<int:item_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def remove_cart_item(item_id):
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        identity = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM cart_items WHERE id = %s AND user_id = %s', (item_id, identity['user_id']))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Cart item not found'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Item removed from cart'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cart', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def clear_cart():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        identity = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM cart_items WHERE user_id = %s', (identity['user_id'],))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Cart cleared'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['POST', 'OPTIONS'])
@jwt_required()
def place_order():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        identity = get_jwt_identity()
        data = request.get_json()
        
        shipping_address = data.get('shipping_address', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT ci.id, ci.quantity, ci.product_id, p.price, p.name, p.stock
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = %s
        ''', (identity['user_id'],))
        
        cart_items = cursor.fetchall()
        
        if not cart_items:
            conn.close()
            return jsonify({'error': 'Cart is empty'}), 400
        
        total_amount = 0
        for item in cart_items:
            if item['quantity'] > item['stock']:
                conn.close()
                return jsonify({'error': f'Insufficient stock for {item["name"]}'}), 400
        
        cursor.execute(
            'INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES (%s, %s, %s, %s)',
            (identity['user_id'], 0, 'pending', shipping_address)
        )
        
        order_id = cursor.lastrowid
        
        for item in cart_items:
            unit_price = float(item['price'])
            subtotal = unit_price * item['quantity']
            total_amount += subtotal
            
            cursor.execute('''
                INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
                VALUES (%s, %s, %s, %s, %s)
            ''', (order_id, item['product_id'], item['quantity'], unit_price, subtotal))
            
            cursor.execute(
                'UPDATE products SET stock = stock - %s WHERE id = %s',
                (item['quantity'], item['product_id'])
            )
        
        cursor.execute('UPDATE orders SET total_amount = %s WHERE id = %s', (total_amount, order_id))
        
        cursor.execute('DELETE FROM cart_items WHERE user_id = %s', (identity['user_id'],))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Order placed successfully',
            'order_id': order_id,
            'total_amount': total_amount
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_orders():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        identity = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT o.id, o.total_amount, o.status, o.shipping_address, o.created_at
            FROM orders o
            WHERE o.user_id = %s
            ORDER BY o.created_at DESC
        ''', (identity['user_id'],))
        
        orders = cursor.fetchall()
        
        for order in orders:
            if order.get('total_amount'):
                order['total_amount'] = float(order['total_amount'])
            if order.get('created_at'):
                order['created_at'] = str(order['created_at'])
        
        conn.close()
        
        return jsonify({'orders': orders}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/<int:order_id>', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_order(order_id):
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        identity = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT o.id, o.total_amount, o.status, o.shipping_address, o.created_at, o.updated_at
            FROM orders o
            WHERE o.id = %s AND o.user_id = %s
        ''', (order_id, identity['user_id']))
        
        order = cursor.fetchone()
        
        if not order:
            conn.close()
            return jsonify({'error': 'Order not found'}), 404
        
        cursor.execute('''
            SELECT oi.id, oi.quantity, oi.unit_price, oi.subtotal,
                   p.name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = %s
        ''', (order_id,))
        
        items = cursor.fetchall()
        
        conn.close()
        
        for item in items:
            if item.get('unit_price'):
                item['unit_price'] = float(item['unit_price'])
            if item.get('subtotal'):
                item['subtotal'] = float(item['subtotal'])
        
        if order.get('total_amount'):
            order['total_amount'] = float(order['total_amount'])
        if order.get('created_at'):
            order['created_at'] = str(order['created_at'])
        if order.get('updated_at'):
            order['updated_at'] = str(order['updated_at'])
        
        order['items'] = items
        
        return jsonify({'order': order}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/check', methods=['GET', 'OPTIONS'])
def check_auth():
    if request.method == 'OPTIONS':
        return '', 204
    
    cookies = request.cookies
    
    if 'access_token' in cookies:
        return jsonify({'authenticated': True}), 200
    
    return jsonify({'authenticated': False}), 200

if __name__ == '__main__':
    try:
        init_db()
    except Exception as e:
        print(f"Database initialization note: {e}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)