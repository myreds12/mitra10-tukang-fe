import React, {FC, useState, useEffect, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import Swal from 'sweetalert2'
import {Card} from 'react-bootstrap'
import {SingleValue} from 'react-select'

import './NewComplaint.css'
import {Complaint, CrmType, ComplaintChannel, OrderSelectOption} from './types'
import {
  fetchOrdersApi,
  fetchOrderDetailApi,
  fetchComplaintChannelsApi,
  fetchNextCodeApi,
  createComplaintApi,
} from './services/newComplaintService'
import {NewComplaintHeaderSection} from './components/NewComplaintHeaderSection'
import {NewComplaintCustomerInfo} from './components/NewComplaintCustomerInfo'
import {NewComplaintInstallationTable} from './components/NewComplaintInstallationTable'
import {NewComplaintVendorActivities} from './components/NewComplaintVendorActivities'
import {NewComplaintFormInputs} from './components/NewComplaintFormInputs'

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
  const [order, setOrder] = useState<OrderSelectOption[]>([])
  const [orderDetail, setOrderDetail] = useState<any>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<SingleValue<OrderSelectOption>>({
    value: null,
    label: 'Ketik/Pilih Order Id',
  })

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
      const response = await fetchOrdersApi(apiUrl, userRole, userStore, userVendor, searchOrder)

      if (Array.isArray(response.data?.data)) {
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
      const response = await fetchOrderDetailApi(apiUrl, selectedOrderId?.value)
      setOrderDetail(response.data?.data)
    } catch (err) {
      console.error(err)
    }
  }

  const getComplaintChannel = async () => {
    try {
      const response = await fetchComplaintChannelsApi(apiUrl)
      if (Array.isArray(response.data?.data)) {
        const tempComplaintChannel = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))
        setComplaintChannel(tempComplaintChannel)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getCode = async () => {
    try {
      const response = await fetchNextCodeApi(apiUrl)
      if (response.status === 200) {
        setComplaintCode(response.data?.data?.code)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getOrder()
  }, [searchOrder])

  useEffect(() => {
    getCode()
    getComplaintChannel()
  }, [complaintCode])

  useEffect(() => {
    if (selectedOrderId?.value) {
      getOrderDetail()
    }
  }, [selectedOrderId?.value])

  useEffect(() => {
    setComplaintForm((prev) => ({
      ...prev,
      order_id: selectedOrderId?.value ?? null,
      complaint_channel: selectedComplaintChannel?.value ?? null,
      crm_type: selectedCrmType?.value ?? 1,
    }))
  }, [selectedOrderId, selectedComplaintChannel, selectedCrmType])

  // Complaint Status
  useEffect(() => {
    const storedStatus = localStorage.getItem('statusData')
    const statusData = storedStatus ? JSON.parse(storedStatus) : []

    const desiredStatusName = 'INVESTIGATED'
    const desiredStatus = statusData.find((status: any) => status?.category === desiredStatusName)
    const statusId = desiredStatus?.value

    setComplaintForm((prev) => ({
      ...prev,
      complaint_status: statusId,
    }))
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
    inputField?.click()
  }

  const handleRemoveFile = (index: number) => {
    const newEvidances = [...complaintEvidence]
    newEvidances.splice(index, 1)
    setComplaintEvidence(newEvidances)

    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  const handleFileClick = (index: number) => {
    setPreviewImage((complaintEvidence[index] as any)?.name)
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

    setOrderDetail(null)
    setSelectedOrderId({
      value: null,
      label: 'Ketik/Pilih Order Id',
    })

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
      formData.append('type', String(complaintForm.complaint_type ?? 1))
      formData.append('crm_type', String(complaintForm.crm_type ?? 1))

      if (complaintEvidence?.length) {
        complaintEvidence.forEach((item) => {
          if (item) {
            formData.append('complaint_evidences', item, (item as any)?.name)
          }
        })
      }

      try {
        const response = await createComplaintApi(apiUrl, formData)
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
      } catch (error: any) {
        Swal.fire({
          title: 'Error',
          text: error?.response?.data?.message ?? 'Failed to submit complaint',
          icon: 'error',
        })
        setIsLoading(false)
      }
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
  }, [orderDetail?.quotation?.[0]?.quotation_grand_total])

  // Calculate Warranty Days
  const calculateWarrantyDays = (warranty: string) => {
    if (!warranty) return {workEndDate: '-', warrantyEndDate: '-', status: '-'}

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

    const todayDate = new Date()
    const status = todayDate > warrantyEnd ? 'Garansi Expired' : 'Garansi Aktif'

    return {workEndDate, warrantyEndDate, status}
  }

  const warrantyData = calculateWarrantyDays(
    orderDetail?.work_orders?.work_order_status?.[0]?.created_at
  )

  return (
    <section id='new-complaint'>
      <Card>
        <Card.Body>
          <div className='form-wrapper'>
            <NewComplaintHeaderSection
              orderDetail={orderDetail}
              complaintCode={complaintCode}
              order={order}
              selectedOrderId={selectedOrderId}
              setSelectedOrderId={setSelectedOrderId}
              setSearchOrder={setSearchOrder}
            />

            <NewComplaintCustomerInfo orderDetail={orderDetail} />
          </div>

          <NewComplaintInstallationTable
            orderDetail={orderDetail}
            paymentStages={paymentStages}
          />

          <NewComplaintVendorActivities
            orderDetail={orderDetail}
            warrantyData={warrantyData}
          />

          <hr />

          <NewComplaintFormInputs
            complaintForm={complaintForm}
            setComplaintForm={setComplaintForm}
            complaintFormHandler={complaintFormHandler}
            today={today}
            complaintChannel={complaintChannel}
            selectedComplaintChannel={selectedComplaintChannel}
            setSelectedComplaintChannel={setSelectedComplaintChannel}
            crmType={crmType}
            selectedCrmType={selectedCrmType}
            setSelectedCrmType={setSelectedCrmType}
            evidenceRef={evidenceRef}
            handleImageClick={handleImageClick}
            handleFileChange={handleFileChange}
            complaintEvidence={complaintEvidence}
            handleFileClick={handleFileClick}
            handleRemoveFile={handleRemoveFile}
            selectedFileIndex={selectedFileIndex}
            previewImage={previewImage}
            visible={visible}
            setVisible={setVisible}
            isLoading={isLoading}
            handleCancelComplaint={handleCancelComplaint}
            handleSubmitNewComplaint={handleSubmitNewComplaint}
          />
        </Card.Body>
      </Card>
    </section>
  )
}

export {NewComplaintForm}
