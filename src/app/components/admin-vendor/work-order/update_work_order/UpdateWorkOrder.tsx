// React Imports
import React, {useState, useEffect, FC, SetStateAction} from 'react'

// Styling Imports
import './UpdateWorkOrder.css'

// Helper Imports
import {
  formatDate,
  formatDateWithTime,
  formatDateWithTimeZone,
  formatInputDate,
  disableDateBeforeToday,
  getDisabledHours,
} from '../../../../../_metronic/helpers'

// Type Imports
import type {WorkOrder, WorkOrderTukang} from '../../../../interfaces/work-order'
import type {Orders} from '../../../../interfaces/order'

// Third-party Imports
import axios from 'axios'
import Select from 'react-select'
import Swal from 'sweetalert2'
import makeAnimated from 'react-select/animated'
import dayjs from 'dayjs'
import {DatePicker, Steps, Image} from 'antd'
import {useNavigate, useParams} from 'react-router-dom'
import {Form, Button, Row, Col, Card, ListGroup, Modal} from 'react-bootstrap'
const {RangePicker} = DatePicker

interface StatusStorage {
  value: number
  category: any
  description: string
}

interface OrderHistory {
  order_id: number
  status: string
  created_at: string
  updated_by: string
}

const UpdateWorkVendor: FC<{updatePageTitle: (work_order: WorkOrder) => void}> = ({
  updatePageTitle,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const apiChat = process.env.REACT_APP_API_CHAT_URL

  const navigate = useNavigate()
  const params = useParams()
  const animatedComponents = makeAnimated()

  const userRole = localStorage.getItem('userRole') as string
  const vendorId = localStorage.getItem('vendor_id')
  const maxOrder = localStorage.getItem('max_order') || 0

  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Order Detail
  const [orderDetail, setOrderDetail] = useState<any>({})

  // Order History
  const [OrderHistory, setOrderHistory] = useState<OrderHistory[]>([])
  const [orderStatusLabel, setOrderStatusLabel] = useState('')
  const [template, setTemplate] = useState([])

  // Work Order
  const [workOrder, setWorkOrder] = useState<WorkOrder>({
    id: null,
    order_id: null,
    vendor_id: null,
    tukang_id: [],
    request_work_time: '',
    survey_date: null,
    session: null,
    work_order_status: null,
    complaint_status: null,
    work_start_date: null,
    work_end_date: null,
    work_order_item: [
      {
        id: null,
        index: Date.now().toString(),
        item_name: '',
        is_user: 0,
        type: 1,
        quantity: null,
        unit: '',
      },
      {
        id: null,
        index: (Date.now() + 1).toString(),
        item_name: '',
        is_user: 0,
        type: 2,
        quantity: null,
        unit: '',
      },
    ],
  })

  // Option Tukang
  const [tukang, setTukang] = useState<WorkOrderTukang[]>([])
  const [searchTukang, setSearchTukang] = useState('')

  // Preview Image
  const [previewImage, setPreviewImage] = useState<any>()
  const [visible, setVisible] = useState(false)
  const [visibleReschedule, setVisibleReschedule] = useState(false)
  const handleClose = () => setVisible(false)

  const fetchOrderData = async () => {
    try {
      await axios
        .get(`${apiUrl}/orders/${params.id}`, {
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

          if (data?.work_orders?.id) {
            workOrderHandler(data.work_orders.id, 'id')
            setWorkOrder((prev) => {
              return {
                ...prev,
                session: data.work_orders.session,
              }
            })
            setSelectedSession((prev: any) => ({
              ...prev,
              value: data?.work_orders.session,
              label: sessionOptions.find((option) => option.value === data?.work_orders?.session)
                ?.label,
            }))
          }

          if (data?.id) {
            workOrderHandler(data.id, 'order_id')

            const orderHistory = data?.order_history.map((item: any) => {
              return {
                status: item?.status?.description,
                created_at: item?.created_at ? formatDateWithTimeZone(item?.created_at) : '-',
                updated_by: item?.created_by?.username,
              }
            })

            setOrderHistory(orderHistory)
          }

          if (data?.vendor_id) {
            workOrderHandler(data.vendor_id, 'vendor_id')
          }

          if (data?.work_orders?.work_order_tukang) {
            const tukang = data.work_orders.work_order_tukang.map((item: any) => ({
              id: item.id,
              tukang_id: item.tukang_id,
              tukang_name: item.tukang.full_name,
              type: item.type,
            }))

            workOrderHandler(tukang, 'tukang_id')
          }

          if (data?.request_survey) {
            workOrderHandler(formatInputDate(new Date(data.request_survey)), 'request_work_time')
          }

          if (data?.work_orders?.survey_date) {
            setWorkOrder((prev) => {
              return {
                ...prev,
                survey_date: data.work_orders.survey_date,
              }
            })
          }

          if (data?.work_orders?.work_start_date) {
            setWorkOrder((prev) => {
              return {
                ...prev,
                work_start_date: data.work_orders.work_start_date,
              }
            })
          }

          if (data?.work_orders?.work_end_date) {
            setWorkOrder((prev) => {
              return {
                ...prev,
                work_end_date: data.work_orders.work_end_date,
              }
            })
          }

          if (
            Array.isArray(data?.work_orders?.work_order_status) &&
            data?.work_orders?.work_order_status?.length > 1
          ) {
            if (
              ['WORKREQ', 'RESURVEYREQ', 'REWORKREQ'].includes(data?.status?.category) &&
              !['WORKSTART'].includes(data?.work_orders?.work_order_status[0]?.status?.category)
            ) {
              workOrderHandler(data?.status?.id, 'work_order_status')
            } else {
              workOrderHandler(
                data?.work_orders?.work_order_status[0]?.status_id,
                'work_order_status'
              )
            }
          } else {
            workOrderHandler(data?.status?.id, 'work_order_status')
          }

          if (data?.complaints[0]?.complaint_status) {
            workOrderHandler(data.complaints[0].complaint_status, 'complaint_status')
          }

          if (data?.quotation) {
            const workOrderItem = data?.quotation[0]?.quotation_details.map(
              (item: any, index: number) => ({
                id: item.id,
                index: (Date.now() + index).toString(),
                item_name: item?.name,
                unit: item?.unit,
                is_user: item?.is_customer === true ? 1 : 0,
                type: item?.item_type,
                quantity: item?.quantity,
              })
            )

            setWorkOrder((prev) => ({
              ...prev,
              work_order_item: workOrderItem,
            }))
          }

          updatePageTitle(data)
        })
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        Swal.fire({
          title: 'Sesi Anda Telah Berakhir',
          text: 'Silahkan Logout dan Login Ulang Kembali',
          icon: 'warning',
          confirmButtonText: 'Ok',
        })
      } else {
        console.log('error when fetching data', error)
      }
    }
  }

  const getTukang = async () => {
    const search = searchTukang ? `&search=${searchTukang}` : ''

    try {
      const response = await axios.get(`${apiUrl}/tukang?vendor_id=${vendorId}${search}&take=0`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempTukang = response.data.data.map((item: any) => ({
          tukang_id: item.id,
          tukang_name: item.full_name,
          is_active: item.is_active,
          deleted_at: item.deleted_at,
          slot_order: item.slot_order,
        }))
        const filteredTukang = tempTukang.filter(
          (x: any) => x.is_active === true && x.deleted_at === null && x.slot_order < maxOrder
        )
        setTukang(filteredTukang)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchOrderData()
  }, [workOrder.id])

  useEffect(() => {
    getTukang()
  }, [searchTukang])

  // Option Session
  const sessionOptions = [
    {value: 1, label: 'Sesi Pagi'},
    {value: 2, label: 'Sesi Siang'},
    {value: 3, label: 'Sesi Sore'},
    {value: 4, label: 'Sesi Malam'},
  ]
  const [selectedSession, setSelectedSession] = useState<any>({
    value: null,
    label: 'Pilih sesi',
  })

  const getTemplate = async () => {
    let apiUrlWithParams = `${apiChat}/templates`

    try {
      const response = await axios.get(apiUrlWithParams, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (response.data) {
        setTemplate(response.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    getTemplate()
  }, [])

  // Filter Work Order Status
  const storedStatus = localStorage.getItem('statusData')
  const statusData: Array<StatusStorage> = storedStatus ? JSON.parse(storedStatus) : []

  useEffect(() => {
    // Get Status Name by Category
    const getStatusNameByCategory = (category: string) => {
      switch (category) {
        case 'SURVEYREQ':
          return 'TUKANGSURVEY'
        case 'WORKREQ':
          return 'TUKANGWORK'
        case 'WORKREQSTEPONE':
          return 'TUKANGWORKSTEPONE'
        case 'WORKREQSTEPTWO':
          return 'TUKANGWORKSTEPTWO'
        case 'WORKREQSTEPTHREE':
          return 'TUKANGWORKSTEPTHREE'
        case 'RESURVEYREQ':
          return 'RETUKANGSURVEY'
        case 'REWORKREQ':
          return 'RETUKANGWORK'
        default:
          return null
      }
    }

    const rescheduleStatus =
      orderDetail?.status?.category === 'RESCHEDULE' &&
      (orderDetail?.work_orders?.work_order_status[0]?.status?.category === 'TUKANGSURVEY'
        ? 'TUKANGSURVEY'
        : orderDetail?.work_orders?.work_order_status[0]?.status?.category === 'TUKANGWORK'
        ? 'TUKANGWORK'
        : null)

    const status = rescheduleStatus || getStatusNameByCategory(orderDetail?.status?.category)
    const desiredStatus =
      statusData.find((statuses: StatusStorage) => statuses.category === status)?.value ?? null
    setOrderStatusLabel(desiredStatus?.toString() ?? '')

    setWorkOrder({
      ...workOrder,
      work_order_status: desiredStatus === null ? orderDetail?.status?.id : desiredStatus,
    })
  }, [orderDetail?.status, orderDetail?.work_orders])

  const workOrderHandler = (
    value: number | string | Array<number | string | null> | any | null,
    target: string,
    setStateAction: SetStateAction<typeof setWorkOrder> = setWorkOrder
  ) => {
    setWorkOrder((prev) => {
      const cache = {...prev, [target]: value}
      return cache
    })
  }

  const tukangHandler = (selectedOptions: any, field: any) => {
    const type = field === 'survey_tukang_id' ? 1 : 2

    setWorkOrder((prevWorkOrder) => {
      const updatedTukang = selectedOptions.map((option: any) => ({
        ...option,
        type: type,
      }))

      const filteredTukang = prevWorkOrder.tukang_id.filter((x: any) => x.type !== type)
      const mergedTukang = [...filteredTukang, ...updatedTukang]

      return {
        ...prevWorkOrder,
        tukang_id: mergedTukang,
      }
    })
  }

  // Change Select Session
  useEffect(() => {
    setWorkOrder((prev) => ({
      ...prev,
      session: selectedSession?.value ?? null,
    }))
  }, [selectedSession])

  // Tukang Validation
  const hasWorker = (worker: WorkOrderTukang[], type: number) => {
    if (!Array.isArray(worker)) return false
    return worker.some((item) => item && item.type === type)
  }

  // Work Order Validation
  const validateWorkOrder = (workOrder: WorkOrder, orderDetail: Orders) => {
    const errors = []
    const worker = workOrder.tukang_id || []
    const paymentType = orderDetail.payment_type

    const requiredFields = [
      {key: 'order_id', fieldName: 'Order'},
      {key: 'vendor_id', fieldName: 'Vendor'},
      {key: 'request_work_time', fieldName: 'Tanggal Request Survey'},
      {key: 'work_order_status', fieldName: 'Status Work Order'},
      {key: 'session', fieldName: 'Sesi'},
      {key: 'tukang_id', fieldName: 'Teknisi'},
    ]

    switch (paymentType) {
      case 'survey':
        if (orderDetail?.quotation?.length === 0) {
          requiredFields.push({key: 'survey_date', fieldName: 'Tanggal Survey'})
        } else {
          requiredFields.push(
            {key: 'work_start_date', fieldName: 'Tanggal Mulai Pengerjaan'},
            {key: 'work_end_date', fieldName: 'Tanggal Selesai Pengerjaan'}
          )
        }
        break

      case 'gratis':
      case 'pemasangan_tanpa_survey':
        requiredFields.push(
          {key: 'work_start_date', fieldName: 'Tanggal Mulai Pengerjaan'},
          {key: 'work_end_date', fieldName: 'Tanggal Selesai Pengerjaan'}
        )
        break

      default:
        break
    }

    requiredFields.forEach((field) => {
      const value = workOrder[field.key]

      if (!value || (Array.isArray(value) && value.length === 0)) {
        errors.push(`Kolom ${field.fieldName} wajib diisi.`)
      }
    })

    if (paymentType === 'survey') {
      if (orderDetail.quotation?.length === 0 && !hasWorker(worker, 1)) {
        errors.push('Harap pilih minimal satu Tukang Survei.')
      } else if (orderDetail.quotation?.length > 0 && !hasWorker(worker, 2)) {
        errors.push('Harap pilih minimal satu Tukang Pengerjaan.')
      }
    } else if (paymentType === 'gratis' && !hasWorker(worker, 2)) {
      errors.push('Harap pilih minimal satu Tukang Pengerjaan.')
    } else if (paymentType === 'pemasangan_tanpa_survey' && !hasWorker(worker, 2)) {
      errors.push('Harap pilih minimal satu Tukang Pengerjaan.')
    }

    return errors
  }

  const handleUpdateWorkOrder = async () => {
    setIsLoading(true)

    const url = !!workOrder.id ? `${apiUrl}/work-orders/${workOrder.id}` : `${apiUrl}/work-orders`
    const errorMessages = validateWorkOrder(workOrder, orderDetail)
    const formData = new FormData()

    if (errorMessages.length > 0) {
      setIsLoading(false)

      Swal.fire({
        title: 'Data Belum Lengkap',
        html: `<div style="text-align: left; margin-left: 0px;">Mohon periksa kembali kolom berikut:<br/><ul>${errorMessages
          .map((msg) => `<li>${msg}</li>`)
          .join('')}</ul></div>`,
        icon: 'warning',
      })

      return
    }

    for (const key in workOrder) {
      if (Object.prototype.hasOwnProperty.call(workOrder, key)) {
        const value = workOrder[key]

        if (key === 'tukang_id' && Array.isArray(value)) {
          value.forEach((item, index) => {
            if (item.tukang_id) {
              formData.append(`work_order_tukang[${index}][tukang_id]`, item.tukang_id)
            }
            if (item.type) {
              formData.append(`work_order_tukang[${index}][type]`, item.type)
            }
          })
        } else if (value !== null && value !== undefined) {
          formData.append(key, value)
        }
      }
    }

    try {
      const response = await axios.post(url, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (response.data.status === 200 || response.data.status === 201) {
        sendMessage().catch((error) => {
          console.error('Error sending chat status message:', error)
        })
        
        Swal.fire({
          title: 'Berhasil',
          text: 'Data Work Order telah berhasil disimpan.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        })
        navigate('/work-order/view-work-order')
      } else {
        Swal.fire({
          title: 'Gagal',
          text: response.data.message || 'Terjadi kesalahan saat menyimpan data.',
          icon: 'error',
        })
      }
    } catch (error: any) {
      setIsLoading(false)
      Swal.fire({
        title: 'Terjadi Kesalahan',
        text: error.response.data.message || 'Tidak dapat terhubung ke server.',
        icon: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    const statusAll: any = statusData.find((t: any) => t.value === Number(orderStatusLabel))
    if (!statusAll?.description) {
      console.warn('Skipping chat status message: status description not found')
      return
    }

    const filteredTemplates: any = template.find(
      (t: any) => t.subCategory === statusAll.description && t.status === 'Active'
    )
    if (!filteredTemplates) {
      console.warn(`Skipping chat status message: active template not found for ${statusAll.description}`)
      return
    }

    if (filteredTemplates.withImage) {
      const data = {
        message: filteredTemplates?.content,
        chatId: `62${orderDetail?.project_number}@c.us`,
        adminRole: userRole,
        imagePath: filteredTemplates?.imageUrl,
      }

      await axios
        .post(`${apiChat}/send-message-change-status-image`, data)
        .then((response) => {
          console.log(response)
        })
        .catch((error) => {
          console.error(error)
        })
    } else {
      const data = {
        message: filteredTemplates?.content,
        chatId: `62${orderDetail?.project_number}@c.us`,
        adminRole: userRole,
      }

      await axios
        .post(`${apiChat}/send-message-change-status`, data)
        .then((response) => {
          console.log(response)
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }
  return (
    <section id='update-work-order'>
      <Card className=' mb-5'>
        <Card.Body>
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
                <Col>
                  <Form.Label className='fs-4 fw-bold'>
                    Order ID : <span className='fs-4 ms-2 fw-normal'>{orderDetail?.id ?? ''}</span>
                  </Form.Label>
                </Col>

                <Col>
                  <Form.Label className='fs-4 fw-bold'>
                    Work Order ID :{' '}
                    <span className='fs-4 ms-2 fw-normal'>
                      {orderDetail?.work_orders?.id ?? '-'}
                    </span>
                  </Form.Label>
                </Col>
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
                  <Form.Group as={Row}>
                    <Form.Label className='fs-4 fw-bold pt-0'>
                      {orderDetail?.work_orders === null
                        ? 'New Work Status : '
                        : 'Update Work Status : '}
                      <span className='fw-normal'>
                        {orderDetail?.status?.category === 'SURVEYREQ'
                          ? 'Tukang ditugaskan untuk survei'
                          : [
                              'WORKREQ',
                              'WORKREQSTEPONE',
                              'WORKREQSTEPTWO',
                              'WORKREQSTEPTHREE',
                            ].includes(orderDetail?.status?.category)
                          ? 'Tukang ditugaskan untuk pengerjaan'
                          : orderDetail?.status?.description}
                      </span>
                    </Form.Label>
                  </Form.Group>
                </Col>
              </Col>
            </Row>

            <Row className='information-detail'>
              <Col xxl={6} xl={6} lg={6} md={12} sm={12} xs={12} className='costumer-info mb-5'>
                <div className='fs-4 fw-bold'>Informasi Pembeli</div>

                <Row>
                  <Col xxl={6} xl={6} lg={6} md={6} sm={12} xs={12}>
                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='6'>
                        No Member
                      </Form.Label>
                      <Col sm='6'>
                        <p className='fs-7'>{orderDetail?.members?.member_number ?? ''}</p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='6'>
                        Customer Name
                      </Form.Label>
                      <Col sm='6'>
                        <p className='fs-7'>{orderDetail?.members?.full_name ?? ''}</p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='6'>
                        Alamat Pemasangan
                      </Form.Label>
                      <Col sm='6'>
                        <p className='fs-7'>{orderDetail?.project_address ?? ''}</p>
                      </Col>
                    </Form.Group>
                  </Col>

                  <Col xxl={6} xl={6} lg={6} md={6} sm={12} xs={12}>
                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='4'>
                        Nomor Telp/WA
                      </Form.Label>

                      <Col sm='8'>
                        <p className='fs-7'>{orderDetail?.project_number ?? ''}</p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='4'>
                        Alamat Email
                      </Form.Label>

                      <Col sm='8'>
                        <p className='fs-7'>{orderDetail?.members?.email ?? ''} </p>
                      </Col>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col xxl={6} xl={6} lg={6} md={12} sm={12} xs={12} className='sales-info mb-5'>
                <Row>
                  {[
                    'SURVEYREQ',
                    'TUKANGSURVEY',
                    'SURVEYSTART',
                    'SURVEYDONE',
                    'RESURVEYREQ',
                    'RESURVEYSTART',
                    'RESURVEYDONE',
                    'RESCHEDULE',
                  ].includes(orderDetail?.status?.category) && (
                    <Col>
                      <div className='survey mb-3'>
                        <div className='fs-4 fw-bold'>Survey</div>

                        <Form.Group className='detail-info mb-3'>
                          <Form.Label>Sesi :</Form.Label>

                          <Select
                            name='session_id'
                            className='form-control p-0'
                            classNamePrefix='select'
                            placeholder='Pilih Sesi'
                            isSearchable={true}
                            options={sessionOptions}
                            value={{
                              value: selectedSession?.value ?? null,
                              label: selectedSession?.label ?? 'Pilih Sesi',
                            }}
                            onChange={(newValue) => setSelectedSession(newValue)}
                          />
                        </Form.Group>

                        <Form.Group className='detail-info mb-3'>
                          <Form.Label>Tanggal Survey :</Form.Label>

                          {orderDetail?.status?.category !== 'SURVEYDONE' ? (
                            <DatePicker
                              showTime={{
                                format: 'HH:mm',
                                hideDisabledOptions: true,
                                disabledHours: () => getDisabledHours(selectedSession.label),
                              }}
                              className='date-range w-100'
                              format='DD-MM-YYYY HH:mm'
                              disabledDate={disableDateBeforeToday}
                              value={
                                workOrder.survey_date
                                  ? dayjs(workOrder.survey_date, 'YYYY-MM-DD HH:mm')
                                  : null
                              }
                              onChange={(value) => {
                                const surveyDate = value ? value.format('YYYY-MM-DDTHH:mm') : ''
                                setWorkOrder((prev) => ({
                                  ...prev,
                                  survey_date: surveyDate,
                                }))
                              }}
                            />
                          ) : (
                            <p>{formatDateWithTime(orderDetail?.work_orders?.survey_date)}</p>
                          )}
                        </Form.Group>

                        <Form.Group className='detail-info mb-3'>
                          <Form.Label>Nama Lengkap Teknisi :</Form.Label>

                          <Select
                            classNamePrefix='select'
                            placeholder='Pilih Teknisi'
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            isMulti
                            options={tukang}
                            getOptionLabel={(option) => `${option.tukang_name}`}
                            getOptionValue={(option) => `${option.tukang_id}`}
                            value={workOrder.tukang_id.filter((x) => x.type === 1)}
                            onChange={(e) => tukangHandler(e, 'survey_tukang_id')}
                            onInputChange={(newValue) => setSearchTukang(newValue)}
                          />
                        </Form.Group>
                      </div>
                    </Col>
                  )}

                  {[
                    'WORKREQ',
                    'TUKANGWORK',
                    'WORKSTART',
                    'WORKEND',
                    'REWORKREQ',
                    'REWORKSTART',
                    'REWORKEND',
                    'RESCHEDULE',
                    'DONE',
                    'WORKREQSTEPONE',
                    'WORKREQSTEPTWO',
                    'WORKREQSTEPTHREE',
                    'WORKSTARTSTEPONE',
                    'WORKSTARTSTEPTWO',
                    'WORKSTARTSTEPTHREE',
                    'WORKENDSTEPONE',
                    'WORKENDSTEPTWO',
                    'WORKENDSTEPTHREE',
                    'TUKANGWORKSTEPONE',
                    'TUKANGWORKSTEPTWO',
                    'TUKANGWORKSTEPTHREE',
                  ].includes(orderDetail?.status?.category) && (
                    <Col>
                      <div className='work-date'>
                        <div className='fs-4 fw-bold'>Pengerjaan</div>

                        <Form.Group className='detail-info mb-3'>
                          <Form.Label>Sesi :</Form.Label>

                          <Select
                            name='session_id'
                            className='form-control p-0'
                            classNamePrefix='select'
                            placeholder='Pilih Sesi'
                            isSearchable={true}
                            options={sessionOptions}
                            value={{
                              value: selectedSession?.value ?? null,
                              label: selectedSession?.label ?? '',
                            }}
                            onChange={(newValue) => setSelectedSession(newValue)}
                          />
                        </Form.Group>

                        <Form.Group className='detail-info mb-3'>
                          <Form.Label>Tanggal mulai pengerjaan :</Form.Label>

                          {orderDetail?.status?.category !== 'WORKEND' ? (
                            <RangePicker
                              showTime={{
                                format: 'HH:mm',
                                hideDisabledOptions: true,
                                disabledHours: () => getDisabledHours(selectedSession.label),
                              }}
                              className='date-range w-100'
                              format='DD-MM-YYYY HH:mm'
                              disabledDate={disableDateBeforeToday}
                              value={
                                (workOrder.work_start_date &&
                                  workOrder.work_end_date && [
                                    dayjs(workOrder.work_start_date, 'YYYY-MM-DD HH:mm'),
                                    dayjs(workOrder.work_end_date, 'YYYY-MM-DD HH:mm'),
                                  ]) ||
                                undefined
                              }
                              onChange={(values) => {
                                if (values && values.length === 2) {
                                  const dateFromFormatted =
                                    values[0]?.format('YYYY-MM-DDTHH:mm') || ''
                                  const dateToFormatted =
                                    values[1]?.format('YYYY-MM-DDTHH:mm') || ''

                                  setWorkOrder((prev) => ({
                                    ...prev,
                                    work_start_date: dateFromFormatted,
                                    work_end_date: dateToFormatted,
                                  }))
                                } else {
                                  setWorkOrder({
                                    id: null,
                                    order_id: null,
                                    vendor_id: null,
                                    session: null,
                                    tukang_id: [],
                                    request_work_time: '',
                                    survey_date: '',
                                    work_order_status: null,
                                    complaint_status: null,
                                    work_start_date: '',
                                    work_end_date: '',
                                    work_order_item: [],
                                  })
                                }
                              }}
                            />
                          ) : (
                            <p>
                              {formatDateWithTime(orderDetail?.work_orders?.work_start_date)} sampai{' '}
                              {formatDateWithTime(orderDetail?.work_orders?.work_end_date)}
                            </p>
                          )}
                        </Form.Group>

                        <Form.Group className='detail-info mb-3'>
                          <Form.Label>Nama Lengkap Teknisi :</Form.Label>

                          <Select
                            classNamePrefix='select'
                            placeholder='Pilih Teknisi'
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            isMulti
                            options={tukang}
                            getOptionLabel={(option) => `${option.tukang_name}`}
                            getOptionValue={(option) => `${option.tukang_id}`}
                            value={workOrder.tukang_id.filter((x) => x.type === 2)}
                            onChange={(e) => tukangHandler(e, 'work_tukang_id')}
                            onInputChange={(newValue) => setSearchTukang(newValue)}
                          />
                        </Form.Group>
                      </div>
                    </Col>
                  )}
                </Row>
              </Col>
            </Row>
          </div>

          <Row className='table-warranty d-flex align-items-center mb-3'>
            <div className='table-title-warranty'>
              <div className='fs-3 fw-bold'>Informasi Pemasangan</div>
              <Row>
                <Col xxl={3} xl={3} lg={3} md={3} sm={12}>
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
                </Col>

                {orderDetail?.payment_type === 'survey' && (
                  <Col xxl={3} xl={3} lg={3} md={3} sm={12}>
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
                  </Col>
                )}

                <Col xxl={3} xl={3} lg={3} md={3} sm={12}>
                  <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                    <Form.Label column>Informasi Vendor Pemasangan :</Form.Label>
                    <Col>
                      <p className='fs-7 p-0'>{orderDetail?.vendor?.company_name ?? '-'}</p>
                    </Col>
                  </Form.Group>
                </Col>

                <Col xxl={3} xl={3} lg={3} md={3} sm={12}>
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
                </Col>
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
                [
                  'SURVEYREQ',
                  'SURVEYSTART',
                  'SURVEYDONE',
                  'RESURVEYREQ',
                  'RESURVEYSTART',
                  'RESURVEYDONE',
                ].includes(orderDetail?.work_orders?.work_order_status[0]?.status?.category) &&
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
                          orderDetail.work_orders.work_order_status[0].work_order_items.map(
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
                        <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 1</div>

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

          <Row>
            <Col>
              <div className='fs-3 fw-bold'>Catatan Order</div>

              <div className='detail-info mb-3'>
                <p className='fs-5 fw-bold'>Catatan Toko :</p>

                <p className='fs-7'>
                  {orderDetail.notes ? orderDetail.notes : 'Toko tidak memberikan catatan'}
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
                  {orderDetail?.quotation?.[0]?.description
                    ? orderDetail?.quotation?.[0]?.description
                    : 'Vendor tidak memberikan catatan'}
                </p>
              </div>
            </Col>
          </Row>

          {[
            'SURVEYDONE',
            'WORKEND',
            'WORKENDSTEPONE',
            'WORKENDSTEPTWO',
            'WORKENDSTEPTHREE',
          ].includes(orderDetail?.status?.category) ? (
            <div className='d-flex justify-content-center'>
              <Button
                className='btn-done d-flex justify-content-center align-items-center'
                // disabled
              >
                Order Selesai
              </Button>
            </div>
          ) : [
              'QUOTEOUT',
              'QUOTEPAID',
              'QUOTEPAIDSTEPONE',
              'QUOTEPAIDSTEPTWO',
              'QUOTEPAIDSTEPTHREE',
            ].includes(orderDetail?.status?.category) ? (
            <></>
          ) : (
            <div className='d-flex justify-content-center'>
              <Button
                className='d-flex justify-content-center align-items-center'
                variant='dark-primary'
                type='submit'
                // disabled={isLoading}
                onClick={handleUpdateWorkOrder}
              >
                {isLoading ? 'Submitting Order...' : 'Save'}
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {orderDetail?.reschedule && orderDetail?.reschedule?.length > 0 && (
        <Card className='mt-5 mb-5'>
          <Card.Header>
            <Card.Title>Reschedule History</Card.Title>
          </Card.Header>

          <Card.Body>
            <Row className='mb-5'>
              <Col>
                <Form.Group>
                  <Form.Label>Tanggal Konfirmasi Awal Vendor :</Form.Label>

                  <p className='fs-6'>
                    {orderDetail?.work_orders
                      ? orderDetail.work_orders.work_start_date &&
                        orderDetail.work_orders.work_end_date
                        ? `${formatDateWithTime(
                            orderDetail.work_orders.work_start_date
                          )} sampai  ${formatDateWithTime(orderDetail.work_orders.work_end_date)}`
                        : orderDetail.work_orders.survey_date
                        ? formatDateWithTime(orderDetail?.work_orders?.survey_date)
                        : 'Tanggal belum dikonfirmasi vendor'
                      : 'Tanggal belum dikonfirmasi vendor'}
                  </p>
                </Form.Group>
              </Col>

              <Col>
                <Form.Group>
                  <Form.Label>Tanggal Pengajuan Reschedule :</Form.Label>

                  <p className='fs-6'>
                    {orderDetail?.reschedule[0]?.reschedule_date
                      ? `${formatDateWithTimeZone(orderDetail?.reschedule[0]?.reschedule_date)}`
                      : 'Tanggal belum ditentukan vendor'}
                  </p>
                </Form.Group>
              </Col>

              <Col>
                <Form.Group>
                  <Form.Label>Tanggal Konfirmasi Vendor :</Form.Label>

                  <p className='fs-6'>
                    {orderDetail?.reschedule[0]?.confirm_date
                      ? ` ${formatDateWithTime(orderDetail?.reschedule[0]?.confirm_date)}`
                      : 'Tanggal belum ditentukan vendor'}
                  </p>
                </Form.Group>
              </Col>
            </Row>

            <Row className='mb-5'>
              <Col>
                <Form.Label className='mt-3'>Bukti File :</Form.Label>
                <ListGroup>
                  {orderDetail?.reschedule?.[0]?.reschedule_evidences?.map((item: any) => (
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
          </Card.Body>
        </Card>
      )}

      <Card className='mb-5'>
        <Card.Header>
          <Card.Title className='fw-bold'>Order History</Card.Title>
        </Card.Header>

        <Card.Body>
          <div className='work-order-history'>
            <Steps
              progressDot
              current={OrderHistory.length - 1}
              direction='vertical'
              items={OrderHistory.map((item) => ({
                title: item?.status,
                description: `Terakhir update : ${item?.created_at} ${
                  item.updated_by ? `oleh ${item?.updated_by}` : ''
                }`,
              }))}
            />
          </div>
        </Card.Body>
      </Card>
    </section>
  )
}

export {UpdateWorkVendor}
