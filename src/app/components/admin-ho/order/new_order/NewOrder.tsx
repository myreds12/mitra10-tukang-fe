import React, {FC, useEffect, useState, useRef, ChangeEvent} from 'react'
import {useNavigate} from 'react-router-dom'

import './NewOrder.css'

import axios from 'axios'
import Swal from 'sweetalert2'
import {Spin} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import Select, {SingleValue} from 'react-select'
import CreatableSelect from 'react-select/creatable'
import {Row, Col, Form, FormGroup, Table, Button, ListGroup, Card} from 'react-bootstrap'
import {Image} from 'antd'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faImage, faFileImage} from '@fortawesome/free-solid-svg-icons'
import { sendWaMessage, sendImage as sendWaImage } from '../../../../../app/helpers/wautils'

interface StoreItemSelect {
  value: number | null
  label: string
  address: string
  city_id: number | null
  zip_code: string
}

interface MemberSelect {
  value?: number | null
  label?: string
  full_name: string
  email?: string
  phone_number?: string
  whatsapp_number?: string
  address_1: string
  join_location: number | null
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
  type: number
  prices: Array<{
    id: number | null
    is_active: boolean
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
    item?: ItemSelect | null
    item_id: number | null
    item_code: string | null
    item_name: string | null
    service_name: string | null
    quantity: number
    unit_price: string | null
    total: string | null
    item_notes: string | null
  }>
  order_files: Array<any>

  [key: string]: any
}

