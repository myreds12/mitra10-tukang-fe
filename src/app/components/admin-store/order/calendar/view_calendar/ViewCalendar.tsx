/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react'

import './ViewCalendar.css'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import idLocale from '@fullcalendar/core/locales/id'
import {MoreLinkContentArg} from '@fullcalendar/core'

import dayjs from 'dayjs'
import {Spin} from 'antd'
import {Modal} from 'react-bootstrap'
import {LoadingOutlined} from '@ant-design/icons'
import {
  formatDate,
  formatDateWithTime,
} from '../../../../../../_metronic/helpers'

import {Order, OrderHistory, Status, PaymentStage} from './types'
import {
  fetchVendorsPageApi,
  fetchCalendarOrdersApi,
  fetchCalendarOrdersVendorApi,
} from './services/viewCalendarService'
import {
  parseCalendarOrderData,
  getOrderHistorySteps,
  getComplaintHistorySteps,
} from './utils/calendarHelper'

import {CalendarColorGuideAccordion} from './components/CalendarColorGuideAccordion'
import {OrderDetailModalHeader} from './components/OrderDetailModalHeader'
import {OrderDetailModalInstallation} from './components/OrderDetailModalInstallation'
import {OrderDetailModalVendorActivity} from './components/OrderDetailModalVendorActivity'
import {OrderDetailModalTimeline} from './components/OrderDetailModalTimeline'

const ViewCalendarCS: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL

  const userStore = localStorage.getItem('storeId')
  const storeId = userStore ? `&store_id=${userStore}` : ''

  const [vendor, setVendor] = useState<any>()
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true)
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

  const [orderHistorical, setOrderHistorical] = useState<OrderHistory[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [initialView] = useState(window.innerWidth <= 768 ? 'listMonth' : 'dayGridMonth')

  const getVendor = async () => {
    let currentPage = 1
    const pageSize = 20
    let allVendors: any[] = []
    let hasMoreData = true

    try {
      while (hasMoreData) {
        const response = await fetchVendorsPageApi(apiUrl, currentPage, pageSize)
        const data = response.data?.data

        if (Array.isArray(data) && data.length > 0) {
          const tempVendor = data.map((item: any) => ({
            value: item.id,
            label: item.company_name,
          }))

          allVendors = [...allVendors, ...tempVendor]
          currentPage += 1
        } else {
          hasMoreData = false
        }
      }

      setVendor(allVendors)
    } catch (err) {
      console.error(err)
    }
  }

  const getOrder = async (start: string, end: string, params: string) => {
    let currentPage = 1
    const pageSize = 100
    let allOrders: Order[] = []
    let hasMoreData = true

    try {
      while (hasMoreData) {
        const response = await fetchCalendarOrdersApi(
          apiUrl,
          currentPage,
          pageSize,
          start,
          end,
          params
        )

        const {data, total} = response.data

        if (Array.isArray(data) && data.length > 0) {
          const parsedData = parseCalendarOrderData(data, setOrderHistorical)

          allOrders = [...allOrders, ...parsedData]
          currentPage += 1

          const currentTotal = allOrders.length
          if (currentTotal >= total) {
            hasMoreData = false
          }
        } else {
          hasMoreData = false
        }
      }

      setOrder(allOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const getOrderVendor = async (start: string, end: string, vendorIds: string) => {
    setIsLoadingPage(true)

    let currentPage = 1
    const pageSize = 100
    let allOrders: Order[] = []
    let hasMoreData = true

    try {
      while (hasMoreData) {
        const response = await fetchCalendarOrdersVendorApi(
          apiUrl,
          currentPage,
          pageSize,
          start,
          end,
          vendorIds
        )

        const {data, total} = response.data

        if (Array.isArray(data) && data.length > 0) {
          const parsedData = parseCalendarOrderData(data, setOrderHistorical)

          allOrders = [...allOrders, ...parsedData]
          currentPage += 1

          const currentTotal = allOrders.length
          if (currentTotal >= total) {
            hasMoreData = false
          }
        } else {
          hasMoreData = false
        }
      }

      setOrder(allOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoadingPage(false)
    }
  }

  useEffect(() => {
    getVendor()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (vendor && dateFrom && dateTo) {
      const vendorIds = vendor ? `&vendor=${vendor.join(',')}` : ''
      getOrder(dateFrom, dateTo, storeId)
      getOrderVendor(dateFrom, dateTo, vendorIds)
    }
    // eslint-disable-next-line
  }, [vendor, dateFrom, dateTo])

  const handleDatesSet = (arg: any) => {
    const start = dayjs(arg.startStr).format('YYYY-MM-DD')
    const end = dayjs(arg.endStr).format('YYYY-MM-DD')

    setDateFrom(start)
    setDateTo(end)
  }

  // Modal
  const [showModal, setShowModal] = useState(false)

  const handleShowModal = (id: string) => {
    const selected = order.find((ord) => ord.id === id)

    if (selected) {
      setSelectedOrder(selected)
      setShowModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  // Timelines
  const storedStatus = localStorage.getItem('statusData')
  const statusData: Array<Status> = storedStatus ? JSON.parse(storedStatus) : []
  const orderHistory = getOrderHistorySteps(statusData)
  const complaintHistory = getComplaintHistorySteps(statusData)

  const renderMoreLink = (arg: MoreLinkContentArg) => {
    return <a>Read more +{arg.num} Order</a>
  }

  // Payment Stages
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
    calculatePaymentStages(selectedOrder?.order_detail?.quotation?.[0]?.quotation_grand_total ?? 0)
    // eslint-disable-next-line
  }, [selectedOrder?.order_detail?.quotation?.[0]?.quotation_grand_total])

  return (
    <section id='view-calendar'>
      <CalendarColorGuideAccordion />

      <Spin
        spinning={isLoadingPage}
        size='large'
        tip='Loading...'
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
          weekends={true}
          events={order}
          dayMaxEventRows={6}
          eventOrder={''}
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
          <OrderDetailModalHeader selectedOrder={selectedOrder} />

          <OrderDetailModalInstallation
            selectedOrder={selectedOrder}
            paymentStages={paymentStages}
            formatDate={formatDate}
          />

          <OrderDetailModalVendorActivity
            selectedOrder={selectedOrder}
            formatDate={formatDate}
            formatDateWithTime={formatDateWithTime}
          />

          <OrderDetailModalTimeline
            selectedOrder={selectedOrder}
            orderHistory={orderHistory}
            complaintHistory={complaintHistory}
            orderHistorical={orderHistorical}
          />
        </Modal.Body>
      </Modal>
    </section>
  )
}

export {ViewCalendarCS}
export default ViewCalendarCS
