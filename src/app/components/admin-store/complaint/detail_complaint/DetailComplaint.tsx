import React, { FC, useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SingleValue } from 'react-select'
import { Card, Button } from 'react-bootstrap'
import axios from 'axios'
import Swal from 'sweetalert2'

import './DetailComplaint.css'
import { Complaint, Remedial, Position, CrmType } from './types'
import { DetailComplaintHeader } from './components/DetailComplaintHeader'
import { ComplaintOrderDetailsSection } from './components/ComplaintOrderDetailsSection'
import { ComplaintInfoSection } from './components/ComplaintInfoSection'
import { ComplaintFeedbackForm } from './components/ComplaintFeedbackForm'
import { ComplaintModals } from './components/ComplaintModals'

const DetailComplaintPage: FC<{ updatePageTitle: (complaint: any) => void }> = ({
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
    { value: 1, label: 'Positive' },
    { value: 2, label: 'Neutral' },
    { value: 3, label: 'Negative' },
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
        return { text: 'Tersinkronisasi', color: 'green' }
      case 2:
        return { text: 'Gagal Sync', color: 'red' }
      default:
        return { text: 'Belum Sync', color: 'default' }
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

  // Complaint Approval
  const [complaintStatusDone, setComplaintStatusDone] = useState<any>()
  const [complaintStatusApprove, setComplaintStatusApprove] = useState<any>()
  const [complaintStatusCancel, setComplaintStatusCancel] = useState<any>()

  // Previews & Visibilities
  const [previewImage, setPreviewImage] = useState<any>()
  const [visibleComplaintEvidence, setVisibleComplaintEvidence] = useState(false)
  const [visibleRemedial, setVisibleRemedial] = useState(false)
  const [visibleReceipt, setVisibleReceipt] = useState(false)
  const handleClose = () => setVisibleReceipt(false)

  const [visibleWorkBefore, setVisibleWorkBefore] = useState(false)
  const [visibleWorkAfter, setVisibleWorkAfter] = useState(false)
  const [visibleQuotationReceipt, setVisibleQuotationReceipt] = useState(false)
  const [visibleQuotationFiles, setVisibleQuotationFiles] = useState(false)

  // Fetching Complaint Data
  const fetchComplaintData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/complaints/${params.id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
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
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchComplaintData()
  }, [])

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

  // Reason Rejected Modal
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

  const picPositions: Position[] = [
    { value: 'Staff', label: 'Staff' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Deputy Store Manager', label: 'Deputy Store Manager' },
    { value: 'Store Manager', label: 'Store Manager' },
  ]
  const [selectedPosition, setSelectedPosition] = useState<SingleValue<Position>>({
    value: '',
    label: '',
  })

  useEffect(() => {
    setRemedialForm((prev) => ({
      ...prev,
      ra_date_start: today,
      remedial_pic_position: ['Super User', 'Admin HO'].includes(userRole)
        ? userRole
        : selectedPosition?.value ?? '',
    }))
  }, [userRole, selectedPosition])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files

    if (fileList && fileList.length <= 5) {
      const file: Array<File | null> = new Array<File>()
      const { length } = fileList

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
    inputField?.click()
  }

  const handleRemoveFile = (index: number) => {
    const newEvidences = [...feedbackEvidence]
    newEvidences.splice(index, 1)
    setFeedbackEvidence(newEvidences)

    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

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
          text: error.response?.data?.message || 'Error occurred',
          icon: 'error',
        })
      })
  }

  const handleCancel = () => {
    navigate('/complaint/view-complaint')
  }

  const calculateWarrantyDays = (warranty: string) => {
    if (!warranty) return { workEndDate: '-', warrantyEndDate: '-', status: '-' }

    const createdAt = new Date(warranty)
    const workEndDate = createdAt.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const warrantyEnd = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    const warrantyEndDate = warrantyEnd.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const now = new Date()
    const status = now > warrantyEnd ? 'Garansi Expired' : 'Garansi Aktif'

    return { workEndDate, warrantyEndDate, status }
  }

  const warrantyData = calculateWarrantyDays(
    complaintDetail?.orders?.work_orders?.work_order_status?.[0]?.created_at
  )

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
          <DetailComplaintHeader
            isLoadingPage={isLoadingPage}
            complaintDetail={complaintDetail}
          />

          <ComplaintOrderDetailsSection
            isLoadingPage={isLoadingPage}
            complaintDetail={complaintDetail}
            warrantyData={warrantyData}
            previewImage={previewImage}
            setPreviewImage={setPreviewImage}
            visibleReceipt={visibleReceipt}
            setVisibleReceipt={setVisibleReceipt}
            visibleQuotationReceipt={visibleQuotationReceipt}
            setVisibleQuotationReceipt={setVisibleQuotationReceipt}
            visibleQuotationFiles={visibleQuotationFiles}
            setVisibleQuotationFiles={setVisibleQuotationFiles}
            apiUrl={apiUrl}
            handleClose={handleClose}
          />

          <ComplaintInfoSection
            isLoadingPage={isLoadingPage}
            complaintDetail={complaintDetail}
            previewImage={previewImage}
            setPreviewImage={setPreviewImage}
            visibleWorkBefore={visibleWorkBefore}
            setVisibleWorkBefore={setVisibleWorkBefore}
            visibleWorkAfter={visibleWorkAfter}
            setVisibleWorkAfter={setVisibleWorkAfter}
            visibleComplaintEvidence={visibleComplaintEvidence}
            setVisibleComplaintEvidence={setVisibleComplaintEvidence}
            visibleRemedial={visibleRemedial}
            setVisibleRemedial={setVisibleRemedial}
            apiUrl={apiUrl}
            userRole={userRole}
            shouldDisplayActions={shouldDisplayActions}
            ActionButtons={ActionButtons}
            getCrmSyncLabel={getCrmSyncLabel}
            resyncLoading={resyncLoading}
            handleResync={handleResync}
            crmType={crmType}
          />

          <ComplaintFeedbackForm
            userRole={userRole}
            complaintDetail={complaintDetail}
            remedialForm={remedialForm}
            remedialFormHandler={remedialFormHandler}
            handleImageClick={handleImageClick}
            evidenceRef={evidenceRef}
            handleFileChange={handleFileChange}
            feedbackEvidence={feedbackEvidence}
            handleRemoveFile={handleRemoveFile}
            picPositions={picPositions}
            selectedPosition={selectedPosition}
            setSelectedPosition={setSelectedPosition}
            handleCancel={handleCancel}
            handleSubmitNewFeedback={handleSubmitNewFeedback}
            handleApprovalComplaint={handleApprovalComplaint}
            complaintStatusDone={complaintStatusDone}
            isLoading={isLoading}
          />
        </Card.Body>
      </Card>

      <ComplaintModals
        showModal={showModal}
        setShowModal={setShowModal}
        handleCloseModal={handleCloseModal}
        modalType={modalType ?? 0}
        handleInputReason={handleInputReason}
        handleApprovalComplaint={handleApprovalComplaint}
        complaintStatusCancel={complaintStatusCancel}
        isLoading={isLoading}
        handleInputStatus={handleInputStatus}
        statusData={statusData}
        handleChangeStatusComplaint={handleChangeStatusComplaint}
      />
    </section>
  )
}

export { DetailComplaintPage }
