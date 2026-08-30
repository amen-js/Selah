import App from './App'
import { LabPage } from './lab/LabPage'

interface RootProps {
  pathname?: string
  isDev?: boolean
}

export function Root({
  pathname = window.location.pathname,
  isDev = import.meta.env.DEV,
}: RootProps) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'

  if (isDev && normalizedPath === '/lab') return <LabPage />
  return <App />
}
