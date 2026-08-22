import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.VITE_API_BASE || ''
  const isDev   = mode === 'development'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // Dev proxy: only active when VITE_API_BASE is /api (local dev)
      proxy: isDev && apiBase === '/api' ? {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      } : {},
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  }
})
