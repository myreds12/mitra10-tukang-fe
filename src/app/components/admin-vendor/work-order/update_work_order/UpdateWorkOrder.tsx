// React Imports
import React, {useState, useEffect, FC, SetStateAction} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {Card, Row} from 'react-bootstrap'
import Swal from 'sweetalert2'
import makeAnimated from 'react-select/animated'

// Styling Imports
import './UpdateWorkOrder.css'

// Helper Imports
import {
  formatDate,
  formatDateWithTime,
  formatDateWithTimeZone,
  formatInputDate,
} from '../../../../../_metronic/helpers'

// Type Imports
import type {WorkOrder, WorkOrderTukang} from '../../../../interfaces/work-order'
import type {Orders} from '../../../../interfaces/order'
import type {StatusStorage, OrderHistory, SessionOption, UpdateWorkVendorProps} from './types'

// Service Imports
import {
  fetchOrderByIdApi,
  fetchTukangApi,
  fetchChatTemplatesApi,
  saveWorkOrderApi,
  sendChatMessageApi,
} from './services/updateWorkOrderService'

// Component Imports
import {WorkOrderHeaderSection} from './components/WorkOrderHeaderSection'
import {WorkOrderBuyerSection} from './components/WorkOrderBuyerSection'
import {WorkOrderScheduleSection} from './components/WorkOrderScheduleSection'
import {WorkOrderInstallationTable} from './components/WorkOrderInstallationTable'
import {WorkOrderNotesActionSection} from './components/WorkOrderNotesActionSection'
import {WorkOrderRescheduleHistoryCard} from './components/WorkOrderRescheduleHistoryCard'
import {WorkOrderHistoryCard} from './components/WorkOrderHistoryCard'

const sessionOptions: SessionOption[] = [
  {value: 1, label: 'Sesi Pagi'},
  {value: 2, label: 'Sesi Siang'},
  {value: 3, label: 'Sesi Sore'},
  {value: 4, label: 'Sesi Malam'},
]

