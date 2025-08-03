import { defineConfig } from 'vite';
import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
      },
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return 'styles/[name].[ext]';
          }
          if (/\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name)) {
            return 'fonts/[name].[ext]';
          }
          return 'assets/[name].[ext]';
        },
      },
    },
  },
  plugins: [
    createHtmlPlugin({
      minify: false,
      template: 'index.html',
    }),
  ],
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  preview: {
    port: 3000,
    open: true,
  },
});
