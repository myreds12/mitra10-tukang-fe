/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import {MoreLinkContentArg} from '@fullcalendar/core'
import idLocale from '@fullcalendar/core/locales/id'
import dayjs from 'dayjs'
import {Spin} from 'antd'
import {Modal} from 'react-bootstrap'
import {LoadingOutlined} from '@ant-design/icons'

import './ViewCalendar.css'
import {Order, Status, PaymentStage, TimelineHistoryItem} from './types'
import {fetchOrdersCalendarApi, fetchOrderDetailApi} from './services/viewCalendarService'
import {
  parseCalendarOrderData,
  getTimelineStatuses,
  calculatePaymentStages,
} from './utils/calendarHelper'
import {CalendarColorGuideAccordion} from './components/CalendarColorGuideAccordion'
import {OrderDetailModalHeader} from './components/OrderDetailModalHeader'
import {OrderDetailModalInstallation} from './components/OrderDetailModalInstallation'
import {OrderDetailModalVendorActivity} from './components/OrderDetailModalVendorActivity'
import {OrderDetailModalTimeline} from './components/OrderDetailModalTimeline'

const ViewCalendarHO: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL

  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [order, setOrder] = useState<Order[]>([
    {
      id: '',
      title: '',
      start: '',
      end: '',
      status_order: '',
      className: '',
    },
  ])

  const [orderDetail, setOrderDetail] = useState<any>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [initialView] = useState(window.innerWidth <= 768 ? 'listMonth' : 'dayGridMonth')

  // Fetch Data
  const getOrder = async (start: string, end: string) => {
    setIsLoadingPage(true)

    let currentPage = 1
    const pageSize = 100
    let allOrders: Order[] = []

    try {
      while (true) {
        const response = await fetchOrdersCalendarApi(apiUrl, currentPage, pageSize, start, end)
        const data = response.data.data

        if (!data || data.length === 0) break

        const orders = parseCalendarOrderData(data)
        allOrders = [...allOrders, ...orders]

        if (data.length < pageSize) break
        currentPage += 1
      }

      setOrder(allOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoadingPage(false)
    }
  }

  const getOrderDetail = async (orderId: string) => {
    if (!orderId) return

    try {
      const response = await fetchOrderDetailApi(apiUrl, orderId)
      setOrderDetail(response.data.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (dateFrom && dateTo) {
      getOrder(dateFrom, dateTo)
    }
    // eslint-disable-next-line
  }, [dateFrom, dateTo])

  useEffect(() => {
    if (selectedOrder) {
      getOrderDetail(selectedOrder.id)
    }
    // eslint-disable-next-line
  }, [selectedOrder])

  const handleDatesSet = (arg: any) => {
    const start = dayjs(arg.view.currentStart).subtract(1, 'day').format('YYYY-MM-DD')
    const end = dayjs(arg.view.currentEnd).format('YYYY-MM-DD')

    setDateFrom(start)
    setDateTo(end)
  }

  // MODAL
  const [showModal, setShowModal] = useState(false)

  const handleShowModal = (id: string) => {
    const selected = order.find((item) => item.id === id)

    if (selected) {
      setSelectedOrder(selected)
      setShowModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  // Statuses for Order Timeline
  const storedStatus = localStorage.getItem('statusData')
  const statusData: Array<Status> = storedStatus ? JSON.parse(storedStatus) : []

  const bookStatuses = getTimelineStatuses(['BOOK', 'BOOKED', 'PICKLIST', 'UNPAID', 'PAID'], statusData)
  const surveyStatuses = getTimelineStatuses(
    ['SURVEYREQ', 'TUKANGSURVEY', 'SURVEYSTART', 'SURVEYDONE', 'QUOTEIN', 'QUOTEOUT'],
    statusData
  )
  const workStatuses = getTimelineStatuses(
    [
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
    ],
    statusData
  )
  const workDoneStatuses = getTimelineStatuses(
    ['WORKEND', 'DONE', 'WORKENDSTEPONE', 'WORKENDSTEPTWO', 'WORKENDSTEPTHREE'],
    statusData
  )

  const orderHistory: TimelineHistoryItem[] = [
    {title: 'Booking Process', value: bookStatuses},
    {title: 'Survey Process', value: surveyStatuses},
    {title: 'Work in Progress', value: workStatuses},
    {title: 'Work Done', value: workDoneStatuses},
  ]

  // Statuses for Complaint Timeline
  const complaintReceivedStatuses = getTimelineStatuses(['WARRANTYCLAIM', 'INVESTIGATED'], statusData)
  const investigationProcessStatuses = getTimelineStatuses(
    ['COMPLAINTAPPROVEDBYHO', 'COMPLAINTREJECTEDBYHO'],
    statusData
  )
  const remedialProgressStatuses = getTimelineStatuses(
    ['RESURVEYREQ', 'RESURVEYSTART', 'REWORKREQ', 'REWORKSTART'],
    statusData
  )
  const complaintDoneStatuses = getTimelineStatuses(['RESURVEYDONE', 'REWORKEND'], statusData)
  const complaintHistory: TimelineHistoryItem[] = [
    {title: 'Diselidiki', value: complaintReceivedStatuses},
    {title: 'Disetujui atau Ditolak', value: investigationProcessStatuses},
    {title: 'Survei/Pengerjaan Ulang', value: remedialProgressStatuses},
    {title: 'Komplain Selesai', value: complaintDoneStatuses},
  ]

  const renderMoreLink = (arg: MoreLinkContentArg) => {
    return <a>Read more +{arg.num} Order</a>
  }

  // Payment Stage
  const [paymentStages, setPaymentStages] = useState<PaymentStage[]>([
    {stage: 'Tahap 1', percentage: '25%', amount: 0},
    {stage: 'Tahap 2', percentage: '50%', amount: 0},
    {stage: 'Tahap 3', percentage: '25%', amount: 0},
  ])

  useEffect(() => {
    const stages = calculatePaymentStages(
      selectedOrder?.order_detail?.quotation?.[0]?.quotation_grand_total
    )
    setPaymentStages(stages)
  }, [selectedOrder?.order_detail?.quotation?.[0]?.quotation_grand_total])

  return (
    <section id='view-calendar'>
      <CalendarColorGuideAccordion />

      <Spin
        spinning={isLoadingPage}
        size='large'
        tip='Loading..'
        indicator={<LoadingOutlined style={{fontSize: 24}} spin />}
      >
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay,listMonth',
          }}
          initialView={initialView}
          displayEventTime={false}
          eventDisplay=''
          dayMaxEventRows={15}
          dayMaxEvents={15}
          eventOrder=''
          height={'auto'}
          weekends={true}
          events={order}
          locale={idLocale}
          timeZone='Asia/Jakarta'
          datesSet={handleDatesSet}
          eventClick={(info) => handleShowModal(info.event.id)}
          moreLinkContent={renderMoreLink}
        />
      </Spin>

      <Modal
        dialogClassName='modal-calendar-detail'
        centered
        show={showModal}
        onHide={handleCloseModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedOrder?.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <OrderDetailModalHeader orderDetail={orderDetail} />

          <OrderDetailModalInstallation
            orderDetail={orderDetail}
            paymentStages={paymentStages}
          />

          <OrderDetailModalVendorActivity orderDetail={orderDetail} />

          <OrderDetailModalTimeline
            orderDetail={orderDetail}
            selectedOrder={selectedOrder}
            orderHistory={orderHistory}
            complaintHistory={complaintHistory}
          />
        </Modal.Body>
      </Modal>
    </section>
  )
}

export {ViewCalendarHO}
