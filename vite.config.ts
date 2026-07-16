import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Supabase remoto suele tener Site URL en localhost:3000
    port: 3000,
  },
})
