import {Suspense, useEffect} from 'react'
import {Outlet} from 'react-router-dom'
import {I18nProvider} from '../_metronic/i18n/i18nProvider'
import {LayoutProvider, LayoutSplashScreen} from '../_metronic/layout/core'
import {MasterInit} from '../_metronic/layout/MasterInit'
import {initYellowChat} from './utils/yellowMessenger'
import {YellowAiLauncher} from './components/YellowAiLauncher'

const App = () => {
  useEffect(() => {
    // Aktifkan customer service Yellow.ai di seluruh halaman aplikasi (termasuk login page)
    initYellowChat()
  }, [])

  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <I18nProvider>
        <LayoutProvider>
          <Outlet />
          <MasterInit />
          <YellowAiLauncher />
        </LayoutProvider>
      </I18nProvider>
    </Suspense>
  )
}

export {App}
