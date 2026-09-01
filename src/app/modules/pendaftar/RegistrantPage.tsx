import {lazy, Suspense} from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'
import TopBarProgress from 'react-topbar-progress-indicator'
import {PageTitle} from '../../../_metronic/layout/core'
import RegistrantHome from './RegistrantHome'

const RegistrantStatus = lazy(() => import('./RegistrantStatus'))

/**
 * Dashboard Pendaftar Vendor (role "Pendaftar Vendor").
 * Menu terbatas: Home & Status saja - TIDAK ada akses fitur vendor aktif
 * (order, work order, dll). Guard ada di PrivateRoutes (role 'Pendaftar Vendor'
 * hanya dialokasikan ke route ini) dan di backend (role-check manual per endpoint).
 */
const RegistrantPage = () => {
  return (
    <Routes>
      <Route
        index
        element={
          <>
            <PageTitle>Pendaftar Vendor</PageTitle>
            <RegistrantHome />
          </>
        }
      />
      <Route
        path='home'
        element={
          <>
            <PageTitle>Pendaftar Vendor</PageTitle>
            <RegistrantHome />
          </>
        }
      />
      <Route
        path='status'
        element={
          <>
            <PageTitle>Status Pendaftaran Vendor</PageTitle>
            <Suspense fallback={<TopBarProgress />}>
              <RegistrantStatus />
            </Suspense>
          </>
        }
      />
      <Route path='*' element={<Navigate to='/pendaftar/home' replace />} />
    </Routes>
  )
}

export default RegistrantPage
