import React from 'react'
import {Route, Routes} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'

import {HeaderWrapper} from '../../../_metronic/layout/components/header/HeaderWrapper'

import {ViewVendorRegistration} from './components/ViewVendorRegistration'
import {VendorRegistrationApproval} from './components/VendorRegistrationApproval'
import {VendorRegistrationHistory} from './components/VendorRegistrationHistory'
import {ViewTermsAndConditions} from './components/TermsAndConditionsSetting'
import {UpdateTermsAndConditions} from './components/UpdateTermsAndConditions'

const orderBreadCrumbs: Array<PageLink> = [
  {
    title: 'Pendaftaran Vendor',
    path: '/vendor-registration/view',
    isSeparator: false,
    isActive: false,
  },
]

const termsBreadCrumbs: Array<PageLink> = [
  {
    title: 'Pendaftaran Vendor',
    path: '/vendor-registration/view',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'Setting T&C',
    path: '/vendor-registration/terms-setting/view',
    isSeparator: false,
    isActive: false,
  },
]

const VendorRegistrationPage: React.FC = () => {
  const userRole = localStorage.getItem('userRole')

  return (
    <Routes>
      <Route
        index
        element={<ViewVendorRegistration />}
      />
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
              DAFTAR PENDAFTARAN VENDOR
            </PageTitle>
            <ViewVendorRegistration />
          </>
        }
      />

      <Route
        path='approval/:id'
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
              APPROVAL PENDAFTARAN VENDOR
            </PageTitle>
            <VendorRegistrationApproval />
          </>
        }
      />

      <Route
        path='history/:id'
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
              HISTORI PENDAFTARAN VENDOR
            </PageTitle>
            <VendorRegistrationHistory />
          </>
        }
      />

      {/* SETTING: Syarat & Ketentuan (Admin HO / Super User) */}
      <Route
        path='terms-setting/view'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}
            <PageTitle breadcrumbs={termsBreadCrumbs}>
              SETTING: SYARAT &amp; KETENTUAN
            </PageTitle>
            <ViewTermsAndConditions />
          </>
        }
      />

      <Route
        path='terms-setting/edit/:id'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}
            <PageTitle breadcrumbs={termsBreadCrumbs}>
              EDIT SYARAT &amp; KETENTUAN
            </PageTitle>
            <UpdateTermsAndConditions />
          </>
        }
      />
    </Routes>
  )
}

export default VendorRegistrationPage
