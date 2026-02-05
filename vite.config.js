import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/SPA/',
  server: {
    proxy: {
      '/api': {
        target: 'https://script.google.com/macros/s/AKfycbzijHcy9531MASML6qEpaYr24eHFsZN2lKTuvtYhRgnXQEtChzMTF7fJdotjoa3Dqj8iw/exec',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
