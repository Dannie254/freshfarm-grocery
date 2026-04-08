# FreshFarm Grocery - Local Setup Guide

A cross-platform grocery store application with a modern, foodie, and farm-fresh aesthetic. Built with Node.js, Express, and MySQL.

## Prerequisites

Before running FreshFarm Grocery locally, ensure you have the following installed:

### 1. Node.js
- Download from: https://nodejs.org/
- Recommended: LTS version (20.x or higher)
- Verify installation: `node --version`

### 2. MySQL
- Download from: https://www.mysql.com/downloads/
- Or use MySQL Workbench for easier management
- Minimum version: 8.0
- Verify installation: `mysql --version`

## Installation Steps

### Step 1: Navigate to Project Folder

Open a terminal/command prompt and navigate to the project directory:

```bash
cd C:\Users\dan\Desktop\freshfarm-grocery
```

### Step 2: Install Dependencies

Run the following command to install all required Node.js packages:

```bash
npm install
```

**Required packages:**
- express@^4.18.2 - Web framework
- cors@^2.8.5 - Cross-origin resource sharing middleware
- mysql2@^3.6.0 - MySQL driver for Node.js
- bcrypt@^5.1.1 - Password hashing
- jsonwebtoken@^9.0.2 - JWT authentication
- cookie-parser@^1.4.6 - Cookie parsing middleware
- dotenv@^16.3.1 - Environment variable management

### Step 3: Import Database Schema

Import the MySQL database schema from `database/schema.sql`:

#### Option A: Using MySQL Command Line
```bash
# Connect to MySQL
mysql -u root -p

# Run the schema file
source "C:/Users/dan/Desktop/freshfarm-grocery/database/schema.sql"

# Exit MySQL
exit;
```

#### Option B: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open the `database/schema.sql` file
4. Execute the script (click the ⚡ Execute button)

#### Option C: Using Command Line (Windows)
```bash
cd C:\Users\dan\Desktop\freshfarm-grocery
mysql -u root -p < database\schema.sql
```

**Database Details:**
- Database name: `freshfarm_db`
- MySQL will automatically create the database if it doesn't exist
- Schema includes: users, products, orders, order_items, cart_items tables
- Sample products are pre-loaded

### Step 4: Configure Environment Variables (Optional)

Create a `.env` file in the project root directory with:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=freshfarm_db
JWT_SECRET=your-jwt-secret-key-change-this
PORT=5001
```

**Default values (if not set):**
- `DB_HOST`: localhost
- `DB_USER`: root
- `DB_PASSWORD`: (empty string)
- `DB_NAME`: freshfarm_db
- `JWT_SECRET`: freshfarm-jwt-secret-2024
- `PORT`: 5001

## Starting the Server

### Using npm start:

```bash
npm start
```

### Expected Output:
```
FreshFarm server running on port 5001
MySQL connection pool created
```

## Accessing the Application

Once the server is running, open your web browser and navigate to:

**http://localhost:5001**

You should see the FreshFarm Grocery homepage with:
- Hero section with promotional banner
- Product catalog with organic groceries
- Shopping cart functionality
- User authentication (login/register)

### Key Features Available:
- **Browse Products**: View all available groceries by category
- **Filter by Category**: Browse products organized by category
- **Search Functionality**: Search for products by name or description
- **Shopping Cart**: Add items to cart and manage quantities
- **User Registration**: Create a new account
- **Login/Logout**: Secure JWT-based authentication with cookies
- **View User Profile**: Access your account information
- **Order History**: View past orders (after logging in)
- **Checkout**: Place orders for delivery

## Troubleshooting

### Issue 1: MySQL Connection Error
**Error:** `Access denied for user 'root'@'localhost'` or `ER_ACCESS_DENIED_ERROR`

**Solutions:**
1. Check if MySQL server is running
2. Verify username and password in `.env` file or server.js
3. Ensure MySQL user has proper privileges:
   ```sql
   GRANT ALL PRIVILEGES ON freshfarm_db.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```
4. Try connecting with `mysql -u root -p` first to test credentials

### Issue 2: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5001`

**Solution:**
1. Find process using port 5001:
   ```bash
   # Windows
   netstat -ano | findstr :5001
   # macOS/Linux
   lsof -i :5001
   ```
2. Kill the process or change the port in `.env`:
   ```env
   PORT=5002
   ```

### Issue 3: Database Not Created
**Symptom:** Application starts but shows database errors

**Solutions:**
1. Manually create the database:
   ```sql
   CREATE DATABASE freshfarm_db;
   ```
2. Re-run the schema file
3. Verify the database exists:
   ```sql
   SHOW DATABASES;
   USE freshfarm_db;
   SHOW TABLES;
   ```

### Issue 4: Missing Dependencies
**Error:** `Cannot find module 'express'` or similar

**Solution:**
```bash
npm install
```

### Issue 5: CORS Errors in Browser
**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
1. This is likely a development environment issue
2. The server already allows cors with credentials
3. Ensure you're accessing from localhost:5001
4. Check browser console for specific error details

### Issue 6: Password Hash Verification Failed
**Error:** `Invalid credentials` (even with correct credentials)

**Solutions:**
1. Re-register your account - old password hashes may be incompatible
2. Ensure you're not using a shared MySQL server with existing test data
3. Check that bcrypt is properly installed: `npm install bcrypt`

### Issue 7: Cart/Order Authentication Errors
**Error:** `Not authenticated` when trying to access cart or orders

**Solution:**
1. Ensure you're logged in before accessing protected routes
2. Check that cookies are enabled in your browser
3. Clear browser cookies and try logging in again

### Issue 8: Insufficient Stock
**Error:** `Insufficient stock` when adding items to cart

**Solution:**
1. The product stock may be depleted
2. Try adding a smaller quantity
3. Contact administrator if this is a persistent issue

## Directory Structure

```
freshfarm-grocery/
├── server.js              # Main Node.js application
├── package.json           # Node.js dependencies and scripts
├── .env                   # Environment variables (optional)
├── database/
│   └── schema.sql         # MySQL database schema
├── templates/
│   └── index.html         # Main HTML template
├── static/
│   ├── css/
│   │   └── styles.css     # Custom styles
│   └── js/
│       └── app.js         # Frontend JavaScript
└── SETUP.md              # This file
```

## Security Notes

⚠️ **IMPORTANT:** This setup is for local development only.

- Never use default secrets in production
- Always use HTTPS in production
- Set strong passwords for MySQL
- Update default JWT_SECRET in production
- Use environment variables for production credentials
- Never commit `.env` file with secrets to version control

## Getting Help

1. Check the troubleshooting section above
2. Review error messages in the terminal
3. Check browser console for frontend errors
4. Verify MySQL connection separately with `mysql -u root -p`
5. Ensure all prerequisites are met before seeking help

## Quick Start Checklist

- [ ] Node.js 20+ installed
- [ ] MySQL 8+ installed and running
- [ ] Project files downloaded
- [ ] Navigate to project folder
- [ ] Install dependencies (`npm install`)
- [ ] Import database schema from `database/schema.sql`
- [ ] Configure `.env` file (optional)
- [ ] Start server (`npm start`)
- [ ] Application accessible at http://localhost:5001

---

**Happy Coding! 🥦 🍎 🥕**

FreshFarm Grocery - Bringing farm-fresh groceries to your doorstep
