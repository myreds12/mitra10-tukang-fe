import React, { FC, useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Orders } from '../../../../interfaces/order'

import './UpdateOrder.css'

import axios from 'axios'
import Swal from 'sweetalert2'
import Select, { SingleValue } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { Card, Row, Col, Form, InputGroup, Table, Button, ListGroup } from 'react-bootstrap'
import { Image, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faImage, faFileImage } from '@fortawesome/free-solid-svg-icons'

interface StoreItemSelect {
  value: number | null
  label: string
  address: string
  city_id: number | null
  zip_code: string
}

interface MemberSelect {
  value: number | null
  label: string
  full_name: string
  email: string
  phone_number: string
  whatsapp_number: string
  address_1: string
}

interface SalesSelect {
  value: number | null
  label: string
  full_name: string
}

interface VendorSelect {
  value: number | null
  label: string
}

interface ItemSelect {
  __isNew__?: boolean
  value: number | null
  label: string
  item_code: string
  item_name: string
  service_name: string
  category_id: number | null
  default_price: number
  type: number | null
  prices: Array<{
    id: number | null
    item_id: number | null
    store_id: number | null
    periodic_start: string
    periodic_end: string
    price: string
    min_order: string
  }>
}

interface Order {
  member_id: number | null
  sales_id: number | null
  store_id: number | null
  vendor_id: number | null
  project_status_id: number | null
  project_address: string
  project_number: string
  request_survey: string
  payment_type: string
  receipt_number: string
  is_overdistance: number
  additional_fee: number
  notes: string
  order_details: Array<{
    id: number | null
    item?: ItemSelect | null
    item_id: number | null
    item_code: string | null
    item_name: string | null
    quantity: number
    unit_price: string | null
    total: string | null
    item_notes: string | null
  }>
  order_files: Array<any>

