import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

const __dirname = path.resolve()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: path.join(__dirname, 'index.html'),
        admin: path.join(__dirname, 'admin.html'),
      },
    },
    outDir: './template',
    emptyOutDir: true, // also necessary
  },
})
