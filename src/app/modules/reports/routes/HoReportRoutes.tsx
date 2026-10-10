import React from 'react'
import {Route} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {HeaderWrapper} from '../../../../_metronic/layout/components/header/HeaderWrapper'
import {ReportHO} from '../../../components/admin-ho/reports/report/ReportHO'
import {DailyFollowUpQuotation} from '../../../components/admin-ho/reports/daily-followup/Quotation'
import {DailyFollowUpCSI} from '../../../components/admin-ho/reports/daily-followup/CSI'

interface HoReportConfig {
  path: string
  pageTitle: string
  componentTitle: string
  endpoint: string
  statusName: string
  headerColor: string
  params: string
}

const hoConfigs: HoReportConfig[] = [
  {
    path: 'ho-report-general-report',
    pageTitle: 'LAPORAN GENERAL REPORT',
    componentTitle: 'Laporan General Report',
    endpoint: 'orders',
    statusName: '',
    headerColor: 'success',
    params: '&orderPaidGrandTotal=1',
  },
  {
    path: 'ho-report-transaksi-all',
    pageTitle: 'LAPORAN TRANSAKSI ALL ( OMSET )',
    componentTitle: 'Laporan Transaksi All ( Omset )',
    endpoint: 'orders',
    statusName: '',
    headerColor: 'success',
    params: '',
  },
  {
    path: 'ho-report-survey',
    pageTitle: 'LAPORAN SURVEY ( OMSET )',
    componentTitle: 'Laporan Survey ( Omset )',
    endpoint: 'orders',
    statusName: 'SURVEY',
    headerColor: 'success',
    params: '&is_receipt=1&payment_type=survey',
  },
  {
    path: 'ho-report-quotation',
    pageTitle: 'LAPORAN QUOTATION ( OMSET )',
    componentTitle: 'Laporan Quotation ( Omset )',
    endpoint: 'quotation',
    statusName: '',
    headerColor: 'success',
    params: '',
  },
  {
    path: 'ho-report-pending-payment',
    pageTitle: 'LAPORAN PENDING PAYMENT ( OMSET )',
    componentTitle: 'Laporan Pending Payment ( Omset )',
    endpoint: 'invoices',
    statusName: '',
    headerColor: 'danger',
    params: '&invoice_status=1',
  },
  {
    path: 'ho-report-on-progress',
    pageTitle: 'LAPORAN ON PROGRESS ( OMSET )',
    componentTitle: 'Laporan On Progress ( Omset )',
    endpoint: 'orders',
    statusName: 'WORKSTART',
    headerColor: 'primary',
    params: '',
  },
  {
    path: 'ho-report-reschedule',
    pageTitle: 'LAPORAN RESCHEDULE',
    componentTitle: 'Laporan Reschedule',
    endpoint: 'reschedule',
    statusName: '',
    headerColor: 'primary',
    params: '',
  },
  {
    path: 'ho-report-complaint',
    pageTitle: 'LAPORAN PENGADUAN',
    componentTitle: 'Laporan Pengaduan ',
    endpoint: 'complaints',
    statusName: '',
    headerColor: 'danger',
    params: '',
  },
  {
    path: 'ho-report-claim-garansi',
    pageTitle: 'LAPORAN GARANSI',
    componentTitle: 'Laporan Garansi ',
    endpoint: 'orders',
    statusName: 'WORKEND',
    headerColor: 'primary',
    params: '',
  },
  {
    path: 'ho-report-expense-promosi',
    pageTitle: 'LAPORAN EXPENSE PROMOSI',
    componentTitle: 'Laporan Expense Promosi ',
    endpoint: 'orders',
    statusName: 'WORKEND',
    headerColor: 'danger',
    params: '&is_promotion=1',
  },
  {
    path: 'ho-report-refund',
    pageTitle: 'LAPORAN REFUND',
    componentTitle: 'Laporan Refund',
    endpoint: 'refund',
    statusName: '',
    headerColor: 'success',
    params: '',
  },
  {
    path: 'ho-report-other-income',
    pageTitle: 'LAPORAN OTHER INCOME',
    componentTitle: 'Laporan Other Income',
    endpoint: '',
    statusName: '',
    headerColor: 'success',
    params: '',
  },
  {
    path: 'ho-report-total-penalty',
    pageTitle: 'LAPORAN TOTAL PENALTY',
    componentTitle: 'Laporan Total Penalty',
    endpoint: 'refund',
    statusName: '',
    headerColor: 'danger',
    params: '&penalty_vendor=1',
  },
  {
    path: 'ho-report-claim-voucher',
    pageTitle: 'LAPORAN CLAIM VOUCHER',
    componentTitle: 'Laporan Claim Voucher',
    endpoint: 'refund',
    statusName: '',
    headerColor: 'success',
    params: '&claim_voucher=1',
  },
  {
    path: 'ho-report-tagihan-bulanan',
    pageTitle: 'LAPORAN TAGIHAN BULANAN',
    componentTitle: 'Laporan Tagihan Bulanan',
    endpoint: 'invoices',
    statusName: '',
    headerColor: 'success',
    params: '',
  },
  {
    path: 'ho-report-paid',
    pageTitle: 'LAPORAN TAGIHAN DIBAYAR',
    componentTitle: 'Laporan Tagihan Dibayar',
    endpoint: 'invoices',
    statusName: '',
    headerColor: 'success',
    params: '&invoice_status=6',
  },
  {
    path: 'ho-report-unpaid',
    pageTitle: 'LAPORAN TAGIHAN BELUM DIBAYAR',
    componentTitle: 'Laporan Tagihan Belum Dibayar',
    endpoint: 'invoices',
    statusName: '',
    headerColor: 'warning',
    params: '&invoice_status=5',
  },
  {
    path: 'ho-report-csi',
    pageTitle: 'LAPORAN CSI TERKIRIM',
    componentTitle: 'Laporan CSI Terkirim',
    endpoint: 'orders',
    statusName: '',
    headerColor: 'success',
    params: '&sent_csi=1',
  },
  {
    path: 'ho-report-unsent-csi',
    pageTitle: 'LAPORAN CSI BELUM TERKIRIM',
    componentTitle: 'Laporan CSI Belum Terkirim',
    endpoint: 'orders',
    statusName: '',
    headerColor: 'danger',
    params: '&sent_csi=0',
  },
  {
    path: 'ho-report-complete-order',
    pageTitle: 'LAPORAN ORDER SELESAI',
    componentTitle: 'Laporan Order Selesai',
    endpoint: 'orders',
    statusName: 'WORKEND',
    headerColor: 'success',
    params: '',
  },
  {
    path: 'ho-report-insentive-paid',
    pageTitle: 'LAPORAN INSENTIVE DIBAYAR',
    componentTitle: 'Laporan Insentive Dibayar',
    endpoint: 'sales-comission',
    statusName: 'PAID',
    headerColor: 'success',
    params: '',
  },
  {
    path: 'ho-report-insentive-unpaid',
    pageTitle: 'LAPORAN INSENTIVE BELUM DIBAYAR',
    componentTitle: 'Laporan Insentive Belum Dibayar',
    endpoint: 'sales-comission',
    statusName: 'UNPAID',
    headerColor: 'danger',
    params: '',
  },
]

