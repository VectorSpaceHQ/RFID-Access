# RFID Access Server

This is the backend server for the RFID Access Control System.

## Development Setup

### Quick Start

**Linux/Mac:**

```bash
cd server
./dev_start.sh
```

**Windows:**

```cmd
cd server
dev_start.bat
```

### Manual Setup

1. **Install Python dependencies:**

   ```bash
   cd server
   pip install -r requirements.txt
   ```

2. **Install Angular CLI:**

   ```bash
   npm install -g @angular/cli
   ```

3. **Install client dependencies:**

   ```bash
   cd ../client
   npm install
   ```

4. **Start Angular dev server:**

   ```bash
   cd ../client
   ng serve --port 4200 --host 0.0.0.0
   ```

5. **Start Flask server:**

   ```bash
   cd ../server
   python run.py debug
   ```

6. **Seed the database:**
   ```bash
   python dev_seed.py
   ```

## Access URLs

- **Main Application:** http://localhost:8443 (serves Angular + API)
- **Angular Dev Server:** http://localhost:4200 (hot reload)
- **Flask API:** http://localhost:8443/api

## Features

✅ **Hot reload** for both frontend and backend  
✅ **Single URL** for the entire application  
✅ **CORS enabled** for development  
✅ **Automatic seeding** with test data  
✅ **Cross-platform** scripts

## Architecture

The Flask server acts as a reverse proxy during development:

- **API routes** (`/api/*`, `/auth`, `/unlock`) → Handled by Flask
- **Frontend routes** → Proxied to Angular dev server (localhost:4200)

This provides a seamless development experience with hot reload while maintaining a single URL for the application.
