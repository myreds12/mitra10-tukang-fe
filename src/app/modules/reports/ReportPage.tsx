import React from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'

import {HeaderWrapper} from '../../../_metronic/layout/components/header/HeaderWrapper'

import {
  ReportHO,
  ReportVendor,
  TotalOrderReportStore,
  DailyFollowUpQuotation,
  DailyFollowUpCSI,
  ReportLogChat,
  ReportNotifStatus,
} from '../../components'

import {PrintReport} from './components/PrintReport'
import {ViewReport} from './components/ViewReport'
import {ReportPerformanceList} from './components/ReportPerformanceList'
import {ReportInsentifList} from './components/ReportInsentifList'

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

  return (
    <Routes>
      <Route
        path='view-report'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : userRole === 'Admin Vendor' || userRole === 'Owner Vendor' ? (
              <>
                <HeaderWrapper className='bg-header-vendor' />
              </>
            ) : userRole === 'Tukang' ? (
              <>
                <HeaderWrapper className='bg-header-tukang' />
              </>
            ) : (
              <></>
            )}
            <PageTitle breadcrumbs={orderBreadCrumbs}>LIST LAPORAN</PageTitle>
            <ViewReport />
          </>
        }
      />

      <Route
        path='report-insentif'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}
            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN INSENTIF</PageTitle>
            <ReportInsentifList />
          </>
        }
      />

      <Route
        path='report-performance'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}
            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN PERFORMANCE</PageTitle>
            <ReportPerformanceList />
          </>
        }
      />

      {/* STORE REPORT */}

      <Route
        path='report-total-order'
        element={
          <>
            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN TOTAL ORDER</PageTitle>
            <TotalOrderReportStore
              title='LAPORAN TOTAL ORDER'
              isWorkOrder={false}
              endpoint='orders'
              className=''
              params=''
              statusName={['']}
            />
          </>
        }
      />

      <Route
        path='report-pending-survey'
        element={
          <>
            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN PERMINTAAN SURVEI</PageTitle>
            <TotalOrderReportStore
              title='LAPORAN PERMINTAAN SURVEI'
              isWorkOrder={false}
              endpoint='orders'
              className=''
              params=''
              statusName={['SURVEYREQ']}
            />
          </>
        }
      />

      <Route
        path='report-survey'
        element={
          <>
            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN SURVEI DIMULAI</PageTitle>
            <TotalOrderReportStore
              title='LAPORAN SURVEI DIMULAI'
              isWorkOrder={false}
              endpoint='orders'
              className=''
              params=''
              statusName={['TUKANGSURVEY', 'SURVEYSTART']}
            />
          </>
        }
      />

      <Route
        path='report-pending-quotation'
        element={
          <>
            <PageTitle breadcrumbs={orderBreadCrumbs}>
              LAPORAN QUOTATION DIKIRIM KE KONSUMEN
            </PageTitle>
            <TotalOrderReportStore
              title='LAPORAN QUOTATION DIKIRIM KE KONSUMEN'
              isWorkOrder={false}
              endpoint='quotation'
              className=''
              params=''
              statusName={['QUOTEOUT']}
            />
          </>
        }
      />

      <Route
        path='report-pending-bayar'
        element={
          <>
            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN QUOTATION TELAH DIBAYAR</PageTitle>
            <TotalOrderReportStore
              title='LAPORAN QUOTATION TELAH DIBAYAR'
              isWorkOrder={false}
              endpoint='quotation'
              className=''
              params='&is_paid=1'
              statusName={[
                'QUOTATIONPAID',
                'QUOTATIONPAIDSTEPONE',
                'QUOTATIONPAIDSTEPTWO',
                'QUOTATIONPAIDSTEPTHREE',
              ]}
            />
          </>
        }
      />

      <Route
        path='report-on-progress'
        element={
          <>
            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN SEDANG/PROSES PENGERJAAN</PageTitle>
            <TotalOrderReportStore
              title='LAPORAN SEDANG/PROSES PENGERJAAN'
              isWorkOrder={false}
              endpoint='orders'
              className=''
              params=''
              statusName={[
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
              ]}
            />
          </>
        }
      />

      <Route
        path='report-complete'
        element={
          <>
            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN ORDER SELESAI</PageTitle>
            <TotalOrderReportStore
              title='LAPORAN ORDER SELESAI'
              isWorkOrder={true}
              endpoint='orders'
              className=''
              params=''
              statusName={[
                'WORKEND',
                'WORKENDSTEPONE',
                'WORKENDSTEPTWO',
                'WORKENDSTEPTHREE',
                'DONE',
              ]}
            />
          </>
        }
      />

      <Route
        path='report-reschedule'
        element={
          <>
            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN ORDER RESCHEDULE</PageTitle>
            <TotalOrderReportStore
              title='LAPORAN ORDER RESCHEDULE'
              isWorkOrder={false}
              endpoint='reschedule'
              className=''
              params=''
              statusName={['']}
            />
          </>
        }
      />

      <Route
        path='report-cancel'
        element={
          <>
            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN ORDER DIBATALKAN</PageTitle>
            <TotalOrderReportStore
              title='LAPORAN ORDER DIBATALKAN'
              isWorkOrder={false}
              endpoint='orders'
              className=''
              params=''
              statusName={['CANCEL']}
            />
          </>
        }
      />

      <Route
        path='report-refund'
        element={
          <>
            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN ORDER REFUND</PageTitle>
            <TotalOrderReportStore
              title='LAPORAN ORDER REFUND'
              isWorkOrder={false}
              endpoint='refund'
              className=''
              params=''
              statusName={['']}
            />
          </>
        }
      />

      {/* HO REPORT */}
      <Route
        path='ho-report-general-report'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN GENERAL REPORT</PageTitle>

            <ReportHO
              endpoint='orders'
              statusName=''
              headerColor='success'
              title='Laporan General Report'
              params='&orderPaidGrandTotal=1'
            />
          </>
        }
      />

      <Route
        path='ho-report-transaksi-all'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN TRANSAKSI ALL ( OMSET )</PageTitle>

            <ReportHO
              endpoint='orders'
              statusName=''
              headerColor='success'
              title='Laporan Transaksi All ( Omset )'
              params=''
            />
          </>
        }
      />

      <Route
        path='ho-report-survey'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN SURVEY ( OMSET )</PageTitle>

            <ReportHO
              endpoint='orders'
              statusName='SURVEY'
              headerColor='success'
              title='Laporan Survey ( Omset )'
              params='&is_receipt=1&payment_type=survey'
            />
          </>
        }
      />

      <Route
        path='ho-report-quotation'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN QUOTATION ( OMSET )</PageTitle>

            <ReportHO
              endpoint='quotation'
              statusName=''
              headerColor='success'
              title='Laporan Quotation ( Omset )'
              params=''
            />
          </>
        }
      />

      <Route
        path='ho-report-followup-quotation'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN FOLLOW UP QUOTATION</PageTitle>

            <DailyFollowUpQuotation
              endpoint='quotation'
              headerColor='success'
              title='Laporan Follow Up Quotation'
              params=''
              statusName={['QUOTEOUT', 'QUOTEIN']}
            />
          </>
        }
      />

      <Route
        path='ho-report-followup-csi'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN FOLLOW UP CSI</PageTitle>

            <DailyFollowUpCSI
              endpoint='orders'
              headerColor='success'
              title='Laporan Follow Up CSI'
              params=''
              statusName={['CSIOUT', 'SURVEYDONE', 'RESURVEYDONE', 'WORKEND', 'REWORKEND']}
            />
          </>
        }
      />

      <Route
        path='ho-report-pending-payment'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN PENDING PAYMENT ( OMSET )</PageTitle>

            <ReportHO
              endpoint='invoices'
              statusName=''
              headerColor='danger'
              title='Laporan Pending Payment ( Omset )'
              params='&invoice_status=1'
            />
          </>
        }
      />

      <Route
        path='ho-report-on-progress'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN ON PROGRESS ( OMSET )</PageTitle>

            <ReportHO
              endpoint='orders'
              statusName='WORKSTART'
              headerColor='primary'
              title='Laporan On Progress ( Omset )'
              params=''
            />
          </>
        }
      />

      <Route
        path='ho-report-reschedule'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN RESCHEDULE</PageTitle>

            <ReportHO
              endpoint='reschedule'
              statusName=''
              headerColor='primary'
              title='Laporan Reschedule'
              params=''
            />
          </>
        }
      />

      <Route
        path='ho-report-complaint'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN PENGADUAN</PageTitle>

            <ReportHO
              endpoint='complaints'
              statusName=''
              headerColor='danger'
              title='Laporan Pengaduan '
              params=''
            />
          </>
        }
      />

      <Route
        path='ho-report-claim-garansi'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN GARANSI</PageTitle>

            <ReportHO
              endpoint='orders'
              statusName='WORKEND'
              headerColor='primary'
              title='Laporan Garansi '
              params=''
            />
          </>
        }
      />

      <Route
        path='ho-report-expense-promosi'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN EXPENSE PROMOSI</PageTitle>

            <ReportHO
              endpoint='orders'
              statusName='WORKEND'
              headerColor='danger'
              title='Laporan Expense Promosi '
              params='&is_promotion=1'
            />
          </>
        }
      />

      <Route
        path='ho-report-refund'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN REFUND</PageTitle>

            <ReportHO
              endpoint='refund'
              statusName=''
              headerColor='success'
              title='Laporan Refund'
              params=''
            />
          </>
        }
      />

      <Route
        path='ho-report-other-income'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN OTHER INCOME</PageTitle>

            <ReportHO
              endpoint=''
              statusName=''
              headerColor='success'
              title='Laporan Other Income'
              params=''
            />
          </>
        }
      />

      <Route
        path='ho-report-total-penalty'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN TOTAL PENALTY</PageTitle>

            <ReportHO
              endpoint='refund'
              statusName=''
              headerColor='danger'
              title='Laporan Total Penalty'
              params='&penalty_vendor=1'
            />
          </>
        }
      />

      <Route
        path='ho-report-claim-voucher'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN CLAIM VOUCHER</PageTitle>

            <ReportHO
              endpoint='refund'
              statusName=''
              headerColor='success'
              title='Laporan Claim Voucher'
              params='&claim_voucher=1'
            />
          </>
        }
      />

      <Route
        path='ho-report-tagihan-bulanan'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN TAGIHAN BULANAN</PageTitle>

            <ReportHO
              endpoint='invoices'
              statusName=''
              headerColor='success'
              title='Laporan Tagihan Bulanan'
              params=''
            />
          </>
        }
      />

      {/* <Route
        path='ho-report-pending-payment'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN PENDING PAYMENT ( OMSET )</PageTitle>

            <ReportHO
              endpoint='invoices'
              statusName=''
              headerColor='danger'
              title='Laporan Pending Payment ( Omset )'
              params='&invoice_status=1'
            />
          </>
        }
      /> */}

      <Route
        path='ho-report-paid'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN TAGIHAN DIBAYAR</PageTitle>

            <ReportHO
              endpoint='invoices'
              statusName=''
              headerColor='success'
              title='Laporan Tagihan Dibayar'
              params='&invoice_status=6'
            />
          </>
        }
      />

      <Route
        path='ho-report-unpaid'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN TAGIHAN BELUM DIBAYAR</PageTitle>

            <ReportHO
              endpoint='invoices'
              statusName=''
              headerColor='warning'
              title='Laporan Tagihan Belum Dibayar'
              params='&invoice_status=5'
            />
          </>
        }
      />

      <Route
        path='ho-report-csi'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN CSI TERKIRIM</PageTitle>

            <ReportHO
              endpoint='orders'
              statusName=''
              headerColor='success'
              title='Laporan CSI Terkirim'
              params='&sent_csi=1'
            />
          </>
        }
      />

      <Route
        path='ho-report-unsent-csi'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN CSI BELUM TERKIRIM</PageTitle>

            <ReportHO
              endpoint='orders'
              statusName=''
              headerColor='danger'
              title='Laporan CSI Belum Terkirim'
              params='&sent_csi=0'
            />
          </>
        }
      />
      {/* 
      <Route
        path='ho-report-csi-responded'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN CSI DIRESPON</PageTitle>

            <ReportHO
              endpoint='csi'
              statusName=''
              headerColor='success'
              title='Laporan CSI Direspon'
            />
          </>
        }
      />

      <Route
        path='ho-report-csi-unrespon'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN CSI BELUM DIRESPON</PageTitle>

            <ReportHO
              endpoint='csi'
              statusName=''
              headerColor='danger'
              title='Laporan CSI Belum Direspon'
            />
          </>
        }
      /> */}

      <Route
        path='ho-report-complete-order'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN ORDER SELESAI</PageTitle>

            <ReportHO
              endpoint='orders'
              statusName='WORKEND'
              headerColor='success'
              title='Laporan Order Selesai'
              params=''
            />
          </>
        }
      />

      {/* <Route
        path='ho-report-uncomplete-order'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN ORDER TIDAK KOMPLIT</PageTitle>

            <ReportHO
              endpoint=''
              statusName=''
              headerColor='danger'
              title='Laporan Order Tidak Komplit'
            />
          </>
        }
      /> */}

      <Route
        path='ho-report-insentive-paid'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN INSENTIVE DIBAYAR</PageTitle>

            <ReportHO
              endpoint='sales-comission'
              statusName='PAID'
              headerColor='success'
              title='Laporan Insentive Dibayar'
              params=''
            />
          </>
        }
      />

      <Route
        path='ho-report-insentive-unpaid'
        element={
          <>
            {userRole === 'Admin HO' || userRole === 'Super User' ? (
              <>
                <HeaderWrapper className='bg-header-ho' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN INSENTIVE BELUM DIBAYAR</PageTitle>

            <ReportHO
              endpoint='sales-comission'
              statusName='UNPAID'
              headerColor='danger'
              title='Laporan Insentive Belum Dibayar'
              params=''
            />
          </>
        }
      />

      {/* VENDOR REPORT */}
      <Route
        path='vendor-report-pending-payment'
        element={
          <>
            {userRole === 'Admin Vendor' || userRole === 'Owner Vendor' ? (
              <>
                <HeaderWrapper className='bg-header-vendor' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN PENDING PAYMENT</PageTitle>

            <ReportVendor
              endpoint='orders'
              statusName=''
              headerColor='danger'
              title='Laporan Pending Payment ( Omset )'
              params=''
            />
          </>
        }
      />

      <Route
        path='vendor-report-tagihan-bulanan'
        element={
          <>
            {userRole === 'Admin Vendor' || userRole === 'Owner Vendor' ? (
              <>
                <HeaderWrapper className='bg-header-vendor' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN TAGIHAN</PageTitle>

            <ReportVendor
              endpoint='invoices'
              statusName=''
              headerColor='success'
              title='Laporan Tagihan Bulanan'
              params=''
            />
          </>
        }
      />

      <Route
        path='vendor-report-paid'
        element={
          <>
            {userRole === 'Admin Vendor' || userRole === 'Owner Vendor' ? (
              <>
                <HeaderWrapper className='bg-header-vendor' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN TAGIHAN DIBAYAR</PageTitle>

            <ReportVendor
              endpoint='invoices'
              statusName=''
              headerColor='success'
              title='Laporan Tagihan Dibayar'
              params='&invoice_status=6'
            />
          </>
        }
      />

      <Route
        path='vendor-report-unpaid'
        element={
          <>
            {userRole === 'Admin Vendor' || userRole === 'Owner Vendor' ? (
              <>
                <HeaderWrapper className='bg-header-vendor' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN TAGIHAN BELUM DIBAYAR</PageTitle>

            <ReportVendor
              endpoint='invoices'
              statusName=''
              headerColor='warning'
              title='Laporan Tagihan Belum Dibayar'
              params='&invoice_status=5'
            />
          </>
        }
      />

      <Route
        path='vendor-report-quotation'
        element={
          <>
            {userRole === 'Admin Vendor' || userRole === 'Owner Vendor' ? (
              <>
                <HeaderWrapper className='bg-header-vendor' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN QUOTATION ( OMSET )</PageTitle>

            <ReportVendor
              endpoint='quotation'
              statusName=''
              headerColor='success'
              title='Laporan Quotation ( Omset )'
              params=''
            />
          </>
        }
      />

      <Route
        path='vendor-report-survey'
        element={
          <>
            {userRole === 'Admin Vendor' || userRole === 'Owner Vendor' ? (
              <>
                <HeaderWrapper className='bg-header-vendor' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN SURVEY ( OMSET )</PageTitle>

            <ReportVendor
              endpoint='orders'
              statusName=''
              headerColor='success'
              title='Laporan Survey ( Omset )'
              params=''
            />
          </>
        }
      />

      <Route
        path='vendor-report-claim-garansi'
        element={
          <>
            {userRole === 'Admin Vendor' || userRole === 'Owner Vendor' ? (
              <>
                <HeaderWrapper className='bg-header-vendor' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN TOTAL PINALTI</PageTitle>

            <ReportVendor
              endpoint='refund'
              statusName=''
              headerColor='danger'
              title='Laporan Total Penalty'
              params='&penalty_vendor=1'
            />
          </>
        }
      />

      <Route
        path='vendor-report-complaint'
        element={
          <>
            {userRole === 'Admin Vendor' || userRole === 'Owner Vendor' ? (
              <>
                <HeaderWrapper className='bg-header-vendor' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN PENGADUAN</PageTitle>

            <ReportVendor
              endpoint='complaints'
              statusName=''
              headerColor='danger'
              title='Laporan Pengaduan '
              params=''
            />
          </>
        }
      />

      <Route
        path='vendor-report-on-progress'
        element={
          <>
            {userRole === 'Admin Vendor' || userRole === 'Owner Vendor' ? (
              <>
                <HeaderWrapper className='bg-header-vendor' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN PENGERJAAN ( OMSET )</PageTitle>

            <ReportVendor
              endpoint='orders'
              statusName='WORKSTART'
              headerColor='primary'
              title='Laporan Pengerjaan'
              params=''
            />
          </>
        }
      />

      <Route
        path='vendor-report-reschedule'
        element={
          <>
            {userRole === 'Admin Vendor' || userRole === 'Owner Vendor' ? (
              <>
                <HeaderWrapper className='bg-header-vendor' />
              </>
            ) : (
              <></>
            )}

            <PageTitle breadcrumbs={orderBreadCrumbs}>LAPORAN RESCHEDULE</PageTitle>

            <ReportVendor
              endpoint='reschedule'
              statusName=''
              headerColor='primary'
              title='Laporan Reschedule'
              params=''
            />
          </>
        }
      />
      {/* PRINT Admin WA  */}
      <Route
        path='log-chat'
        element={
          <>
            <PageTitle breadcrumbs={orderBreadCrumbs}>Report Log Chat</PageTitle>
            <ReportLogChat />
          </>
        }
      />
      <Route
        path='log-status-chat'
        element={
          <>
            <PageTitle breadcrumbs={orderBreadCrumbs}>Report Log Notif Status</PageTitle>
            <ReportNotifStatus />
          </>
        }
      />
      {/* PRINT REPORT  */}
      <Route
        path='print-report'
        element={
          <>
            <PageTitle breadcrumbs={orderBreadCrumbs}>PRINT REPORT</PageTitle>
            <PrintReport />
          </>
        }
      />

      <Route index element={<Navigate to='/reports/view-report' />} />
    </Routes>
  )
}

export default RefundPage
