import React, {useState, useEffect} from 'react'
import {KTSVG, toAbsoluteUrl} from '../../../_metronic/helpers'
import {Topbar} from '../../../_metronic/layout/components/header/Topbar'
import {useLayout} from '../../../_metronic/layout/core'
import {formatDate, formatDateWithTime} from '../../../_metronic/helpers'

import {Orders} from '../../interfaces/order'
import './DetailOrderWithoutAuth.css'

// External Components
import axios from 'axios'
import Swal from 'sweetalert2'
import clsx from 'clsx'
import {Image, Steps, Skeleton, Upload} from 'antd'
import {InboxOutlined} from '@ant-design/icons'
import {useLocation, Link, useNavigate} from 'react-router-dom'
import {Row, Col, Form, ListGroup, Table, Modal, Card, Button} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faDownload} from '@fortawesome/free-solid-svg-icons'

const {Dragger} = Upload

interface Status {
  value: number | null
  category: string
}

interface OrderHistory {
  order_id: number
  order_status: string
  created_at: string
  updated_by: string
}

const DetailOrderWithoutAuth = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const orderId = queryParams.get('order_id')

  const phoneNumber = queryParams.get('phone_number')
  const emailMember = queryParams.get('email_member')
  const memberNumber = queryParams.get('member_number')

  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true)
  const [loadingUploadReceipt, setLoadingUploadReceipt] = useState<boolean>(false)

  const {config, classes, attributes} = useLayout()
  const {header, aside} = config

  // Order
  const [order, setOrder] = useState<Orders>({
    id: null,
    member_id: null,
    seles_id: null,
    store_id: null,
    project_status_id: null,
    request_survey: '',
    request_work: '',
    notes: '',
    vendor_id: null,
    tukang_id: null,
    project_address: '',
    project_number: '',
    receipt_number: '',
    receipt_path: '',
    total_estimate_workdays: null,
    payment_type: '',
    grand_total: '',
    grand_total_comission: '',
    is_overdistance: 0,
    additional_fee: 0,
    print_counter: 0,
    created_by: null,
    updated_by: null,
    created_at: '',
    order_details: [],
    m_order_details: [],
    order_files: [],
    complaints: [],
    work_orders: {
      work_order_status: [],
    },
    quotation: [],
    order_history: null,
  })

  const trackingOrderData = async (
    orderId: string | null,
    phoneNumbers: string | null,
    emailMembers: string | null,
    memberNumbers: string | null
  ) => {
    const queryPhoneNumber = phoneNumber ? `&phone_number=${phoneNumbers}` : ``
    const queryEmailMember = emailMember ? `&email_member=${emailMembers}` : ``
    const queryMemberNumber = memberNumber ? `&member_number=${memberNumbers}` : ``

    try {
      await axios
        .get(
          `${apiUrl}/orders/data?order_id=${orderId}${queryPhoneNumber}${queryEmailMember}${queryMemberNumber}`,
          {
            headers: {
              Accept: 'application/json',
            },
          }
        )
        .then((response) => {
          const data = response.data.data
          setOrder(data)
          setIsLoadingPage(false)

          if (data?.order_history) {
            const orderHistory = data?.order_history?.map((item: any) => ({
              order_id: item.order_id,
              order_status: item?.status?.description,
              updated_by: item?.created_at?.username,
              created_at: item?.created_at
                ? `${formatDateWithTime(item?.created_at)} ${
                    item.created_by ? `oleh ${item?.created_by?.username}` : ''
                  }`
                : '-',
            }))

            setOrderHistorical(orderHistory)
          }
        })
    } catch (error: any) {
      if (error.response.data.statusCode === 400 || error.response.data.statusCode === 404) {
        navigate('/error/500')
      }
    }
  }

  useEffect(() => {
    if (orderId || phoneNumber || emailMember || memberNumber) {
      trackingOrderData(orderId, phoneNumber, emailMember, memberNumber)
    }
  }, [orderId, phoneNumber, emailMember, memberNumber])

  const [status, setStatus] = useState<Status[]>([])

  // Get Status
  const getStatus = async () => {
    try {
      const response = await axios.get(`${apiUrl}/status?take=0`, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempStatus = response.data.data.map((item: any) => ({
          value: item.id,
          category: item.category,
        }))

        setStatus(tempStatus)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    getStatus()
  }, [])

  // Order History
  const [orderHistorical, setOrderHistorical] = useState<OrderHistory[]>([])

  const [previewImage, setPreviewImage] = useState<any>()
  const [visible, setVisible] = useState(false)
  const handleClose = () => setVisible(false)

  // Complaint Receipt
  const [visibleComplaint, setVisibleComplaint] = useState(false)

  // Reschedule
  const [visibleReschedule, setVisibleReschedule] = useState(false)

  // Work Before & Work After
  const [visibleWorkBefore, setVisibleWorkBefore] = useState(false)
  const [visibleWorkAfter, setVisibleWorkAfter] = useState(false)

  // Quotation Receipt
  const quotationGrandTotal = parseInt(order?.quotation?.[0]?.quotation_grand_total)
  const [visibleQuotationReceipt, setVisibleQuotationReceipt] = useState(false)
  const [visibleQuotationFiles, setVisibleQuotationFiles] = useState(false)

  const statusData: Status[] = status
  const getStatuses = (categories: string[]) =>
    statusData.filter((status: any) => categories.includes(status.category)).map((x) => x.value)

  // Statuses for Order Timeline
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
    'REWORKREQ',
    'REWORKSTART',
    'REWORKEND',
  ])

  const orderHistory = [
    {title: 'Booking Process', value: bookStatuses},
    {title: 'Survey Process', value: surveyStatuses},
    {title: 'Work in Progress', value: workStatuses},
    {title: 'Work Done', value: workDoneStatuses},
  ]

  // Statuses for Complaint Timeline
  const complaintReceivedStatuses = getStatuses(['INVESTIGATED'])
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
    calculatePaymentStages(quotationGrandTotal)
  }, [quotationGrandTotal])

  // Upload Multiple Receipt
  const [receiptQuotation, setReceiptQuotation] = useState<Array<File | null>>([])
  const [showModal, setShowModal] = useState(false)

  const handleUploadReceipt = () => {
    setShowModal(true)
  }
  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleFileChange = (event: any) => {
    const files = event.fileList.map((file: any) => file.originFileObj)
    setReceiptQuotation(files)
  }

  const handleFileRemove = (file: any) => {
    const updatedFiles = receiptQuotation.filter((item) => item !== file.originFileObj)
    setReceiptQuotation(updatedFiles)
  }

  const handleSubmitReceipt = async () => {
    setLoadingUploadReceipt(true)
    const formData = new FormData()

    if (receiptQuotation?.length) {
      receiptQuotation.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`quotation_receipt_customer`, item, item.name)
        }
      })
    }

    await axios
      .post(`${apiUrl}/orders/receipt-public/${order.id}`, formData, {
        headers: {
          Accept: 'application/json',
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })
      .then((response) => {
        if (response.data.status === 201 || response.data.status === 200) {
          Swal.fire({
            title: 'Success',
            text: 'Berhasil Upload Bukti Pembayaran',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          })

          setLoadingUploadReceipt(false)
        } else {
          Swal.fire({
            title: 'Error',
            text: response.data.message,
            icon: 'error',
          })

          setLoadingUploadReceipt(false)
        }

        window.location.reload()
      })
      .catch((error) => {
        setLoadingUploadReceipt(false)

        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
        })
      })
  }

  return (
    <div className='wrapper d-flex flex-column flex-row-fluid' id='page_without_order'>
      <div
        id='kt_header_page_without_auth'
        className={clsx('header', classes.header.join(' '), 'align-items-stretch bg-primary')}
        {...attributes.headerMenu}
      >
        <div
          className={clsx(
            classes.headerContainer.join(' '),
            'd-flex align-items-stretch justify-content-between'
          )}
        >
          {aside.display && (
            <div className='d-flex align-items-center d-lg-none ms-n3 me-1' title='Show aside menu'>
              <div
                className='btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px'
                id='kt_aside_mobile_toggle'
              >
                <KTSVG
                  path='/media/icons/duotune/abstract/abs015.svg'
                  className='svg-icon-2x mt-1'
                />
              </div>
            </div>
          )}

          {!aside.display && (
            <div className='d-flex align-items-center flex-grow-1 flex-lg-grow-0'>
              <Link to='/dashboard' className='d-lg-none'>
                <img
                  alt='Logo'
                  src={toAbsoluteUrl('/media/logos/default-small.svg')}
                  className='h-30px'
                />
              </Link>
            </div>
          )}

          <div className='d-flex align-items-stretch justify-content-between flex-lg-grow-1'>
            {header.left === 'menu' && (
              <div className='d-flex align-items-stretch' id='kt_header_nav'>
                <div
                  className='header-menu align-items-stretch'
                  data-kt-drawer='true'
                  data-kt-drawer-name='header-menu'
                  data-kt-drawer-activate='{default: true, lg: false}'
                  data-kt-drawer-overlay='true'
                  data-kt-drawer-width="{default:'200px', '300px': '250px'}"
                  data-kt-drawer-direction='end'
                  data-kt-drawer-toggle='#kt_header_menu_mobile_toggle'
                  data-kt-swapper='true'
                  data-kt-swapper-mode='prepend'
                  data-kt-swapper-parent="{default: '#kt_body', lg: '#kt_header_nav'}"
                >
                  <div
                    className='menu menu-lg-rounded menu-column menu-lg-row menu-state-bg menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-400 fw-bold my-5 my-lg-0 align-items-stretch'
                    id='#kt_header_menu'
                    data-kt-menu='true'
                  >
                    <div id='kt_page_title' className={clsx('page-title d-flex')}>
                      <h1 className='d-flex align-items-center  text-light-md-black fw-bolder my-1 fs-1'>
                        {`DETAIL ORDER ${order?.id} - ${order?.members?.full_name}`}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className='d-flex align-items-stretch flex-shrink-0'>{/* <Topbar /> */}</div>
          </div>
        </div>
      </div>

      <div
        id='kt_content_without_auth'
        className='content d-flex flex-column flex-column-fluid'
        style={{marginTop: '-5.5rem'}}
      >
        <section id='detail-order-without-auth'>
          <div className='d-flex justify-content-end mb-5'>
            <Button
              className='btn-dark-primary d-flex justify-content-center align-items-center w-50 m-0'
              disabled={loadingUploadReceipt}
              onClick={handleUploadReceipt}
            >
              {loadingUploadReceipt === false ? (
                <>
                  <FontAwesomeIcon icon={faDownload} size='lg' className='me-2' />
                  Upload Bukti Pembayaran
                </>
              ) : (
                'Uploading...'
              )}
            </Button>
          </div>

          <Card>
            <Card.Body>
              <div className='form-wrapper'>
                <Row className='form-header'>
                  <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                    <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                      <Form.Label className='fs-4 fw-bold'>
                        Nama Toko :{' '}
                        <span className='fs-4 ms-2 fw-normal'>
                          {order?.store?.store_name ?? ''}
                        </span>
                      </Form.Label>
                    </Skeleton>
                  </Col>

                  <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                    <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                      <Form.Label className='fs-4 fw-bold'>
                        Order ID : <span className='fs-4 ms-2 fw-normal'>{order?.id}</span>
                      </Form.Label>
                    </Skeleton>
                  </Col>

                  <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                    <Col>
                      <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                        <Form.Label className='fs-4 fw-bold'>
                          Receipt Number :
                          <span className='fs-4 ms-2 fw-normal'>
                            {order?.receipt_number ?? '-'}
                          </span>
                        </Form.Label>

                        {order?.quotation[0]?.receipt_quotation &&
                          order?.quotation[0]?.quotation_special === 0 && (
                            <Form.Label className='fs-4 fw-bold'>
                              Receipt Quotation :
                              <span className='fs-4 ms-2 fw-normal'>
                                {order?.quotation[0]?.receipt_quotation ?? '-'}
                              </span>
                            </Form.Label>
                          )}
                      </Skeleton>
                    </Col>

                    <Col>
                      <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                        <Form.Label className='fs-4 fw-bold'>
                          Order Status :
                          <span className='fs-4 ms-2 fw-bold text-success'>
                            {order?.status?.description}
                          </span>
                        </Form.Label>
                      </Skeleton>
                    </Col>
                  </Col>
                </Row>

                <Row className='information-detail'>
                  <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='costumer-info mb-5'>
                    <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                      <div className='fs-3 fw-bold'>Informasi Pembeli</div>

                      <Row>
                        <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                          <Form.Group as={Row} className='detail-info'>
                            <Form.Label column sm='6'>
                              No Member :
                            </Form.Label>
                            <Col sm='6'>
                              <p className='fs-7'>{order?.members?.member_number}</p>
                            </Col>
                          </Form.Group>

                          <Form.Group as={Row} className='detail-info'>
                            <Form.Label column sm='6'>
                              Customer Name :
                            </Form.Label>
                            <Col sm='6'>
                              <p className='fs-7'>{order?.members?.full_name}</p>
                            </Col>
                          </Form.Group>

                          <Form.Group as={Row} className='detail-info'>
                            <Form.Label column sm='6'>
                              Alamat Pemasangan :
                            </Form.Label>
                            <Col sm='6'>
                              <p className='fs-7'>{order?.project_address}</p>
                            </Col>
                          </Form.Group>
                        </Col>

                        <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                          <Form.Group as={Row} className='detail-info'>
                            <Form.Label column sm='5'>
                              Nomor Whatsapp :
                            </Form.Label>
                            <Col sm='7'>
                              <p className='fs-7'>
                                {!order?.project_number.startsWith('0')
                                  ? `+62${order?.members?.whatsapp_number}`
                                  : '-'}
                              </p>
                            </Col>
                          </Form.Group>

                          <Form.Group as={Row} className='detail-info'>
                            <Form.Label column sm='5'>
                              Nomor Telepon :
                            </Form.Label>
                            <Col sm='7'>
                              <p className='fs-7'>
                                {order?.project_number.startsWith('0')
                                  ? order?.members?.phone_number
                                  : '-'}
                              </p>
                            </Col>
                          </Form.Group>

                          <Form.Group as={Row} className='detail-info'>
                            <Form.Label column sm='5'>
                              Alamat Email :
                            </Form.Label>
                            <Col sm='7'>
                              <p className='fs-7'>{order?.members?.email} </p>
                            </Col>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Skeleton>
                  </Col>

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='sales-info mb-5'>
                    <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                      <div className='fs-3 fw-bold'>Informasi Penjual</div>

                      <Form.Group as={Row} className='detail-info'>
                        <Form.Label column sm='3'>
                          Sales ID :
                        </Form.Label>
                        <Col sm='9'>
                          <p className='fs-7'>{order?.sales?.id} </p>
                        </Col>
                      </Form.Group>

                      <Form.Group as={Row} className='detail-info'>
                        <Form.Label column sm='3'>
                          Sales Person :
                        </Form.Label>
                        <Col sm='9'>
                          <p className='fs-7'>{order?.sales?.full_name} </p>
                        </Col>
                      </Form.Group>
                    </Skeleton>
                  </Col>
                </Row>
              </div>

              <Row className='table-warranty d-flex align-items-center mb-3'>
                <div className='table-title-warranty'>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 2}}>
                    <div className='fs-3 fw-bold'>Informasi Pemasangan</div>

                    <Row>
                      <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                        <Form.Label column>
                          {(() => {
                            if (order?.payment_type === 'survey') {
                              return `Tanggal Request Survey`
                            } else {
                              return `Tanggal request pemasangan`
                            }
                          })()}
                        </Form.Label>
                        <Col>
                          <p className='fs-7 p-0'>{formatDate(order?.request_survey)}</p>
                        </Col>
                      </Form.Group>

                      {order?.payment_type === 'survey' && (
                        <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                          <Form.Label column>Tanggal request pemasangan</Form.Label>
                          <Col>
                            <p className='fs-7 p-0'>
                              {order?.request_work
                                ? formatDate(order?.request_work)
                                : 'Tanggal belum diset oleh toko'}
                            </p>
                          </Col>
                        </Form.Group>
                      )}

                      <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                        <Form.Label column>Informasi Vendor Pemasangan :</Form.Label>
                        <Col>
                          <p className='fs-7 p-0'>{order?.vendor?.company_name ?? '-'}</p>
                        </Col>
                      </Form.Group>

                      <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                        <Form.Label column>Payment Type:</Form.Label>
                        <Col>
                          <p className='fs-7 p-0'>
                            {(() => {
                              if (order?.payment_type === 'survey') {
                                return `Berbayar & Survey`
                              } else if (order?.payment_type === 'gratis') {
                                return `Gratis`
                              } else if (order?.payment_type === 'pemasangan_tanpa_survey') {
                                return `Berbayar & Pemasangan Tanpa Survey`
                              } else {
                                return ``
                              }
                            })()}
                          </p>
                        </Col>
                      </Form.Group>
                    </Row>
                  </Skeleton>
                </div>

                <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                  {(() => {
                    if (
                      (order?.payment_type === 'survey' &&
                        order?.work_orders === null &&
                        order?.quotation?.length === 0) ||
                      (order?.work_orders?.work_order_status[0]?.work_order_items.length === 0 &&
                        order?.payment_type === 'survey' &&
                        order?.quotation?.length === 0)
                    ) {
                      return (
                        <div className='table-warranty-content'>
                          {order?.is_overdistance === 1 && (
                            <>
                              <Form.Text className='fs-8 text-dark'>
                                *Order ini lebih dari{' '}
                                <span className='fw-bolder text-decoration-underline'>10 KM</span>{' '}
                                dari toko sehingga dikenakan biaya tambahan
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
                              {order?.m_order_details?.map((item: any, index: any) => (
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

                              {order?.is_overdistance === 1 && (
                                <>
                                  <tr>
                                    <td colSpan={3} className='text-end fw-bolder align-middle'>
                                      Biaya Tambahan
                                    </td>

                                    <td className=' fw-bolder'>{`Rp. ${Number(
                                      order?.additional_fee
                                    ).toLocaleString('id')}`}</td>
                                  </tr>

                                  <tr>
                                    <td colSpan={3} className='text-end fw-bolder'>
                                      Grand Total
                                    </td>

                                    <td className=' fw-bolder'>{`Rp. ${Number(
                                      order?.grand_total
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
                        order?.work_orders?.work_order_status[0]?.status?.category
                      ) &&
                      order?.payment_type === 'survey' &&
                      order?.work_orders?.work_order_status[0]?.work_order_items.length >= 1 &&
                      order?.quotation?.length === 0
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
                              {order?.work_orders?.work_order_status[0]?.work_order_items.length ? (
                                order.work_orders.work_order_status[0].work_order_items.map(
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
                    } else if (order?.quotation?.length >= 1 && order?.payment_type === 'survey') {
                      return (
                        <div className='table-warranty-content'>
                          {order?.quotation?.[0]?.quotation_special === 0 ? (
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
                                {order?.quotation[0]?.quotation_details
                                  .filter((x: any) => x.item_type === 2)
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
                          ) : (
                            <>
                              <div className='fs-6 fw-bold mb-2'>Jasa Pemasangan Tahap 1</div>

                              {order?.quotation[0]?.quotation_receipt[0]?.receipt_quotation &&
                                order?.quotation[0]?.quotation_special === 1 && (
                                  <div className='fs-6 fw-bold'>
                                    Receipt Quotation Tahap 1 :{' '}
                                    <span className='fs-6 fw-semibold'>
                                      {order?.quotation[0]?.quotation_receipt[0]
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
                                  {order?.quotation[0]?.quotation_details
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

                              {order?.quotation[0]?.quotation_receipt[1]?.receipt_quotation &&
                                order?.quotation[0]?.quotation_special === 1 && (
                                  <div className='fs-6 fw-bold'>
                                    Receipt Quotation Tahap 1 :{' '}
                                    <span className='fs-6 fw-semibold'>
                                      {order?.quotation[0]?.quotation_receipt[1]
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
                                  {order?.quotation[0]?.quotation_details
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

                              {order?.quotation[0]?.quotation_receipt[2]?.receipt_quotation &&
                                order?.quotation[0]?.quotation_special === 1 && (
                                  <div className='fs-6 fw-bold'>
                                    Receipt Quotation Tahap 1 :{' '}
                                    <span className='fs-6 fw-semibold'>
                                      {order?.quotation[0]?.quotation_receipt[2]
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
                                  {order?.quotation[0]?.quotation_details
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
                              {order?.quotation[0]?.quotation_details
                                .filter((x: any) => x.item_type === 1)
                                .map((item: any, index: any) => (
                                  <tr key={`${index}-quotation`}>
                                    <td>
                                      {item?.name ?? '-'}{' '}
                                      {item?.is_customer === true
                                        ? '( Disediakan oleh customer )'
                                        : ''}
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
                                  order?.quotation[0]?.quotation_details
                                    .filter((x: any) => x.item_type === 2)
                                    .reduce(
                                      (total: any, item: any) =>
                                        total + parseInt(item.final_price || 0),
                                      0
                                    )
                                ).toLocaleString('id')}`}</td>
                              </tr>

                              <tr>
                                <td colSpan={3} className='text-end fw-bolder'>
                                  Total Material
                                </td>
                                <td className='fw-bolder'>{`Rp. ${parseInt(
                                  order?.quotation[0]?.quotation_details
                                    .filter((x: any) => x.item_type === 1)
                                    .reduce(
                                      (total: any, item: any) =>
                                        total + parseInt(item.final_price || 0),
                                      0
                                    )
                                ).toLocaleString('id')}`}</td>
                              </tr>

                              <tr>
                                <td colSpan={3} className='text-end fw-bolder'>
                                  Promosi
                                </td>
                                <td className=' fw-bolder'>
                                  {`Rp. ${
                                    order?.quotation[0]?.quotation_disc ?? (0).toLocaleString('id')
                                  }`}
                                </td>
                              </tr>

                              <tr>
                                <td colSpan={3} className='text-end fw-bolder'>
                                  {`${
                                    order?.quotation[0]?.promotion
                                      ? `Additional Promotion (${order?.quotation[0]?.promotion?.name})`
                                      : `Additional Promotion`
                                  }`}
                                </td>

                                <td className=' fw-bolder'>
                                  {order?.quotation[0]?.promotion?.promotion_type === 1
                                    ? `${order?.quotation[0]?.promotion?.promotion} %`
                                    : `Rp. ${parseInt(
                                        order?.quotation[0]?.promotion?.promotion ?? 0
                                      ).toLocaleString('id')}`}
                                </td>
                              </tr>

                              <tr>
                                <td colSpan={3} className='text-end fw-bolder'>
                                  Grand Total
                                </td>
                                <td className=' fw-bolder'>
                                  {`Rp. ${parseInt(
                                    order?.quotation[0]?.quotation_grand_total ?? 0
                                  ).toLocaleString('id')}`}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )
                    } else if (
                      order?.payment_type === 'gratis' ||
                      order?.payment_type === 'pemasangan_tanpa_survey'
                    ) {
                      return (
                        <div className='table-warranty-content'>
                          {order?.is_overdistance === 1 && (
                            <>
                              <Form.Text className='fs-8 text-dark'>
                                *Order ini lebih dari{' '}
                                <span className='fw-bolder text-decoration-underline'>10 KM</span>{' '}
                                dari toko sehingga dikenakan biaya tambahan
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
                                {!(order?.payment_type === 'gratis') && (
                                  <>
                                    <th>Harga Jasa</th>
                                    <th>Jumlah</th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {order?.m_order_details?.map((item: any, index: any) => (
                                <tr key={`${index} - order_detail`}>
                                  <td>{item?.item_code}</td>
                                  <td>{item?.item_name}</td>
                                  <td>{item?.item?.service_name}</td>
                                  <td>{item?.quantity ?? 0}</td>
                                  {!(order?.payment_type === 'gratis') && (
                                    <>
                                      <td>{`Rp. ${parseInt(item?.unit_price || 0)?.toLocaleString(
                                        'id'
                                      )}`}</td>
                                      <td>{`Rp. ${parseInt(item?.total || 0).toLocaleString(
                                        'id'
                                      )}`}</td>
                                    </>
                                  )}
                                </tr>
                              ))}

                              {order?.is_overdistance === 1 && (
                                <>
                                  <tr>
                                    <td
                                      colSpan={order?.payment_type !== 'gratis' ? 5 : 3}
                                      className='text-end fw-bolder align-middle'
                                    >
                                      Biaya Tambahan
                                    </td>

                                    <td className=' fw-bolder'>{`Rp. ${Number(
                                      order?.additional_fee
                                    ).toLocaleString('id')}`}</td>
                                  </tr>
                                </>
                              )}

                              <tr>
                                <td
                                  colSpan={order?.payment_type !== 'gratis' ? 5 : 3}
                                  className='text-end fw-bolder'
                                >
                                  Grand Total
                                </td>

                                <td className=' fw-bolder'>{`Rp. ${Number(
                                  order?.grand_total
                                ).toLocaleString('id')}`}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )
                    }
                  })()}
                </Skeleton>
              </Row>

              {order?.quotation?.[0]?.quotation_special === 1 && (
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
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
                </Skeleton>
              )}

              <Row>
                <Col>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                    <Row className='information-detail'>
                      <div className='fs-3 fw-bold'>
                        Informasi Survei Yang Dilakukan Oleh Vendor
                      </div>

                      <div className='survey'>
                        <div className='detail-info mb-3'>
                          <p className='fs-5 fw-bold'>Survey dikerjakan pada:</p>

                          <p className='fs-7 p-0'>
                            {order?.payment_type === 'survey' ? (
                              <>
                                {order?.work_orders?.work_order_status.length ? (
                                  <p className='fs-7'>
                                    Tanggal : {formatDateWithTime(order?.work_orders?.survey_date)}
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

                          {order?.payment_type === 'survey' ? (
                            <>
                              {order?.work_orders?.work_order_status.length ? (
                                <p className='fs-7'>
                                  {order?.work_orders?.work_order_tukang
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

                          {order?.work_orders?.work_order_status.length ? (
                            <p className='fs-7'>
                              {order?.work_orders?.session === 1
                                ? 'Sesi Pagi'
                                : order?.work_orders?.session === 2
                                ? 'Sesi Siang'
                                : order?.work_orders?.session === 3
                                ? 'Sesi Sore'
                                : order?.work_orders?.session === 4
                                ? 'Sesi Malam'
                                : 'Sesi belum ditentukan oleh vendor'}
                            </p>
                          ) : (
                            <p className='fs-7'>Sesi belum ditentukan oleh vendor</p>
                          )}
                        </div>
                      </div>
                    </Row>
                  </Skeleton>
                </Col>

                <Col>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                    <Row className='information-detail'>
                      <div className='fs-3 fw-bold'>
                        Informasi Pengerjaan Yang Dilakukan Oleh Vendor
                      </div>

                      <div className='work-date'>
                        <p className='fs-5 fw-bold'>Pekerjaan dilakukan pada:</p>

                        <div className='detail-info mb-3'>
                          {order?.work_orders !== null &&
                          order?.work_orders?.work_start_date !== null ? (
                            <div>
                              <p className='fs-7'>
                                MULAI{' '}
                                <span className='ms-5'>
                                  {formatDateWithTime(order?.work_orders?.work_start_date)}
                                </span>
                              </p>

                              <p className='fs-7'>
                                SELESAI{' '}
                                <span className='ms-3'>
                                  {formatDateWithTime(order?.work_orders?.work_end_date)}
                                </span>
                              </p>
                            </div>
                          ) : (
                            <p className='fs-7'>Jadwal belum ditentukan oleh vendor</p>
                          )}
                        </div>

                        <div className='detail-info mb-3'>
                          <p className='fs-5 fw-bold'>Oleh:</p>

                          {order?.work_orders?.work_order_tukang?.filter((x: any) => x.type === 2)
                            ?.length ? (
                            <p className='fs-7'>
                              {order?.work_orders?.work_order_tukang
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

                          {order?.work_orders?.work_order_status.length ? (
                            <p className='fs-7'>
                              {order?.work_orders?.session === 1
                                ? 'Sesi Pagi'
                                : order?.work_orders?.session === 2
                                ? 'Sesi Siang'
                                : order?.work_orders?.session === 3
                                ? 'Sesi Sore'
                                : order?.work_orders?.session === 4
                                ? 'Sesi Malam'
                                : 'Sesi belum ditentukan oleh vendor'}
                            </p>
                          ) : (
                            <p className='fs-7'>Sesi belum ditentukan oleh vendor</p>
                          )}
                        </div>
                      </div>
                    </Row>
                  </Skeleton>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                    <Row className='information-detail'>
                      <div className='fs-3 fw-bold'>Catatan Order</div>

                      <div className='detail-info mb-3'>
                        <p className='fs-5 fw-bold'>Catatan Toko :</p>

                        <p className='fs-7'>
                          {order.notes ? order.notes : 'Toko tidak memberikan catatan'}
                        </p>
                      </div>

                      <div className='detail-info mb-3'>
                        <p className='fs-5 fw-bold'>Catatan Tukang :</p>

                        <p className='fs-7'>
                          {order?.work_orders?.work_order_status[0]?.description
                            ? order?.work_orders?.work_order_status[0]?.description
                            : 'Tukang tidak memberikan catatan'}
                        </p>
                      </div>

                      <div className='detail-info mb-3'>
                        <p className='fs-5 fw-bold'>Intruksi Spesial :</p>

                        <p className='fs-7'>
                          {order?.quotation[0]?.description
                            ? order?.quotation[0]?.description
                            : 'Vendor tidak memberikan catatan'}
                        </p>
                      </div>
                    </Row>
                  </Skeleton>
                </Col>
              </Row>

              {order?.order_files.length >= 1 ? (
                <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
                  <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                    <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                      <Form.Label className='mt-3'>Bukti Receipt :</Form.Label>
                      <ListGroup>
                        {order?.order_files.map((item: any) => (
                          <ListGroup.Item
                            key={item.id}
                            action
                            style={{cursor: 'pointer'}}
                            onClick={() => {
                              setPreviewImage(item.path)
                              setVisible(true)
                            }}
                          >
                            {item.path}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>

                      {previewImage && (
                        <div>
                          {previewImage.endsWith('.pdf') ? (
                            <>
                              <Modal
                                dialogClassName='modal-show-pdf'
                                centered
                                show={visible}
                                onHide={handleClose}
                              >
                                <Modal.Header closeButton>
                                  <Modal.Title>File - {previewImage}</Modal.Title>
                                </Modal.Header>

                                <Modal.Body>
                                  <iframe
                                    key={previewImage}
                                    width='100%'
                                    height='100%'
                                    src={`${apiUrl}/public/receipt/${previewImage}`}
                                    style={{border: 'none'}}
                                  />
                                </Modal.Body>
                              </Modal>
                            </>
                          ) : (
                            <Image
                              key={previewImage}
                              width={200}
                              style={{display: 'none'}}
                              src={`${apiUrl}/public/receipt/${previewImage}`}
                              preview={{
                                visible,
                                src: `${apiUrl}/public/receipt/${previewImage}`,
                                onVisibleChange: (value) => {
                                  setVisible(value)
                                },
                              }}
                            />
                          )}
                        </div>
                      )}
                    </Skeleton>
                  </Col>

                  <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                    <Form.Label className='mt-3'>Bukti Receipt Quotation :</Form.Label>
                    <ListGroup>
                      {order?.quotation[0]?.quotation_files
                        .filter((x: any) => x.type === 2)
                        .map((item: any) => (
                          <ListGroup.Item
                            key={item.id}
                            action
                            style={{cursor: 'pointer'}}
                            onClick={() => {
                              setPreviewImage(item.path)
                              setVisibleQuotationReceipt(true)
                            }}
                          >
                            {item.path}
                          </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {order?.quotation[0]?.quotation_files.length ? (
                      <>
                        {previewImage && (
                          <div>
                            <Image
                              key={previewImage}
                              width={200}
                              style={{display: 'none'}}
                              src={`${apiUrl}/public/quotation/${previewImage}`}
                              preview={{
                                visible: visibleQuotationReceipt,
                                src: `${apiUrl}/public/quotation/${previewImage}`,
                                onVisibleChange: (value) => {
                                  setVisibleQuotationReceipt(value)
                                },
                              }}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className='d-flex justify-content-start align-items-center'>
                        <p className='fs-7 text-danger'>Pembayaran belum diverifikasi oleh Toko</p>
                      </div>
                    )}
                  </Col>

                  <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                    <Form.Label className='mt-3'>Bukti Transfer Quotation :</Form.Label>
                    <ListGroup>
                      {order?.quotation[0]?.quotation_files
                        .filter((x: any) => x.type === 1 || x.type === 3)
                        .map((item: any) => (
                          <ListGroup.Item
                            key={item.id}
                            action
                            style={{cursor: 'pointer'}}
                            onClick={() => {
                              setPreviewImage(item.path)
                              setVisibleQuotationFiles(true)
                            }}
                          >
                            {item.path}
                            {item.type === 3 ? ' ( Bukti transfer dikirim oleh customer)' : ''}
                          </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {order?.quotation[0]?.quotation_files.length ? (
                      <>
                        {previewImage && (
                          <div>
                            <Image
                              key={previewImage}
                              width={200}
                              style={{display: 'none'}}
                              src={`${apiUrl}/public/quotation/${previewImage}`}
                              preview={{
                                visible: visibleQuotationFiles,
                                src: `${apiUrl}/public/quotation/${previewImage}`,
                                onVisibleChange: (value) => {
                                  setVisibleQuotationFiles(value)
                                },
                              }}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className='d-flex justify-content-start align-items-center'>
                        <p className='fs-7 text-danger'>Pembayaran belum diverifikasi oleh Toko</p>
                      </div>
                    )}
                  </Col>
                </Row>
              ) : (
                <></>
              )}

              <Skeleton active loading={isLoadingPage}>
                {order?.work_orders?.work_order_evidences?.length > 0 ? (
                  <Row>
                    <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                      <Form.Label className='mt-3'>Work Before :</Form.Label>
                      <ListGroup>
                        {order?.work_orders?.work_order_evidences
                          .filter((x: any) => x.type === 2)
                          .map((item: any) => (
                            <ListGroup.Item
                              key={item.id}
                              action
                              style={{cursor: 'pointer'}}
                              onClick={() => {
                                setPreviewImage(item.evidence_location)
                                setVisibleWorkBefore(true)
                              }}
                            >
                              {item.evidence_location}
                            </ListGroup.Item>
                          ))}
                      </ListGroup>

                      {order?.work_orders?.work_order_evidences?.filter((x: any) => x.type === 2)
                        .length ? (
                        <>
                          {previewImage && (
                            <div>
                              <Image
                                key={previewImage}
                                width={200}
                                style={{display: 'none'}}
                                src={`${apiUrl}/public/work-orders/${previewImage}`}
                                preview={{
                                  visible: visibleWorkBefore,
                                  src: `${apiUrl}/public/work-orders/${previewImage}`,
                                  onVisibleChange: (value) => {
                                    setVisibleWorkBefore(value)
                                  },
                                }}
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className='d-flex justify-content-start align-items-center'>
                          <p className='fs-7 text-danger'>Foto belum diupload oleh Tukang</p>
                        </div>
                      )}
                    </Col>

                    <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                      <Form.Label className='mt-3'>Work After :</Form.Label>
                      <ListGroup>
                        {order?.work_orders?.work_order_evidences
                          .filter((x: any) => x.type === 3)
                          .map((item: any) => (
                            <ListGroup.Item
                              key={item.id}
                              action
                              style={{cursor: 'pointer'}}
                              onClick={() => {
                                setPreviewImage(item.evidence_location)
                                setVisibleWorkAfter(true)
                              }}
                            >
                              {item.evidence_location}
                            </ListGroup.Item>
                          ))}
                      </ListGroup>

                      {order?.work_orders?.work_order_evidences?.filter((x: any) => x.type === 3)
                        .length ? (
                        <>
                          {previewImage && (
                            <div>
                              <Image
                                key={previewImage}
                                width={200}
                                style={{display: 'none'}}
                                src={`${apiUrl}/public/work-orders/${previewImage}`}
                                preview={{
                                  visible: visibleWorkAfter,
                                  src: `${apiUrl}/public/work-orders/${previewImage}`,
                                  onVisibleChange: (value) => {
                                    setVisibleWorkAfter(value)
                                  },
                                }}
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className='d-flex justify-content-start align-items-center'>
                          <p className='fs-7 text-danger'>Foto belum diupload oleh Tukang</p>
                        </div>
                      )}
                    </Col>
                  </Row>
                ) : (
                  <></>
                )}
              </Skeleton>

              <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                <div className='order-history mt-3 mb-3'>
                  <div className='fs-3 fw-bold text-success mb-4'>Order History</div>
                  <Steps
                    className='order-history-timeline'
                    current={orderHistory.findIndex((step) =>
                      step.value.includes(
                        order?.work_orders?.work_order_status.length > 0
                          ? order?.work_orders?.work_order_status[0]?.status?.id
                          : order?.project_status_id
                      )
                    )}
                    labelPlacement='vertical'
                    items={orderHistory}
                  />
                </div>
              </Skeleton>
            </Card.Body>
          </Card>

          {order?.complaints && order?.complaints?.length > 0 && (
            <Card className='mt-5'>
              <Card.Header>
                <Card.Title className='fw-bold'>Complaint History</Card.Title>
              </Card.Header>

              <Card.Body>
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                  <Form.Label className='mt-3'>Bukti Komplain :</Form.Label>
                  <ListGroup>
                    {order?.complaints?.[0]?.complaint_histories?.[0]?.complaint_evidence?.map(
                      (item: any) => (
                        <ListGroup.Item
                          key={item.id}
                          action
                          style={{cursor: 'pointer'}}
                          onClick={() => {
                            setPreviewImage(item.evidence_location)
                            setVisibleComplaint(true)
                          }}
                        >
                          {item.evidence_location}
                        </ListGroup.Item>
                      )
                    )}
                  </ListGroup>

                  {previewImage && (
                    <div>
                      {previewImage.endsWith('.pdf') ? (
                        <>
                          <Modal
                            dialogClassName='modal-show-pdf'
                            centered
                            show={visible}
                            onHide={handleClose}
                          >
                            <Modal.Header closeButton>
                              <Modal.Title>File - {previewImage}</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                              <iframe
                                key={previewImage}
                                width='100%'
                                height='100%'
                                src={`${apiUrl}/public/complaints/${previewImage}`}
                                style={{border: 'none'}}
                              />
                            </Modal.Body>
                          </Modal>
                        </>
                      ) : (
                        <Image
                          key={previewImage}
                          width={200}
                          style={{display: 'none'}}
                          src={`${apiUrl}/public/complaints/${previewImage}`}
                          preview={{
                            visible: visibleComplaint,
                            src: `${apiUrl}/public/complaints/${previewImage}`,
                            onVisibleChange: (value) => {
                              setVisibleComplaint(value)
                            },
                          }}
                        />
                      )}
                    </div>
                  )}
                </Skeleton>

                <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                  {order?.complaints && order?.complaints?.length >= 1 && (
                    <div className='complaint-history  mt-3 mb-3'>
                      <div className='fs-3 fw-bold text-danger mb-4'>Complaint History</div>
                      <Steps
                        className='complaint-history-timeline'
                        current={complaintHistory.findIndex((step) =>
                          step.value.includes(
                            order?.work_orders?.work_order_status.length > 0
                              ? order?.work_orders?.work_order_status[0]?.status?.id
                              : order?.project_status_id
                          )
                        )}
                        labelPlacement='vertical'
                        items={complaintHistory}
                      />
                    </div>
                  )}
                </Skeleton>
              </Card.Body>
            </Card>
          )}

          {order?.reschedule && order?.reschedule?.length > 0 && (
            <Card className='mt-5'>
              <Card.Header>
                <Card.Title>Reschedule History</Card.Title>
              </Card.Header>

              <Card.Body>
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                  <Row className='mb-5'>
                    <Col>
                      <Form.Group>
                        <Form.Label>Tanggal Konfirmasi Awal Vendor :</Form.Label>

                        <p className='fs-6'>
                          {order?.work_orders
                            ? order.work_orders.work_start_date && order.work_orders.work_end_date
                              ? `${formatDateWithTime(
                                  order?.work_orders?.work_start_date
                                )} sampai ${formatDateWithTime(order?.work_orders?.work_end_date)}`
                              : order.work_orders.survey_date
                              ? formatDateWithTime(order?.work_orders?.survey_date)
                              : 'Tanggal belum dikonfirmasi vendor'
                            : 'Tanggal belum dikonfirmasi vendor'}
                        </p>
                      </Form.Group>
                    </Col>

                    <Col>
                      <Form.Group>
                        <Form.Label>Tanggal Pengajuan Reschedule :</Form.Label>

                        <p className='fs-6'>
                          {order?.reschedule[0]?.reschedule_date
                            ? `${formatDate(order?.reschedule[0]?.reschedule_date)}`
                            : 'Tanggal belum ditentukan vendor'}
                        </p>
                      </Form.Group>
                    </Col>

                    <Col>
                      <Form.Group>
                        <Form.Label>Tanggal Konfirmasi Vendor :</Form.Label>

                        <p className='fs-6'>
                          {order?.reschedule[0]?.confirm_date
                            ? ` ${formatDate(order?.reschedule[0]?.confirm_date)}`
                            : 'Tanggal belum ditentukan vendor'}
                        </p>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className='mb-5'>
                    <Col>
                      <Form.Group>
                        <Form.Label>Nama Lengkap Tehnisi :</Form.Label>

                        <p className='fs-6'>
                          {order?.reschedule[0]?.reschedule_date
                            ? `${formatDate(order?.reschedule[0]?.reschedule_date)}`
                            : 'Tanggal belum ditentukan vendor'}
                        </p>
                      </Form.Group>
                    </Col>
                  </Row>
                </Skeleton>

                <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                  <Row className='mb-5'>
                    <Col>
                      <Form.Label className='mt-3'>Bukti File :</Form.Label>
                      <ListGroup>
                        {order?.reschedule?.[0]?.reschedule_evidences?.map((item: any) => (
                          <ListGroup.Item
                            key={item.id}
                            action
                            style={{cursor: 'pointer'}}
                            onClick={() => {
                              setPreviewImage(item.evidence_location)
                              setVisibleReschedule(true)
                            }}
                          >
                            {item.evidence_location}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>

                      {previewImage && (
                        <div>
                          {previewImage.endsWith('.pdf') ? (
                            <>
                              <Modal
                                dialogClassName='modal-show-pdf'
                                centered
                                show={visible}
                                onHide={handleClose}
                              >
                                <Modal.Header closeButton>
                                  <Modal.Title>File - {previewImage}</Modal.Title>
                                </Modal.Header>

                                <Modal.Body>
                                  <iframe
                                    key={previewImage}
                                    width='100%'
                                    height='100%'
                                    src={`${apiUrl}/public/reschedule/${previewImage}`}
                                    style={{border: 'none'}}
                                  />
                                </Modal.Body>
                              </Modal>
                            </>
                          ) : (
                            <Image
                              key={previewImage}
                              width={200}
                              style={{display: 'none'}}
                              src={`${apiUrl}/public/reschedule/${previewImage}`}
                              preview={{
                                visible: visibleReschedule,
                                src: `${apiUrl}/public/reschedule/${previewImage}`,
                                onVisibleChange: (value) => {
                                  setVisibleReschedule(value)
                                },
                              }}
                            />
                          )}
                        </div>
                      )}
                    </Col>
                  </Row>
                </Skeleton>
              </Card.Body>
            </Card>
          )}

          <Card className='mt-5'>
            <Card.Header>
              <Card.Title className='fw-bold'>Order History</Card.Title>
            </Card.Header>

            <Card.Body>
              <div className='work-order-history'>
                <Steps
                  progressDot
                  current={orderHistorical.length - 1}
                  direction='vertical'
                  items={orderHistorical.map((item) => ({
                    title: item?.order_status,
                    description: `Terakhir update : ${item?.created_at} ${
                      item.updated_by ? `oleh ${item?.updated_by}` : ''
                    }`,
                  }))}
                />
              </div>
            </Card.Body>
          </Card>
        </section>
      </div>

      {/* Modal Upload Bukti Pembayaran */}
      <Modal
        dialogClassName='modal-upload-receipt'
        centered
        show={showModal}
        onHide={handleCloseModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Upload Bukti Pembayaran Quotation</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Dragger
            className='input-excel'
            accept='image/*'
            multiple={true}
            beforeUpload={() => false}
            onChange={(e) => handleFileChange(e)}
            onDrop={(e) => handleFileRemove(e.dataTransfer.files)}
          >
            <p className='ant-upload-drag-icon'>
              <InboxOutlined style={{fontSize: 32}} />
            </p>

            <p className='ant-upload-text'>Klik atau seret file ke area ini untuk mengunggah</p>
          </Dragger>

          <Button
            className='d-flex justify-content-center align-items-center w-100 mt-5'
            disabled={receiptQuotation === null}
            onClick={handleSubmitReceipt}
            variant='primary'
          >
            {loadingUploadReceipt ? 'Uploading..' : 'Upload Bukti'}
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export {DetailOrderWithoutAuth}
