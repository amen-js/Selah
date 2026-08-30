import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const nodeMajor = Number(process.versions.node.split('.')[0] ?? '0')

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    execArgv:
      nodeMajor >= 25
        ? ['--localstorage-file=node_modules/.tmp/selah-localstorage.json']
        : [],
  },
})