export const renderHoReportRoutes = (breadcrumbs: PageLink[], isHo: boolean) => [
  ...hoConfigs.map((cfg) => (
    <Route
      key={cfg.path}
      path={cfg.path}
      element={
        <>
          {isHo && <HeaderWrapper className='bg-header-ho' />}
          <PageTitle breadcrumbs={breadcrumbs}>{cfg.pageTitle}</PageTitle>
          <ReportHO
            endpoint={cfg.endpoint}
            statusName={cfg.statusName}
            headerColor={cfg.headerColor}
            title={cfg.componentTitle}
            params={cfg.params}
          />
        </>
      }
    />
  )),
  <Route
    key='ho-report-followup-quotation'
    path='ho-report-followup-quotation'
    element={
      <>
        {isHo && <HeaderWrapper className='bg-header-ho' />}
        <PageTitle breadcrumbs={breadcrumbs}>LAPORAN FOLLOW UP QUOTATION</PageTitle>
        <DailyFollowUpQuotation
          endpoint='quotation'
          headerColor='success'
          title='Laporan Follow Up Quotation'
          params=''
          statusName={['QUOTEOUT', 'QUOTEIN']}
        />
      </>
    }
  />,
  <Route
    key='ho-report-followup-csi'
    path='ho-report-followup-csi'
    element={
      <>
        {isHo && <HeaderWrapper className='bg-header-ho' />}
        <PageTitle breadcrumbs={breadcrumbs}>LAPORAN FOLLOW UP CSI</PageTitle>
        <DailyFollowUpCSI
          endpoint='orders'
          headerColor='success'
          title='Laporan Follow Up CSI'
          params=''
          statusName={['CSIOUT', 'SURVEYDONE', 'RESURVEYDONE', 'WORKEND', 'REWORKEND']}
        />
      </>
    }
  />,
]
