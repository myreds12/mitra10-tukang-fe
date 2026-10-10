/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {FC, useEffect, useState, useRef} from 'react'
import axiosInstance from '../../../../../_metronic/layout/core/axiosInterceptor'
import {useNavigate} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {RootState} from '../../../../../store'
import {
  setQueryParams,
  setCurrentPage,
  setPageSize,
  setDateFrom,
  setDateTo,
  setSearchFilter,
  setSelectedStore,
  setSelectedVendor,
  setSelectedOrderStatus,
  setSelectedPaymentReceiptStatus,
  setSelectedPaymentQuotationStatus,
} from '../../../../../store/orderSlice'

import './ViewOrder.css'

import axios from 'axios'
import dayjs from 'dayjs'
import Select, {SingleValue} from 'react-select'
import type {ColumnsType} from 'antd/es/table'
import {Table, Tag, PaginationProps, Spin, Pagination, DatePicker} from 'antd'
import type {FilterValue, SorterResult, TableCurrentDataSource} from 'antd/es/table/interface'
import {LoadingOutlined} from '@ant-design/icons'
import {Image, Skeleton} from 'antd'
import Swal from 'sweetalert2'
import {
  Nav,
  Row,
  Col,
  Form,
  Button,
  FormGroup,
  Modal,
  Card,
  ListGroup,
  OverlayTrigger,
  Tooltip,
  Tab,
} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faBook,
  faSearch,
  faPen,
  faCheckCircle,
  faImage,
  faTrash,
  faFileImage,
  faXmarkCircle,
  faEnvelope,
  faPrint,
} from '@fortawesome/free-solid-svg-icons'
import {formatDateWithTimeZone} from '../../../../../_metronic/helpers'

const {RangePicker} = DatePicker

interface DataType {
  order_id: number
  store_id: number
  date_order: Date
  assign_from: string
  vendor_name: string
  no_member: number
  costumer_name: string
  phone_number: number
  payment_receipt: string
  payment_quotation: string
  order_status: string
  order_status_label: string
  work_order_status: string
  print_counter: number
}

interface StoreItem {
  value: number | null
  label: string
}

interface VendorItem {
  value: number | null
  label: string
}

interface Order {
  id: number | null
  project_status_id: number | null
  store_id: number | null
  request_survey: string
  request_work: string
  notes: string
  order_details: Array<{
    id: number | null
    item_id: number | null
    item_code: string
    item_name: string
    quantity: number
    unit_price: string
    total: string
    item_notes: string
  }>
}

interface CSI {
  value: number | null
  label: string
}

interface Quotation {
  id: number | null
  order_id: number | null
  store_id: number | null
  quotation_status: number | null
  quotation_special: number
  description: string
  quotation_number: string
  quotation_date: string
  quotation_validity: string
  quotation_disc: number
  quotation_promotion: number | null
  quotation_grand_total: number
  readiness: number
  receipt_quotation: string
  receipts_quotation: Array<{
    id: number | null
    index: number
    receipt_quotation: string
    quotation_step: number
  }>
  quotation_details: Array<{
    id: number | null
    index: string
    item_id: number | null
    work_order_item_id: number | null
    category_id: number | null
    type: number
    item_name: string
    unit_price: number
    unit: string
    description: string
    total: number
    final_price: number
    margin: number
    margin_type: number
    quantity: number
    is_user: number
    work_step?: number
  }>
}

