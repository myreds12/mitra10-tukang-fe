import {useEffect} from 'react'
import {Outlet, useLocation} from 'react-router-dom'
import {AsideDefault} from './components/aside/AsideDefault'
import {HeaderWrapper} from './components/header/HeaderWrapper'
import {ScrollTop} from './components/ScrollTop'
import {Content} from './components/Content'
import {PageDataProvider} from './core'
import {ThemeModeProvider} from '../partials'
import {MenuComponent} from '../assets/ts/components'
import LiveChatPopup from '../../app/modules/livechat/LiveChatPopup'
import {useRegistrantIdleLogout} from '../../app/hooks/useRegistrantIdleLogout'

const MasterLayout = () => {
  const location = useLocation()

  // Inactivity timeout 1 jam khusus role Pendaftar Vendor
  useRegistrantIdleLogout()

  const isPendaftar =
    location.pathname.startsWith('/pendaftar') ||
    localStorage.getItem('userRole') === 'Pendaftar Vendor'

  useEffect(() => {
    if (isPendaftar) {
      document.body.classList.remove('aside-enabled', 'aside-fixed')
      document.body.classList.add('no-aside')
    } else {
      document.body.classList.add('aside-enabled', 'aside-fixed')
      document.body.classList.remove('no-aside')
    }
    return () => {
      document.body.classList.remove('no-aside')
    }
  }, [isPendaftar])

  useEffect(() => {
    setTimeout(() => {
      MenuComponent.reinitialization()
    }, 500)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      MenuComponent.reinitialization()
    }, 500)
  }, [location.key])

  return (
    <PageDataProvider>
      <ThemeModeProvider>
        <div className={`page d-flex flex-row flex-column-fluid ${isPendaftar ? 'pendaftar-layout' : ''}`}>
          {!isPendaftar && <AsideDefault />}
          <div
            className='wrapper d-flex flex-column flex-row-fluid'
            id='kt_wrapper'
            style={isPendaftar ? {paddingLeft: 0} : undefined}
          >
            <HeaderWrapper className='bg-primary' />

            <div
              id='kt_content'
              className='content d-flex flex-column flex-column-fluid'
              style={{marginTop: '-3.5rem'}}
            >
              <Content>
                <Outlet />
              </Content>
            </div>
          </div>
        </div>

        {/* ✅ LiveChatPopup di luar semua container — position:fixed bisa bebas */}
        <LiveChatPopup />

        <ScrollTop />
      </ThemeModeProvider>
    </PageDataProvider>
  )
}

export {MasterLayout}
