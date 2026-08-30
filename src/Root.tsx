import { lazy, Suspense } from 'react'

import App from './App'
import { useDocumentLanguage } from './i18n'

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
  const { t } = useDocumentLanguage()
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'

  if (isDev && normalizedPath === '/lab' && LabPage) {
    return (
      <Suspense fallback={<p role="status">{t('root.loadingLab')}</p>}>
        <LabPage />
      </Suspense>
    )
  }

  return <App />
}
