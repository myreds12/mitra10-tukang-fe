import React, {FC, useState, useEffect, useRef} from 'react'
import {useNavigate, useParams} from 'react-router-dom'

import './UpdateComplaint.css'

import axios from 'axios'
import Swal from 'sweetalert2'
import {Image} from 'antd'
import {Row, Col, Form, Table, Button, ListGroup, Modal, Card, Badge} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCircleInfo, faRotate} from '@fortawesome/free-solid-svg-icons'
import {Tag} from 'antd'

interface Complaint {
  order_id: number | null
  pic_name: string
  description: string
  complaint_channel: number | null
  complaint_date: string
  complaint_status: string
  complaint_type: number
}

const UpdateComplaintHO: FC<{updatePageTitle: (complaint: any) => void}> = ({updatePageTitle}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const params = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Update Complaint
  const [complaintForm, setComplaintForm] = useState<Complaint>({
    order_id: null,
    pic_name: '',
    description: '',
    complaint_channel: null,
    complaint_date: '',
    complaint_status: '',
    complaint_type: 1,
  })

  // Complaint Detail
  const [complaintId, setComplaintId] = useState<any>()
  const [complaintDetail, setComplaintDetail] = useState<any>()

  // Complaint Approval
  const [complaintStatusApprove, setComplaintStatusApprove] = useState<any>()
  const [complaintStatusCancel, setComplaintStatusCancel] = useState<any>()

  const [previewImage, setPreviewImage] = useState<any>()
  const [visible, setVisible] = useState(false)
  const [resyncLoading, setResyncLoading] = useState<boolean>(false)

  const getCrmSyncLabel = (isSync: number) => {
    switch (isSync) {
      case 1:
        return {text: 'Tersinkronisasi', color: 'green'}
      case 2:
        return {text: 'Gagal Sync', color: 'red'}
      default:
        return {text: 'Belum Sync', color: 'default'}
    }
  }

  const handleResync = async () => {
    if (!complaintDetail?.id) return
    setResyncLoading(true)
    try {
      const response = await axios.post(
        `${apiUrl}/complaints/${complaintDetail.id}/resync`,
        {},
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
           // 'ngrok-skip-browser-warning':  'true',
          },
        }
      )

      if (response.data?.status === 200 || response.data?.status === 201) {
        Swal.fire({
          title: 'Berhasil',
          text: 'Data pengaduan berhasil dikirim ulang ke CRM',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        })
        fetchComplaintData()
      } else {
        Swal.fire({
          title: 'Gagal',
          text: response.data?.message || 'Gagal mengirim ulang ke CRM',
          icon: 'error',
        })
      }
    } catch (error: any) {
      Swal.fire({
        title: 'Gagal',
        text: error?.response?.data?.message || 'Terjadi kesalahan saat resubmit ke CRM',
        icon: 'error',
      })
    } finally {
      setResyncLoading(false)
    }
  }

  const fetchComplaintData = async () => {
    try {
      await axios
        .get(`${apiUrl}/complaints/${params.id}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })
        .then((response) => {
          const data = response.data.data

          setComplaintDetail(data)
          updatePageTitle(data)

          if (data?.id) {
            setComplaintId(data.id)

            setComplaintForm({
              ...complaintForm,
              order_id: data?.orders?.id,
              pic_name: data?.pic_name ?? '',
              description: data?.description ?? '',
              complaint_channel: data?.complaint_channels?.id ?? null,
              complaint_date: data?.complaint_date
                ? new Date(data.complaint_date).toISOString().split('T')[0]
                : '',
              complaint_type: data?.type ?? 1,
              complaint_status: data?.complaint_status ?? null,
            })
          }
        })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchComplaintData()
  }, [])

  // Complaint Status Approve
  useEffect(() => {
    const storedStatus = localStorage.getItem('statusData')
    const statusData = storedStatus ? JSON.parse(storedStatus) : []

    const desiredStatusApprove = statusData.find(
      (status: any) => status.category === 'COMPLAINTAPPROVEDBYHO'
    )
    const statusApproveId = desiredStatusApprove?.value

    const desiredStatusCancel = statusData.find(
      (status: any) => status.category === 'COMPLAINTREJECTEDBYHO'
    )
    const statusCancelId = desiredStatusCancel?.value

    setComplaintStatusApprove(statusApproveId)
    setComplaintStatusCancel(statusCancelId)
  }, [complaintStatusApprove, complaintStatusCancel])

  const formatDate = (date: any) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Reason Rejected
  const [showModal, setShowModal] = useState(false)
  const [reasonRejected, setReasonRejected] = useState<string>('')

  const handleShowModal = () => {
    setShowModal(true)
  }

  const handleInputReasonReject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedInputValue = event.target.value
    setReasonRejected(updatedInputValue)
  }

  // Handle Approve & Cancel
  const handleApprovalComplaint = async (status: number) => {
    setIsLoading(true)

    try {
      const formData = new FormData()

      formData.append('order_id', String(complaintForm?.order_id ?? ''))
      formData.append('pic_name', complaintForm.pic_name ?? '')
      formData.append('description', complaintForm.description ?? '')
      formData.append('complaint_status', `${status}`)
      formData.append('complaint_channel', String(complaintForm.complaint_channel ?? ''))
      formData.append('complaint_date', complaintForm.complaint_date ?? '')
      formData.append('type', String(complaintForm.complaint_type ?? 1))
      if (reasonRejected) {
        formData.append('complaint_histories[reason]', reasonRejected)
      }

      const response = await axios.post(`${apiUrl}/complaints/${complaintId}`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (response.data.status === 200 || response.data.status === 201) {
        Swal.fire({
          title: 'Success',
          text: 'Success Update Complaint',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        Swal.fire({
          title: 'Error',
          text: response.data.message,
          icon: 'error',
        })
      }

      navigate('/complaint/view-complaint')
    } catch (error: any) {
      console.error(error)
      Swal.fire({
        title: 'Error',
        text: error?.response?.data?.message || error?.message || 'Gagal update status pengaduan',
        icon: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id='update-complaint-ho'>
      <div className='card'>
        <div className='card-body'>
          <div className='form-wrapper'>
            <Row className='form-header'>
              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Label className='fs-4 fw-bold'>
                  Nama Toko :
                  <span className='fs-4 ms-2 fw-normal'>
                    {complaintDetail?.orders.store.store_name}
                  </span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-4 fw-bold'>
                  Complaint ID : <span className='fs-4 ms-2 fw-normal'>{complaintDetail?.id}</span>
                </Form.Label>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Label className='fs-4 fw-bold'>
                  Order ID :
                  <span className='fs-4 ms-2 fw-normal'>{complaintDetail?.orders.id}</span>
                </Form.Label>

                <Form.Group as={Row}>
                  <Form.Label column sm='4' className='fs-4 fw-bold m-0'>
                    Order Date :
                  </Form.Label>
                  <Col sm='8'>
                    <Form.Control
                      type='text'
                      plaintext
                      readOnly
                      value={
                        complaintDetail?.orders
                          ? formatDate(new Date(complaintDetail?.orders.request_survey))
                          : ''
                      }
                    />
                  </Col>
                </Form.Group>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Label className='fs-4 fw-bold'>
                  Receipt Number :
                  <span className='fs-4 ms-2 fw-normal'>
                    {complaintDetail?.orders?.receipt_number ?? '-'}
                  </span>
                </Form.Label>
                <br></br>
                <div className='mt-3 p-2 border rounded bg-light'>
                  <div className='d-flex align-items-center justify-content-between'>
                    <div>
                      <span className='fw-bold text-warning me-2'>CRM:</span>
                      <Tag color={getCrmSyncLabel(complaintDetail?.is_sync ?? 0).color}>
                        {getCrmSyncLabel(complaintDetail?.is_sync ?? 0).text}
                      </Tag>
                    </div>
                    {(complaintDetail?.is_sync ?? 0) !== 1 && (
                      <Button
                        variant='outline-warning'
                        size='sm'
                        disabled={resyncLoading}
                        onClick={handleResync}
                        title='Resubmit ke CRM'
                      >
                        <FontAwesomeIcon icon={faRotate} spin={resyncLoading} />
                      </Button>
                    )}
                  </div>
                </div>
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
                        <Form.Control
                          plaintext
                          readOnly
                          value={complaintDetail?.orders.members.member_number}
                        />
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='6'>
                        Customer Name :
                      </Form.Label>
                      <Col sm='6'>
                        <Form.Control
                          plaintext
                          readOnly
                          value={complaintDetail?.orders.members.full_name}
                        />
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='6'>
                        Alamat Pemasangan :
                      </Form.Label>
                      <Col sm='6'>
                        <Form.Control
                          as='textarea'
                          plaintext
                          readOnly
                          rows={3}
                          value={complaintDetail?.orders.project_address}
                        />
                      </Col>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='4'>
                        Nomor Telp/WA :
                      </Form.Label>
                      <Col sm='8'>
                        <Form.Control
                          plaintext
                          readOnly
                          value={complaintDetail?.orders?.project_number}
                        />
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='4'>
                        Alamat Email :
                      </Form.Label>
                      <Col sm='8'>
                        <Form.Control
                          plaintext
                          readOnly
                          value={complaintDetail?.orders.members.email}
                        />
                      </Col>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='sales-info mb-5'>
                <Row>
                  <div className='fs-3 fw-bold'>Informasi Penjual</div>

                  <div className='d-flex'>
                    <Form.Group as={Row}>
                      <Form.Label column md='4'>
                        Sales ID :
                      </Form.Label>

                      <Col md='8'>
                        <Form.Control
                          plaintext
                          readOnly
                          value={complaintDetail?.orders?.sales.id}
                        />
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row}>
                      <Form.Label column md='5'>
                        Sales Person :
                      </Form.Label>

                      <Col md='7'>
                        <Form.Control
                          plaintext
                          readOnly
                          value={complaintDetail?.orders?.sales?.full_name}
                        />
                      </Col>
                    </Form.Group>
                  </div>
                </Row>

                <Row>
                  <div className='fs-3 fw-bold'>Informasi Vendor Pemasangan</div>

                  <div className='d-flex'>
                    <Form.Group as={Row}>
                      <Form.Label column md='5'>
                        Vendor Name :
                      </Form.Label>

                      <Col md='7'>
                        <Form.Control
                          plaintext
                          readOnly
                          value={complaintDetail?.orders?.vendor?.company_name ?? '-'}
                        />
                      </Col>
                    </Form.Group>
                  </div>
                </Row>
              </Col>
            </Row>
          </div>

          <Row className='table-warranty d-flex align-items-center mb-5'>
            <div className='table-title-warranty mb-2'>
              <div className='fs-3 fw-bold'>Informasi Pemasangan</div>

              <Row>
                <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                  <Form.Label column>
                    {complaintDetail?.orders?.payment_type === 'survey'
                      ? 'Tanggal request survey :'
                      : 'Tanggal request pemasangan :'}
                  </Form.Label>
                  <Col>
                    <p className='fs-7 p-0'>
                      {formatDate(new Date(complaintDetail?.orders?.request_survey))}
                    </p>
                  </Col>
                </Form.Group>

                <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                  <Form.Label column>Informasi Vendor Pemasangan :</Form.Label>
                  <Col>
                    <p className='fs-7 p-0'>
                      {complaintDetail?.orders?.vendor?.company_name ?? '-'}
                    </p>
                  </Col>
                </Form.Group>

                <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                  <Form.Label column>Payment Type:</Form.Label>
                  <Col>
                    <p className='fs-7 p-0'>
                      {(() => {
                        if (complaintDetail?.orders?.payment_type === 'survey') {
                          return `Berbayar & Survey`
                        } else if (complaintDetail?.orders?.payment_type === 'gratis') {
                          return `Gratis`
                        } else if (
                          complaintDetail?.orders?.payment_type === 'pemasangan_tanpa_survey'
                        ) {
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

            {/* New */}
            {(() => {
              if (
                complaintDetail?.orders?.payment_type === 'survey' ||
                complaintDetail?.orders?.work_orders?.work_order_status.length === 1
              ) {
                return (
                  <div className='table-warranty-content'>
                    {complaintDetail?.orders?.is_overdistance === 1 && (
                      <>
                        <Form.Text className='fs-8 text-dark'>
                          *Order ini lebih dari
                          <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                          toko sehingga dikenakan biaya tambahan
                        </Form.Text>
                      </>
                    )}

                    <Table hover responsive='md'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th>Item Code</th>
                          <th>Item Name</th>
                          <th>Nama Pemasangan</th>
                          <th>QTY Pemasangan</th>
                        </tr>
                      </thead>

                      <tbody>
                        {complaintDetail?.orders?.m_order_details.map((item: any, index: any) => (
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

                        {complaintDetail?.orders?.is_overdistance === 1 && (
                          <>
                            <tr>
                              <td colSpan={3} className='text-end fw-bolder align-middle'>
                                Biaya Tambahan
                              </td>

                              <td className=' fw-bolder'>{`Rp. ${Number(
                                complaintDetail?.orders?.additional_fee
                              ).toLocaleString('id')}`}</td>
                            </tr>

                            <tr>
                              <td colSpan={3} className='text-end fw-bolder'>
                                Grand Total
                              </td>

                              <td className=' fw-bolder'>{`Rp. ${Number(
                                complaintDetail?.orders?.grand_total
                              ).toLocaleString('id')}`}</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </Table>
                  </div>
                )
              } else if (
                ['QUOTEIN', 'QUOTEOUT'].includes(complaintDetail?.orders?.status?.category ?? '') &&
                complaintDetail?.orders?.payment_type === 'survey'
              ) {
                return (
                  <div className='table-warranty-content'>
                    {complaintDetail?.orders?.is_overdistance === 1 && (
                      <>
                        <Form.Text className='fs-8 text-dark'>
                          *Order ini lebih dari
                          <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                          toko sehingga dikenakan biaya tambahan
                        </Form.Text>
                      </>
                    )}

                    <Table hover responsive='md'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th className='text-center'>Jenis Jasa</th>
                          <th className='text-center'>QTY</th>
                          <th className='text-center'>Satuan</th>
                          <th className='text-center'>Price</th>
                          <th className='text-center'>Total</th>
                          <th className='text-center'>Keterangan</th>
                        </tr>
                      </thead>

                      <tbody>
                        {complaintDetail?.orders?.quotation[0]?.quotation_details.map(
                          (item: any, index: any) => (
                            <tr key={`${index}-quotation`}>
                              <td>{item?.name ?? '-'}</td>
                              <td>{item?.quantity ?? 0}</td>
                              <td>{item?.unit}</td>
                              <td>{`Rp. ${parseInt(item?.price || 0).toLocaleString('id')}`}</td>
                              <td>{`Rp. ${parseInt(item?.final_price || 0).toLocaleString(
                                'id'
                              )}`}</td>
                              <td>{item?.description ? '' : '-'}</td>
                            </tr>
                          )
                        )}

                        <tr>
                          <td colSpan={6} className='text-end fw-bolder'>
                            Promosi ( Free Survey )
                          </td>
                          <td className=' fw-bolder'>
                            {`Rp. ${parseInt(
                              complaintDetail?.orders?.quotation[0]?.quotation_disc ?? 0
                            ).toLocaleString('id')}`}
                          </td>
                        </tr>

                        {complaintDetail?.orders?.is_overdistance === 1 && (
                          <>
                            <tr>
                              <td colSpan={3} className='text-end fw-bolder align-middle'>
                                Biaya Tambahan
                              </td>

                              <td className=' fw-bolder'>{`Rp. ${Number(
                                complaintDetail?.orders?.additional_fee
                              ).toLocaleString('id')}.`}</td>
                            </tr>
                          </>
                        )}

                        <tr>
                          <td colSpan={5} className='text-end fw-bolder'>
                            Grand Total
                          </td>
                          <td className=' fw-bolder'>
                            {`Rp. ${parseInt(
                              complaintDetail?.orders?.quotation[0]?.quotation_grand_total ?? 0
                            ).toLocaleString('id')}`}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                )
              } else if (
                ['SURVEYSTART', 'SURVEYDONE', 'WORKEND', 'DONE'].includes(
                  complaintDetail?.orders?.work_orders?.work_order_status[0]?.status?.category
                ) &&
                complaintDetail?.orders?.work_orders?.work_order_status.length > 1 &&
                complaintDetail?.orders?.payment_type === 'survey'
              ) {
                return (
                  <div className='table-warranty-content'>
                    <Table hover responsive='md'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th>Item / Nama Pemasangan</th>
                          <th>QTY Pemasangan</th>
                          <th>Satuan</th>
                        </tr>
                      </thead>

                      <tbody>
                        {complaintDetail?.orders?.work_orders?.work_order_status[0]?.work_order_items.map(
                          (item: any, index: any) => (
                            <tr key={`${index}-work_order_detail`}>
                              <td>{item?.name ?? '-'}</td>
                              <td>{item?.quantity ?? 0}</td>
                              <td>{item?.unit ?? ''}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </Table>
                  </div>
                )
              } else if (
                complaintDetail?.orders?.payment_type === 'gratis' ||
                complaintDetail?.orders?.payment_type === 'pemasangan_tanpa_survey'
              ) {
                return (
                  <div className='table-warranty-content'>
                    {complaintDetail?.orders?.is_overdistance === 1 && (
                      <>
                        <Form.Text className='fs-8 text-dark'>
                          *Order ini lebih dari
                          <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                          toko sehingga dikenakan biaya tambahan
                        </Form.Text>
                      </>
                    )}

                    <Table hover responsive='md'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th>Item Code</th>
                          <th>Item Name</th>
                          <th>Nama Pemasangan</th>
                          <th>QTY Pemasangan</th>
                          {!(complaintDetail?.orders?.payment_type === 'gratis') && (
                            <>
                              <th>Harga Jasa</th>
                              <th>Jumlah</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {complaintDetail?.orders?.m_order_details.map((item: any, index: any) => (
                          <>
                            <tr key={`${index} - order_detail`}>
                              <td>{item?.item_code}</td>
                              <td>{item?.item_name}</td>
                              <td>{item?.item?.service_name}</td>
                              <td>{item?.quantity ?? 0}</td>
                              {!(complaintDetail?.orders?.payment_type === 'gratis') && (
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

                        {complaintDetail?.orders?.is_overdistance === 1 && (
                          <>
                            <tr>
                              <td colSpan={3} className='text-end fw-bolder align-middle'>
                                Biaya Tambahan
                              </td>

                              <td className=' fw-bolder'>{`Rp. ${Number(
                                complaintDetail?.orders?.additional_fee
                              ).toLocaleString('id')}.`}</td>
                            </tr>
                          </>
                        )}

                        <tr>
                          <td
                            colSpan={complaintDetail?.orders?.payment_type !== 'gratis' ? 5 : 3}
                            className='text-end fw-bolder'
                          >
                            Grand Total
                          </td>

                          <td className=' fw-bolder'>
                            {(() => {
                              if (complaintDetail?.orders?.payment_type === 'gratis') {
                                return `Rp. ${(0).toLocaleString('id')}`
                              } else if (
                                complaintDetail?.orders?.payment_type === 'pemasangan_tanpa_survey'
                              ) {
                                return `Rp. ${parseInt(
                                  complaintDetail?.orders?.grand_total
                                ).toLocaleString('id')}`
                              } else {
                                return `Rp. ${(0).toLocaleString('id')}`
                              }
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                )
              }
            })()}
          </Row>

          <hr />

          <Row>
            <Col xs={12} md={12} lg={12} xl={12} xxl={12}>
              <div className='fs-3 fw-bold text-danger'>COMPLAINT HISTORY</div>

              <Row>
                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Complaint ID :
                    </Form.Label>
                    <Col sm='6'>
                      <Form.Control plaintext readOnly value={complaintDetail?.id} />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      PIC Complaint :
                    </Form.Label>
                    <Col sm='6'>
                      <Form.Control plaintext readOnly value={complaintDetail?.pic_name} />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Complaint Date :
                    </Form.Label>
                    <Col sm='6'>
                      <Form.Control
                        plaintext
                        readOnly
                        value={formatDate(new Date(complaintDetail?.complaint_date))}
                      />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Complaint via :
                    </Form.Label>
                    <Col sm='6'>
                      <Form.Control
                        plaintext
                        readOnly
                        value={complaintDetail?.complaint_channels.name}
                      />
                    </Col>
                  </Form.Group>
                </Col>

                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Form.Label className='mt-3'>Complaint Detail :</Form.Label>
                  <Form.Control
                    style={{minHeight: '200px'}}
                    as='textarea'
                    plaintext
                    readOnly
                    value={complaintDetail?.description}
                  ></Form.Control>
                </Col>

                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Form.Label className='mt-3'>Complaint Evidence :</Form.Label>
                  <ListGroup>
                    {complaintDetail?.complaint_histories[0]?.complaint_evidence?.map(
                      (item: any) => (
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
                      )
                    )}
                  </ListGroup>

                  {previewImage && (
                    <div>
                      <Image
                        key={previewImage}
                        width={200}
                        style={{display: 'none'}}
                        src={`${apiUrl}/public/complaints/${previewImage}`}
                        preview={{
                          visible,
                          src: `${apiUrl}/public/complaints/${previewImage}`,
                          onVisibleChange: (value) => {
                            setVisible(value)
                          },
                        }}
                      />
                    </div>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>

          <div className='d-flex justify-content-center align-items-center'>
            <Button
              variant='light-danger'
              className='d-flex justify-content-center align-items-center'
              type='submit'
              disabled={isLoading}
              onClick={handleShowModal}
            >
              {isLoading ? 'Rejected..' : 'Rejected'}
            </Button>

            <Button
              variant='dark-primary'
              className='d-flex justify-content-center align-items-center'
              type='submit'
              disabled={isLoading}
              onClick={() => handleApprovalComplaint(complaintStatusApprove)}
            >
              {isLoading ? 'Accepted..' : 'Accepted'}
            </Button>
          </div>
        </div>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton></Modal.Header>

          <Modal.Body>
            <Form.Label className='fs-5 fw-bolder'>Reason Rejected :</Form.Label>
            <Form.Group>
              <Form.Control as='textarea' rows={3} onChange={handleInputReasonReject} />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant='dark-danger' onClick={() => setShowModal(false)}>
              Close
            </Button>

            <Button
              variant='dark-primary'
              onClick={() => handleApprovalComplaint(complaintStatusCancel)}
            >
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </section>
  )
}

export {UpdateComplaintHO}
