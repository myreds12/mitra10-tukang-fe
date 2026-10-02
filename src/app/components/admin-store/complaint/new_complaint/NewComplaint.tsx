import React, {FC, useState, useEffect, useRef} from 'react'
import axiosInstance from '../../../../../_metronic/layout/core/axiosInterceptor'
import {useNavigate} from 'react-router-dom'

import './NewComplaint.css'

import axios from 'axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import {Image, DatePicker} from 'antd'
import Select, {SingleValue} from 'react-select'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Row, Col, Form, Button, ListGroup, Card} from 'react-bootstrap'
import {faTrash, faImage, faFileImage} from '@fortawesome/free-solid-svg-icons'
import {formatDate, formatDateWithTime} from '../../../../../_metronic/helpers'

interface Complaint {
  order_id: number | null
  pic_name: string
  description: string
  complaint_channel: number | null
  complaint_date: string
  complaint_received_date: string
  complaint_status: string
  complaint_type: number
  crm_type: number
}

interface CrmType {
  value: number | null
  label: string
}

interface ComplaintChannel {
  value: number | null
  label: string
}

interface Order {
  value: number | null
  label: string
}

const NewComplaintForm: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const today = String(new Date().toISOString().split('T')[0])

  const userStore = localStorage.getItem('storeId')
  const userRole = localStorage.getItem('userRole')
  const userVendor = localStorage.getItem('vendor_id')

  // Loading
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Data Order
  const [searchOrder, setSearchOrder] = useState('')
  const [order, setOrder] = useState<Order[]>([])
  const [orderDetail, setOrderDetail] = useState<any>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<SingleValue<Order>>({
    value: null,
    label: 'Ketik/Pilih Order Id',
  })
  const search = searchOrder ? `&search=${searchOrder}` : ''

  // Add Complaint
  const [complaintCode, setComplaintCode] = useState<string | number>('NaN')
  const [complaintForm, setComplaintForm] = useState<Complaint>({
    order_id: null,
    pic_name: '',
    description: '',
    complaint_channel: null,
    complaint_date: '',
    complaint_received_date: '',
    complaint_status: '',
    complaint_type: 1,
    crm_type: 1,
  })

  // Complaint Channel
  const [complaintChannel, setComplaintChannel] = useState<ComplaintChannel[]>([])
  const [selectedComplaintChannel, setSelectedComplaintChannel] = useState<
    SingleValue<ComplaintChannel>
  >({
    value: null,
    label: 'Complaint Via',
  })

  // CRM Status
  const [crmType] = useState<CrmType[]>([
    {value: 1, label: 'Positive'},
    {value: 2, label: 'Neutral'},
    {value: 3, label: 'Negative'},
  ])
  const [selectedCrmType, setSelectedCrmType] = useState<SingleValue<CrmType>>({
    value: null,
    label: 'Jenis Pengaduan',
  })

  const [complaintEvidence, setComplaintEvidence] = useState<Array<File | null>>([])
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)

  const evidenceRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<any>()
  const [visible, setVisible] = useState(false)

  const getOrder = async () => {
    try {
      const url = (() => {
        switch (userRole) {
          case 'Store CS':
            return `${apiUrl}/orders?order_by=desc&store_id=${userStore}${search}`
          case 'Super User':
          case 'Admin HO':
            return `${apiUrl}/orders?order_by=desc${search}`
          case 'Owner Vendor':
          case 'Admin Vendor':
            return `${apiUrl}/orders?order_by=desc&vendor_id=${userVendor}${search}`
          default:
            return `${apiUrl}/orders?order_by=desc${search}`
        }
      })()

      const response = await axiosInstance.get(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempOrder = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.id,
          status: item.status.category,
          complaints: item.complaints,
        }))

        const filteredOrder = tempOrder.filter(
          (detail: any) =>
            ![
              'UNPAID',
              'PICKLIST',
              'BOOK',
              'BOOKED',
              'CANCEL',
              'CANCELREFUND',
              'INVESTIGATE',
              'INVESTIGATED',
              'QUOTEIN',
              'QUOTEOUT',
              'QUOTATIONPAIDSTEPONE',
              'QUOTATIONPAIDSTEPTWO',
              'QUOTATIONPAIDSTEPTHREE',
              'QUOTATIONPAID',
              'COMPLAINTAPPROVEDBYHO',
              'COMPLAINTREJECTEDBYHO',
              'SURVEYREQ',
              'WORKREQ',
              'WORKREQSTEPTWO',
              'WORKREQSTEPONE',
              'WORKREQSTEPTHREE',
              'WORKSTART',
              'WORKSTARTSTEPONE',
              'WORKSTARTSTEPTWO',
              'WORKSTARTSTEPTHREE',
              'WORKEND',
              'WORKENDSTEPONE',
              'WORKENDSTEPTWO',
              'WORKENDSTEPTHREE',
              'REWORKREQ',
              'REWORKSTART',
              'REWORKEND',
              'REFUND',
              'REFUNDAPPROVEDBYHO',
              'REFUNDREJECTEDBYHO',
              'INVOICEDRAFT',
              'INVOICE',
              'INVOICESEND',
              'QUOTATIONDRAFT',
              'RESCHEDULE',
              'RESCHEDULEAPPROVEDBYHO',
              'RESCHEDULEAPPROVEDBYVENDOR',
              'RESCHEDULEREJECTEDBYVENDOR',
            ].includes(detail.status) && detail?.complaints?.length === 0
        )

        setOrder(filteredOrder)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getOrderDetail = async () => {
    try {
      await axios
        .get(`${apiUrl}/orders/${selectedOrderId?.value}`, {
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
    } catch (err) {
      console.error(err)
    }
  }

  const getComplaintChannel = async () => {
    try {
      const response = await axios.get(`${apiUrl}/complaint-channels`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempComplaintChannel = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))

        setComplaintChannel(tempComplaintChannel)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getCode = async () => {
    try {
      const response = await axios.get(`${apiUrl}/complaints/next-code`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (response.status === 200) {
        const {data} = response
        setComplaintCode(data.data.code)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getOrder()
    // eslint-disable-next-line
  }, [searchOrder])

  useEffect(() => {
    getCode()
    getComplaintChannel()
    // eslint-disable-next-line
  }, [complaintCode])

  useEffect(() => {
    if (selectedOrderId?.value) {
      getOrderDetail()
    }
    // eslint-disable-next-line
  }, [selectedOrderId?.value])

  useEffect(() => {
    setComplaintForm({
      ...complaintForm,
      order_id: selectedOrderId?.value ?? null,
      complaint_channel: selectedComplaintChannel?.value ?? null,
      crm_type: selectedCrmType?.value ?? 1,
    })
    // eslint-disable-next-line
  }, [selectedOrderId, selectedComplaintChannel, selectedCrmType])

  // Complaint Status
  useEffect(() => {
    const storedStatus = localStorage.getItem('statusData')
    const statusData = storedStatus ? JSON.parse(storedStatus) : []

    const desiredStatusName = 'INVESTIGATED'
    const desiredStatus = statusData.find((status: any) => status?.category === desiredStatusName)
    const statusId = desiredStatus?.value

    setComplaintForm({
      ...complaintForm,
      complaint_status: statusId,
    })
    // eslint-disable-next-line
  }, [])

  // Complaint Form Handler
  const complaintFormHandler = (e: any) => {
    setComplaintForm({
      ...complaintForm,
      [e.target.name]: e.target.value,
    })
  }

  // Handle Change Upload File
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const {length} = fileList

      for (let i = 0; i < length; i++) {
        file[i] = fileList.item(i)
      }

      setComplaintEvidence(file)
    }
  }

  const handleImageClick = () => {
    const inputField = document.querySelector('.input-field-image') as HTMLInputElement
    inputField.click()
  }

  const handleRemoveFile = (index: number) => {
    const newEvidances = [...complaintEvidence]

    newEvidances.splice(index, 1)

    setComplaintEvidence(newEvidances)

    // Update element value
    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  const handleFileClick = (index: number) => {
    setPreviewImage(complaintEvidence[index]?.name)
    setVisible(true)
    setSelectedFileIndex(index)
  }

  // Complaint Validation
  const ComplaintValidation = () => {
    let valid = true

    if (!selectedOrderId?.value) {
      Swal.fire({
        title: 'Error',
        text: 'Please select order Id',
        icon: 'error',
      })
      valid = false
    } else if (!complaintForm.description) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill complaint description form',
        icon: 'error',
      })
      valid = false
    } else if (!selectedComplaintChannel?.value) {
      Swal.fire({
        title: 'Error',
        text: 'Please select complaint channel',
        icon: 'error',
      })
      valid = false
    } else if (!complaintEvidence) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill complaint evidence form',
        icon: 'error',
      })
      valid = false
    }
    return valid
  }

  // Clear State
  const clear = (e: any) => {
    e.preventDefault()

    // Order
    setOrderDetail(null)
    setSelectedOrderId({
      value: null,
      label: 'Ketik/Pilih Order Id',
    })

    // Complaint
    setComplaintCode('')
    setComplaintForm({
      order_id: null,
      complaint_channel: null,
      pic_name: '',
      description: '',
      complaint_date: '',
      complaint_received_date: '',
      complaint_status: '',
      complaint_type: 1,
      crm_type: 1,
    })
    setComplaintEvidence([])
    setSelectedComplaintChannel({
      value: null,
      label: 'Complaint Via',
    })
  }

  // Handle Submit Complaint
  const handleSubmitNewComplaint = async (e: any) => {
    if (ComplaintValidation()) {
      setIsLoading(true)
      const formData = new FormData()

      formData.append('order_id', String(complaintForm.order_id))
      formData.append('pic_name', complaintForm.pic_name)
      formData.append('description', complaintForm.description)
      formData.append('complaint_status', complaintForm.complaint_status)
      formData.append('complaint_channel', String(complaintForm.complaint_channel))
      formData.append('complaint_date', today)
      formData.append('complaint_received_date', complaintForm.complaint_received_date)
      formData.append('type', complaintForm.complaint_type.toString())
      formData.append('crm_type', complaintForm.crm_type.toString())

      if (complaintEvidence?.length) {
        complaintEvidence.forEach((item) => {
          if (item) {
            formData.append(`complaint_evidences`, item, item?.name)
          }
        })
      }

      await axios
        .post(`${apiUrl}/complaints`, formData, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })
        .then((response) => {
          if (response.data.status === 200 || response.data.status === 201) {
            Swal.fire({
              title: 'Success',
              text: 'Success Add Complaint',
              icon: 'success',
              showConfirmButton: false,
              timer: 1500,
            }).then(() => {
              clear(e)
            })

            setIsLoading(false)
          } else {
            Swal.fire({
              title: 'Error',
              text: response.data.message,
              icon: 'error',
            })

            setIsLoading(false)
          }
        })
        .catch((error) => {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
          })

          setIsLoading(false)
        })
    }
  }

  const handleCancelComplaint = () => {
    navigate('/complaint/view-complaint')
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
    calculatePaymentStages(orderDetail?.quotation?.[0]?.quotation_grand_total)
    // eslint-disable-next-line
  }, [orderDetail?.quotation?.[0]?.quotation_grand_total])

  // Calculate Warranty Days
  const calculateWarrantyDays = (warranty: string) => {
    if (!warranty) return {workEndDate: '-', warrantyEndDate: '-'}

    const createdAt = new Date(warranty)

    const workEndDate = createdAt.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    const warrantyEnd = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    const warrantyEndDate = warrantyEnd.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    const today = new Date()
    const status = today > warrantyEnd ? 'Garansi Expired' : 'Garansi Aktif'

    return {workEndDate, warrantyEndDate, status}
  }

  const warrantyData = calculateWarrantyDays(
    orderDetail?.work_orders?.work_order_status[0]?.created_at
  )

  return (
    <section id='new-complaint'>
      <Card>
        <Card.Body>
          <div className='form-wrapper'>
            <Row className='form-header'>
              <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='d-flex flex-column'>
                <Form.Label className='fs-4 fw-bold'>
                  Nama Toko :{' '}
                  <span className='fs-4 ms-2 fw-normal'>
                    {orderDetail?.store?.store_name ?? ''}
                  </span>
                </Form.Label>

                <Form.Label className='fs-4 fw-bold'>
                  Complaint ID : <span className='fs-4 ms-2 fw-normal'>{complaintCode}</span>
                </Form.Label>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Group as={Row} className='order-id-complaint'>
                  <Form.Label column sm='3' className='fs-4 fw-bold'>
                    Order ID :
                  </Form.Label>

                  <Col sm='9'>
                    <Select
                      name='order-id'
                      className='form-control p-0'
                      placeholder='Ketik/Pilih Order Id'
                      isSearchable={true}
                      options={order}
                      value={selectedOrderId}
                      onChange={(newValue) => setSelectedOrderId(newValue)}
                      onInputChange={(newValue) => setSearchOrder(newValue)}
                    />
                  </Col>
                </Form.Group>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Col>
                  <Form.Label className='fs-4 fw-bold'>
                    Receipt Number :
                    <span className='fs-4 ms-2 fw-normal'>
                      {orderDetail?.receipt_number ?? '-'}
                    </span>
                  </Form.Label>

                  {orderDetail?.quotation[0]?.receipt_quotation &&
                    orderDetail?.quotation[0]?.quotation_special === 0 && (
                      <Form.Label className='fs-4 fw-bold'>
                        Receipt Quotation :
                        <span className='fs-4 ms-2 fw-normal'>
                          {orderDetail?.quotation[0]?.receipt_quotation ?? '-'}
                        </span>
                      </Form.Label>
                    )}
                </Col>

                <Col>
                  <Form.Label className='fs-4 fw-bold'>
                    Order Status :
                    <span className='fs-4 ms-2 fw-bold text-success'>
                      {orderDetail?.status?.description}
                    </span>
                  </Form.Label>
                </Col>
              </Col>
            </Row>

            <Row className='information-detail'>
              <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='costumer-info mb-5'>
                <div className='fs-3 fw-bold'>Informasi Pembeli</div>

                <Row>
                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='6'>
                        No Member :
                      </Form.Label>
                      <Col sm='6'>
                        <p className='fs-7'>{orderDetail?.members?.member_number}</p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='6'>
                        Customer Name :
                      </Form.Label>
                      <Col sm='6'>
                        <p className='fs-7'>{orderDetail?.members?.full_name}</p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='6'>
                        Alamat Pemasangan :
                      </Form.Label>
                      <Col sm='6'>
                        <p className='fs-7'>{orderDetail?.project_address}</p>
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
                          {!orderDetail?.project_number.startsWith('0')
                            ? `${
                                orderDetail?.members?.whatsapp_number
                                  ? `+62 ${orderDetail?.members?.whatsapp_number}`
                                  : '-'
                              }`
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
                          {orderDetail?.project_number.startsWith('0')
                            ? orderDetail?.members?.phone_number
                            : '-'}
                        </p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='5'>
                        Alamat Email :
                      </Form.Label>
                      <Col sm='7'>
                        <p className='fs-7'>{orderDetail?.members?.email} </p>
                      </Col>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='sales-info mb-5'>
                <div className='fs-3 fw-bold'>Informasi Penjual</div>

                <Form.Group as={Row} className='detail-info'>
                  <Form.Label column sm='3'>
                    Sales ID :
                  </Form.Label>
                  <Col sm='9'>
                    <p className='fs-7'>{orderDetail?.sales?.id} </p>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='detail-info'>
                  <Form.Label column sm='3'>
                    Sales Person :
                  </Form.Label>
                  <Col sm='9'>
                    <p className='fs-7'>{orderDetail?.sales?.full_name} </p>
                  </Col>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <Row className='table-warranty d-flex align-items-center mb-3'>
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
                        {orderDetail?.order_details.map((item: any, index: any) => (
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
                          orderDetail?.work_orders?.work_order_status[0].work_order_items.map(
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
                        {orderDetail?.order_details.map((item: any, index: any) => (
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

          <Row>
            <Col>
              <Row className='information-detail'>
                <div className='fs-3 fw-bold'>Catatan Order</div>

                <div className='detail-info mb-3'>
                  <p className='fs-5 fw-bold'>Catatan Toko :</p>

                  <p className='fs-7'>
                    {orderDetail?.notes ? orderDetail?.notes : 'Toko tidak memberikan catatan'}
                  </p>
                </div>

                <div className='detail-info mb-3'>
                  <p className='fs-5 fw-bold'>Catatan Tukang :</p>

                  <p className='fs-7'>
                    {orderDetail?.work_orders?.work_order_status[0]?.description
                      ? orderDetail?.work_orders?.work_order_status[0]?.description
                      : 'Tukang tidak memberikan catatan'}
                  </p>
                </div>

                <div className='detail-info mb-3'>
                  <p className='fs-5 fw-bold'>Intruksi Spesial :</p>

                  <p className='fs-7'>
                    {orderDetail?.quotation[0]?.description
                      ? orderDetail?.quotation[0]?.description
                      : 'Vendor tidak memberikan catatan'}
                  </p>
                </div>
              </Row>
            </Col>

            {['WORKEND', 'WORKENDSTEPONE', 'WORKENDSTEPTWO', 'WORKENDSTEPTHREE'].includes(
              orderDetail?.status?.category
            ) && (
              <Col>
                <Row className='information-detail'>
                  <div className='fs-3 fw-bold'>Informasi Garansi</div>

                  <div className='detail-info mb-3'>
                    <p className='fs-5 fw-bold'>Tanggal Aktif Garansi :</p>

                    <p className='fs-7'>{warrantyData?.workEndDate}</p>
                  </div>

                  <div className='detail-info mb-3'>
                    <p className='fs-5 fw-bold'>Tanggal Berakhir Garansi :</p>

                    <p className='fs-7'>{warrantyData?.warrantyEndDate}</p>
                  </div>

                  <div className='detail-info mb-3'>
                    <p className='fs-5 fw-bold'>Status Garansi :</p>

                    <p className='fs-7'>{warrantyData?.status}</p>
                  </div>
                </Row>
              </Col>
            )}
          </Row>

          <hr />

          <Row className='mb-5'>
            <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='mb-3'>
              <Form.Group className='mb-3'>
                <Form.Label>Nama PIC :</Form.Label>
                <Form.Control
                  name='pic_name'
                  type='text'
                  placeholder='Isi Nama PIC'
                  value={complaintForm?.pic_name ?? ''}
                  onChange={(e) => complaintFormHandler(e)}
                />
              </Form.Group>

              <Form.Group className='mb-3'>
                <Form.Label>Tanggal Komplain Dibuat :</Form.Label>
                <Form.Control
                  name='complaint_date'
                  type='date'
                  value={today}
                  readOnly
                  onChange={(e) => complaintFormHandler(e)}
                />
              </Form.Group>

              <Form.Group className='detail-info mb-3'>
                <Form.Label>Tanggal Komplain Diterima :</Form.Label>

                <DatePicker
                  name='complaint_received_date'
                  showTime={{
                    format: 'HH:mm',
                  }}
                  className='date-range w-100'
                  format='DD-MM-YYYY HH:mm'
                  value={
                    complaintForm.complaint_received_date
                      ? dayjs(complaintForm.complaint_received_date, 'YYYY-MM-DD HH:mm')
                      : null
                  }
                  onChange={(value) => {
                    const complaintDate = value ? value.format('YYYY-MM-DDTHH:mm') : ''
                    setComplaintForm((prev) => ({
                      ...prev,
                      complaint_received_date: complaintDate,
                    }))
                  }}
                />
              </Form.Group>

              <Form.Group className='mb-3'>
                <Form.Label>Komplain melalui : </Form.Label>

                <Select
                  name='complaint_channel_id'
                  className='form-control p-0'
                  classNamePrefix='select'
                  placeholder='Complaint Via'
                  isSearchable={true}
                  options={complaintChannel}
                  value={selectedComplaintChannel}
                  onChange={(newValue) => setSelectedComplaintChannel(newValue)}
                />
              </Form.Group>

              <Form.Group className='mb-3'>
                <Form.Label>Jenis Pengaduan : </Form.Label>

                <Select
                  name='crm_type_id'
                  className='form-control p-0'
                  classNamePrefix='select'
                  placeholder='Jenis Pengaduan'
                  isSearchable={true}
                  options={crmType}
                  value={selectedCrmType}
                  onChange={(newValue) => setSelectedCrmType(newValue)}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='mb-3'>
              <Form.Label>Alasan :</Form.Label>
              <Form.Control
                as='textarea'
                name='description'
                style={{minHeight: '355px'}}
                value={complaintForm?.description ?? ''}
                onChange={(e) => complaintFormHandler(e)}
              ></Form.Control>
            </Col>

            <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='mb-3'>
              <Form.Group>
                <Form.Label>UPLOAD BUKTI COMPLAINT</Form.Label>
                <Form className='form-input-image' onClick={handleImageClick}>
                  <Form.Control
                    type='file'
                    accept='image/jpeg, image/png'
                    className='input-field-image'
                    multiple
                    hidden
                    id='file-input'
                    ref={evidenceRef}
                    onChange={handleFileChange}
                  />

                  <div className='input-image-text'>
                    <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                    <p>Add File</p>
                  </div>
                </Form>

                <ListGroup className='pt-3'>
                  {complaintEvidence.length ? (
                    complaintEvidence.map((item, index) => (
                      <ListGroup>
                        <ListGroup.Item
                          key={`${item?.name}-${index}-${item?.type}`}
                          className='d-flex justify-content-between align-items-center'
                        >
                          <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                          <span className='upload-content' onClick={() => handleFileClick(index)}>
                            {item?.name}
                          </span>

                          <FontAwesomeIcon
                            icon={faTrash}
                            size='sm'
                            color='#ed2b2a'
                            style={{cursor: 'pointer'}}
                            onClick={(e) => handleRemoveFile(index)}
                          />
                        </ListGroup.Item>

                        {selectedFileIndex === index && item && (
                          <Image
                            key={`${previewImage} - ${index}`}
                            width={200}
                            style={{display: 'none'}}
                            src={URL.createObjectURL(item)}
                            preview={{
                              visible,
                              src: URL.createObjectURL(item),
                              onVisibleChange: (value) => {
                                setVisible(value)
                              },
                            }}
                          />
                        )}
                      </ListGroup>
                    ))
                  ) : (
                    <ListGroup.Item className='d-flex justify-content-center'>
                      Tidak ada file yang dipilih
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Form.Group>
            </Col>
          </Row>

          <div className='d-flex justify-content-center align-items-center mt-5'>
            <Button
              variant='dark-danger'
              className='d-flex justify-content-center align-items-center'
              type='submit'
              disabled={isLoading}
              onClick={handleCancelComplaint}
            >
              Cancel
            </Button>

            <Button
              variant='dark-primary'
              className='d-flex justify-content-center align-items-center'
              type='submit'
              disabled={isLoading}
              onClick={handleSubmitNewComplaint}
            >
              {isLoading ? 'Submitting..' : 'Submit'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </section>
  )
}

export {NewComplaintForm}
