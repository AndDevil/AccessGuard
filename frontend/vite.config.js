import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow container exposure
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:5000', // Connects to the Express backend container service in Docker
        changeOrigin: true,
        secure: false,
      },
      '/api-docs': {
        target: 'http://backend:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
