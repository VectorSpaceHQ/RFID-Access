# Vector Space RFID Access Client

A modern AngularJS application with a streamlined development workflow.

## Modern Development Workflow

This project has been modernized to use Vite for fast development with hot reload.

### Quick Start

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev
```

The development server will:

- Start on `http://localhost:3000`
- Automatically open your browser
- Provide instant hot reload when files change
- Show detailed error messages in the browser

### Available Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Serve production build
npm run serve
```

### Key Features

✅ **Hot Reload**: Changes appear instantly in the browser  
✅ **Fast Build**: Vite provides extremely fast development builds  
✅ **Error Overlay**: Rich error messages displayed in browser  
✅ **Modern Tooling**: Uses latest web development standards  
✅ **No Configuration**: Zero config setup for development

### Project Structure

```
├── src/                    # Source files
│   ├── index.html         # Main HTML file
│   ├── js/               # JavaScript files
│   │   ├── index.js      # Main entry point
│   │   ├── app.js        # Angular app module
│   │   └── ...           # Other JS files
│   ├── styles/           # CSS files
│   └── views/            # HTML templates
├── public/               # Static assets served by Vite
│   ├── js/lib/          # Library files
│   ├── styles/          # CSS files
│   ├── fonts/           # Font files
│   └── views/           # HTML templates
├── dist/                # Production build output
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

### Development vs Production

- **Development**: Uses Vite dev server with hot reload
- **Production**: Builds optimized files to `dist/` directory

### Troubleshooting

If you encounter issues:

1. **Port conflicts**: The dev server uses port 3000 by default
2. **File not found**: Run `npm run setup` to copy required files
3. **Hot reload not working**: Check browser console for errors

### Migration from Old Setup

This project was migrated from:

- Gulp build system → Vite
- Custom Node.js server → Vite dev server
- Manual file watching → Automatic hot reload
- Complex build configuration → Zero config

The modern setup provides a much better development experience with faster builds and instant hot reload.
