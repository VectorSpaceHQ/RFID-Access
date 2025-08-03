# Vector Space RFID Access Client

A modern Angular 20 application for managing RFID access control systems.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The development server will start on `http://localhost:4200` with hot reload enabled.

## 📋 Available Commands

```bash
# Start development server
npm start

# Build for production
npm run build
```

## 🏗️ Project Structure

```
├── src/                          # Source files
│   ├── app/                     # Angular application
│   │   ├── components/          # Angular components
│   │   │   ├── login/          # Login component
│   │   │   ├── home/           # Home component
│   │   │   ├── users/          # Users management
│   │   │   ├── resources/      # Resources management
│   │   │   ├── cards/          # Cards management
│   │   │   └── logs/           # Logs viewing
│   │   ├── services/           # Angular services
│   │   ├── guards/             # Route guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   ├── app.component.ts    # Root component
│   │   ├── app.config.ts       # App configuration
│   │   └── app.routes.ts       # Application routes
│   ├── index.html              # Main HTML file
│   ├── main.ts                 # Application entry point
│   └── styles.css              # Global styles
├── angular.json                 # Angular CLI configuration
├── package.json                 # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## 🎯 Key Features

✅ **Modern Angular 20**: Latest Angular framework with standalone components  
✅ **TypeScript**: Full type safety and better developer experience  
✅ **Bootstrap Styling**: Responsive UI with Bootstrap CSS  
✅ **Route Guards**: Protected routes requiring authentication  
✅ **HTTP Interceptors**: Automatic authentication headers  
✅ **Reactive Forms**: Modern form handling with validation  
✅ **Material Design**: Angular Material components for notifications  
✅ **Hot Reload**: Instant updates during development

## 🔧 Technology Stack

- **Framework**: Angular 20
- **Language**: TypeScript
- **Styling**: Bootstrap CSS
- **Build Tool**: Angular CLI
- **Testing**: Karma + Jasmine
- **Package Manager**: npm

## 🚀 Development

### Prerequisites

- Node.js 18+ (recommended: Node.js 22)
- npm 9+

### Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd client
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## 🏭 Production Build

```bash
# Build for production
npm run build

# The build artifacts will be stored in the `dist/` directory
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run e2e
```

## 📦 Dependencies

### Core Dependencies

- `@angular/core`: Angular core framework
- `@angular/common`: Common Angular modules
- `@angular/router`: Client-side routing
- `@angular/forms`: Form handling
- `@angular/material`: Material Design components
- `bootstrap`: CSS framework
- `rxjs`: Reactive programming library

### Development Dependencies

- `@angular/cli`: Angular command line interface
- `@angular-devkit/build-angular`: Angular build tools
- `typescript`: TypeScript compiler
- `karma`: Test runner
- `jasmine`: Testing framework

## 🔐 Authentication

The application uses HTTP Basic Authentication with automatic token management:

- Login credentials are stored in session storage
- HTTP interceptor automatically adds authentication headers
- Route guards protect authenticated routes
- Automatic logout on session expiration

## 🎨 Styling

The application uses Bootstrap for responsive design:

- Bootstrap CSS for layout and components
- Angular Material for notifications and dialogs
- Custom CSS for application-specific styling
- Responsive design for mobile and desktop

## 🚨 Troubleshooting

### Common Issues

1. **Port 4200 already in use**

   ```bash
   # Kill the process using the port
   npx kill-port 4200
   # Then restart
   npm start
   ```

2. **TypeScript compilation errors**

   ```bash
   # Clear Angular cache
   rm -rf .angular/cache
   # Restart development server
   npm start
   ```

3. **Dependency issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

### Node.js Version

This project works best with Node.js 18+ and is tested with Node.js 22. If you encounter issues, try updating your Node.js version:

```bash
# Using nvm (Node Version Manager)
nvm install 22
nvm use 22
```

## 📝 Migration Notes

This project was migrated from AngularJS 1.5 to Angular 20:

- **Architecture**: AngularJS controllers → Angular components
- **Routing**: `$routeProvider` → Angular Router
- **HTTP**: `$http` → Angular HttpClient
- **Forms**: Template-driven → Reactive forms
- **Build**: Custom build → Angular CLI
- **Styling**: Manual CSS includes → Angular build system

## 📄 License

This project is part of the Vector Space RFID Access system.
