import React, {FC, useState, useEffect, useRef} from 'react'
import axiosInstance from '../../../../../_metronic/layout/core/axiosInterceptor'
import {useNavigate} from 'react-router-dom'
import {formatDate, formatDateWithTime} from '../../../../../_metronic/helpers'

import './NewReschedule.css'

import axios from 'axios'
import dayjs from 'dayjs'
import Select from 'react-select'
import Swal from 'sweetalert2'
import {Table, Form, Button, Row, Col, Card, ListGroup} from 'react-bootstrap'
import {Image, DatePicker} from 'antd'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faImage, faFileImage} from '@fortawesome/free-solid-svg-icons'

interface Reschedule {
  order_id: any
  status_id: any
  reschedule_date: string
  reschedule_status_id: any
  description: string
  reschedule_status_by: string
}

interface Status {
  value: number
  category: string
}

const NewReschedule: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()

  const userRole = localStorage.getItem('userRole') as string
  const userStore = localStorage.getItem('storeId')
  const userTukang = localStorage.getItem('tukang_id')
  const storeId = !['Super User', 'Admin HO'].includes(userRole) ? `&store_id=${userStore}` : ''
  const tukangId = userTukang ? `&tukang_id=${userTukang}` : ''

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [searchOrder, setSearchOrder] = useState('')
  const [order, setOrder] = useState<any>()
  const [orderDetail, setOrderDetail] = useState<any>()
  const [selectedOrder, setSelectedOrder] = useState<any>({
    value: null,
    label: 'Ketik/Pilih Order Id',
    status_id: null,
  })
  const search = searchOrder ? `&search=${searchOrder}` : ''

  const [reschedule, setReschedule] = useState<Reschedule>({
    order_id: null,
    status_id: null,
    reschedule_date: '',
    reschedule_status_id: null,
    description: '',
    reschedule_status_by: userRole,
  })

  const storedStatus = localStorage.getItem('statusData')
  const statusData: Array<Status> = storedStatus ? JSON.parse(storedStatus) : []
  const desiredStatus = statusData.filter((status: any) =>
    [
      'SURVEYREQ',
      'TUKANGSURVEY',
      'TUKANGWORK',
      'WORKREQ',
      'TUKANGWORKSTEPONE',
      'TUKANGWORKSTEPTWO',
      'TUKANGWORKSTEPTHREE',
    ].includes(status.category)
  )
  const statuses = desiredStatus.map((x) => x.value)

  const getOrder = async () => {
    const response = await axiosInstance.get(
      `${apiUrl}/orders?order_by=desc&take=0&status=${statuses}${storeId}${tukangId}${search}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      }
    )

    if (Array.isArray(response.data.data)) {
      const tempOrder = response.data.data.map((item: any) => ({
        value: item.id,
        label: item.id,
        status_id: item.status.id,
      }))

      setOrder(tempOrder)
    } else {
      console.error('API response data is not an array:', response.data)
    }
  }

  const getOrderDetail = async () => {
    try {
      await axios
        .get(`${apiUrl}/orders/${selectedOrder?.value}`, {
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

  useEffect(() => {
    getOrder()
  }, [searchOrder])

  useEffect(() => {
    if (selectedOrder?.value) {
      getOrderDetail()
    }
  }, [selectedOrder?.value])

  // Selected Order
  useEffect(() => {
    setReschedule({
      ...reschedule,
      order_id: selectedOrder?.value ?? null,
      status_id: selectedOrder?.status_id ?? null,
    })
  }, [selectedOrder])

  // Reschedule Status
  useEffect(() => {
    const storedStatus = localStorage.getItem('statusData')
    const statusData = storedStatus ? JSON.parse(storedStatus) : []

    const desiredStatus = statusData.find((status: any) => status.category === 'RESCHEDULE')
    const statusId = desiredStatus?.value

    setReschedule((prevRescheduleValues) => ({
      ...prevRescheduleValues,
      reschedule_status_id: statusId,
    }))
  }, [reschedule])

  // Reschedule Handler Form
  const RescheduleFormHandler = (e: any) => {
    setReschedule({
      ...reschedule,
      [e.target.name]: e.target.value,
    })
  }

  // Upload File Reschedule
  const [rescheduleEvidence, setRescheduleEvidence] = useState<Array<File | null>>([])
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
  const evidenceRef = useRef<HTMLInputElement>(null)

  const [previewImage, setPreviewImage] = useState<any>()
  const [visible, setVisible] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const {length} = fileList

      for (let i = 0; i < length; i++) {
        file[i] = fileList.item(i)
      }

      setRescheduleEvidence(file)
    }
  }

  const handleImageClick = () => {
    const inputField = document.querySelector('.input-field-image') as HTMLInputElement
    inputField.click()
  }

  const handleFileClick = (index: number) => {
    setPreviewImage(rescheduleEvidence[index]?.name)
    setVisible(true)
    setSelectedFileIndex(index)
  }

  const handleRemoveFile = (index: number) => {
    const newEvidances = [...rescheduleEvidence]

    newEvidances.splice(index, 1)

    setRescheduleEvidence(newEvidances)

    // Update element value
    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  // Reschedule Validation
  const RescheduleValidation = () => {
    let valid = true

    if (!selectedOrder?.value) {
      Swal.fire({
        title: 'Error',
        text: 'Please select order Id',
        icon: 'error',
      })
      valid = false
    } else if (!reschedule.description) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill reschedule description form',
        icon: 'error',
      })
      valid = false
    } else if (!rescheduleEvidence) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill reschedule evidence form',
        icon: 'error',
      })
      valid = false
    }
    return valid
  }

  // Clear State After Submit
  const clear = () => {
    // Order
    setOrderDetail(null)
    setSelectedOrder({
      value: null,
      label: 'Ketik/Pilih Order Id',
    })

    // Complaint
    setReschedule({
      ...reschedule,
      order_id: null,
      status_id: null,
      reschedule_date: '',
      reschedule_status_id: null,
      description: '',
      reschedule_status_by: userRole,
    })
    setRescheduleEvidence([])
  }

  // Handle Submit New Reschedule
  const handleSubmitReschedule = async () => {
    if (RescheduleValidation()) {
      setIsLoading(true)

      const formData = new FormData()

      formData.append('order_id', reschedule.order_id)
      formData.append('status_id', reschedule.status_id)
      formData.append('reschedule_date', reschedule.reschedule_date)

      formData.append('reschedule_status[status_id]', reschedule.reschedule_status_id)
      formData.append('reschedule_status[description]', reschedule.description)
      formData.append('reschedule_status[status_by]', reschedule.reschedule_status_by)

      if (rescheduleEvidence?.length) {
        rescheduleEvidence.forEach((item) => {
          if (item) {
            formData.append(`reschedule_evidences`, item, item?.name)
          }
        })
      }

      await axios
        .post(`${apiUrl}/reschedule`, formData, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })
        .then((response) => {
          if (response.data.status === 201) {
            Swal.fire({
              title: 'Success',
              text: 'Success Create Reschedule',
              icon: 'success',
              showConfirmButton: false,
              timer: 1500,
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

          navigate('/reschedule/view-reschedule')
        })
        .catch((error) => {
          console.error(error)
          setIsLoading(false)

          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
          })
        })
    }
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
  }, [orderDetail?.quotation?.[0]?.quotation_grand_total])

  return (
    <section id='new-reschedule'>
      <Card className='mb=5'>
        <Card.Body>
          <div className='form-wrapper'>
            <Row className='form-header'>
              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Label className='fs-4 fw-bold'>
                  Nama Toko :
                  <span className='fs-4 ms-2 fw-normal'>
                    {orderDetail?.store?.store_name ?? ''}
                  </span>
                </Form.Label>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Group as={Row} className='order-id-complaint'>
                  <Form.Label column sm='3' className='fs-4 fw-bold'>
                    Order ID :
                  </Form.Label>
                  <Col sm='9'>
                    <Select
                      name='order_id'
                      className='form-control p-0'
                      placeholder='Ketik/Pilih Order Id'
                      isSearchable={true}
                      options={order}
                      onChange={(newValue) => setSelectedOrder(newValue)}
                      onInputChange={(newValue) => setSearchOrder(newValue)}
                    />
                  </Col>
                </Form.Group>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Label className='fs-4 fw-bold'>
                  Receipt Number :
                  <span className='fs-4 ms-2 fw-normal'>{orderDetail?.receipt_number ?? '-'}</span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-4 fw-bold'>
                  LAST ORDER STATUS :{' '}
                  <span className='fs-4 ms-2 fw-bold text-success'>
                    {orderDetail?.status?.description}
                  </span>
                </Form.Label>
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
                        Nomor Telp/WA :
                      </Form.Label>
                      <Col sm='7'>
                        <p className='fs-7'>{orderDetail?.project_number}</p>
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
                <Form.Group
                  as={Col}
                  xxl={4}
                  xl={4}
                  md={4}
                  sm={12}
                  className='mb-3'
                  controlId='formPlaintextEmail'
                >
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
                    <p className='fs-7 p-0'>
                      {orderDetail?.request_survey
                        ? formatDate(orderDetail?.request_survey)
                        : 'Tanggal belum ditentukan toko'}
                    </p>
                  </Col>
                </Form.Group>

                {orderDetail?.payment_type === 'survey' && (
                  <Form.Group
                    as={Col}
                    xxl={4}
                    xl={4}
                    md={4}
                    sm={12}
                    className='mb-3'
                    controlId='formPlaintextEmail'
                  >
                    <Form.Label column>Tanggal request pemasangan</Form.Label>
                    <Col>
                      <p className='fs-7 p-0'>{formatDate(orderDetail?.request_survey)}</p>
                    </Col>
                  </Form.Group>
                )}

                <Form.Group
                  as={Col}
                  xxl={4}
                  xl={4}
                  md={4}
                  sm={12}
                  className='mb-3'
                  controlId='formPlaintextEmail'
                >
                  <Form.Label column>Informasi Vendor Pemasangan :</Form.Label>
                  <Col>
                    <p className='fs-7 p-0'>{orderDetail?.vendor?.company_name ?? '-'}</p>
                  </Col>
                </Form.Group>

                <Form.Group
                  as={Col}
                  xxl={4}
                  xl={4}
                  md={4}
                  sm={12}
                  className='mb-3'
                  controlId='formPlaintextEmail'
                >
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
                          *orderDetail ini lebih dari{' '}
                          <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                          toko sehingga dikenakan biaya tambahan
                        </Form.Text>
                      </>
                    )}

                    <Table hover responsive>
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
                    </Table>
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
                    <Table hover responsive>
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
                    </Table>
                  </div>
                )
              } else if (
                orderDetail?.quotation?.length >= 1 &&
                orderDetail?.payment_type === 'survey'
              ) {
                return (
                  <div className='table-warranty-content'>
                    {orderDetail?.quotation?.[0]?.quotation_special === 0 ? (
                      <Table hover responsive>
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
                      </Table>
                    ) : (
                      <>
                        <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 1</div>

                        <Table hover responsive>
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
                        </Table>

                        <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 2</div>

                        <Table hover responsive>
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
                        </Table>

                        <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 3</div>

                        <Table hover responsive>
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
                        </Table>
                      </>
                    )}

                    <Table hover responsive>
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
                    </Table>
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
                          *orderDetail ini lebih dari{' '}
                          <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                          toko sehingga dikenakan biaya tambahan
                        </Form.Text>
                      </>
                    )}

                    <Table hover responsive>
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
                    </Table>
                  </div>
                )
              }
            })()}
          </Row>

          {orderDetail?.quotation?.[0]?.quotation_special === 1 && (
            <Row className='information-detail mb-3'>
              <Col>
                <div className='fs-3 fw-bold'>Preview Pembayaran</div>

                <Table hover responsive>
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
                </Table>
              </Col>
            </Row>
          )}

          <Row>
            <Col xxl={6} xl={6} md={6} sm={12}>
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
                        <p className='fs-7'>orderDetail ini tanpa survey</p>
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
                      <p className='fs-7'>orderDetail ini tanpa survey</p>
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

            <Col xxl={6} xl={6} md={6} sm={12}>
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
            </Col>
          </Row>

          <hr />

          <div className='title mb-3'>
            <h1 className='text-uppercase'>formulir reschedule</h1>
          </div>

          <Row className='mb-3'>
            <Col xxl={4} xl={4} md={4} sm={12}>
              <Form.Group className='detail-info mb-3'>
                <Form.Label>Tanggal Request Survey/Pekerjaan :</Form.Label>

                <p className='fs-6'>
                  {orderDetail?.request_survey
                    ? `${formatDate(orderDetail?.request_survey)}`
                    : 'Tanggal belum ditentukan toko'}
                </p>
              </Form.Group>

              <Form.Group className='detail-info mb-3'>
                <Form.Label>Tanggal Konfirmasi Awal Vendor :</Form.Label>
                <p className='fs-6'>
                  {orderDetail?.work_orders
                    ? orderDetail.work_orders.work_start_date &&
                      orderDetail.work_orders.work_end_date
                      ? ` ${formatDateWithTime(
                          orderDetail.work_orders.work_start_date
                        )} sampai  ${formatDateWithTime(orderDetail?.work_orders?.work_end_date)}`
                      : orderDetail.work_orders.survey_date
                      ? formatDateWithTime(orderDetail?.work_orders?.survey_date)
                      : 'Tanggal belum dikonfirmasi vendor'
                    : 'Tanggal belum dikonfirmasi vendor'}
                </p>
              </Form.Group>

              <Form.Group className='detail-info mb-3'>
                <Form.Label>Tanggal Pengajuan Reschedule :</Form.Label>

                <DatePicker
                  name='reschedule_date'
                  showTime={{
                    format: 'HH:mm',
                  }}
                  className='date-range w-100'
                  format='DD-MM-YYYY HH:mm'
                  value={
                    reschedule.reschedule_date
                      ? dayjs(reschedule.reschedule_date, 'YYYY-MM-DD HH:mm')
                      : null
                  }
                  onChange={(value) => {
                    const rescheduleDate = value ? value.format('YYYY-MM-DDTHH:mm') : ''
                    setReschedule((prev) => ({
                      ...prev,
                      reschedule_date: rescheduleDate,
                    }))
                  }}
                />
              </Form.Group>
            </Col>

            <Col xxl={4} xl={4} md={4} sm={12}>
              <Form.Group className='detail-info mb-3'>
                <Form.Label>Alasan :</Form.Label>
                <Form.Control
                  as='textarea'
                  className='reason'
                  name='description'
                  onChange={(e) => RescheduleFormHandler(e)}
                />
              </Form.Group>
            </Col>

            <Col xxl={4} xl={4} md={4} sm={12}>
              <Form.Group>
                <Form.Label>UPLOAD FILE PENDUKUNG</Form.Label>
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
                  {rescheduleEvidence.length ? (
                    rescheduleEvidence.map((item, index) => (
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

          <div className='d-flex justify-content-center mt-5'>
            <Button
              className='button-submit m-0'
              variant='dark-primary'
              type='submit'
              disabled={isLoading}
              onClick={handleSubmitReschedule}
            >
              {isLoading ? 'Submitting..' : 'Submit'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </section>
  )
}

export {NewReschedule}
