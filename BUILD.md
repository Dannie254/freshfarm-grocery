# FreshFarm Grocery - Build & Deployment Guide

A cross-platform grocery store application with a modern, farm-fresh aesthetic.

## Prerequisites

- Node.js 18+ 
- MySQL Server 8.0+

## Platform-Specific Setup

### Windows

1. **Install Node.js**
   - Download from https://nodejs.org/

2. **Install MySQL**
   - Download MySQL Installer from https://dev.mysql.com/downloads/installer/
   - Run installer, choose "Full" installation
   - Set root password during setup

3. **Setup Database**
   - Open MySQL Workbench or Command Line
   - Create database: `CREATE DATABASE freshfarm_db;`
   - Run the schema: `Get-Content database/schema.sql | mysql -u root -p`

4. **Install Dependencies**
   ```cmd
   cd freshfarm-grocery\backend
   npm install
   ```

5. **Configure Environment**
   - Create `.env` in backend folder:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=freshfarm_db
   JWT_SECRET=freshfarm-jwt-secret-2024
   PORT=5001
   FRONTEND_URL=http://localhost:5173
   ```

6. **Run Application**
   ```cmd
   cd freshfarm-grocery\backend
   node server.js
   ```

7. **Access**
   - Open browser: http://localhost:5001

### macOS / Linux

1. **Install Node.js**
   ```bash
   # Using nvm (recommended)
   nvm install 18
   
   # Or using package manager
   # macOS: brew install node
   # Ubuntu: sudo apt install nodejs npm
   ```

2. **Install MySQL**
   ```bash
   # macOS
   brew install mysql
   brew services start mysql
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server
   sudo systemctl start mysql
   ```

3. **Setup Database**
   ```bash
   mysql -u root -p
   CREATE DATABASE freshfarm_db;
   mysql -u root -p freshfarm_db < database/schema.sql
   ```

4. **Install Dependencies**
   ```bash
   cd freshfarm-grocery/backend
   npm install
   ```

5. **Configure Environment**
   - Create `.env` in backend folder (same as Windows)

6. **Run Application**
   ```bash
   cd freshfarm-grocery/backend
   node server.js
   ```

7. **Access**
   - Open browser: http://localhost:5001

## Environment Variables

Create a `.env` file in the backend folder:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=freshfarm_db

# Security
JWT_SECRET=freshfarm-jwt-secret-2024

# Server
PORT=5001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Project Structure (Clean Architecture)

```
freshfarm-grocery/
├── frontend/                    # Client-side application
│   ├── index.html              # Main HTML entry point
│   ├── styles.css              # Styles
│   └── app.js                  # Frontend logic
├── backend/                     # Server-side application
│   ├── server.js               # Express.js server
│   ├── package.json            # Node.js dependencies
│   ├── package-lock.json
│   └── .env                    # Environment variables
├── database/                    # Database layer
│   └── schema.sql              # MySQL schema + seed data
├── BUILD.md                    # This file
├── SETUP.md                    # Setup instructions
└── README.md                   # Project overview
```

## API Endpoints

### Health
- `GET /api/health` - Health check

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/check` - Check auth status

### Products
- `GET /api/products` - List products (with category, search, pagination)
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Products by category
- `GET /api/categories` - List all categories

### Cart (requires auth)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders (requires auth)
- `POST /api/orders` - Place order
- `GET /api/orders` - List user's orders
- `GET /api/orders/:id` - Get order details

## Running Tests

```bash
# Start server
cd backend && node server.js &

# Health check
curl http://localhost:5001/api/health

# Register user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' -c cookies.txt

# Get products
curl -b cookies.txt http://localhost:5001/api/products

# Get categories
curl -b cookies.txt http://localhost:5001/api/categories

# Add to cart
curl -X POST http://localhost:5001/api/cart \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"productId": 1, "quantity": 2}'

# Get cart
curl -b cookies.txt http://localhost:5001/api/cart
```

## Security Features

- JWT tokens stored ONLY in HttpOnly cookies (never in localStorage)
- Passwords hashed with bcrypt (10 salt rounds)
- Backend-only token validation
- CORS configured for specific origins
- SQL injection prevention via parameterized queries

## Today's Work (2026-10-02)

✅ **Completed:**
- Restructured project into clean `/frontend`, `/backend`, `/database` architecture
- Removed duplicate Flask backend, kept Node.js/Express
- Fixed API endpoint paths and database queries
- Fixed cookie-based authentication (HttpOnly cookies)
- Fixed MySQL connection and query parameter issues
- Cleaned up duplicate product data (520 → 20 products)
- Verified API endpoints work: health, products, categories, auth, cart

🔄 **In Progress:**
- Backend server running on port 5001, serving frontend static files
- Frontend integration with backend APIs verified via curl

## Next Session - Start Here

1. **Test full frontend flow** - Open http://localhost:5001 in browser and test:
   - User registration/login
   - Product browsing & filtering
   - Cart operations (add, update, remove)
   - Order placement
   - Order history view

2. **Fix any frontend JS issues** - Check console for errors, ensure:
   - API_BASE in app.js matches backend port (5001)
   - Cookie credentials work cross-origin
   - Modal interactions (login, register, cart)

3. **Add missing features:**
   - Product image handling
   - Order confirmation UI
   - Search functionality
   - Category filter dropdown

4. **Production readiness:**
   - Add input validation middleware
   - Add rate limiting
   - Add request logging
   - Add error boundary components
   - Write unit/integration tests

5. **Deployment preparation:**
   - Add Dockerfile for backend
   - Add production build scripts
   - Configure reverse proxy (nginx)

## Troubleshooting

### Database Connection Error
- Check MySQL is running: `mysql -u root -p`
- Verify credentials in backend/.env
- Create database if not exists

### Port Already in Use
- Kill existing process: `taskkill /F /IM node.exe` (Windows) or `pkill node` (Linux/Mac)
- Or change PORT in .env

### CORS Error
- Ensure FRONTEND_URL in .env matches where frontend is served
- Backend serves frontend at / via express.static()

### Authentication Issues
- Check cookie is being sent (HttpOnly, SameSite=Lax)
- Verify JWT_SECRET matches between login and protected routes
- Check browser DevTools Application tab for cookies

## License

MIT License - See LICENSE file for details