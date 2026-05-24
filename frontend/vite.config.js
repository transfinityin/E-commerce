import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',        // 🔥 Auto update on new deploy
      workbox: {
        cleanupOutdatedCaches: true,     // 🔥 Purana cache clean
        skipWaiting: true,
      }
    })
  ],
  server: {
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
})