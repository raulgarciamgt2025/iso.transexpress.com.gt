import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    // Optimize bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Core dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          ui: ['react-bootstrap', 'antd', 'primereact'],
          // Charts and visualization
          charts: ['apexcharts', 'react-apexcharts', 'chart.js'],
          // Form libraries
          forms: ['react-hook-form', '@hookform/resolvers', 'yup'],
          // Utility libraries
          utils: ['axios', 'dayjs', 'crypto-js', 'clsx'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging
    sourcemap: true,
  },
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
  // Preview server configuration
  preview: {
    port: 4173,
    open: true,
  },
})
