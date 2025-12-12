import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    port: 3004,
    open: true,
    host: true,
    proxy: {
      // Rutas de Neon se manejan localmente (no hacer proxy)
      '/api/neon': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Rutas de Stripe se manejan localmente (no hacer proxy)
      '/api/stripe': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Otras rutas de API van a GPTMaker
      '/api': {
        target: 'https://api.gptmaker.ai',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  css: {
    devSourcemap: true
  },
  optimizeDeps: {
    include: ['chart.js']
  }
})
