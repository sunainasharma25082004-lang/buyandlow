import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function spaFallbackPlugin() {
  return {
    name: 'spa-fallback',
    closeBundle() {
      const index = resolve(__dirname, 'dist/index.html');
      copyFileSync(index, resolve(__dirname, 'dist/404.html'));
    },
  };
}

export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});