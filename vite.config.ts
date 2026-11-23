import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// O "proxy" repassa as chamadas que começam com /api para a API Spring Boot.
// Assim o React (porta 5173) conversa com o back-end (porta 8080) sem erro de CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
