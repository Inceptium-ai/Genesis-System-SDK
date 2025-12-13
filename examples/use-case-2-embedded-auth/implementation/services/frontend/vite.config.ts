import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/auth': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        // Only proxy API requests, not page navigations
        // This lets React Router handle /auth page while
        // SuperTokens API calls still go to backend
        bypass: (req) => {
          // If browser is requesting HTML (page navigation), 
          // don't proxy - let Vite/React Router handle it
          if (req.headers.accept?.includes('text/html')) {
            return req.url
          }
          // Otherwise, proxy to backend (API calls)
          return undefined
        }
      },
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true
      }
    }
  }
})
