import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    // Proxy solo en dev local; en prod VITE_API_URL apunta al backend de Railway
    proxy: process.env.VITE_API_URL ? {} : {
      '/api': { target: 'http://localhost:3000', changeOrigin: true }
    }
  }
});
