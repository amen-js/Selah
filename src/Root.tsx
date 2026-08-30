import { lazy, Suspense } from 'react'

import App from './App'

const LabPage = import.meta.env.DEV
  ? lazy(() => import('./lab/LabPage').then((module) => ({ default: module.LabPage })))
  : null

interface RootProps {
  pathname?: string
  isDev?: boolean
}

export function Root({
  pathname = window.location.pathname,
  isDev = import.meta.env.DEV,
}: RootProps) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'

  if (isDev && normalizedPath === '/lab' && LabPage) {
    return (
      <Suspense fallback={<p role="status">Carregando laboratório…</p>}>
        <LabPage />
      </Suspense>
    )
  }

  return <App />
}
