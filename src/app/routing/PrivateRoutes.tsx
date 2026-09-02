import {lazy, FC, Suspense} from 'react'
import {Route, Routes, Navigate} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import {DashboardWrapper} from '../pages/dashboard/DashboardWrapper'
import {getCSSVariableValue} from '../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../_metronic/helpers'
import {PageLink, PageTitle} from '../../../src/_metronic/layout/core'
import VendorRegistrationPage from '../modules/vendor-registration/VendorRegistrationPage'
const chatBreadCrumbs: Array<PageLink> = [
  {
    title: 'Chat',
    path: '/chat/view-chat',
    isSeparator: false,
    isActive: false,
  },
]
const PrivateRoutes = () => {
  const isVendorSpEnabled = process.env.REACT_APP_ENABLE_VENDOR_SP === 'true'
  const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'))
  const ChatPage = lazy(() => import('../modules/chat/ChatPage'))
const HomeContentSettingsPage = lazy(() => import('../components/admin-ho/home-content/HomeContentSettings'))
  const CalendarPage = lazy(() => import('../modules/calendar/CalendarPage'))
  const OrderPage = lazy(() => import('../modules/order/OrderPage'))
  const ComplaintPage = lazy(() => import('../modules/complaint/ComplaintPage'))
  const ReschedulePage = lazy(() => import('../modules/reschedule/ReschedulePage'))
  const WarrantyPage = lazy(() => import('../modules/warranty/WarrantyPage'))
  const ReportPage = lazy(() => import('../modules/reports/ReportPage'))
  const CostumersPage = lazy(() => import('../modules/customers/CostumersPage'))
  const CSIpage = lazy(() => import('../modules/csi/CSIpage'))
  const VendorPage = lazy(() => import('../modules/vendor/VendorPage'))
  const WorkOrderPage = lazy(() => import('../modules/work-order/WorkOrderPage'))
  const QuotationPage = lazy(() => import('../modules/quotation/QuotationPage'))
  const PaymentPage = lazy(() => import('../modules/payment/PaymentPage'))
  const SalesPage = lazy(() => import('../modules/sales/SalesPage'))
  const ManagerPage = lazy(() => import('../modules/manager/ManagerPage'))
  const InvoicePage = lazy(() => import('../modules/invoice/InvoicePage'))
  const RefundPage = lazy(() => import('../modules/refund/RefundPage'))
  const TukangPage = lazy(() => import('../modules/tukang/TukangPage'))
  const MaterialPage = lazy(() => import('../modules/material/MaterialPage'))
  const ItemPage = lazy(() => import('../modules/item/ItemPage'))
  const StorePage = lazy(() => import('../modules/stores/StorePage'))
  const BankPage = lazy(() => import('../modules/banks/BankPage'))
  const FormatEmailPage = lazy(() => import('../modules/format-email/FormatEmailPage'))
  const UserManagementPage = lazy(() => import('../modules/user-management/UserManagement'))
  const EmployeePage = lazy(() => import('../modules/employee/EmployeePage'))
  const IncentiveSales = lazy(() => import('../modules/incentive_sales/IncentiveSalesPage'))
  const IncentiveManager = lazy(() => import('../modules/incentive_manager/IncentiveManagerPage'))
  const ManualBook = lazy(() => import('../modules/manual-book/ManualBookPage'))
  const PromotionQuotation = lazy(
    () => import('../modules/promotion_quotation/PromotionQuotationPage')
  )
  const DataMasterPage = lazy(() => import('../modules/data-master/DataMasterPage'))

  const DataRolePage = lazy(() => import('../modules/data-role/DataMasterPage'))
  const NotifSettingPage = lazy(() => import('../modules/notif-setting/NotifSettingPage'))
  const VendorSPPage = lazy(() => import('../modules/vendor-sp/VendorSPPage'))
  const RegistrantPage = lazy(() => import('../modules/pendaftar/RegistrantPage'))
  const isRegistrant = localStorage.getItem('userRole') === 'Pendaftar Vendor'

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Redirect to Home after success Login */}
        {/* <Route path='login' element={<Navigate to='/home' />} /> */}
        {/* Pages */}
        {/* Dashboard Pendaftar Vendor (Home & Status saja) */}
        <Route
          path='pendaftar/*'
          element={
            <SuspensedView>
              <RegistrantPage />
            </SuspensedView>
          }
        />

        {/* Route guard: user "Pendaftar Vendor" hanya boleh ke dashboard pendaftar.
            Semua route lain (home, order, work order, vendor, dll - fitur vendor
            aktif & internal) di-redirect ke /pendaftar/home. */}
        {isRegistrant && <Route path='*' element={<Navigate to='/pendaftar/home' replace />} />}

        <Route path='home' element={<DashboardWrapper />} />

        {/* Lazy Modules */}
        <Route
          path='notif-setting/*'
          element={
            <SuspensedView>
              <NotifSettingPage />
            </SuspensedView>
          }
        />

        <Route
          path='calendar/*'
          element={
            <SuspensedView>
              <CalendarPage />
            </SuspensedView>
          }
        />

        <Route
          path='order/*'
          element={
            <SuspensedView>
              <OrderPage />
            </SuspensedView>
          }
        />

        <Route
          path='costumers/*'
          element={
            <SuspensedView>
              <CostumersPage />
            </SuspensedView>
          }
        />

        <Route
          path='work-order/*'
          element={
            <SuspensedView>
              <WorkOrderPage />
            </SuspensedView>
          }
        />

        <Route
          path='tukang/*'
          element={
            <SuspensedView>
              <TukangPage />
            </SuspensedView>
          }
        />

        <Route
          path='complaint/*'
          element={
            <SuspensedView>
              <ComplaintPage />
            </SuspensedView>
          }
        />

        <Route
          path='reschedule/*'
          element={
            <SuspensedView>
              <ReschedulePage />
            </SuspensedView>
          }
        />

        <Route
          path='warranty/*'
          element={
            <SuspensedView>
              <WarrantyPage />
            </SuspensedView>
          }
        />

        <Route
          path='material/*'
          element={
            <SuspensedView>
              <MaterialPage />
            </SuspensedView>
          }
        />

        <Route
          path='item/*'
          element={
            <SuspensedView>
              <ItemPage />
            </SuspensedView>
          }
        />

        <Route
          path='store/*'
          element={
            <SuspensedView>
              <StorePage />
            </SuspensedView>
          }
        />

        <Route
          path='bank/*'
          element={
            <SuspensedView>
              <BankPage />
            </SuspensedView>
          }
        />

        <Route
          path='reports/*'
          element={
            <SuspensedView>
              <ReportPage />
            </SuspensedView>
          }
        />

        <Route
          path='csi/*'
          element={
            <SuspensedView>
              <CSIpage />
            </SuspensedView>
          }
        />

        <Route
          path='email/*'
          element={
            <SuspensedView>
              <FormatEmailPage />
            </SuspensedView>
          }
        />

        <Route
          path='home-content-settings'
          element={
            <SuspensedView>
              <HomeContentSettingsPage />
            </SuspensedView>
          }
        />

        <Route
          path='user/*'
          element={
            <SuspensedView>
              <UserManagementPage />
            </SuspensedView>
          }
        />

        <Route
          path='vendor/*'
          element={
            <SuspensedView>
              <VendorPage />
            </SuspensedView>
          }
        />

        {isVendorSpEnabled && (
          <Route
            path='vendor-sp/*'
            element={
              <SuspensedView>
                <VendorSPPage />
              </SuspensedView>
            }
          />
        )}

        <Route
          path='vendor-registration/*'
          element={
            <SuspensedView>
              <VendorRegistrationPage />
            </SuspensedView>
          }
        />

        <Route
          path='quotation/*'
          element={
            <SuspensedView>
              <QuotationPage />
            </SuspensedView>
          }
        />

        <Route
          path='payment/*'
          element={
            <SuspensedView>
              <PaymentPage />
            </SuspensedView>
          }
        />

        <Route
          path='employee/*'
          element={
            <SuspensedView>
              <EmployeePage />
            </SuspensedView>
          }
        />

        <Route
          path='sales/*'
          element={
            <SuspensedView>
              <SalesPage />
            </SuspensedView>
          }
        />
         <Route
          path='manager/*'
          element={
            <SuspensedView>
              <ManagerPage />
            </SuspensedView>
          }
        />

        <Route
          path='invoice/*'
          element={
            <SuspensedView>
              <InvoicePage />
            </SuspensedView>
          }
        />

        <Route
          path='refund/*'
          element={
            <SuspensedView>
              <RefundPage />
            </SuspensedView>
          }
        />

        <Route
          path='incentive-sales/*'
          element={
            <SuspensedView>
              <IncentiveSales />
            </SuspensedView>
          }
        />
        <Route
          path='incentive-manager/*'
          element={
            <SuspensedView>
              <IncentiveManager />
            </SuspensedView>
          }
        />
        <Route
          path='promotion-quotation/*'
          element={
            <SuspensedView>
              <PromotionQuotation />
            </SuspensedView>
          }
        />

        <Route
          path='request-discount-quotation/*'
          element={
            <SuspensedView>
              <PromotionQuotation />
            </SuspensedView>
          }
        />

        <Route
          path='profile/*'
          element={
            <SuspensedView>
              <ProfilePage />
            </SuspensedView>
          }
        />
        <Route
          path='data-master/*'
          element={
            <SuspensedView>
              <DataMasterPage />
            </SuspensedView>
          }
        />
        <Route
          path='data-role/*'
          element={
            <SuspensedView>
              <DataRolePage />
            </SuspensedView>
          }
        />

        <Route
          path='chat/*'
          element={
            <SuspensedView>
              <ChatPage />
            </SuspensedView>
          }
        />

        
      
      <Route
          path='manual-book'
          element={
            <SuspensedView>
              <PageTitle breadcrumbs={chatBreadCrumbs}>Manual Book</PageTitle>
              <ManualBook />
            </SuspensedView>
          }
        />
      
        {/* Page Not Found */}
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes>
  )
}

const SuspensedView: FC<WithChildren> = ({children}) => {
  const baseColor = getCSSVariableValue('--kt-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export {PrivateRoutes}
