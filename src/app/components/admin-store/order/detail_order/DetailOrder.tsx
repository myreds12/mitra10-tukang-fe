import React, {useState, FC, useEffect} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {Card} from 'react-bootstrap'
import Swal from 'sweetalert2'
import {Orders} from '../../../../interfaces/order'
import './DetailOrder.css'
import {formatDateWithTimeZone} from '../../../../../_metronic/helpers'
import {Status, OrderHistory, PaymentStage} from './types'
import {
  fetchOrderById,
  postReprintCounter,
  downloadQuotationPdf,
  getStatusValues,
  initialOrderState,
} from './services/detailOrderService'
import {DetailOrderHeaderSection} from './components/DetailOrderHeaderSection'
import {DetailOrderInstallationTable} from './components/DetailOrderInstallationTable'
import {DetailOrderVendorActivities} from './components/DetailOrderVendorActivities'
import {DetailOrderEvidenceSection} from './components/DetailOrderEvidenceSection'
import {DetailOrderTimelineSection} from './components/DetailOrderTimelineSection'
import {DetailOrderComplaintSection} from './components/DetailOrderComplaintSection'
import {DetailOrderRescheduleSection} from './components/DetailOrderRescheduleSection'
import {DetailOrderHistoricalLog} from './components/DetailOrderHistoricalLog'