const NewOrderHO: FC = () => {
  

  const API_BASE = process.env.REACT_APP_WA_BACKEND_API_URL
  
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const textAreaRefs = useRef<(HTMLTextAreaElement | null)[]>([])

  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  
    const [orderDetail, setOrderDetail] = useState<any>()
      const [emailDetail, setEmailDetail] = useState<any>()

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
    payment_type: 'gratis',
    receipt_number: '',
    is_overdistance: 0,
    additional_fee: 25000,
    notes: '',
    order_details: [
      {
        item: null,
        item_id: null,
        item_code: null,
        item_name: null,
        service_name: null,
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

  // Member
  const [isSubmittingNewMember, setIsSubmittingNewMember] = useState(false)
  const [member, setMember] = useState<MemberSelect[]>([])
  const [searchByPhoneNumber, setSearchByPhoneNumber] = useState('')
  const [selectedMember, setSelectedMember] = useState<MemberSelect>({
    full_name: '',
    email: '',
    address_1: '',
    join_location: null,
  })

  const [isWhatsapp, setIsWhatsapp] = useState<boolean>(true)
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
  const [vendor, setVendor] = useState<any[]>([])
  const [vendorSelect, setVendorSelect] = useState<VendorSelect[]>([])
  const [searchVendor, setSearchVendor] = useState('')
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
    const activeSearch = searchItem || searchPemasangan
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
          .filter((x: any) => x.is_active === true)
          .map((item: any) => ({
            value: item.id,
            label: item.item_code,
            item_code: item?.item_code ?? '',
            item_name: item?.item_name ?? '',
            service_name: item?.service_name ?? '',
            category_id: item.category_id,
            default_price: item.default_price,
            type: item?.type,
            prices: item.prices.map((priceItem: any) => ({
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

  // Fetch API Data
  // useEffect(() => {
  //   const getDataMaster= async () => {
  //     try {
  //       const response = await axios.get(`${apiUrl}/data-master`, {
  //         headers: {
  //           Accept: 'application/json',
  //           Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  //           // 'Access-Control-Allow-Origin': '*',
  //          // 'ngrok-skip-browser-warning':  'true',
  //         },
  //       })

  //       if (response.status === 200) {
  //         const {data} = response
  //         const finalData = data.data.find((a:any)=> a.name ==='jarak')
  //         // console.log(finalData);

  //         setOrderForm((prev) => ({
  //           ...prev,
  //           additional_fee: finalData.value,
  //         }))
  //       }
  //     } catch (err) {
  //       console.error(err)
  //     }
  //   }

  //   getDataMaster()
  // }, [])

  useEffect(() => {
    getItem()
  }, [paymentTypeValue, searchItem, searchPemasangan, selectedStore])

  useEffect(() => {
    const getMember = async () => {
      try {
        const response = await axios.get(`${apiUrl}/member`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
          params: {
            search: searchByPhoneNumber ? searchByPhoneNumber : null,
          },
        })

        if (Array.isArray(response.data.data)) {
          const tempMember = response.data.data.map((item: any) => ({
            value: item.id,
            label: item?.member_number,
            full_name: item.full_name,
            email: item.email,
            phone_number: item.phone_number,
            whatsapp_number: item.whatsapp_number,
            address_1: item.address_1,
            join_location: item.join_location,
          }))

          setMember(tempMember)
        } else {
          console.error('API response data is not an array:', response.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    getMember()
  }, [searchByPhoneNumber, selectedStore])

  useEffect(() => {
    const getStore = async () => {
      try {
        const response = await axios.get(`${apiUrl}/stores`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
          params: {
            take: 0,
            store_id: selectedStore ? selectedStore.value : null,
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

    getStore()
  }, [selectedStore?.value])

  useEffect(() => {
    const getVendor = async () => {
      await axios
        .get(`${apiUrl}/vendor`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
          params: {
            store_id: selectedStore ? selectedStore.value : null,
            search: searchVendor ? searchVendor : null,
          },
        })
        .then((response) => {
          setIsLoadingPage(false)
          setVendor(response.data.data)
        })
        .catch((error) => {
          setIsLoadingPage(false)
          console.error(error)
        })
    }

    const getVendorByMaxOrder = async () => {
      try {
        const response = await axios.get(`${apiUrl}/vendor`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
          params: {
            vendor_with_max_order: 1,
            store_id: selectedStore ? selectedStore.value : null,
            search: searchVendor ? searchVendor : null,
          },
        })

        if (Array.isArray(response.data.data)) {
          const tempVendor = response.data.data.map((item: any) => ({
            value: item.id,
            label: item.company_name,
          }))

          setVendorSelect(tempVendor)
        } else {
          console.error('API response data is not an array:', response.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    getVendor()
    getVendorByMaxOrder()
  }, [selectedStore?.value, searchVendor])

  useEffect(() => {
    const getSales = async () => {
      try {
        const response = await axios.get(`${apiUrl}/sales`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
          params: {
            is_active: 1,
            store_id: selectedStore ? selectedStore.value : null,
            search: searchSales ? searchSales : null,
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

    getSales()
  }, [selectedStore?.value, searchSales])

  // Order Form Handler
  const today = new Date().toISOString().split('T')[0]
  const orderFormHandler = (e: any) => {
    setOrderForm({
      ...orderForm,
      [e.target.name]: e.target.value,
    })
  }

  // Checkbox Handler
  const handleCheckboxChange = (isChecked: boolean) => {
    setIsOverdistance(isChecked ? 1 : 0)
  }

  // Member Form Handler
  const handleChangeSelectMember = (newValue: MemberSelect | null) => {
    if (newValue) {
      setSelectedMember({
        value: newValue.value || null,
        label: newValue.label || '',
        full_name: newValue.full_name || '',
        email: newValue.email || '',
        phone_number: newValue.phone_number || '',
        whatsapp_number: newValue.whatsapp_number || '',
        address_1: newValue.address_1 || '',
        join_location: newValue.join_location || null,
      })
    } else {
      setSelectedMember({
        value: null,
        label: '',
        full_name: '',
        email: '',
        phone_number: '',
        whatsapp_number: '',
        address_1: '',
        join_location: null,
      })
    }
  }

  // Order Detail Form Handler
  const orderDetailsFormHandler = (e: any, index: number) => {
    setOrderForm((prev) => {
      const cache = {...prev}
      cache.order_details[index] = {
        ...cache.order_details[index],
        [e.target.name]: e.target.value,
      }

      return cache
    })
  }

  // Overdistance
  useEffect(() => {
    setOrderForm({
      ...orderForm,
      is_overdistance: isOverdistance,
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
      order_details: [
        {
          item_id: null,
          item_code: null,
          item_name: null,
          service_name: null,
          quantity: 1,
          unit_price: null,
          total: null,
          item_notes: null,
        },
      ],
    })
  }, [paymentTypeValue])

  useEffect(() => {
    const storedStatus = localStorage.getItem('statusData')
    const statusData = storedStatus ? JSON.parse(storedStatus) : []

    const statusNameByPaymentType =
      paymentTypeValue[0] === 'gratis' || paymentTypeValue[1] === 'pemasangan_tanpa_survey'
        ? 'WORKREQ'
        : 'SURVEYREQ'

    const desiredStatus = statusData.find(
      (status: any) => status.category === statusNameByPaymentType
    )

    const statusId = desiredStatus?.value

    setOrderForm({
      ...orderForm,
      project_status_id: statusId,
    })
  }, [orderForm.payment_type])

  // Calculate each details
  const calcEachDetails = () => {
    const today = new Date()

    setOrderForm((prev) => {
      const order_details = prev.order_details.map((detail) => {
        let newDetail = {...detail}

        if (detail.item) {
          const {item, quantity} = detail
          const {prices = [], default_price} = item

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
          newDetail = {...newDetail, unit_price: unitPrice.toString(), total: total.toString()}
        } else {
          newDetail = {...newDetail, unit_price: '0', total: '0'}
        }

        return newDetail
      })

      return {...prev, order_details}
    })
  }

  // Upload Order File Handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...receiptFiles]
      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

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
      item_code: null,
      item_name: null,
      service_name: null,
      quantity: 1,
      unit_price: null,
      total: null,
      item_notes: null,
    }

    setOrderForm((prev) => {
      const cache = {...prev}
      cache.order_details.push(newDetail)
      return cache
    })

    getItem()
  }

  const handleRemoveForm = (index: any) => {
    setOrderForm((prev) => {
      const cache = {...prev}
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
  }, [orderForm.order_details, orderForm.additional_fee, paymentTypeValue, isOverdistance])

  // Submit Update Order
  const formData = new FormData()
  const appendIfNotDefault = (key: any, value: any) => {
    if (value !== null && value !== undefined && value !== '' && value !== 0) {
      formData.append(key, String(value))
    }
  }

  const handleSubmitNewOrder = async () => {
    setIsLoading(true)
    const url = `${apiUrl}/orders`

    let errorBags = []
    const requiredOrderFields = [
      {key: 'member_id', fieldName: 'Nomor Member'},
      {key: 'sales_id', fieldName: 'Sales Information'},
      {key: 'store_id', fieldName: 'Store'},
      {key: 'vendor_id', fieldName: 'Vendor'},
      {key: 'project_status_id', fieldName: 'Proyek Status'},
      {key: 'project_address', fieldName: 'Alamat Proyek'},
      {key: 'project_number', fieldName: 'Nomor Proyek'},
      {key: 'request_survey', fieldName: 'Request Survey'},
      {key: 'payment_type', fieldName: 'Payment Type'},
      {key: 'receipt_number', fieldName: 'Nomor Receipt'},
      {key: 'is_overdistance', fieldName: 'Overdistance'},
      {key: 'additional_fee', fieldName: 'Additional Fee'},
      {key: 'notes', fieldName: 'Catatan'},
    ]

    const requiredOrderDetailsFields = [
      {key: 'item_id', fieldName: 'Nama Pemasangan'},
      {key: 'item_notes', fieldName: 'Nama Pemasangan'},
      {key: 'item_code', fieldName: 'Item Code'},
      {key: 'item_name', fieldName: 'Item Name'},
      {key: 'quantity', fieldName: 'Quantity'},
    ]

    for (const {key, fieldName} of requiredOrderFields) {
      const value = orderForm[key]
      if (!value && key !== 'order_details') {
        if (key === 'additional_fee' && isOverdistance === 1) {
          if (value) formData.append(key, value.toString())
        } else if (key === 'is_overdistance' || key === 'notes') {
          if (value) formData.append(key, value.toString())
        } else {
          errorBags.push({message: `Mohon isi kolom ${fieldName}`})
          setIsLoading(false)
        }
      } else {
        formData.append(key, value)
      }
    }

    if (orderForm.order_details && Array.isArray(orderForm.order_details)) {
      orderForm.order_details.forEach((item: any, index: number) => {
        if (item?.item && item.item.prices?.length > 0) {
          const minOrder = Number(item.item.prices[0].min_order)

          // if (item.quantity < minOrder) {
          //   errorBags.push({
          //     message: `Quantity item "${item.item_name}" harus lebih dari minimal order (${minOrder}).`,
          //   })
          //   setIsLoading(false)
          // }
        }

        requiredOrderDetailsFields.forEach(({key, fieldName}) => {
          const value = item[key]

          if (key === 'item_code') {
            if (value?.length < 10 && ![1, 2].includes(item?.item?.type)) {
              errorBags.push({
                message: 'Kolom "Item Code" harus diisi minimal 10 karakter',
              })
              setIsLoading(false)
            }
          }

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
      Swal.fire({
        title: 'Warning',
        text: errorBags[0].message,
        icon: 'warning',
      })

      setIsLoading(false)
      return false
    }

    if (receiptFiles?.length) {
      receiptFiles.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`order_files`, item, item.name)
        }
      })
    } else {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong upload bukti receipt',
        icon: 'warning',
      })
      setIsLoading(false)
      return false
    }

    let response = axios
      .post(url, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })
      .then(async (response) => {
        const orderId = response.data.data.id

        if (response.data.status === 201) {
          Swal.fire({
            title: 'Success',
            text: 'Success Add Order',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            navigate(`/order/preview-email/${orderId}`)
          })

          setIsLoading(false)
        } else {
          Swal.fire({
            title: 'Warning',
            text: response.data.message,
            icon: 'warning',
          })

          setIsLoading(false)
        }
      })
      .catch((error) => {
        setIsLoading(false)

        Swal.fire({
          title: 'Warning',
          text: error.response.data.message,
          icon: 'warning',
        })
      })
  }
  // Submit New Member
  const handleSubmitNewMember = async () => {
    if (selectedMember.value === null) {
      setIsSubmittingNewMember(true)

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      const newMember: MemberSelect = {
        full_name: selectedMember.full_name,
        address_1: selectedMember.address_1,
        join_location: Number(selectedStore?.value),
      }

      if (selectedMember.whatsapp_number) {
        newMember.whatsapp_number = selectedMember.whatsapp_number
      }

      if (selectedMember.phone_number) {
        newMember.phone_number = selectedMember.phone_number
      }

      if (!selectedMember.email) {
        Swal.fire({
          title: 'Warning',
          text: 'Please enter member email address.',
          icon: 'warning',
        })

        setIsSubmittingNewMember(false)
        return
      } else if (!selectedMember.address_1) {
        Swal.fire({
          title: 'Warning',
          text: 'Please enter member address.',
          icon: 'warning',
        })

        setIsSubmittingNewMember(false)
        return
      } else if (selectedMember.email && !emailPattern.test(selectedMember.email)) {
        Swal.fire({
          title: 'Invalid Email',
          text: 'Please enter a valid email address.',
          icon: 'warning',
        })

        setIsSubmittingNewMember(false)
        return
      } else if (selectedMember.email && emailPattern.test(selectedMember.email)) {
        newMember.email = selectedMember.email
      }

      try {
        const response = await axios.post(`${apiUrl}/member`, newMember, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })

        if (response.data.status === 201) {
          setSelectedMember((selectedMember) => ({
            ...selectedMember,
            member_id: response.data.data.id,
          }))

          setOrderForm((prevOrderForm) => ({
            ...prevOrderForm,
            member_id: response.data.data.id,
          }))

          setIsSubmittingNewMember(true)
        } else {
          setIsSubmittingNewMember(false)

          Swal.fire({
            title: 'Warning',
            text: response.data.message,
            icon: 'warning',
          })
        }
      } catch (error: any) {
        setIsSubmittingNewMember(false)

        Swal.fire({
          title: 'Warning',
          text: error.response.data.message,
          icon: 'warning',
        })
      }
    } else {
      await handleSubmitNewOrder()
    }
  }

  useEffect(() => {
    if (isSubmittingNewMember === true) {
      setOrderForm({
        ...orderForm,
        member_id: selectedMember?.value ?? null,
      })

      handleSubmitNewOrder()
    }
  }, [selectedMember.value])

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // hasilnya "data:image/png;base64,xxxx"
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };





  return (
    <section id='update-order'>
      <Spin
        spinning={isLoadingPage}
        size='large'
        tip='Loading..'
        indicator={<LoadingOutlined style={{fontSize: 24}} spin />}
      >
        <Card className='mb-5'>
          <Card.Body>
            <div className='form-wrapper'>
              <div className='form-costumer'>
                <Row className='form-header'>
                  <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='mb-3'>
                    <Form.Group as={Row}>
                      <Form.Label column sm='4' className='title'>
                        Nama Toko
                      </Form.Label>

                      <Col sm='8'>
                        <Select
                          name='store_id'
                          className='form-control p-0'
                          classNamePrefix='select'
                          placeholder='Pilih Toko'
                          isSearchable={true}
                          isClearable={true}
                          options={store}
                          onChange={(newValue) => setSelectedStore(newValue)}
                        />
                      </Col>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='mb-3'>
                    <Row>
                      <Col xxl={3}>
                        <Form.Label className='payment-type title'>Payment Type :</Form.Label>
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
                      <Form.Label className='title'>No Member</Form.Label>
                      <Select
                        name='member'
                        id='member'
                        className='form-control p-0 form-item-name'
                        classNamePrefix='select'
                        placeholder='Ketik No Telepon Member/Nomor Member'
                        isSearchable={true}
                        isClearable={true}
                        options={member}
                        onInputChange={(newValue) => setSearchByPhoneNumber(newValue)}
                        onChange={(newValue) => handleChangeSelectMember(newValue)}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Form.Group className='mb-5'>
                      <div className='d-flex justify-content-between'>
                        <Form.Label className='title'>WA / Phone Number</Form.Label>

                        <div className='form-check-request'>
                          <Form.Check
                            inline
                            label='Bukan Whatsapp'
                            name='group1'
                            value='1'
                            type='checkbox'
                            onChange={() => setIsWhatsapp(!isWhatsapp)}
                          />
                        </div>
                      </div>

                      <FormGroup>
                        <Form.Control
                          className={isWhatsapp === true ? 'form-project-number-wa' : ''}
                          name='project_number'
                          value={orderForm.project_number}
                          onChange={(event) => {
                            const name = isWhatsapp ? 'whatsapp_number' : 'phone_number'
                            orderFormHandler(event)
                            handleChangeSelectMember({
                              ...selectedMember,
                              [name]: event.target.value,
                            })
                          }}
                        />

                        {isWhatsapp === true && (
                          <span className='project-number'>
                            <div className='prefix-number text-black'>+62</div>
                          </span>
                        )}
                      </FormGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className='input-order'>
                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Form.Group className='mb-5'>
                      <Form.Label className='title'>Nama Customer</Form.Label>
                      <Form.Control
                        type='text'
                        value={selectedMember?.full_name || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleChangeSelectMember({
                            ...selectedMember,
                            full_name: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Form.Group className='mb-5'>
                      <Form.Label className='title'>
                        Email <span className='fs-8 fw-bold text-danger'>*Wajib di isi</span>
                      </Form.Label>

                      <Form.Control
                        type='email'
                        value={selectedMember?.email || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleChangeSelectMember({
                            ...selectedMember,
                            email: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className='alamat-order'>
                  <Col>
                    <Form.Group className='mb-5'>
                      <div className='d-flex gap-3'>
                        <Form.Label className='title'>Alamat</Form.Label>

                        <Form.Check
                          inline
                          label='Lebih dari 10 KM dengan maksimal jarak 40 KM'
                          type='checkbox'
                          onChange={(e) => handleCheckboxChange(e.target.checked)}
                        />
                      </div>

                      <Form.Control
                        as='textarea'
                        name='project_address'
                        className='field-alamat'
                        value={orderForm.project_address}
                        onChange={(event) => {
                          orderFormHandler(event)
                          handleChangeSelectMember({
                            ...selectedMember,
                            address_1: event.target.value,
                          })
                        }}
                      />
                    </Form.Group>

                    <Form.Label className='fs-7 fw-normal'>
                      <span className='text-danger fw-bold'>Note :</span>
                      <br></br>
                      Jika member baru, maka semua field wajib di isi, kecuali field{' '}
                      <span className='fw-bolder'>No Member</span>
                      <br></br>
                      Segala informasi akan di update melalui email
                      <br></br>
                      Untuk melihat history pengerjaan dapat melalui Aplikasi Mitra10
                    </Form.Label>
                  </Col>
                </Row>
              </div>

              <div className='form-sales'>
                <div className='form-header'>
                  <h1 className='text-end fw-bold'>SALES INFORMATION</h1>
                </div>
                <Form.Group as={Row} className='mb-5'>
                  <Form.Label className='title' column xxl='4' xl='5' md='2'>
                    Sales ID :
                  </Form.Label>

                  <Col xxl='8' xl='7' md='10'>
                    <Form.Control type='number' readOnly value={selectedSales?.value || ''} />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='mb-5'>
                  <Form.Label className='title' column xxl='4' xl='5' md='2'>
                    Nama Sales :
                  </Form.Label>

                  <Col xxl='8' xl='7' md='10'>
                    <Select
                      name='sales'
                      id='sales'
                      className='form-control p-0 form-item-name'
                      classNamePrefix='select'
                      placeholder='Pilih/Ketik Nama Sales'
                      isSearchable={true}
                      isClearable={true}
                      options={sales}
                      onChange={(newValue) => setSelectedSales(newValue)}
                      onInputChange={(newValue) => setSearchSales(newValue)}
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='mb-5'>
                  <Form.Label column xxl='4' xl='5' md='2'>
                    No Receipt
                  </Form.Label>

                  <Col xxl='8' xl='7' md='10'>
                    <Form.Control
                      name='receipt_number'
                      type='text'
                      value={orderForm.receipt_number}
                      onChange={(e) => orderFormHandler(e)}
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='mb-5'>
                  <Form.Label className='title' column xxl='4' xl='5' md='2'>
                    Catatan :
                  </Form.Label>

                  <Col xxl='8' xl='7' md='10'>
                    <Form.Control
                      as='textarea'
                      name='notes'
                      className='additional-notes'
                      style={{minHeight: '150px'}}
                      value={orderForm.notes}
                      onChange={(event) => {
                        orderFormHandler(event)
                      }}
                    />
                  </Col>
                </Form.Group>
              </div>
            </div>

            <Row className='table-order-header d-flex align-items-center mb-5'>
              <Col
                xs={12}
                md={3}
                lg={3}
                xl={3}
                xxl={3}
                className='request-date order-md-2 order-sm-1'
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
                    options={vendorSelect}
                    onChange={(newValue) => setSelectedVendor(newValue)}
                    onInputChange={(newValue) => setSearchVendor(newValue)}
                  />
                </Form.Group>
              </Col>

              <Col
                xs={12}
                md={3}
                lg={3}
                xl={3}
                xxl={3}
                className='request-date order-md-1 order-sm-2'
              >
                <Form.Group>
                  <Form.Label>Tanggal Request</Form.Label>
                  <br></br>
                  <Form.Text className='fs-8 text-dark-danger'>
                    *Tanggal Request{' '}
                    <span className='fw-bolder text-decoration-underline'>bukan</span> tanggal
                    pasti. Konfirmasi kunjungan dilakukan oleh Vendor
                  </Form.Text>

                  <Form.Control
                    name='request_survey'
                    type='date'
                    value={orderForm.request_survey}
                    onChange={(e) => orderFormHandler(e)}
                    min={today}
                  />
                </Form.Group>
              </Col>

              <Col
                xs={12}
                md={3}
                lg={3}
                xl={3}
                xxl={3}
                className='order-status order-md-3 order-sm-4'
              >
                <h1 className='fs-3 fw-bold'>
                  ORDER STATUS : <span className='fw-bold text-success'>BOOKED</span>
                </h1>
              </Col>

              <Col
                xs={12}
                md={3}
                lg={3}
                xl={3}
                xxl={3}
                className='button-add text-end order-md-4'
              ></Col>
            </Row>

            <Row className='mb-5'>
              <div className='description fs-7 mb-2'>
                Informasi mengenai ketersediaan dari Vendor
              </div>

              <div className='vendor-avail'>
                <Table>
                  <thead>
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
                </Table>
              </div>
            </Row>

            <Row>
              <Col xs={12} md={3} lg={3} xl={3} xxl={3}></Col>
              <Col xs={12} md={3} lg={3} xl={3} xxl={3}></Col>
              <Col xs={12} md={3} lg={3} xl={3} xxl={3}></Col>
              <Col xs={12} md={3} lg={3} xl={3} xxl={3} className='button-add text-end order-md-4'>
                <button onClick={() => addOrderDetails()}>Tambah Order</button>
              </Col>
            </Row>

            <div className='table-order-content'>
              <Form.Text className='fs-8 fs-l text-dark-danger'>
                *Penulisan Item code dan Item Name sama persis dengan yang tercantum di NAV
              </Form.Text>

              <Table hover responsive='md'>
                <thead className='table-order-head'>
                  <tr>
                    <th className='content'>Item Code</th>
                    <th className='content'>Item Name</th>
                    <th className='content'>Nama Pemasangan</th>
                    <th className='content'>QTY Pemasangan</th>
                    {!(paymentTypeValue[0] === 'gratis' || paymentTypeValue[1] === 'survey') && (
                      <>
                        <th className='content'>Harga Jasa</th>
                        <th className='content'>Total</th>
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
                                const cache = {...prev}
                                cache.order_details[index] = {
                                  ...cache.order_details[index],
                                  item_id:
                                    newValue?.__isNew__ === true ? null : newValue?.value ?? null,
                                  item_code: newValue?.__isNew__
                                    ? ((newValue?.value ?? '') as string)
                                    : ((newValue?.item_code ?? '') as string),
                                  item_name: newValue?.item_name ?? '',
                                  item_notes: newValue?.service_name ?? '',
                                  item: newValue,
                                }
                                return cache
                              })
                              calcEachDetails()
                            }}
                            onKeyDown={(e) => {
                              if (
                                !/[0-9]/.test(e.key) &&
                                e.key !== 'Backspace' &&
                                e.key !== 'ArrowLeft' &&
                                e.key !== 'ArrowRight' &&
                                e.key !== 'Tab'
                              ) {
                                e.preventDefault()
                              }
                            }}
                          />
                        ) : (
                          <Form.Control
                            id={`item-code-${index}`}
                            as='textarea'
                            plaintext
                            type='number'
                            ref={(el: any) => (textAreaRefs.current[index] = el)}
                            readOnly={
                              paymentTypeValue[1] === 'pemasangan_tanpa_survey' ? true : false
                            }
                            name={`item_code`}
                            value={element?.item_code ?? ''}
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

                      <td style={{maxWidth: '200px', minWidth: '200px'}}>
                        <Form.Control
                          id={`item-name-${index}`}
                          as='textarea'
                          plaintext
                          ref={(el: any) =>
                            (textAreaRefs.current[orderForm.order_details.length + index] = el)
                          }
                          readOnly={
                            paymentTypeValue[1] === 'pemasangan_tanpa_survey' ? true : false
                          }
                          name={`item_name`}
                          value={element?.item_name ?? ''}
                          onChange={(e) => {
                            orderDetailsFormHandler(e, index)
                            setSearchItem(e.target.value)
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
                            value={element?.item_notes ?? ''}
                            onChange={(e) => {
                              orderDetailsFormHandler(e, index)
                            }}
                            onInput={() => {
                              const textarea =
                                textAreaRefs.current[2 * orderForm.order_details.length + index]
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
                            getOptionLabel={(option) => option?.service_name || option?.label || ''}
                            getOptionValue={(option) => String(option?.value ?? '')}
                            styles={{
                              singleValue: (base) => ({
                                ...base,
                                overflow: 'auto',
                                whiteSpace: 'normal',
                                textOverflow: '',
                              }),
                            }}
                            options={item}
                            name={`item_id`}
                            value={orderForm.order_details[index]?.item ?? null}
                            onInputChange={(newValue) => setSearchPemasangan(newValue)}
                            onChange={(newValue) => {
                              setOrderForm((prev) => {
                                const cache = {...prev}
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
                          value={element.quantity ?? ''}
                          onChange={(e) => {
                            orderDetailsFormHandler(e, index)
                            calcEachDetails()
                          }}
                        />
                      </td>

                      {!(paymentTypeValue[0] === 'gratis' || paymentTypeValue[1] === 'survey') && (
                        <>
                          <td>
                            <Form.Control
                              id={`unit-price-${index}`}
                              readOnly
                              plaintext
                              value={`Rp. ${
                                element?.unit_price
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
                              value={`Rp. ${
                                element?.total ? parseInt(element?.total).toLocaleString('id') : 0
                              }`}
                            />
                          </td>
                        </>
                      )}

                      {orderForm.order_details.length >= 2 && (
                        <td align='center'>
                          <Button
                            className='btn-remove'
                            variant='danger'
                            onClick={() => {
                              handleRemoveForm(index)
                              calcEachDetails()
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
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
                          !(paymentTypeValue[0] === 'gratis' || paymentTypeValue[1] === 'survey')
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
                        Rp. {orderForm.additional_fee.toLocaleString('id')}
                      </td>
                    </tr>
                  )}

                  {(paymentTypeValue[1] !== 'survey' || isOverdistance === 1) && (
                    <tr>
                      <td
                        className='text-end fw-bolder'
                        colSpan={
                          !(paymentTypeValue[0] === 'gratis' || paymentTypeValue[1] === 'survey')
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

                            <span className='upload-content' onClick={() => handleFileClick(index)}>
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

            <div className='button-submit d-flex justify-content-center align-items-center'>
              <Button
                type='submit'
                onClick={handleSubmitNewMember}
                disabled={isLoading}
                variant='dark-primary'
              >
                {isLoading || isSubmittingNewMember ? 'Submitting..' : 'Submit Order & Email'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Spin>
    </section>
  )
}

export {NewOrderHO}
