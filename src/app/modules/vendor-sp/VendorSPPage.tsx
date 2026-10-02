import React from 'react'
import {Route, Routes} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'

import {HeaderWrapper} from '../../../_metronic/layout/components/header/HeaderWrapper'

import {ViewVendorSP} from './components/ViewVendorSP'
import {ViewVendorViolationType} from './components/ViewVendorViolationType'
import {ViewVendorViolationLog} from './components/ViewVendorViolationLog'
import {VendorReactivation} from './components/VendorReactivation'
import {VendorViolationRevisionRequests} from './components/VendorViolationRevisionRequests'
import {DetailVendorSP} from './components/DetailVendorSP'

const orderBreadCrumbs: Array<PageLink> = [
  {
    title: 'Vendor SP',
    path: '/vendor-sp/view',
    isSeparator: false,
    isActive: false,
  },
]

const VendorSPPage: React.FC = () => {
  const userRole = localStorage.getItem('userRole')

  return (
    <Routes>
      <Route
        path='view'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}
            <PageTitle breadcrumbs={orderBreadCrumbs}>
              DAFTAR SURAT PERINGATAN VENDOR
            </PageTitle>
            <ViewVendorSP />
          </>
        }
      />

      <Route
        path='detail/:id'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}
            <PageTitle breadcrumbs={orderBreadCrumbs}>
              DETAIL SURAT PERINGATAN VENDOR
            </PageTitle>
            <DetailVendorSP />
          </>
        }
      />

      <Route
        path='violation-type'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}
            <PageTitle breadcrumbs={orderBreadCrumbs}>
              JENIS PELANGGARAN VENDOR
            </PageTitle>
            <ViewVendorViolationType />
          </>
        }
      />

      <Route
        path='violation-log'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}
            <PageTitle breadcrumbs={orderBreadCrumbs}>
              LOG PELANGGARAN VENDOR
            </PageTitle>
            <ViewVendorViolationLog />
          </>
        }
      />

      <Route
        path='reactivation'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}
            <PageTitle breadcrumbs={orderBreadCrumbs}>
              REAKTIVASI VENDOR SP3
            </PageTitle>
            <VendorReactivation />
          </>
        }
      />

      <Route
        path='revision-request'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}
            <PageTitle breadcrumbs={orderBreadCrumbs}>
              APPROVAL REVISI / RESET POIN VENDOR
            </PageTitle>
            <VendorViolationRevisionRequests />
          </>
        }
      />
    </Routes>
  )
}

export default VendorSPPage
