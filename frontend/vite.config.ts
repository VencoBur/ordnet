import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['ordnet-logo.png'],
      manifest: {
        name: 'OrdNET - Universal Browser',
        short_name: 'OrdNET',
        description: 'Web2 + Web3 unified interface with Litecoin Ordinal shards on LitVM',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        icons: [
          {
            src: '/ordnet-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/liteforge\.rpc\.caldera\.xyz\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'litvm-rpc-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000
  }
});