  [key: string]: any
}
const apiChat = process.env.REACT_APP_API_CHAT_URL || process.env.REACT_APP_API_URL || ''
const UpdateOrderHO: FC<{ updatePageTitle: (order: Orders) => void }> = ({ updatePageTitle }) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const params = useParams()
  const textAreaRefs = useRef<(HTMLTextAreaElement | null)[]>([])

  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Order Information Detail
  const [orderDetail, setOrderDetail] = useState<any>()
  const [isCanceledOrder, setIsCanceledOrder] = useState(false)

  // Store
  const [store, setStore] = useState<StoreItemSelect[]>([])
  const [selectedStore, setSelectedStore] = useState<SingleValue<StoreItemSelect>>({
    value: null,
    label: '',
    address: '',
    city_id: null,
    zip_code: '',
  })

  // Order
  const [orderForm, setOrderForm] = useState<Order>({
    member_id: null,
    sales_id: null,
    store_id: null,
    vendor_id: null,
    project_status_id: null,
    project_address: '',
    project_number: '',
    request_survey: '',
    payment_type: '',
    receipt_number: '',
    is_overdistance: 0,
    additional_fee: 25000,
    notes: '',
    order_details: [
      {
        id: null,
        item: null,
        item_id: null,
        item_code: '',
        item_name: '',
        quantity: 1,
        unit_price: null,
        total: null,
        item_notes: null,
      },
    ],
    order_files: [],
  })

  const [paymentTypeValue, setPaymentTypeValue] = useState(['gratis', 'pemasangan_tanpa_survey'])
  const [receiptFiles, setReceiptFiles] = useState<Array<File | null>>([])
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
  const evidenceRef = useRef<HTMLInputElement>(null)

  const [previewImage, setPreviewImage] = useState<any>()
  const [visible, setVisible] = useState(false)
  const [visibleQuotationReceipt, setVisibleQuotationReceipt] = useState(false)
  const [visibleQuotationFiles, setVisibleQuotationFiles] = useState(false)
  const [orderStatusLabel, setOrderStatusLabel] = useState('')
  const [template, setTemplate] = useState([])
  const userRole = localStorage.getItem('userRole') as string

  // Member
  const [member, setMember] = useState<MemberSelect[]>([])
  const [selectedMember, setSelectedMember] = useState<SingleValue<MemberSelect>>({
    value: null,
    label: '',
    full_name: '',
    email: '',
    phone_number: '',
    whatsapp_number: '',
    address_1: '',
  })

  const [isWhatsapp, setIsWhatsapp] = useState<boolean>(false)
  const [isOverdistance, setIsOverdistance] = useState<number>(0)

  // Sales
  const [sales, setSales] = useState<SalesSelect[]>([])
  const [searchSales, setSearchSales] = useState('')
  const [selectedSales, setSelectedSales] = useState<SingleValue<SalesSelect>>({
    value: null,
    label: '',
    full_name: '',
  })

  // Vendor
  const [vendor, setVendor] = useState<VendorSelect[]>([])
  const [selectedVendor, setSelectedVendor] = useState<SingleValue<VendorSelect>>({
    value: null,
    label: '',
  })

  // Order Detail Table
  const [item, setItem] = useState<ItemSelect[]>([])
  const [searchItem, setSearchItem] = useState('')
  const [searchPemasangan, setSearchPemasangan] = useState('')
  const [grandTotal, setGrandTotal] = useState<number>(0)

  // Fetch API Data
  const getItem = async () => {
    const activeSearch = searchItem || searchPemasangan
    const storeId = selectedStore && selectedStore.value ? `&store_id=${selectedStore.value}` : ``
    const itemFree =
      paymentTypeValue[0] === 'gratis' && paymentTypeValue[1] === 'pemasangan_tanpa_survey'
        ? `&item_type=1&is_promotion=1${storeId}`
        : ''
    const itemTanpaSurvey =
      paymentTypeValue[0] === 'berbayar' && paymentTypeValue[1] === 'pemasangan_tanpa_survey'
        ? `&item_type=2&is_promotion=1${storeId}`
        : ''
    const itemSurvey = paymentTypeValue[1] === 'survey' ? '&item_type=3&all_store=1' : ''
    const search = activeSearch ? `&search=${activeSearch}` : ''

    try {
      const response = await axios.get(
        `${apiUrl}/items?take=0${search}${itemFree}${itemTanpaSurvey}${itemSurvey}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        }
      )

      if (Array.isArray(response.data.data)) {
        const item = response.data.data
          .filter((x: any) => Boolean(x.is_active))
          .map((item: any) => ({
            value: item.id,
            label:
              paymentTypeValue[1] === 'survey'
                ? `${item.item_code ? `${item.item_code} - ` : ''}${item.service_name || item.item_name}`
                : `${item.service_name || item.item_name}${item.item_code ? ` (${item.item_code})` : ''}`,
            item_code: item?.item_code ?? '',
            item_name: item?.item_name ?? '',
            service_name: item?.service_name ?? '',
            category_id: item.category_id,
            default_price: item.default_price,
            type: item?.type,
            prices: (item.prices || []).map((priceItem: any) => ({
              id: priceItem.id,
              is_active: priceItem.is_active,
              item_id: priceItem.item_id,
              store_id: priceItem.store_id,
              periodic_start: priceItem.periodic_start,
              periodic_end: priceItem.periodic_end,
              min_order: priceItem.min_order,
              price: priceItem.price,
            })),
          }))

        setItem(item)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line
    getItem()
  }, [paymentTypeValue, searchPemasangan])

  useEffect(() => {
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

            if (data?.store) {
              setSelectedStore((prev) => ({
                ...prev,
                value: data.store.id,
                label: data.store.store_name,
                address: data.store.address,
                city_id: data.store.city_id,
                zip_code: data.store.zip_code,
              }))

              setOrderForm((prev) => ({
                ...prev,
                store_id: data.store_id,
              }))
            }

            if (data?.payment_type) {
              if (data.payment_type === 'survey') {
                setPaymentTypeValue(['berbayar', 'survey'])
                setOrderForm((prev) => ({
                  ...prev,
                  payment_type: 'survey',
                }))
              } else if (data.payment_type === 'gratis') {
                setPaymentTypeValue(['gratis', 'pemasangan_tanpa_survey'])
                setOrderForm((prev) => ({
                  ...prev,
                  payment_type: 'gratis',
                }))
              } else if (data.payment_type === 'pemasangan_tanpa_survey') {
                setPaymentTypeValue(['berbayar', 'pemasangan_tanpa_survey'])
                setOrderForm((prev) => ({
                  ...prev,
                  payment_type: 'pemasangan_tanpa_survey',
                }))
              } else {
                setPaymentTypeValue(['gratis', 'pemasangan_tanpa_survey'])
                setOrderForm((prev) => ({
                  ...prev,
                  payment_type: 'gratis',
                }))
              }
            }

            if (data?.members) {
              setSelectedMember((prev) => ({
                ...prev,
                value: data.members.id,
                label: data.members.member_number,
                full_name: data.members.full_name,
                email: data.members.email,
                phone_number: data.members.phone_number,
                whatsapp_number: data.members.whatsapp_number,
                address_1: data.members.address_1,
              }))

              setOrderForm((prev) => ({
                ...prev,
                member_id: data.members.id,
              }))
            }

            if (data?.project_address) {
              setOrderForm((prev) => ({
                ...prev,
                project_address: data.project_address,
              }))
            }

            if (data?.project_number) {
              setOrderForm((prev) => ({
                ...prev,
                project_number: data.project_number,
              }))
            }

            if (data?.receipt_number) {
              setOrderForm((prev) => ({
                ...prev,
                receipt_number: data.receipt_number,
              }))
            }

            if (data?.sales) {
              setSelectedSales((prev) => ({
                ...prev,
                value: data.sales.id,
                label: data.sales.full_name,
                full_name: data.sales.full_name,
              }))

              setOrderForm((prev) => ({
                ...prev,
                sales_id: data.sales.id,
              }))
            }

            if (data?.vendor) {
              setSelectedVendor((prev) => ({
                ...prev,
                value: data.vendor.id,
                label: data.vendor.company_name,
              }))

              setOrderForm((prev) => ({
                ...prev,
                vendor_id: data.vendor.id,
              }))
            }

            if (data?.request_survey) {
              setOrderForm((prev) => ({
                ...prev,
                request_survey: new Date(data.request_survey).toISOString().split('T')[0],
              }))
            }

            if (data?.is_overdistance) {
              setOrderForm((prev) => ({
                ...prev,
                is_overdistance: data?.is_overdistance ?? 0,
              }))

              setIsOverdistance(data?.is_overdistance ?? 0)
            }

            if (data?.additional_fee) {
              setOrderForm((prev) => ({
                ...prev,
                additional_fee: data?.additional_fee ?? 0,
              }))
            }

            if (data?.notes) {
              setOrderForm((prev) => ({
                ...prev,
                notes: data?.notes ?? '',
              }))
            }

            if (data?.order_details) {
              setOrderForm((prev) => {
                const previousDetailValues = data.order_details.map((item: any) => {
                  const previousItem = {
                    value: item.id,
                    label:
                      data?.payment_type === 'survey' ? item?.item_code : item?.item?.service_name,
                    category_id: item?.item?.category.id,
                    item_code: item?.item_code ?? '',
                    item_name: item?.item_name ?? '',
                    service_name: item?.item?.service_name ?? '',
                    default_price: item?.item?.default_price,
                    type: item?.type,
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

            if (data?.order_files) {
              const initialOrderFilesValues = data.order_files.map((item: any) => ({
                id: item.id,
                name: item.path,
              }))

              setReceiptFiles(initialOrderFilesValues)
            }

            // if (data?.order_files) {
            //   const initialOrderFilesValues = data.order_files.map((item: any) => {
            //     const blobData = new Blob([JSON.stringify(item)], {type: 'image'})
            //     return new File([blobData], item.path, {type: 'image'})
            //   })

            //   setReceiptFiles(initialOrderFilesValues)
            // }

            updatePageTitle(data)
          })
      } catch (error) {
        console.error(error)
      }
    }

    const getStore = async () => {
      try {
        const response = await axios.get(`${apiUrl}/stores?take=0`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })

        if (Array.isArray(response.data.data)) {
          const tempStore = response.data.data.map((item: any) => ({
            value: item.id,
            label: item.store_name,
            address: item.address,
            city_id: item.city_id,
            zip_code: item.zip_code,
          }))

          setStore(tempStore)
        } else {
          console.error('API response data is not an array:', response.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    const getMember = async () => {
      try {
        const response = await axios.get(`${apiUrl}/member`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })
        if (Array.isArray(response.data.data)) {
          const tempMember = response.data.data.map((item: any) => ({
            value: item.id,
            label: item.member_number,
            full_name: item.full_name,
            email: item.email,
            phone_number: item.phone_number,
            whatsapp_number: item.whatsapp_number,
            address_1: item.address_1,
          }))

          setMember(tempMember)
        } else {
          console.error('API response data is not an array:', response.data)
        }
      } catch (err) {
        console.error(err)
      }
    }
    const getTemplaye = async () => {
      let apiUrlWithParams = `${apiChat}/templates`

      try {
        const response = await axios.get(apiUrlWithParams, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })
        if (response.data) {
          setTemplate(response.data)
        }
        // console.log(response.data.data.data);
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchOrderData()
    getStore()
    getMember()
    getTemplaye()
  }, [])

  const getSales = async () => {
    const search = searchSales ? `&search=${searchSales}` : ''
    const orderStore = selectedStore?.value ? `&store_id=${selectedStore.value}` : ``

    try {
      const response = await axios.get(`${apiUrl}/sales?take=0${search}${orderStore}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempSales = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.full_name,
          full_name: item.full_name,
        }))

        setSales(tempSales)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getVendor = async () => {
    const orderStore = selectedStore?.value ? `&store_id=${selectedStore.value}` : ``

    try {
      const response = await axios.get(`${apiUrl}/vendor?vendor_with_max_order=1${orderStore}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempVendor = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.company_name,
        }))

        setIsLoadingPage(false)
        setVendor(tempVendor)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getVendor()
  }, [selectedStore?.value])

  useEffect(() => {
    getSales()
  }, [selectedStore?.value, searchSales])

  // Order Form Handler
  const orderFormHandler = (e: any) => {
    setOrderForm({
      ...orderForm,
      [e.target.name]: e.target.value,
    })
  }

  // Order Detail Form Handler
  const orderDetailsFormHandler = (e: any, index: number) => {
    setOrderForm((prev) => {
      const cache = { ...prev }
      cache.order_details[index] = {
        ...cache.order_details[index],
        [e.target.name]: e.target.value,
      }

      return cache
    })
  }

  // Checkbox Handler
  const handleCheckboxChange = (isChecked: boolean) => {
    setIsOverdistance(isChecked ? 1 : 0)
  }

  // Overdistance
  useEffect(() => {
    setOrderForm({
      ...orderForm,
      is_overdistance: isOverdistance,
      additional_fee: 25000,
    })
  }, [isOverdistance])

  // Selected Store
  useEffect(() => {
    setOrderForm({
      ...orderForm,
      store_id: selectedStore?.value ?? null,
    })
  }, [selectedStore])

  // Selected Member
  useEffect(() => {
    setOrderForm({
      ...orderForm,
      project_address: selectedMember?.address_1 ?? '',
      project_number:
        (isWhatsapp ? selectedMember?.whatsapp_number : selectedMember?.phone_number) ?? '',
      member_id: selectedMember?.value ?? null,
    })
  }, [selectedMember, isWhatsapp])

  // Selected Sales
  useEffect(() => {
    setOrderForm({
      ...orderForm,
      sales_id: selectedSales?.value ?? null,
    })
  }, [selectedSales])

  // Selected Vendor
  const handleChangeVendor = (newValue: any) => {
    if (selectedVendor?.value !== null) {
      Swal.fire({
        title: 'Konfirmasi',
        text: 'Apakah anda sudah mengkonfirmasi dengan vendor terkait mengenai pergantian alokasi vendor survey/pengerjaan?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya',
        confirmButtonColor: '#6b9230',
        cancelButtonText: 'Tidak',
        cancelButtonColor: '#a30014',
      }).then((result) => {
        if (result.isConfirmed) {
          setSelectedVendor(newValue)
        }
      })
    } else {
      setSelectedVendor(newValue)
    }
  }

  useEffect(() => {
    setOrderForm({
      ...orderForm,
      vendor_id: selectedVendor?.value ?? null,
    })
  }, [selectedVendor])

  // Selected Payment Type && Clear Order Detail if user changed the payment type
  useEffect(() => {
    setOrderForm({
      ...orderForm,
      payment_type: paymentTypeValue[0] === 'gratis' ? 'gratis' : paymentTypeValue[1],
      // order_details: [
      //   {
      //     id: null,
      //     item_id: null,
      //     item_code: null,
      //     item_name: null,
      //     quantity: 1,
      //     unit_price: null,
      //     total: null,
      //     item_notes: null,
      //   },
      // ],
    })
  }, [paymentTypeValue])

  // Status
  // ✅ PERBAIKAN 2: Hapus orderForm.project_status_id dari dependency
  // Gunakan functional update agar tidak perlu orderForm sebagai dependency
  useEffect(() => {
    const storedStatus = localStorage.getItem('statusData')
    const statusData = storedStatus ? JSON.parse(storedStatus) : []

    const determineStatus = () => {
      const hasQuotation = orderDetail?.quotation?.length > 0
      const specialQuotation = orderDetail?.quotation?.[0]?.quotation_special === 1
      const receiptQuotations =
        orderDetail?.quotation?.[0]?.quotation_receipt?.map(
          (receipt: any) => receipt?.receipt_quotation || null
        ) || []

      switch (true) {
        case paymentTypeValue.includes('gratis') ||
          paymentTypeValue.includes('pemasangan_tanpa_survey'):
          return 'WORKREQ'

        case paymentTypeValue.includes('survey'):
          if (!hasQuotation && !specialQuotation) {
            return 'SURVEYREQ'
          } else if (hasQuotation && !specialQuotation) {
            return 'WORKREQ'
          } else if (hasQuotation && specialQuotation) {
            if (
              receiptQuotations[0] !== null &&
              receiptQuotations[1] === null &&
              receiptQuotations[2] === null
            )
              return 'WORKREQSTEPONE'
            if (
              receiptQuotations[0] !== null &&
              receiptQuotations[1] !== null &&
              receiptQuotations[2] === null
            )
              return 'WORKREQSTEPTWO'
            if (
              receiptQuotations[0] !== null &&
              receiptQuotations[1] !== null &&
              receiptQuotations[2] !== null
            )
              return 'WORKREQSTEPTHREE'
            return 'WORKREQ'
          }
          break

        case isCanceledOrder:
          return 'CLOSE'

        default:
          return 'WORKREQ'
      }
    }

    const status = determineStatus()
    const desiredStatus = statusData.find((statuses: any) => statuses.category === status)
    setOrderStatusLabel(desiredStatus?.description)
    const statusId = desiredStatus?.value

    // ✅ Gunakan functional update agar tidak perlu orderForm di dependency array
    setOrderForm((prev) => ({
      ...prev,
      project_status_id: statusId,
    }))
  // ✅ Hapus orderForm.project_status_id — ini yang menyebabkan infinite loop
  }, [paymentTypeValue, isCanceledOrder, orderDetail])

  // Select Date Request
  const today = new Date().toISOString().split('T')[0]

  // Calculate each details
  const calcEachDetails = () => {
    const today = new Date()

    setOrderForm((prev) => {
      const order_details = prev.order_details.map((detail) => {
        let newDetail = { ...detail }

        if (detail.item) {
          const { item, quantity } = detail
          const { prices, default_price } = item

          // const activePrices = prices.filter((price) => price.is_active === true)

          const validPrices = prices.filter((price) => {
            const start = new Date(price.periodic_start)
            const end = new Date(price.periodic_end)
            return today >= start && today <= end
          })

          const applicablePrice = validPrices
            .filter((price) => quantity >= +price.min_order)
            .sort((a, b) => +b.min_order - +a.min_order)[0]

          const unitPrice =
            applicablePrice && quantity >= +applicablePrice.min_order
              ? +applicablePrice.price
              : +default_price || 0

          const total = unitPrice * quantity

          newDetail = { ...newDetail, unit_price: unitPrice.toString(), total: total.toString() }
        }

        return newDetail
      })

      return { ...prev, order_details }
    })
  }

  // Upload Order File Handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files

    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...receiptFiles]
      const mergedFiles = existingFiles.concat(file)

      const { length: existingFilesLength } = existingFiles
      const { length: fileListLength } = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setReceiptFiles(mergedFiles)
    }
  }

  const handleImageClick = () => {
    const inputField = document.querySelector('.input-field-image') as HTMLInputElement
    inputField.click()
  }

  const handleRemoveFile = (index: number) => {
    const newEvidances = [...receiptFiles]
    newEvidances.splice(index, 1)
    setReceiptFiles(newEvidances)

    // Update element value
    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  const handleFileClick = (index: number) => {
    setPreviewImage(receiptFiles[index]?.name)
    setVisible(true)
    setSelectedFileIndex(index)
  }

  // Order Details
  const addOrderDetails = () => {
    const newDetail = {
      id: null,
      item_id: null,
      item_code: '',
      item_name: '',
      quantity: 1,
      unit_price: null,
      total: null,
      item_notes: null,
    }

    setOrderForm((prev) => {
      const cache = { ...prev }
      cache.order_details.push(newDetail)
      return cache
    })

    getItem()
  }

  const handleRemoveForm = (index: any) => {
    setOrderForm((prev) => {
      const cache = { ...prev }
      cache.order_details.splice(index, 1)
      return cache
    })

    getItem()
  }

  useEffect(() => {
    textAreaRefs.current.forEach((textarea: any) => {
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
      }
    })
  }, [orderForm])

  // Calculate Grand Total Order Amount
  const calculatedGrandTotalOrder = () => {
    const grandTotal = orderForm.order_details.reduce((accumulator, element) => {
      let totalOrderAmount = 0
      let biayaSurvey = 0

      const total = element.total ? parseInt(element.total) : 0

      if (paymentTypeValue[0] === 'gratis') {
        biayaSurvey = 0
        totalOrderAmount = 0
      } else if (paymentTypeValue[1] === 'survey') {
        biayaSurvey = 99000
        totalOrderAmount = 0
      } else {
        biayaSurvey = 0
        totalOrderAmount = total
      }

      const calculatedGrandTotal = totalOrderAmount + biayaSurvey

      return paymentTypeValue[1] === 'pemasangan_tanpa_survey'
        ? accumulator + calculatedGrandTotal
        : calculatedGrandTotal
    }, 0)

    const additionalFee = Number(orderForm.additional_fee)
    const grandTotalWithFee = isOverdistance === 1 ? grandTotal + additionalFee : grandTotal

    return grandTotalWithFee
  }

  useEffect(() => {
    const calculatedGrandTotal = calculatedGrandTotalOrder()
    setGrandTotal(calculatedGrandTotal)
  }, [orderForm.order_details, orderForm.additional_fee, paymentTypeValue])

  // Submit Update Order
  const formData = new FormData()
  
  const API_BASE = process.env.REACT_APP_WA_BACKEND_API_URL
  const [emailDetail, setEmailDetail] = useState<any>()
  useEffect(() => {
    fetchEmailData()
  }, []);
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
    let invoiceMessage = '';
    if (orderDetail?.status?.category === 'BOOKED') {
      const information_detail = emailDetail?.information_detail?.map((item: any) => item.information).join('\n• ');
      invoiceMessage = `
Hi *${orderDetail?.members?.full_name || "-"}*, terima kasih telah menggunakan layanan instalasi Mitra10.

Order Anda saat ini *sedang dijadwalkan untuk Survey Lokasi* oleh tim instalasi kami.

👷 *Tujuan Survey:*
Untuk memastikan kebutuhan material serta kondisi lokasi agar pemasangan berjalan lancar.

📌 *Sebelum Survey Dimulai, Mohon Pastikan:*
• Area dapat diakses dan aman (tidak licin / tidak ada renovasi besar)
• Area kerja tidak tertutup barang
• Untuk layanan air: sumber air dapat diakses
• Untuk apartemen/perumahan: izin dan akses teknisi sudah disiapkan
• Hewan peliharaan tidak berada di area kerja

⚠️ *Catatan Penting:*
• Pihak bertanggung jawab harus ada di lokasi saat survey
• Reschedule maksimal H-1 konfirmasi
• Biaya survey *tidak dapat dikembalikan* jika customer tidak hadir sesuai jadwal

Tim kami akan menghubungi Anda untuk konfirmasi jadwal survey.
──────────────────────
📞 *Informasi & Bantuan*
${information_detail}

Terima kasih telah memilih *Mitra10* 🙏
`;
    } else if (orderDetail?.status?.category === 'QUOTATIONPAID') {
      invoiceMessage = `
${emailDetail?.welcome_header} , ${orderDetail?.members?.full_name || "-"}, terima kasih atas pembayaran Anda.
Pembayaran untuk layanan instalasi Mitra10 telah kami terima dan terverifikasi.

Order Anda saat ini sedang **dalam tahap persiapan pengerjaan** oleh tim instalasi.
Tim kami akan segera menghubungi Anda untuk **mengonfirmasi jadwal pemasangan** dan memastikan
teknisi siap di lokasi sesuai waktu yang disepakati.

**Catatan**:
Dengan terselesaikannya pembayaran, Anda dianggap telah menyetujui seluruh **Syarat & Ketentuan
Layanan Mitra10** sesuai penawaran sebelumnya.

Terima kasih telah memilih Mitra10.
            `;
    }



    // =============================
    // === KIRIM GAMBAR + PESAN ===
    // =============================
    const payload = {
      phonenumber: orderDetail?.members?.member_number,
      message: invoiceMessage,
      location: '',
      img: '',
      document: '',
      audio: '',
      video: '',
      types: 'Order'
    };

    await axios.post(`${API_BASE}/conversation`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

  }
  useEffect(() => {
    if (!orderDetail || !emailDetail) return;

    console.log("DATA BENAR-BENAR SIAP:", orderDetail, emailDetail);
    //sentWA();
  }, [orderDetail]);
  const handleUpdateOrder = async () => {
    // ✅ PERBAIKAN 1: Pindahkan formData ke dalam fungsi agar selalu fresh
    const formData = new FormData()

    const appendIfNotDefault = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        formData.append(key, String(value))
      }
    }

    const url = `${apiUrl}/orders/${params.id}`

    let errorBags = []
    const requiredOrderFields = [
      { key: 'member_id', fieldName: 'Nomor Member' },
      { key: 'sales_id', fieldName: 'Sales Information' },
      { key: 'store_id', fieldName: 'Store' },
      { key: 'vendor_id', fieldName: 'Vendor' },
      { key: 'project_status_id', fieldName: 'Proyek Status' },
      { key: 'project_address', fieldName: 'Alamat Proyek' },
      { key: 'project_number', fieldName: 'Nomor Proyek' },
      { key: 'request_survey', fieldName: 'Request Survey' },
      { key: 'payment_type', fieldName: 'Payment Type' },
      { key: 'receipt_number', fieldName: 'Nomor Receipt' },
      { key: 'is_overdistance', fieldName: 'Overdistance' },
      { key: 'additional_fee', fieldName: 'Additional Fee' },
      { key: 'notes', fieldName: 'Catatan' },
    ]
    

    const requiredOrderDetailsFields = [
      { key: 'item_id', fieldName: 'Nama Pemasangan' },
      { key: 'item_notes', fieldName: 'Nama Pemasangan' },
      { key: 'item_code', fieldName: 'Item Code' },
      { key: 'item_name', fieldName: 'Item Name' },
      { key: 'quantity', fieldName: 'Quantity' },
    ]

    for (const { key, fieldName } of requiredOrderFields) {
      const value = orderForm[key]
      if (!value && key !== 'order_details') {
        if (key === 'additional_fee' && isOverdistance === 1) {
          if (value) formData.append(key, value.toString())
        } else if (key === 'is_overdistance' || key === 'notes') {
          if (value) formData.append(key, value.toString())
        } else {
          errorBags.push({ message: `Mohon isi kolom ${fieldName}` })
          setIsLoading(false)
        }
      } else {
        formData.append(key, value)
      }
    }

    if (orderForm.order_details && Array.isArray(orderForm.order_details)) {
      orderForm.order_details.forEach((item: any, index: number) => {
        requiredOrderDetailsFields.forEach(({ key, fieldName }) => {
          const value = item[key]

          if (
            (key === 'item_notes' && orderForm.payment_type === 'survey' && !value) ||
            (key === 'item_id' && orderForm.payment_type !== 'survey' && !value) ||
            (!value && key !== 'item_notes' && key !== 'item_id')
          ) {
            errorBags.push({
              message: `Mohon isi kolom "${fieldName}"`,
            })
            setIsLoading(false)
          }
        })

        if (item) {
          appendIfNotDefault(`order_details[${index}][item_code]`, item.item_code ?? '')
          appendIfNotDefault(`order_details[${index}][item_name]`, item.item_name ?? '')
          appendIfNotDefault(`order_details[${index}][item_notes]`, item.item_notes ?? '')
          appendIfNotDefault(`order_details[${index}][item_id]`, item.item_id ?? '')
          appendIfNotDefault(`order_details[${index}][quantity]`, item.quantity ?? '')
        }
      })
    }

    if (errorBags.length > 0) {
      setIsLoading(false)

      Swal.fire({
        title: 'Warning',
        text: errorBags[0].message,
        icon: 'warning',
      })

      return false
    }

    if (receiptFiles?.length) {
      receiptFiles.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`order_files`, item, item.name)
        }
      })
    }

    if (receiptFiles?.length) {
      receiptFiles.forEach((item: any, index: number) => {
        if (item.id) {
          formData.append(`existing_order_files[${index}][order_file_id]`, item.id)
        }
      })
    }
    // console.log(orderStatusLabel);
    // console.log(orderForm);
    // sendMessage()
    await axios
      .post(url, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })
      .then((response) => {
        const orderId = response.data.data.id

        if (response.data.status === 200 || response.data.status === 201) {
          sendMessage()
          sentWA();
          Swal.fire({
            title: 'Success',
            text: 'Success Update Order',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            if (
              orderDetail?.quotation?.length >= 1 &&
              orderDetail?.payment_type === 'survey' &&
              isCanceledOrder === false
            ) {
              navigate(`/order/view-order`)
            } else if (isCanceledOrder === true) {
              navigate(`/refund/new-refund/${orderId}`)
            } else {
              navigate(`/order/preview-email/${orderId}`)
            }
          })
          setIsLoading(false)
        } else {
          setIsLoading(false)
          Swal.fire({
            title: 'Error',
            text: response.data.message,
            icon: 'error',
          })
        }
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
  const sendMessage = async () => {
    const filteredTemplates: any = template.find(
      (t: any) => t.subCategory === orderStatusLabel && t.status === 'Active'
    )
    if (filteredTemplates.withImage) {
      const data = {
        message: filteredTemplates?.content,
        chatId: `62${orderForm.project_number}@c.us`,
        adminRole: userRole,
        imagePath: filteredTemplates?.imageUrl,
      }

      await axios
        .post(`${apiChat}/send-message-change-status-image`, data)
        .then((response) => {
          console.log(response)
        })
        .catch((error) => {
          console.error(error)

          // Swal.fire({
          //   title: 'Error',
          //   text: error.response.data.message,
          //   icon: 'error',
          // })
        })
    } else {
      const data = {
        message: filteredTemplates?.content,
        chatId: `62${orderForm.project_number}@c.us`,
        adminRole: userRole,
      }

      await axios
        .post(`${apiChat}/send-message-change-status`, data)
        .then((response) => {
          console.log(response)
        })
        .catch((error) => {
          console.error(error)

          // Swal.fire({
          //   title: 'Error',
          //   text: error.response.data.message,
          //   icon: 'error',
          // })
        })
    }
  }
  // Reprint Order
  const handleCancelOrder = async () => {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Apakah anda yakin ingin membatalkan orderan ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya',
      confirmButtonColor: '#6b9230',
      cancelButtonText: 'Tidak',
      cancelButtonColor: '#a30014',
    }).then((result) => {
      if (result.isConfirmed) {
        setIsCanceledOrder(true)
        handleUpdateOrder()
      }
    })
  }

  return (
    <section id='update-order'>
      <Spin
        spinning={isLoadingPage}
        size='large'
        tip='Loading...'
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
      >
        <Card className='mb-5'>
          <Card.Body>
            <div className='form-wrapper'>
              <div className='form-costumer'>
                <Row className='form-header'>
                  <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='mb-3'>
                    <Form.Group as={Row} className='mb-5'>
                      <Form.Label column sm='4'>
                        Nama Toko tes
                      </Form.Label>

                      <Col sm='8'>
                        {orderDetail?.status?.category === 'QUOTEOUT' ? (
                          <Form.Control readOnly type='text' value={selectedStore?.label ?? ''} />
                        ) : (
                          <Select
                            name='store_id'
                            className='form-control p-0'
                            classNamePrefix='select'
                            placeholder='Pilih Toko'
                            isSearchable={true}
                            isClearable={true}
                            options={store}
                            value={{
                              value: selectedStore?.value ?? null,
                              label: selectedStore?.label ?? '',
                              address: selectedStore?.address ?? '',
                              city_id: selectedStore?.city_id ?? null,
                              zip_code: selectedStore?.zip_code ?? '',
                            }}
                            onChange={(newValue) => setSelectedStore(newValue)}
                          />
                        )}
                      </Col>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='mb-3'>
                    <Row>
                      <Col xxl={3}>
                        <Form.Label className='payment-type'>Payment Type :</Form.Label>
                      </Col>

                      <Col className='form-check-request' xxl={9}>
                        <Row>
                          <Col xxl={5}>
                            <Form.Check
                              inline
                              label='Gratis'
                              id='gratis'
                              name='type'
                              type='radio'
                              value='gratis'
                              checked={paymentTypeValue[0] === 'gratis'}
                              onChange={() =>
                                setPaymentTypeValue(['gratis', 'pemasangan_tanpa_survey'])
                              }
                            />
                          </Col>

                          <Col xxl={7}>
                            <Form.Check
                              inline
                              label='Survey'
                              id='survey'
                              name='paymentType'
                              type='radio'
                              value='survey'
                              checked={
                                paymentTypeValue[0] === 'berbayar' &&
                                paymentTypeValue[1] === 'survey'
                              }
                              disabled={paymentTypeValue[0] === 'gratis'}
                              onChange={() => {
                                setPaymentTypeValue(['berbayar', 'survey'])
                              }}
                            />
                          </Col>
                        </Row>

                        <Row>
                          <Col xxl={5}>
                            <Form.Check
                              inline
                              label='Berbayar'
                              id='berbayar'
                              name='type'
                              type='radio'
                              value='berbayar'
                              checked={paymentTypeValue[0] === 'berbayar'}
                              onChange={() => {
                                setPaymentTypeValue(['berbayar', 'survey'])
                              }}
                            />
                          </Col>

                          <Col xxl={7}>
                            <Form.Check
                              inline
                              label='Pemasangan Tanpa Survey'
                              id='pemasangan_tanpa_survey'
                              name='paymentType'
                              type='radio'
                              value='pemasangan_tanpa_survey'
                              checked={
                                (paymentTypeValue[0] === 'gratis' &&
                                  paymentTypeValue[1] === 'pemasangan_tanpa_survey') ||
                                (paymentTypeValue[0] === 'berbayar' &&
                                  paymentTypeValue[1] === 'pemasangan_tanpa_survey')
                              }
                              disabled={paymentTypeValue[0] === 'gratis'}
                              onChange={() => {
                                setPaymentTypeValue([
                                  paymentTypeValue[0],
                                  'pemasangan_tanpa_survey',
                                ])
                              }}
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>

                    <Form.Label className='fs-7 fw-normal'>
                      <span className='text-danger fw-bold'>Note :</span>
                      <br></br>Tidak dapat memilih gratis dan survey secara bersamaan
                    </Form.Label>
                  </Col>
                </Row>

                <Row className='input-order'>
                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Form.Group className='mb-5'>
                      <Form.Label>No Member</Form.Label>
                      <Select
                        name='member'
                        id='member'
                        className='form-control p-0 form-item-name'
                        classNamePrefix='select'
                        placeholder='Ketik No Telepon Member/Nomor Member'
                        isSearchable={true}
                        isClearable={true}
                        isDisabled={true}
                        options={member}
                        value={{
                          value: selectedMember?.value ?? null,
                          label: selectedMember?.label ?? '',
                          full_name: selectedMember?.full_name ?? '',
                          email: selectedMember?.email ?? '',
                          phone_number: selectedMember?.phone_number ?? '',
                          whatsapp_number: selectedMember?.whatsapp_number ?? '',
                          address_1: selectedMember?.address_1 ?? '',
                        }}
                        onChange={(newValue) => setSelectedMember(newValue)}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Form.Group className='mb-5'>
                      <div className='d-flex justify-content-between'>
                        <Form.Label>WA / Phone Number</Form.Label>

                        <div className='form-check-request'>
                          <Form.Check
                            inline
                            disabled
                            label='Bukan Whatsapp'
                            name='group1'
                            value='1'
                            type='checkbox'
                            onChange={() => setIsWhatsapp(!isWhatsapp)}
                          />
                        </div>
                      </div>

                      <InputGroup className='mb-5'>
                        <Form.Control
                          disabled
                          name='project_number'
                          value={orderForm.project_number}
                          onChange={(event) => orderFormHandler(event)}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className='input-order'>
                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Form.Group className='mb-5'>
                      <Form.Label>Nama Customer</Form.Label>
                      <Form.Control type='text' disabled value={selectedMember?.full_name || ''} />
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Form.Group className='mb-5'>
                      <Form.Label>Email</Form.Label>
                      <Form.Control type='text' disabled value={selectedMember?.email || ''} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className='alamat-order'>
                  <Col>
                    <Form.Group className='mb-5'>
                      <div className='d-flex gap-3'>
                        <Form.Label>Alamat</Form.Label>
                        <Form.Check
                          inline
                          label='Lebih dari 10 KM dengan maksimal jarak 40 KM'
                          type='checkbox'
                          checked={isOverdistance === 1}
                          onChange={(e) => handleCheckboxChange(e.target.checked)}
                        />
                      </div>

                      <Form.Control
                        as='textarea'
                        name='project_address'
                        className='field-alamat'
                        disabled={
                          orderDetail?.quotation?.length >= 1 &&
                            orderDetail?.payment_type === 'survey'
                            ? true
                            : false
                        }
                        value={orderForm.project_address}
                        onChange={(event) => orderFormHandler(event)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              <div className='form-sales'>
                <div className='form-header'>
                  <h1 className='text-end fw-bold'>SALES INFORMATION</h1>
                </div>
                <Form.Group as={Row} className='mb-5'>
                  <Form.Label column sm='4'>
                    Sales ID :
                  </Form.Label>

                  <Col sm='8'>
                    <Form.Control disabled type='number' value={selectedSales?.value || ''} />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='mb-5'>
                  <Form.Label column sm='4'>
                    Nama Sales :
                  </Form.Label>

                  <Col sm='8'>
                    {orderDetail?.status?.category === 'QUOTEOUT' ? (
                      <Form.Control readOnly type='text' value={selectedSales?.full_name ?? ''} />
                    ) : (
                      <Select
                        name='sales'
                        id='sales'
                        className='form-control p-0 form-item-name'
                        classNamePrefix='select'
                        placeholder='Pilih/Ketik Nama Sales'
                        isSearchable={true}
                        isClearable={true}
                        options={sales}
                        value={{
                          value: selectedSales?.value ?? null,
                          label: selectedSales?.full_name ?? '',
                          full_name: selectedSales?.full_name ?? '',
                        }}
                        onChange={(newValue) => setSelectedSales(newValue)}
                        onInputChange={(newValue) => setSearchSales(newValue)}
                      />
                    )}
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='mb-5'>
                  <Form.Label column sm='4'>
                    No Receipt
                  </Form.Label>
                  <Col sm='8'>
                    <Form.Control
                      name='receipt_number'
                      type='text'
                      value={orderForm.receipt_number}
                      readOnly={
                        orderDetail?.quotation?.length >= 1 &&
                          orderDetail?.payment_type === 'survey'
                          ? true
                          : false
                      }
                      onChange={(e) => orderFormHandler(e)}
                    />
                  </Col>
                </Form.Group>

                {orderDetail?.quotation[0]?.receipt_quotation &&
                  orderDetail?.quotation[0]?.quotation_special === 0 && (
                    <Form.Group as={Row} className='mb-5'>
                      <Form.Label column sm='4'>
                        Receipt Transaksi
                      </Form.Label>
                      <Col sm='8'>
                        <Form.Control
                          type='text'
                          value={orderDetail?.quotation[0]?.receipt_quotation}
                          readOnly={
                            orderDetail?.quotation?.length >= 1 &&
                              orderDetail?.payment_type === 'survey'
                              ? true
                              : false
                          }
                          onChange={(e) => orderFormHandler(e)}
                        />
                      </Col>
                    </Form.Group>
                  )}

                <Form.Group as={Row} className='mb-5'>
                  <Form.Label className='title' column xxl='4' xl='5' md='2'>
                    Catatan :
                  </Form.Label>

                  <Col xxl='8' xl='7' md='10'>
                    <Form.Control
                      as='textarea'
                      name='notes'
                      className='additional-notes'
                      style={{ minHeight: '150px' }}
                      value={orderForm.notes}
                      onChange={(event) => {
                        orderFormHandler(event)
                      }}
                    />
                  </Col>
                </Form.Group>
              </div>
            </div>

            {orderDetail?.quotation?.length >= 1 && orderDetail?.payment_type === 'survey' ? (
              <Row className='table-order-header d-flex align-items-center mb-5'>
                <Col
                  xs={12}
                  md={4}
                  lg={4}
                  xl={4}
                  xxl={4}
                  className='request-date order-2 order-md-1'
                >
                  <Form.Group>
                    <Form.Label>Nama Vendor :</Form.Label>

                    <Select
                      name='vendor'
                      id='vendor'
                      className='form-control p-0 form-item-name'
                      classNamePrefix='select'
                      placeholder='Pilih/Ketik Nama Vendor'
                      isSearchable={true}
                      isClearable={true}
                      options={vendor}
                      value={{
                        value: selectedVendor?.value ?? null,
                        label: selectedVendor?.label ?? '',
                      }}
                      onChange={(newValue) => handleChangeVendor(newValue)}
                    />
                  </Form.Group>
                  <Form.Text className='fs-8 text-transparent'>
                    *Tanggal Request{' '}
                    <span className='fw-bolder text-decoration-underline'>bukan</span> tanggal
                    pasti. Konfirmasi kunjungan dilakukan oleh Vendor
                  </Form.Text>
                </Col>

                <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='request-date'>
                  <Form.Group>
                    <Form.Label>Tanggal Request</Form.Label>
                    <Form.Control
                      name='request_survey'
                      type='date'
                      value={orderForm.request_survey}
                      readOnly={
                        orderDetail?.quotation?.length >= 1 &&
                          orderDetail?.payment_type === 'survey'
                          ? true
                          : false
                      }
                      onChange={(e) => orderFormHandler(e)}
                      min={today}
                    />
                    <Form.Text className='fs-8 text-dark-danger'>
                      *Tanggal Request{' '}
                      <span className='fw-bolder text-decoration-underline'>bukan</span> tanggal
                      pasti. Konfirmasi kunjungan dilakukan oleh Vendor
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col
                  xs={12}
                  md={4}
                  lg={4}
                  xl={4}
                  xxl={4}
                  className='text-start order-status order-1 order-md-2'
                >
                  <h1 className='fs-3 fw-bold'>
                    STATUS ORDER :{' '}
                    {orderDetail?.quotation[0].quotation_files.length ? (
                      <span className='fw-bold text-success'>
                        {`${orderDetail?.status?.description}`}{' '}
                        <span className='text-dark'>( Sudah dibayar )</span>
                      </span>
                    ) : (
                      <span className='fw-bold text-success'>
                        {`${orderDetail?.status?.description}`}{' '}
                        <span className='text-dark'>( Belum dibayar )</span>
                      </span>
                    )}
                  </h1>
                </Col>
              </Row>
            ) : (
              <Row className='table-order-header d-flex align-items-center mb-5'>
                <Col
                  xs={12}
                  md={3}
                  lg={3}
                  xl={3}
                  xxl={3}
                  className='request-date order-2 order-md-1'
                >
                  <Form.Group>
                    <Form.Label>Nama Vendor :</Form.Label>

                    <Select
                      name='vendor'
                      id='vendor'
                      className='form-control p-0 form-item-name'
                      classNamePrefix='select'
                      placeholder='Pilih/Ketik Nama Vendor'
                      isSearchable={true}
                      isClearable={true}
                      options={vendor}
                      value={{
                        value: selectedVendor?.value ?? null,
                        label: selectedVendor?.label ?? '',
                      }}
                      onChange={(newValue) => handleChangeVendor(newValue)}
                    />
                  </Form.Group>
                  <Form.Text className='fs-8 text-transparent'>
                    *Tanggal Request{' '}
                    <span className='fw-bolder text-decoration-underline'>bukan</span> tanggal
                    pasti. Konfirmasi kunjungan dilakukan oleh Vendor
                  </Form.Text>
                </Col>

                <Col xs={12} md={3} lg={3} xl={3} xxl={3} className='request-date'>
                  <Form.Group>
                    <Form.Label>Tanggal Request</Form.Label>
                    <Form.Control
                      name='request_survey'
                      type='date'
                      value={orderForm.request_survey}
                      onChange={(e) => orderFormHandler(e)}
                      min={today}
                    />
                    <Form.Text className='fs-8 text-dark-danger'>
                      *Tanggal Request{' '}
                      <span className='fw-bolder text-decoration-underline'>bukan</span> tanggal
                      pasti. Konfirmasi kunjungan dilakukan oleh Vendor
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col
                  xs={12}
                  md={3}
                  lg={3}
                  xl={3}
                  xxl={3}
                  className='order-status order-1 order-md-2'
                >
                  <h1 className='fs-3 fw-bold'>
                    STATUS ORDER :{' '}
                    <span className='fw-bold text-success'>{orderDetail?.status?.description}</span>
                  </h1>
                </Col>

                <Col
                  xs={12}
                  md={3}
                  lg={3}
                  xl={3}
                  xxl={3}
                  className='button-add text-end order-3 order-md-3'
                >
                  <button onClick={() => addOrderDetails()}>Tambah Order</button>
                </Col>
              </Row>
            )}

            {(() => {
              if (orderDetail?.quotation?.length >= 1 && orderDetail?.payment_type === 'survey') {
                return (
                  <>
                    <div className='table-warranty-content'>
                      {orderDetail?.quotation?.[0]?.quotation_special === 0 ? (
                        <table className='table hover responsive'>
                          <thead className='table-warranty-head'>
                            <tr>
                              <th className='text-center' style={{ width: '355px' }}>
                                Jenis Jasa
                              </th>

                              <th className='text-center' style={{ width: '100px' }}>
                                QTY
                              </th>

                              <th className='text-center' style={{ width: '250px' }}>
                                Satuan
                              </th>

                              <th className='text-center' style={{ width: '250px' }}>
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
                      ) : (
                        <>
                          <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 1</div>

                          {orderDetail?.quotation[0]?.quotation_receipt[0]?.receipt_quotation &&
                            orderDetail?.quotation[0]?.quotation_special === 1 && (
                              <div className='fs-6 fw-bold'>
                                Receipt Transaksi Tahap 1 :{' '}
                                <span className='fs-6 fw-semibold'>
                                  {orderDetail?.quotation[0]?.quotation_receipt[0]
                                    ?.receipt_quotation ?? '-'}
                                </span>
                              </div>
                            )}

                          <table className='table hover responsive'>
                            <thead className='table-warranty-head'>
                              <tr>
                                <th className='text-center' style={{ width: '355px' }}>
                                  Jenis Jasa
                                </th>

                                <th className='text-center' style={{ width: '100px' }}>
                                  QTY
                                </th>

                                <th className='text-center' style={{ width: '250px' }}>
                                  Satuan
                                </th>

                                <th className='text-center' style={{ width: '250px' }}>
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

                          <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 2</div>

                          {orderDetail?.quotation[0]?.quotation_receipt[1]?.receipt_quotation &&
                            orderDetail?.quotation[0]?.quotation_special === 1 && (
                              <div className='fs-6 fw-bold'>
                                Receipt Transaksi Tahap 1 :{' '}
                                <span className='fs-6 fw-semibold'>
                                  {orderDetail?.quotation[0]?.quotation_receipt[1]
                                    ?.receipt_quotation ?? '-'}
                                </span>
                              </div>
                            )}

                          <table className='table hover responsive'>
                            <thead className='table-warranty-head'>
                              <tr>
                                <th className='text-center' style={{ width: '355px' }}>
                                  Jenis Jasa
                                </th>

                                <th className='text-center' style={{ width: '100px' }}>
                                  QTY
                                </th>

                                <th className='text-center' style={{ width: '250px' }}>
                                  Satuan
                                </th>

                                <th className='text-center' style={{ width: '250px' }}>
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

                          <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 3</div>

                          {orderDetail?.quotation[0]?.quotation_receipt[2]?.receipt_quotation &&
                            orderDetail?.quotation[0]?.quotation_special === 1 && (
                              <div className='fs-6 fw-bold'>
                                Receipt Transaksi Tahap 1 :{' '}
                                <span className='fs-6 fw-semibold'>
                                  {orderDetail?.quotation[0]?.quotation_receipt[2]
                                    ?.receipt_quotation ?? '-'}
                                </span>
                              </div>
                            )}

                          <table className='table hover responsive'>
                            <thead className='table-warranty-head'>
                              <tr>
                                <th className='text-center' style={{ width: '355px' }}>
                                  Jenis Jasa
                                </th>

                                <th className='text-center' style={{ width: '100px' }}>
                                  QTY
                                </th>

                                <th className='text-center' style={{ width: '250px' }}>
                                  Satuan
                                </th>

                                <th className='text-center' style={{ width: '250px' }}>
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
                        </>
                      )}

                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th className='text-center' style={{ width: '355px' }}>
                              Material Yang Dibutuhkan
                            </th>

                            <th className='text-center' style={{ width: '100px' }}>
                              QTY
                            </th>

                            <th className='text-center' style={{ width: '250px' }}>
                              Satuan
                            </th>

                            <th className='text-center' style={{ width: '250px' }}>
                              Price
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
                                <td>{`Rp. ${parseInt(item?.price ?? 0).toLocaleString('id')}`}</td>
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
                              {`${orderDetail?.quotation[0]?.promotion
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

                    <Row className='upload-receipt d-flex align-items-start mt-5'>
                      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                        <Form.Label className='mt-3'>Bukti Receipt :</Form.Label>
                        <ListGroup>
                          {orderDetail?.order_files.map((item: any) => (
                            <ListGroup.Item
                              key={item.id}
                              action
                              onClick={() => {
                                setPreviewImage(item.path)
                                setVisible(true)
                              }}
                            >
                              {item.path}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>

                        {previewImage && (
                          <div>
                            <Image
                              key={previewImage}
                              width={200}
                              style={{ display: 'none' }}
                              src={`${apiUrl}/public/receipt/${previewImage}`}
                              preview={{
                                visible: visible,
                                src: `${apiUrl}/public/receipt/${previewImage}`,
                                onVisibleChange: (value) => {
                                  setVisible(value)
                                },
                              }}
                            />
                          </div>
                        )}
                      </Col>

                      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                        <Form.Label className='mt-3'>Bukti Receipt Pembayaran :</Form.Label>
                        <ListGroup>
                          {orderDetail?.quotation[0]?.quotation_files
                            .filter((x: any) => x.type === 2)
                            .map((item: any) => (
                              <ListGroup.Item
                                key={item.id}
                                action
                                onClick={() => {
                                  setPreviewImage(item.path)
                                  setVisibleQuotationReceipt(true)
                                }}
                              >
                                {item.path}
                              </ListGroup.Item>
                            ))}
                        </ListGroup>

                        {orderDetail?.quotation[0]?.quotation_files.length ? (
                          <>
                            {previewImage && (
                              <div>
                                <Image
                                  key={previewImage}
                                  width={200}
                                  style={{ display: 'none' }}
                                  src={`${apiUrl}/public/quotation/${previewImage}`}
                                  preview={{
                                    visible: visibleQuotationReceipt,
                                    src: `${apiUrl}/public/quotation/${previewImage}`,
                                    onVisibleChange: (value) => {
                                      setVisibleQuotationReceipt(value)
                                    },
                                  }}
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className='d-flex justify-content-start align-items-center'>
                            <p className='fs-7 text-danger'>
                              Pembayaran belum diverifikasi oleh Toko
                            </p>
                          </div>
                        )}
                      </Col>

                      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                        <Form.Label className='mt-3'>Bukti Transfer :</Form.Label>
                        <ListGroup>
                          {orderDetail?.quotation[0].quotation_files
                            .filter((x: any) => x.type === 1 || x.type === 3)
                            .map((item: any) => (
                              <ListGroup.Item
                                key={item.id}
                                action
                                onClick={() => {
                                  setPreviewImage(item.path)
                                  setVisibleQuotationFiles(true)
                                }}
                              >
                                {item.path}
                                {item.type === 3 ? ' ( Bukti transfer dikirim oleh customer)' : ''}
                              </ListGroup.Item>
                            ))}
                        </ListGroup>

                        {orderDetail?.quotation[0]?.quotation_files.length ? (
                          <>
                            {previewImage && (
                              <div>
                                <Image
                                  key={previewImage}
                                  width={200}
                                  style={{ display: 'none' }}
                                  src={`${apiUrl}/public/quotation/${previewImage}`}
                                  preview={{
                                    visible: visibleQuotationFiles,
                                    src: `${apiUrl}/public/quotation/${previewImage}`,
                                    onVisibleChange: (value) => {
                                      setVisibleQuotationFiles(value)
                                    },
                                  }}
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className='d-flex justify-content-start align-items-center'>
                            <p className='fs-7 text-danger'>
                              Pembayaran belum diverifikasi oleh Toko
                            </p>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </>
                )
              } else {
                return (
                  <>
                    <div className='table-order-content'>
                      <Table hover responsive='md'>
                        <thead className='table-order-head'>
                          <tr>
                            <th>Item Code</th>
                            <th>Item Name</th>
                            <th>Nama Pemasangan</th>
                            <th>QTY Pemasangan</th>
                            {!(
                              paymentTypeValue[0] === 'gratis' || paymentTypeValue[1] === 'survey'
                            ) && (
                                <>
                                  <th>Harga Jasa</th>
                                  <th>Total</th>
                                </>
                              )}
                            {orderForm.order_details.length >= 2 && <th>Action</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {orderForm.order_details.map((element, index) => (
                            <tr key={`${index}-order_details`}>
                              <td>
                                {paymentTypeValue[1] === 'survey' ? (
                                  <CreatableSelect
                                    id={`item_id-${index}`}
                                    className='form-control p-0 form-item-code'
                                    classNamePrefix='select'
                                    placeholder='Pilih/Ketik Item Code'
                                    isSearchable={true}
                                    isClearable={true}
                                    options={item}
                                    name={`item_id`}
                                    styles={{
                                      singleValue: (base) => ({
                                        ...base,
                                        overflow: 'auto',
                                        whiteSpace: 'normal',
                                        textOverflow: '',
                                      }),
                                    }}
                                    value={orderForm.order_details[index]?.item ?? null}
                                    onInputChange={(newValue) => setSearchItem(newValue)}
                                    onChange={(newValue) => {
                                      setOrderForm((prev) => {
                                        const cache = { ...prev }
                                        cache.order_details[index] = {
                                          ...cache.order_details[index],
                                          item_id:
                                            newValue?.__isNew__ === true
                                              ? null
                                              : newValue?.value ?? null,
                                          item_code: newValue?.__isNew__
                                            ? ((newValue?.value ?? '') as string)
                                            : ((newValue?.item_code ?? '') as string),
                                          item_name: newValue?.item_name ?? '',
                                          item_notes: newValue?.item_name ?? '',
                                          item: newValue,
                                        }
                                        return cache
                                      })
                                      calcEachDetails()
                                    }}
                                  />
                                ) : (
                                  <Form.Control
                                    id={`item-code-${index}`}
                                    name={`item_code`}
                                    plaintext
                                    as='textarea'
                                    ref={(el: any) => (textAreaRefs.current[index] = el)}
                                    readOnly={
                                      paymentTypeValue[1] === 'pemasangan_tanpa_survey'
                                        ? true
                                        : false
                                    }
                                    value={element.item_code ?? ''}
                                    onChange={(e) => orderDetailsFormHandler(e, index)}
                                    onInput={() => {
                                      const textarea = textAreaRefs.current[index]
                                      if (textarea) {
                                        textarea.style.height = 'auto'
                                        textarea.style.height = textarea.scrollHeight + 'px'
                                      }
                                    }}
                                  />
                                )}
                              </td>

                              <td style={{ maxWidth: '200px', minWidth: '200px' }}>
                                <Form.Control
                                  id={`item-name-${index}`}
                                  name={`item_name`}
                                  as='textarea'
                                  plaintext
                                  ref={(el: any) =>
                                  (textAreaRefs.current[orderForm.order_details.length + index] =
                                    el)
                                  }
                                  readOnly={
                                    paymentTypeValue[1] === 'pemasangan_tanpa_survey' ? true : false
                                  }
                                  value={element.item_name ?? ''}
                                  onChange={(e) => {
                                    orderDetailsFormHandler(e, index)
                                  }}
                                  onInput={() => {
                                    const textarea =
                                      textAreaRefs.current[orderForm.order_details.length + index]
                                    if (textarea) {
                                      textarea.style.height = 'auto'
                                      textarea.style.height = textarea.scrollHeight + 'px'
                                    }
                                  }}
                                />
                              </td>

                              <td>
                                {paymentTypeValue[1] === 'survey' ? (
                                  <Form.Control
                                    id={`item-notes-${index}`}
                                    plaintext
                                    as='textarea'
                                    name={`item_notes`}
                                    ref={(el: any) =>
                                    (textAreaRefs.current[
                                      2 * orderForm.order_details.length + index
                                    ] = el)
                                    }
                                    value={element.item_notes ?? ''}
                                    onChange={(e) => {
                                      orderDetailsFormHandler(e, index)
                                    }}
                                    onInput={() => {
                                      const textarea =
                                        textAreaRefs.current[
                                        2 * orderForm.order_details.length + index
                                        ]
                                      if (textarea) {
                                        textarea.style.height = 'auto'
                                        textarea.style.height = textarea.scrollHeight + 'px'
                                      }
                                    }}
                                  />
                                ) : (
                                  <Select
                                    id={`item_id-${index}`}
                                    className='form-control p-0 form-item-name'
                                    classNamePrefix='select'
                                    placeholder='Pilih/Ketik Nama Pemasangan'
                                    isSearchable={true}
                                    isClearable={true}
                                    options={item}
                                    name={`item_id`}
                                    getOptionLabel={(option) => option?.service_name || option?.label || ''}
                                    getOptionValue={(option) => String(option?.value ?? '')}
                                    onInputChange={(newValue) => setSearchPemasangan(newValue)}
                                    styles={{
                                      singleValue: (base) => ({
                                        ...base,
                                        overflow: 'auto',
                                        whiteSpace: 'normal',
                                        textOverflow: '',
                                      }),
                                    }}
                                    value={{
                                      value: orderForm.order_details[index]?.item_id ?? null,
                                      label: orderForm.order_details[index]?.item?.label ?? '',
                                      item_code: orderForm.order_details[index]?.item_code ?? '',
                                      item_name: orderForm.order_details[index]?.item_name ?? '',
                                      service_name: orderForm.order_details[index]?.item?.service_name ?? '',
                                      category_id:
                                        orderForm.order_details[index]?.item?.category_id ?? null,
                                      default_price:
                                        orderForm.order_details[index]?.item?.default_price ?? 0,
                                      type: orderForm.order_details[index]?.item?.type ?? null,
                                      prices: orderForm.order_details[index]?.item?.prices ?? [],
                                    }}
                                    onChange={(newValue) => {
                                      setOrderForm((prev) => {
                                        const cache = { ...prev }
                                        cache.order_details[index] = {
                                          ...cache.order_details[index],
                                          item_id: newValue?.value ?? null,
                                          item_code: newValue?.item_code ?? '',
                                          item_name: newValue?.item_name ?? '',
                                          item: newValue,
                                        }
                                        return cache
                                      })
                                      calcEachDetails()
                                    }}
                                  />
                                )}
                              </td>

                              <td>
                                <Form.Control
                                  id={`quantity-${index}`}
                                  name={`quantity`}
                                  type='number'
                                  value={element.quantity ?? ''}
                                  onChange={(e) => {
                                    orderDetailsFormHandler(e, index)
                                    calcEachDetails()
                                  }}
                                />
                              </td>

                              {!(
                                paymentTypeValue[0] === 'gratis' || paymentTypeValue[1] === 'survey'
                              ) && (
                                  <>
                                    <td>
                                      <Form.Control
                                        id={`unit-price-${index}`}
                                        readOnly
                                        plaintext
                                        value={`Rp. ${element?.unit_price
                                            ? parseInt(element?.unit_price).toLocaleString('id')
                                            : 0
                                          }`}
                                      />
                                    </td>

                                    <td>
                                      <Form.Control
                                        id={`total-${index}`}
                                        readOnly
                                        plaintext
                                        value={`Rp. ${element?.total
                                            ? parseInt(element?.total).toLocaleString('id')
                                            : 0
                                          }`}
                                      />
                                    </td>
                                  </>
                                )}

                              {orderForm.order_details.length >= 2 && (
                                <td align='center'>
                                  <Button variant='danger' onClick={() => handleRemoveForm(index)}>
                                    Remove
                                  </Button>
                                </td>
                              )}
                            </tr>
                          ))}

                          {!(
                            paymentTypeValue[0] === 'gratis' ||
                            paymentTypeValue[1] === 'pemasangan_tanpa_survey'
                          ) && (
                              <tr>
                                <td
                                  className='text-end fw-bolder'
                                  colSpan={orderForm.order_details.length >= 2 ? 4 : 3}
                                >
                                  Biaya Survey
                                </td>

                                <td className=' fw-bolder'>
                                  {(() => {
                                    if (paymentTypeValue[1] === 'survey') {
                                      return `Rp. 99.000`
                                    } else {
                                      return `Rp. 0`
                                    }
                                  })()}
                                </td>
                              </tr>
                            )}

                          {isOverdistance === 1 && (
                            <tr>
                              <td
                                className='text-end fw-bolder align-middle'
                                colSpan={
                                  !(
                                    paymentTypeValue[0] === 'gratis' ||
                                    paymentTypeValue[1] === 'survey'
                                  )
                                    ? orderForm.order_details.length >= 2
                                      ? 6
                                      : 5
                                    : orderForm.order_details.length === 1
                                      ? 3
                                      : 4
                                }
                              >
                                Biaya Tambahan
                              </td>

                              <td className=' fw-bolder'>
                                Rp. {Number(orderForm.additional_fee).toLocaleString('id')}
                              </td>
                            </tr>
                          )}

                          {(paymentTypeValue[1] !== 'survey' || isOverdistance === 1) && (
                            <tr>
                              <td
                                className='text-end fw-bolder'
                                colSpan={
                                  !(
                                    paymentTypeValue[0] === 'gratis' ||
                                    paymentTypeValue[1] === 'survey'
                                  )
                                    ? orderForm.order_details.length >= 2
                                      ? 6
                                      : 5
                                    : orderForm.order_details.length === 1
                                      ? 3
                                      : 4
                                }
                              >
                                Grand Total
                              </td>
                              <td className=' fw-bolder'>Rp. {grandTotal.toLocaleString('id')}</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>

                      <Form.Text className='fs-8 fs-l text-dark-danger'>
                        *Penulisan Item code dan Item Name sama persis dengan yang tercantum di NAV
                      </Form.Text>
                    </div>

                    <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
                      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                        <Form.Group>
                          <Form.Label>Upload Receipt</Form.Label>
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
                            {receiptFiles.length ? (
                              receiptFiles.map((item, index) => (
                                <ListGroup>
                                  <ListGroup.Item
                                    className='d-flex justify-content-between align-items-center'
                                    key={`${item?.name}-${index}-${item?.type}`}
                                  >
                                    <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                                    <span
                                      className='upload-content'
                                      onClick={() => handleFileClick(index)}
                                    >
                                      {item?.name}
                                    </span>

                                    <FontAwesomeIcon
                                      icon={faTrash}
                                      size='sm'
                                      color='#ed2b2a'
                                      style={{ cursor: 'pointer' }}
                                      onClick={(e) => handleRemoveFile(index)}
                                    />
                                  </ListGroup.Item>

                                  {selectedFileIndex === index && item && (
                                    <Image
                                      key={`${previewImage} - ${index}`}
                                      width={200}
                                      style={{ display: 'none' }}
                                      src={
                                        item instanceof File
                                          ? URL.createObjectURL(item)
                                          : `${apiUrl}/public/receipt/${previewImage}`
                                      }
                                      preview={{
                                        visible,
                                        src:
                                          item instanceof File
                                            ? URL.createObjectURL(item)
                                            : `${apiUrl}/public/receipt/${previewImage}`,
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
                      </Col>

                      <Col xs={12} md={4} lg={4} xl={4} xxl={4}></Col>
                      <Col xs={12} md={4} lg={4} xl={4} xxl={4}></Col>
                    </Row>
                  </>
                )
              }
            })()}

            <div className='button-submit d-flex justify-content-center align-items-center mt-5'>
              <Button onClick={handleUpdateOrder} disabled={isLoading} variant='dark-primary'>
                {orderDetail?.quotation?.length >= 1 && orderDetail?.payment_type === 'survey'
                  ? isLoading
                    ? 'Submitting..'
                    : 'Request Pengerjaan Ke Vendor Terkait'
                  : isLoading
                    ? 'Submitting..'
                    : 'Submit Order & Email'}
              </Button>

              {orderDetail?.quotation?.length >= 1 && orderDetail?.payment_type === 'survey' ? (
                <Button onClick={handleCancelOrder} disabled={isLoading} variant='dark-danger'>
                  Close Order
                </Button>
              ) : (
                <></>
              )}
            </div>
          </Card.Body>
        </Card>
      </Spin>
    </section>
  )
}

export { UpdateOrderHO }
