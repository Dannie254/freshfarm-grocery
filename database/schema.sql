-- FreshFarm Grocery Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS freshfarm_db;
USE freshfarm_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    stock INT DEFAULT 0,
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_name (name),
    INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY uk_user_product (user_id, product_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Products
INSERT INTO products (name, description, category, price, unit, stock, image_url, is_available) VALUES
('Organic Tomatoes', 'Fresh organic tomatoes grown without pesticides. Perfect for salads and cooking.', 'Vegetables', 4.99, 'kg', 100, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300', TRUE),
('Fresh Spinach', 'Tender baby spinach leaves, rich in iron and vitamins.', 'Vegetables', 3.49, 'kg', 80, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300', TRUE),
('Red Apples', 'Crisp and sweet red apples from local orchards.', 'Fruits', 5.99, 'kg', 150, 'https://images.unsplash.com/photo-1610809027850-6c227f8ed2cd?w=300', TRUE),
('Organic Bananas', 'Naturally ripened organic bananas.', 'Fruits', 2.99, 'kg', 200, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300', TRUE),
('Fresh Carrots', 'Sweet and crunchy organic carrots.', 'Vegetables', 2.49, 'kg', 90, 'https://images.unsplash.com/photo-1598170845058-32b9d6a499da?w=300', TRUE),
('Broccoli', 'Fresh green broccoli florets.', 'Vegetables', 3.99, 'kg', 70, 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300', TRUE),
('Strawberries', 'Sweet and juicy strawberries.', 'Fruits', 6.99, 'kg', 60, 'https://images.unsplash.com/photo-1464966631861-707b5552c6ba?w=300', TRUE),
('Oranges', 'Vitamin C rich fresh oranges.', 'Fruits', 4.49, 'kg', 120, 'https://images.unsplash.com/photo-1547514701-4278c7cfdc32?w=300', TRUE),
('Fresh Potatoes', 'Versatile potatoes for any dish.', 'Vegetables', 1.99, 'kg', 200, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300', TRUE),
('Green Grapes', 'Sweet seedless green grapes.', 'Fruits', 7.99, 'kg', 50, 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=300', TRUE),
('Cucumbers', 'Refreshing cucumbers for salads.', 'Vegetables', 1.49, 'kg', 110, 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=300', TRUE),
('Avocados', 'Ripe and creamy avocados.', 'Fruits', 1.99, 'pc', 75, 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b862?w=300', TRUE),
('Fresh Onions', 'Flavorful yellow onions.', 'Vegetables', 1.29, 'kg', 180, 'https://images.unsplash.com/photo-1506084868180-2f3b1a9e6002?w=300', TRUE),
('Bell Peppers', 'Colorful bell peppers (mixed colors).', 'Vegetables', 4.99, 'kg', 65, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300', TRUE),
('Mushrooms', 'Fresh button mushrooms.', 'Vegetables', 5.99, 'kg', 55, 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=300', TRUE),
('Lemons', 'Zesty fresh lemons.', 'Fruits', 2.99, 'kg', 90, 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=300', TRUE),
('Pineapple', 'Sweet tropical pineapple.', 'Fruits', 3.49, 'pc', 40, 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=300', TRUE),
('Watermelon', 'Refreshing summer watermelon.', 'Fruits', 4.99, 'pc', 35, 'https://images.unsplash.com/photo-1589984662646-e7b2e9bd6296?w=300', TRUE),
('Sweet Corn', 'Fresh sweet corn on the cob.', 'Vegetables', 0.99, 'pc', 100, 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300', TRUE),
('Garlic', 'Flavorful fresh garlic bulbs.', 'Vegetables', 1.49, 'kg', 150, 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2f85?w=300', TRUE);