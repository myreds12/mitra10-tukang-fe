import {Suspense, useEffect} from 'react'
import {Outlet, useLocation} from 'react-router-dom'
import {I18nProvider} from '../_metronic/i18n/i18nProvider'
import {LayoutProvider, LayoutSplashScreen} from '../_metronic/layout/core'
import {MasterInit} from '../_metronic/layout/MasterInit'
import {hideYellowChat} from './utils/yellowMessenger'

const App = () => {
  const location = useLocation()

  useEffect(() => {
    // Sembunyikan live chat pada halaman auth publik saat belum login
    const publicAuthPaths = ['/login', '/forgot-password', '/reset-password', '/create-user']
    if (publicAuthPaths.some((p) => location.pathname.startsWith(p))) {
      hideYellowChat()
    }
  }, [location.pathname])

  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <I18nProvider>
        <LayoutProvider>
          <Outlet />
          <MasterInit />
        </LayoutProvider>
      </I18nProvider>
    </Suspense>
  )
}

export {App}
