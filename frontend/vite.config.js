import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    // In dev, proxy API calls to the backend so the app stays same-origin.
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'router';
            if (id.includes('@tanstack')) return 'query';
            // Markdown ecosystem — only used by the module About modal, so keep
            // it in its own chunk that loads lazily with the module detail route.
            if (
              /[\\/]node_modules[\\/](react-markdown|remark|micromark|mdast|unist|hast|vfile|unified|bail|trough|devlop|character-entities|decode-named|property-information|[a-z-]*-separated-tokens|html-url-attributes|longest-streak|markdown-table|zwitch|ccount|escape-string-regexp|estree)/.test(
                id
              )
            ) {
              return 'markdown';
            }
            return 'vendor';
          }
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
