import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// base = GitHub Pages project path /<repo>/; deploy `dist/` (gh-pages branch or Actions), not repo root.
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'gh-pages-spa-fallback',
      closeBundle() {
        const index = resolve(__dirname, 'dist/index.html')
        const notFound = resolve(__dirname, 'dist/404.html')
        if (existsSync(index)) copyFileSync(index, notFound)
      },
    },
  ],
  base: '/Cryptomatics/',
})