const ViewOrders: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const userRole = localStorage.getItem('userRole') as string
  const salesId = localStorage.getItem('sales_id')
  const storeId = localStorage.getItem('storeId')

  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)
  const today = new Date().toISOString().split('T')[0]

  const [mailLogs, setMailLogs] = useState<any>()
  const [orderDetail, setOrderDetail] = useState<any>()
  const [orderData, setOrderData] = useState<DataType[]>([])
  const [receiptFiles, setReceiptFiles] = useState<Array<File | null>>([])

  const [totalData, setTotalData] = useState<number>(0)
  const {
    queryParams,
    searchFilter,
    currentPage,
    pageSize,
    dateFrom,
    dateTo,
    selectedStore,
    selectedVendor,
    selectedOrderStatus,
    selectedPaymentReceiptStatus,
    selectedPaymentQuotationStatus,
  } = useSelector((state: RootState) => state.order)

  const [activeKey, setActiveKey] = useState<number>(1)

  const [store, setStore] = useState<StoreItem[]>([])
  const storeOptions = [{value: null, label: 'All Store'}, ...store]

  const [vendor, setVendor] = useState<any[]>([])
  const [vendorSelect, setVendorSelect] = useState<VendorItem[]>([])
  const vendorOptions = [{value: null, label: 'All Vendor'}, ...vendorSelect]

  // Status
  const storedStatus = localStorage.getItem('statusData')
  const statusData = storedStatus ? JSON.parse(storedStatus) : []
  const cancelOrder = statusData.find((status: any) => status.category === 'CANCEL')
  const verificationStatus = statusData.find((status: any) => status.category === 'QUOTATIONPAID')
  const statusFilters = statusData.map((item: any) => ({
    text: item.description,
    value: item.value,
  }))

  // Order Detail
  const [orderForm, setOrderForm] = useState<Order>({
    id: null,
    project_status_id: null,
    store_id: null,
    request_survey: '',
    request_work: '',
    notes: '',
    order_details: [
      {
        id: null,
        item_id: null,
        item_code: '',
        item_name: '',
        quantity: 1,
        unit_price: '',
        total: '',
        item_notes: '',
      },
    ],
  })

  const fetchOrderData = async (order_id: number | null) => {
    if (order_id === null) return

    try {
      await axios
        .get(`${apiUrl}/orders/${order_id}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })
        .then((response) => {
          const data = response.data.data
          const emailLog = response.data.mailLogs

          setMailLogs(emailLog)
          setOrderDetail(data)
          setTimeout(() => {
            setLoadingModal(false)
          }, 2000)

          if (data) {
            setOrderForm((prev) => ({
              ...prev,
              id: data?.id ?? null,
              project_status_id: data?.project_status_id ?? null,
              store_id: data?.store?.id ?? null,
              notes: data?.notes ?? '',
              request_survey: new Date(data.request_survey).toISOString().split('T')[0] ?? '',
              request_work: data?.request_work
                ? new Date(data.request_work).toISOString().split('T')[0]
                : '',
            }))
          }

          if (data?.order_files) {
            const initialOrderFilesValues = data.order_files.map((item: any) => ({
              id: item.id,
              name: item.path,
            }))

            setReceiptFiles(initialOrderFilesValues)
          }

          if (data?.order_details) {
            setOrderForm((prev) => {
              const previousDetailValues = data?.order_details?.map((item: any) => {
                const previousItem = {
                  value: item.id,
                  label: item?.item?.service_name,
                  item_code: item?.item_code ?? '',
                  item_name: item?.item_name ?? '',
                  category_id: item?.item?.category.id,
                  default_price: item?.item?.default_price,
                  prices:
                    item?.item?.prices?.length > 0
                      ? item?.item?.prices.map((price: any) => ({
                          id: price?.id,
                          item_id: price?.item_id,
                          store_id: price?.store_id,
                          periodic_start: price?.periodic_start,
                          periodic_end: price?.periodic_end,
                          price: price?.price,
                          min_order: price?.min_order,
                        }))
                      : [],
                }

                return {
                  item: previousItem,
                  id: item.id,
                  item_id: item.item_id,
                  item_code: item?.item_code === 'null' ? '' : item.item_code,
                  item_name: item?.item_name === 'null' ? '' : item.item_name,
                  item_notes: item?.item_notes === 'null' ? '' : item.item_notes,
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                  total: item.total,
                }
              })

              return {
                ...prev,
                order_details: previousDetailValues,
              }
            })
          }

          if (data?.quotation?.length) {
            const quotationDetails = data.quotation[0].quotation_details.map(
              (item: any, index: number) => ({
                id: item?.id ?? null,
                index: (Date.now() + index).toString(),
                item_id: item?.item_id ?? null,
                work_order_item_id: item?.work_order_items_id ?? null,
                category_id: item?.category_id ?? null,
                type: item?.item_type ?? 2,
                item_name: item?.name ?? '',
                unit_price: item?.price ?? 0,
                unit: item?.unit ?? '',
                description: item?.description ?? '',
                final_price: item?.final_price ?? '',
                margin: item?.margin ?? 0,
                margin_type: item?.margin_type ?? 1,
                quantity: item?.quantity ?? 0,
                is_user: item?.is_customer === true ? 1 : 0,
                work_step: item?.work_step ?? 0,
              })
            )

            setQuotation((prev) => ({
              ...prev,
              id: data?.quotation[0]?.id,
              order_id: data?.quotation[0]?.order_id,
              store_id: data?.quotation[0]?.store_id,
              quotation_status: data?.quotation[0]?.quotation_status,
              quotation_special: data?.quotation[0]?.quotation_special,
              description: data?.quotation[0]?.description,
              quotation_number: data?.quotation[0]?.quotation_number,
              quotation_date: data?.quotation[0]?.quotation_date,
              quotation_validity: data?.quotation[0]?.quotation_validity,
              quotation_disc: data?.quotation[0]?.quotation_disc,
              quotation_promotion: data?.quotation[0]?.promotion?.id ?? null,
              quotation_grand_total: data?.quotation[0]?.quotation_grand_total,
              readiness: data?.quotation[0]?.readiness,
              receipt_quotation: data?.quotation[0]?.receipt_quotation,
              quotation_details: quotationDetails,
              promotion_id:
                data?.quotation[0]?.promotion_id === null ? 0 : data?.quotation[0]?.promotion_id,
              receipts_quotation: [
                {
                  id: data?.quotation[0]?.quotation_receipt[0]?.id ?? null,
                  index: 123,
                  receipt_quotation:
                    data?.quotation[0]?.quotation_receipt[0]?.receipt_quotation ?? '',
                  quotation_step: 1,
                },
                {
                  id: data?.quotation[0]?.quotation_receipt[1]?.id ?? null,
                  index: 345,
                  receipt_quotation:
                    data?.quotation[0]?.quotation_receipt[1]?.receipt_quotation ?? '',
                  quotation_step: 2,
                },
                {
                  id: data?.quotation[0]?.quotation_receipt[2]?.id ?? null,
                  index: 678,
                  receipt_quotation:
                    data?.quotation[0]?.quotation_receipt[2]?.receipt_quotation ?? '',
                  quotation_step: 3,
                },
              ],
            }))
          }

          if (data?.quotation?.length) {
            const quotationFiles = data.quotation[0]?.quotation_files
              .filter((x: any) => x.type === 1)
              .map((item: any) => ({
                id: item.id,
                name: item.path,
              }))

            const receiptFiles = data.quotation[0]?.quotation_files
              .filter((x: any) => x.type === 2)
              .map((item: any) => ({
                id: item.id,
                name: item.path,
              }))

            setQuotationFiles(quotationFiles)
            setReceiptQuotation(receiptFiles)
          }
        })
    } catch (error) {
      console.error(error)
    }
  }

  const getStore = async () => {
    try {
      const response = await axios.get(`${apiUrl}/stores`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
        params: {
          take: 0,
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempStore = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.store_name,
          city_id: item.city_id,
        }))

        setStore(tempStore)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getVendor = async (store_id?: number | null) => {
    let currentPage = 1
    let allVendors: any[] = []
    let hasMoreData = true
    const pageSize = 20

    try {
      while (hasMoreData) {
        const response = await axios.get(`${apiUrl}/vendor`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
          params: {
            page: currentPage,
            take: pageSize,
            store_id: store_id || null,
          },
        })

        const data = response.data.data

        if (data.length > 0) {
          const allVendorData = response.data.data.map((item: any) => {
            return item
          })

          const vendorOptions = response.data.data.map((item: any) => ({
            value: item.id,
            label: item.company_name,
          }))

          allVendors = [...allVendors, ...vendorOptions]
          currentPage += 1

          setVendor(allVendorData)
        } else {
          hasMoreData = false
        }
      }

      setVendorSelect(allVendors)
    } catch (err) {
      console.error(err)
    }
  }

  const getCSI = async () => {
    try {
      const response = await axios.get(`${apiUrl}/csi`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
        params: {
          take: 0,
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempCSI = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))

        setCsiData(tempCSI)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchOrderData(null)
    getStore()
    getVendor(null)
    getCSI()
  }, [])

  // Modal
  const [loadingUpdate, setLoadingUpdate] = useState(false)
  const [loadingModal, setLoadingModal] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<number | null>(null)
  const handleCloseModal = () => {
    setShowModal(false)
  }

  // CSI
  const [csiData, setCsiData] = useState<CSI[]>([])
  const [selectedCSI, setSelectedCSI] = useState<SingleValue<CSI>>({
    value: null,
    label: 'Pilih Format CSI',
  })

  // Quotation Detail
  const [quotation, setQuotation] = useState<Quotation>({
    id: null,
    order_id: null,
    store_id: null,
    quotation_status: null,
    quotation_special: 0,
    description: '',
    quotation_number: '',
    quotation_date: '',
    quotation_validity: '',
    quotation_disc: 0,
    quotation_promotion: null,
    quotation_grand_total: 0,
    readiness: 1,
    receipt_quotation: '',
    receipts_quotation: [
      {id: null, index: 123, receipt_quotation: '', quotation_step: 1},
      {id: null, index: 345, receipt_quotation: '', quotation_step: 2},
      {id: null, index: 678, receipt_quotation: '', quotation_step: 3},
    ],
    quotation_details: [
      {
        id: null,
        index: (Date.now() + 1).toString(),
        item_id: null,
        work_order_item_id: null,
        category_id: null,
        type: 1,
        item_name: '',
        unit: '',
        description: '',
        unit_price: 0,
        total: 0,
        final_price: 0,
        margin: 0,
        margin_type: 1,
        quantity: 0,
        is_user: 0,
      },
      {
        id: null,
        index: (Date.now() + 2).toString(),
        item_id: null,
        category_id: null,
        work_order_item_id: null,
        type: 2,
        item_name: '',
        unit: '',
        description: '',
        unit_price: 0,
        total: 0,
        final_price: 0,
        margin: 0,
        margin_type: 1,
        quantity: 0,
        is_user: 0,
      },
    ],
  })

  const quotationSpecialStatus = (() => {
    if (quotation.quotation_special === 1) {
      const receipts =
        quotation?.receipts_quotation?.map((receipt: any) => receipt?.receipt_quotation || null) ||
        []

      switch (true) {
        case receipts[0] !== null && receipts[1] === null && receipts[2] === null:
          return statusData.find((status: any) => status.category === 'QUOTATIONPAIDSTEPONE')
        case receipts[0] !== null && receipts[1] !== null && receipts[2] === null:
          return statusData.find((status: any) => status.category === 'QUOTATIONPAIDSTEPTWO')
        case receipts[0] !== null && receipts[1] !== null && receipts[2] !== null:
          return statusData.find((status: any) => status.category === 'QUOTATIONPAIDSTEPTHREE')
        default:
          return statusData.find((status: any) => status.category === 'QUOTATIONPAIDSTEPONE')
      }
    }
    return null
  })()

  // Quotation Files
  const [receiptQuotation, setReceiptQuotation] = useState<Array<File | null>>([])
  const [quotationFiles, setQuotationFiles] = useState<Array<File | null>>([])

  const [selectedReceiptIndex, setSelectedReceiptIndex] = useState<number | null>(null)
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
  const evidenceRef = useRef<HTMLInputElement>(null)

  const [previewReceipt, setPreviewReceipt] = useState<any>()
  const [previewImage, setPreviewImage] = useState<any>()

  const [visibleReceipt, setVisibleReceipt] = useState(false)
  const [visible, setVisible] = useState(false)

  // Upload Order File Handler
  const singleReceipt = useRef<HTMLInputElement>(null)
  const notes = useRef<HTMLInputElement>(null)
  const receiptRefs = useRef<{[key: number]: HTMLInputElement | null}>({})
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (focusedIndex !== null) {
      const focusedElement = receiptRefs.current[focusedIndex]
      if (focusedElement) {
        focusedElement.focus()
      }
    }
  }, [focusedIndex, quotation.receipts_quotation])

  useEffect(() => {
    if (notes.current) {
      notes.current.focus()
    }
  }, [orderForm.notes])

  useEffect(() => {
    if (singleReceipt.current) {
      singleReceipt.current.focus()
    }
  }, [quotation.receipt_quotation])

  const handleMultiReceiptChange = (index: number, value: string) => {
    setQuotation((prev) => {
      const updatedReceipts = prev.receipts_quotation.map((receipt) =>
        receipt.index === index ? {...receipt, receipt_quotation: value} : receipt
      )
      return {...prev, receipts_quotation: updatedReceipts}
    })
    setFocusedIndex(index)
  }

  const handleReceiptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files

    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...receiptQuotation]
      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setReceiptQuotation(mergedFiles)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files

    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...quotationFiles]
      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setQuotationFiles(mergedFiles)
    }
  }

  // Click Image
  const handleReceiptClick = () => {
    const inputField = document.querySelector('.input-field-receipt') as HTMLInputElement
    inputField.click()
  }

  const handleImageClick = () => {
    const inputField = document.querySelector('.input-field-image') as HTMLInputElement
    inputField.click()
  }

  // Remove File
  const handleRemoveReceipt = (index: number) => {
    const newEvidances = [...receiptQuotation]
    newEvidances.splice(index, 1)
    setReceiptQuotation(newEvidances)

    // Update element value
    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  const handleRemoveFile = (index: number) => {
    const newEvidances = [...quotationFiles]
    newEvidances.splice(index, 1)
    setQuotationFiles(newEvidances)

    // Update element value
    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  // File Click
  const handleFileReceipt = (index: number) => {
    setPreviewReceipt(receiptQuotation[index]?.name)
    setVisibleReceipt(true)
    setSelectedReceiptIndex(index)
  }

  const handleFileClick = (index: number) => {
    setPreviewImage(quotationFiles[index]?.name)
    setVisible(true)
    setSelectedFileIndex(index)
  }

  const fetchOrderList = async (page: number, pageSize: number, queryparams: any) => {
    let apiUrlWithParams = `${apiUrl}/orders?order_by=desc${queryparams}`

    try {
      const response = await axiosInstance.get(apiUrlWithParams, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
        params: {
          search: searchFilter || null,
          page: page || currentPage,
          take: pageSize,
          date_from: dateFrom || null,
          date_to: dateTo || null,
          sales_id: salesId || null,
          store_id: storeId ? storeId : selectedStore.value ? selectedStore.value : null,
          vendor_id: selectedVendor.value ? selectedVendor.value : null,
        },
      })

      const resPage = Number(response?.data?.page ?? response?.data?.meta?.page ?? page)
      const resTotal = Number(response?.data?.total ?? response?.data?.meta?.total ?? 0)
      dispatch(setCurrentPage(resPage))
      setTotalData(resTotal)

      return response.data.data
    } catch (error: any) {
      console.log('error when fetching data', error)
    } finally {
      setLoadData(false)
    }
  }

  const ViewOrder = async (page: number, pageSize: number, queryparams: any) => {
    try {
      const apiData = await fetchOrderList(page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from fetchOrderList')
        return []
      }

      const orderData = apiData.map((item: any) => {
        let data

        const phoneNumber = item?.project_number.startsWith('0')
          ? item.project_number
          : `+62${item.project_number}`

        const orderDate = formatDateWithTimeZone(item?.created_at)

        const paymentReceipt = (() => {
          if (item?.payment_type === 'survey') {
            return item.receipt_number === null ? 'UNPAID' : 'PAID'
          } else if (item?.payment_type === 'pemasangan_tanpa_survey') {
            return item.receipt_number === null ? 'UNPAID' : 'PAID'
          } else if (item?.payment_type === 'gratis') {
            return 'FREE'
          } else {
            return ''
          }
        })()

        const paymentQuotation = (() => {
          if (item?.quotation?.length) {
            if (
              item?.quotation[0]?.receipt_quotation !== null &&
              item?.quotation[0]?.quotation_files.length &&
              item?.quotation[0].quotation_files.find((x: any) => x.type === 2)
            ) {
              return 'PAID (RECEIPT DI UPLOAD OLEH TOKO)'
            } else if (
              item?.quotation[0]?.receipt_quotation !== null &&
              item?.quotation[0]?.quotation_files.length &&
              item?.quotation[0].quotation_files.find((x: any) => x.type === 3)
            ) {
              return 'BUKTI TRANSFER SUDAH DI UPLOAD OLEH KONSUMEN'
            } else {
              return 'UNPAID'
            }
          } else {
            return ''
          }
        })()
        data = {
          order_id: item.id,
          store_id: item?.store?.id,
          assign_from: item?.store?.store_name,
          date_order: orderDate,
          vendor_name: item?.vendor?.company_name ?? 'Vendor Belum Ditugaskan',
          no_member: item?.members?.member_number,
          costumer_name: item?.members?.full_name,
          phone_number: phoneNumber,
          payment_receipt: paymentReceipt,
          payment_quotation: paymentQuotation,
          order_status: item?.status?.category,
          order_status_label: item?.status?.description,
          print_counter: item?.print_counter ?? 0,
        }

        return data
      })

      return orderData
    } catch (error) {
      console.error('Error getting order list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewOrder(page, pageSize, queryparams)
    setOrderData(data)
  }

  const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
    if (type === 'prev') {
      return <a>Prev</a>
    }
    if (type === 'next') {
      return <a>Next</a>
    }
    return originalElement
  }

  useEffect(() => {
    fetchData(currentPage, pageSize, queryParams)
  }, [currentPage, pageSize, queryParams])

  // Table Handler
  const handleChangeSearchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value))
  }

  const handlePageChange = (page: number, size?: number) => {
    dispatch(setCurrentPage(page))
    if (size) {
      dispatch(setPageSize(size))
    }
  }

  const handleStoreChange = (newValue: SingleValue<StoreItem>) => {
    const selectedStore: StoreItem = newValue || {value: null, label: 'All Store'}
    dispatch(setSelectedStore(selectedStore))
  }

  const handleVendorChange = (newValue: SingleValue<VendorItem>) => {
    const selectedVendor: VendorItem = newValue || {value: null, label: 'All Vendor'}
    dispatch(setSelectedVendor(selectedVendor))
  }

  const handleFilterTable = (
    pagination: PaginationProps,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<DataType> | SorterResult<DataType>[],
    extra: TableCurrentDataSource<DataType>
  ) => {
    const newQueryParams: string[] = []

    if (filters.order_status_label) {
      const statusValues = filters.order_status_label as string[]

      dispatch(setSelectedOrderStatus(statusValues))

      if (statusValues.length > 0) {
        newQueryParams.push(`&status=${statusValues.join(',')}`)
      }
    } else {
      dispatch(setSelectedOrderStatus([]))
    }

    if (filters.payment_receipt) {
      const paymentReceiptValues = filters.payment_receipt as string[]

      dispatch(setSelectedPaymentReceiptStatus(paymentReceiptValues))

      if (paymentReceiptValues.length > 0) {
        newQueryParams.push(`&is_receipt=${paymentReceiptValues.join(',')}`)
      }
    } else {
      dispatch(setSelectedPaymentReceiptStatus([]))
    }

    if (filters.payment_quotation) {
      const paymentQuotationValues = filters.payment_quotation as string[]

      dispatch(setSelectedPaymentQuotationStatus(paymentQuotationValues))

      if (paymentQuotationValues.length > 0) {
        newQueryParams.push(`&is_receipt_quotation=${paymentQuotationValues.join(',')}`)
      }
    } else {
      dispatch(setSelectedPaymentQuotationStatus([]))
    }

    const finalQueryParams = newQueryParams.join('')

    dispatch(setQueryParams(finalQueryParams))
    dispatch(setCurrentPage(1))

    fetchData(currentPage, pageSize, finalQueryParams)
  }

  const handleSubmitFilter = async () => {
    setLoadingButton(true)
    dispatch(setCurrentPage(1))

    try {
      const data = await ViewOrder(currentPage, pageSize, queryParams)
      setOrderData(data)
    } catch (error) {
      console.error('Error getting order list data:', error)
    } finally {
      setLoadingButton(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleSubmitFilter()
    }
  }

  // Modal Handler
  const handleCancelRefund = async (type: number) => {
    setLoadingButton(true)
    const formData = new FormData()

    const appendIfNotDefault = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        formData.append(key, String(value))
      }
    }

    formData.append('order_id', String(orderForm?.id))
    formData.append('project_status_id', cancelOrder?.value)

    orderForm.order_details.forEach((item, index) => {
      if (item) {
        appendIfNotDefault(`order_details[${index}][id]`, item.id)
        appendIfNotDefault(`order_details[${index}][item_id]`, item.item_id)
        appendIfNotDefault(`order_details[${index}][item_code]`, item.item_code)
        appendIfNotDefault(`order_details[${index}][item_name]`, item.item_name)
        appendIfNotDefault(`order_details[${index}][item_notes]`, item.item_notes)
        appendIfNotDefault(`order_details[${index}][quantity]`, item.quantity)
      }
    })

    try {
      const response = await axios.post(`${apiUrl}/orders/${orderForm?.id}`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Orderan berhasil dibatalkan.',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          setLoadingButton(false)
          if (type === 1) {
            navigate(`/refund/new-refund/${orderForm?.id}`)
          } else if (type === 2) {
            window.location.reload()
          }
        })
      } else {
        setLoadingButton(false)
        Swal.fire({
          icon: 'error',
          title: response.data.message,
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Terjadi kesalahan dari sisi server, mohon hubungi Administrator.',
        showConfirmButton: false,
      })
    }
  }

  // Quotation Payment
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
    calculatePaymentStages(quotation?.quotation_grand_total)
  }, [quotation?.quotation_grand_total])

  // Update Request Survey
  const OrderValidation = () => {
    let valid = true

    if (orderForm.request_survey === '') {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi tanggal request pengerjaan',
        icon: 'warning',
      })
      valid = false
    }
    return valid
  }

  const handleUpdateRequestSurvey = async () => {
    if (!OrderValidation()) {
      return false
    }

    const formData = new FormData()

    const appendIfNotDefault = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        formData.append(key, String(value))
      }
    }

    formData.append('order_id', String(orderForm?.id))
    formData.append('request_work', orderForm.request_work)
    formData.append('notes', orderForm.notes)

    if (quotation.quotation_special === 1 && quotationSpecialStatus?.value !== null) {
      formData.append('project_status_id', quotationSpecialStatus.value)
    }

    if (receiptFiles?.length) {
      receiptFiles.forEach((item: any, index: number) => {
        if (item.id) {
          formData.append(`existing_order_files[${index}][order_file_id]`, item.id)
        }
      })
    }

    orderForm.order_details.forEach((item, index) => {
      if (item) {
        appendIfNotDefault(`order_details[${index}][id]`, item.id)
        appendIfNotDefault(`order_details[${index}][item_id]`, item.item_id)
        appendIfNotDefault(`order_details[${index}][item_code]`, item.item_code)
        appendIfNotDefault(`order_details[${index}][item_name]`, item.item_name)
        appendIfNotDefault(`order_details[${index}][item_notes]`, item.item_notes)
        appendIfNotDefault(`order_details[${index}][quantity]`, item.quantity)
      }
    })

    try {
      await axios
        .post(`${apiUrl}/orders/${orderForm?.id}`, formData, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })
        .then(() => {
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        })
    } catch (error) {
      console.error(error)
    }
  }

  // Quotation Validation
  const QuotationValidation = () => {
    let valid = true

    if (
      (quotation.receipt_quotation === null || quotation.receipt_quotation === '') &&
      quotation.quotation_special === 0
    ) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi formulir receipt quotation',
        icon: 'warning',
      })
      valid = false
    } else if (quotation.receipts_quotation.length === 0 && quotation.quotation_special === 1) {
      Swal.fire({
        title: 'Warning',
        text: 'Mohon untuk mengisi formulir receipt quotation tahap 1',
        icon: 'warning',
      })
      valid = false
    } else if (receiptQuotation.length === 0) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi bukti receipt quotation',
        icon: 'warning',
      })
      valid = false
    } else if (quotationFiles.length === 0) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi bukti transfer quotation',
        icon: 'warning',
      })
      valid = false
    }
    return valid
  }

  const handleUpdateQuotation = async () => {
    if (!QuotationValidation()) {
      setLoadingUpdate(false)
      return false
    }

    setLoadingUpdate(true)
    const formData = new FormData()
    const appendIfNotDefault = (formData: any, key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        formData.append(key, String(value))
      }
    }

    formData.append('order_id', String(quotation.order_id))
    formData.append('store_id', String(quotation.store_id))
    formData.append('description', quotation.description)
    formData.append('quotation_status', verificationStatus?.value)
    formData.append('quotation_number', String(quotation.quotation_number))
    formData.append('quotation_special', String(quotation.quotation_special))
    formData.append('quotation_date', quotation.quotation_date)
    formData.append('quotation_validity', quotation.quotation_validity)
    formData.append('quotation_disc', String(quotation.quotation_disc))
    formData.append('readiness', String(4))
    // formData.append('quotation_promotion', String(quotation.quotation_promotion))

    if (quotation.receipt_quotation !== null) {
      formData.append('receipt_quotation', quotation.receipt_quotation)
    }

    if (quotation.quotation_promotion !== null) {
      formData.append('promotion_id', String(quotation.quotation_promotion))
    }

    quotation.quotation_details.forEach((quotation, index) => {
      appendIfNotDefault(formData, `quotation_details[${index}][id]`, quotation.id)
      appendIfNotDefault(formData, `quotation_details[${index}][item_id]`, quotation.item_id)
      appendIfNotDefault(formData, `quotation_details[${index}][type]`, quotation.type)
      appendIfNotDefault(formData, `quotation_details[${index}][name]`, quotation.item_name)
      appendIfNotDefault(formData, `quotation_details[${index}][unit]`, quotation.unit)
      appendIfNotDefault(formData, `quotation_details[${index}][work_step]`, quotation.work_step)

      formData.append(`quotation_details[${index}][price]`, String(quotation.unit_price))
      formData.append(`quotation_details[${index}][quantity]`, String(quotation.quantity))
      formData.append(`quotation_details[${index}][margin]`, String(quotation.margin))
      formData.append(`quotation_details[${index}][margin_type]`, String(quotation.margin_type))
      formData.append(`quotation_details[${index}][is_customer]`, String(quotation.is_user))
      appendIfNotDefault(
        formData,
        `quotation_details[${index}][work_order_item_id]`,
        quotation.work_order_item_id
      )
      appendIfNotDefault(
        formData,
        `quotation_details[${index}][category_id]`,
        quotation.category_id
      )
    })

    if (quotation?.quotation_special === 1) {
      quotation.receipts_quotation.forEach((receipt, index) => {
        appendIfNotDefault(formData, `receipts_quotation[${index}][id]`, receipt.id)
        appendIfNotDefault(
          formData,
          `receipts_quotation[${index}][receipt_quotation]`,
          receipt.receipt_quotation
        )
        appendIfNotDefault(
          formData,
          `receipts_quotation[${index}][quotation_step]`,
          receipt.quotation_step
        )
      })
    }

    if (receiptQuotation?.length) {
      receiptQuotation.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`quotation_receipts`, item, item.name)
        }
      })
    }

    if (quotationFiles?.length) {
      quotationFiles.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`quotation_files`, item, item.name)
        }
      })
    }

    if (quotationFiles?.length) {
      quotationFiles.forEach((item: any, index: number) => {
        if (item.id) {
          formData.append(`preserve_files[${index}]`, item.id)
        }
      })
    }

    await axios
      .post(`${apiUrl}/quotation/${quotation.id}`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })
      .then((response) => {
        if (response.data.status === 201 || response.data.status === 200) {
          Swal.fire({
            title: 'Success',
            text: 'Berhasil Verifikasi Pembayaran',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            handleUpdateRequestSurvey()
          })

          setLoadingUpdate(false)
        } else {
          Swal.fire({
            title: 'Warning',
            text: response.data.message,
            icon: 'warning',
          })

          setLoadingUpdate(false)
        }
      })
      .catch((error) => {
        setLoadingUpdate(false)

        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
        })
      })
  }

  const handleTriggerEmail = async () => {
    if (orderDetail?.members?.email === '') {
      Swal.fire({
        title: 'Member ini tidak mempunyai email sehingga tidak dapat mengirimkan email',
        icon: 'warning',
        showConfirmButton: true,
        showDenyButton: false,
        confirmButtonColor: '#6b9230',
        confirmButtonText: 'Ok',
      })

      return false
    }

    Swal.fire({
      title: 'Apakah anda yakin ingin mengirim email berisi formulir csi kepada customer?',
      icon: 'question',
      showConfirmButton: true,
      confirmButtonColor: '#6b9230',
      cancelButtonColor: '#d33',
      showDenyButton: true,
      confirmButtonText: 'Ya',
      denyButtonText: 'Tidak',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(
            `${apiUrl}/csi/${selectedCSI?.value}/send/${orderDetail?.id}`,
            null,
            {
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                // 'Access-Control-Allow-Origin': '*',
               // 'ngrok-skip-browser-warning':  'true',
              },
            }
          )

          if (response.data.status === 200 || response.data.status === 201) {
            Swal.fire({
              title: 'Success',
              text: 'Success Send Email',
              icon: 'success',
              showConfirmButton: false,
              timer: 1500,
            })

            setLoadingUpdate(false)
          } else {
            Swal.fire({
              title: 'Error',
              text: response.data.message,
              icon: 'error',
            })

            setLoadingUpdate(false)
          }

          window.location.reload()
        } catch (error: any) {
          setLoadingUpdate(false)
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
          })
        }
      }
    })
  }

  // CSI Modal
  const CustomerIndexModal = ({orderDetail, loadingModal, mailLogs}: any) => {
    return (
      <>
        <Modal.Header closeButton>
          <Skeleton active loading={loadingModal} paragraph={{rows: 0}}>
            <Modal.Title>History Aktivitas Email - Order ID {orderDetail?.id}</Modal.Title>
          </Skeleton>
        </Modal.Header>

        <Modal.Body>
          <Tab.Container activeKey={activeKey} onSelect={(key) => setActiveKey(Number(key))}>
            <Nav fill variant='tabs' className='mt-2 mb-5'>
              <Nav.Item style={{cursor: 'pointer'}}>
                <Nav.Link eventKey={1}>Log Aktivitas Email</Nav.Link>
              </Nav.Item>

              {!['Sales', 'Store CS'].includes(userRole) && (
                <Nav.Item style={{cursor: 'pointer'}}>
                  <Nav.Link eventKey={2}>Kirim Email CSI</Nav.Link>
                </Nav.Item>
              )}
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey={1}>
                <div className='fs-6 mb-3'>
                  *Informasi yang tertera pada tabel dibawah ini adalah informasi mengenai aktivitas
                  email yang telah dikirimkan oleh sistem
                </div>

                <table className='table hover responsive'>
                  <thead className='table-warranty-head'>
                    <tr>
                      <th>Judul Email</th>
                      <th>Waktu dan Tanggal Email Dikirimkan</th>
                    </tr>
                  </thead>

                  <tbody>
                    {mailLogs && mailLogs.length > 0 ? (
                      mailLogs.map((item: any, index: number) => (
                        <tr key={`${index} - email_log`}>
                          <td>{item?.emailMessages?.title || 'No Title'}</td>
                          <td>{formatDateWithTimeZone(item?.createdAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td>-</td>
                        <td>Belum ada email yang dikirim oleh sistem</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Tab.Pane>

              <Tab.Pane eventKey={2}>
                <Row className='mb-5'>
                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                      <Form.Label className='fs-6 fw-bold'>
                        Nama Toko :{' '}
                        <span className='fs-6 ms-2 fw-normal'>
                          {orderDetail?.store?.store_name ?? ''}
                        </span>
                      </Form.Label>
                      <br></br>
                      <Form.Label className='fs-6 fw-bold'>
                        Quotation ID :{' '}
                        <span className='fs-6 ms-2 fw-normal'>
                          {orderDetail?.quotation?.length ? orderDetail?.quotation[0]?.id : ''}
                        </span>
                      </Form.Label>
                    </Skeleton>
                  </Col>

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                      <Form.Label className='fs-6 fw-bold'>
                        Receipt Number :
                        <span className='fs-6 ms-2 fw-normal'>
                          {orderDetail?.receipt_number ?? '-'}
                        </span>
                      </Form.Label>
                      <br></br>
                      {orderDetail?.quotation[0]?.receipt_quotation && (
                        <>
                          <Form.Label className='fs-6 fw-bold'>
                            Receipt Transaksi :
                            <span className='fs-6 ms-2 fw-normal'>
                              {orderDetail?.quotation[0]?.receipt_quotation}
                            </span>
                          </Form.Label>
                          <br></br>
                        </>
                      )}
                      <Form.Label className='fs-6 fw-bold'>
                        Order Status :
                        <span className='fs-6 ms-2 fw-bold text-success'>
                          {orderDetail?.status?.description}
                        </span>
                      </Form.Label>
                    </Skeleton>
                  </Col>
                </Row>

                <Row className='mb-5'>
                  <Skeleton active loading={loadingModal} paragraph={{rows: 0}}>
                    <div className='fs-4 fw-bold mb-1'>Informasi Pembeli</div>
                  </Skeleton>

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Skeleton active loading={loadingModal} paragraph={{rows: 2}}>
                      <Form.Label className='fs-6 fw-semibold'>
                        No Member :{' '}
                        <span className='fs-6 ms-2 fw-normal'>
                          {orderDetail?.members?.member_number}
                        </span>
                      </Form.Label>
                      <br></br>
                      <Form.Label className='fs-6 fw-semibold'>
                        Customer Name :
                        <span className='fs-6 ms-2 fw-normal'>
                          {orderDetail?.members?.full_name}{' '}
                        </span>
                      </Form.Label>
                      <br></br>
                      <Form.Label className='fs-6 fw-semibold'>
                        Alamat Pemasangan :
                        <span className='fs-6 ms-2 fw-normal'>{orderDetail?.project_address} </span>
                      </Form.Label>
                    </Skeleton>
                  </Col>

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                      <Form.Label className='fs-6 fw-semibold'>
                        Nomor Telp/WA :
                        <span className='fs-6 ms-2 fw-normal'>{orderDetail?.project_number}</span>
                      </Form.Label>
                      <br></br>
                      <Form.Label className='fs-6 fw-semibold'>
                        Alamat Email :
                        <span className='fs-6 ms-2 fw-normal'>{orderDetail?.members?.email} </span>
                      </Form.Label>
                    </Skeleton>
                  </Col>
                </Row>

                <Skeleton active loading={loadingModal} paragraph={{rows: 3}}>
                  {(() => {
                    if (
                      (orderDetail?.payment_type === 'survey' &&
                        orderDetail?.work_orders === null) ||
                      (orderDetail?.work_orders?.work_order_status.length === 1 &&
                        orderDetail?.payment_type === 'survey')
                    ) {
                      return (
                        <div className='table-warranty-content'>
                          {orderDetail?.is_overdistance === 1 && (
                            <>
                              <Form.Text className='fs-8 text-dark'>
                                *Order ini lebih dari{' '}
                                <span className='fw-bolder text-decoration-underline'>10 KM</span>{' '}
                                dari toko sehingga dikenakan biaya tambahan
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
                              {orderDetail?.order_details.map((item: any, index: any) => (
                                <>
                                  <tr key={`${index} - order_detail`}>
                                    <td>{item?.item_code}</td>
                                    <td>{item?.item_name}</td>
                                    <td>{item?.item_notes}</td>
                                    <td>{item?.quantity ?? 0}</td>
                                  </tr>
                                </>
                              ))}

                              <tr>
                                <td colSpan={3} className='text-end fw-bolder'>
                                  Biaya Survey
                                </td>

                                <td className=' fw-bolder'>Rp. 99.000</td>
                              </tr>

                              {orderDetail?.is_overdistance === 1 && (
                                <>
                                  <tr>
                                    <td colSpan={3} className='text-end fw-bolder align-middle'>
                                      Biaya Tambahan
                                    </td>

                                    <td className=' fw-bolder'>{`Rp. ${Number(
                                      orderDetail?.additional_fee
                                    ).toLocaleString('id')}`}</td>
                                  </tr>

                                  <tr>
                                    <td colSpan={3} className='text-end fw-bolder'>
                                      Grand Total
                                    </td>

                                    <td className=' fw-bolder'>{`Rp. ${Number(
                                      orderDetail?.grand_total
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
                        orderDetail?.work_orders?.work_order_status[0]?.status?.category
                      ) &&
                      orderDetail?.payment_type === 'survey' &&
                      orderDetail?.work_orders?.work_order_status.length >= 1 &&
                      orderDetail?.quotation?.length === 0
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
                              {orderDetail?.work_orders?.work_order_status[0]?.work_order_items
                                .length ? (
                                orderDetail.work_orders.work_order_status[0].work_order_items.map(
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
                      orderDetail?.work_orders?.work_order_status.length >= 1 &&
                      orderDetail?.quotation?.length >= 1 &&
                      orderDetail?.payment_type === 'survey'
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
                              {orderDetail?.quotation[0]?.quotation_details
                                .filter((x: any) => x.item_type === 2)
                                .map((item: any, index: any) => (
                                  <tr key={`${index}-quotation`}>
                                    <td>
                                      {item?.name ?? '-'}{' '}
                                      {item?.is_customer === true
                                        ? '( Disediakan oleh customer )'
                                        : ''}
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
                              {orderDetail?.quotation[0]?.quotation_details
                                .filter((x: any) => x.item_type === 1)
                                .map((item: any, index: any) => (
                                  <tr key={`${index}-quotation`}>
                                    <td>
                                      {item?.name ?? '-'}{' '}
                                      {item?.is_customer === true
                                        ? '( Disediakan oleh customer )'
                                        : ''}
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
                                  orderDetail?.quotation[0]?.quotation_details
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
                                  orderDetail?.quotation[0]?.quotation_details
                                    .filter((x: any) => x.item_type === 1)
                                    .reduce(
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
                                    orderDetail?.quotation[0]?.quotation_disc ?? 0
                                  ).toLocaleString('id')}`}
                                </td>
                              </tr>

                              <tr>
                                <td colSpan={3} className='text-end fw-bolder'>
                                  {`${
                                    orderDetail?.quotation[0]?.promotion
                                      ? `Additional Promotion (${orderDetail?.quotation[0]?.promotion?.name})`
                                      : `Additional Promotion`
                                  }`}
                                </td>

                                <td className=' fw-bolder'>
                                  {orderDetail?.quotation[0]?.promotion?.promotion_type === 1
                                    ? `${orderDetail?.quotation[0]?.promotion?.promotion} %`
                                    : `Rp. ${parseInt(
                                        orderDetail?.quotation[0]?.promotion?.promotion ?? 0
                                      ).toLocaleString('id')}`}
                                </td>
                              </tr>

                              <tr>
                                <td colSpan={3} className='text-end fw-bolder'>
                                  Grand Total
                                </td>
                                <td className=' fw-bolder'>
                                  {`Rp. ${parseInt(
                                    orderDetail?.quotation[0]?.quotation_grand_total ?? 0
                                  ).toLocaleString('id')}`}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )
                    } else if (
                      orderDetail?.payment_type === 'gratis' ||
                      orderDetail?.payment_type === 'pemasangan_tanpa_survey'
                    ) {
                      return (
                        <div className='table-warranty-content'>
                          {orderDetail?.is_overdistance === 1 && (
                            <>
                              <Form.Text className='fs-8 text-dark'>
                                *Order ini lebih dari{' '}
                                <span className='fw-bolder text-decoration-underline'>10 KM</span>{' '}
                                dari toko sehingga dikenakan biaya tambahan
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
                                {!(orderDetail?.payment_type === 'gratis') && (
                                  <>
                                    <th>Harga Jasa</th>
                                    <th>Jumlah</th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {orderDetail?.order_details.map((item: any, index: any) => (
                                <>
                                  <tr key={`${index} - order_detail`}>
                                    <td>{item?.item_code}</td>
                                    <td>{item?.item_name}</td>
                                    <td>{item?.item?.service_name}</td>
                                    <td>{item?.quantity ?? 0}</td>
                                    {!(orderDetail?.payment_type === 'gratis') && (
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
                              ))}

                              {orderDetail?.is_overdistance === 1 && (
                                <>
                                  <tr>
                                    <td
                                      colSpan={orderDetail?.payment_type !== 'gratis' ? 5 : 3}
                                      className='text-end fw-bolder align-middle'
                                    >
                                      Biaya Tambahan
                                    </td>

                                    <td className=' fw-bolder'>{`Rp. ${Number(
                                      orderDetail?.additional_fee
                                    ).toLocaleString('id')}`}</td>
                                  </tr>
                                </>
                              )}

                              <tr>
                                <td
                                  colSpan={orderDetail?.payment_type !== 'gratis' ? 5 : 3}
                                  className='text-end fw-bolder'
                                >
                                  Grand Total
                                </td>

                                <td className=' fw-bolder'>{`Rp. ${Number(
                                  orderDetail?.grand_total
                                ).toLocaleString('id')}`}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )
                    }
                  })()}
                </Skeleton>

                <Row className='mt-5 mb-5'>
                  <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                    <Form.Group className='header-template mb-4'>
                      <Form.Label className='fs-5'>Pilih Format Formulir CSI :</Form.Label>
                      <Select
                        className='form-control p-0'
                        isSearchable={true}
                        placeholder='Pilih Judul Format'
                        options={csiData}
                        value={{
                          label: selectedCSI?.label ?? '',
                          value: selectedCSI?.value ?? null,
                        }}
                        onChange={(newValue) => setSelectedCSI(newValue)}
                      />
                    </Form.Group>
                  </Skeleton>
                </Row>

                <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                  <div className='button-submit d-flex justify-content-center align-items-center'>
                    <Button
                      className='d-flex justify-content-center align-items-center'
                      onClick={handleTriggerEmail}
                      disabled={
                        orderDetail?.members?.email === '' ? true : loadingUpdate ? true : false
                      }
                      variant='dark-primary'
                    >
                      {orderDetail?.members?.email === ''
                        ? 'Tidak dapat mengirim email karena user tidak mempunyai email'
                        : loadingUpdate
                        ? 'Submitting..'
                        : 'Submit'}
                    </Button>
                  </div>
                </Skeleton>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Modal.Body>
      </>
    )
  }

  // Quotation Modal
  const QuotationModal = ({
    orderDetail,
    loadingModal,
    handleReceiptClick,
    handleReceiptChange,
    handleUpdateQuotation,
    loadingUpdate,
    receiptQuotation,
    quotationFiles,
    handleFileReceipt,
    handleRemoveReceipt,
    handleImageClick,
    handleFileChange,
    handleFileClick,
    handleRemoveFile,
  }: any) => {
    return (
      <>
        <Modal.Header closeButton>
          <Skeleton active loading={loadingModal} paragraph={{rows: 0}}>
            <Modal.Title>Verifikasi Pembayaran Quotation - Order ID {orderDetail?.id}</Modal.Title>
          </Skeleton>
        </Modal.Header>

        <Modal.Body>
          <Row className='mb-5'>
            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                <Form.Label className='fs-6 fw-bold'>
                  Nama Toko :{' '}
                  <span className='fs-6 ms-2 fw-normal'>
                    {orderDetail?.store?.store_name ?? ''}
                  </span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-6 fw-bold'>
                  Quotation ID :{' '}
                  <span className='fs-6 ms-2 fw-normal'>
                    {orderDetail?.quotation?.length ? orderDetail?.quotation[0]?.id : ''}
                  </span>
                </Form.Label>
              </Skeleton>
            </Col>

            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                <Form.Label className='fs-6 fw-bold'>
                  Receipt Number :
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.receipt_number ?? '-'}</span>
                </Form.Label>

                {orderDetail?.quotation[0]?.receipt_quotation &&
                  orderDetail?.quotation[0]?.quotation_special === 0 && (
                    <>
                      <br></br>
                      <Form.Label className='fs-6 fw-bold'>
                        Receipt Quotation :
                        <span className='fs-6 ms-2 fw-normal'>
                          {orderDetail?.quotation[0]?.receipt_quotation}
                        </span>
                      </Form.Label>
                      <br></br>
                    </>
                  )}

                <Form.Label className='fs-6 fw-bold'>
                  Order Status :
                  <span className='fs-6 ms-2 fw-bold text-success'>
                    {orderDetail?.status?.description}
                  </span>
                </Form.Label>
              </Skeleton>
            </Col>
          </Row>

          <Row>
            <Skeleton active loading={loadingModal} paragraph={{rows: 0}}>
              <div className='fs-4 fw-bold mb-1'>Informasi Pembeli</div>
            </Skeleton>

            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Skeleton active loading={loadingModal} paragraph={{rows: 2}}>
                <Form.Label className='fs-6 fw-semibold'>
                  No Member :{' '}
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.members?.member_number}</span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-6 fw-semibold'>
                  Customer Name :
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.members?.full_name} </span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-6 fw-semibold'>
                  Alamat Pemasangan :
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.project_address} </span>
                </Form.Label>
              </Skeleton>
            </Col>

            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                <Form.Label className='fs-6 fw-semibold'>
                  Nomor Telp/WA :
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.project_number}</span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-6 fw-semibold'>
                  Alamat Email :
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.members?.email} </span>
                </Form.Label>
              </Skeleton>
            </Col>
          </Row>

          <Skeleton active loading={loadingModal} paragraph={{rows: 3}}>
            {orderDetail?.quotation?.length && (
              <Row className='information-detail'>
                <div className='table-warranty-content'>
                  {orderDetail?.quotation[0]?.quotation_special === 0 ? (
                    <table className='table hover responsive'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th className='text-center' style={{width: '355px'}}>
                            Jenis Jasa
                          </th>

                          <th className='text-center' style={{width: '80px'}}>
                            QTY
                          </th>

                          <th className='text-center' style={{width: '150px'}}>
                            Satuan
                          </th>

                          <th className='text-center' style={{width: '250px'}}>
                            Final Price
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {orderDetail?.quotation[0]?.quotation_details
                          .filter((x: any) => x.item_type === 2)
                          .map((item: any, index: any) => (
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
                  ) : (
                    <>
                      <div className='mt-2 mb-2'>
                        <p className='fs-6 text-black'>Keterangan : </p>
                        <p className='fs-6 fw-semibold text-black'>
                          *Quotation ini menggunakan quotation tipe spesial
                        </p>
                        <p className='fs-6 fw-semibold text-black'>
                          *Quotation spesial merupakan quotation yang nominalnya diatas 20.000.000
                        </p>
                      </div>

                      <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 1</div>

                      {orderDetail?.quotation[0]?.quotation_receipt[0]?.receipt_quotation &&
                        orderDetail?.quotation[0]?.quotation_special === 1 && (
                          <div className='fs-6 fw-bold'>
                            Receipt Quotation Tahap 1 :{' '}
                            <span className='fs-6 fw-semibold'>
                              {orderDetail?.quotation[0]?.quotation_receipt[0]?.receipt_quotation ??
                                '-'}
                            </span>
                          </div>
                        )}

                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th className='text-center' style={{width: '355px'}}>
                              Jenis Jasa
                            </th>

                            <th className='text-center' style={{width: '80px'}}>
                              QTY
                            </th>

                            <th className='text-center' style={{width: '150px'}}>
                              Satuan
                            </th>

                            <th className='text-center' style={{width: '250px'}}>
                              Final Price
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {orderDetail?.quotation[0]?.quotation_details
                            .filter((x: any) => x.item_type === 2 && x.work_step === 1)
                            .map((item: any, index: any) => (
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

                      <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 2</div>

                      {orderDetail?.quotation[0]?.quotation_receipt[1]?.receipt_quotation &&
                        orderDetail?.quotation[0]?.quotation_special === 1 && (
                          <div className='fs-6 fw-bold'>
                            Receipt Quotation Tahap 1 :{' '}
                            <span className='fs-6 fw-semibold'>
                              {orderDetail?.quotation[0]?.quotation_receipt[1]?.receipt_quotation ??
                                '-'}
                            </span>
                          </div>
                        )}

                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th className='text-center' style={{width: '355px'}}>
                              Jenis Jasa
                            </th>

                            <th className='text-center' style={{width: '80px'}}>
                              QTY
                            </th>

                            <th className='text-center' style={{width: '150px'}}>
                              Satuan
                            </th>

                            <th className='text-center' style={{width: '250px'}}>
                              Final Price
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {orderDetail?.quotation[0]?.quotation_details
                            .filter((x: any) => x.item_type === 2 && x.work_step === 2)
                            .map((item: any, index: any) => (
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

                      <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 3</div>

                      {orderDetail?.quotation[0]?.quotation_receipt[2]?.receipt_quotation &&
                        orderDetail?.quotation[0]?.quotation_special === 1 && (
                          <div className='fs-6 fw-bold'>
                            Receipt Quotation Tahap 1 :{' '}
                            <span className='fs-6 fw-semibold'>
                              {orderDetail?.quotation[0]?.quotation_receipt[2]?.receipt_quotation ??
                                '-'}
                            </span>
                          </div>
                        )}

                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th className='text-center' style={{width: '355px'}}>
                              Jenis Jasa
                            </th>

                            <th className='text-center' style={{width: '80px'}}>
                              QTY
                            </th>

                            <th className='text-center' style={{width: '150px'}}>
                              Satuan
                            </th>

                            <th className='text-center' style={{width: '250px'}}>
                              Final Price
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {orderDetail?.quotation[0]?.quotation_details
                            .filter((x: any) => x.item_type === 2 && x.work_step === 3)
                            .map((item: any, index: any) => (
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
                    </>
                  )}

                  <table className='table hover responsive'>
                    <thead className='table-warranty-head'>
                      <tr>
                        <th className='text-center' style={{width: '355px'}}>
                          Material Yang Dibutuhkan
                        </th>

                        <th className='text-center' style={{width: '80px'}}>
                          QTY
                        </th>

                        <th className='text-center' style={{width: '150px'}}>
                          Satuan
                        </th>

                        <th className='text-center' style={{width: '250px'}}>
                          Final Price
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {orderDetail?.quotation[0]?.quotation_details
                        .filter((x: any) => x.item_type === 1)
                        .map((item: any, index: any) => (
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
                          orderDetail?.quotation[0]?.quotation_details
                            .filter((x: any) => x.item_type === 2)
                            .reduce(
                              (total: any, item: any) => total + parseInt(item.final_price || 0),
                              0
                            )
                        ).toLocaleString('id')}`}</td>
                      </tr>

                      <tr>
                        <td colSpan={3} className='text-end fw-bolder'>
                          Total Material
                        </td>
                        <td className='fw-bolder'>{`Rp. ${parseInt(
                          orderDetail?.quotation[0]?.quotation_details
                            .filter((x: any) => x.item_type === 1)
                            .reduce(
                              (total: any, item: any) => total + parseInt(item.final_price || 0),
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
                            orderDetail?.quotation[0]?.quotation_disc ?? 0
                          ).toLocaleString('id')}`}
                        </td>
                      </tr>

                      <tr>
                        <td colSpan={3} className='text-end fw-bolder'>
                          {`${
                            orderDetail?.quotation[0]?.promotion
                              ? `Additional Promotion (${orderDetail?.quotation[0]?.promotion?.name})`
                              : `Additional Promotion`
                          }`}
                        </td>

                        <td className=' fw-bolder'>
                          {orderDetail?.quotation[0]?.promotion?.promotion_type === 1
                            ? `${orderDetail?.quotation[0]?.promotion?.promotion ?? 0} %`
                            : `Rp. ${parseInt(
                                orderDetail?.quotation[0]?.promotion?.promotion ?? 0
                              ).toLocaleString('id')}`}
                        </td>
                      </tr>

                      <tr>
                        <td colSpan={3} className='text-end fw-bolder'>
                          Grand Total
                        </td>

                        <td className=' fw-bolder'>
                          {`Rp. ${parseInt(
                            orderDetail?.quotation[0]?.quotation_grand_total ?? 0
                          ).toLocaleString('id')}`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Row>
            )}
          </Skeleton>

          {orderDetail?.quotation[0]?.quotation_special === 1 && (
            <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
              <hr />

              <div className='fs-6 fw-semibold p-0 mb-2'>Preview Pembayaran</div>

              <table className='table hover responsive'>
                <thead className='table-warranty-head'>
                  <tr>
                    <th>Tahap Pembayaran</th>
                    <th>Persentase</th>
                    <th>Nominal Pembayaran</th>
                  </tr>
                </thead>

                <tbody>
                  {paymentStages.map((stage, index) => (
                    <tr key={index}>
                      <td>{stage.stage}</td>
                      <td>{stage.percentage}</td>
                      <td>{`${stage.amount.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      })}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Skeleton>
          )}

          <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
            {orderDetail?.quotation[0]?.quotation_special === 0 ? (
              <Row>
                <Form.Group className='mb-5'>
                  <Form.Label className='title'>Receipt Quotation</Form.Label>
                  <Form.Control
                    ref={singleReceipt}
                    type='text'
                    placeholder='Isi nomor receipt transaksi..'
                    value={quotation.receipt_quotation}
                    onChange={(e) =>
                      setQuotation((prev) => ({
                        ...prev,
                        receipt_quotation: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Row>
            ) : (
              <>
                {quotation.receipts_quotation.map((receipt, index) => (
                  <Form.Group className='mb-5' key={`receipt-${index}`}>
                    <Form.Label className='title'>Receipt Quotation Tahap {index + 1}</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder={`Isi nomor receipt transaksi tahap ${index + 1}`}
                      value={receipt.receipt_quotation}
                      onChange={(e) => handleMultiReceiptChange(receipt.index, e.target.value)}
                      ref={(el: any) => (receiptRefs.current[receipt.index] = el)}
                      onFocus={() => setFocusedIndex(receipt.index)}
                    />
                  </Form.Group>
                ))}
              </>
            )}

            <Row>
              <Col md={6}>
                <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
                  <Form.Group>
                    <Form.Label>Upload Bukti Receipt Quotation</Form.Label>

                    <Form className='form-input-image' onClick={handleReceiptClick}>
                      <Form.Control
                        type='file'
                        accept='image/jpeg, image/png'
                        className='input-field-receipt'
                        multiple
                        hidden
                        id='file-input'
                        ref={evidenceRef}
                        onChange={handleReceiptChange}
                      />

                      <div className='input-image-text'>
                        <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                        <p>Add File</p>
                      </div>
                    </Form>

                    <ListGroup className='pt-3'>
                      {receiptQuotation.length ? (
                        receiptQuotation.map((item: any, index: number) => (
                          <ListGroup>
                            <ListGroup.Item
                              className='d-flex justify-content-between align-items-center'
                              key={`${item?.name}-${index}-${item?.type}`}
                            >
                              <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                              <span
                                className='upload-content'
                                style={{cursor: 'pointer'}}
                                onClick={() => handleFileReceipt(index)}
                              >
                                {item?.name}
                              </span>

                              <FontAwesomeIcon
                                icon={faTrash}
                                size='sm'
                                color='#ed2b2a'
                                style={{cursor: 'pointer'}}
                                onClick={(e) => handleRemoveReceipt(index)}
                              />
                            </ListGroup.Item>

                            {selectedReceiptIndex === index && item && (
                              <Image
                                key={`${previewReceipt} - ${index}`}
                                width={200}
                                style={{display: 'none'}}
                                src={
                                  item instanceof File
                                    ? URL.createObjectURL(item)
                                    : `${apiUrl}/public/quotation/${previewReceipt}`
                                }
                                preview={{
                                  visible: visibleReceipt,
                                  src:
                                    item instanceof File
                                      ? URL.createObjectURL(item)
                                      : `${apiUrl}/public/quotation/${previewReceipt}`,
                                  onVisibleChange: (value) => {
                                    setVisibleReceipt(value)
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
                </Row>
              </Col>

              <Col md={6}>
                <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
                  <Form.Group>
                    <Form.Label>Upload Bukti Transfer Quotation</Form.Label>

                    <Form className='form-input-image' onClick={handleImageClick}>
                      <Form.Control
                        type='file'
                        accept='image/jpeg, image/png'
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
                      {quotationFiles.length ? (
                        quotationFiles.map((item: any, index: number) => (
                          <ListGroup>
                            <ListGroup.Item
                              className='d-flex justify-content-between align-items-center'
                              key={`${item?.name}-${index}-${item?.type}`}
                            >
                              <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                              <span
                                className='upload-content'
                                style={{cursor: 'pointer'}}
                                onClick={() => handleFileClick(index)}
                              >
                                {item?.name}
                              </span>

                              <FontAwesomeIcon
                                icon={faTrash}
                                size='sm'
                                color='#ed2b2a'
                                style={{cursor: 'pointer'}}
                                onClick={(e) => handleRemoveFile(index)}
                              />
                            </ListGroup.Item>

                            {selectedFileIndex === index && item && (
                              <Image
                                key={`${previewImage} - ${index}`}
                                width={200}
                                style={{display: 'none'}}
                                src={
                                  item instanceof File
                                    ? URL.createObjectURL(item)
                                    : `${apiUrl}/public/quotation/${previewImage}`
                                }
                                preview={{
                                  visible: visible,
                                  src:
                                    item instanceof File
                                      ? URL.createObjectURL(item)
                                      : `${apiUrl}/public/quotation/${previewImage}`,
                                  onVisibleChange: (value) => {
                                    setVisible(value)
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
                </Row>
              </Col>
            </Row>

            <hr />

            <Row>
              <Col>
                <Form.Group className='mb-5'>
                  <Form.Label className='title'>Tanggal Request Pengerjaan</Form.Label>
                  <Form.Control
                    name='request_work'
                    type='date'
                    placeholder='Isi tanggal request pengerjaan..'
                    min={today}
                    value={orderForm?.request_work ?? ''}
                    onChange={(e) => setOrderForm({...orderForm, request_work: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className='mb-5'>
                  <Form.Label className='title'>Catatan</Form.Label>
                  <Form.Control
                    name='notes'
                    type='text'
                    placeholder='Isi catatan toko..'
                    value={orderForm?.notes ?? ''}
                    ref={notes}
                    onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                  />
                </Form.Group>

                <div className='description fs-7 mb-5'>
                  Informasi mengenai ketersediaan dari Vendor
                </div>

                <div className='vendor-avail'>
                  <table className='table hover responsive'>
                    <thead className='table-warranty-head'>
                      <tr>
                        <th>Nama Vendor</th>
                        <th>Service Type</th>
                        <th>Ketersediaan Vendor</th>
                      </tr>
                    </thead>

                    <tbody>
                      {vendor.map((item: any) => (
                        <tr key={item?.id}>
                          <td>{item?.company_name ?? '-'}</td>
                          <td>
                            {Array.from(
                              new Set(
                                item?.vendor_service?.map(
                                  (item: any) => item?.service_type?.service_type
                                )
                              )
                            ).join(', ')}
                          </td>
                          <td>{vendorAvailbility(item)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Col>
            </Row>

            <div className='button-submit d-flex justify-content-center align-items-center'>
              <Button
                className='d-flex justify-content-center align-items-center'
                onClick={handleUpdateQuotation}
                disabled={loadingUpdate}
                variant='dark-primary'
              >
                {loadingUpdate ? 'Submitting..' : 'Submit'}
              </Button>
            </div>
          </Skeleton>
        </Modal.Body>
      </>
    )
  }

  // Refund Modal
  const RefundModal = ({orderDetail, loadingModal}: any) => {
    return (
      <>
        <Modal.Header closeButton>
          <Skeleton active loading={loadingModal} paragraph={{rows: 0}}>
            <Modal.Title>Permintaan Refund - Order ID {orderDetail?.id}</Modal.Title>
          </Skeleton>
        </Modal.Header>

        <Modal.Body>
          <Row className='mb-5'>
            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                <Form.Label className='fs-6 fw-bold'>
                  Nama Toko :{' '}
                  <span className='fs-6 ms-2 fw-normal'>
                    {orderDetail?.store?.store_name ?? ''}
                  </span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-6 fw-bold'>
                  Quotation ID :{' '}
                  <span className='fs-6 ms-2 fw-normal'>
                    {orderDetail?.quotation?.length ? orderDetail?.quotation[0]?.id : ''}
                  </span>
                </Form.Label>
              </Skeleton>
            </Col>

            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                <Form.Label className='fs-6 fw-bold'>
                  Receipt Number :
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.receipt_number ?? '-'}</span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-6 fw-bold'>
                  Order Status :
                  <span className='fs-6 ms-2 fw-bold text-success'>
                    {orderDetail?.status?.description}
                  </span>
                </Form.Label>
              </Skeleton>
            </Col>
          </Row>

          <Row className='mb-5'>
            <Skeleton active loading={loadingModal} paragraph={{rows: 0}}>
              <div className='fs-4 fw-bold mb-1'>Informasi Pembeli</div>
            </Skeleton>

            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Skeleton active loading={loadingModal} paragraph={{rows: 2}}>
                <Form.Label className='fs-6 fw-semibold'>
                  No Member :{' '}
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.members?.member_number}</span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-6 fw-semibold'>
                  Customer Name :
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.members?.full_name} </span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-6 fw-semibold'>
                  Alamat Pemasangan :
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.project_address} </span>
                </Form.Label>
              </Skeleton>
            </Col>

            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                <Form.Label className='fs-6 fw-semibold'>
                  Nomor Telp/WA :
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.project_number}</span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-6 fw-semibold'>
                  Alamat Email :
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.members?.email} </span>
                </Form.Label>
              </Skeleton>
            </Col>
          </Row>

          <Skeleton active loading={loadingModal} paragraph={{rows: 3}}>
            {(() => {
              if (
                (orderDetail?.payment_type === 'survey' && orderDetail?.work_orders === null) ||
                (orderDetail?.work_orders?.work_order_status.length === 1 &&
                  orderDetail?.payment_type === 'survey')
              ) {
                return (
                  <div className='table-warranty-content'>
                    {orderDetail?.is_overdistance === 1 && (
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
                        {orderDetail?.order_details.map((item: any, index: any) => (
                          <>
                            <tr key={`${index} - order_detail`}>
                              <td>{item?.item_code}</td>
                              <td>{item?.item_name}</td>
                              <td>{item?.item_notes}</td>
                              <td>{item?.quantity ?? 0}</td>
                            </tr>
                          </>
                        ))}

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Biaya Survey
                          </td>

                          <td className=' fw-bolder'>Rp. 99.000</td>
                        </tr>

                        {orderDetail?.is_overdistance === 1 && (
                          <>
                            <tr>
                              <td colSpan={3} className='text-end fw-bolder align-middle'>
                                Biaya Tambahan
                              </td>

                              <td className=' fw-bolder'>{`Rp. ${Number(
                                orderDetail?.additional_fee
                              ).toLocaleString('id')}`}</td>
                            </tr>

                            <tr>
                              <td colSpan={3} className='text-end fw-bolder'>
                                Grand Total
                              </td>

                              <td className=' fw-bolder'>{`Rp. ${Number(
                                orderDetail?.grand_total
                              ).toLocaleString('id')}`}</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                )
              } else if (
                ['QUOTEIN', 'QUOTEOUT'].includes(orderDetail?.status?.category ?? '') &&
                orderDetail?.payment_type === 'survey'
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
                        {orderDetail?.quotation[0]?.quotation_details
                          .filter((x: any) => x.item_type === 2)
                          .map((item: any, index: any) => (
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

                    {orderDetail?.quotation[0]?.quotation_details.filter(
                      (x: any) => x.item_type === 1
                    ).length ? (
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
                          {orderDetail?.quotation[0]?.quotation_details
                            .filter((x: any) => x.item_type === 1)
                            .map((item: any, index: any) => (
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
                              orderDetail?.quotation[0]?.quotation_details
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
                              orderDetail?.quotation[0]?.quotation_details
                                .filter((x: any) => x.item_type === 1)
                                .reduce(
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
                                orderDetail?.quotation[0]?.quotation_disc ?? 0
                              ).toLocaleString('id')}`}
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              {`${
                                orderDetail?.quotation[0]?.promotion
                                  ? `Additional Promotion (${orderDetail?.quotation[0]?.promotion?.name})`
                                  : `Additional Promotion`
                              }`}
                            </td>

                            <td className=' fw-bolder'>
                              {orderDetail?.quotation[0]?.promotion?.promotion_type === 1
                                ? `${orderDetail?.quotation[0]?.promotion?.promotion} %`
                                : `Rp. ${parseInt(
                                    orderDetail?.quotation[0]?.promotion?.promotion
                                  ).toLocaleString('id')}`}
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              Grand Total
                            </td>
                            <td className=' fw-bolder'>
                              {`Rp. ${parseInt(
                                orderDetail?.quotation[0]?.quotation_grand_total ?? 0
                              ).toLocaleString('id')}`}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <></>
                    )}
                  </div>
                )
              } else if (
                ['SURVEYREQ', 'SURVEYSTART', 'SURVEYDONE', 'WORKEND', 'DONE'].includes(
                  orderDetail?.work_orders?.work_order_status[0]?.status?.category
                ) &&
                orderDetail?.payment_type === 'survey' &&
                orderDetail?.work_orders?.work_order_status.length >= 1
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
                        {orderDetail?.work_orders?.work_order_status[0]?.work_order_items.length ? (
                          orderDetail.work_orders.work_order_status[0].work_order_items.map(
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
                orderDetail?.payment_type === 'gratis' ||
                orderDetail?.payment_type === 'pemasangan_tanpa_survey'
              ) {
                return (
                  <div className='table-warranty-content'>
                    {orderDetail?.is_overdistance === 1 && (
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
                          {!(orderDetail?.payment_type === 'gratis') && (
                            <>
                              <th>Harga Jasa</th>
                              <th>Jumlah</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetail?.order_details.map((item: any, index: any) => (
                          <>
                            <tr key={`${index} - order_detail`}>
                              <td>{item?.item_code}</td>
                              <td>{item?.item_name}</td>
                              <td>{item?.item?.service_name}</td>
                              <td>{item?.quantity ?? 0}</td>
                              {!(orderDetail?.payment_type === 'gratis') && (
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
                        ))}

                        {orderDetail?.is_overdistance === 1 && (
                          <>
                            <tr>
                              <td
                                colSpan={orderDetail?.payment_type !== 'gratis' ? 5 : 3}
                                className='text-end fw-bolder align-middle'
                              >
                                Biaya Tambahan
                              </td>

                              <td className=' fw-bolder'>{`Rp. ${Number(
                                orderDetail?.additional_fee
                              ).toLocaleString('id')}`}</td>
                            </tr>
                          </>
                        )}

                        <tr>
                          <td
                            colSpan={orderDetail?.payment_type !== 'gratis' ? 5 : 3}
                            className='text-end fw-bolder'
                          >
                            Grand Total
                          </td>

                          <td className=' fw-bolder'>{`Rp. ${Number(
                            orderDetail?.grand_total
                          ).toLocaleString('id')}`}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              }
            })()}
          </Skeleton>

          <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
            <div className='button-submit d-flex justify-content-center align-items-center'>
              <Button
                className='d-flex justify-content-center align-items-center'
                onClick={() => handleCancelRefund(1)}
                variant='dark-primary'
              >
                Cancel & Refund
              </Button>

              <Button
                className='d-flex justify-content-center align-items-center'
                onClick={() => handleCancelRefund(2)}
                variant='dark-primary'
              >
                Cancel & Not Refund
              </Button>
            </div>
          </Skeleton>
        </Modal.Body>
      </>
    )
  }

  // Vendor Availbility
  const vendorAvailbility = (data: any) => {
    const requestSurvey = orderForm.request_survey
    const maxOrder = data?.max_order ?? 0

    const orderVendor = (data?.orders || []).filter((x: any) => {
      const surveyDate = new Date(x.request_survey).toISOString().split('T')[0]
      return surveyDate === requestSurvey
    })

    const workOrderVendor = (data?.work_orders || []).filter((x: any) => {
      const surveyDate = new Date(x.survey_date).toISOString().split('T')[0]

      const workStartDate = x.work_start_date
        ? new Date(x.work_start_date).toISOString().split('T')[0]
        : null

      const workEndDate = x.work_end_date
        ? new Date(x.work_end_date).toISOString().split('T')[0]
        : null

      if (surveyDate && !workStartDate && !workEndDate) {
        return surveyDate === requestSurvey
      } else if (surveyDate && workStartDate && workEndDate) {
        return workStartDate <= requestSurvey && requestSurvey <= workEndDate
      } else if (!surveyDate && workStartDate && workEndDate) {
        return workStartDate <= requestSurvey && requestSurvey <= workEndDate
      } else {
        return surveyDate === requestSurvey
      }
    })

    const tukangActive = (data?.tukang || []).filter((x: any) => {
      const isActive = x.is_active === true && x.deleted_at === null
      return isActive
    }).length

    const tukangActiveAvailability = (data?.tukang || []).filter((x: any) => {
      const isAvailable =
        x.is_active === true &&
        x.deleted_at === null &&
        maxOrder > x.slot_order &&
        x.slot_order < orderVendor.length
      return isAvailable
    }).length

    if (tukangActive === 0 && orderVendor.length >= 0) {
      return <p className='text-danger'>UNAVAILABLE</p>
    } else if (tukangActiveAvailability === 0 && orderVendor.length > 0) {
      return <p className='text-danger'>FULL BOOKED</p>
    } else {
      return <p className='text-black'>AVAILABLE</p>
    }
  }

  // Export PDF Quotation
  const exportToPDF = (order_id: number, receipt_quotation: string, customer_name: string) => {
    axios
      .get(`${apiUrl}/orders/quotation-pdf/${order_id}`, {
        method: 'GET',
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute(
          'download',
          `Quotation ${
            receipt_quotation === 'UNPAID' ? 'Belum Dibayar' : 'Sudah Dibayar'
          } - ${customer_name} - Order ID ${order_id}.pdf`
        )
        document.body.appendChild(link)
        link.click()
      })
      .catch((error: any) => {
        Swal.fire('Error', 'Terjadi kesalahan saat mengekspor data', 'error')
      })
  }

  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>
  const columns: ColumnsType<DataType> = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      align: 'center',
      className: 'col_order_id',
      defaultSortOrder: 'descend',
      width: 100,
      sorter: (a: DataType, b: DataType) => a.order_id - b.order_id,
    },
    {
      title: 'Tanggal Order',
      dataIndex: 'date_order',
      key: 'date_order',
      align: 'left',
      sorter: (a: DataType, b: DataType) =>
        new Date(a.date_order).getTime() - new Date(b.date_order).getTime(),
    },
    !['Store Staff', 'Store CS'].includes(userRole) && {
      title: 'Nama Toko',
      dataIndex: 'assign_from',
      key: 'assign_from',
      align: 'left',
      className: 'col_order_id',
      width: 120,
      onFilter: (value: DataType, record: DataType) => record.assign_from.includes(String(value)),
      sorter: (a: DataType, b: DataType) => a.assign_from.length - b.assign_from.length,
    },
    {
      title: 'Nama Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      align: 'center',
      className: 'col_order_id',
      onFilter: (value: DataType, record: DataType) => record.vendor_name.includes(String(value)),
      sorter: (a: DataType, b: DataType) => a.vendor_name.length - b.vendor_name.length,
    },
    {
      title: 'Nama Customer',
      dataIndex: 'costumer_name',
      key: 'costumer_name',
      align: 'left',
      width: 140,
      onFilter: (value: DataType, record: DataType) => record.costumer_name.includes(String(value)),
      sorter: (a: DataType, b: DataType) => a.costumer_name.length - b.costumer_name.length,
    },
    {
      title: 'No. Telp / WA',
      dataIndex: 'phone_number',
      key: 'phone_number',
      align: 'left',
      width: 120,
      sorter: (a: DataType, b: DataType) => a.phone_number - b.phone_number,
    },
    {
      title: 'Status Pembayaran Receipt',
      dataIndex: 'payment_receipt',
      key: 'payment_receipt',
      align: 'left',
      width: 200,
      filters: [
        {text: 'UNPAID', value: '0'},
        {text: 'PAID', value: '1'},
      ],
      filterMultiple: true,
      filteredValue: selectedPaymentReceiptStatus.length > 0 ? selectedPaymentReceiptStatus : null,
      sorter: (a: DataType, b: DataType) => a.payment_receipt.length - b.payment_receipt.length,
    },
    {
      title: 'Status Order',
      dataIndex: 'order_status_label',
      key: 'order_status_label',
      align: 'left',
      filters: statusFilters,
      filterMultiple: true,
      filteredValue: selectedOrderStatus.length > 0 ? selectedOrderStatus : null,
      sorter: (a: DataType, b: DataType) =>
        a.order_status_label.length - b.order_status_label.length,
      render: (order_status_label: string) => {
        const orderStatus = order_status_label
        let color = ''

        switch (orderStatus) {
          case 'UNPAID':
            color = 'red'
            break
          case 'PAID':
            color = 'green'
            break
          default:
            color = 'blue'
            break
        }

        return <Tag color={color}>{orderStatus}</Tag>
      },
    },
    {
      title: 'Status Pembayaran Quotation',
      dataIndex: 'payment_quotation',
      key: 'payment_quotation',
      align: 'left',
      width: 230,
      filters: [
        {text: 'UNPAID', value: '0'},
        {text: 'PAID', value: '1'},
      ],
      filteredValue:
        selectedPaymentQuotationStatus.length > 0 ? selectedPaymentQuotationStatus : null,
      sorter: (a: DataType, b: DataType) => a.payment_quotation.length - b.payment_quotation.length,
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      fixed: 'right',
      render: (record: any) => {
        const id = record.order_id
        const handlePrintout = (status: string) => {
          if (['PICKLIST'].includes(status)) {
            navigate(`/order/printout-order-picklist/${id}`)
          } else if (
            ['BOOK', 'BOOKED', 'SURVEYREQ', 'SURVEYSTART', 'SURVEYDONE'].includes(status)
          ) {
            navigate(`/order/printout-order-dipesan/${id}`)
          }
        }

        const handleDetailId = () => {
          navigate(`/order/detail-order/${id}`)
        }

        const handleUpdateId = () => {
          navigate(`/order/update-order/${id}`)
        }

        const handleShowModal = (id: number, type: number) => {
          const selected = orderData.find((order) => order.order_id === id)

          if (selected) {
            fetchOrderData(selected.order_id)
            getVendor(selected.store_id)
            setShowModal(true)
            setModalType(type)
          }
        }

        return (
          <div className='d-flex justify-content-center gap-4'>
            {['PICKLIST', 'BOOK', 'BOOKED', 'SURVEYREQ', 'SURVEYSTART', 'SURVEYDONE'].includes(
              record.order_status
            ) &&
              !['Admin HO', 'Super User'].includes(userRole) && (
                <OverlayTrigger
                  placement='bottom'
                  delay={{show: 250, hide: 400}}
                  overlay={renderTooltip(
                    `${record.print_counter === 0 ? 'Print Order' : 'Reprint Order'}`
                  )}
                >
                  <Button
                    className='button-request'
                    variant='warning'
                    onClick={() => handlePrintout(record.order_status)}
                  >
                    <FontAwesomeIcon className='text-white' icon={faPrint} fontSize={'13px'} />
                  </Button>
                </OverlayTrigger>
              )}

            {!['Sales', 'Admin HO', 'Super User'].includes(userRole) && (
              <>
                {['BOOK', 'BOOKED'].includes(record.order_status) && (
                  <OverlayTrigger
                    placement='bottom'
                    delay={{show: 250, hide: 400}}
                    overlay={renderTooltip('Cancel Order')}
                  >
                    <Button
                      className='button-cancel'
                      variant='danger'
                      onClick={() => handleShowModal(id, 3)}
                    >
                      <FontAwesomeIcon
                        className='text-white'
                        icon={faXmarkCircle}
                        fontSize={'13px'}
                      />
                    </Button>
                  </OverlayTrigger>
                )}
              </>
            )}

            {['Super User', 'Admin HO'].includes(userRole) ? (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Cancel Order')}
              >
                <Button
                  className='button-cancel'
                  variant='danger'
                  onClick={() => handleShowModal(id, 3)}
                >
                  <FontAwesomeIcon className='text-white' icon={faXmarkCircle} fontSize={'13px'} />
                </Button>
              </OverlayTrigger>
            ) : (
              <></>
            )}

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Detail Order')}
            >
              <a
                href={`/order/detail-order/${id}`}
                target='_blank'
                rel='noopener noreferrer'
                className='btn btn-primary button-detail'
                onClick={(e) => {
                  e.preventDefault()
                  handleDetailId()
                }}
              >
                <FontAwesomeIcon className='text-white' icon={faBook} fontSize={'13px'} />
              </a>
            </OverlayTrigger>

            {!['Sales'].includes(userRole) && (
              <>
                {['PICKLIST', 'BOOK', 'BOOKED'].includes(record.order_status) && (
                  <OverlayTrigger
                    placement='bottom'
                    delay={{show: 250, hide: 400}}
                    overlay={renderTooltip('Update Order')}
                  >
                    <a
                      href={`/order/update-order/${id}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='btn btn-primary button-edit'
                      onClick={(e) => {
                        e.preventDefault()
                        handleUpdateId()
                      }}
                    >
                      <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
                    </a>
                  </OverlayTrigger>
                )}
              </>
            )}

            {[
              'WORKREQ',
              'SURVEYREQ',
              'QUOTEOUT',
              'QUOTATIONPAID',
              'QUOTATIONPAIDSTEPONE',
              'QUOTATIONPAIDSTEPTWO',
              'QUOTATIONPAIDSTEPTHREE',
              'WORKENDSTEPONE',
              'WORKENDSTEPTWO',
              'WORKENDSTEPTHREE',
            ].includes(record.order_status) && ['Super User', 'Admin HO'].includes(userRole) ? (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Update Order')}
              >
                <a
                  href={`/order/update-order/${id}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='btn btn-primary button-edit'
                  onClick={(e) => {
                    e.preventDefault()
                    handleUpdateId()
                  }}
                >
                  <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
                </a>
              </OverlayTrigger>
            ) : (
              <></>
            )}

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Aktivitas Email')}
            >
              <Button
                variant='success'
                className='button-email'
                onClick={() => {
                  handleShowModal(id, 1)
                  setActiveKey(1)
                  setSelectedCSI({
                    value: null,
                    label: 'Pilih Format CSI',
                  })
                }}
              >
                <FontAwesomeIcon className='text-white' icon={faEnvelope} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>

            {['QUOTATIONPAID', 'QUOTEOUT', 'WORKENDSTEPONE', 'WORKENDSTEPTWO'].includes(
              record.order_status
            ) && userRole === 'Store CS' ? (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Verifikasi Pembayaran Quotation')}
              >
                <Button
                  variant='primary'
                  className='button-verif'
                  onClick={() => handleShowModal(id, 2)}
                >
                  <FontAwesomeIcon className='text-white' icon={faCheckCircle} fontSize={'13px'} />
                </Button>
              </OverlayTrigger>
            ) : (
              <></>
            )}

            {['QUOTEIN', 'UNPAID', 'PAID', 'QUOTEOUT', 'QUOTATIONPAID'].includes(
              record.order_status
            ) && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Cetak PDF Quotation')}
              >
                <Button
                  className='button-request'
                  variant='warning'
                  onClick={() =>
                    exportToPDF(record.order_id, record.payment_quotation, record.costumer_name)
                  }
                >
                  <FontAwesomeIcon className='text-white' icon={faPrint} fontSize={'13px'} />
                </Button>
              </OverlayTrigger>
            )}
          </div>
        )
      },
    },
  ].filter(Boolean) as ColumnsType<DataType>

  return (
    <section id='view-order'>
      <Card>
        <Card.Body className='table-view-order'>
          <Row className='table-head-wrapper'>
            <div
              className='d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row flex-xxl-row align-items-start align-items-sm-center align-items-md-center align-items-lg-center align-items-xl-center align-items-xxl-center justify-content-start gap-3'
              onKeyDown={handleKeyPress}
            >
              <h3 className='d-flex align-items-center fs-5 fw-normal'>Date</h3>

              <RangePicker
                format={'DD-MM-YYYY'}
                className='date-range'
                value={[
                  dateFrom ? dayjs(dateFrom, 'YYYY-MM-DD') : null,
                  dateTo ? dayjs(dateTo, 'YYYY-MM-DD') : null,
                ]}
                onChange={(values) => {
                  if (values && values.length === 2) {
                    const dateFromFormatted = values[0]?.format('YYYY-MM-DD') || ''
                    const dateToFormatted = values[1]?.format('YYYY-MM-DD') || ''

                    dispatch(setDateFrom(dateFromFormatted))
                    dispatch(setDateTo(dateToFormatted))
                  } else {
                    dispatch(setDateFrom(''))
                    dispatch(setDateTo(''))
                  }
                }}
              />

              <div className='filter-search'>
                <FormGroup>
                  <Form.Control
                    placeholder='Search'
                    className='filter-ltr'
                    value={searchFilter ?? ''}
                    onChange={handleChangeSearchFilter}
                  />

                  <span className='search-icon'>
                    <FontAwesomeIcon icon={faSearch} className='text-black' size='sm' />
                  </span>
                </FormGroup>
              </div>

              {['Super User', 'Admin HO'].includes(userRole ?? '') && (
                <Select
                  name='store_id'
                  className='form-control p-0 w-25'
                  classNamePrefix='select'
                  placeholder='Pilih Toko'
                  isSearchable={true}
                  options={storeOptions}
                  value={selectedStore}
                  onChange={handleStoreChange}
                />
              )}

              {['Super User', 'Admin HO'].includes(userRole ?? '') && (
                <Select
                  name='store_id'
                  className='form-control p-0 w-25'
                  classNamePrefix='select'
                  placeholder='Pilih Vendor'
                  isSearchable={true}
                  options={vendorOptions}
                  value={selectedVendor}
                  onChange={handleVendorChange}
                />
              )}

              <Button
                className='btn-dark-primary button-submit m-0'
                disabled={loadingButton}
                onClick={() => handleSubmitFilter()}
              >
                {loadingButton ? 'Filtering..' : 'Submit'}
              </Button>
            </div>
          </Row>

          <Spin
            tip='Loading...'
            spinning={loadData}
            size='large'
            indicator={<LoadingOutlined style={{fontSize: 24}} spin />}
          >
            <div className='table-custom-wrapper'>
              <Table
                className='table-striped-rows'
                bordered
                columns={columns}
                dataSource={orderData}
                rowKey={(record) => record.order_id}
                pagination={false}
                sticky={true}
                tableLayout='auto'
                scroll={{x: 'max-content'}}
                onChange={handleFilterTable}
              />
            </div>
          </Spin>

          <div className='pagination-container mt-5'>
            <span className='total-text'>
              Showing {totalData === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Orders
            </span>

            <Pagination
              className='pagination'
              pageSize={pageSize}
              current={currentPage}
              total={totalData}
              showSizeChanger
              pageSizeOptions={[5, 10, 20, 50, 100, 250, 500]}
              itemRender={itemRender}
              onChange={(page, pageSize) => {
                handlePageChange(page, pageSize)
              }}
            />
          </div>
        </Card.Body>
      </Card>

      {orderDetail && (
        <Modal
          dialogClassName='modal-verification'
          centered
          show={showModal}
          onHide={handleCloseModal}
        >
          {modalType === 1 && (
            <CustomerIndexModal
              mailLogs={mailLogs}
              orderDetail={orderDetail}
              loadingModal={loadingModal}
            />
          )}

          {modalType === 2 && (
            <QuotationModal
              show={showModal}
              handleClose={handleCloseModal}
              orderDetail={orderDetail}
              loadingModal={loadingModal}
              handleReceiptClick={handleReceiptClick}
              handleReceiptChange={handleReceiptChange}
              handleUpdateQuotation={handleUpdateQuotation}
              loadingUpdate={loadingUpdate}
              receiptQuotation={receiptQuotation}
              quotationFiles={quotationFiles}
              handleFileReceipt={handleFileReceipt}
              handleRemoveReceipt={handleRemoveReceipt}
              handleImageClick={handleImageClick}
              handleFileChange={handleFileChange}
              handleFileClick={handleFileClick}
              handleRemoveFile={handleRemoveFile}
            />
          )}

          {modalType === 3 && <RefundModal orderDetail={orderDetail} loadingModal={loadingModal} />}
        </Modal>
      )}
    </section>
  )
}

export {ViewOrders}
