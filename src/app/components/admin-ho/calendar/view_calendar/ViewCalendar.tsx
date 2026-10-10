/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react'

import './ViewCalendar.css'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import {MoreLinkContentArg} from '@fullcalendar/core'
import idLocale from '@fullcalendar/core/locales/id'

import axios from 'axios'
import dayjs from 'dayjs'
import {Steps, Spin} from 'antd'
import {Row, Col, Modal, Form, Table, Accordion} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCircleInfo} from '@fortawesome/free-solid-svg-icons'
import {LoadingOutlined} from '@ant-design/icons'
import {formatDate, formatDateWithTime} from '../../../../../_metronic/helpers'

interface Order {
  id: string
  title: string
  start: string
  end: string
  status_order: string
  className: string
  order_detail?: any
}

interface Status {
  value: number | null
  category: string
}

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
        const response = await axios.get(`${apiUrl}/orders/calender`, {
          params: {
            page: currentPage,
            take: pageSize,
            date_from: start,
            date_to: end,
          },
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })

        const data = response.data.data

        if (!data || data.length === 0) break

        const orders = data.map((item: any) => {
          const startDate = (() => {
            if (item?.work_orders) {
              if (item.work_order_survey_date !== null) {
                return item.work_orders.work_start_date === null
                  ? item.work_orders.survey_date
                  : item.work_orders.work_start_date
              }
            }
            return item?.request_survey
          })()

          const endDate = (() => {
            if (item?.work_orders) {
              if (item.work_order_survey_date !== null) {
                return item.work_orders.work_end_date === null
                  ? item.work_orders.survey_date
                  : item.work_orders.work_end_date
              }
              if (item.work_order_survey_date === null && item.work_orders.work_end_date !== null) {
                return item.work_orders.work_end_date
              }
            }
            return item?.request_survey
          })()

          const orderStatus = item?.reschedule?.length > 0 ? 'RESCHEDULE' : item?.status?.category

          const contextualColor = (() => {
            switch (orderStatus) {
              case 'PICKLIST':
                return 'bg-primary'
              case 'BOOKED':
                return 'bg-calendar-order-booked'
              case 'SURVEYREQ':
              case 'SURVEYSTART':
              case 'SURVEYDONE':
              case 'WORKREQ':
              case 'WORKSTART':
              case 'TUKANGSURVEY':
              case 'TUKANGWORK':
                return 'bg-calendar-order-wip'
              case 'QUOTATIONDRAFT':
              case 'QUOTEIN':
              case 'QUOTEOUT':
              case 'QUOTATIONPAID':
              case 'QUOTATIONPAIDSTEPONE':
              case 'QUOTATIONPAIDSTEPTWO':
              case 'QUOTATIONPAIDSTEPTHREE':
              case 'WORKEND':
              case 'WORKENDSTEPONE':
              case 'WORKENDSTEPTWO':
              case 'WORKENDSTEPTHREE':
              case 'REWORKEND':
                return 'bg-calendar-order-done'
              case 'RESCHEDULE':
                return 'bg-calendar-order-reschedule'
              case 'INVESTIGATED':
              case 'COMPLAINTAPPROVEDBYHO':
              case 'COMPLAINTREJECTEDBYHO':
                return 'bg-calendar-order-complaint'
              case 'CANCEL':
                return 'bg-calendar-order-cancel'
              default:
                return 'bg-primary'
            }
          })()

          return {
            id: item?.id.toString(),
            title: `#${item?.id ?? ''} - ${
              item.vendor ? item.vendor.company_name : '- Vendor Belum Ditugaskan'
            } - ${item?.members?.full_name ?? ''}`,
            start: dayjs(startDate).format('YYYY-MM-DD HH:mm:ss'),
            end: dayjs(endDate).format('YYYY-MM-DD HH:mm:ss'),
            order_status: orderStatus,
            className: contextualColor,
          }
        })

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
      await axios
        .get(`${apiUrl}/orders/${orderId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })
        .then((response) => {
          const data = response.data.data
          setOrderDetail(data)
        })
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
    const selected = order.find((order) => order.id === id)

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
  const getStatuses = (categories: string[]) =>
    statusData.filter((status: any) => categories.includes(status.category)).map((x) => x.value)

  const bookStatuses = getStatuses(['BOOK', 'BOOKED', 'PICKLIST', 'UNPAID', 'PAID'])
  const surveyStatuses = getStatuses([
    'SURVEYREQ',
    'TUKANGSURVEY',
    'SURVEYSTART',
    'SURVEYDONE',
    'QUOTEIN',
    'QUOTEOUT',
  ])
  const workStatuses = getStatuses([
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
  const workDoneStatuses = getStatuses([
    'WORKEND',
    'DONE',
    'WORKENDSTEPONE',
    'WORKENDSTEPTWO',
    'WORKENDSTEPTHREE',
  ])

  const orderHistory = [
    {title: 'Booking Process', value: bookStatuses},
    {title: 'Survey Process', value: surveyStatuses},
    {title: 'Work in Progress', value: workStatuses},
    {title: 'Work Done', value: workDoneStatuses},
  ]

  // Statuses for Complaint Timeline
  const complaintReceivedStatuses = getStatuses(['WARRANTYCLAIM', 'INVESTIGATED'])
  const investigationProcessStatuses = getStatuses([
    'COMPLAINTAPPROVEDBYHO',
    'COMPLAINTREJECTEDBYHO',
  ])
  const remedialProgressStatuses = getStatuses([
    'RESURVEYREQ',
    'RESURVEYSTART',
    'REWORKREQ',
    'REWORKSTART',
  ])
  const complaintDoneStatuses = getStatuses(['RESURVEYDONE', 'REWORKEND'])
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

  const renderMoreLink = (arg: MoreLinkContentArg) => {
    return <a>Read more +{arg.num} Order</a>
  }

  // Payment Stage
  const [paymentStages, setPaymentStages] = useState([
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
    calculatePaymentStages(selectedOrder?.order_detail?.quotation?.[0]?.quotation_grand_total)
    // eslint-disable-next-line
  }, [selectedOrder?.order_detail?.quotation?.[0]?.quotation_grand_total])

  return (
    <section id='view-calendar'>
      <Accordion className='mb-5'>
        <Accordion.Item eventKey='0'>
          <Accordion.Header>
            <FontAwesomeIcon icon={faCircleInfo} size='lg' className='me-2' />
            <p className='fs-7 fw-bold'>Panduan Warna Kalendar</p>
          </Accordion.Header>

          <Accordion.Body>
            <div className='description fs-7 mb-5'>
              Informasi mengenai keterangan warna didalam kalendar
            </div>

            <div className='vendor-avail'>
              <Table>
                <thead>
                  <tr>
                    <th>Status Order</th>
                    <th>Warna</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Order baru</td>

                    <td>
                      <div className='d-flex gap-2'>
                        <div className='box-primary'></div>
                        <div className='fs-6'>(Biru Tua)</div>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>Order diterima HO</td>

                    <td>
                      <div className='d-flex gap-2'>
                        <div className='box-light-primary'></div>
                        <div className='fs-6'>(Biru Muda)</div>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>Order diterima Vendor</td>

                    <td>
                      <div className='d-flex gap-2'>
                        <div className='box-brown'></div>
                        <div className='fs-6'>(Pink)</div>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>Order Selesai</td>

                    <td>
                      <div className='d-flex gap-2'>
                        <div className='box-success'></div>
                        <div className='fs-6'>(Hijau)</div>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>Order yang dijadwalkan ulang</td>

                    <td>
                      <div className='d-flex gap-2'>
                        <div className='box-warning'></div>
                        <div className='fs-6'>(Orange)</div>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>Order yang dikomplain</td>
                    <td>
                      <div className='d-flex gap-2'>
                        <div className='box-danger'></div>
                        <div className='fs-6'>(Merah)</div>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>Order yang dibatalkan</td>
                    <td>
                      <div className='d-flex gap-2'>
                        <div className='box-black'></div>
                        <div className='fs-6'>(Hitam)</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

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
          <div className='form-wrapper'>
            <Row className='form-header'>
              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Label className='fs-4 fw-bold'>
                  Nama Toko :{' '}
                  <span className='fs-4 ms-2 fw-normal'>
                    {orderDetail?.store?.store_name ?? ''}
                  </span>
                </Form.Label>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Label className='fs-4 fw-bold'>
                  Order ID : <span className='fs-4 ms-2 fw-normal'>{orderDetail?.id}</span>
                </Form.Label>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Col>
                  <Form.Label className='fs-4 fw-bold'>
                    Receipt Number :
                    <span className='fs-4 ms-2 fw-normal'>
                      {orderDetail?.receipt_number ?? '-'}
                    </span>
                  </Form.Label>
                </Col>

                <Col>
                  <Form.Label className='fs-4 fw-bold'>
                    Order Status :
                    <span className='fs-4 ms-2 fw-bold text-success'>
                      {orderDetail?.status?.description ?? '-'}
                    </span>
                  </Form.Label>
                </Col>
              </Col>
            </Row>

            <Row className='information-detail'>
              <Col xs={12} md={8} lg={8} xl={8} xxl={8} className='costumer-info'>
                <div className='fs-3 fw-bold'>Informasi Pembeli</div>

                <Row>
                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='5'>
                        No Member :
                      </Form.Label>

                      <Col sm='7'>
                        <p className='fs-7'>{orderDetail?.members?.member_number}</p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='5'>
                        Customer Name :
                      </Form.Label>

                      <Col sm='7'>
                        <p className='fs-7'>{orderDetail?.members?.full_name}</p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='5'>
                        Alamat Pemasangan :
                      </Form.Label>

                      <Col sm='7'>
                        <p className='fs-7'>{orderDetail?.project_address}</p>
                      </Col>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='4'>
                        Nomor WA :
                      </Form.Label>

                      <Col sm='8'>
                        <p className='fs-7'>
                          {!orderDetail?.project_number.startsWith('0')
                            ? `+62${orderDetail?.members?.whatsapp_number}`
                            : '-'}
                        </p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='4'>
                        Nomor Telepon :
                      </Form.Label>
                      <Col sm='8'>
                        <p className='fs-7'>
                          {orderDetail?.project_number.startsWith('0')
                            ? orderDetail?.members?.phone_number
                            : '-'}
                        </p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='4'>
                        Alamat Email :
                      </Form.Label>
                      <Col sm='8'>
                        <p className='fs-7'>{orderDetail?.members?.email} </p>
                      </Col>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='sales-info'>
                <div className='fs-3 fw-bold'>Informasi Penjual</div>

                <Form.Group as={Row} className='detail-info'>
                  <Form.Label column sm='4'>
                    Sales ID :
                  </Form.Label>

                  <Col sm='8'>
                    <p className='fs-7'>{orderDetail?.sales?.id} </p>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='detail-info'>
                  <Form.Label column sm='4'>
                    Sales Person :
                  </Form.Label>

                  <Col sm='8'>
                    <p className='fs-7'>{orderDetail?.sales?.full_name} </p>
                  </Col>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <Row className='table-warranty d-flex align-items-center mb-5'>
            <div className='table-title-warranty'>
              <div className='fs-3 fw-bold'>Informasi Pemasangan</div>

              <Row>
                <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                  <Form.Label column>
                    {(() => {
                      if (orderDetail?.payment_type === 'survey') {
                        return `Tanggal Request Survey`
                      } else {
                        return `Tanggal request pemasangan`
                      }
                    })()}
                  </Form.Label>
                  <Col>
                    <p className='fs-7 p-0'>{formatDate(orderDetail?.request_survey)}</p>
                  </Col>
                </Form.Group>

                {orderDetail?.payment_type === 'survey' && (
                  <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                    <Form.Label column>Tanggal request pemasangan</Form.Label>
                    <Col>
                      <p className='fs-7 p-0'>
                        {orderDetail?.request_work
                          ? formatDate(orderDetail?.request_work)
                          : 'Tanggal belum diset oleh toko'}
                      </p>
                    </Col>
                  </Form.Group>
                )}

                <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                  <Form.Label column>Informasi Vendor Pemasangan :</Form.Label>
                  <Col>
                    <p className='fs-7 p-0'>{orderDetail?.vendor?.company_name ?? '-'}</p>
                  </Col>
                </Form.Group>

                <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                  <Form.Label column>Payment Type:</Form.Label>
                  <Col>
                    <p className='fs-7 p-0'>
                      {(() => {
                        if (orderDetail?.payment_type === 'survey') {
                          return `Berbayar & Survey`
                        } else if (orderDetail?.payment_type === 'gratis') {
                          return `Gratis`
                        } else if (orderDetail?.payment_type === 'pemasangan_tanpa_survey') {
                          return `Berbayar & Pemasangan Tanpa Survey`
                        } else {
                          return ``
                        }
                      })()}
                    </p>
                  </Col>
                </Form.Group>
              </Row>
            </div>

            {/* Newest */}
            {(() => {
              if (
                (orderDetail?.payment_type === 'survey' &&
                  orderDetail?.work_orders === null &&
                  orderDetail?.quotation?.length === 0) ||
                (orderDetail?.work_orders?.work_order_status[0]?.work_order_items.length === 0 &&
                  orderDetail?.payment_type === 'survey' &&
                  orderDetail?.quotation?.length === 0)
              ) {
                return (
                  <div className='table-warranty-content'>
                    {orderDetail?.is_overdistance === 1 && (
                      <Form.Text className='fs-8 text-dark'>
                        *Order ini lebih dari{' '}
                        <span className='fw-bolder text-decoration-underline'>10 KM</span> dari toko
                        sehingga dikenakan biaya tambahan
                      </Form.Text>
                    )}

                    <table className='table hover responsive'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th>Item Code</th>
                          <th>Item Name</th>
                          <th>Nama Pemasangan</th>
                          <th>QTY Pemasangan</th>
                        </tr>
                      </thead>

                      <tbody>
                        {orderDetail?.order_details?.map((item: any, index: any) => (
                          <tr key={`${index} - order_detail`}>
                            <td>{item?.item_code}</td>
                            <td>{item?.item_name}</td>
                            <td>{item?.item_notes}</td>
                            <td>{item?.quantity ?? 0}</td>
                          </tr>
                        ))}

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Biaya Survey
                          </td>

                          <td className=' fw-bolder'>Rp. 99.000</td>
                        </tr>

                        {orderDetail?.is_overdistance === 1 && (
                          <>
                            <tr>
                              <td colSpan={3} className='text-end fw-bolder align-middle'>
                                Biaya Tambahan
                              </td>

                              <td className=' fw-bolder'>{`Rp. ${Number(
                                orderDetail?.additional_fee
                              ).toLocaleString('id')}`}</td>
                            </tr>

                            <tr>
                              <td colSpan={3} className='text-end fw-bolder'>
                                Grand Total
                              </td>

                              <td className=' fw-bolder'>{`Rp. ${Number(
                                orderDetail?.grand_total
                              ).toLocaleString('id')}`}</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                )
              } else if (
                ['SURVEYREQ', 'TUKANGSURVEY', 'SURVEYSTART', 'SURVEYDONE'].includes(
                  orderDetail?.work_orders?.work_order_status[0]?.status?.category
                ) &&
                orderDetail?.payment_type === 'survey' &&
                orderDetail?.work_orders?.work_order_status[0]?.work_order_items.length >= 1 &&
                orderDetail?.quotation?.length === 0
              ) {
                return (
                  <div className='table-warranty-content'>
                    <table className='table hover responsive'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th>Nama Pemasangan</th>
                          <th>QTY Pemasangan</th>
                          <th>Satuan</th>
                        </tr>
                      </thead>

                      <tbody>
                        {orderDetail?.work_orders?.work_order_status[0]?.work_order_items.length ? (
                          orderDetail?.work_orders.work_order_status[0].work_order_items.map(
                            (item: any, index: any) => (
                              <tr key={`${index}-work_order_detail`}>
                                <td>
                                  {item.name ?? ''}{' '}
                                  {item.is_customer ? '( Disediakan oleh customer )' : ''}
                                </td>
                                <td>{item.quantity ?? 0}</td>
                                <td>{item.unit ?? ''}</td>
                              </tr>
                            )
                          )
                        ) : (
                          <tr>
                            <td>Item belum diset oleh Tukang/Vendor</td>
                            <td>Quantity belum diset oleh Tukang/Vendor</td>
                            <td>Satuan belum diset oleh Tukang/Vendor</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )
              } else if (
                orderDetail?.quotation?.length >= 1 &&
                orderDetail?.payment_type === 'survey'
              ) {
                return (
                  <div className='table-warranty-content'>
                    <div className='table-warranty-content'>
                      {orderDetail?.is_overdistance === 1 && (
                        <>
                          <Form.Text className='fs-8 text-dark'>
                            *Order ini lebih dari{' '}
                            <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                            toko sehingga dikenakan biaya tambahan
                          </Form.Text>
                        </>
                      )}
                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th>Item Code</th>
                            <th>Item Name</th>
                            <th>Nama Pemasangan</th>
                            <th>QTY Pemasangan</th>
                          </tr>
                        </thead>

                        <tbody>
                          {orderDetail?.order_details?.map((item: any, index: any) => (
                            <tr key={`${index} - order_detail`}>
                              <td>{item?.item_code}</td>
                              <td>{item?.item_name}</td>
                              <td>{item?.item_notes}</td>
                              <td>{item?.quantity ?? 0}</td>
                            </tr>
                          ))}

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              Biaya Survey
                            </td>

                            <td className=' fw-bolder'>Rp. 99.000</td>
                          </tr>

                          {orderDetail?.is_overdistance === 1 && (
                            <>
                              <tr>
                                <td colSpan={3} className='text-end fw-bolder align-middle'>
                                  Biaya Tambahan
                                </td>

                                <td className=' fw-bolder'>{`Rp. ${Number(
                                  orderDetail?.additional_fee
                                ).toLocaleString('id')}`}</td>
                              </tr>

                              <tr>
                                <td colSpan={3} className='text-end fw-bolder'>
                                  Grand Total
                                </td>

                                <td className=' fw-bolder'>{`Rp. ${Number(
                                  orderDetail?.grand_total
                                ).toLocaleString('id')}`}</td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {orderDetail?.quotation?.[0]?.quotation_special === 0 ? (
                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th className='text-center' style={{width: '355px'}}>
                              Jenis Jasa
                            </th>

                            <th className='text-center' style={{width: '100px'}}>
                              QTY
                            </th>

                            <th className='text-center' style={{width: '250px'}}>
                              Satuan
                            </th>

                            <th className='text-center' style={{width: '250px'}}>
                              Final Price
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {orderDetail?.quotation[0]?.quotation_details
                            .filter((x: any) => x.item_type === 2)
                            .map((item: any, index: any) => (
                              <tr key={`${index}-quotation`}>
                                <td>
                                  {item?.name ?? '-'}{' '}
                                  {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                                </td>
                                <td>{item?.quantity ?? 0}</td>
                                <td>{item?.unit}</td>
                                <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString(
                                  'id'
                                )}`}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    ) : (
                      <>
                        <div className='fs-6 fw-bold mb-2'>Jasa Pemasangan Tahap 1</div>

                        {orderDetail?.quotation[0]?.quotation_receipt[0]?.receipt_quotation &&
                          orderDetail?.quotation[0]?.quotation_special === 1 && (
                            <div className='fs-6 fw-bold'>
                              Receipt Quotation Tahap 1 :{' '}
                              <span className='fs-6 fw-semibold'>
                                {orderDetail?.quotation[0]?.quotation_receipt[0]
                                  ?.receipt_quotation ?? '-'}
                              </span>
                            </div>
                          )}

                        <table className='table hover responsive'>
                          <thead className='table-warranty-head'>
                            <tr>
                              <th className='text-center' style={{width: '355px'}}>
                                Jenis Jasa
                              </th>

                              <th className='text-center' style={{width: '100px'}}>
                                QTY
                              </th>

                              <th className='text-center' style={{width: '250px'}}>
                                Satuan
                              </th>

                              <th className='text-center' style={{width: '250px'}}>
                                Final Price
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {orderDetail?.quotation[0]?.quotation_details
                              .filter((x: any) => x.item_type === 2 && x.work_step === 1)
                              .map((item: any, index: any) => (
                                <tr key={`${index}-quotation`}>
                                  <td>
                                    {item?.name ?? '-'}{' '}
                                    {item?.is_customer === true
                                      ? '( Disediakan oleh customer )'
                                      : ''}
                                  </td>
                                  <td>{item?.quantity ?? 0}</td>
                                  <td>{item?.unit}</td>
                                  <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString(
                                    'id'
                                  )}`}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>

                        <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 2</div>

                        {orderDetail?.quotation[0]?.quotation_receipt[1]?.receipt_quotation &&
                          orderDetail?.quotation[0]?.quotation_special === 1 && (
                            <div className='fs-6 fw-bold'>
                              Receipt Quotation Tahap 1 :{' '}
                              <span className='fs-6 fw-semibold'>
                                {orderDetail?.quotation[0]?.quotation_receipt[1]
                                  ?.receipt_quotation ?? '-'}
                              </span>
                            </div>
                          )}

                        <table className='table hover responsive'>
                          <thead className='table-warranty-head'>
                            <tr>
                              <th className='text-center' style={{width: '355px'}}>
                                Jenis Jasa
                              </th>

                              <th className='text-center' style={{width: '100px'}}>
                                QTY
                              </th>

                              <th className='text-center' style={{width: '250px'}}>
                                Satuan
                              </th>

                              <th className='text-center' style={{width: '250px'}}>
                                Final Price
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {orderDetail?.quotation[0]?.quotation_details
                              .filter((x: any) => x.item_type === 2 && x.work_step === 2)
                              .map((item: any, index: any) => (
                                <tr key={`${index}-quotation`}>
                                  <td>
                                    {item?.name ?? '-'}{' '}
                                    {item?.is_customer === true
                                      ? '( Disediakan oleh customer )'
                                      : ''}
                                  </td>
                                  <td>{item?.quantity ?? 0}</td>
                                  <td>{item?.unit}</td>
                                  <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString(
                                    'id'
                                  )}`}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>

                        <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 3</div>

                        {orderDetail?.quotation[0]?.quotation_receipt[2]?.receipt_quotation &&
                          orderDetail?.quotation[0]?.quotation_special === 1 && (
                            <div className='fs-6 fw-bold'>
                              Receipt Quotation Tahap 1 :{' '}
                              <span className='fs-6 fw-semibold'>
                                {orderDetail?.quotation[0]?.quotation_receipt[2]
                                  ?.receipt_quotation ?? '-'}
                              </span>
                            </div>
                          )}

                        <table className='table hover responsive'>
                          <thead className='table-warranty-head'>
                            <tr>
                              <th className='text-center' style={{width: '355px'}}>
                                Jenis Jasa
                              </th>

                              <th className='text-center' style={{width: '100px'}}>
                                QTY
                              </th>

                              <th className='text-center' style={{width: '250px'}}>
                                Satuan
                              </th>

                              <th className='text-center' style={{width: '250px'}}>
                                Final Price
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {orderDetail?.quotation[0]?.quotation_details
                              .filter((x: any) => x.item_type === 2 && x.work_step === 3)
                              .map((item: any, index: any) => (
                                <tr key={`${index}-quotation`}>
                                  <td>
                                    {item?.name ?? '-'}{' '}
                                    {item?.is_customer === true
                                      ? '( Disediakan oleh customer )'
                                      : ''}
                                  </td>
                                  <td>{item?.quantity ?? 0}</td>
                                  <td>{item?.unit}</td>
                                  <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString(
                                    'id'
                                  )}`}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </>
                    )}

                    <table className='table hover responsive'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th className='text-center' style={{width: '355px'}}>
                            Material Yang Dibutuhkan
                          </th>

                          <th className='text-center' style={{width: '100px'}}>
                            QTY
                          </th>

                          <th className='text-center' style={{width: '250px'}}>
                            Satuan
                          </th>

                          <th className='text-center' style={{width: '250px'}}>
                            Final Price
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {orderDetail?.quotation[0]?.quotation_details
                          .filter((x: any) => x.item_type === 1)
                          .map((item: any, index: any) => (
                            <tr key={`${index}-quotation`}>
                              <td>
                                {item?.name ?? '-'}{' '}
                                {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                              </td>
                              <td>{item?.quantity ?? 0}</td>
                              <td>{item?.unit ?? '-'}</td>
                              <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString(
                                'id'
                              )}`}</td>
                            </tr>
                          ))}

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Total Jasa
                          </td>
                          <td className='fw-bolder'>{`Rp. ${parseInt(
                            orderDetail?.quotation[0]?.quotation_details
                              .filter((x: any) => x.item_type === 2)
                              .reduce(
                                (total: any, item: any) => total + parseInt(item.final_price || 0),
                                0
                              )
                          ).toLocaleString('id')}`}</td>
                        </tr>

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Total Material
                          </td>
                          <td className='fw-bolder'>{`Rp. ${parseInt(
                            orderDetail?.quotation[0]?.quotation_details
                              .filter((x: any) => x.item_type === 1)
                              .reduce(
                                (total: any, item: any) => total + parseInt(item.final_price || 0),
                                0
                              )
                          ).toLocaleString('id')}`}</td>
                        </tr>

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Promosi
                          </td>
                          <td className=' fw-bolder'>
                            {`Rp. ${parseInt(
                              orderDetail?.quotation[0]?.quotation_disc ?? 0
                            ).toLocaleString('id')}`}
                          </td>
                        </tr>

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            {`${
                              orderDetail?.quotation[0]?.promotion
                                ? `Additional Promotion (${orderDetail?.quotation[0]?.promotion?.name})`
                                : `Additional Promotion`
                            }`}
                          </td>

                          <td className=' fw-bolder'>
                            {orderDetail?.quotation[0]?.promotion?.promotion_type === 1
                              ? `${orderDetail?.quotation[0]?.promotion?.promotion} %`
                              : `Rp. ${parseInt(
                                  orderDetail?.quotation[0]?.promotion?.promotion ?? 0
                                ).toLocaleString('id')}`}
                          </td>
                        </tr>

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Grand Total
                          </td>
                          <td className=' fw-bolder'>
                            {`Rp. ${parseInt(
                              orderDetail?.quotation[0]?.quotation_grand_total ?? 0
                            ).toLocaleString('id')}`}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              } else if (
                orderDetail?.payment_type === 'gratis' ||
                orderDetail?.payment_type === 'pemasangan_tanpa_survey'
              ) {
                return (
                  <div className='table-warranty-content'>
                    {orderDetail?.is_overdistance === 1 && (
                      <>
                        <Form.Text className='fs-8 text-dark'>
                          *Order ini lebih dari{' '}
                          <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                          toko sehingga dikenakan biaya tambahan
                        </Form.Text>
                      </>
                    )}

                    <table className='table hover responsive'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th>Item Code</th>
                          <th>Item Name</th>
                          <th>Nama Pemasangan</th>
                          <th>QTY Pemasangan</th>
                          {!(orderDetail?.payment_type === 'gratis') && (
                            <>
                              <th>Harga Jasa</th>
                              <th>Jumlah</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetail?.order_details?.map((item: any, index: any) => (
                          <tr key={`${index} - order_detail`}>
                            <td>{item?.item_code}</td>
                            <td>{item?.item_name}</td>
                            <td>{item?.item?.service_name}</td>
                            <td>{item?.quantity ?? 0}</td>
                            {!(orderDetail?.payment_type === 'gratis') && (
                              <>
                                <td>{`Rp. ${parseInt(item?.unit_price || 0)?.toLocaleString(
                                  'id'
                                )}`}</td>
                                <td>{`Rp. ${parseInt(item?.total || 0).toLocaleString('id')}`}</td>
                              </>
                            )}
                          </tr>
                        ))}

                        {orderDetail?.is_overdistance === 1 && (
                          <>
                            <tr>
                              <td
                                colSpan={orderDetail?.payment_type !== 'gratis' ? 5 : 3}
                                className='text-end fw-bolder align-middle'
                              >
                                Biaya Tambahan
                              </td>

                              <td className=' fw-bolder'>{`Rp. ${Number(
                                orderDetail?.additional_fee
                              ).toLocaleString('id')}`}</td>
                            </tr>
                          </>
                        )}

                        <tr>
                          <td
                            colSpan={orderDetail?.payment_type !== 'gratis' ? 5 : 3}
                            className='text-end fw-bolder'
                          >
                            Grand Total
                          </td>

                          <td className=' fw-bolder'>{`Rp. ${Number(
                            orderDetail?.grand_total
                          ).toLocaleString('id')}`}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              }
            })()}
          </Row>

          {orderDetail?.quotation?.[0]?.quotation_special === 1 && (
            <Row className='information-detail mb-3'>
              <Col>
                <div className='fs-3 fw-bold'>Preview Pembayaran</div>

                <table className='table hover responsive'>
                  <thead className='table-warranty-head'>
                    <tr>
                      <th>Tahap Pembayaran</th>
                      <th>Persentase</th>
                      <th>Nominal Pembayaran</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paymentStages.map((stage, index) => (
                      <tr key={index}>
                        <td>{stage.stage}</td>
                        <td>{stage.percentage}</td>
                        <td>{`${stage.amount.toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        })}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Col>
            </Row>
          )}

          <Row>
            <Col>
              <Row className='information-detail'>
                <div className='fs-3 fw-bold'>Informasi Survei Yang Dilakukan Oleh Vendor</div>

                <div className='survey'>
                  <div className='detail-info mb-3'>
                    <p className='fs-5 fw-bold'>Survey dikerjakan pada:</p>

                    <p className='fs-7 p-0'>
                      {orderDetail?.payment_type === 'survey' ? (
                        <>
                          {orderDetail?.work_orders?.work_order_status.length ? (
                            <p className='fs-7'>
                              Tanggal : {formatDateWithTime(orderDetail?.work_orders?.survey_date)}
                            </p>
                          ) : (
                            <p className='fs-7'>Jadwal belum ditentukan oleh vendor</p>
                          )}
                        </>
                      ) : (
                        <p className='fs-7'>Order ini tanpa survey</p>
                      )}
                    </p>
                  </div>

                  <div className='detail-info mb-3'>
                    <p className='fs-5 fw-bold'>Oleh:</p>

                    {orderDetail?.payment_type === 'survey' ? (
                      <>
                        {orderDetail?.work_orders?.work_order_status.length ? (
                          <p className='fs-7'>
                            {orderDetail?.work_orders?.work_order_tukang
                              .filter((x: any) => x.type === 1)
                              .map((item: any) => item?.tukang?.full_name)
                              .join(', ')}
                          </p>
                        ) : (
                          <p className='fs-7'>Jadwal belum ditentukan oleh vendor</p>
                        )}
                      </>
                    ) : (
                      <p className='fs-7'>Order ini tanpa survey</p>
                    )}
                  </div>

                  <div className='detail-info mb-3'>
                    <p className='fs-5 fw-bold'>Sesi:</p>

                    {orderDetail?.work_orders?.work_order_status.length ? (
                      <p className='fs-7'>
                        {orderDetail?.work_orders?.session === 1
                          ? 'Sesi Pagi'
                          : orderDetail?.work_orders?.session === 2
                          ? 'Sesi Siang'
                          : orderDetail?.work_orders?.session === 3
                          ? 'Sesi Sore'
                          : orderDetail?.work_orders?.session === 4
                          ? 'Sesi Malam'
                          : 'Sesi belum ditentukan oleh vendor'}
                      </p>
                    ) : (
                      <p className='fs-7'>Sesi belum ditentukan oleh vendor</p>
                    )}
                  </div>
                </div>
              </Row>
            </Col>

            <Col>
              <Row className='information-detail'>
                <div className='fs-3 fw-bold'>Informasi Pengerjaan Yang Dilakukan Oleh Vendor</div>

                <div className='work-date'>
                  <p className='fs-5 fw-bold'>Pekerjaan dilakukan pada:</p>

                  <div className='detail-info mb-3'>
                    {orderDetail?.work_orders !== null &&
                    orderDetail?.work_orders?.work_start_date !== null ? (
                      <div>
                        <p className='fs-7'>
                          MULAI{' '}
                          <span className='ms-5'>
                            {formatDateWithTime(orderDetail?.work_orders?.work_start_date)}
                          </span>
                        </p>

                        <p className='fs-7'>
                          SELESAI{' '}
                          <span className='ms-3'>
                            {formatDateWithTime(orderDetail?.work_orders?.work_end_date)}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className='fs-7'>Jadwal belum ditentukan oleh vendor</p>
                    )}
                  </div>

                  <div className='detail-info mb-3'>
                    <p className='fs-5 fw-bold'>Oleh:</p>

                    {orderDetail?.work_orders?.work_order_tukang?.filter((x: any) => x.type === 2)
                      ?.length ? (
                      <p className='fs-7'>
                        {orderDetail?.work_orders?.work_order_tukang
                          ?.filter((x: any) => x.type === 2)
                          ?.map((item: any) => item?.tukang?.full_name)
                          .join(', ')}
                      </p>
                    ) : (
                      <p className='fs-7'>Tukang belum diset oleh vendor</p>
                    )}
                  </div>

                  <div className='detail-info mb-3'>
                    <p className='fs-5 fw-bold'>Sesi:</p>

                    {orderDetail?.work_orders?.work_order_status.length ? (
                      <p className='fs-7'>
                        {orderDetail?.work_orders?.session === 1
                          ? 'Sesi Pagi'
                          : orderDetail?.work_orders?.session === 2
                          ? 'Sesi Siang'
                          : orderDetail?.work_orders?.session === 3
                          ? 'Sesi Sore'
                          : orderDetail?.work_orders?.session === 4
                          ? 'Sesi Malam'
                          : 'Sesi belum ditentukan oleh vendor'}
                      </p>
                    ) : (
                      <p className='fs-7'>Sesi belum ditentukan oleh vendor</p>
                    )}
                  </div>
                </div>
              </Row>
            </Col>
          </Row>

          <Row className='mt-3 mb-3'>
            <div className='order-history'>
              <div className='fs-3 fw-bold text-success mb-4'>Order History</div>
              <Steps
                className='order-history-timeline'
                current={orderHistory.findIndex((step) =>
                  step.value.includes(
                    orderDetail?.work_orders?.work_order_status.length > 0
                      ? orderDetail?.work_orders?.work_order_status[0]?.status?.id
                      : orderDetail?.project_status_id
                  )
                )}
                labelPlacement='vertical'
                items={orderHistory}
              />
            </div>
          </Row>

          <Row className='mt-3 mb-3'>
            {selectedOrder?.order_detail?.complaints &&
              selectedOrder?.order_detail?.complaints?.length >= 1 && (
                <div className='complaint-history'>
                  <div className='fs-3 fw-bold text-danger mb-4'>Complaint History</div>
                  <Steps
                    className='complaint-history-timeline'
                    current={complaintHistory.findIndex((step) =>
                      step.value.includes(
                        selectedOrder?.order_detail?.work_orders?.work_order_status.length > 0
                          ? selectedOrder?.order_detail?.work_orders?.work_order_status[0]?.status
                              ?.id
                          : selectedOrder?.order_detail?.project_status_id
                      )
                    )}
                    labelPlacement='vertical'
                    items={complaintHistory}
                  />
                </div>
              )}
          </Row>
        </Modal.Body>
      </Modal>
    </section>
  )
}

export {ViewCalendarHO}
