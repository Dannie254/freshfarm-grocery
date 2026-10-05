-- Additional Sample Products for FreshFarm Grocery
-- Run this after schema.sql to add more products for all categories
USE freshfarm_db;

-- BAKERY PRODUCTS
INSERT INTO products (name, description, category, price, unit, stock, image_url, is_available) VALUES
('Sourdough Bread', 'Artisan sourdough bread with crispy crust and soft interior.', 'Bakery', 5.99, 'pc', 50, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300', TRUE),
('Whole Wheat Bread', 'Healthy whole wheat bread, rich in fiber.', 'Bakery', 4.49, 'pc', 60, 'https://images.unsplash.com/photo-1585478259715-4d1e3b8d5a6e?w=300', TRUE),
('Croissants', 'Buttery, flaky French croissants - pack of 6.', 'Bakery', 6.99, 'pack', 40, 'https://images.unsplash.com/photo-1555507036-ab794f4afe5a?w=300', TRUE),
('Chocolate Chip Cookies', 'Freshly baked chocolate chip cookies - pack of 12.', 'Bakery', 5.49, 'pack', 80, 'https://images.unsplash.com/photo-1499636138743-8d199675c7f6?w=300', TRUE),
('Blueberry Muffins', 'Fresh blueberry muffins - pack of 4.', 'Bakery', 4.99, 'pack', 45, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=300', TRUE),
('Cinnamon Rolls', 'Warm cinnamon rolls with cream cheese frosting - pack of 6.', 'Bakery', 7.99, 'pack', 35, 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=300', TRUE),
('Baguette', 'Classic French baguette with golden crust.', 'Bakery', 3.99, 'pc', 55, 'https://images.unsplash.com/photo-1585478259725-4d7e3b8d5a6f?w=300', TRUE),
('Bagels (Plain)', 'Fresh plain bagels - pack of 6.', 'Bakery', 5.49, 'pack', 50, 'https://images.unsplash.com/photo-1585478259735-4d8e3b8d5a7f?w=300', TRUE),
('Apple Pie', 'Homemade apple pie with flaky crust.', 'Bakery', 12.99, 'pc', 20, 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=300', TRUE),
('Chocolate Cake', 'Rich chocolate layer cake - serves 8.', 'Bakery', 24.99, 'pc', 15, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300', TRUE),
('Banana Bread', 'Moist banana bread with walnuts.', 'Bakery', 6.99, 'pc', 30, 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=300', TRUE),
('Pretzels', 'Soft baked pretzels with salt - pack of 4.', 'Bakery', 4.99, 'pack', 40, 'https://images.unsplash.com/photo-1515344920319-1c9a0c6b8b5e?w=300', TRUE),
('Danish Pastries', 'Assorted Danish pastries - pack of 6.', 'Bakery', 8.99, 'pack', 30, 'https://images.unsplash.com/photo-1509365465995-25d11c17e813?w=300', TRUE),
('Focaccia Bread', 'Italian focaccia with rosemary and olive oil.', 'Bakery', 5.99, 'pc', 40, 'https://images.unsplash.com/photo-1585478259745-4d9e3b8d5a8f?w=300', TRUE),
('Cornbread', 'Southern-style sweet cornbread.', 'Bakery', 4.99, 'pc', 35, 'https://images.unsplash.com/photo-1585478259755-4dae3b8d5a9f?w=300', TRUE);

-- DAIRY PRODUCTS
INSERT INTO products (name, description, category, price, unit, stock, image_url, is_available) VALUES
('Whole Milk', 'Fresh whole milk, 3.25% fat - 1 gallon.', 'Dairy', 4.49, 'gal', 100, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300', TRUE),
('Almond Milk', 'Unsweetened almond milk - 64 oz.', 'Dairy', 4.99, 'carton', 80, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300', TRUE),
('Greek Yogurt (Plain)', 'Thick and creamy plain Greek yogurt - 32 oz.', 'Dairy', 5.99, 'tub', 70, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300', TRUE),
('Cheddar Cheese', 'Sharp cheddar cheese block - 8 oz.', 'Dairy', 4.99, 'pc', 90, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300', TRUE),
('Mozzarella Cheese', 'Fresh mozzarella cheese ball - 8 oz.', 'Dairy', 4.49, 'pc', 85, 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=300', TRUE),
('Butter (Salted)', 'Premium salted butter - 1 lb.', 'Dairy', 4.99, 'pc', 100, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300', TRUE),
('Eggs (Dozen)', 'Farm fresh large eggs - 12 count.', 'Dairy', 4.99, 'dozen', 150, 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=300', TRUE),
('Cottage Cheese', 'Low-fat cottage cheese - 16 oz.', 'Dairy', 3.99, 'tub', 60, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300', TRUE),
('Heavy Cream', 'Heavy whipping cream - 16 oz.', 'Dairy', 4.49, 'carton', 50, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300', TRUE),
('Cream Cheese', 'Original cream cheese spread - 8 oz.', 'Dairy', 3.49, 'pc', 75, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300', TRUE),
('Sour Cream', 'Sour cream - 16 oz.', 'Dairy', 2.99, 'tub', 65, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300', TRUE),
('Swiss Cheese', 'Swiss cheese slices - 8 oz.', 'Dairy', 4.99, 'pc', 55, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300', TRUE),
('Parmesan Cheese', 'Grated Parmesan cheese - 8 oz.', 'Dairy', 5.49, 'pc', 70, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300', TRUE),
('Ricotta Cheese', 'Whole milk ricotta cheese - 15 oz.', 'Dairy', 4.49, 'tub', 45, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300', TRUE),
('Kefir', 'Probiotic kefir drink - 32 oz.', 'Dairy', 4.99, 'bottle', 40, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300', TRUE);

-- BEVERAGES PRODUCTS
INSERT INTO products (name, description, category, price, unit, stock, image_url, is_available) VALUES
('Orange Juice', 'Fresh squeezed orange juice - 64 oz.', 'Beverages', 4.99, 'carton', 80, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300', TRUE),
('Apple Juice', '100% pure apple juice - 64 oz.', 'Beverages', 3.99, 'carton', 85, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300', TRUE),
('Sparkling Water', 'Natural sparkling mineral water - 1L.', 'Beverages', 1.99, 'bottle', 200, 'https://images.unsplash.com/photo-1559839762-36873d2c0d7d?w=300', TRUE),
('Coconut Water', 'Pure coconut water - 16.9 oz.', 'Beverages', 2.99, 'bottle', 100, 'https://images.unsplash.com/photo-1542640244-ef79b2f5b0e8?w=300', TRUE),
('Cold Brew Coffee', 'Ready-to-drink cold brew coffee - 32 oz.', 'Beverages', 4.99, 'bottle', 60, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300', TRUE),
('Green Tea', 'Organic green tea bags - 20 count.', 'Beverages', 4.49, 'box', 90, 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=300', TRUE),
('Lemonade', 'Fresh homemade lemonade - 64 oz.', 'Beverages', 3.99, 'carton', 70, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=300', TRUE),
('Kombucha (Ginger)', 'Ginger kombucha - 16 oz.', 'Beverages', 3.99, 'bottle', 50, 'https://images.unsplash.com/photo-1597479887153-8b8e2c5e8c1e?w=300', TRUE),
('Chocolate Milk', 'Low-fat chocolate milk - 64 oz.', 'Beverages', 3.49, 'carton', 75, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300', TRUE),
('Iced Tea (Peach)', 'Peach iced tea - 64 oz.', 'Beverages', 3.49, 'bottle', 65, 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=300', TRUE),
('Oat Milk', 'Creamy oat milk - 64 oz.', 'Beverages', 4.99, 'carton', 60, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300', TRUE),
('Pomegranate Juice', '100% pomegranate juice - 16 oz.', 'Beverages', 4.99, 'bottle', 45, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300', TRUE),
('Electrolyte Water', 'Electrolyte enhanced water - 1L.', 'Beverages', 2.49, 'bottle', 100, 'https://images.unsplash.com/photo-1559839762-36873d2c0d7d?w=300', TRUE),
('Chai Latte Mix', 'Spiced chai latte concentrate - 32 oz.', 'Beverages', 5.99, 'bottle', 40, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300', TRUE),
('Fresh Grapefruit Juice', 'Fresh squeezed grapefruit juice - 32 oz.', 'Beverages', 4.49, 'bottle', 55, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300', TRUE);

-- ADDITIONAL VEGETABLES
INSERT INTO products (name, description, category, price, unit, stock, image_url, is_available) VALUES
('Zucchini', 'Fresh green zucchini, perfect for grilling.', 'Vegetables', 2.99, 'kg', 90, 'https://images.unsplash.com/photo-1515922472370-3b3e9b3d9b5e?w=300', TRUE),
('Eggplant', 'Large purple eggplant, great for parmesan.', 'Vegetables', 3.49, 'pc', 60, 'https://images.unsplash.com/photo-1515922472370-3b3e9b3d9b5f?w=300', TRUE),
('Cauliflower', 'Fresh white cauliflower head.', 'Vegetables', 3.99, 'pc', 55, 'https://images.unsplash.com/photo-1548961437-1c8a2b3c4d5e?w=300', TRUE),
('Asparagus', 'Tender green asparagus spears.', 'Vegetables', 4.99, 'kg', 40, 'https://images.unsplash.com/photo-1504780334009-05a97c1c3b1e?w=300', TRUE),
('Green Beans', 'Crisp fresh green beans.', 'Vegetables', 3.49, 'kg', 75, 'https://images.unsplash.com/photo-1504780334009-05a97c1c3b1f?w=300', TRUE),
('Radishes', 'Crisp red radishes with greens.', 'Vegetables', 1.99, 'bunch', 80, 'https://images.unsplash.com/photo-1504780334009-05a97c1c3b20?w=300', TRUE),
('Artichokes', 'Globe artichokes - pack of 2.', 'Vegetables', 5.99, 'pack', 35, 'https://images.unsplash.com/photo-1548961437-1c8a2b3c4d5f?w=300', TRUE),
('Brussels Sprouts', 'Fresh Brussels sprouts.', 'Vegetables', 3.99, 'kg', 60, 'https://images.unsplash.com/photo-1504780334009-05a97c1c3b21?w=300', TRUE),
('Kale', 'Organic curly kale leaves.', 'Vegetables', 2.99, 'kg', 70, 'https://images.unsplash.com/photo-1576045057995-568f588f82fc?w=300', TRUE),
('Sweet Potatoes', 'Orange sweet potatoes.', 'Vegetables', 2.49, 'kg', 100, 'https://images.unsplash.com/photo-1518977676601-b53f82aba656?w=300', TRUE),
('Butternut Squash', 'Sweet butternut squash.', 'Vegetables', 2.99, 'pc', 50, 'https://images.unsplash.com/photo-1548961437-1c8a2b3c4d60?w=300', TRUE),
('Leeks', 'Fresh leeks, great for soups.', 'Vegetables', 2.49, 'kg', 55, 'https://images.unsplash.com/photo-1548961437-1c8a2b3c4d61?w=300', TRUE),
('Fennel', 'Crisp fennel bulbs with fronds.', 'Vegetables', 2.99, 'pc', 45, 'https://images.unsplash.com/photo-1548961437-1c8a2b3c4d62?w=300', TRUE),
('Okra', 'Fresh okra pods.', 'Vegetables', 3.99, 'kg', 40, 'https://images.unsplash.com/photo-1548961437-1c8a2b3c4d63?w=300', TRUE),
('Bok Choy', 'Baby bok choy, perfect for stir-fry.', 'Vegetables', 2.99, 'kg', 65, 'https://images.unsplash.com/photo-1576045057995-568f588f82fd?w=300', TRUE);

-- ADDITIONAL FRUITS
INSERT INTO products (name, description, category, price, unit, stock, image_url, is_available) VALUES
('Mangoes', 'Ripe and sweet mangoes.', 'Fruits', 2.99, 'pc', 80, 'https://images.unsplash.com/photo-1553279768-8690c7e7c7e0?w=300', TRUE),
('Papaya', 'Sweet papaya, rich in enzymes.', 'Fruits', 3.99, 'pc', 50, 'https://images.unsplash.com/photo-1553279768-8690c7e7c7e1?w=300', TRUE),
('Kiwi', 'Fresh green kiwi - pack of 6.', 'Fruits', 4.99, 'pack', 70, 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300', TRUE),
('Peaches', 'Juicy yellow peaches.', 'Fruits', 4.49, 'kg', 65, 'https://images.unsplash.com/photo-1519996529931-28324d5a630f?w=300', TRUE),
('Plums', 'Sweet purple plums.', 'Fruits', 4.99, 'kg', 55, 'https://images.unsplash.com/photo-1519996529931-28324d5a6310?w=300', TRUE),
('Nectarines', 'Sweet white nectarines.', 'Fruits', 4.99, 'kg', 60, 'https://images.unsplash.com/photo-1519996529931-28324d5a6311?w=300', TRUE),
('Cherries', 'Fresh sweet cherries.', 'Fruits', 8.99, 'kg', 40, 'https://images.unsplash.com/photo-1519996529931-28324d5a6312?w=300', TRUE),
('Blueberries', 'Fresh blueberries - 6 oz.', 'Fruits', 5.99, 'pint', 50, 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=300', TRUE),
('Raspberries', 'Fresh raspberries - 6 oz.', 'Fruits', 6.99, 'pint', 45, 'https://images.unsplash.com/photo-1498557850523-fd3d118b962f?w=300', TRUE),
('Blackberries', 'Fresh blackberries - 6 oz.', 'Fruits', 6.99, 'pint', 40, 'https://images.unsplash.com/photo-1498557850523-fd3d118b9630?w=300', TRUE),
('Pears', 'Sweet Bartlett pears.', 'Fruits', 3.99, 'kg', 75, 'https://images.unsplash.com/photo-1519996529931-28324d5a6313?w=300', TRUE),
('Grapefruit', 'Ruby red grapefruit.', 'Fruits', 1.99, 'pc', 85, 'https://images.unsplash.com/photo-1519996529931-28324d5a6314?w=300', TRUE),
('Cantaloupe', 'Sweet cantaloupe melon.', 'Fruits', 3.99, 'pc', 45, 'https://images.unsplash.com/photo-1589984662646-e7b2e9bd6297?w=300', TRUE),
('Honeydew Melon', 'Fresh honeydew melon.', 'Fruits', 3.99, 'pc', 50, 'https://images.unsplash.com/photo-1589984662646-e7b2e9bd6298?w=300', TRUE),
('Dragon Fruit', 'Exotic dragon fruit (pitaya).', 'Fruits', 5.99, 'pc', 35, 'https://images.unsplash.com/photo-1553279768-8690c7e7c7e2?w=300', TRUE);