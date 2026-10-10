import React from 'react'
import {Route} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {HeaderWrapper} from '../../../../_metronic/layout/components/header/HeaderWrapper'
import {ReportVendor} from '../../../components/admin-vendor/reports/report/ReportVendor'

interface VendorReportConfig {
  path: string
  pageTitle: string
  componentTitle: string
  endpoint: string
  statusName: string
  headerColor: string
  params: string
}

const vendorConfigs: VendorReportConfig[] = [
  {
    path: 'vendor-report-pending-payment',
    pageTitle: 'LAPORAN PENDING PAYMENT',
    componentTitle: 'Laporan Pending Payment ( Omset )',
    endpoint: 'orders',
    statusName: '',
    headerColor: 'danger',
    params: '',
  },
  {
    path: 'vendor-report-tagihan-bulanan',
    pageTitle: 'LAPORAN TAGIHAN',
    componentTitle: 'Laporan Tagihan Bulanan',
    endpoint: 'invoices',
    statusName: '',
    headerColor: 'success',
    params: '',
  },
  {
    path: 'vendor-report-paid',
    pageTitle: 'LAPORAN TAGIHAN DIBAYAR',
    componentTitle: 'Laporan Tagihan Dibayar',
    endpoint: 'invoices',
    statusName: '',
    headerColor: 'success',
    params: '&invoice_status=6',
  },
  {
    path: 'vendor-report-unpaid',
    pageTitle: 'LAPORAN TAGIHAN BELUM DIBAYAR',
    componentTitle: 'Laporan Tagihan Belum Dibayar',
    endpoint: 'invoices',
    statusName: '',
    headerColor: 'warning',
    params: '&invoice_status=5',
  },
  {
    path: 'vendor-report-quotation',
    pageTitle: 'LAPORAN QUOTATION ( OMSET )',
    componentTitle: 'Laporan Quotation ( Omset )',
    endpoint: 'quotation',
    statusName: '',
    headerColor: 'success',
    params: '',
  },
  {
    path: 'vendor-report-survey',
    pageTitle: 'LAPORAN SURVEY ( OMSET )',
    componentTitle: 'Laporan Survey ( Omset )',
    endpoint: 'orders',
    statusName: '',
    headerColor: 'success',
    params: '',
  },
  {
    path: 'vendor-report-claim-garansi',
    pageTitle: 'LAPORAN TOTAL PINALTI',
    componentTitle: 'Laporan Total Penalty',
    endpoint: 'refund',
    statusName: '',
    headerColor: 'danger',
    params: '&penalty_vendor=1',
  },
  {
    path: 'vendor-report-complaint',
    pageTitle: 'LAPORAN PENGADUAN',
    componentTitle: 'Laporan Pengaduan ',
    endpoint: 'complaints',
    statusName: '',
    headerColor: 'danger',
    params: '',
  },
  {
    path: 'vendor-report-on-progress',
    pageTitle: 'LAPORAN PENGERJAAN ( OMSET )',
    componentTitle: 'Laporan Pengerjaan',
    endpoint: 'orders',
    statusName: 'WORKSTART',
    headerColor: 'primary',
    params: '',
  },
  {
    path: 'vendor-report-reschedule',
    pageTitle: 'LAPORAN RESCHEDULE',
    componentTitle: 'Laporan Reschedule',
    endpoint: 'reschedule',
    statusName: '',
    headerColor: 'primary',
    params: '',
  },
]

export const renderVendorReportRoutes = (breadcrumbs: PageLink[], isVendor: boolean) =>
  vendorConfigs.map((cfg) => (
    <Route
      key={cfg.path}
      path={cfg.path}
      element={
        <>
          {isVendor && <HeaderWrapper className='bg-header-vendor' />}
          <PageTitle breadcrumbs={breadcrumbs}>{cfg.pageTitle}</PageTitle>
          <ReportVendor
            endpoint={cfg.endpoint}
            statusName={cfg.statusName}
            headerColor={cfg.headerColor}
            title={cfg.componentTitle}
            params={cfg.params}
          />
        </>
      }
    />
  ))
