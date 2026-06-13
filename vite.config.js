import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    visualizer({
      open: false,
      filename: 'bundle-analysis.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('chart.js')) return 'charts';
            if (id.includes('xlsx')) return 'xlsx';
            if (id.includes('primevue') || id.includes('@primeuix')) return 'primevue';
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('html2pdf.js')) return 'pdf-utils';
            if (id.includes('lucide-vue-next') || id.includes('@heroicons') || id.includes('@fortawesome')) return 'icons-vendor';
            return 'vendor';
          }
        }
      }
    }
  }
})

