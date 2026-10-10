/* eslint-disable jsx-a11y/iframe-has-title */
import React, {FC, useState, useEffect, useRef} from 'react'
import {Orders} from '../../../../interfaces/order'

import './DetailWorkOrder.css'

import axios from 'axios'
import {useParams} from 'react-router-dom'
import {Steps, Image, Skeleton} from 'antd'
import {Form, Row, Col, Card, ListGroup, Modal, Button} from 'react-bootstrap'
import {
  formatDate,
  formatDateWithTime,
  formatDateWithTimeZone,
} from '../../../../../_metronic/helpers'
import Swal from 'sweetalert2'

interface Status {
  value: number | null
  category: string
}

interface OrderHistory {
  order_id: number
  status: string
  created_at: string
  updated_by: string
}

const DetailWorkVendor: FC<{updatePageTitle: (order: Orders) => void}> = ({updatePageTitle}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const params = useParams()
  const userRole = localStorage.getItem('userRole')
  const [orderDetail, setOrderDetail] = useState<any>()
  const [previewImage, setPreviewImage] = useState<any>()
  const [visible, setVisible] = useState(false)
  const [visibleReschedule, setVisibleReschedule] = useState(false)
  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const [editingItemId, setEditingItemId] = useState<any>()
  const handleClose = () => setVisible(false)

  // Order History
  const [OrderHistory, setOrderHistory] = useState<OrderHistory[]>([])

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
          updatePageTitle(data)
          setIsLoadingPage(false)

          if (data?.order_history) {
            const orderHistory = data?.order_history.map((item: any) => {
              return {
                status: item?.status?.description,
                created_at: item?.created_at ? formatDateWithTimeZone(item?.created_at) : '-',
                updated_by: item?.created_by?.username,
              }
            })

            setOrderHistory(orderHistory)
          }
        })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchOrderData()
    // eslint-disable-next-line
  }, [])

  // Statuses for Order Timeline
  const storedStatus = localStorage.getItem('statusData')
  const statusData: Array<Status> = storedStatus ? JSON.parse(storedStatus) : []

  const getStatuses = (categories: string[]) =>
    statusData.filter((status: any) => categories.includes(status.category)).map((x) => x.value)

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
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, item: any) => {
    if (e.target.files && e.target.files[0]) {
      const newFile = e.target.files[0]
      const formData = new FormData()
      formData.append(`work_order_evidences`, newFile)
      const api = `${apiUrl}/work-orders/${item.id}/replace-foto`

      const res = await axios.post(api, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (res.data.status === 201) {
        Swal.fire({
          title: 'Success',
          text: 'Work Order Evidence Updated',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        })
        fetchOrderData()
      }
      setEditingItemId(null) // Selesai edit
    }
  }
  const deleteFoto = async (item: any) => {
    const api = `${apiUrl}/work-orders/${item.id}/delete-foto`

    const res = await axios.delete(api, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        // // 'Access-Control-Allow-Origin': '*',
       // // 'ngrok-skip-browser-warning':  'true',
      },
    })

    if (res.data.status === 200) {
      Swal.fire({
        title: 'Success',
        text: 'Work Order Evidence Deleted',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500,
      })
      fetchOrderData()
    }
  }

  const fileInputRef = useRef<any>(null)
  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }
  const handleFileChange2 = async (e: any) => {
    const file = e.target.files[0]

    const formData = new FormData()
    formData.append(`work_order_before`, file)
    const api = `${apiUrl}/work-orders/${orderDetail?.work_orders?.id}/add-foto-before`

    const res = await axios.post(api, formData, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        // // 'Access-Control-Allow-Origin': '*',
       // // 'ngrok-skip-browser-warning':  'true',
      },
    })

    if (res.data.status === 201) {
      Swal.fire({
        title: 'Success',
        text: 'Work Order Evidence Updated',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500,
      })
      fetchOrderData()
    }
  }

  const fileInputAfterRef = useRef<any>(null)
  const handleButtonAfterClick = () => {
    fileInputAfterRef.current?.click()
  }
  const handleFileAfterChange2 = async (e: any) => {
    const file = e.target.files[0]

    const formData = new FormData()
    formData.append(`work_order_after`, file)
    const api = `${apiUrl}/work-orders/${orderDetail?.work_orders?.id}/add-foto-after`

    const res = await axios.post(api, formData, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        // // 'Access-Control-Allow-Origin': '*',
       // // 'ngrok-skip-browser-warning':  'true',
      },
    })

    if (res.data.status === 201) {
      Swal.fire({
        title: 'Success',
        text: 'Work Order Evidence Updated',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500,
      })
      fetchOrderData()
    }
  }
  return (
    <section id='detail-work-order'>
      <Card className='mb-5'>
        <Card.Body>
          <Row className='form-header mb-5'>
            <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
              <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                <Form.Label className='fs-4 fw-bold'>
                  Nama Toko :{' '}
                  <span className='fs-4 ms-2 fw-normal'>
                    {orderDetail?.store?.store_name ?? ''}
                  </span>
                </Form.Label>
              </Skeleton>
            </Col>

            <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
              <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
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
              </Skeleton>
            </Col>

            <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
              <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
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
                      {orderDetail?.status?.description}
                    </span>
                  </Form.Label>
                </Col>
              </Skeleton>
            </Col>
          </Row>

          <Row className='information-detail'>
            <Col xs={12} sm={12} md={8} lg={8} xl={8} xxl={8} className='costumer-info mb-5'>
              <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                <div className='fs-4 fw-bold'>Informasi Pembeli</div>
              </Skeleton>

              <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                <Row>
                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='6'>
                        No Member :
                      </Form.Label>
                      <Col sm='6'>
                        <p className='fs-7'>{orderDetail?.members?.member_number ?? ''}</p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='6'>
                        Customer Name :
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

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
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
              </Skeleton>
            </Col>

            <Col xs={12} sm={12} md={4} lg={4} xl={4} xxl={4} className='sales-info mb-5'>
              <Row>
                {[
                  'SURVEYREQ',
                  'TUKANGSURVEY',
                  'SURVEYSTART',
                  'SURVEYDONE',
                  'RESURVEYREQ',
                  'RESURVEYSTART',
                  'RESURVEYDONE',
                ].includes(orderDetail?.status?.category) && (
                  <Col>
                    <div className='survey mb-3'>
                      <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                        <div className='fs-4 fw-bold'>Survey</div>
                      </Skeleton>

                      <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                        <Form.Group className='detail-info mb-3'>
                          <Form.Label>Tanggal Survey :</Form.Label>

                          {orderDetail?.work_orders !== null &&
                          orderDetail?.work_orders?.survey_date !== null ? (
                            <p>{formatDateWithTime(orderDetail?.work_orders?.survey_date)}</p>
                          ) : (
                            <p>Tanggal survey belum diset oleh vendor</p>
                          )}
                        </Form.Group>

                        <Form.Group className='detail-info mb-3'>
                          <Form.Label>Nama Lengkap Tehnisi :</Form.Label>

                          {orderDetail?.work_orders !== null ? (
                            <p>
                              {Array.from(
                                new Set(
                                  orderDetail?.work_orders?.work_order_tukang
                                    ?.filter((x: any) => x.type === 1)
                                    ?.map((x: any) => x?.tukang?.full_name ?? '-')
                                )
                              ).join(', ')}
                            </p>
                          ) : (
                            <p>Tukang belum diset oleh vendor</p>
                          )}
                        </Form.Group>

                        <Form.Group className='detail-info mb-3'>
                          <Form.Label>Sesi :</Form.Label>

                          {orderDetail?.work_orders !== null ? (
                            <p>
                              {orderDetail?.work_orders?.session === 1
                                ? 'Sesi Pagi'
                                : orderDetail?.work_orders?.session === 2
                                ? 'Sesi Siang'
                                : orderDetail?.work_orders?.session === 3
                                ? 'Sesi Sore'
                                : 'Sesi belum ditentukan oleh vendor'}
                            </p>
                          ) : (
                            <p>Sesi belum ditentukan oleh vendor</p>
                          )}
                        </Form.Group>
                      </Skeleton>
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
                      <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                        <div className='fs-4 fw-bold'>Pengerjaan</div>
                      </Skeleton>

                      <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                        <Form.Group className='detail-info mb-3'>
                          <Form.Label>Tanggal mulai pengerjaan :</Form.Label>

                          {orderDetail?.work_orders !== null &&
                          orderDetail?.work_orders?.work_start_date !== null &&
                          orderDetail?.work_orders?.work_end_date !== null ? (
                            <p>
                              {formatDateWithTime(orderDetail?.work_orders?.work_start_date)} sampai{' '}
                              {formatDateWithTime(orderDetail?.work_orders?.work_end_date)}
                            </p>
                          ) : (
                            <p>Tanggal Pengerjaan belum diset oleh vendor</p>
                          )}
                        </Form.Group>

                        <Form.Group className='detail-info mb-3'>
                          <Form.Label>Nama Lengkap Tehnisi :</Form.Label>

                          {orderDetail?.work_orders?.work_order_tukang?.filter(
                            (x: any) => x.type === 2
                          ).length ? (
                            <p>
                              {Array.from(
                                new Set(
                                  orderDetail?.work_orders?.work_order_tukang
                                    ?.filter((x: any) => x.type === 2)
                                    ?.map((x: any) => x?.tukang?.full_name ?? '-')
                                )
                              ).join(', ')}
                            </p>
                          ) : (
                            <p>Tukang belum diset oleh vendor</p>
                          )}
                        </Form.Group>

                        <Form.Group className='detail-info mb-3'>
                          <Form.Label>Sesi :</Form.Label>

                          {orderDetail?.work_orders !== null ? (
                            <p>
                              {orderDetail?.work_orders?.session === 1
                                ? 'Sesi Pagi'
                                : orderDetail?.work_orders?.session === 2
                                ? 'Sesi Siang'
                                : orderDetail?.work_orders?.session === 3
                                ? 'Sesi Sore'
                                : 'Sesi belum ditentukan oleh vendor'}
                            </p>
                          ) : (
                            <p>Sesi belum ditentukan oleh vendor</p>
                          )}
                        </Form.Group>
                      </Skeleton>
                    </div>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>

          <Row className='table-warranty d-flex align-items-center mb-3'>
            <div className='table-title-warranty'>
              <Skeleton active loading={isLoadingPage} paragraph={{rows: 2}}>
                <div className='fs-3 fw-bold'>Informasi Pemasangan</div>

                <Row>
                  <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                    <Form.Label column>
                      {(() => {
                        if (orderDetail?.payment_type === 'survey') {
                          return `Tanggal request survey`
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
              </Skeleton>
            </div>

            <Skeleton active loading={isLoadingPage} paragraph={{rows: 4}}>
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
                            <>
                              <tr key={`${index} - order_detail`}>
                                <td>{item?.item_code}</td>
                                <td>{item?.item_name}</td>
                                <td>{item?.item_notes}</td>
                                <td>{item?.quantity ?? 0}</td>
                              </tr>
                            </>
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
                    'TUKANGSURVEY',
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
                          {orderDetail?.work_orders?.work_order_status[0]?.work_order_items
                            .length ? (
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
                              orderDetail?.quotation[0]?.quotation_details
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
                            <>
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
                                    <td>{`Rp. ${parseInt(item?.total || 0).toLocaleString(
                                      'id'
                                    )}`}</td>
                                  </>
                                )}
                              </tr>
                            </>
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
            </Skeleton>
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
                  {orderDetail?.quotation?.[0]?.description
                    ? orderDetail?.quotation?.[0]?.description
                    : 'Vendor tidak memberikan catatan'}
                </p>
              </div>
            </Col>
          </Row>

          {/* <Skeleton active loading={isLoadingPage}>
            {orderDetail?.work_orders?.work_order_evidences.length ? (
              <Row>
                <Col>
                  <Form.Label className='mt-3'>Work Before :</Form.Label>
                  <ListGroup>
                    {orderDetail?.work_orders?.work_order_evidences
                      .filter((x: any) => x.type === 2)
                      .map((item: any) => (
                        <ListGroup.Item
                          key={item.id}
                          action
                          onClick={() => {
                            setPreviewImage(item.evidence_location)
                            setVisible(true)
                          }}
                        >
                          {item.evidence_location}
                        </ListGroup.Item>
                      ))}
                  </ListGroup>

                  {previewImage && (
                    <div>
                      <Image
                        key={previewImage}
                        width={200}
                        style={{display: 'none'}}
                        src={`${apiUrl}/public/work-orders/${previewImage}`}
                        preview={{
                          visible,
                          src: `${apiUrl}/public/work-orders/${previewImage}`,
                          onVisibleChange: (value) => {
                            setVisible(value)
                          },
                        }}
                      />
                    </div>
                  )}
                </Col>

                <Col>
                  <Form.Label className='mt-3'>Work After :</Form.Label>
                  <ListGroup>
                    {orderDetail?.work_orders?.work_order_evidences
                      .filter((x: any) => x.type === 3)
                      .map((item: any) => (
                        <ListGroup.Item
                          key={item.id}
                          action
                          onClick={() => {
                            setPreviewImage(item.evidence_location)
                            setVisible(true)
                          }}
                        >
                          {item.evidence_location}
                        </ListGroup.Item>
                      ))}
                  </ListGroup>

                  {previewImage && (
                    <div>
                      <Image
                        key={previewImage}
                        width={200}
                        style={{display: 'none'}}
                        src={`${apiUrl}/public/work-orders/${previewImage}`}
                        preview={{
                          visible,
                          src: `${apiUrl}/public/work-orders/${previewImage}`,
                          onVisibleChange: (value) => {
                            setVisible(value)
                          },
                        }}
                      />
                    </div>
                  )}
                </Col>
              </Row>
            ) : (
              <></>
            )}
          </Skeleton> */}

          <Skeleton active loading={isLoadingPage}>
            {orderDetail?.work_orders?.work_order_evidences.length ? (
              <Row>
                <Col>
                  <Form.Label className='mt-3'>Work Before :</Form.Label>
                  <Button
                    variant='outline-primary'
                    size='sm'
                    style={{marginLeft: '10px', marginBottom: '10px'}}
                    onClick={handleButtonClick}
                  >
                    Upload File Before
                  </Button>
                  <input
                    type='file'
                    accept='image/*'
                    ref={fileInputRef}
                    style={{display: 'none'}}
                    onChange={handleFileChange2}
                  />
                  <ListGroup>
                    {orderDetail?.work_orders?.work_order_evidences
                      .filter((x: any) => x.type === 2)
                      .map((item: any) => (
                        <ListGroup.Item key={item.id} action>
                          <div className='d-flex justify-content-between align-items-center'>
                            <span
                              onClick={() => {
                                setPreviewImage(item.evidence_location)
                                setVisible(true)
                              }}
                              style={{cursor: 'pointer'}}
                            >
                              {item.evidence_location}
                            </span>
                            <div>
                              {userRole === 'Owner Vendor' && (
                                <>
                                  {' '}
                                  <Button
                                    variant='outline-primary'
                                    size='sm'
                                    onClick={() => {
                                      setEditingItemId(item.evidence_location)
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant='outline-primary'
                                    size='sm'
                                    style={{marginLeft: 5}}
                                    onClick={() => {
                                      Swal.fire({
                                        title: 'Apakah kamu yakin?',
                                        text: 'Foto ini akan dihapus secara permanen!',
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: '#d33',
                                        cancelButtonColor: '#3085d6',
                                        confirmButtonText: 'Ya, hapus!',
                                        cancelButtonText: 'Batal',
                                      }).then((result) => {
                                        if (result.isConfirmed) {
                                          deleteFoto(item)
                                        }
                                      })
                                    }}
                                  >
                                    Delete Foto
                                  </Button>
                                  {editingItemId === item.evidence_location && (
                                    <input
                                      type='file'
                                      accept='image/*'
                                      style={{display: 'inline', marginLeft: '10px'}}
                                      onChange={(e) => handleFileChange(e, item)}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                  </ListGroup>
                </Col>

                <Col>
                  <Form.Label className='mt-3'>Work After :</Form.Label>
                  <Button
                    variant='outline-primary'
                    size='sm'
                    style={{marginLeft: '10px', marginBottom: '10px'}}
                    onClick={handleButtonAfterClick}
                  >
                    Upload File After
                  </Button>
                  <input
                    type='file'
                    accept='image/*'
                    ref={fileInputAfterRef}
                    style={{display: 'none'}}
                    onChange={handleFileAfterChange2}
                  />
                  <ListGroup>
                    {orderDetail?.work_orders?.work_order_evidences
                      .filter((x: any) => x.type === 3)
                      .map((item: any) => (
                        <ListGroup.Item key={item.id} action>
                          <div className='d-flex justify-content-between align-items-center'>
                            <span
                              onClick={() => {
                                setPreviewImage(item.evidence_location)
                                setVisible(true)
                              }}
                              style={{cursor: 'pointer'}}
                            >
                              {item.evidence_location}
                            </span>
                            <div>
                              {userRole === 'Owner Vendor' && (
                                <>
                                  {' '}
                                  <Button
                                    variant='outline-primary'
                                    size='sm'
                                    onClick={() => {
                                      setEditingItemId(item.evidence_location)
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant='outline-primary'
                                    size='sm'
                                    style={{marginLeft: 5}}
                                    onClick={() => {
                                      Swal.fire({
                                        title: 'Apakah kamu yakin?',
                                        text: 'Foto ini akan dihapus secara permanen!',
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: '#d33',
                                        cancelButtonColor: '#3085d6',
                                        confirmButtonText: 'Ya, hapus!',
                                        cancelButtonText: 'Batal',
                                      }).then((result) => {
                                        if (result.isConfirmed) {
                                          deleteFoto(item)
                                        }
                                      })
                                    }}
                                  >
                                    Delete Foto
                                  </Button>
                                  {editingItemId === item.evidence_location && (
                                    <input
                                      type='file'
                                      accept='image/*'
                                      style={{display: 'inline', marginLeft: '10px'}}
                                      onChange={(e) => handleFileChange(e, item)}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                  </ListGroup>
                  {previewImage && (
                    <div>
                      <Image
                        key={previewImage}
                        width={200}
                        style={{display: 'none'}}
                        src={`${apiUrl}/public/work-orders/${previewImage}`}
                        preview={{
                          visible,
                          src: `${apiUrl}/public/work-orders/${previewImage}`,
                          onVisibleChange: (value) => {
                            setVisible(value)
                          },
                        }}
                      />
                    </div>
                  )}
                </Col>
              </Row>
            ) : (
              <></>
            )}
          </Skeleton>

          <Skeleton active loading={isLoadingPage}>
            {orderDetail?.complaints && orderDetail?.complaints?.length >= 1 && (
              <div className='complaint-history  mt-3 mb-3'>
                <div className='fs-3 text-uppercase fw-bold text-black mb-4'>Complaint History</div>
                <Steps
                  className='complaint-history-timeline'
                  current={complaintHistory.findIndex((step) =>
                    step.value.includes(orderDetail?.complaints?.[0]?.complaint_status ?? 0)
                  )}
                  labelPlacement='vertical'
                  items={complaintHistory}
                />
              </div>
            )}
          </Skeleton>
        </Card.Body>
      </Card>

      <Skeleton active loading={isLoadingPage}>
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
      </Skeleton>

      <Skeleton active loading={isLoadingPage}>
        <Card>
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
      </Skeleton>
    </section>
  )
}

export {DetailWorkVendor}
