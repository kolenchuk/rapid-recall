import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/rapid-recall/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'RapidRecall',
        short_name: 'RapidRecall',
        display: 'standalone',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        start_url: '/rapid-recall/',
        scope: '/rapid-recall/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        navigateFallback: '/rapid-recall/index.html',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    pool: 'threads',
  },
})
