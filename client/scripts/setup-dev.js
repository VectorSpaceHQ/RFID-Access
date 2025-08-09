import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Create directories if they don't exist
const dirs = ['public/js/lib', 'public/styles', 'public/fonts', 'public/views'];

dirs.forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// Copy library files
const libFiles = [
  ['node_modules/angular/angular.min.js', 'public/js/lib/angular.min.js'],
  [
    'node_modules/angular-route/angular-route.min.js',
    'public/js/lib/angular-route.min.js',
  ],
  [
    'node_modules/angular-resource/angular-resource.min.js',
    'public/js/lib/angular-resource.min.js',
  ],
  [
    'node_modules/angular-toastr/dist/angular-toastr.tpls.min.js',
    'public/js/lib/angular-toastr.tpls.min.js',
  ],
  [
    'node_modules/angular-file-saver/dist/angular-file-saver.bundle.min.js',
    'public/js/lib/angular-file-saver.bundle.min.js',
  ],
  ['node_modules/ngstorage/ngStorage.min.js', 'public/js/lib/ngStorage.min.js'],
  [
    'node_modules/bootstrap/dist/css/bootstrap.min.css',
    'public/styles/bootstrap.min.css',
  ],
  [
    'node_modules/angular-toastr/dist/angular-toastr.min.css',
    'public/styles/angular-toastr.min.css',
  ],
];

libFiles.forEach(([src, dest]) => {
  try {
    copyFileSync(src, dest);
    console.log(`✓ Copied ${src} to ${dest}`);
  } catch (err) {
    console.error(`✗ Failed to copy ${src}: ${err.message}`);
  }
});

// Copy fonts
try {
  const { execSync } = await import('child_process');
  execSync('cp -r node_modules/bootstrap/fonts/* public/fonts/', {
    stdio: 'inherit',
  });
  console.log('✓ Copied fonts');
} catch (err) {
  console.error('✗ Failed to copy fonts:', err.message);
}

// Copy views
try {
  const { execSync } = await import('child_process');
  execSync('cp -r src/views/* public/views/', { stdio: 'inherit' });
  console.log('✓ Copied views');
} catch (err) {
  console.error('✗ Failed to copy views:', err.message);
}

console.log('Development setup complete!');
