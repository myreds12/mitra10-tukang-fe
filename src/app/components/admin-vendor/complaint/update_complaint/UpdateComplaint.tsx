import React, {FC, useState, useEffect, useRef} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import Swal from 'sweetalert2'

import './UpdateComplaint.css'
import {RemedialStatus} from './types'
import {
  fetchComplaintDetailApi,
  resyncComplaintApi,
  fetchStatusListApi,
  submitRemedialActionApi,
} from './services/updateComplaintVendorService'
import {UpdateComplaintHeaderSection} from './components/UpdateComplaintHeaderSection'
import {UpdateComplaintInstallationSection} from './components/UpdateComplaintInstallationSection'
import {UpdateComplaintInfoSection} from './components/UpdateComplaintInfoSection'
import {UpdateComplaintRemedialHistorySection} from './components/UpdateComplaintRemedialHistorySection'
import {UpdateComplaintRemedialFormSection} from './components/UpdateComplaintRemedialFormSection'

const UpdateComplaintVendor: FC<{updatePageTitle: (complaint: any) => void}> = ({
  updatePageTitle,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const params = useParams()
  const navigate = useNavigate()

  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [resyncLoading, setResyncLoading] = useState<boolean>(false)

  const username = localStorage.getItem('username') as string
  const userRole = localStorage.getItem('userRole') as string

  // Complaint Detail
  const [complaintId, setComplaintId] = useState<any>()
  const [complaintDetail, setComplaintDetail] = useState<any>()

  // Complaint Evidence
  const [previewImage, setPreviewImage] = useState<any>()
  const [visibleComplaintEvidence, setVisibleComplaintEvidence] = useState(false)

  // Remedial Evidence
  const [visibleRemedial, setVisibleRemedial] = useState(false)

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

  const fetchComplaintData = async () => {
    try {
      const response = await fetchComplaintDetailApi(apiUrl, params.id)
      const data = response.data.data

      setIsLoadingPage(false)
      setComplaintDetail(data)
      updatePageTitle(data)

      if (data?.id) {
        setComplaintId(data.id)
      }
    } catch (error) {
      console.error(error)
      setIsLoadingPage(false)
    }
  }

  const handleResync = async () => {
    if (!complaintDetail?.id) return
    setResyncLoading(true)
    try {
      const response = await resyncComplaintApi(apiUrl, complaintDetail.id)

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

  const fetchRemedialStatus = async () => {
    try {
      const response = await fetchStatusListApi(apiUrl)
      if (Array.isArray(response.data.data)) {
        const tempComplaintChannel = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.category,
        }))
        setOptionRemedialStatus(tempComplaintChannel)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchComplaintData()
    fetchRemedialStatus()
  }, [])

  // Add Remedial Action
  const [picFeedback, setPicFeedback] = useState<string>(username)
  const [picPosition, setPicPosition] = useState<string>(userRole)
  const [remedialDesc, setRemedialDesc] = useState<any>('')
  const [remedialStartDate, setremedialStartDate] = useState<string>('')
  const [remedialEvidence, setRemedialEvidence] = useState<Array<File | null>>([])

  const evidenceRef = useRef<HTMLInputElement>(null)

  // Remedial Status
  const [optionRemedialStatus, setOptionRemedialStatus] = useState<RemedialStatus[]>([])
  const [optionRemedialStatusId, setOptionRemedialStatusId] = useState<string>('')

  // Handle Input Change
  const handleInputRemedialDesc = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updatedInputValue = event.target.value
    setRemedialDesc(updatedInputValue)
  }

  // Handle Change Remedial Status
  const handleChangeSelectRemedialStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedOptionRemedialStatusId = event.target.value
    setOptionRemedialStatusId(updatedOptionRemedialStatusId)
  }

  // Handle Change Upload File
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files

    if (fileList && fileList.length <= 5) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...remedialEvidence]
      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setRemedialEvidence(mergedFiles)
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
    const newEvidances = [...remedialEvidence]
    newEvidances.splice(index, 1)
    setRemedialEvidence(newEvidances)

    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  // Remedial Validation
  const RemedialValidation = () => {
    let valid = true

    if (!remedialDesc) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill remedial notes form',
        icon: 'error',
      })
      valid = false
    } else if (!optionRemedialStatus) {
      Swal.fire({
        title: 'Error',
        text: 'Please select remedial status',
        icon: 'error',
      })
      valid = false
    } else if (!remedialEvidence) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill remedial evidence form',
        icon: 'error',
      })
      valid = false
    }
    return valid
  }

  // Handle Submit Remedial Action
  const handleSubmitRemedialAction = async () => {
    if (RemedialValidation()) {
      setIsLoading(true)
      const formData = new FormData()

      formData.append('complaint_id', complaintId)
      formData.append('remedial_action', remedialDesc)
      formData.append('ra_date_start', remedialStartDate)
      formData.append('remedial_pic', picFeedback)
      formData.append('remedial_pic_position', picPosition)
      formData.append('remedial_status', optionRemedialStatusId)

      if (remedialEvidence?.length) {
        remedialEvidence.forEach((item) => {
          if (item) {
            formData.append(`remedial_evidences`, item, item?.name)
          }
        })
      }

      try {
        const response = await submitRemedialActionApi(apiUrl, formData)
        if (response.data.status === 200 || response.data.status === 201) {
          Swal.fire({
            title: 'Success',
            text: 'Berhasil menambahkan feedback',
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
      } catch (error: any) {
        console.error(error)
        setIsLoading(false)
        Swal.fire({
          title: 'Error',
          text: error?.response?.data?.message,
          icon: 'error',
        })
      }
    }
  }

  const handleCancelRemedial = () => {
    navigate('/complaint/view-complaint')
  }

  return (
    <section id='detail-complaint'>
      <div className='card'>
        <div className='card-body'>
          <UpdateComplaintHeaderSection
            complaintDetail={complaintDetail}
            isLoadingPage={isLoadingPage}
            resyncLoading={resyncLoading}
            handleResync={handleResync}
            getCrmSyncLabel={getCrmSyncLabel}
          />

          <UpdateComplaintInstallationSection
            complaintDetail={complaintDetail}
            isLoadingPage={isLoadingPage}
          />

          <UpdateComplaintInfoSection
            complaintDetail={complaintDetail}
            isLoadingPage={isLoadingPage}
            apiUrl={apiUrl}
            previewImage={previewImage}
            setPreviewImage={setPreviewImage}
            visibleComplaintEvidence={visibleComplaintEvidence}
            setVisibleComplaintEvidence={setVisibleComplaintEvidence}
          />

          <UpdateComplaintRemedialHistorySection
            complaintDetail={complaintDetail}
            isLoadingPage={isLoadingPage}
            apiUrl={apiUrl}
            previewImage={previewImage}
            setPreviewImage={setPreviewImage}
            visibleRemedial={visibleRemedial}
            setVisibleRemedial={setVisibleRemedial}
          />

          <UpdateComplaintRemedialFormSection
            complaintDetail={complaintDetail}
            isLoading={isLoading}
            handleInputRemedialDesc={handleInputRemedialDesc}
            handleChangeSelectRemedialStatus={handleChangeSelectRemedialStatus}
            handleImageClick={handleImageClick}
            evidenceRef={evidenceRef}
            handleFileChange={handleFileChange}
            remedialEvidence={remedialEvidence}
            handleRemoveFile={handleRemoveFile}
            handleCancelRemedial={handleCancelRemedial}
            handleSubmitRemedialAction={handleSubmitRemedialAction}
          />
        </div>
      </div>
    </section>
  )
}

export {UpdateComplaintVendor}
