import React, {FC, useState, useEffect, useRef} from 'react'
import {WorkOrder} from '../../../../interfaces/work-order'
import axiosInstance from '../../../../../_metronic/layout/core/axiosInterceptor'
import {
  formatDate,
  formatDateWithTime,
  formatDateWithTimeZone,
} from '../../../../../_metronic/helpers'

import './UpdateWorkOrder.css'

import axios from 'axios'
import Swal from 'sweetalert2'
import {Image, Steps, Skeleton} from 'antd'
import {useNavigate, useParams} from 'react-router-dom'
import {Form, Button, Card, Row, Col, ListGroup} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faFileArrowUp} from '@fortawesome/free-solid-svg-icons'

interface StatusStorage {
  value: number
  category: string
  description: string
}

interface WorkOrders {
  id: number | null
  work_order_status: number | null
  description: string
  tukang_id: Array<any>
  survey_date_time: string
  work_date_time: string
  work_start_date: string
  work_end_date: string
  work_order_before: Array<any>
  work_order_after: Array<any>
}

interface WorkOrderItem {
  id: number | null
  index: string
  item_name: string
  tukang_id: number | null
  tukang_name: string
  is_user: number
  type: number
  quantity: number | null
  unit: string
}

interface OrderHistory {
  order_id: number
  status: string
  created_at: string
  updated_by: string
}

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
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
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
            const workOrderItem = data?.work_order_status[0]?.work_order_items.map(
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

            setWorkOrderItem(workOrderItem)
          } else if (
            data?.work_order_status.length > 2 &&
            ['gratis', 'pemasangan_tanpa_survey'].includes(data?.order?.payment_type)
          ) {
            const workOrderItem = data?.work_order_status[0]?.work_order_items.map(
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

            setWorkOrderItem(workOrderItem)
          } else if (
            data?.work_order_status[0].work_order_items.length === 0 &&
            data?.order?.payment_type === 'survey'
          ) {
            const workOrderItem = data?.order?.m_order_details.map((item: any, index: number) => ({
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
                index: (Date.now() + workOrderItem.length).toString(),
                item_name: '',
                tukang_id: null,
                tukang_name: '',
                is_user: 0,
                type: 1,
                quantity: null,
                unit: '',
              },
            ]

            const mergedWorkOrderItem = workOrderItem.concat(workOrderItemMaterial)
            setWorkOrderItem(mergedWorkOrderItem)
          } else if (
            (data?.work_order_status?.length >= 1 || data?.work_order_status?.length <= 2) &&
            ['gratis', 'pemasangan_tanpa_survey'].includes(data?.order?.payment_type)
          ) {
            const workOrderItem = data?.order?.m_order_details.map((item: any, index: number) => ({
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
                index: (Date.now() + workOrderItem.length).toString(),
                item_name: '',
                tukang_id: null,
                tukang_name: '',
                is_user: 0,
                type: 1,
                quantity: null,
                unit: '',
              },
            ]

            const mergedWorkOrderItem = workOrderItem.concat(workOrderItemMaterial)
            setWorkOrderItem(mergedWorkOrderItem)
          }

          if (data?.work_order_status) {
            const workOrderHistoryData = data?.order?.order_history.map((item: any) => {
              return {
                status: item?.status?.description,
                created_at: item?.created_at ? formatDateWithTimeZone(item?.created_at) : '-',
                updated_by: item?.created_by?.username,
              }
            })

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

  // Format Date
  const formatDateTime = (date: any) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
  }

  // Hashing key
  const stringToHash = (string: string) => {
    let hash = 0

    if (string.length === 0) return hash

    for (let i = 0; i < string.length; i++) {
      const char = string.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }

    return hash
  }

  // Work Order Form Handler
  const workOrderHandler = (
    value: number | string | Array<number | string | null> | any | null,
    target: string
  ) => {
    setWorkOrder((prev) => {
      const cache = {...prev, [target]: value}
      return cache
    })
  }

  // const tukangHandler = (selectedOptions: any, field: any) => {
  //   const type = field === 'survey_tukang_id' ? 1 : 2

  //   setWorkOrder((prevWorkOrder) => {
  //     const updatedTukang = selectedOptions.map((option: any) => ({
  //       ...option,
  //       type: type,
  //     }))

  //     const filteredTukang = prevWorkOrder.tukang_id.filter((x: any) => x.type !== type)
  //     const mergedTukang = [...filteredTukang, ...updatedTukang]

  //     return {
  //       ...prevWorkOrder,
  //       tukang_id: mergedTukang,
  //     }
  //   })
  // }

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
      updatedMaterialValues[elementIndex] = {
        ...updatedMaterialValues[elementIndex],
        quantity: value,
      }
    }

    setWorkOrderItem(updatedMaterialValues)
  }

  // Handle Unit Change
  const handleSatuanChange = (index: any, value: any, type: number) => {
    const updatedMaterialValues = [...workOrderItem]
    const elementIndex = updatedMaterialValues.findIndex((item) => item.index === index)

    if (elementIndex !== -1) {
      updatedMaterialValues[elementIndex] = {
        ...updatedMaterialValues[elementIndex],
        unit: value,
      }
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
    inputField.click()
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

    // Update element value
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
    inputField.click()
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

    // Update element value
    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  useEffect(() => {
    const storedStatus = localStorage.getItem('statusData')
    const statusData: Array<StatusStorage> = storedStatus ? JSON.parse(storedStatus) : []

    const getStatusNameByCategory = (category: string) => {
      switch (category) {
        case 'SURVEYREQ':
          return 'SURVEYSTART'
        case 'TUKANGSURVEY':
          return 'SURVEYSTART'
        case 'SURVEYSTART':
          return 'SURVEYDONE'
        case 'SURVEYDONE':
          return 'SURVEYDONE'
        case 'RESURVEYREQ':
          return 'RETUKANGSURVEY'
        case 'RETUKANGSURVEY':
          return 'RESURVEYSTART'
        case 'RESURVEYSTART':
          return 'RESURVEYDONE'
        case 'RESURVEYDONE':
          return 'RESURVEYDONE'
        case 'WORKREQ':
          return 'WORKSTART'
        case 'TUKANGWORK':
          return 'WORKSTART'
        case 'WORKSTART':
          return 'WORKEND'
        case 'REWORKREQ':
          return 'RETUKANGWORK'
        case 'RETUKANGWORK':
          return 'REWORKSTART'
        case 'REWORKSTART':
          return 'REWORKEND'
        case 'REWORKEND':
          return 'REWORKEND'
        case 'TUKANGWORKSTEPONE':
          return 'WORKSTARTSTEPONE'
        case 'WORKSTARTSTEPONE':
          return 'WORKENDSTEPONE'
        case 'TUKANGWORKSTEPTWO':
          return 'WORKSTARTSTEPTWO'
        case 'WORKSTARTSTEPTWO':
          return 'WORKENDSTEPTWO'
        case 'TUKANGWORKSTEPTHREE':
          return 'WORKSTARTSTEPTHREE'
        case 'WORKSTARTSTEPTHREE':
          return 'WORKENDSTEPTHREE'
        default:
          return null
      }
    }

    const status = getStatusNameByCategory(workOrderDetail?.work_order_status[0]?.status?.category)
    const desiredStatus =
      statusData.find((statuses: StatusStorage) => statuses.category === status)?.value ?? null

    setWorkOrder({
      ...workOrder,
      work_order_status: desiredStatus,
    })
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

    // if (workOrder.tukang_id) {
    //   workOrder.tukang_id.map((item) => {
    //     formData.append(`tukang_id`, item?.value)
    //     formData.append(`tukang_type`, item?.type)
    //   })
    // }

    if (workOrderBefore?.length) {
      workOrderBefore.forEach((item, index) => {
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
      workOrderAfter.forEach((item, index) => {
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
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })
      .then((response) => {
        if (response.data.status === 201 || response.data.status === 200) {
          if(workOrderDetail?.order?.status?.category === 'SURVEYSTART' 
            || workOrderDetail?.order?.status?.category === 'TUKANGWORK'
            || workOrderDetail?.order?.status?.category === 'WORKSTART'
          )
          {  
            sentWA();
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

  const API_BASE = process.env.REACT_APP_WA_BACKEND_API_URL
  const [emailDetail, setEmailDetail] = useState<any>()
  const [orderDetail, setOrderDetail] = useState<any>({})
  const [headerImg, setHeaderImg] = useState<any>()
  const [footerImg, setFooterImg] = useState<any>()
  const fetchOrderData = async () => {
      try {
        await axios
          .get(`${apiUrl}/orders/${params.id}`, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              // 'Access-Control-Allow-Origin': '*',
             // 'ngrok-skip-browser-warning':  'true',
            },
          })
          .then((response) => {
            const data = response.data.data
  
            setOrderDetail(data)
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
        await axios
          .get(`${apiUrl}/mails`, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              // 'Access-Control-Allow-Origin': '*',
             // 'ngrok-skip-browser-warning':  'true',
            },
            params: {
              order_by: 'asc',
              type_email_message: 1,
            },
          })
          .then((response) => {
            const data = response.data.data.data[1]
            setEmailDetail(data)
  
            setHeaderImg(
              apiUrl +
                '/public/mails-image/' +
                data.email_message_image.filter((item: any) => item.type === 1)[0]?.path
            )
  
            setFooterImg(
              apiUrl +
                '/public/mails-image/' +
                data.email_message_image.filter((item: any) => item.type === 2)[0]?.path
            )
          })
      } catch (error) {
        console.error(error)
      }
    }
  const sentWA = async () => {
      
      // ==================================
      // === TEMPLATE INVOICE WHATSAPP ===
      // ==================================
      // Final WhatsApp Message
      let invoiceMessage = ``;
      let iamgeIcon = '';
      if(
        workOrderDetail?.order?.status?.category === 'SURVEYSTART'
      ){  
        iamgeIcon = await urlToBase64(window.location.origin + "/media/JASA_INSTALASI_2_CSI_PEKERJAAN.jpg");
      invoiceMessage = `
Hi *${workOrderDetail?.order?.members?.full_name || "-"}*, terima kasih telah menggunakan layanan instalasi Mitra10.

📍 Survey lokasi untuk order Anda *telah selesai dilakukan* oleh tim kami.

Untuk membantu kami meningkatkan kualitas layanan, mohon kesediaannya untuk mengisi:
📝 *Survei Kepuasan Pelanggan (CSI)*  
Melalui link berikut: https://forms.gle/YJfkjJqDNDN5ekyK8 

Masukan Anda sangat berarti agar kami dapat memberikan pelayanan yang lebih baik lagi ke depannya 😊

Terima kasih atas waktu dan kepercayaan Anda kepada *Mitra10* 🙏
`;
      }
      else if(workOrderDetail?.order?.status?.category === 'WORKSTART'){
          iamgeIcon = await urlToBase64(window.location.origin + "/media/JASA_INSTALASI_2_CSI_PEKERJAAN.jpg");
          invoiceMessage = `
    Hi *${workOrderDetail?.order?.members?.full_name || "-"}*, terima kasih telah menggunakan layanan instalasi Mitra10.

    📍 Pekerjaan lAnda *telah selesai dilakukan* oleh tim kami.

    Untuk membantu kami meningkatkan kualitas layanan, mohon kesediaannya untuk mengisi:
    📝 *Survei Kepuasan Pelanggan (CSI)*  
    Melalui link berikut: https://forms.gle/YJfkjJqDNDN5ekyK8 

    Masukan Anda sangat berarti agar kami dapat memberikan pelayanan yang lebih baik lagi ke depannya 😊

    Terima kasih atas waktu dan kepercayaan Anda kepada *Mitra10* 🙏
    `;
      }
      else if (workOrderDetail?.order?.status?.category === 'TUKANGWORK'){
invoiceMessage = `
Hi *${workOrderDetail?.order?.members?.full_name || "-"}*,

Kami informasikan bahwa tim teknisi Instalasi Mitra10 telah *memulai pengerjaan* sesuai pesanan Anda.

Mohon pastikan area kerja dapat diakses dengan baik dan bebas dari barang pribadi, perabot, atau benda pecah belah, agar pengerjaan berjalan lancar. 🙏

⚠️ Kerusakan atau kehilangan pada barang pribadi/perabot di area kerja menjadi tanggung jawab customer. Kami menyarankan untuk mengamankan barang-barang tersebut sebelum pengerjaan dimulai.

Setelah pekerjaan selesai, Anda akan menerima notifikasi otomatis untuk melakukan *Konfirmasi Hasil Pekerjaan*.

📝 Catatan:
Dengan dimulainya pengerjaan ini, Anda dianggap telah menyetujui hasil survey dan penawaran harga sebelumnya.

Terima kasih telah memilih Mitra10! 😊

`;
            }

  
    
    
    // =============================
    // === KIRIM GAMBAR + PESAN ===
    // =============================
      const payload = { 
        phonenumber: workOrderDetail?.order?.members?.member_number,
          message: invoiceMessage,
          location: '',
          img: iamgeIcon,
          document: '',
          audio: '',
          video: '',
          types:'Order'
        };
    
        await axios.post(`${API_BASE}/conversation`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
    
      }
    async function urlToBase64(url: string): Promise<string> {
      try {
        const response = await fetch(url)
        const blob = await response.blob()

        return await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } catch (err) {
        console.warn("⚠️ Failed convert to Base64 (CORS maybe):", err)
        return "" // kembalikan string kosong jika gagal
      }
    }
    useEffect(() => {
      fetchOrderData();
      fetchEmailData();
     }, []);
    useEffect(() => {
       if (
         !workOrderDetail ||
         !emailDetail
       ) return;
   
       console.log("DATA BENAR-BENAR SIAP:", workOrderDetail, emailDetail);
       //sentWA();
     }, [workOrderDetail, emailDetail]);

  return (
    <section id='update-work-order-tukang'>
      <Card className='mb-5'>
        <Card.Body>
          <Row>
            <Col xxl={8} xl={8} md={8} sm={12}>
              <Row>
                <Col xxl={6} xl={6} md={6} sm={12}>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                    <Form.Group className='detail-info' as={Row}>
                      <Form.Label className='fs-7' column md='4'>
                        Nama Toko
                      </Form.Label>

                      <Col md='8' className='d-flex align-items-center'>
                        <p className='fs-7 fw-semibold'>
                          {workOrderDetail?.order?.store?.store_name ?? ''}
                        </p>
                      </Col>
                    </Form.Group>
                  </Skeleton>
                </Col>

                <Col xxl={6} xl={6} md={6} sm={12}>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                    <Form.Group className='detail-info' as={Row}>
                      <Form.Label className='fs-7' column md='4'>
                        Nama Vendor
                      </Form.Label>

                      <Col md='8' className='d-flex align-items-center'>
                        <p className='fs-7 fw-semibold'>
                          {workOrderDetail?.vendor?.company_name ?? ''}
                        </p>
                      </Col>
                    </Form.Group>
                  </Skeleton>
                </Col>
              </Row>

              <Row>
                <Col xxl={6} xl={6} md={6} sm={12}>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                    <Form.Group className='detail-info' as={Row}>
                      <Form.Label className='fs-7' column md='4'>
                        Order ID
                      </Form.Label>

                      <Col md='8'>
                        <Form.Control readOnly value={workOrderDetail?.order_id ?? ''} />
                      </Col>
                    </Form.Group>

                    <Row className='detail-info'>
                      <Col md={4}>
                        <div className='title'>
                          <h1 className='fs-6'>Customer Info</h1>
                        </div>
                      </Col>

                      <Col md={8} className='mt-5'>
                        <div className='detail-info'>
                          <p className='fs-7 fw-bold '>
                            {workOrderDetail?.order?.members?.full_name ?? ''}
                          </p>
                          <p className='fs-7'>{workOrderDetail?.order?.members?.email ?? ''}</p>
                        </div>
                      </Col>
                    </Row>

                    <Row className='detail-info'>
                      <Col md={4}>
                        <div className='title'>
                          <h1 className='fs-6'>Catatan Toko</h1>
                        </div>
                      </Col>

                      <Col md={8} className='mt-5'>
                        <div className='detail-info'>
                          <p className='fs-7 fw-normal '>
                            {workOrderDetail?.order?.notes ?? 'Toko tidak memberikan catatan'}
                          </p>
                        </div>
                      </Col>
                    </Row>
                  </Skeleton>
                </Col>

                <Col xxl={6} xl={6} md={6} sm={12}>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 5}}>
                    <Form.Group className='detail-info' as={Row}>
                      <Form.Label className='fs-7' column sm='4'>
                        Work Order ID
                      </Form.Label>

                      <Col sm='8'>
                        <Form.Control readOnly value={workOrderDetail?.id ?? '-'} />
                      </Col>
                    </Form.Group>

                    <Row className='detail-info'>
                      <Col md={4}>
                        <div className='title'>
                          <h1 className='fs-6'>Work Order Info</h1>
                        </div>
                      </Col>

                      <Col md={8} className='mt-5'>
                        <div className='detail-info'>
                          {[
                            'SURVEYREQ',
                            'TUKANGSURVEY',
                            'SURVEYSTART',
                            'SURVEYDONE',
                            'RESURVEYREQ',
                            'RESURVEYSTART',
                            'RESURVEYDONE',
                          ].includes(workOrderDetail?.work_order_status[0]?.status?.category) && (
                            <>
                              {workOrderDetail?.order?.m_order_details?.map(
                                (item: any, index: number) => (
                                  <p key={`${index}-work_order_tukang`} className='fs-7'>
                                    {item?.item_notes ?? '-'}
                                  </p>
                                )
                              )}
                            </>
                          )}

                          {[
                            'WORKREQ',
                            'TUKANGWORK',
                            'WORKSTART',
                            'WORKEND',
                            'REWORKSTART',
                            'REWORKEND',
                            'WORKDONE',
                            'DONE',
                            'WORKREQSTEPONE',
                            'WORKREQSTEPTWO',
                            'WORKREQSTEPTHREE',
                            'WORKSTARTSTEPONE',
                            'WORKSTARTSTEPTWO',
                            'WORKSTARTSTEPTHREE',
                            'WORKENDSTEPONE',
                            'WORKENDSTEPTWO',
                            'WORKENDSTEPTHREE',
                            'TUKANGWORKSTEPONE',
                            'TUKANGWORKSTEPTWO',
                            'TUKANGWORKSTEPTHREE',
                          ].includes(workOrderDetail?.work_order_status[0]?.status?.category) && (
                            <>
                              {workOrderDetail?.work_order_status[0]?.work_order_items.map(
                                (item: any, index: number) => (
                                  <p key={`${index}-work_order_tukang`} className='fs-7'>
                                    {item?.name ?? '-'}
                                  </p>
                                )
                              )}
                            </>
                          )}
                        </div>
                      </Col>
                    </Row>

                    <Row className='detail-info'>
                      <Form.Group className='detail-info' as={Row}>
                        <Form.Label
                          className='fs-9 text-decoration-underline pt-0 pb-0'
                          column
                          md='4'
                        >
                          Upload Foto Sebelum
                        </Form.Label>

                        <Col md='8'>
                          <Form.Group>
                            <Form className='form-input-image' onClick={handleImageWorkBeforeClick}>
                              <Form.Control
                                type='file'
                                accept='image/*'
                                className='work-before-image'
                                multiple
                                hidden
                                id='work-before-file-input'
                                ref={evidenceRef}
                                onChange={handleFileWorkBefore}
                              />

                              <div className='input-image-text'>
                                <FontAwesomeIcon icon={faFileArrowUp} color='#858585' size='2xl' />
                              </div>
                            </Form>

                            <ListGroup className='pt-3'>
                              {workOrderBefore?.length ? (
                                workOrderBefore.map((item, index) => (
                                  <ListGroup
                                    key={`${stringToHash(item?.name ?? 'randomImageHash')}`}
                                  >
                                    <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                                      <FontAwesomeIcon
                                        className='me-3'
                                        icon={faFileArrowUp}
                                        color='#858585'
                                        size='sm'
                                      />

                                      <span
                                        className='upload-content'
                                        style={{cursor: 'pointer'}}
                                        onClick={() => handleFileWorkBeforeClick(index)}
                                      >
                                        {item?.name}
                                      </span>

                                      <FontAwesomeIcon
                                        icon={faTrash}
                                        size='sm'
                                        color='#ed2b2a'
                                        style={{cursor: 'pointer'}}
                                        onClick={(e) => handleRemoveWorkBeforeFile(index)}
                                      />
                                    </ListGroup.Item>

                                    {selectedWorkBeforeFile === index && item && (
                                      <Image
                                        key={`${stringToHash(
                                          previewWorkBeforeImage
                                        )} - ${index} - ${item?.name}`}
                                        width={200}
                                        style={{display: 'none'}}
                                        src={
                                          item instanceof File
                                            ? URL.createObjectURL(item)
                                            : `${apiUrl}/public/work-orders/${previewWorkBeforeImage}`
                                        }
                                        preview={{
                                          visible: visibleWorkBefore,
                                          src:
                                            item instanceof File
                                              ? URL.createObjectURL(item)
                                              : `${apiUrl}/public/work-orders/${previewWorkBeforeImage}`,
                                          onVisibleChange: (value) => {
                                            setVisibleWorkBefore(value)
                                          },
                                        }}
                                      />
                                    )}
                                  </ListGroup>
                                ))
                              ) : (
                                <ListGroup.Item className='d-flex justify-content-center'>
                                  Tidak ada file yang dipilih
                                </ListGroup.Item>
                              )}
                            </ListGroup>
                          </Form.Group>
                        </Col>
                      </Form.Group>

                      {[
                        'SURVEYSTART',
                        'SURVEYDONE',
                        'RESURVEYSTART',
                        'RESURVEYDONE',
                        'WORKSTART',
                        'WORKEND',
                        'REWORKSTART',
                        'REWORKEND',
                        'WORKDONE',
                        'DONE',
                        'WORKSTARTSTEPONE',
                        'WORKSTARTSTEPTWO',
                        'WORKSTARTSTEPTHREE',
                        'WORKENDSTEPONE',
                        'WORKENDSTEPTWO',
                        'WORKENDSTEPTHREE',
                      ].includes(workOrderDetail?.work_order_status[0]?.status?.category) && (
                        <Form.Group className='detail-info' as={Row}>
                          <Form.Label
                            className='fs-9 text-decoration-underline pt-0 pb-0 '
                            column
                            md='4'
                          >
                           Upload Foto Sesudah
                          </Form.Label>

                          <Col md='8'>
                            <Form.Group>
                              <Form
                                className='form-input-image'
                                onClick={handleImageWorkAfterClick}
                              >
                                <Form.Control
                                  type='file'
                                  accept='image/*'
                                  className='work-after-image'
                                  multiple
                                  hidden
                                  id='work-after-file-input'
                                  ref={evidenceRef}
                                  onChange={handleFileWorkAfter}
                                />

                                <div className='input-image-text'>
                                  <FontAwesomeIcon
                                    icon={faFileArrowUp}
                                    color='#858585'
                                    size='2xl'
                                  />
                                </div>
                              </Form>

                              <ListGroup className='pt-3'>
                                {workOrderAfter?.length ? (
                                  workOrderAfter.map((item, index) => (
                                    <ListGroup
                                      key={`${stringToHash(item?.name ?? 'randomImageHash')}`}
                                    >
                                      <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                                        <FontAwesomeIcon
                                          className='me-3'
                                          icon={faFileArrowUp}
                                          color='#858585'
                                          size='sm'
                                        />

                                        <span
                                          style={{cursor: 'pointer'}}
                                          className='upload-content'
                                          onClick={() => handleFileWorkAfterClick(index)}
                                        >
                                          {item?.name}
                                        </span>

                                        <FontAwesomeIcon
                                          icon={faTrash}
                                          size='sm'
                                          color='#ed2b2a'
                                          style={{cursor: 'pointer'}}
                                          onClick={(e) => handleRemoveWorkAfterFile(index)}
                                        />
                                      </ListGroup.Item>

                                      {selectedWorkAfterFile === index && item && (
                                        <Image
                                          key={`${stringToHash(
                                            previewWorkAfterImage
                                          )} - ${index} - ${item?.name}`}
                                          width={200}
                                          style={{display: 'none'}}
                                          src={
                                            item instanceof File
                                              ? URL.createObjectURL(item)
                                              : `${apiUrl}/public/work-orders/${previewWorkAfterImage}`
                                          }
                                          preview={{
                                            visible: visibleWorkAfter,
                                            src:
                                              item instanceof File
                                                ? URL.createObjectURL(item)
                                                : `${apiUrl}/public/work-orders/${previewWorkAfterImage}`,
                                            onVisibleChange: (value) => {
                                              setVisibleWorkAfter(value)
                                            },
                                          }}
                                        />
                                      )}
                                    </ListGroup>
                                  ))
                                ) : (
                                  <ListGroup.Item className='d-flex justify-content-center'>
                                    Tidak ada file yang dipilih
                                  </ListGroup.Item>
                                )}
                              </ListGroup>
                            </Form.Group>
                          </Col>
                        </Form.Group>
                      )}
                    </Row>
                  </Skeleton>
                </Col>
              </Row>

              <Row>
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                  <Form.Group className='detail-info'>
                    <Form.Label className='fs-7'>Catatan Tambahan</Form.Label>

                    <Form.Control
                      name='description'
                      style={{minHeight: '170px'}}
                      as='textarea'
                      value={workOrder.description}
                      onChange={(e) => workOrderHandler(e.target.value, 'description')}
                    />
                  </Form.Group>
                </Skeleton>
              </Row>
            </Col>

            <Col xxl={4} xl={4} md={4} sm={12}>
              <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                <Form.Group as={Row} className='detail-info'>
                  <Form.Label className='pt-3 fs-5 fw-semibold'>
                    WORK ORDER STATUS :
                    <span className='fw-bold'> {workOrderDetail?.order?.status?.description}</span>
                  </Form.Label>
                </Form.Group>

                {[
                  'SURVEYREQ',
                  'TUKANGSURVEY',
                  'SURVEYSTART',
                  'SURVEYDONE',
                  'RESURVEYREQ',
                  'RESURVEYSTART',
                  'RESURVEYDONE',
                ].includes(workOrderDetail?.order?.status?.category) && (
                  <Row className='detail-info'>
                    <div className='title'>
                      <h1 className='fs-6'>Survey</h1>
                    </div>

                    <Form.Group className='detail-info'>
                      <Form.Label className='fs-6'>Tanggal Survey</Form.Label>

                      <Col sm='8'>
                        <p className='fs-6'>{formatDateWithTime(workOrderDetail?.survey_date)}</p>
                      </Col>
                    </Form.Group>

                    <Form.Group className='detail-info'>
                      <Form.Label className='fs-6'>Tehnisi Survey</Form.Label>

                      <Col sm='8'>
                        <p>
                          {Array.from(
                            new Set(
                              workOrderDetail?.work_order_tukang
                                ?.filter((x: any) => x.type === 1)
                                ?.map((x: any) => x?.tukang?.full_name ?? '-')
                            )
                          ).join(', ')}
                        </p>
                      </Col>
                    </Form.Group>

                    <Form.Group className='detail-info'>
                      <Form.Label>Sesi :</Form.Label>

                      {workOrderDetail?.session !== null ? (
                        <p>
                          {workOrderDetail?.session === 1
                            ? 'Sesi Pagi'
                            : workOrderDetail?.session === 2
                            ? 'Sesi Siang'
                            : workOrderDetail?.session === 3
                            ? 'Sesi Sore'
                            : 'Sesi belum ditentukan oleh vendor'}
                        </p>
                      ) : (
                        <p>Sesi belum diset oleh vendor</p>
                      )}
                    </Form.Group>
                  </Row>
                )}

                {[
                  'WORKREQ',
                  'TUKANGWORK',
                  'WORKSTART',
                  'WORKEND',
                  'REWORKREQ',
                  'REWORKSTART',
                  'REWORKEND',
                  'RESCHEDULE',
                  'DONE',
                  'WORKREQSTEPONE',
                  'WORKREQSTEPTWO',
                  'WORKREQSTEPTHREE',
                  'WORKSTARTSTEPONE',
                  'WORKSTARTSTEPTWO',
                  'WORKSTARTSTEPTHREE',
                  'WORKENDSTEPONE',
                  'WORKENDSTEPTWO',
                  'WORKENDSTEPTHREE',
                  'TUKANGWORKSTEPONE',
                  'TUKANGWORKSTEPTWO',
                  'TUKANGWORKSTEPTHREE',
                ].includes(workOrderDetail?.order?.status?.category) && (
                  <Row className='detail-info'>
                    <div className='title'>
                      <h1 className='fs-6'>Pengerjaan</h1>
                    </div>

                    <Form.Group className='detail-info'>
                      <Form.Label className='fs-6'>Tanggal Mulai dan Selesai Pekerjaan</Form.Label>

                      <Col sm='8'>
                        <p>
                          {formatDateWithTime(workOrderDetail.work_start_date)} sampai{' '}
                          {formatDateWithTime(workOrderDetail.work_end_date)}
                        </p>
                      </Col>
                    </Form.Group>

                    <Form.Group className='detail-info'>
                      <Form.Label className='fs-6'>Tehnisi Pengerjaan</Form.Label>

                      <Col sm='8'>
                        <p className='fs-6 fw-bold'>
                          {Array.from(
                            new Set(
                              workOrderDetail?.work_order_tukang
                                ?.filter((x: any) => x.type === 2)
                                ?.map((x: any) => x?.tukang?.full_name ?? '-')
                            )
                          ).join(', ')}
                        </p>
                      </Col>
                    </Form.Group>

                    <Form.Group className='detail-info'>
                      <Form.Label>Sesi :</Form.Label>

                      {workOrderDetail?.session !== null ? (
                        <p>
                          {workOrderDetail?.session === 1
                            ? 'Sesi Pagi'
                            : workOrderDetail?.session === 2
                            ? 'Sesi Siang'
                            : workOrderDetail?.session === 3
                            ? 'Sesi Sore'
                            : 'Sesi belum ditentukan oleh vendor'}
                        </p>
                      ) : (
                        <p>Sesi belum diset oleh vendor</p>
                      )}
                    </Form.Group>
                  </Row>
                )}
              </Skeleton>
            </Col>
          </Row>

          <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
            {(() => {
              if (
                workOrderDetail?.order?.payment_type === 'survey' &&
                workOrderDetail?.order?.quotation?.length === 0 &&
                ['SURVEYSTART', 'SURVEYDONE', 'RESURVEYSTART', 'RESURVEYDONE'].includes(
                  workOrderDetail?.work_order_status[0]?.status?.category
                )
              ) {
                return (
                  <>
                    <div className='fs-5 text-dark fw-bold mb-2'>Jasa pemasangan</div>
                    <div className='item-jasa'>
                      {workOrderItem
                        .filter((x) => x.type === 2)
                        .map((element, index) => (
                          <Card
                            id={`${element.index}-service`}
                            key={`${stringToHash(element.index)}-service`}
                            className='mb-5'
                          >
                            <div className='d-flex border-rounded-3'>
                              <Card.Body>
                                <Row>
                                  <Col xxl={4} xl={4} lg={4} md={12} sm={12}>
                                    <Form.Group>
                                      <Form.Label>Jenis Jasa</Form.Label>
                                      <Form.Control
                                        id={`service-name-${index}`}
                                        type='text'
                                        className='mb-5'
                                        value={element.item_name}
                                        onChange={(e) =>
                                          handleItemNameChange(index, e.target.value, 2)
                                        }
                                      />
                                    </Form.Group>
                                  </Col>

                                  <Col xxl={4} xl={4} lg={4} md={12} sm={12}>
                                    <Form.Group>
                                      <Form.Label>QTY</Form.Label>
                                      <Form.Control
                                        id={`quantity-${index}`}
                                        type='number'
                                        className='mb-5'
                                        value={element.quantity?.toString()}
                                        onChange={(e) =>
                                          handleQuantityChange(element.index, e.target.value, 2)
                                        }
                                      />
                                    </Form.Group>
                                  </Col>

                                  <Col xxl={4} xl={4} lg={4} md={12} sm={12}>
                                    <Form.Group>
                                      <Form.Label>Satuan</Form.Label>
                                      <Form.Control
                                        id={`unit-${index}`}
                                        className='mb-5'
                                        value={element.unit?.toString()}
                                        onChange={(e) =>
                                          handleSatuanChange(element.index, e.target.value, 2)
                                        }
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                              </Card.Body>

                              <div className='d-flex flex-column align-items-center justify-content-between border-start p-2'>
                                <Button
                                  variant='primary'
                                  className='button-transparent text-danger'
                                  onClick={() => handleRemoveForm(element.index)}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}

                      <Button
                        variant='btn-jasa button-dark-primary mb-3'
                        onClick={() => handleAddForm(2)}
                      >
                        Tambah Jasa
                      </Button>
                    </div>

                    <hr />

                    <div className='fs-5 text-dark fw-bold mb-2'>Material yang dibutuhkan</div>
                    <div className='item-material'>
                      {workOrderItem
                        .filter((x) => x.type === 1)
                        .map((element, index) => (
                          <Card
                            id={`${element.index}-material`}
                            key={`${stringToHash(element.index)}-material`}
                            className='mb-5'
                          >
                            <div className='d-flex border-rounded-3'>
                              <div className='d-flex flex-column align-items-center justify-content-between border-end p-2'>
                                <Form.Check
                                  id={`is-user-${index}`}
                                  type='checkbox'
                                  checked={element.is_user === 1}
                                  onChange={(e) =>
                                    handleCheckboxChange(element.index, e.target.checked)
                                  }
                                />
                              </div>

                              <Card.Body>
                                <Row>
                                  <Col xxl={4} xl={4} lg={4} md={12} sm={12}>
                                    <Form.Group>
                                      <Form.Label>Material yang dibutuhkan</Form.Label>
                                      <Form.Control
                                        id={`item-name-${index}`}
                                        className='mb-5'
                                        value={element.item_name}
                                        onChange={(e) =>
                                          handleItemNameChange(index, e.target.value, 1)
                                        }
                                      />
                                    </Form.Group>
                                  </Col>

                                  <Col xxl={4} xl={4} lg={4} md={12} sm={12}>
                                    <Form.Group>
                                      <Form.Label>QTY</Form.Label>
                                      <Form.Control
                                        id={`quantity-${index}`}
                                        className='mb-5'
                                        value={element.quantity?.toString()}
                                        onChange={(e) =>
                                          handleQuantityChange(element.index, e.target.value, 1)
                                        }
                                      />
                                    </Form.Group>
                                  </Col>

                                  <Col xxl={4} xl={4} lg={4} md={12} sm={12}>
                                    <Form.Group>
                                      <Form.Label>Satuan</Form.Label>
                                      <Form.Control
                                        id={`unit-${index}`}
                                        className='mb-5'
                                        value={element.unit?.toString()}
                                        onChange={(e) =>
                                          handleSatuanChange(element.index, e.target.value, 1)
                                        }
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                              </Card.Body>

                              <div className='d-flex flex-column align-items-center justify-content-between border-start p-2'>
                                <Button
                                  variant='primary'
                                  className='button-transparent text-danger'
                                  onClick={() => handleRemoveForm(element.index)}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}

                      <h4 className='fs-8 fw-normal text-danger mb-5'>
                        *Jika <span className='fw-bolder text-decoration-underline'>Material</span>{' '}
                        diceklis, maka material tersebut disediakan oleh customer
                      </h4>

                      <Button
                        variant='btn-material button-dark-primary mb-3'
                        onClick={() => handleAddForm(1)}
                      >
                        Tambah Material
                      </Button>
                    </div>
                  </>
                )
              } else if (
                workOrderDetail?.order?.quotation?.length >= 1 &&
                workOrderDetail?.order?.payment_type === 'survey'
              ) {
                return (
                  <>
                    <div className='fs-5 text-dark fw-bold mb-2'>Jasa Pemasangan</div>
                    <div className='table-warranty-content'>
                      {workOrderDetail?.order?.quotation[0]?.quotation_special === 0 ? (
                        <>
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
                              </tr>
                            </thead>

                            <tbody>
                              {workOrderDetail?.order?.quotation[0]?.quotation_details
                                ?.filter((x: any) => x.item_type === 2)
                                ?.map((item: any, index: any) => (
                                  <tr key={`${index}-quotation`}>
                                    <td>
                                      {item?.name ?? '-'}{' '}
                                      {item?.is_customer === true
                                        ? '( Disediakan oleh customer )'
                                        : ''}
                                    </td>
                                    <td>{item?.quantity ?? 0}</td>
                                    <td>{item?.unit}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </>
                      ) : (
                        <>
                          <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 1</div>
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
                              </tr>
                            </thead>

                            <tbody>
                              {workOrderDetail?.order?.quotation[0]?.quotation_details
                                ?.filter((x: any) => x.item_type === 2 && x.work_step === 1)
                                ?.map((item: any, index: any) => (
                                  <tr key={`${index}-quotation`}>
                                    <td>
                                      {item?.name ?? '-'}{' '}
                                      {item?.is_customer === true
                                        ? '( Disediakan oleh customer )'
                                        : ''}
                                    </td>
                                    <td>{item?.quantity ?? 0}</td>
                                    <td>{item?.unit}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>

                          <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 2</div>
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
                              </tr>
                            </thead>

                            <tbody>
                              {workOrderDetail?.order?.quotation[0]?.quotation_details
                                ?.filter((x: any) => x.item_type === 2 && x.work_step === 2)
                                ?.map((item: any, index: any) => (
                                  <tr key={`${index}-quotation`}>
                                    <td>
                                      {item?.name ?? '-'}{' '}
                                      {item?.is_customer === true
                                        ? '( Disediakan oleh customer )'
                                        : ''}
                                    </td>
                                    <td>{item?.quantity ?? 0}</td>
                                    <td>{item?.unit}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>

                          <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 3</div>
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
                              </tr>
                            </thead>

                            <tbody>
                              {workOrderDetail?.order?.quotation[0]?.quotation_details
                                ?.filter((x: any) => x.item_type === 2 && x.work_step === 3)
                                ?.map((item: any, index: any) => (
                                  <tr key={`${index}-quotation`}>
                                    <td>
                                      {item?.name ?? '-'}{' '}
                                      {item?.is_customer === true
                                        ? '( Disediakan oleh customer )'
                                        : ''}
                                    </td>
                                    <td>{item?.quantity ?? 0}</td>
                                    <td>{item?.unit}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </>
                      )}

                      {workOrderDetail?.order?.quotation[0]?.quotation_details?.filter(
                        (x: any) => x.item_type === 1
                      )?.length > 0 && (
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
                            </tr>
                          </thead>

                          <tbody>
                            {workOrderDetail?.order?.quotation[0]?.quotation_details
                              ?.filter((x: any) => x.item_type === 1)
                              ?.map((item: any, index: any) => (
                                <tr key={`${index}-quotation`}>
                                  <td>
                                    {item?.name ?? '-'}{' '}
                                    {item?.is_customer === true
                                      ? '( Disediakan oleh customer )'
                                      : ''}
                                  </td>
                                  <td>{item?.quantity ?? 0}</td>
                                  <td>{item?.unit}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </>
                )
              } else if (
                [
                  'WORKREQ',
                  'WORKSTART',
                  'WORKEND',
                  'DONE',
                  'REWORKREQ',
                  'REWORKSTART',
                  'REWORKEND',
                ].includes(workOrderDetail?.work_order_status[0]?.status?.category) &&
                workOrderDetail?.work_order_status.length >= 2 &&
                workOrderDetail?.order?.payment_type === 'survey'
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
                        </tr>
                      </thead>

                      <tbody>
                        {workOrderDetail?.order?.quotation[0]?.quotation_details
                          ?.filter((x: any) => x.item_type === 2)
                          ?.map((item: any, index: any) => (
                            <tr key={`${index}-quotation`}>
                              <td>
                                {item?.name ?? '-'}{' '}
                                {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                              </td>
                              <td>{item?.quantity ?? 0}</td>
                              <td>{item?.unit}</td>
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
                        </tr>
                      </thead>

                      <tbody>
                        {workOrderDetail?.order?.quotation[0]?.quotation_details
                          ?.filter((x: any) => x.item_type === 1)
                          ?.map((item: any, index: any) => (
                            <tr key={`${index}-quotation`}>
                              <td>
                                {item?.name ?? '-'}{' '}
                                {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                              </td>
                              <td>{item?.quantity ?? 0}</td>
                              <td>{item?.unit}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )
              } else if (
                workOrderDetail?.order?.payment_type === 'gratis' ||
                workOrderDetail?.order?.payment_type === 'pemasangan_tanpa_survey'
              ) {
                return (
                  <>
                    <div className='table-title-warranty mt-5'>
                      <div className='fs-3 fw-bold'>Informasi Pemasangan</div>
                      <Row>
                        <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                          <Form.Label column>
                            {(() => {
                              if (workOrderDetail?.order?.payment_type === 'survey') {
                                if (workOrderDetail?.order?.quotation?.length === 0) {
                                  return `Tanggal request survey`
                                } else {
                                  return `Tanggal request pemasangan`
                                }
                              } else {
                                return `Tanggal request pemasangan`
                              }
                            })()}
                          </Form.Label>
                          <Col>
                            <p className='fs-7 p-0'>
                              {formatDate(workOrderDetail?.order?.request_survey)}
                            </p>
                          </Col>
                        </Form.Group>

                        <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                          <Form.Label column>Informasi Vendor Pemasangan :</Form.Label>
                          <Col>
                            <p className='fs-7 p-0'>
                              {workOrderDetail?.vendor?.company_name ?? '-'}
                            </p>
                          </Col>
                        </Form.Group>

                        <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                          <Form.Label column>Payment Type:</Form.Label>
                          <Col>
                            <p className='fs-7 p-0'>
                              {(() => {
                                if (workOrderDetail?.order?.payment_type === 'survey') {
                                  return `Berbayar & Survey`
                                } else if (workOrderDetail?.order?.payment_type === 'gratis') {
                                  return `Gratis`
                                } else if (
                                  workOrderDetail?.order?.payment_type === 'pemasangan_tanpa_survey'
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

                    <div className='table-warranty-content'>
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
                          {workOrderDetail?.order?.m_order_details?.map((item: any, index: any) => (
                            <>
                              <tr key={`${index} - order_detail`}>
                                <td>{item?.item_code}</td>
                                <td>{item?.item_name}</td>
                                <td>{item?.item?.service_name}</td>
                                <td>{item?.quantity ?? 0}</td>
                              </tr>
                            </>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )
              }
            })()}
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

      <Skeleton active loading={isLoadingPage}>
        <Card>
          <Card.Header>
            <Card.Title className='fw-bold'>Order History</Card.Title>
          </Card.Header>

          <Card.Body>
            <div className='work-order-history'>
              <Steps
                progressDot
                current={OrderHistory.length - 1}
                direction='vertical'
                items={OrderHistory.map((item) => ({
                  title: item?.status,
                  description: `Terakhir update : ${item?.created_at} ${
                    item.updated_by ? `oleh ${item?.updated_by}` : ''
                  }`,
                }))}
              />
            </div>
          </Card.Body>
        </Card>
      </Skeleton>
    </section>
  )
}

export {UpdateWorkTukang}
