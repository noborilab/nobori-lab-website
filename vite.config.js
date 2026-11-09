import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { structuredDataPlugin } from './scripts/structured-data.js'
import { cvPdfPlugin } from './scripts/cv-pdf.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), structuredDataPlugin(), cvPdfPlugin()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        // React and framer-motion change rarely; in their own file they stay
        // cached across the frequent content-only deploys.
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler|framer-motion|motion-dom|motion-utils)\//.test(id)) {
            return 'vendor'
          }
        },
      },
    },
  },
})
