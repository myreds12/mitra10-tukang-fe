import React from 'react'
import {Route} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {HeaderWrapper} from '../../../../_metronic/layout/components/header/HeaderWrapper'
import {ReportLogChat} from '../../../components/admin-wa/report-log-chat/ReportLogChat'
import {ReportNotifStatus} from '../../../components/admin-wa/report-notif-status/ReportNotifStatus'
import {PrintReport} from '../components/PrintReport'
import {ViewReport} from '../components/ViewReport'
import {ReportPerformanceList} from '../components/ReportPerformanceList'
import {ReportInsentifList} from '../components/ReportInsentifList'

export const renderMiscReportRoutes = (
  breadcrumbs: PageLink[],
  userRole: string | null,
  isHo: boolean
) => [
  <Route
    key='view-report'
    path='view-report'
    element={
      <>
        {userRole === 'Admin HO' || userRole === 'Super User' ? (
          <HeaderWrapper className='bg-header-ho' />
        ) : userRole === 'Admin Vendor' || userRole === 'Owner Vendor' ? (
          <HeaderWrapper className='bg-header-vendor' />
        ) : userRole === 'Tukang' ? (
          <HeaderWrapper className='bg-header-tukang' />
        ) : null}
        <PageTitle breadcrumbs={breadcrumbs}>LIST LAPORAN</PageTitle>
        <ViewReport />
      </>
    }
  />,
  <Route
    key='report-insentif'
    path='report-insentif'
    element={
      <>
        {isHo && <HeaderWrapper className='bg-header-ho' />}
        <PageTitle breadcrumbs={breadcrumbs}>LAPORAN INSENTIF</PageTitle>
        <ReportInsentifList />
      </>
    }
  />,
  <Route
    key='report-performance'
    path='report-performance'
    element={
      <>
        {isHo && <HeaderWrapper className='bg-header-ho' />}
        <PageTitle breadcrumbs={breadcrumbs}>LAPORAN PERFORMANCE</PageTitle>
        <ReportPerformanceList />
      </>
    }
  />,
  <Route
    key='log-chat'
    path='log-chat'
    element={
      <>
        <PageTitle breadcrumbs={breadcrumbs}>Report Log Chat</PageTitle>
        <ReportLogChat />
      </>
    }
  />,
  <Route
    key='log-status-chat'
    path='log-status-chat'
    element={
      <>
        <PageTitle breadcrumbs={breadcrumbs}>Report Log Notif Status</PageTitle>
        <ReportNotifStatus />
      </>
    }
  />,
  <Route
    key='print-report'
    path='print-report'
    element={
      <>
        <PageTitle breadcrumbs={breadcrumbs}>PRINT REPORT</PageTitle>
        <PrintReport />
      </>
    }
  />,
]
