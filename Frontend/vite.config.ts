import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        // Service worker inject mode — works with HashRouter
        injectRegister: 'auto',
        workbox: {
          // Cache all static assets
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
          // Cache API responses (network first — fresh data priority)
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/cheema-milk-collection-commission-agent-lnil\.onrender\.com\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24, // 24 hours
                },
                networkTimeoutSeconds: 10,
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
          // Skip waiting — update immediately
          skipWaiting: true,
          clientsClaim: true,
        },
        manifest: {
          name: 'Cheema Milk Collection & Commission Agent',
          short_name: 'Cheema Milk',
          description: 'Cheema Milk Collection & Commission Management System',
          theme_color: '#064e3b',
          background_color: '#064e3b',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          id: 'cheema-milk-app',
          categories: ['business', 'finance'],
          icons: [
            {
              src: '/pwa-192x192.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        // Dev options — enable SW in development too
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-charts': ['recharts'],
            'vendor-pdf': ['jspdf', 'jspdf-autotable'],
            'vendor-motion': ['motion'],
            'services': [
              './src/services/api.ts',
              './src/services/offlineSync.ts',
              './src/services/ledgerSync.ts',
            ],
            'contexts': [
              './src/contexts/AuthContext.tsx',
              './src/contexts/UserContext.tsx',
              './src/contexts/VehicleContext.tsx',
              './src/contexts/RouteContext.tsx',
              './src/contexts/RouteCollectionContext.tsx',
              './src/contexts/MilkTransactionContext.tsx',
              './src/contexts/DispatchContext.tsx',
              './src/contexts/AdvanceContext.tsx',
              './src/contexts/AccountContext.tsx',
              './src/contexts/ThemeContext.tsx',
              './src/contexts/TransactionContext.tsx',
            ],
          },
        },
      },
    },
  };
});
