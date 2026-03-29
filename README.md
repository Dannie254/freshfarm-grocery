# FreshFarm Grocery

A cross-platform grocery store application with a modern, foodie, and farm-fresh aesthetic. Built with Flask, Bootstrap, and MySQL.

## Features

- Modern farm-fresh UI with floating icons and smooth animations
- Secure JWT authentication (tokens stored in HttpOnly cookies only)
- Product catalog with categories and search
- Shopping cart functionality
- Order management
- Responsive design for all devices

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript, Bootstrap 5
- **Backend:** Python, Flask
- **Database:** MySQL
- **Authentication:** JWT with HttpOnly cookies

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Setup MySQL database
mysql -u root -p < database/schema.sql

# Run the application
python app.py
```

Then open http://localhost:5000

## Deployment

See BUILD.md for detailed platform-specific deployment instructions for:
- Windows
- macOS
- Linux
- Android (Termux)

## Security

- JWT tokens are stored ONLY in HttpOnly cookies (never exposed to frontend JavaScript)
- Passwords hashed with bcrypt
- Backend-only token validation
- SQL injection prevention via parameterized queries

## License

MIT