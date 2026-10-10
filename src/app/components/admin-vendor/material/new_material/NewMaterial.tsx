import React, {FC, useState, useEffect} from 'react'
import './NewMaterial.css'
import {SingleValue} from 'react-select'
import Swal from 'sweetalert2'
import {useNavigate} from 'react-router-dom'
import {Button, Card, Row} from 'react-bootstrap'
import {formatDateWithTime} from '../../../../../_metronic/helpers'
import {
  StatusStorage,
  WorkOrderSelect,
  Tukang,
  WorkOrders,
  WorkOrderItem,
  OrderHistory,
} from './types'
import {
  fetchWorkOrders,
  fetchWorkOrderDetail,
  fetchTukang,
  submitMaterialWorkOrder,
  formatDateTime,
  getStatusNameByCategory,
} from './services/newMaterialService'
import {NewMaterialHeaderInfo} from './components/NewMaterialHeaderInfo'
import {NewMaterialRightSideInfo} from './components/NewMaterialRightSideInfo'
import {NewMaterialItemsSection} from './components/NewMaterialItemsSection'
import {NewMaterialHistorySection} from './components/NewMaterialHistorySection'

const NewMaterialVendor: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()

  const userVendor = localStorage.getItem('vendor_id')
  const vendorId = userVendor ? `&vendor_id=${userVendor}` : null

  // Loader for Submit
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Work Order Tukang
  const [tukang, setTukang] = useState<Tukang[]>([])
  const [tukangId, setTukangId] = useState<any>()
  const [tukangName, setTukangName] = useState<string>('')

  // Work Order History
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([])
  const [workOrderDetail, setWorkOrderDetail] = useState<any>(null)

  // Work Order
  const [workOrderOption, setWorkOrderOption] = useState<WorkOrderSelect[]>([])
  const [workOrder, setWorkOrder] = useState<WorkOrders>({
    id: null,
    work_order_status: null,
    description: '',
    tukang_id: [],
    survey_date_time: '',
    work_date_time: '',
    work_start_date: '',
    work_end_date: '',
    work_order_before: [],
    work_order_after: [],
  })

  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<SingleValue<WorkOrderSelect>>({
    value: null,
    label: null,
  })

  // Update Work Order File ( Before And After )
  const [workOrderBefore, setWorkOrderBefore] = useState<Array<File | null | any>>([])
  const [workOrderAfter, setWorkOrderAfter] = useState<Array<File | null | any>>([])

  // Existing Work Order Files
  const mergedWorkOrderFiles = workOrderBefore.concat(workOrderAfter)
  const existingWorkOrderFiles = mergedWorkOrderFiles.filter(
    (item) => item !== null && !(item instanceof File) && 'id' in item && 'name' in item
  )

  // Add Work Order Item
  const [workOrderItem, setWorkOrderItem] = useState<WorkOrderItem[]>([
    {
      id: null,
      index: Date.now().toString(),
      item_name: '',
      tukang_id: null,
      tukang_name: '',
      is_user: 0,
      type: 1,
      quantity: null,
      unit: '',
    },
    {
      id: null,
      index: (Date.now() + 1).toString(),
      item_name: '',
      tukang_id: null,
      tukang_name: '',
      is_user: 0,
      type: 2,
      quantity: null,
      unit: '',
    },
  ])

  // Fetch Work Order Data
  const getWorkOrder = async () => {
    try {
      const response = await fetchWorkOrders(apiUrl, vendorId)
      if (Array.isArray(response.data.data)) {
        const tempWorkOrder = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.id,
        }))

        setWorkOrderOption(tempWorkOrder)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const getWorkOrderDetail = async () => {
    try {
      const response = await fetchWorkOrderDetail(apiUrl, selectedWorkOrderId?.value)
      const data = response.data.data

      setWorkOrderDetail(data)

      if (data) {
        const tukangList = data.work_order_tukang.map((item: any) => ({
          value: item.tukang.id,
          label: item.tukang.full_name,
          type: item.type,
        }))

        setTukangId(data.work_order_tukang[0]?.tukang?.id)
        setTukangName(data.work_order_tukang[0]?.tukang?.full_name)

        setWorkOrder((prev) => ({
          ...prev,
          id: data.id,
          description: data.work_order_status[0].description,
          survey_date_time: data.survey_date ? formatDateTime(new Date(data.survey_date)) : '',
          work_date_time: '',
          work_start_date: data.work_start_date,
          work_end_date: data.work_end_date,
          tukang_id: tukangList,
          work_order_status: data.work_order_status[0].status.id,
        }))
      }

      if (data?.work_order_evidences) {
        const initialWorkOrderFilesBefore = data.work_order_evidences
          .filter((x: any) => x.type === 2)
          .map((item: any) => ({
            id: item.id,
            name: item.evidence_location,
          }))

        setWorkOrderBefore(initialWorkOrderFilesBefore)

        const initialWorkOrderFilesAfter = data.work_order_evidences
          .filter((x: any) => x.type === 3)
          .map((item: any) => ({
            id: item.id,
            name: item.evidence_location,
          }))

        setWorkOrderAfter(initialWorkOrderFilesAfter)
      }

      // GLOBAL
      if (data?.work_order_status.length >= 3 && data?.order?.payment_type === 'survey') {
        const items = data?.work_order_status[0]?.work_order_items.map(
          (item: any, index: number) => ({
            id: item.id,
            index: (Date.now() + index).toString(),
            item_name: item?.name,
            tukang_id: item?.tukang_id ?? null,
            tukang_name: item?.tukang_name ?? null,
            unit: item?.unit,
            is_user: item?.is_customer === true ? 1 : 0,
            type: item?.type,
            quantity: item?.quantity,
          })
        )

        setWorkOrderItem(items)
      } else if (
        data?.work_order_status.length > 2 &&
        ['gratis', 'pemasangan_tanpa_survey'].includes(data?.order?.payment_type)
      ) {
        const items = data?.work_order_status[0]?.work_order_items.map(
          (item: any, index: number) => ({
            id: item.id,
            index: (Date.now() + index).toString(),
            item_name: item?.name,
            tukang_id: item?.tukang_id ?? null,
            tukang_name: item?.tukang_name ?? null,
            unit: item?.unit,
            is_user: item?.is_customer === true ? 1 : 0,
            type: item?.type,
            quantity: item?.quantity,
          })
        )

        setWorkOrderItem(items)
      } else if (
        data?.work_order_status?.length >= 1 &&
        data?.order?.payment_type === 'survey'
      ) {
        const items = data?.order?.m_order_details.map((item: any, index: number) => ({
          id: item.id,
          index: (Date.now() + index).toString(),
          item_name: item.item_name ?? '',
          unit: item?.unit ?? '',
          is_user: item.is_customer ? 1 : 0,
          type: 2,
          quantity: item?.quantity ?? 0,
        }))

        const workOrderItemMaterial = [
          {
            id: null,
            index: (Date.now() + items.length).toString(),
            item_name: '',
            tukang_id: null,
            tukang_name: '',
            is_user: 0,
            type: 1,
            quantity: null,
            unit: '',
          },
        ]

        setWorkOrderItem(items.concat(workOrderItemMaterial))
      } else if (
        (data?.work_order_status?.length >= 1 || data?.work_order_status?.length <= 2) &&
        ['gratis', 'pemasangan_tanpa_survey'].includes(data?.order?.payment_type)
      ) {
        const items = data?.order?.m_order_details.map((item: any, index: number) => ({
          id: item.id,
          index: (Date.now() + index).toString(),
          item_name: item.item_name ?? '',
          unit: item?.unit ?? '',
          is_user: item.is_customer ? 1 : 0,
          type: 2,
          quantity: item?.quantity ?? 0,
        }))

        const workOrderItemMaterial = [
          {
            id: null,
            index: (Date.now() + items.length).toString(),
            item_name: '',
            tukang_id: null,
            tukang_name: '',
            is_user: 0,
            type: 1,
            quantity: null,
            unit: '',
          },
        ]

        setWorkOrderItem(items.concat(workOrderItemMaterial))
      }

      if (data?.work_order_status) {
        const workOrderHistoryData = data?.order?.order_history.map((item: any) => ({
          status: item?.status?.description,
          created_at: item?.created_at ? formatDateWithTime(item?.created_at) : '-',
          updated_by: item?.created_by?.username,
        }))

        setOrderHistory(workOrderHistoryData)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getTukang = async () => {
    try {
      const response = await fetchTukang(apiUrl)

      if (Array.isArray(response.data.data)) {
        const tempTukang = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.full_name,
        }))

        setTukang(tempTukang)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getWorkOrder()
    getTukang()
  }, [])

  // Filter Work Order Status
  useEffect(() => {
    const storedStatus = localStorage.getItem('statusData')
    const statusData: Array<StatusStorage> = storedStatus ? JSON.parse(storedStatus) : []

    const status = getStatusNameByCategory(workOrderDetail?.work_order_status[0]?.status?.category)
    const desiredStatus =
      statusData.find((statuses: StatusStorage) => statuses.category === status)?.value ?? null

    setWorkOrder((prev) => ({
      ...prev,
      work_order_status: desiredStatus,
    }))
  }, [workOrderDetail?.work_order_status?.[0]?.status?.category])

  // Selected Work Order ID
  useEffect(() => {
    if (selectedWorkOrderId && selectedWorkOrderId.value !== null) {
      getWorkOrderDetail()
    }
  }, [selectedWorkOrderId])

  // Form Handler
  const workOrderHandler = (
    value: number | string | Array<number | string | null> | any | null,
    target: string
  ) => {
    setWorkOrder((prev) => ({...prev, [target]: value}))
  }

  const handleAddForm = (type: number) => {
    const newForm = {
      id: null,
      index: Date.now().toString(),
      item_name: '',
      tukang_id: null,
      tukang_name: '',
      is_user: 0,
      type: type,
      quantity: null,
      unit: '',
    }

    setWorkOrderItem((prev) => [...prev, newForm])
  }

  const handleRemoveForm = (index: any) => {
    setWorkOrderItem((prev) => {
      const updatedValues = [...prev]
      const typeIndex = updatedValues.findIndex((item) => item.index === index)

      if (typeIndex !== -1) {
        updatedValues.splice(typeIndex, 1)
      }

      return updatedValues
    })
  }

  // Handle Checkbox Change
  const handleCheckboxChange = (index: any, isChecked: boolean) => {
    const updatedMaterialValues = [...workOrderItem]
    const elementIndex = updatedMaterialValues.findIndex((item) => item.index === index)
    if (elementIndex !== -1) {
      updatedMaterialValues[elementIndex].is_user = isChecked ? 1 : 0
    }

    setWorkOrderItem(updatedMaterialValues)
  }

  // Handle Item Name Change
  const handleItemNameChange = (index: any, value: any, type: number) => {
    const updatedMaterialValues = [...workOrderItem]
    const filteredMaterialValues = updatedMaterialValues.filter((x) => x.type === type)

    if (filteredMaterialValues[index]) {
      filteredMaterialValues[index] = {
        ...filteredMaterialValues[index],
        item_name: value,
      }

      setWorkOrderItem((prev) =>
        prev.map((element) => (element.type === type ? filteredMaterialValues.shift()! : element))
      )
    }
  }

  // Handle Quantity Change
  const handleQuantityChange = (index: any, value: any, type: number) => {
    const updatedMaterialValues = [...workOrderItem]
    const elementIndex = updatedMaterialValues.findIndex((item) => item.index === index)

    if (elementIndex !== -1) {
      updatedMaterialValues[elementIndex].quantity = value
    }

    setWorkOrderItem(updatedMaterialValues)
  }

  // Handle Unit Change
  const handleSatuanChange = (index: any, value: any, type: number) => {
    const updatedMaterialValues = [...workOrderItem]
    const elementIndex = updatedMaterialValues.findIndex((item) => item.index === index)

    if (elementIndex !== -1) {
      updatedMaterialValues[elementIndex].unit = value
    }

    setWorkOrderItem(updatedMaterialValues)
  }

  const workOrderValidation = () => {
    let valid = true

    if (workOrderBefore.length === 0) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong Isi Upload Foto Sebelum',
        icon: 'warning',
      })
      valid = false
    } else if (
      workOrderAfter.length === 0 &&
      [
        'SURVEYSTART',
        'SURVEYDONE',
        'WORKSTART',
        'WORKEND',
        'REWORKSTART',
        'REWORKEND',
        'WORKDONE',
        'DONE',
      ].includes(workOrderDetail?.work_order_status[0]?.status?.category)
    ) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong Isi Upload Foto Sesudah',
        icon: 'warning',
      })
      valid = false
    } else if (
      workOrderItem.filter((x) => x.type === 2).some((x) => x.item_name === '') &&
      ['SURVEYSTART', 'SURVEYDONE'].includes(
        workOrderDetail?.work_order_status[0]?.status?.category
      )
    ) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong Isi Item Jasa Pemasangan',
        icon: 'warning',
      })
      valid = false
    } else if (
      workOrderItem.filter((x) => x.type === 2).some((x) => x.quantity === null) &&
      ['SURVEYSTART', 'SURVEYDONE'].includes(
        workOrderDetail?.work_order_status[0]?.status?.category
      )
    ) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong Isi Quantity',
        icon: 'warning',
      })
      valid = false
    }

    return valid
  }

  // Update Work Order
  const handleUpdateWorkOrder = async () => {
    if (!workOrderValidation()) {
      setIsLoading(false)
      return false
    }

    const formData = new FormData()
    setIsLoading(true)

    // Work Order Detail
    formData.append('status_id', String(workOrder?.work_order_status))
    formData.append('description', workOrder.description)

    if (workOrder.work_date_time !== '') {
      formData.append('work_date_time', workOrder.survey_date_time)
    }

    if (workOrder.work_start_date) {
      formData.append('work_start_date', workOrder.work_start_date)
    }

    if (workOrder.work_end_date) {
      formData.append('work_end_date', workOrder.work_end_date)
    }

    if (workOrderBefore?.length) {
      workOrderBefore.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`work_order_before`, item, (item as any)?.name)
        }
      })
    }

    if (existingWorkOrderFiles?.length) {
      existingWorkOrderFiles.forEach((item: any, index: number) => {
        if (item.id) {
          formData.append(
            `existing_work_order_evidences[${index}][work_order_evidence_id]`,
            item.id
          )
        }
      })
    }

    if (workOrderAfter?.length) {
      workOrderAfter.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`work_order_after`, item, (item as any)?.name)
        }
      })
    }

    // Work Order Item
    if (workOrderItem) {
      workOrderItem.forEach((order, index) => {
        if (order.id && order.item_name !== '') {
          formData.append(`work_order_items[${index}][id]`, order.id.toString())
        }

        if (order.item_name !== '') {
          formData.append(`work_order_items[${index}][type]`, order.type.toString())
          formData.append(`work_order_items[${index}][item_name]`, order.item_name)
          formData.append(`work_order_items[${index}][is_customer]`, order.is_user.toString())

          if (tukangId !== null && tukangId !== undefined) {
            formData.append(`work_order_items[${index}][tukang_id]`, tukangId)
          }

          if (tukangName !== '') {
            formData.append(`work_order_items[${index}][tukang_name]`, tukangName)
          }
        }

        if (order.unit !== '') {
          formData.append(`work_order_items[${index}][unit]`, order.unit)
        }

        if (order.quantity && order.item_name !== '') {
          formData.append(`work_order_items[${index}][quantity]`, order.quantity.toString())
        }
      })
    }

    try {
      const response = await submitMaterialWorkOrder(apiUrl, workOrder.id, formData)
      if (response.data.status === 201 || response.data.status === 200) {
        Swal.fire({
          title: 'Success',
          text: 'Work Order Updated',
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

      navigate('/work-order/view-work-order')
    } catch (error: any) {
      setIsLoading(false)
      Swal.fire({
        title: 'Error',
        text: error?.response?.data?.message,
        icon: 'error',
      })
    }
  }

  // Category Statuses
  const notAssignedStatuses = ['SURVEYREQ', 'WORKREQ']
  const complaintStatuses = [
    'CANCEL',
    'WARRANTYCLAIM',
    'INVESTIGATED',
    'COMPLAINTAPPROVEDBYHO',
    'COMPLAINTREJECTEDBYHO',
    'REFUND',
    'REFUNDAPPROVEDBYHO',
    'REFUNDREJECTEDBYHO',
  ]
  const completedStatuses = [
    'SURVEYREQ',
    'WORKREQ',
    'SURVEYDONE',
    'WORKEND',
    'WORKENDSTEPONE',
    'WORKENDSTEPTWO',
    'WORKENDSTEPTHREE',
    'QUOTEIN',
    'QUOTATIONPAID',
    'QUOTATIONPAIDSTEPONE',
    'QUOTATIONPAIDSTEPTWO',
    'QUOTATIONPAIDSTEPTHREE',
    'QUOTEOUT',
  ]

  const isNotAssigned = notAssignedStatuses.includes(workOrderDetail?.order?.status?.category)
  const isComplaint = complaintStatuses.includes(workOrderDetail?.order?.status?.category)
  const isCompleted = completedStatuses.includes(workOrderDetail?.order?.status?.category)

  // Button Conditional Props
  const getButtonProps = () => {
    if (isNotAssigned) {
      return {label: 'Order ini belum ditugaskan tukangnya', disabled: true, variant: 'warning'}
    }
    if (isComplaint) {
      return {label: 'Order ini dalam status komplain', disabled: true, variant: 'dark-danger'}
    }
    if (isCompleted) {
      return {
        label: 'Order ini sudah selesai survei/pengerjaan',
        disabled: true,
        variant: 'dark-success',
      }
    }
    return {
      label: isLoading ? 'Loading..' : 'Update Pengerjaan',
      disabled: isLoading,
      onClick: handleUpdateWorkOrder,
      variant: 'dark-primary',
    }
  }
  const {label, disabled, onClick, variant} = getButtonProps()

  return (
    <section id='new-material'>
      <Card className='mb-5'>
        <Card.Body>
          <Row>
            <NewMaterialHeaderInfo
              apiUrl={apiUrl}
              workOrderDetail={workOrderDetail}
              workOrderOption={workOrderOption}
              selectedWorkOrderId={selectedWorkOrderId}
              setSelectedWorkOrderId={setSelectedWorkOrderId}
              description={workOrder.description}
              onDescriptionChange={(val) => workOrderHandler(val, 'description')}
              workOrderBefore={workOrderBefore}
              setWorkOrderBefore={setWorkOrderBefore}
              workOrderAfter={workOrderAfter}
              setWorkOrderAfter={setWorkOrderAfter}
            />

            <NewMaterialRightSideInfo workOrderDetail={workOrderDetail} />
          </Row>

          <NewMaterialItemsSection
            workOrderDetail={workOrderDetail}
            workOrderItem={workOrderItem}
            handleItemNameChange={handleItemNameChange}
            handleQuantityChange={handleQuantityChange}
            handleSatuanChange={handleSatuanChange}
            handleCheckboxChange={handleCheckboxChange}
            handleRemoveForm={handleRemoveForm}
            handleAddForm={handleAddForm}
          />

          <Row>
            <div className='d-flex justify-content-center align-items-center'>
              <Button
                className='d-flex justify-content-center align-items-center m-0'
                type='submit'
                disabled={disabled}
                onClick={onClick}
                variant={variant}
              >
                {label}
              </Button>
            </div>
          </Row>
        </Card.Body>
      </Card>

      <NewMaterialHistorySection orderHistory={orderHistory} />
    </section>
  )
}

export {NewMaterialVendor}
