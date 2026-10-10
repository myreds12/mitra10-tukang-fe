import React from 'react'
import {Route} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {TotalOrderReportStore} from '../../../components/admin-store/reports/total_order_report/TotalOrderReport'

interface StoreReportConfig {
  path: string
  title: string
  endpoint: string
  isWorkOrder?: boolean
  params?: string
  statusName: string[]
}

const storeConfigs: StoreReportConfig[] = [
  {
    path: 'report-total-order',
    title: 'LAPORAN TOTAL ORDER',
    endpoint: 'orders',
    isWorkOrder: false,
    statusName: [''],
  },
  {
    path: 'report-pending-survey',
    title: 'LAPORAN PERMINTAAN SURVEI',
    endpoint: 'orders',
    isWorkOrder: false,
    statusName: ['SURVEYREQ'],
  },
  {
    path: 'report-survey',
    title: 'LAPORAN SURVEI DIMULAI',
    endpoint: 'orders',
    isWorkOrder: false,
    statusName: ['TUKANGSURVEY', 'SURVEYSTART'],
  },
  {
    path: 'report-pending-quotation',
    title: 'LAPORAN QUOTATION DIKIRIM KE KONSUMEN',
    endpoint: 'quotation',
    isWorkOrder: false,
    statusName: ['QUOTEOUT'],
  },
  {
    path: 'report-pending-bayar',
    title: 'LAPORAN QUOTATION TELAH DIBAYAR',
    endpoint: 'quotation',
    isWorkOrder: false,
    params: '&is_paid=1',
    statusName: [
      'QUOTATIONPAID',
      'QUOTATIONPAIDSTEPONE',
      'QUOTATIONPAIDSTEPTWO',
      'QUOTATIONPAIDSTEPTHREE',
    ],
  },
  {
    path: 'report-on-progress',
    title: 'LAPORAN SEDANG/PROSES PENGERJAAN',
    endpoint: 'orders',
    isWorkOrder: false,
    statusName: [
      'WORKSTART',
      'WORKSTARTSTEPONE',
      'WORKSTARTSTEPTWO',
      'WORKSTARTSTEPTHREE',
      'TUKANGWORKSTEPONE',
      'TUKANGWORKSTEPTWO',
      'TUKANGWORKSTEPTHREE',
      'WORKEND',
      'WORKENDSTEPONE',
      'WORKENDSTEPTWO',
      'WORKENDSTEPTHREE',
      'REWORKSTART',
      'REWORKEND',
    ],
  },
  {
    path: 'report-complete',
    title: 'LAPORAN ORDER SELESAI',
    endpoint: 'orders',
    isWorkOrder: true,
    statusName: [
      'WORKEND',
      'WORKENDSTEPONE',
      'WORKENDSTEPTWO',
      'WORKENDSTEPTHREE',
      'DONE',
    ],
  },
  {
    path: 'report-reschedule',
    title: 'LAPORAN ORDER RESCHEDULE',
    endpoint: 'reschedule',
    isWorkOrder: false,
    statusName: [''],
  },
  {
    path: 'report-cancel',
    title: 'LAPORAN ORDER DIBATALKAN',
    endpoint: 'orders',
    isWorkOrder: false,
    statusName: ['CANCEL'],
  },
  {
    path: 'report-refund',
    title: 'LAPORAN ORDER REFUND',
    endpoint: 'refund',
    isWorkOrder: false,
    statusName: [''],
  },
]

export const renderStoreReportRoutes = (breadcrumbs: PageLink[]) =>
  storeConfigs.map((cfg) => (
    <Route
      key={cfg.path}
      path={cfg.path}
      element={
        <>
          <PageTitle breadcrumbs={breadcrumbs}>{cfg.title}</PageTitle>
          <TotalOrderReportStore
            title={cfg.title}
            isWorkOrder={cfg.isWorkOrder ?? false}
            endpoint={cfg.endpoint}
            className=''
            params={cfg.params ?? ''}
            statusName={cfg.statusName}
          />
        </>
      }
    />
  ))
