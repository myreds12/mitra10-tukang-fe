import React, {FC, useState, useEffect, useRef} from 'react'
import {useNavigate, useParams} from 'react-router-dom'

import './DetailComplaint.css'

import axios from 'axios'
import Swal from 'sweetalert2'
import Select, {SingleValue} from 'react-select'
import {Image, Skeleton, Tag} from 'antd'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Row, Col, Form, ListGroup, Modal, Button, Card, Alert} from 'react-bootstrap'
import {faTrash, faImage, faFileImage, faCircleInfo, faRotate} from '@fortawesome/free-solid-svg-icons'
import {formatDate} from '@fullcalendar/core'
import {formatDateWithTime, formatDateWithTimeZone} from '../../../../../_metronic/helpers'

interface Complaint {
  id: number | null
  order_id: number | null
  pic_name: string
  description: string
  complaint_channel: number | null
  complaint_date: string
  complaint_status: number | null
  complaint_type: number
  crm_type: number
  work_status_update?: number | null
}

interface Remedial {
  complaint_id: number | null
  remedial_action: string
  ra_date_start: string
  remedial_pic: string
  remedial_pic_position: string
  complaint_date: string
  remedial_status: number | null
}

interface Position {
  value: string
  label: string
}

interface CrmType {
  value: number | null
  label: string
}

