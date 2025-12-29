import path, { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
      target: 'react',
    }),
    viteReact(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (pathInput) => pathInput.replace(/^\/api/, ''), // Rewrites the path by removing '/api'
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@habit-tracker/validation-schemas': resolve(
        __dirname,
        '../../packages/validation-schemas/src',
      ),
      '@habit-tracker/validation-schemas/*': resolve(
        __dirname,
        '../../packages/validation-schemas/src/*',
      ),
    },
  },
})
