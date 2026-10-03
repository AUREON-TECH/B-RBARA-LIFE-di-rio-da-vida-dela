import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/conexao-ela/',
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
})
