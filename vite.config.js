import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { structuredDataPlugin } from './scripts/structured-data.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), structuredDataPlugin()],
  base: '/',
})
