import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/health', (context) => context.json({ status: 'ok' }))

serve({
  fetch: app.fetch,
  port: 8787,
})

console.log('Selah API proxy listening on http://localhost:8787')
