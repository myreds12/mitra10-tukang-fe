import React, {FC, useState, useEffect, useRef} from 'react'
import {WorkOrder} from '../../../../interfaces/work-order'
import axiosInstance from '../../../../../_metronic/layout/core/axiosInterceptor'
import {formatDateWithTimeZone} from '../../../../../_metronic/helpers'
import './UpdateWorkOrder.css'
import axios from 'axios'
import Swal from 'sweetalert2'
import {Skeleton} from 'antd'
import {useNavigate, useParams} from 'react-router-dom'
import {Button, Card, Row} from 'react-bootstrap'
import {StatusStorage, WorkOrders, WorkOrderItem, OrderHistory} from './types'
import {formatDateTime, getStatusNameByCategory} from './utils/workOrderHelpers'
import {sendWorkOrderWA} from './services/workOrderService'
import {WorkOrderInfoSection} from './components/WorkOrderInfoSection'
import {WorkOrderEvidencesSection} from './components/WorkOrderEvidencesSection'
import {WorkOrderItemsSection} from './components/WorkOrderItemsSection'
import {WorkOrderHistoryCard} from './components/WorkOrderHistoryCard'

const UpdateWorkTukang: FC<{updatePageTitle: (work_order: WorkOrder) => void}> = ({
  updatePageTitle,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const params = useParams()
  const tukangId = localStorage.getItem('tukang_id')
  const tukangName = localStorage.getItem('tukangName') as string

  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Work Order Detail
  const [workOrderDetail, setWorkOrderDetail] = useState<any>(null)

  // Work Order History
  const [OrderHistory, setOrderHistory] = useState<OrderHistory[]>([])

  // Update Work Order
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

  // Update Work Order File ( Before And After )
  const [workOrderBefore, setWorkOrderBefore] = useState<Array<File | null>>([])
  const [workOrderAfter, setWorkOrderAfter] = useState<Array<File | null>>([])

  // Existing Work Order Files
  const mergedWorkOrderFiles = workOrderBefore.concat(workOrderAfter)
  const existingWorkOrderFiles = mergedWorkOrderFiles.filter(
    (item) => item !== null && !(item instanceof File) && 'id' in item && 'name' in item
  )

  const [selectedWorkBeforeFile, setSelectedWorkBeforeFile] = useState<number | null>(null)
  const [selectedWorkAfterFile, setSelectedWorkAfterFile] = useState<number | null>(null)

  const [previewWorkBeforeImage, setPreviewWorkBeforeImage] = useState<any>()
  const [previewWorkAfterImage, setPreviewWorkAfterImage] = useState<any>()

  const evidenceRef = useRef<HTMLInputElement>(null)

  const [visibleWorkBefore, setVisibleWorkBefore] = useState(false)
  const [visibleWorkAfter, setVisibleWorkAfter] = useState(false)

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

  // Fetch Data
  const getWorkOrderData = async () => {
    try {
      await axiosInstance
        .get(`${apiUrl}/work-orders/${params.id}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })
        .then((response) => {
          const data = response.data.data

          setWorkOrderDetail(data)
          setIsLoadingPage(false)

          if (data) {
            const tukang = data.work_order_tukang.map((item: any) => ({
              value: item.tukang_id,
              label: item.tukang.full_name,
              type: item.type,
            }))

            setWorkOrder((prev) => ({
              ...prev,
              id: data.id,
              description: data.work_order_status[0].description,
              survey_date_time: data.survey_date ? formatDateTime(new Date(data.survey_date)) : '',
              work_date_time: '',
              work_start_date: data.work_start_date,
              work_end_date: data.work_end_date,
              tukang_id: tukang,
              work_order_status: data.order.status.description,
            }))
          }

          if (data?.work_order_evidences) {
            const initialWorkOrderFiles = data.work_order_evidences
              .filter((x: any) => x.type === 2)
              .map((item: any) => ({
                id: item.id,
                name: item.evidence_location,
              }))

            setWorkOrderBefore(initialWorkOrderFiles)
          }

          if (data?.work_order_evidences) {
            const initialWorkOrderFiles = data.work_order_evidences
              .filter((x: any) => x.type === 3)
              .map((item: any) => ({
                id: item.id,
                name: item.evidence_location,
              }))

            setWorkOrderAfter(initialWorkOrderFiles)
          }

          // GLOBAL
          if (
            data?.work_order_status[0].work_order_items.length >= 1 &&
            data?.order?.payment_type === 'survey'
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
            data?.work_order_status[0].work_order_items.length === 0 &&
            data?.order?.payment_type === 'survey'
          ) {
            const items = data?.order?.m_order_details.map((item: any, index: number) => ({
              id: null,
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
              order_id: item?.order_id,
              status: item?.status?.description,
              created_at: item?.created_at ? formatDateWithTimeZone(item?.created_at) : '-',
              updated_by: item?.created_by?.username,
            }))

            setOrderHistory(workOrderHistoryData)
          }

          updatePageTitle(data)
        })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getWorkOrderData()
    // eslint-disable-next-line
  }, [])

  // Work Order Form Handler
  const workOrderHandler = (
    value: number | string | Array<number | string | null> | any | null,
    target: string
  ) => {
    setWorkOrder((prev) => ({...prev, [target]: value}))
  }

  // Work Order Item Form Handler
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

  // Handle File ( Before ) Change
  const handleFileWorkBefore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...workOrderBefore]
      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setWorkOrderBefore(mergedFiles)
    }
  }

  const handleImageWorkBeforeClick = () => {
    const inputField = document.querySelector('.work-before-image') as HTMLInputElement
    inputField?.click()
  }

  const handleFileWorkBeforeClick = (index: number) => {
    setPreviewWorkBeforeImage(workOrderBefore[index]?.name)
    setVisibleWorkBefore(true)
    setSelectedWorkBeforeFile(index)
  }

  const handleRemoveWorkBeforeFile = (index: number) => {
    const newEvidances = [...workOrderBefore]
    newEvidances.splice(index, 1)
    setWorkOrderBefore(newEvidances)

    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  // Handle File ( After ) Change
  const handleFileWorkAfter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...workOrderAfter]
      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setWorkOrderAfter(mergedFiles)
    }
  }

  const handleImageWorkAfterClick = () => {
    const inputField = document.querySelector('.work-after-image') as HTMLInputElement
    inputField?.click()
  }

  const handleFileWorkAfterClick = (index: number) => {
    setPreviewWorkAfterImage(workOrderAfter[index]?.name)
    setVisibleWorkAfter(true)
    setSelectedWorkAfterFile(index)
  }

  const handleRemoveWorkAfterFile = (index: number) => {
    const newEvidances = [...workOrderAfter]
    newEvidances.splice(index, 1)
    setWorkOrderAfter(newEvidances)

    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

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
    // eslint-disable-next-line
  }, [workOrderDetail?.work_order_status[0]?.status?.category, workOrder.work_order_status])

  // Validasi Upload Foto Sebelum
  const WorkOrderValidation = () => {
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
    if (!WorkOrderValidation()) {
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
          formData.append(`work_order_before`, item, item?.name)
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
          formData.append(`work_order_after`, item, item?.name)
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

          if (tukangId !== null) {
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

    await axios
      .post(`${apiUrl}/work-orders/${workOrder.id}/set-materials`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then((response) => {
        if (response.data.status === 201 || response.data.status === 200) {
          if (
            workOrderDetail?.order?.status?.category === 'SURVEYSTART' ||
            workOrderDetail?.order?.status?.category === 'TUKANGWORK' ||
            workOrderDetail?.order?.status?.category === 'WORKSTART'
          ) {
            sendWorkOrderWA(workOrderDetail, window.location.origin)
          }
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

  const fetchOrderData = async () => {
    try {
      await axios.get(`${apiUrl}/orders/${params.id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
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

  const fetchEmailData = async () => {
    try {
      await axios.get(`${apiUrl}/mails`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        params: {
          order_by: 'asc',
          type_email_message: 1,
        },
      })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchOrderData()
    fetchEmailData()
    // eslint-disable-next-line
  }, [])

  return (
    <section id='update-work-order-tukang'>
      <Card className='mb-5'>
        <Card.Body>
          <WorkOrderInfoSection
            isLoadingPage={isLoadingPage}
            workOrderDetail={workOrderDetail}
            workOrder={workOrder}
            workOrderHandler={workOrderHandler}
            evidencesSection={
              <WorkOrderEvidencesSection
                workOrderDetail={workOrderDetail}
                workOrderBefore={workOrderBefore}
                workOrderAfter={workOrderAfter}
                evidenceRef={evidenceRef}
                handleImageWorkBeforeClick={handleImageWorkBeforeClick}
                handleFileWorkBefore={handleFileWorkBefore}
                handleFileWorkBeforeClick={handleFileWorkBeforeClick}
                handleRemoveWorkBeforeFile={handleRemoveWorkBeforeFile}
                selectedWorkBeforeFile={selectedWorkBeforeFile}
                previewWorkBeforeImage={previewWorkBeforeImage}
                visibleWorkBefore={visibleWorkBefore}
                setVisibleWorkBefore={setVisibleWorkBefore}
                handleImageWorkAfterClick={handleImageWorkAfterClick}
                handleFileWorkAfter={handleFileWorkAfter}
                handleFileWorkAfterClick={handleFileWorkAfterClick}
                handleRemoveWorkAfterFile={handleRemoveWorkAfterFile}
                selectedWorkAfterFile={selectedWorkAfterFile}
                previewWorkAfterImage={previewWorkAfterImage}
                visibleWorkAfter={visibleWorkAfter}
                setVisibleWorkAfter={setVisibleWorkAfter}
                apiUrl={apiUrl}
              />
            }
          />

          <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
            <WorkOrderItemsSection
              workOrderDetail={workOrderDetail}
              workOrderItem={workOrderItem}
              handleAddForm={handleAddForm}
              handleRemoveForm={handleRemoveForm}
              handleCheckboxChange={handleCheckboxChange}
              handleItemNameChange={handleItemNameChange}
              handleQuantityChange={handleQuantityChange}
              handleSatuanChange={handleSatuanChange}
            />
          </Skeleton>

          <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
            <Row>
              {workOrderDetail?.work_order_status?.length > 1 &&
              workOrderDetail?.work_order_status[0]?.status?.category === 'WORKEND' ? (
                <div className='d-flex justify-content-center align-items-center'>
                  <Button
                    className='btn-done d-flex justify-content-center align-items-center'
                    type='submit'
                    disabled
                  >
                    Order Ini Pengerjaannya Telah Selesai
                  </Button>
                </div>
              ) : (
                <div className='d-flex justify-content-center align-items-center mt-5'>
                  <Button
                    className='d-flex justify-content-center align-items-center m-0'
                    variant='dark-primary'
                    type='submit'
                    disabled={isLoading}
                    onClick={handleUpdateWorkOrder}
                  >
                    {isLoading ? 'Submitting Order...' : 'Save'}
                  </Button>
                </div>
              )}
            </Row>
          </Skeleton>
        </Card.Body>
      </Card>

      <WorkOrderHistoryCard isLoadingPage={isLoadingPage} orderHistory={OrderHistory} />
    </section>
  )
}

export {UpdateWorkTukang}
