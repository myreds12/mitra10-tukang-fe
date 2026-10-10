import React, {FC, useState, useEffect, useRef} from 'react'
import './UpdateComplaint.css'
import Swal from 'sweetalert2'
import {useNavigate, useParams} from 'react-router-dom'
import {Row, Col, Button} from 'react-bootstrap'
import {OptionRemedialStatus, ComplaintChannel} from './types'
import {
  fetchComplaintDataApi,
  fetchRemedialStatusApi,
  fetchComplaintChannelApi,
  updateComplaintApi,
  submitRemedialActionApi,
} from './services/updateComplaintTukangService'
import {UpdateComplaintHeaderSection} from './components/UpdateComplaintHeaderSection'
import {UpdateComplaintInstallationSection} from './components/UpdateComplaintInstallationSection'
import {UpdateComplaintHistoryFormSection} from './components/UpdateComplaintHistoryFormSection'
import {UpdateComplaintRemedialActionSection} from './components/UpdateComplaintRemedialActionSection'

const UpdateComplaintTukang: FC<{updatePageTitle: (complaint: any) => void}> = ({
  updatePageTitle,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const params = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const userId = localStorage.getItem('user_id') as any

  // Complaint Detail
  const [orderId, setOrderId] = useState<any>()
  const [complaintId, setComplaintId] = useState<any>()
  const [complaintDetail, setComplaintDetail] = useState<any>()

  const [previewImage, setPreviewImage] = useState<any>()
  const [visible, setVisible] = useState(false)

  const fetchComplaintData = async () => {
    try {
      const response = await fetchComplaintDataApi(apiUrl, params.id)
      const data = response.data.data

      setComplaintDetail(data)
      updatePageTitle(data)

      if (data?.orders.id) {
        setOrderId(data.orders.id)
      }

      if (data?.id) {
        setComplaintId(data.id)
      }

      if (data?.description) {
        setComplaintDesc(data.description)
      }

      if (data?.complaint_date) {
        setComplaintDate(new Date(data.complaint_date).toISOString().split('T')[0])
      }

      if (data?.complaint_channels?.id && data?.complaint_channels?.name) {
        setComplaintChannelId(data.complaint_channels.id)
        setComplaintChannelName(data.complaint_channels.name)
      }

      if (data?.complaint_evidence) {
        const initialComplaintEvidenceValues = data.complaint_evidence.map((item: any) => ({
          id: item.id,
          name: item.evidence_location,
        }))

        setComplaintEvidence(initialComplaintEvidenceValues)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchRemedialStatus = async () => {
    try {
      const response = await fetchRemedialStatusApi(apiUrl)

      if (Array.isArray(response.data.data)) {
        const tempRemedialStatus = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.category,
        }))

        setOptionRemedialStatus(tempRemedialStatus)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchComplaintChannel = async () => {
    try {
      const response = await fetchComplaintChannelApi(apiUrl)

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

  useEffect(() => {
    fetchComplaintData()
    fetchRemedialStatus()
    fetchComplaintChannel()
  }, [])

  const phoneNumber =
    complaintDetail?.orders.members.phone_number !== null
      ? complaintDetail?.orders.members.phone_number
      : complaintDetail?.orders.members.whatsapp_number

  const formatDate = (date: any) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const today = new Date().toISOString().split('T')[0]

  // Update Complaint
  const [complaintDesc, setComplaintDesc] = useState<any>('')
  const [complaintDate, setComplaintDate] = useState<string>('')
  const [complaintEvidence, setComplaintEvidence] = useState<Array<File | null>>([])

  const evidenceRef = useRef<HTMLInputElement>(null)

  // Complaint Channel
  const [complaintChannel, setComplaintChannel] = useState<ComplaintChannel[]>([])
  const [complaintChannelId, setComplaintChannelId] = useState<string>('')
  const [complaintChannelName, setComplaintChannelName] = useState<string>('')

  // Handle Input Change
  const handleInputComplaintDesc = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedInputValue = event.target.value
    setComplaintDesc(updatedInputValue)
  }

  // Handle Change Complaint Channel
  const handleChangeSelectComplaintChannel = (element: any) => {
    const updatedComplaintChannelId = element.value
    const updatedComplaintChannelName = element.label

    setComplaintChannelId(updatedComplaintChannelId)
    setComplaintChannelName(updatedComplaintChannelName)
  }

  // Handle Complaint Date Change
  const handleChangeComplaintDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedComplaintDate = event.target.value
    setComplaintDate(updatedComplaintDate)
  }

  // Handle Change Complaint File
  const handleFileComplaintChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files

    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...complaintEvidence]
      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setComplaintEvidence(mergedFiles)
    }
  }

  const handleComplaintImageClick = () => {
    const inputField = document.querySelector('.input-field-image-complaint') as HTMLInputElement
    inputField?.click()
  }

  const handleComplaintRemoveFile = (index: number) => {
    const newEvidances = [...complaintEvidence]
    newEvidances.splice(index, 1)
    setComplaintEvidence(newEvidances)

    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  // Update Complaint Validation
  const UpdateComplaintValidation = () => {
    let valid = true

    if (!complaintDesc) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill complaint description',
        icon: 'error',
      })
      valid = false
    } else if (!complaintChannelId) {
      Swal.fire({
        title: 'Error',
        text: 'Please select complaint via form',
        icon: 'error',
      })
      valid = false
    } else if (!complaintDate) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill complaint date form',
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

  // Handle Update Complaint
  const handleUpdateComplaint = async () => {
    if (UpdateComplaintValidation()) {
      setIsLoading(true)
      const formData = new FormData()

      formData.append('order_id', orderId)
      formData.append('description', complaintDesc)
      formData.append('complaint_channel', complaintChannelId)
      formData.append('complaint_date', complaintDate)

      if (complaintEvidence?.length) {
        complaintEvidence.forEach((item) => {
          if (item) {
            formData.append(`complaint_evidences-complaint`, item, item?.name)
          }
        })
      }

      try {
        const response = await updateComplaintApi(apiUrl, params.id, formData)
        if (response.data.status === 200 || response.data.status === 201) {
          Swal.fire({
            title: 'Success',
            text: 'Success Update Complaint',
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

  // Add Remedial Action
  const [picRemedialId, setPicRemedialId] = useState<any>()
  const [remedialDesc, setRemedialDesc] = useState<any>('')
  const [remedialStartDate, setremedialStartDate] = useState<string>('')
  const [remedialEndDate, setremedialEndDate] = useState<string>('')
  const [remedialEvidence, setRemedialEvidence] = useState<Array<File | null>>([])

  const remedialEvidenceRef = useRef<HTMLInputElement>(null)

  // Remedial Status
  const [optionRemedialStatus, setOptionRemedialStatus] = useState<OptionRemedialStatus[]>([])
  const [optionRemedialStatusId, setOptionRemedialStatusId] = useState<string>('')

  // PIC Remedial
  useEffect(() => {
    const updatedPicRemedial = userId?.toString()
    setPicRemedialId(updatedPicRemedial)
  }, [userId])

  // Handle Input Change
  const handleInputRemedialDesc = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedInputValue = event.target.value
    setRemedialDesc(updatedInputValue)
  }

  // Handle Change Remedial Status
  const handleChangeSelectRemedialStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedOptionRemedialStatusId = event.target.value
    setOptionRemedialStatusId(updatedOptionRemedialStatusId)
  }

  // Handle Complaint Date Change
  const handleChangeremedialStartDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedremedialStartDate = event.target.value
    setremedialStartDate(updatedremedialStartDate)
  }

  const handleChangeremedialEndDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedremedialEndDate = event.target.value
    setremedialEndDate(updatedremedialEndDate)
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
    const inputField = document.querySelector('.input-field-image-remedial') as HTMLInputElement
    inputField?.click()
  }

  const handleRemoveFile = (index: number) => {
    const newEvidances = [...remedialEvidence]
    newEvidances.splice(index, 1)
    setRemedialEvidence(newEvidances)

    if (remedialEvidenceRef.current?.value) {
      remedialEvidenceRef.current.value = ''
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
    } else if (!remedialStartDate) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill remedial start date form',
        icon: 'error',
      })
      valid = false
    } else if (!remedialEndDate) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill remedial end date form',
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
      formData.append('ra_date_end', remedialEndDate)
      formData.append('remedial_pic', picRemedialId)
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
            text: 'Success Update Complaint',
            icon: 'success',
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

  return (
    <section id='update-complaint-vendor'>
      <div className='card'>
        <div className='card-body'>
          <UpdateComplaintHeaderSection
            complaintDetail={complaintDetail}
            phoneNumber={phoneNumber}
            formatDate={formatDate}
          />

          <UpdateComplaintInstallationSection
            complaintDetail={complaintDetail}
            formatDate={formatDate}
          />

          <hr />

          <Row>
            <UpdateComplaintHistoryFormSection
              complaintDetail={complaintDetail}
              complaintChannel={complaintChannel}
              complaintChannelId={complaintChannelId}
              complaintChannelName={complaintChannelName}
              handleChangeSelectComplaintChannel={handleChangeSelectComplaintChannel}
              complaintDesc={complaintDesc}
              handleInputComplaintDesc={handleInputComplaintDesc}
              today={today}
              complaintDate={complaintDate}
              handleChangeComplaintDate={handleChangeComplaintDate}
              handleComplaintImageClick={handleComplaintImageClick}
              evidenceRef={evidenceRef}
              handleFileComplaintChange={handleFileComplaintChange}
              complaintEvidence={complaintEvidence}
              setPreviewImage={setPreviewImage}
              setVisible={setVisible}
              handleComplaintRemoveFile={handleComplaintRemoveFile}
            />

            <UpdateComplaintRemedialActionSection
              complaintDetail={complaintDetail}
              today={today}
              handleChangeremedialStartDate={handleChangeremedialStartDate}
              handleChangeSelectRemedialStatus={handleChangeSelectRemedialStatus}
              handleInputRemedialDesc={handleInputRemedialDesc}
              handleChangeremedialEndDate={handleChangeremedialEndDate}
              handleImageClick={handleImageClick}
              remedialEvidenceRef={remedialEvidenceRef}
              handleFileChange={handleFileChange}
              remedialEvidence={remedialEvidence}
              handleRemoveFile={handleRemoveFile}
            />
          </Row>

          <Row>
            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <div className='d-flex justify-content-center align-items-center mt-5'>
                <Button
                  variant='dark-primary'
                  className='d-flex justify-content-center align-items-center'
                  type='submit'
                  disabled={isLoading}
                  onClick={handleUpdateComplaint}
                >
                  {isLoading ? 'Updating..' : 'Update Complaint'}
                </Button>
              </div>
            </Col>

            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <div className='d-flex justify-content-center align-items-center mt-5'>
                <Button
                  variant='dark-success'
                  className='d-flex justify-content-center align-items-center'
                  type='submit'
                  disabled={isLoading}
                  onClick={handleSubmitRemedialAction}
                >
                  {isLoading ? 'Submitting..' : 'Submit Remedial'}
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </section>
  )
}

export {UpdateComplaintTukang}
