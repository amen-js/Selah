import { serve } from '@hono/node-server'

import { createApp } from './app.ts'
import { loadEnv } from './env.ts'

const env = loadEnv()
const app = createApp({ env })

serve({
  fetch: app.fetch,
  hostname: env.host,
  port: env.port,
})

console.log(`Selah API proxy listening on http://${env.host}:${env.port}`)
