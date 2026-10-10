import React, {FC, useState, useEffect, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import Swal from 'sweetalert2'
import {Card} from 'react-bootstrap'
import './NewReschedule.css'

import {Reschedule, Status, PaymentStage} from './types'
import {
  fetchOrdersForRescheduleApi,
  fetchOrderDetailForRescheduleApi,
  createRescheduleApi,
} from './services/newRescheduleService'
import {NewRescheduleHeaderSection} from './components/NewRescheduleHeaderSection'
import {NewRescheduleInstallationSection} from './components/NewRescheduleInstallationSection'
import {NewRescheduleVendorActivitySection} from './components/NewRescheduleVendorActivitySection'
import {NewRescheduleNotesSection} from './components/NewRescheduleNotesSection'
import {NewRescheduleFormSection} from './components/NewRescheduleFormSection'

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
    try {
      const response = await fetchOrdersForRescheduleApi(apiUrl, statuses, storeId, tukangId, search)
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
    } catch (error) {
      console.error(error)
    }
  }

  const getOrderDetail = async () => {
    try {
      const response = await fetchOrderDetailForRescheduleApi(apiUrl, selectedOrder?.value)
      setOrderDetail(response.data.data)
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
    inputField?.click()
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
    setOrderDetail(null)
    setSelectedOrder({
      value: null,
      label: 'Ketik/Pilih Order Id',
    })

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

      try {
        const response = await createRescheduleApi(apiUrl, formData)
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

  // Payment Stage
  const [paymentStages, setPaymentStages] = useState<PaymentStage[]>([
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
          <NewRescheduleHeaderSection
            orderDetail={orderDetail}
            order={order}
            setSelectedOrder={setSelectedOrder}
            setSearchOrder={setSearchOrder}
          />

          <NewRescheduleInstallationSection
            orderDetail={orderDetail}
            paymentStages={paymentStages}
          />

          <NewRescheduleVendorActivitySection orderDetail={orderDetail} />

          <NewRescheduleNotesSection orderDetail={orderDetail} />

          <NewRescheduleFormSection
            orderDetail={orderDetail}
            reschedule={reschedule}
            setReschedule={setReschedule}
            RescheduleFormHandler={RescheduleFormHandler}
            evidenceRef={evidenceRef}
            rescheduleEvidence={rescheduleEvidence}
            handleImageClick={handleImageClick}
            handleFileChange={handleFileChange}
            handleFileClick={handleFileClick}
            handleRemoveFile={handleRemoveFile}
            selectedFileIndex={selectedFileIndex}
            previewImage={previewImage}
            visible={visible}
            setVisible={setVisible}
            isLoading={isLoading}
            handleSubmitReschedule={handleSubmitReschedule}
          />
        </Card.Body>
      </Card>
    </section>
  )
}

export {NewReschedule}
