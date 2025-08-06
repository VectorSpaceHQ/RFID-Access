# RFID Access Server

This is the backend server for the RFID Access Control System.

## Development Setup

### Quick Start

**Linux/Mac:**

```bash
cd server
./dev_start.sh
```

**Windows**
Install a GitBash terminal, launch it, then use the same steps as Linux/Mac

## Access URLs

- **Main Application:** http://localhost:8443 (serves Angular + API)
- **Angular Dev Server:** http://localhost:4200 (hot reload)
- **Flask API:** http://localhost:8443/api

## Features

✅ **Hot reload** for both frontend and backend  
✅ **Automatic seeding** with dev data

## Dev Environment

- **Frontend routes** → Handled by Angular dev server (localhost:4200)
- **API routes** (`/api/*`, `/auth`, `/unlock`) → Proxied by the Angular api to the python server 8443 in development.

This provides a seamless development experience with hot reload while maintaining a single URL for the application.

## Production Build

- For production, build using `ng build`
- Then the Flask server will serve the pages as flat files. Note: The Angular server is not used in production.
