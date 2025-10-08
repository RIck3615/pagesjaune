import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: '../backend/public',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  define: {
    // Forcer les URLs pour la production seulement
    ...(process.env.NODE_ENV === 'production' ? {
      'import.meta.env.VITE_API_URL': JSON.stringify('https://pagejaune.cd/api/v1'),
      'import.meta.env.VITE_STORAGE_URL': JSON.stringify('https://pagejaune.cd/public/storage')
    } : {})
  }
})