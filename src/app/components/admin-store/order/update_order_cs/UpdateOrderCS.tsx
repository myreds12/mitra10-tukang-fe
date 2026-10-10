import React, {FC, useEffect, useState, useRef} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {Orders} from '../../../../interfaces/order'

import './UpdateOrder.css'

import Swal from 'sweetalert2'
import {SingleValue} from 'react-select'
import {Card} from 'react-bootstrap'
import {Spin} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'

import {
  MemberSelect,
  SalesSelect,
  ItemSelect,
  Order,
  UpdateOrderStoreCSProps,
} from './types'
import {
  fetchOrderByIdApi,
  fetchItemsApi,
  fetchMembersApi,
  fetchSalesApi,
  updateOrderApi,
  reprintOrderCounterApi,
} from './services/updateOrderCSService'
import {UpdateOrderCSCustomerForm} from './components/UpdateOrderCSCustomerForm'
import {UpdateOrderCSSalesForm} from './components/UpdateOrderCSSalesForm'
import {UpdateOrderCSItemsTable} from './components/UpdateOrderCSItemsTable'
import {UpdateOrderCSReceiptUpload} from './components/UpdateOrderCSReceiptUpload'

const UpdateOrderStoreCS: FC<UpdateOrderStoreCSProps> = ({updatePageTitle}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const params = useParams()
  const textAreaRefs = useRef<(HTMLTextAreaElement | null)[]>([])

  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // If User Login is Admin Sales
  const salesId = localStorage.getItem('sales_id') as any
  const userRole = localStorage.getItem('userRole')
  const staffStoreId = localStorage.getItem('storeId') as any
  const staffStoreName = localStorage.getItem('storeName') as string

  // Order Information Detail
  const [orderDetail, setOrderDetail] = useState<any>()

  // Order
  const [orderForm, setOrderForm] = useState<Order>({
    member_id: null,
    sales_id: null,
    store_id: Number.parseInt(staffStoreId),
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

  // Order Detail Table
  const [item, setItem] = useState<ItemSelect[]>([])
  const [searchItem, setSearchItem] = useState('')
  const [debouncedSearchItem, setDebouncedSearchItem] = useState('')
  const [searchPemasangan, setSearchPemasangan] = useState('')
  const [debouncedSearchPemasangan, setDebouncedSearchPemasangan] = useState('')
  const [isLoadingItem, setIsLoadingItem] = useState<boolean>(false)
  const [grandTotal, setGrandTotal] = useState<number>(0)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchItem(searchItem)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchItem])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchPemasangan(searchPemasangan)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchPemasangan])

  // Fetch API Data
  const getItem = async () => {
    const validStoreId =
      staffStoreId &&
      staffStoreId !== 'undefined' &&
      staffStoreId !== 'null' &&
      Number(staffStoreId) > 0
        ? `&store_id=${staffStoreId}`
        : ''

    const isGratis = paymentTypeValue[0] === 'gratis'
    const isTanpaSurvey = paymentTypeValue[1] === 'pemasangan_tanpa_survey'
    const isSurvey = paymentTypeValue[1] === 'survey'

    let itemTypeParam = ''
    if (isGratis) {
      itemTypeParam = `&item_type=1&is_promotion=1${validStoreId}`
    } else if (isTanpaSurvey) {
      itemTypeParam = `&item_type=2&is_promotion=1${validStoreId}`
    } else if (isSurvey) {
      itemTypeParam = `&item_type=3${validStoreId ? validStoreId : '&all_store=1'}`
    }

    const activeSearch = (isSurvey ? debouncedSearchItem : debouncedSearchPemasangan)?.trim()
    const search = activeSearch ? `&search=${encodeURIComponent(activeSearch)}` : ''
    const take = isSurvey ? 50 : 0

    setIsLoadingItem(true)
    try {
      const response = await fetchItemsApi(apiUrl, take, search, itemTypeParam)

      if (Array.isArray(response.data?.data)) {
        const expectedType = isGratis ? 1 : isTanpaSurvey ? 2 : 3
        const itemList = response.data.data
          .filter((x: any) => Boolean(x.is_active) && Number(x.type) === expectedType)
          .map((itemObj: any) => {
            const itemCode = itemObj?.item_code ?? ''
            const itemName = itemObj?.item_name || itemObj?.service_name || ''
            const surveyLabel =
              itemCode && itemName ? `${itemCode} - ${itemName}` : itemCode || itemName
            const pemasanganLabel = `${itemObj.service_name || itemObj.item_name}${
              itemObj.item_code ? ` (${itemObj.item_code})` : ''
            }`

            return {
              value: itemObj.id,
              label: isSurvey ? surveyLabel : pemasanganLabel,
              item_code: itemCode,
              item_name: itemObj?.item_name ?? '',
              service_name: itemObj?.service_name ?? '',
              category_id: itemObj.category_id,
              default_price: itemObj.default_price,
              type: itemObj?.type,
              prices: (itemObj.prices || []).map((priceItem: any) => ({
                id: priceItem.id,
                is_active: priceItem.is_active,
                item_id: priceItem.item_id,
                store_id: priceItem.store_id,
                periodic_start: priceItem.periodic_start,
                periodic_end: priceItem.periodic_end,
                min_order: priceItem.min_order,
                price: priceItem.price,
              })),
            }
          })

        setItem(itemList)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingItem(false)
    }
  }

  useEffect(() => {
    getItem()
  }, [paymentTypeValue, debouncedSearchItem, debouncedSearchPemasangan])

  const fetchOrderData = async () => {
    try {
      const response = await fetchOrderByIdApi(apiUrl, params.id)
      const data = response.data?.data

      setIsLoadingPage(false)
      setOrderDetail(data)

      if (data?.payment_type) {
        if (data.payment_type === 'survey') {
          setPaymentTypeValue(['berbayar', 'survey'])
        } else if (data.payment_type === 'gratis') {
          setPaymentTypeValue(['gratis', 'pemasangan_tanpa_survey'])
        } else if (data.payment_type === 'pemasangan_tanpa_survey') {
          setPaymentTypeValue(['berbayar', 'pemasangan_tanpa_survey'])
        } else {
          setPaymentTypeValue(['gratis', 'pemasangan_tanpa_survey'])
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

      if (data) {
        setOrderForm((prev) => ({
          ...prev,
          project_address: data.project_address ?? '',
          project_number: data.project_number ?? '',
          receipt_number: data.receipt_number ?? '',
          request_survey: new Date(data.request_survey).toISOString().split('T')[0] ?? '',
          is_overdistance: data?.is_overdistance ?? 0,
          additional_fee: data?.additional_fee ?? 0,
          notes: data?.notes ?? '',
        }))

        setIsOverdistance(data?.is_overdistance ?? 0)
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

      if (data?.order_details) {
        setOrderForm((prev) => {
          const previousDetailValues = data.order_details.map((itemObj: any) => {
            const code = itemObj?.item_code === 'null' ? '' : itemObj?.item_code || ''
            const name =
              (itemObj?.item_name === 'null' ? '' : itemObj?.item_name) ||
              itemObj?.item?.item_name ||
              itemObj?.item?.service_name ||
              ''
            const surveyLabel = code && name ? `${code} - ${name}` : code || name

            const previousItem = {
              value: itemObj.id,
              label:
                data.payment_type === 'survey' ? surveyLabel : itemObj?.item?.service_name,
              item_code: code,
              item_name: name,
              service_name: itemObj?.item?.service_name ?? '',
              category_id: itemObj?.item?.category?.id,
              default_price: itemObj?.item?.default_price,
              type: itemObj?.type,
              prices:
                itemObj?.item?.prices?.length > 0
                  ? itemObj?.item?.prices.map((price: any) => ({
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
              id: itemObj.id,
              item_id: itemObj.item_id,
              item_code: itemObj?.item_code === 'null' ? '' : itemObj.item_code,
              item_name: itemObj?.item_name === 'null' ? '' : itemObj.item_name,
              item_notes: itemObj?.item_notes === 'null' ? '' : itemObj.item_notes,
              quantity: itemObj.quantity,
              unit_price: itemObj.unit_price,
              total: itemObj.total,
            }
          })

          return {
            ...prev,
            order_details: previousDetailValues,
          }
        })
      }

      if (data?.order_files) {
        const initialOrderFilesValues = data.order_files.map((itemObj: any) => ({
          id: itemObj.id,
          name: itemObj.path,
        }))

        setReceiptFiles(initialOrderFilesValues)
      }

      updatePageTitle(data)
    } catch (error) {
      console.error(error)
    }
  }

  const getMember = async () => {
    try {
      const response = await fetchMembersApi(apiUrl)
      if (Array.isArray(response.data?.data)) {
        const tempMember = response.data.data.map((itemObj: any) => ({
          value: itemObj.id,
          label: itemObj.member_number,
          full_name: itemObj.full_name,
          email: itemObj.email,
          phone_number: itemObj.phone_number,
          whatsapp_number: itemObj.whatsapp_number,
          address_1: itemObj.address_1,
        }))

        setMember(tempMember)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getSales = async () => {
    try {
      const response = await fetchSalesApi(apiUrl, staffStoreId, searchSales)
      if (Array.isArray(response.data?.data)) {
        const tempSales = response.data.data.map((itemObj: any) => ({
          value: itemObj.id,
          label: itemObj.full_name,
          full_name: itemObj.full_name,
        }))

        setSales(tempSales)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchOrderData()
    getMember()
  }, [])

  useEffect(() => {
    getSales()
  }, [searchSales])

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
      const cache = {...prev}
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

  // Selected Payment Type
  useEffect(() => {
    setOrderForm({
      ...orderForm,
      payment_type: paymentTypeValue[0] === 'gratis' ? 'gratis' : paymentTypeValue[1],
    })
  }, [paymentTypeValue])

  useEffect(() => {
    const storedStatus = localStorage.getItem('statusData')
    const statusData = storedStatus ? JSON.parse(storedStatus) : []

    const desiredStatusName = 'BOOKED'
    const desiredStatus = statusData.find((status: any) => status?.category === desiredStatusName)
    const statusId = desiredStatus?.value

    setOrderForm({
      ...orderForm,
      project_status_id: statusId,
    })
  }, [orderForm.project_status_id])

  // Select Date Request
  const today = new Date().toISOString().split('T')[0]

  // Calculate each details
  const calcEachDetails = () => {
    const currentDate = new Date()

    setOrderForm((prev) => {
      const order_details = prev.order_details.map((detail) => {
        let newDetail = {...detail}

        if (detail.item) {
          const {item: currentItem, quantity} = detail
          const {prices, default_price} = currentItem

          const validPrices = prices.filter((price) => {
            const start = new Date(price.periodic_start)
            const end = new Date(price.periodic_end)
            return currentDate >= start && currentDate <= end
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
    inputField?.click()
  }

  const handleRemoveFile = (index: number) => {
    const newEvidances = [...receiptFiles]
    newEvidances.splice(index, 1)
    setReceiptFiles(newEvidances)

    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  const handleFileClick = (index: number) => {
    setPreviewImage((receiptFiles[index] as any)?.name)
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
      const cache = {...prev}
      cache.order_details.push(newDetail)
      return cache
    })

    getItem()
  }

  const handleRemoveForm = (index: number) => {
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
    const totalOrderAmount = orderForm.order_details.reduce((accumulator, element) => {
      let subtotal = 0
      let biayaSurvey = 0

      const total = element.total ? parseInt(element.total) : 0

      if (paymentTypeValue[0] === 'gratis') {
        biayaSurvey = 0
        subtotal = 0
      } else if (paymentTypeValue[1] === 'survey') {
        biayaSurvey = 99000
        subtotal = 0
      } else {
        biayaSurvey = 0
        subtotal = total
      }

      const calculatedGrandTotal = subtotal + biayaSurvey

      return paymentTypeValue[1] === 'pemasangan_tanpa_survey'
        ? accumulator + calculatedGrandTotal
        : calculatedGrandTotal
    }, 0)

    const additionalFee = Number(orderForm.additional_fee)
    return isOverdistance === 1 ? totalOrderAmount + additionalFee : totalOrderAmount
  }

  useEffect(() => {
    const calculatedGrandTotal = calculatedGrandTotalOrder()
    setGrandTotal(calculatedGrandTotal)
  }, [orderForm, orderForm.additional_fee, paymentTypeValue, isOverdistance])

  // Submit Update Order
  const handleUpdateOrder = async () => {
    setIsLoading(true)

    const formData = new FormData()
    const appendIfNotDefault = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        formData.append(key, String(value))
      }
    }

    let errorBags = []
    const requiredOrderFields = [
      {key: 'member_id', fieldName: 'Nomor Member'},
      {key: 'sales_id', fieldName: 'Sales Information'},
      {key: 'store_id', fieldName: 'Store'},
      {key: 'project_status_id', fieldName: 'Status Proyek'},
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
      orderForm.order_details.forEach((detailItem: any, index: number) => {
        requiredOrderDetailsFields.forEach(({key, fieldName}) => {
          const value = detailItem[key]

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

        if (detailItem) {
          appendIfNotDefault(`order_details[${index}][item_code]`, detailItem.item_code ?? '')
          appendIfNotDefault(`order_details[${index}][item_name]`, detailItem.item_name ?? '')
          appendIfNotDefault(`order_details[${index}][item_notes]`, detailItem.item_notes ?? '')
          appendIfNotDefault(`order_details[${index}][item_id]`, detailItem.item_id ?? '')
          appendIfNotDefault(`order_details[${index}][quantity]`, detailItem.quantity ?? '')
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
      receiptFiles.forEach((receiptItem) => {
        if (receiptItem instanceof Blob) {
          formData.append(`order_files`, receiptItem, (receiptItem as any)?.name)
        }
      })
    }

    if (receiptFiles?.length) {
      receiptFiles.forEach((receiptItem: any, index: number) => {
        if (receiptItem?.id) {
          formData.append(`existing_order_files[${index}][order_file_id]`, receiptItem.id)
        }
      })
    }

    try {
      const response = await updateOrderApi(apiUrl, params.id, formData)
      const orderId = response.data?.data?.id

      if (response.data.status === 200 || response.data.status === 201) {
        Swal.fire({
          title: 'Success',
          text: 'Success Update Order',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          navigate(`/order/printout-order-dipesan/${orderId}`)
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
      setIsLoading(false)
      Swal.fire({
        title: 'Error',
        text: error?.response?.data?.message ?? 'Failed to update order',
        icon: 'error',
      })
    }
  }

  // Reprint Order
  const handleReprintOrder = async () => {
    try {
      await reprintOrderCounterApi(apiUrl, params.id)
      if (['PICKLIST'].includes(orderDetail?.status?.category ?? '')) {
        navigate(`/order/printout-order-picklist/${params.id}`)
      } else if (
        ['BOOK', 'BOOKED', 'SURVEYREQ', 'SURVEYSTART', 'SURVEYDONE'].includes(
          orderDetail?.status?.category ?? ''
        )
      ) {
        navigate(`/order/printout-order-dipesan/${params.id}`)
      }
    } catch (error: any) {
      console.error(error)
      Swal.fire({
        title: 'Error',
        text: error?.response?.data?.message ?? 'Failed to reprint order',
        icon: 'error',
      })
    }
  }

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
              <UpdateOrderCSCustomerForm
                staffStoreName={staffStoreName}
                paymentTypeValue={paymentTypeValue}
                setPaymentTypeValue={setPaymentTypeValue}
                member={member}
                selectedMember={selectedMember}
                setSelectedMember={setSelectedMember}
                isWhatsapp={isWhatsapp}
                setIsWhatsapp={setIsWhatsapp}
                orderForm={orderForm}
                orderFormHandler={orderFormHandler}
                isOverdistance={isOverdistance}
                handleCheckboxChange={handleCheckboxChange}
              />

              <UpdateOrderCSSalesForm
                userRole={userRole}
                salesId={salesId}
                sales={sales}
                selectedSales={selectedSales}
                setSelectedSales={setSelectedSales}
                setSearchSales={setSearchSales}
                orderForm={orderForm}
                orderFormHandler={orderFormHandler}
              />
            </div>

            <UpdateOrderCSItemsTable
              orderForm={orderForm}
              setOrderForm={setOrderForm}
              orderDetail={orderDetail}
              orderFormHandler={orderFormHandler}
              orderDetailsFormHandler={orderDetailsFormHandler}
              today={today}
              addOrderDetails={addOrderDetails}
              handleRemoveForm={handleRemoveForm}
              paymentTypeValue={paymentTypeValue}
              item={item}
              isLoadingItem={isLoadingItem}
              setSearchItem={setSearchItem}
              setSearchPemasangan={setSearchPemasangan}
              calcEachDetails={calcEachDetails}
              textAreaRefs={textAreaRefs}
              isOverdistance={isOverdistance}
              grandTotal={grandTotal}
            />

            <UpdateOrderCSReceiptUpload
              apiUrl={apiUrl}
              receiptFiles={receiptFiles}
              evidenceRef={evidenceRef}
              handleImageClick={handleImageClick}
              handleFileChange={handleFileChange}
              handleRemoveFile={handleRemoveFile}
              handleFileClick={handleFileClick}
              selectedFileIndex={selectedFileIndex}
              previewImage={previewImage}
              visible={visible}
              setVisible={setVisible}
              orderDetail={orderDetail}
              handleReprintOrder={handleReprintOrder}
              handleUpdateOrder={handleUpdateOrder}
              isLoading={isLoading}
            />
          </Card.Body>
        </Card>
      </Spin>
    </section>
  )
}

export {UpdateOrderStoreCS}