const UpdateWorkVendor: FC<UpdateWorkVendorProps> = ({updatePageTitle}) => {
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
  const [template, setTemplate] = useState<any[]>([])

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

  const [selectedSession, setSelectedSession] = useState<any>({
    value: null,
    label: 'Pilih sesi',
  })

  const workOrderHandler = (
    value: number | string | Array<number | string | null> | any | null,
    target: string,
    _setStateAction: SetStateAction<typeof setWorkOrder> = setWorkOrder
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

  const fetchOrderData = async () => {
    try {
      const response = await fetchOrderByIdApi(apiUrl, params.id)
      const data = response.data.data

      setOrderDetail(data)

      if (data?.work_orders?.id) {
        workOrderHandler(data.work_orders.id, 'id')
        setWorkOrder((prev) => ({
          ...prev,
          session: data.work_orders.session,
        }))
        setSelectedSession((prev: any) => ({
          ...prev,
          value: data?.work_orders.session,
          label: sessionOptions.find((option) => option.value === data?.work_orders?.session)?.label,
        }))
      }

      if (data?.id) {
        workOrderHandler(data.id, 'order_id')

        const orderHistory = data?.order_history.map((item: any) => ({
          status: item?.status?.description,
          created_at: item?.created_at ? formatDateWithTimeZone(item?.created_at) : '-',
          updated_by: item?.created_by?.username,
        }))

        setOrderHistory(orderHistory)
      }

      if (data?.vendor_id) {
        workOrderHandler(data.vendor_id, 'vendor_id')
      }

      if (data?.work_orders?.work_order_tukang) {
        const tukangList = data.work_orders.work_order_tukang.map((item: any) => ({
          id: item.id,
          tukang_id: item.tukang_id,
          tukang_name: item.tukang?.full_name,
          type: item.type,
        }))

        workOrderHandler(tukangList, 'tukang_id')
      }

      if (data?.request_survey) {
        workOrderHandler(formatInputDate(new Date(data.request_survey)), 'request_work_time')
      }

      if (data?.work_orders?.survey_date) {
        setWorkOrder((prev) => ({
          ...prev,
          survey_date: data.work_orders.survey_date,
        }))
      }

      if (data?.work_orders?.work_start_date) {
        setWorkOrder((prev) => ({
          ...prev,
          work_start_date: data.work_orders.work_start_date,
        }))
      }

      if (data?.work_orders?.work_end_date) {
        setWorkOrder((prev) => ({
          ...prev,
          work_end_date: data.work_orders.work_end_date,
        }))
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
    try {
      const response = await fetchTukangApi(apiUrl, vendorId, searchTukang)
      if (Array.isArray(response.data?.data)) {
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

  const getTemplate = async () => {
    try {
      const response = await fetchChatTemplatesApi(apiChat)
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

    setWorkOrder((prev) => ({
      ...prev,
      work_order_status: desiredStatus === null ? orderDetail?.status?.id : desiredStatus,
    }))
  }, [orderDetail?.status, orderDetail?.work_orders])

  useEffect(() => {
    setWorkOrder((prev) => ({
      ...prev,
      session: selectedSession?.value ?? null,
    }))
  }, [selectedSession])

  const hasWorker = (worker: WorkOrderTukang[], type: number) => {
    if (!Array.isArray(worker)) return false
    return worker.some((item) => item && item.type === type)
  }

  const validateWorkOrder = (currentWorkOrder: WorkOrder, currentOrderDetail: Orders) => {
    const errors: string[] = []
    const worker = currentWorkOrder.tukang_id || []
    const paymentType = currentOrderDetail.payment_type

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
        if (currentOrderDetail?.quotation?.length === 0) {
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
      const value = (currentWorkOrder as any)[field.key]

      if (!value || (Array.isArray(value) && value.length === 0)) {
        errors.push(`Kolom ${field.fieldName} wajib diisi.`)
      }
    })

    if (paymentType === 'survey') {
      if (currentOrderDetail.quotation?.length === 0 && !hasWorker(worker, 1)) {
        errors.push('Harap pilih minimal satu Tukang Survei.')
      } else if (currentOrderDetail.quotation?.length > 0 && !hasWorker(worker, 2)) {
        errors.push('Harap pilih minimal satu Tukang Pengerjaan.')
      }
    } else if (paymentType === 'gratis' && !hasWorker(worker, 2)) {
      errors.push('Harap pilih minimal satu Tukang Pengerjaan.')
    } else if (paymentType === 'pemasangan_tanpa_survey' && !hasWorker(worker, 2)) {
      errors.push('Harap pilih minimal satu Tukang Pengerjaan.')
    }

    return errors
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

      await sendChatMessageApi(apiChat, data, true).catch((error) => {
        console.error(error)
      })
    } else {
      const data = {
        message: filteredTemplates?.content,
        chatId: `62${orderDetail?.project_number}@c.us`,
        adminRole: userRole,
      }

      await sendChatMessageApi(apiChat, data, false).catch((error) => {
        console.error(error)
      })
    }
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
        const value = (workOrder as any)[key]

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
      const response = await saveWorkOrderApi(url, formData)

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
        text: error.response?.data?.message || 'Tidak dapat terhubung ke server.',
        icon: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id='update-work-order'>
      <Card className='mb-5'>
        <Card.Body>
          <div className='form-wrapper'>
            <WorkOrderHeaderSection orderDetail={orderDetail} />

            <Row className='d-flex flex-wrap mt-5'>
              <WorkOrderBuyerSection orderDetail={orderDetail} />

              <WorkOrderScheduleSection
                orderDetail={orderDetail}
                sessionOptions={sessionOptions}
                selectedSession={selectedSession}
                setSelectedSession={setSelectedSession}
                workOrder={workOrder}
                setWorkOrder={setWorkOrder}
                tukang={tukang}
                tukangHandler={tukangHandler}
                setSearchTukang={setSearchTukang}
                animatedComponents={animatedComponents}
              />
            </Row>
          </div>

          <WorkOrderInstallationTable orderDetail={orderDetail} formatDate={formatDate} />

          <WorkOrderNotesActionSection
            orderDetail={orderDetail}
            isLoading={isLoading}
            handleUpdateWorkOrder={handleUpdateWorkOrder}
          />
        </Card.Body>
      </Card>

      <WorkOrderRescheduleHistoryCard
        orderDetail={orderDetail}
        formatDateWithTime={formatDateWithTime}
        formatDateWithTimeZone={formatDateWithTimeZone}
        apiUrl={apiUrl || ''}
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
        visible={visible}
        handleClose={handleClose}
        visibleReschedule={visibleReschedule}
        setVisibleReschedule={setVisibleReschedule}
      />

      <WorkOrderHistoryCard OrderHistory={OrderHistory} />
    </section>
  )
}

export {UpdateWorkVendor}
export default UpdateWorkVendor