const DetailComplaintPage: FC<{updatePageTitle: (complaint: any) => void}> = ({
  updatePageTitle,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const params = useParams()
  const navigate = useNavigate()

  const evidenceRef = useRef<HTMLInputElement>(null)
  const today = String(new Date().toISOString().split('T')[0])

  const userRole = localStorage.getItem('userRole') as string
  const username = localStorage.getItem('username') as string

  // Status
  const storedStatus = localStorage.getItem('statusData')
  const statusData = storedStatus ? JSON.parse(storedStatus) : []

  // Complaint Detail
  const [complaintDetail, setComplaintDetail] = useState<any>()
  const [complaintForm, setComplaintForm] = useState<Complaint>({
    id: null,
    order_id: null,
    pic_name: '',
    description: '',
    complaint_channel: null,
    complaint_date: '',
    complaint_status: null,
    complaint_type: 1,
    crm_type: 1,
    work_status_update: null,
  })

  // CRM Type
  const [crmType] = useState<CrmType[]>([
    {value: 1, label: 'Positive'},
    {value: 2, label: 'Neutral'},
    {value: 3, label: 'Negative'},
  ])

  // Remedial
  const [feedbackEvidence, setFeedbackEvidence] = useState<Array<File | null>>([])
  const [remedialForm, setRemedialForm] = useState<Remedial>({
    complaint_id: null,
    remedial_action: '',
    ra_date_start: '',
    remedial_pic: ['Super User', 'Admin HO'].includes(userRole) ? username : '',
    remedial_pic_position: '',
    complaint_date: '',
    remedial_status: 31,
  })

  // Loading
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [resyncLoading, setResyncLoading] = useState<boolean>(false)

  // CRM Sync Status
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
        // Refresh page data
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

  // Complaint Approval
  const [complaintStatusDone, setComplaintStatusDone] = useState<any>()
  const [complaintStatusApprove, setComplaintStatusApprove] = useState<any>()
  const [complaintStatusCancel, setComplaintStatusCancel] = useState<any>()

  // Complaint Evidence
  const [previewImage, setPreviewImage] = useState<any>()
  const [visibleComplaintEvidence, setVisibleComplaintEvidence] = useState(false)

  // Remedial Evidence
  const [visibleRemedial, setVisibleRemedial] = useState(false)

  // Order Evidence
  const [visibleReceipt, setVisibleReceipt] = useState(false)
  const handleClose = () => setVisibleReceipt(false)

  // Work Before & Work After
  const [visibleWorkBefore, setVisibleWorkBefore] = useState(false)
  const [visibleWorkAfter, setVisibleWorkAfter] = useState(false)

  // Quotation Receipt
  const [visibleQuotationReceipt, setVisibleQuotationReceipt] = useState(false)
  const [visibleQuotationFiles, setVisibleQuotationFiles] = useState(false)

  // Fetching Complaint Data
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

          setIsLoadingPage(false)
          setComplaintDetail(data)
          updatePageTitle(data)

          setComplaintForm({
            ...complaintForm,
            id: data?.id,
            order_id: data?.orders?.id,
            pic_name: data?.pic_name ?? '',
            description: data?.description ?? '',
            complaint_channel: data?.complaint_channels?.id ?? null,
            complaint_date: data?.complaint_date
              ? new Date(data.complaint_date).toISOString().split('T')[0]
              : '',
            complaint_type: data?.type ?? 1,
            crm_type: data?.crm_type ?? 1,
            complaint_status: data?.complaint_status ?? null,
          })

          setRemedialForm((prev) => ({
            ...prev,
            complaint_id: data?.id,
          }))
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
    const desiredStatusDone = statusData.find((status: any) => status.category === 'DONE')
    const statusDoneId = desiredStatusDone?.value

    const desiredStatusApprove = statusData.find(
      (status: any) => status.category === 'COMPLAINTAPPROVEDBYHO'
    )
    const statusApproveId = desiredStatusApprove?.value

    const desiredStatusCancel = statusData.find(
      (status: any) => status.category === 'COMPLAINTREJECTEDBYHO'
    )
    const statusCancelId = desiredStatusCancel?.value

    setComplaintStatusDone(statusDoneId)
    setComplaintStatusApprove(statusApproveId)
    setComplaintStatusCancel(statusCancelId)
  }, [complaintStatusApprove, complaintStatusCancel])

  // Reason Rejected
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<number | null>(null)
  const [reason, setReason] = useState<string>('')

  const handleShowModal = (type: number) => {
    setShowModal(true)
    setModalType(type)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleInputStatus = (e: any) => {
    setComplaintForm({
      ...complaintForm,
      work_status_update: Number(e.target.value),
    })
  }

  const handleInputReason = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedInputValue = event.target.value
    setReason(updatedInputValue)
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
      formData.append('crm_type', String(complaintForm.crm_type ?? 1))
      formData.append('complaint_histories[reason]', reason ?? '')

      const response = await axios.post(`${apiUrl}/complaints/${complaintForm.id}`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (response.data.status === 200 || response.data.status === 201) {
        Swal.fire({
          title: 'Success',
          text: 'Berhasil update status pengaduan',
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

  const handleChangeStatusComplaint = async () => {
    setIsLoading(true)

    try {
      const formData = new FormData()

      formData.append('order_id', String(complaintForm?.order_id ?? ''))
      formData.append('pic_name', complaintForm.pic_name ?? '')
      formData.append('description', complaintForm.description ?? '')
      formData.append('complaint_channel', String(complaintForm.complaint_channel ?? ''))
      formData.append('complaint_date', complaintForm.complaint_date ?? '')
      formData.append('type', String(complaintForm.complaint_type ?? 1))
      formData.append('crm_type', String(complaintForm.crm_type ?? 1))
      formData.append('complaint_status', String(complaintStatusApprove ?? ''))
      formData.append('work_status_update', String(complaintForm.work_status_update ?? ''))

      const response = await axios.post(`${apiUrl}/complaints/${complaintForm.id}`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (response.data.status === 200 || response.data.status === 201) {
        Swal.fire({
          title: 'Success',
          text: 'Berhasil update status pengaduan',
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

  // Remedial Form Handler
  const remedialFormHandler = (e: any) => {
    setRemedialForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // Remedial Position
  const picPositions = [
    {value: 'Staff', label: 'Staff'},
    {value: 'Supervisor', label: 'Supervisor'},
    {value: 'Deputy Store Manager', label: 'Deputy Store Manager'},
    {value: 'Store Manager', label: 'Store Manager'},
  ]
  const [selectedPosition, setSelectedPosition] = useState<SingleValue<Position>>({
    value: '',
    label: '',
  })

  // Change Select Position
  useEffect(() => {
    setRemedialForm((prev) => ({
      ...prev,
      ra_date_start: today,
      remedial_pic_position: ['Super User', 'Admin HO'].includes(userRole)
        ? userRole
        : selectedPosition?.value ?? '',
    }))
  }, [userRole, selectedPosition])

  // Handle Upload File
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files

    if (fileList && fileList.length <= 5) {
      const file: Array<File | null> = new Array<File>()
      const {length} = fileList

      for (let i = 0; i < length; i++) {
        file[i] = fileList.item(i)
      }

      setFeedbackEvidence(file)
    } else {
      Swal.fire({
        title: 'Error',
        text: 'File yang diupload maksimal 5',
        icon: 'error',
        showConfirmButton: false,
        timer: 2000,
      })
    }
  }

  const handleImageClick = () => {
    const inputField = document.querySelector('.input-field-image') as HTMLInputElement
    inputField.click()
  }

  const handleRemoveFile = (index: number) => {
    const newEvidances = [...feedbackEvidence]

    newEvidances.splice(index, 1)

    setFeedbackEvidence(newEvidances)

    // Update element value
    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  // Feedback Validation
  const remedialValidation = () => {
    let valid = true

    if (remedialForm.remedial_pic === '') {
      Swal.fire({
        title: 'Error',
        text: 'Please fill PIC Feedback form',
        icon: 'error',
      })
      valid = false
    } else if (remedialForm.remedial_action === '') {
      Swal.fire({
        title: 'Error',
        text: 'Please fill feedback store description form',
        icon: 'error',
      })
      valid = false
    } else if (!feedbackEvidence) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill feedback evidence form',
        icon: 'error',
      })
      valid = false
    }
    return valid
  }

  // Handle Submit Feedback
  const handleSubmitNewFeedback = async () => {
    if (!remedialValidation()) {
      setIsLoading(false)
      return false
    }

    const formData = new FormData()
    setIsLoading(true)

    formData.append('complaint_id', String(remedialForm.complaint_id))
    formData.append('remedial_action', remedialForm.remedial_action)
    formData.append('ra_date_start', remedialForm.ra_date_start)
    formData.append('remedial_pic', remedialForm.remedial_pic)
    formData.append('remedial_pic_position', remedialForm.remedial_pic_position)
    formData.append('remedial_status', String(remedialForm.remedial_status))

    if (feedbackEvidence?.length) {
      feedbackEvidence.forEach((item) => {
        if (item) {
          formData.append(`remedial_evidences`, item, item?.name)
        }
      })
    }

    await axios
      .post(`${apiUrl}/remedials`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })
      .then((response) => {
        if (response.data.status === 200 || response.data.status === 201) {
          Swal.fire({
            title: 'Success',
            text: 'Success Add Feedback',
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

        navigate('/complaint/view-complaint')
      })
      .catch((error) => {
        setIsLoading(false)

        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
        })
      })
  }

  // Cancel Complaint
  const handleCancel = () => {
    navigate('/complaint/view-complaint')
  }

  // Calculate Warranty Date
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
    complaintDetail?.orders?.work_orders?.work_order_status[0]?.created_at
  )

  // Conditional Button Render
  const shouldDisplayActions = () => {
    const excludedStatus = [
      'DONE',
      'RESURVEYREQ',
      'RESURVEYSTART',
      'REWORKREQ',
      'REWORKSTART',
      'REWORKEND',
      'RESURVEYDONE',
    ]

    const isRejectedByHO = complaintDetail?.status?.category === 'COMPLAINTREJECTEDBYHO'

    return !excludedStatus.includes(complaintDetail?.orders?.status?.category) && !isRejectedByHO
  }

  const shouldDisplayAcceptButton = () => {
    const acceptableStatuses = [
      'WARRANTYCLAIM',
      'WORKEND',
      'WORKENDSTEPONE',
      'WORKENDSTEPTWO',
      'WORKENDSTEPTHREE',
    ]

    return acceptableStatuses.includes(
      complaintDetail?.orders?.work_orders?.work_order_status?.[0]?.status?.category
    )
  }

  const ActionButtons = () => (
    <div className='d-flex justify-content-end align-items-center'>
      <Button
        variant='dark-danger'
        className='d-flex justify-content-center align-items-center'
        type='submit'
        disabled={isLoading}
        onClick={() => handleShowModal(1)}
      >
        {isLoading ? 'Rejected..' : 'Rejected'}
      </Button>

      {shouldDisplayAcceptButton() ? (
        <Button
          variant='dark-primary'
          className='d-flex justify-content-center align-items-center'
          type='submit'
          disabled={isLoading}
          onClick={() => handleShowModal(2)}
        >
          {isLoading ? 'Accepted..' : 'Accept and Choose Status'}
        </Button>
      ) : (
        <Button
          variant='dark-primary'
          className='d-flex justify-content-center align-items-center'
          type='submit'
          disabled={isLoading}
          onClick={() => handleApprovalComplaint(complaintStatusApprove)}
        >
          {isLoading ? 'Accepted..' : 'Accepted'}
        </Button>
      )}
    </div>
  )

  return (
    <section id='detail-complaint'>
      <Card>
        <Card.Body>
          <div className='form-wrapper'>
            <Row className='form-header'>
              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                  <Form.Label className='fs-4 fw-bold'>
                    Nama Toko :{' '}
                    <span className='fs-4 ms-2 fw-normal'>
                      {complaintDetail?.orders?.store?.store_name ?? ''}
                    </span>
                  </Form.Label>
                </Skeleton>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                  <Form.Label className='fs-4 fw-bold'>
                    Order ID :{' '}
                    <span className='fs-4 ms-2 fw-normal'>{complaintDetail?.orders?.id}</span>
                  </Form.Label>
                </Skeleton>
                <br></br>
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                  <Form.Label className='fs-4 fw-bold'>
                    Complaint ID :{' '}
                    <span className='fs-4 ms-2 fw-normal'>{complaintDetail?.id}</span>
                  </Form.Label>
                </Skeleton>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Col>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                    <Form.Label className='fs-4 fw-bold'>
                      Receipt Number :
                      <span className='fs-4 ms-2 fw-normal'>
                        {complaintDetail?.orders?.receipt_number ?? '-'}
                      </span>
                    </Form.Label>

                    {complaintDetail?.orders?.quotation[0]?.receipt_quotation && (
                      <Form.Label className='fs-4 fw-bold'>
                        Receipt Quotation :
                        <span className='fs-4 ms-2 fw-normal'>
                          {complaintDetail?.orders?.quotation[0]?.receipt_quotation ?? '-'}
                        </span>
                      </Form.Label>
                    )}
                  </Skeleton>
                </Col>

                <Col>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                    <Form.Label className='fs-4 fw-bold'>
                      Status Order :
                      <span className='fs-4 ms-2 fw-bold text-success'>
                        {complaintDetail?.orders?.status?.description ?? '-'}
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
                          <p className='fs-7'>{complaintDetail?.orders?.members?.member_number}</p>
                        </Col>
                      </Form.Group>

                      <Form.Group as={Row} className='detail-info'>
                        <Form.Label column sm='6'>
                          Customer Name :
                        </Form.Label>
                        <Col sm='6'>
                          <p className='fs-7'>{complaintDetail?.orders?.members?.full_name}</p>
                        </Col>
                      </Form.Group>

                      <Form.Group as={Row} className='detail-info'>
                        <Form.Label column sm='6'>
                          Alamat Pemasangan :
                        </Form.Label>
                        <Col sm='6'>
                          <p className='fs-7'>{complaintDetail?.orders?.project_address}</p>
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
                            {!complaintDetail?.orders?.project_number.startsWith('0')
                              ? `+62${complaintDetail?.orders?.members?.whatsapp_number}`
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
                            {complaintDetail?.orders?.project_number.startsWith('0')
                              ? complaintDetail?.orders?.members?.phone_number
                              : '-'}
                          </p>
                        </Col>
                      </Form.Group>

                      <Form.Group as={Row} className='detail-info'>
                        <Form.Label column sm='5'>
                          Alamat Email :
                        </Form.Label>
                        <Col sm='7'>
                          <p className='fs-7'>{complaintDetail?.orders?.members?.email} </p>
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
                      <p className='fs-7'>{complaintDetail?.orders?.sales?.id} </p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='3'>
                      Sales Person :
                    </Form.Label>
                    <Col sm='9'>
                      <p className='fs-7'>{complaintDetail?.orders?.sales?.full_name} </p>
                    </Col>
                  </Form.Group>
                </Skeleton>
              </Col>
            </Row>
          </div>

          <Row className='table-warranty d-flex align-items-center mb-5'>
            <div className='table-title-warranty'>
              <Skeleton active loading={isLoadingPage} paragraph={{rows: 2}}>
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
                        {formatDate(complaintDetail?.orders?.request_survey)}
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
              </Skeleton>
            </div>

            <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
              {(() => {
                if (
                  (complaintDetail?.orders?.payment_type === 'survey' &&
                    complaintDetail?.orders?.work_orders === null) ||
                  (complaintDetail?.orders?.work_orders?.work_order_status.length === 1 &&
                    complaintDetail?.orders?.payment_type === 'survey')
                ) {
                  return (
                    <div className='table-warranty-content'>
                      {complaintDetail?.orders?.is_overdistance === 1 && (
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
                          {complaintDetail?.orders?.m_order_details?.map(
                            (item: any, index: any) => (
                              <>
                                <tr key={`${index} - order_detail`}>
                                  <td>{item?.item_code}</td>
                                  <td>{item?.item_name}</td>
                                  <td>{item?.item_notes}</td>
                                  <td>{item?.quantity ?? 0}</td>
                                </tr>
                              </>
                            )
                          )}

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
                      </table>
                    </div>
                  )
                } else if (
                  ['SURVEYREQ', 'SURVEYSTART', 'SURVEYDONE'].includes(
                    complaintDetail?.orders?.work_orders?.work_order_status[0]?.status?.category
                  ) &&
                  complaintDetail?.orders?.payment_type === 'survey' &&
                  complaintDetail?.orders?.work_orders?.work_order_status.length >= 1 &&
                  complaintDetail?.orders?.quotation?.length === 0
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
                          {complaintDetail?.orders?.work_orders?.work_order_status[0]
                            ?.work_order_items?.length ? (
                            complaintDetail?.orders?.work_orders?.work_order_status[0]?.work_order_items?.map(
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
                  complaintDetail?.orders?.work_orders?.work_order_status?.length >= 1 &&
                  complaintDetail?.orders?.quotation?.length >= 1 &&
                  complaintDetail?.orders?.payment_type === 'survey'
                ) {
                  return (
                    <div className='table-warranty-content'>
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
                          {complaintDetail?.orders?.quotation[0]?.quotation_details
                            ?.filter((x: any) => x.item_type === 2)
                            ?.map((item: any, index: any) => (
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
                          {complaintDetail?.orders?.quotation[0]?.quotation_details
                            ?.filter((x: any) => x.item_type === 1)
                            ?.map((item: any, index: any) => (
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
                              complaintDetail?.orders?.quotation[0]?.quotation_details
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
                              complaintDetail?.orders?.quotation[0]?.quotation_details
                                ?.filter((x: any) => x.item_type === 1)
                                ?.reduce(
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
                              {`Rp. ${parseInt(
                                complaintDetail?.orders?.quotation[0]?.quotation_disc ?? 0
                              ).toLocaleString('id')}`}
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              {`${
                                complaintDetail?.orders?.quotation[0]?.promotion
                                  ? `Additional Promotion (${complaintDetail?.orders?.quotation[0]?.promotion?.name})`
                                  : `Additional Promotion`
                              }`}
                            </td>

                            <td className=' fw-bolder'>
                              {complaintDetail?.orders?.quotation[0]?.promotion?.promotion_type ===
                              1
                                ? `${complaintDetail?.orders?.quotation[0]?.promotion?.promotion} %`
                                : `Rp. ${parseInt(
                                    complaintDetail?.orders?.quotation[0]?.promotion?.promotion ?? 0
                                  ).toLocaleString('id')}`}
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              Grand Total
                            </td>
                            <td className=' fw-bolder'>
                              {`Rp. ${parseInt(
                                complaintDetail?.orders?.quotation[0]?.quotation_grand_total ?? 0
                              ).toLocaleString('id')}`}
                            </td>
                          </tr>
                        </tbody>
                      </table>
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
                            *complaintDetail?.orders ini lebih dari{' '}
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
                            {!(complaintDetail?.orders?.payment_type === 'gratis') && (
                              <>
                                <th>Harga Jasa</th>
                                <th>Jumlah</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {complaintDetail?.orders?.m_order_details?.map(
                            (item: any, index: any) => (
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
                            )
                          )}

                          {complaintDetail?.orders?.is_overdistance === 1 && (
                            <>
                              <tr>
                                <td
                                  colSpan={
                                    complaintDetail?.orders?.payment_type !== 'gratis' ? 5 : 3
                                  }
                                  className='text-end fw-bolder align-middle'
                                >
                                  Biaya Tambahan
                                </td>

                                <td className=' fw-bolder'>{`Rp. ${Number(
                                  complaintDetail?.orders?.additional_fee
                                ).toLocaleString('id')}`}</td>
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

                            <td className=' fw-bolder'>{`Rp. ${Number(
                              complaintDetail?.orders?.grand_total
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
              <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                <Row className='information-detail'>
                  <div className='fs-3 fw-bold'>Informasi Survei Yang Dilakukan Oleh Vendor</div>

                  <div className='survey'>
                    <div className='detail-info mb-3'>
                      <p className='fs-5 fw-bold'>Survey dikerjakan pada:</p>

                      <p className='fs-7 p-0'>
                        {complaintDetail?.orders?.payment_type === 'survey' ? (
                          <>
                            {complaintDetail?.orders?.work_orders?.work_order_status.length ? (
                              <p className='fs-7'>
                                Tanggal :{' '}
                                {formatDateWithTime(
                                  complaintDetail?.orders?.work_orders?.survey_date
                                )}
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

                      {complaintDetail?.orders?.payment_type === 'survey' ? (
                        <>
                          {complaintDetail?.orders?.work_orders?.work_order_status.length ? (
                            <p className='fs-7'>
                              {complaintDetail?.orders?.work_orders?.work_order_tukang
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
                      {complaintDetail?.orders?.work_orders !== null &&
                      complaintDetail?.orders?.work_orders?.work_start_date !== null ? (
                        <div>
                          <p className='fs-7'>
                            MULAI{' '}
                            <span className='ms-5'>
                              {formatDateWithTime(
                                complaintDetail?.orders?.work_orders?.work_start_date
                              )}
                            </span>
                          </p>

                          <p className='fs-7'>
                            SELESAI{' '}
                            <span className='ms-3'>
                              {formatDateWithTime(
                                complaintDetail?.orders?.work_orders?.work_end_date
                              )}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p className='fs-7'>Jadwal belum ditentukan oleh vendor</p>
                      )}
                    </div>

                    <div className='detail-info mb-3'>
                      <p className='fs-5 fw-bold'>Oleh:</p>

                      {complaintDetail?.orders?.work_orders?.work_order_tukang?.filter(
                        (x: any) => x.type === 2
                      )?.length ? (
                        <p className='fs-7'>
                          {complaintDetail?.orders?.work_orders?.work_order_tukang
                            ?.filter((x: any) => x.type === 2)
                            ?.map((item: any) => item?.tukang?.full_name)
                            .join(', ')}
                        </p>
                      ) : (
                        <p className='fs-7'>Tukang belum diset oleh vendor</p>
                      )}
                    </div>
                  </div>
                </Row>
              </Skeleton>
            </Col>
          </Row>

          <Row>
            <Col>
              <Row className='information-detail'>
                <div className='fs-3 fw-bold'>Catatan Order</div>

                <div className='detail-info mb-3'>
                  <p className='fs-5 fw-bold'>Catatan Toko :</p>

                  <p className='fs-7'>
                    {complaintDetail?.orders?.notes
                      ? complaintDetail?.orders?.notes
                      : 'Toko tidak memberikan catatan'}
                  </p>
                </div>

                <div className='detail-info mb-3'>
                  <p className='fs-5 fw-bold'>Catatan Tukang :</p>

                  <p className='fs-7'>
                    {complaintDetail?.orders?.work_orders?.work_order_status[0]?.description
                      ? complaintDetail?.orders?.work_orders?.work_order_status[0]?.description
                      : 'Tukang tidak memberikan catatan'}
                  </p>
                </div>

                <div className='detail-info mb-3'>
                  <p className='fs-5 fw-bold'>Intruksi Spesial :</p>

                  <p className='fs-7'>
                    {complaintDetail?.orders?.quotation[0]?.description
                      ? complaintDetail?.orders?.quotation[0]?.description
                      : 'Vendor tidak memberikan catatan'}
                  </p>
                </div>
              </Row>
            </Col>

            {['WORKEND', 'WORKENDSTEPONE', 'WORKENDSTEPTWO', 'WORKENDSTEPTHREE'].includes(
              complaintDetail?.orders?.work_orders?.work_order_status[0]?.status?.category
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

          {complaintDetail?.orders?.order_files.length >= 1 ? (
            <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                  <Form.Label className='mt-3'>Bukti Receipt :</Form.Label>
                  <ListGroup>
                    {complaintDetail?.orders?.order_files.map((item: any) => (
                      <ListGroup.Item
                        key={item.id}
                        action
                        style={{cursor: 'pointer'}}
                        onClick={() => {
                          setPreviewImage(item.path)
                          setVisibleReceipt(true)
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
                            show={visibleReceipt}
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
                            visible: visibleReceipt,
                            src: `${apiUrl}/public/receipt/${previewImage}`,
                            onVisibleChange: (value) => {
                              setVisibleReceipt(value)
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
                  {complaintDetail?.orders?.quotation[0]?.quotation_files
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

                {complaintDetail?.orders?.quotation[0]?.quotation_files.length ? (
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
                  {complaintDetail?.orders?.quotation[0]?.quotation_files
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

                {complaintDetail?.orders?.quotation[0]?.quotation_files.length ? (
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
            {complaintDetail?.orders?.work_orders?.work_order_evidences?.length > 0 ? (
              <Row>
                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Form.Label className='mt-3'>Work Before :</Form.Label>
                  <ListGroup>
                    {complaintDetail?.orders?.work_orders?.work_order_evidences
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

                  {complaintDetail?.orders?.work_orders?.work_order_evidences?.filter(
                    (x: any) => x.type === 2
                  ).length ? (
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
                    {complaintDetail?.orders?.work_orders?.work_order_evidences
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

                  {complaintDetail?.orders?.work_orders?.work_order_evidences?.filter(
                    (x: any) => x.type === 3
                  ).length ? (
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

          {shouldDisplayActions() && ['Admin HO', 'Super User'].includes(userRole) && (
            <ActionButtons />
          )}

          {/* CRM Sync Status Section */}
          <Card className='mt-4 mb-4 border-warning'>
            <Card.Body>
              <Row className='align-items-center'>
                <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                  <div className='d-flex align-items-center gap-3'>
                    <div className='fs-4 fw-bold text-warning'>CRM Integration</div>
                    <Tag color={getCrmSyncLabel(complaintDetail?.is_sync ?? 0).color}>
                      {getCrmSyncLabel(complaintDetail?.is_sync ?? 0).text}
                    </Tag>
                  </div>
                  <p className='fs-7 text-muted mt-1 mb-0'>
                    Status sinkronisasi data pengaduan ke sistem CRM eksternal
                  </p>
                </Col>
                <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='text-end'>
                  {(complaintDetail?.is_sync ?? 0) !== 1 && (
                    <Button
                      variant='warning'
                      className='text-white'
                      disabled={resyncLoading}
                      onClick={handleResync}
                    >
                      <FontAwesomeIcon
                        icon={faRotate}
                        className='me-2'
                        spin={resyncLoading}
                      />
                      {resyncLoading ? 'Mengirim Ulang...' : 'Resubmit ke CRM'}
                    </Button>
                  )}
                  {(complaintDetail?.is_sync ?? 0) === 1 && (
                    <span className='text-success fw-bold'>
                      <FontAwesomeIcon icon={faCircleInfo} className='me-1' />
                      Data sudah tersinkronisasi
                    </span>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <hr />

          <Card className='mb-5'>
            <Card.Body>
              <Row className='complaint-info'>
                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='5'>
                        Nama PIC Komplain
                      </Form.Label>

                      <Col sm='7'>
                        <p className='fs-7'>: {complaintDetail?.pic_name ?? '-'}</p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='5'>
                        Tanggal Komplain Dibuat
                      </Form.Label>

                      <Col sm='7'>
                        <p className='fs-7'>: {formatDateWithTime(complaintDetail?.created_at)}</p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='5'>
                        Tanggal Komplain Diterima
                      </Form.Label>

                      <Col sm='7'>
                        <p className='fs-7'>
                          :{' '}
                          {formatDateWithTimeZone(complaintDetail?.complaint_received_date ?? null)}
                        </p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='5'>
                        Komplain melalui
                      </Form.Label>

                      <Col sm='7'>
                        <p className='fs-7'>: {complaintDetail?.complaint_channels?.name}</p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='5'>
                        Jenis Pengaduan
                      </Form.Label>

                      <Col sm='7'>
                        <p className='fs-7'>
                          :{' '}
                          {crmType.find((type) => type.value === complaintDetail?.crm_type)
                            ?.label ?? '-'}
                        </p>
                      </Col>
                    </Form.Group>
                  </Skeleton>
                </Col>

                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                    <Form.Group className='detail-info'>
                      <Form.Label className='mb-2'>Alasan Komplain :</Form.Label>
                      <p className='fs-7'>{complaintDetail?.description}</p>
                    </Form.Group>
                  </Skeleton>
                </Col>

                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                    <Form.Label>Complaint Evidence :</Form.Label>

                    <ListGroup>
                      {complaintDetail?.complaint_histories.map((item: any) =>
                        item.complaint_evidence.map((evidence: any) => (
                          <ListGroup.Item
                            key={evidence.id}
                            action
                            onClick={() => {
                              setPreviewImage(evidence?.evidence_location)
                              setVisibleComplaintEvidence(true)
                            }}
                          >
                            {evidence?.evidence_location}
                          </ListGroup.Item>
                        ))
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
                            visible: visibleComplaintEvidence,
                            src: `${apiUrl}/public/complaints/${previewImage}`,
                            onVisibleChange: (value) => {
                              setVisibleComplaintEvidence(value)
                            },
                          }}
                        />
                      </div>
                    )}
                  </Skeleton>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {complaintDetail?.remedials && complaintDetail.remedials.length > 0 && (
            <>
              {complaintDetail.remedials.map((item: any) => (
                <Card className='mb-5'>
                  <Card.Body>
                    <Row key={item.id} className='remedial-info'>
                      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                        <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                          <Form.Group as={Row} className='detail-info'>
                            <Form.Label column sm='5'>
                              PIC Feedback :
                            </Form.Label>

                            <Col sm='7'>
                              <p className='fs-7'>: {item?.remedial_pic ?? '-'}</p>
                            </Col>
                          </Form.Group>

                          <Form.Group as={Row} className='detail-info'>
                            <Form.Label column sm='5'>
                              Jabatan
                            </Form.Label>

                            <Col sm='7'>
                              <p className='fs-7'>: {item?.remedial_pic_positon ?? '-'}</p>
                            </Col>
                          </Form.Group>

                          <Form.Group as={Row} className='detail-info'>
                            <Form.Label column sm='5'>
                              Tanggal Feedback
                            </Form.Label>

                            <Col sm='7'>
                              <p className='fs-7'>: {formatDateWithTime(item?.created_at)}</p>
                            </Col>
                          </Form.Group>

                          {['Owner Vendor', 'Admin Vendor'].includes(
                            item?.remedial_pic_positon
                          ) && (
                            <Form.Group as={Row} className='detail-info'>
                              <Form.Label column sm='5'>
                                Status Vendor
                              </Form.Label>

                              <Col sm='7'>
                                <p className='fs-7'>: {item?.status?.description ?? '-'}</p>
                              </Col>
                            </Form.Group>
                          )}
                        </Skeleton>
                      </Col>

                      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                        <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                          <Form.Group className='detail-info'>
                            <Form.Label className='mb-2'>Deskripsi Feedback :</Form.Label>
                            <p className='fs-7'>{item?.remedial_action}</p>
                          </Form.Group>
                        </Skeleton>
                      </Col>

                      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                        <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                          <Form.Group className='detail-info'>
                            <Form.Label className='mb-2'>Remedial Evidence:</Form.Label>
                            <ListGroup>
                              {item?.remedial_evidences?.map((evidenceItem: any) => (
                                <ListGroup.Item
                                  key={evidenceItem.id}
                                  action
                                  onClick={() => {
                                    setPreviewImage(evidenceItem.evidence_location)
                                    setVisibleRemedial(true)
                                  }}
                                >
                                  {evidenceItem.evidence_location}
                                </ListGroup.Item>
                              ))}
                            </ListGroup>

                            {previewImage && (
                              <div>
                                <Image
                                  key={previewImage}
                                  width={200}
                                  style={{display: 'none'}}
                                  src={`${apiUrl}/public/remedials/${previewImage}`}
                                  preview={{
                                    visible: visibleRemedial,
                                    src: `${apiUrl}/public/remedials/${previewImage}`,
                                    onVisibleChange: (value) => {
                                      setVisibleRemedial(value)
                                    },
                                  }}
                                />
                              </div>
                            )}
                          </Form.Group>
                        </Skeleton>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </>
          )}

          {!['Tukang'].includes(userRole) && (
            <>
              {!['WARRANTYCLAIM', 'INVESTIGATED', 'COMPLAINTREJECTEDBYHO', 'DONE'].includes(
                complaintDetail?.status?.category
              ) && (
                <>
                  <hr />

                  <Row>
                    <Col xs={12} md={8} lg={8} xl={8} xxl={8} className='mb-3'>
                      <Form.Label className='fs-3 fw-bold'>Feedback</Form.Label>
                      <Form.Control
                        style={{minHeight: '170px'}}
                        as='textarea'
                        placeholder='Isi feedback..'
                        name='remedial_action'
                        value={remedialForm.remedial_action}
                        onChange={(e) => remedialFormHandler(e)}
                      ></Form.Control>
                    </Col>

                    <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='mb-3'>
                      <Form.Group controlId='formFile'>
                        <Form.Label className='fs-3 fw-bold'>Upload Bukti</Form.Label>
                        <Form className='form-input-image' onClick={handleImageClick}>
                          <Form.Control
                            type='file'
                            accept='image/*'
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
                          {feedbackEvidence.length ? (
                            feedbackEvidence.map((item, index) => (
                              <ListGroup.Item
                                key={`${item?.name}-${index}-${item?.type}`}
                                className='d-flex justify-content-between'
                              >
                                <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                                <span className='upload-content'> {item?.name}</span>

                                <FontAwesomeIcon
                                  icon={faTrash}
                                  size='sm'
                                  color='#ed2b2a'
                                  style={{cursor: 'pointer'}}
                                  onClick={(e) => handleRemoveFile(index)}
                                />
                              </ListGroup.Item>
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

                  {['Store Staff', 'Store CS'].includes(userRole) && (
                    <Row>
                      <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='mb-3'>
                        <Form.Group>
                          <Form.Label>Nama Pemberi Feedback</Form.Label>

                          <Form.Control
                            name='remedial_pic'
                            type='text'
                            placeholder='Isi Nama Pemberi Feedback'
                            value={remedialForm.remedial_pic}
                            onChange={(e) => remedialFormHandler(e)}
                          ></Form.Control>
                        </Form.Group>
                      </Col>

                      <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='mb-3'>
                        <Form.Group>
                          <Form.Label>Jabatan</Form.Label>
                          <Select
                            name='pic_position'
                            id='pic_position'
                            className='form-control p-0 form-item-name'
                            classNamePrefix='select'
                            placeholder='Jabatan'
                            isSearchable={true}
                            isClearable={true}
                            options={picPositions}
                            value={{
                              value: selectedPosition?.value ?? '',
                              label: selectedPosition?.label ?? '',
                            }}
                            onChange={(newValue) => setSelectedPosition(newValue)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  )}

                  <div className='d-flex justify-content-center align-items-center gap-3 mt-5'>
                    <Button
                      variant='dark-danger'
                      className='d-flex justify-content-center align-items-center'
                      type='button'
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>

                    <Button
                      variant='dark-primary'
                      className='d-flex justify-content-center align-items-center'
                      type='button'
                      disabled={isLoading}
                      onClick={handleSubmitNewFeedback}
                    >
                      {isLoading ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                  </div>

                  {['REWORKEND', 'RESURVEYDONE'].includes(
                    complaintDetail?.orders?.status?.category
                  ) && (
                    <div className='d-flex justify-content-center align-items-center mt-4'>
                      <Button
                        className='d-flex justify-content-center align-items-center'
                        variant='dark-primary'
                        disabled={isLoading}
                        onClick={() => handleApprovalComplaint(complaintStatusDone)}
                      >
                        Selesaikan Komplain
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {['COMPLAINTAPPROVEDBYHO'].includes(complaintDetail?.status?.category) && (
            <>
              <hr />

              <Alert variant='success' className='d-flex align-items-center'>
                <FontAwesomeIcon className='text-black' icon={faCircleInfo} fontSize={'15px'} />

                <p className='fw-normal text-black'>
                  Komplain telah disetujui oleh HO
                  <span className='fw-bold text-black'>
                    {complaintDetail?.complaint_histories[0].reason} (Komplain sedang
                    ditindaklanjuti)
                  </span>
                </p>
              </Alert>
            </>
          )}

          {['COMPLAINTREJECTEDBYHO'].includes(complaintDetail?.status?.category) && (
            <>
              <hr />

              <Alert variant='danger' className='d-flex align-items-center'>
                <FontAwesomeIcon className='text-black' icon={faCircleInfo} fontSize={'15px'} />

                <p className='fw-normal text-black'>
                  Komplain telah ditolak oleh HO dengan alasan{' '}
                  <span className='fw-bold text-black'>
                    {complaintDetail?.complaint_histories[0].reason} (Komplain ini sudah
                    ditindaklanjuti)
                  </span>
                </p>
              </Alert>
            </>
          )}
        </Card.Body>
      </Card>

      <Modal centered show={showModal} onHide={handleCloseModal}>
        {modalType === 1 && (
          <>
            <Modal.Body>
              <Form.Label className='fs-5 fw-bolder'>Reason Rejected :</Form.Label>
              <Form.Group>
                <Form.Control as='textarea' rows={3} onChange={handleInputReason} />
              </Form.Group>
            </Modal.Body>

            <Modal.Footer>
              <Button variant='dark-danger' onClick={() => setShowModal(false)}>
                Close
              </Button>

              <Button
                className='d-flex justify-content-center align-items-center'
                variant='dark-primary'
                onClick={() => handleApprovalComplaint(complaintStatusCancel)}
                disabled={isLoading}
              >
                {isLoading ? 'Rejected..' : 'Rejected'}
              </Button>
            </Modal.Footer>
          </>
        )}

        {modalType === 2 && (
          <>
            <Modal.Body>
              <Form.Group className='mb-3'>
                <Form.Label>Pilih status :</Form.Label>

                <Form.Select onChange={(e) => handleInputStatus(e)}>
                  <option selected>Pilih status</option>

                  {statusData
                    .filter((status: any) =>
                      ['RESURVEYREQ', 'REWORKREQ', 'RESURVEYDONE', 'REWORKEND'].includes(
                        status.category
                      )
                    )
                    .map((status: any) => (
                      <option key={status.value} value={status.value}>
                        {status.description}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className='mb-3'>
                <Form.Label>Alasan :</Form.Label>
                <Form.Control rows={3} as='textarea' onChange={handleInputReason} />
              </Form.Group>

              <Button
                className='d-flex justify-content-center align-items-center w-100 m-0'
                variant='dark-primary'
                onClick={handleChangeStatusComplaint}
              >
                Submit
              </Button>
            </Modal.Body>
          </>
        )}
      </Modal>
    </section>
  )
}

export {DetailComplaintPage}