const DetailOrders: FC<{updatePageTitle: (order: Orders) => void}> = ({updatePageTitle}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const params = useParams()

  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true)
  const [loadingPDF, setLoadingPDF] = useState(false)

  const [order, setOrder] = useState<Orders>(initialOrderState as unknown as Orders)

  // Order History
  const [orderHistorical, setOrderHistorical] = useState<OrderHistory[]>([])

  const fetchOrderData = async () => {
    try {
      const response = await fetchOrderById(apiUrl, params.id)
      const data = response.data.data as Orders
      setOrder(data)
      updatePageTitle(data)
      setIsLoadingPage(false)

      if (data?.order_history) {
        const historyData = data?.order_history.map((item: any) => ({
          order_id: item.order_id,
          order_status: item?.status?.description,
          updated_by: item?.created_at?.username,
          created_at: item?.created_at
            ? `${formatDateWithTimeZone(item?.created_at)} ${
                item.created_by ? `oleh ${item?.created_by?.username}` : ''
              }`
            : '-',
        }))

        setOrderHistorical(historyData)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchOrderData()
    // eslint-disable-next-line
  }, [])

  // Quotation Grand Total & Payment Stages
  const quotationGrandTotal = Number(order?.quotation?.[0]?.quotation_grand_total || 0)

  const [paymentStages, setPaymentStages] = useState<PaymentStage[]>([
    {stage: 'Tahap 1', percentage: '25%', amount: 0},
    {stage: 'Tahap 2', percentage: '50%', amount: 0},
    {stage: 'Tahap 3', percentage: '25%', amount: 0},
  ])

  const calculatePaymentStages = (grandTotal: number) => {
    const stage1 = grandTotal * 0.25
    const stage2 = grandTotal * 0.5
    const stage3 = grandTotal * 0.25

    setPaymentStages([
      {stage: 'Tahap 1', percentage: '25%', amount: stage1},
      {stage: 'Tahap 2', percentage: '50%', amount: stage2},
      {stage: 'Tahap 3', percentage: '25%', amount: stage3},
    ])
  }

  useEffect(() => {
    calculatePaymentStages(quotationGrandTotal)
    // eslint-disable-next-line
  }, [quotationGrandTotal])

  const storedStatus = localStorage.getItem('statusData')
  const statusData: Array<Status> = storedStatus ? JSON.parse(storedStatus) : []

  // Statuses for Order Timeline
  const bookStatuses = getStatusValues(statusData, ['BOOK', 'BOOKED', 'PICKLIST', 'UNPAID', 'PAID'])
  const surveyStatuses = getStatusValues(statusData, [
    'SURVEYREQ',
    'TUKANGSURVEY',
    'SURVEYSTART',
    'SURVEYDONE',
    'QUOTEIN',
    'QUOTEOUT',
  ])
  const workStatuses = getStatusValues(statusData, [
    'WORKREQ',
    'TUKANGWORK',
    'WORKSTART',
    'WORKREQSTEPONE',
    'WORKREQSTEPTWO',
    'WORKREQSTEPTHREE',
    'WORKSTARTSTEPONE',
    'WORKSTARTSTEPTWO',
    'WORKSTARTSTEPTHREE',
    'TUKANGWORKSTEPONE',
    'TUKANGWORKSTEPTWO',
    'TUKANGWORKSTEPTHREE',
  ])
  const workDoneStatuses = getStatusValues(statusData, [
    'WORKEND',
    'DONE',
    'WORKENDSTEPONE',
    'WORKENDSTEPTWO',
    'WORKENDSTEPTHREE',
    'REWORKREQ',
    'REWORKSTART',
    'REWORKEND',
  ])

  const orderHistoryTimeline = [
    {title: 'Booking Process', value: bookStatuses},
    {title: 'Survey Process', value: surveyStatuses},
    {title: 'Work in Progress', value: workStatuses},
    {title: 'Work Done', value: workDoneStatuses},
  ]

  // Statuses for Complaint Timeline
  const complaintReceivedStatuses = getStatusValues(statusData, ['WARRANTYCLAIM', 'INVESTIGATED'])
  const investigationProcessStatuses = getStatusValues(statusData, [
    'COMPLAINTAPPROVEDBYHO',
    'COMPLAINTREJECTEDBYHO',
  ])
  const remedialProgressStatuses = getStatusValues(statusData, [
    'RESURVEYREQ',
    'RESURVEYSTART',
    'REWORKREQ',
    'REWORKSTART',
  ])
  const complaintDoneStatuses = getStatusValues(statusData, ['RESURVEYDONE', 'REWORKEND'])

  const complaintHistory = [
    {
      title: 'Diselidiki',
      value: complaintReceivedStatuses,
    },
    {
      title: 'Disetujui atau Ditolak',
      value: investigationProcessStatuses,
    },
    {
      title: 'Survei/Pengerjaan Ulang',
      value: remedialProgressStatuses,
    },
    {
      title: 'Komplain Selesai',
      value: complaintDoneStatuses,
    },
  ]

  // Reprint Order
  const handleReprintOrderCS = async () => {
    try {
      await postReprintCounter(apiUrl, params.id)
      if (['PICKLIST'].includes(order?.status?.category ?? '')) {
        navigate(`/order/printout-order-picklist/${params.id}`)
      } else if (
        ['BOOK', 'BOOKED', 'SURVEYREQ', 'SURVEYSTART', 'SURVEYDONE'].includes(
          order?.status?.category ?? ''
        )
      ) {
        navigate(`/order/printout-order-dipesan/${params.id}`)
      }
    } catch (error: any) {
      console.error(error)
      Swal.fire({
        title: 'Error',
        text: error?.response?.data?.message,
        icon: 'error',
      })
    }
  }

  // Export PDF Quotation
  const generatePdf = (order_id: any, receipt_quotation: any, customer_name: any) => {
    setLoadingPDF(true)

    downloadQuotationPdf(apiUrl, order_id)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute(
          'download',
          `Quotation ${
            receipt_quotation === null ? 'Belum Dibayar' : 'Sudah Dibayar'
          } - ${customer_name} - Order ID ${order_id}.pdf`
        )
        document.body.appendChild(link)
        link.click()

        setLoadingPDF(false)
      })
      .catch((error: any) => {
        setLoadingPDF(false)
        Swal.fire('Error', 'Terjadi kesalahan saat mengekspor data', 'error')
      })
  }

  return (
    <section id='detail-order'>
      <Card>
        <Card.Body>
          <DetailOrderHeaderSection
            order={order}
            isLoadingPage={isLoadingPage}
            loadingPDF={loadingPDF}
            onDownloadPdf={() =>
              generatePdf(
                order?.id,
                order?.quotation?.[0]?.receipt_quotation,
                order?.members?.full_name
              )
            }
          />

          <DetailOrderInstallationTable
            order={order}
            isLoadingPage={isLoadingPage}
            paymentStages={paymentStages}
          />

          <DetailOrderVendorActivities order={order} isLoadingPage={isLoadingPage} />

          <DetailOrderEvidenceSection
            order={order}
            apiUrl={apiUrl}
            isLoadingPage={isLoadingPage}
          />

          <DetailOrderTimelineSection
            order={order}
            isLoadingPage={isLoadingPage}
            orderHistoryTimeline={orderHistoryTimeline}
            onReprintOrder={handleReprintOrderCS}
          />
        </Card.Body>
      </Card>

      <DetailOrderComplaintSection
        order={order}
        apiUrl={apiUrl}
        isLoadingPage={isLoadingPage}
        complaintHistory={complaintHistory}
      />

      <DetailOrderRescheduleSection
        order={order}
        apiUrl={apiUrl}
        isLoadingPage={isLoadingPage}
      />

      <DetailOrderHistoricalLog orderHistorical={orderHistorical} />
    </section>
  )
}

export {DetailOrders}
