/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/app/modules/Auth/pages/AuthPage`, `src/app/BasePage`).
 */

import {FC} from 'react'
import {Routes, Route, BrowserRouter, Navigate} from 'react-router-dom'
import {PrivateRoutes} from './PrivateRoutes'
import {ErrorsPage} from '../modules/errors/ErrorsPage'
import {Login} from '../modules/login/Login'
import {ForgotPassword} from '../modules/forgot-password/forgot-password'
import {ResetPassword} from '../modules/reset-password/reset-password'
import {App} from '../App'
import {DetailOrderWithoutAuth} from '../pages/detail_order_without_auth/DetailOrderWithoutAuth'
import VendorRegisterPage from '../modules/vendor-registration/VendorRegisterPage'
import CreateUserPage from '../modules/create-user/CreateUserPage'

/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */
// const {PUBLIC_URL} = process.env

const AppRoutes: FC = () => {
  const username = localStorage.getItem('username')
  const userRole = localStorage.getItem('userRole')
  const accessToken = localStorage.getItem('accessToken')

  const navigateUrl = () => {
    switch (userRole) {
      case 'Finance':
        return '/invoice/view-invoice'
      case 'Payroll':
        return '/incentive-sales/list-request-incentive'
      // Pendaftar vendor: dashboard khusus (Home & Status saja)
      case 'Pendaftar Vendor':
        return '/pendaftar/home'
      default:
        return '/home'
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path='error/*' element={<ErrorsPage />} />
          <Route path='detail-order' element={<DetailOrderWithoutAuth />} />

          {!username || !userRole || !accessToken ? (
            <>
              <Route path='login' element={<Login />} />
              <Route path='forgot-password' element={<ForgotPassword />} />
              <Route path='reset-password' element={<ResetPassword />} />
              <Route path='vendor-register' element={<VendorRegisterPage />} />
              <Route path='create-user/:token' element={<CreateUserPage />} />

              {/* Redirect to Error Page */}
              <Route path='*' element={<Navigate to='/login' />} />
            </>
          ) : (
            <>
              <Route index element={<Navigate to={navigateUrl()} />} />
              <Route path='/*' element={<PrivateRoutes />} />
              <Route path='login' element={<Navigate to={navigateUrl()} />} />
            </>
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export {AppRoutes}
