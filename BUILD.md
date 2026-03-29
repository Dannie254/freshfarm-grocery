# FreshFarm Grocery - Build & Deployment Guide

A cross-platform grocery store application with a modern, farm-fresh aesthetic.

## Prerequisites

- Python 3.8 or higher
- MySQL Server 8.0+

## Platform-Specific Setup

### Windows

1. **Install Python**
   - Download from https://www.python.org/downloads/
   - Or install from Microsoft Store (search "Python")

2. **Install MySQL**
   - Download MySQL Installer from https://dev.mysql.com/downloads/installer/
   - Run installer, choose "Full" installation
   - Set root password during setup

3. **Setup Database**
   - Open MySQL Workbench or Command Line
   - Create database: `CREATE DATABASE freshfarm_db;`
   - Or run the schema: `source database/schema.sql`

4. **Install Dependencies**
   ```cmd
   cd freshfarm-grocery
   pip install -r requirements.txt
   ```

5. **Run Application**
   ```cmd
   set DB_PASSWORD=your_mysql_password
   python app.py
   ```

6. **Access**
   - Open browser: http://localhost:5000

### macOS

1. **Install Python**
   ```bash
   # Using Homebrew (recommended)
   brew install python
   
   # Or download from python.org
   ```

2. **Install MySQL**
   ```bash
   brew install mysql
   brew services start mysql
   ```

3. **Setup Database**
   ```bash
   mysql -u root -p
   CREATE DATABASE freshfarm_db;
   ```

4. **Install Dependencies**
   ```bash
   cd freshfarm-grocery
   pip3 install -r requirements.txt
   ```

5. **Run Application**
   ```bash
   DB_PASSWORD=your_mysql_password python3 app.py
   ```

6. **Access**
   - Open browser: http://localhost:5000

### Linux (Ubuntu/Debian)

1. **Install Python and MySQL**
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip mysql-server
   sudo systemctl start mysql
   ```

2. **Setup Database**
   ```bash
   sudo mysql
   CREATE DATABASE freshfarm_db;
   ```

3. **Install Dependencies**
   ```bash
   cd freshfarm-grocery
   pip3 install -r requirements.txt
   ```

4. **Run Application**
   ```bash
   DB_PASSWORD=your_mysql_password python3 app.py
   ```

5. **Access**
   - Open browser: http://localhost:5000

### Android (Termux)

1. **Install Termux** from F-Droid or Play Store

2. **Install Python and MySQL**
   ```bash
   pkg install python mysql
   ```

3. **Setup Database**
   ```bash
   mysql_install_db
   mysqld_safe &
   sleep 5
   mysql -u root
   CREATE DATABASE freshfarm_db;
   ```

4. **Install Dependencies**
   ```bash
   cd freshfarm-grocery
   pip install -r requirements.txt
   ```

5. **Run Application**
   ```bash
   python app.py
   ```

6. **Access**
   - Open browser: http://localhost:5000

## Environment Variables

Create a `.env` file or set environment variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=freshfarm_db

# Security
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
```

## Production Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t freshfarm .
docker run -p 5000:5000 -e DB_HOST=host.docker.internal freshfarm
```

## Running Tests

```bash
# Manual testing
# 1. Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Get products
curl http://localhost:5000/api/products

# 4. Get categories
curl http://localhost:5000/api/categories
```

## Security Features

- JWT tokens stored ONLY in HttpOnly cookies (never in localStorage)
- Passwords hashed with bcrypt (12 salt rounds)
- Backend-only token validation
- CORS configured for specific origins

## Project Structure

```
freshfarm-grocery/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html    # Frontend HTML
├── static/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── database/
│   └── schema.sql    # Database schema
└── BUILD.md         # This file
```

## Troubleshooting

### Database Connection Error
- Check MySQL is running: `mysql -u root -p`
- Verify credentials in DB_CONFIG
- Create database if not exists

### Port Already in Use
- Kill existing process: `fuser -k 5000/tcp`
- Or run on different port: `python app.py` then edit to use port 5001

### CORS Error
- Ensure origin matches in CORS configuration
- Check browser console for details

## License

MIT License - See LICENSE file for details