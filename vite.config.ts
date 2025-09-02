import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || ''
const isCI = !!process.env.GITHUB_ACTIONS
const base = isCI && repo ? `/${repo}/` : '/'

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  }
})
