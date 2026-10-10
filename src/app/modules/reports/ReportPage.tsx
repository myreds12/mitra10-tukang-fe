import React from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import {PageLink} from '../../../_metronic/layout/core'
import {renderMiscReportRoutes} from './routes/MiscReportRoutes'
import {renderStoreReportRoutes} from './routes/StoreReportRoutes'
import {renderHoReportRoutes} from './routes/HoReportRoutes'
import {renderVendorReportRoutes} from './routes/VendorReportRoutes'

const orderBreadCrumbs: Array<PageLink> = [
  {
    title: 'Reports',
    path: '/reports/view-report',
    isSeparator: false,
    isActive: false,
  },
]

const RefundPage: React.FC = () => {
  const userRole = localStorage.getItem('userRole')
  const isHo = userRole === 'Admin HO' || userRole === 'Super User'
  const isVendor = userRole === 'Admin Vendor' || userRole === 'Owner Vendor'

  return (
    <Routes>
      {renderMiscReportRoutes(orderBreadCrumbs, userRole, isHo)}
      {renderStoreReportRoutes(orderBreadCrumbs)}
      {renderHoReportRoutes(orderBreadCrumbs, isHo)}
      {renderVendorReportRoutes(orderBreadCrumbs, isVendor)}

      <Route index element={<Navigate to='/reports/view-report' />} />
    </Routes>
  )
}

export default RefundPage
