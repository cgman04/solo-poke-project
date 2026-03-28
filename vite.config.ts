import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    // Allow OBS browser source to connect
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
})
