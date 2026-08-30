import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['selah.wtitec.com', 'api-selah.wtitec.com'],
    proxy: {
      '/api': 'http://localhost:8787',
      '/health': 'http://localhost:8787',
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['selah.wtitec.com', 'api-selah.wtitec.com'],
  },
})
