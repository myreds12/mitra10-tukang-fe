import React, {FC, useEffect, useState, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import './NewOrder.css'
import axios from 'axios'
import Swal from 'sweetalert2'
import {Spin} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import {Card, Button} from 'react-bootstrap'
import {MemberSelect, Order} from './types'
import {useNewOrderLookups} from './hooks/useNewOrderLookups'
import {OrderCustomerForm} from './components/OrderCustomerForm'
import {OrderSalesForm} from './components/OrderSalesForm'
import {OrderVendorSection} from './components/OrderVendorSection'
import {OrderItemsTable} from './components/OrderItemsTable'
import {OrderReceiptUpload} from './components/OrderReceiptUpload'

const NewOrderHO: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const textAreaRefs = useRef<(HTMLTextAreaElement | null)[]>([])
  const evidenceRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [paymentTypeValue, setPaymentTypeValue] = useState(['gratis', 'pemasangan_tanpa_survey'])

  const {
    isLoadingPage,
    store,
    selectedStore,
    setSelectedStore,
    member,
    setSearchByPhoneNumber,
    selectedMember,
    setSelectedMember,
    handleChangeSelectMember,
    sales,
    searchSales,
    setSearchSales,
    selectedSales,
    setSelectedSales,
    vendor,
    vendorSelect,
    setSearchVendor,
    selectedVendor,
    setSelectedVendor,
    vendorAvailbility,
    item,
    setItem,
    setSearchItem,
    setSearchPemasangan,
    isLoadingItem,
    getItem,
  } = useNewOrderLookups(paymentTypeValue)

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

  const [receiptFiles, setReceiptFiles] = useState<Array<File | null>>([])
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
  const [previewImage, setPreviewImage] = useState<any>()
  const [visible, setVisible] = useState(false)

  // Member
  const [isSubmittingNewMember, setIsSubmittingNewMember] = useState(false)
  const [isWhatsapp, setIsWhatsapp] = useState<boolean>(true)
  const [isOverdistance, setIsOverdistance] = useState<number>(0)
  const [grandTotal, setGrandTotal] = useState<number>(0)

  const today = new Date().toISOString().split('T')[0]

  const orderFormHandler = (e: any) => {
    setOrderForm({
      ...orderForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleCheckboxChange = (isChecked: boolean) => {
    setIsOverdistance(isChecked ? 1 : 0)
  }

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
    setOrderForm((prev) => ({
      ...prev,
      is_overdistance: isOverdistance,
    }))
  }, [isOverdistance])

  // Selected Store
  useEffect(() => {
    setItem([])
    setSelectedVendor({value: null, label: ''})
    setSearchVendor('')
    setOrderForm((prev) => ({
      ...prev,
      store_id: selectedStore?.value ?? null,
      vendor_id: null,
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
    }))
  }, [selectedStore?.value, setItem, setSelectedVendor, setSearchVendor])

  // Selected Member
  useEffect(() => {
    setOrderForm((prev) => ({
      ...prev,
      project_address: selectedMember?.address_1 ?? '',
      project_number:
        (isWhatsapp ? selectedMember?.whatsapp_number : selectedMember?.phone_number) ?? '',
      member_id: selectedMember?.value ?? null,
    }))
  }, [selectedMember, isWhatsapp])

  // Selected Sales
  useEffect(() => {
    setOrderForm((prev) => ({
      ...prev,
      sales_id: selectedSales?.value ?? null,
    }))
  }, [selectedSales])

  // Selected Vendor
  useEffect(() => {
    setOrderForm((prev) => ({
      ...prev,
      vendor_id: selectedVendor?.value ?? null,
    }))
  }, [selectedVendor])

  // Selected Payment Type && Clear Order Detail if user changed payment type
  useEffect(() => {
    setItem([])
    setSearchItem('')
    setSearchPemasangan('')
    setOrderForm((prev) => ({
      ...prev,
      payment_type: paymentTypeValue[0] === 'gratis' ? 'gratis' : paymentTypeValue[1],
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
    }))
  }, [paymentTypeValue, setItem, setSearchItem, setSearchPemasangan])

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

    setOrderForm((prev) => ({
      ...prev,
      project_status_id: statusId,
    }))
  }, [orderForm.payment_type, paymentTypeValue])

  // Calculate each details
  const calcEachDetails = () => {
    const todayDate = new Date()

    setOrderForm((prev) => {
      const order_details = prev.order_details.map((detail) => {
        let newDetail = {...detail}

        if (detail.item) {
          const {item: currentItem, quantity} = detail
          const {prices = [], default_price} = currentItem

          const validPrices = prices.filter((price) => {
            const start = new Date(price.periodic_start)
            const end = new Date(price.periodic_end)
            return todayDate >= start && todayDate <= end
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
      const file: Array<File | null> = []
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

    setOrderForm((prev) => ({
      ...prev,
      order_details: [...prev.order_details, newDetail],
    }))

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
    const grandTotalVal = orderForm.order_details.reduce((accumulator, element) => {
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
    return isOverdistance === 1 ? grandTotalVal + additionalFee : grandTotalVal
  }

  useEffect(() => {
    const calculatedGrandTotal = calculatedGrandTotalOrder()
    setGrandTotal(calculatedGrandTotal)
    // eslint-disable-next-line
  }, [orderForm.order_details, orderForm.additional_fee, paymentTypeValue, isOverdistance])

  // Submit Order
  const appendIfNotDefault = (formData: FormData, key: any, value: any) => {
    if (value !== null && value !== undefined && value !== '' && value !== 0) {
      formData.append(key, String(value))
    }
  }

  const handleSubmitNewOrder = async () => {
    setIsLoading(true)
    const url = `${apiUrl}/orders`
    const formData = new FormData()

    let errorBags: Array<{message: string}> = []
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
      orderForm.order_details.forEach((it: any, index: number) => {
        requiredOrderDetailsFields.forEach(({key, fieldName}) => {
          const value = it[key]

          if (key === 'item_code') {
            if (value?.length < 10 && ![1, 2].includes(it?.item?.type)) {
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

        if (it) {
          appendIfNotDefault(formData, `order_details[${index}][item_code]`, it.item_code ?? '')
          appendIfNotDefault(formData, `order_details[${index}][item_name]`, it.item_name ?? '')
          appendIfNotDefault(formData, `order_details[${index}][item_notes]`, it.item_notes ?? '')
          appendIfNotDefault(formData, `order_details[${index}][item_id]`, it.item_id ?? '')
          appendIfNotDefault(formData, `order_details[${index}][quantity]`, it.quantity ?? '')
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
      receiptFiles.forEach((f) => {
        if (f instanceof Blob) {
          formData.append(`order_files`, f, f.name)
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

    try {
      const response = await axios.post(url, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
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
      } else {
        Swal.fire({
          title: 'Warning',
          text: response.data.message,
          icon: 'warning',
        })
      }
    } catch (error: any) {
      Swal.fire({
        title: 'Warning',
        text: error.response?.data?.message || 'Error occurred',
        icon: 'warning',
      })
    } finally {
      setIsLoading(false)
    }
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
          },
        })

        if (response.data.status === 201) {
          setSelectedMember((prev) => ({
            ...prev,
            value: response.data.data.id,
          }))

          setOrderForm((prev) => ({
            ...prev,
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
          text: error.response?.data?.message || 'Error occurred',
          icon: 'warning',
        })
      }
    } else {
      await handleSubmitNewOrder()
    }
  }

  useEffect(() => {
    if (isSubmittingNewMember === true) {
      setOrderForm((prev) => ({
        ...prev,
        member_id: selectedMember?.value ?? null,
      }))
      handleSubmitNewOrder()
    }
    // eslint-disable-next-line
  }, [selectedMember.value])

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
              <OrderCustomerForm
                store={store}
                setSelectedStore={setSelectedStore}
                paymentTypeValue={paymentTypeValue}
                setPaymentTypeValue={setPaymentTypeValue}
                member={member}
                setSearchByPhoneNumber={setSearchByPhoneNumber}
                handleChangeSelectMember={handleChangeSelectMember}
                selectedMember={selectedMember}
                isWhatsapp={isWhatsapp}
                setIsWhatsapp={setIsWhatsapp}
                orderForm={orderForm}
                orderFormHandler={orderFormHandler}
                handleCheckboxChange={handleCheckboxChange}
              />

              <OrderSalesForm
                selectedSales={selectedSales}
                setSelectedSales={setSelectedSales}
                sales={sales}
                setSearchSales={setSearchSales}
                orderForm={orderForm}
                orderFormHandler={orderFormHandler}
              />
            </div>

            <OrderVendorSection
              selectedVendor={selectedVendor}
              setSelectedVendor={setSelectedVendor}
              vendorSelect={vendorSelect}
              setSearchVendor={setSearchVendor}
              orderForm={orderForm}
              orderFormHandler={orderFormHandler}
              today={today}
              vendor={vendor}
              vendorAvailbility={vendorAvailbility}
            />

            <OrderItemsTable
              addOrderDetails={addOrderDetails}
              orderForm={orderForm}
              paymentTypeValue={paymentTypeValue}
              isLoadingItem={isLoadingItem}
              item={item}
              setSearchItem={setSearchItem}
              setSearchPemasangan={setSearchPemasangan}
              setOrderForm={setOrderForm}
              calcEachDetails={calcEachDetails}
              orderDetailsFormHandler={orderDetailsFormHandler}
              handleRemoveForm={handleRemoveForm}
              textAreaRefs={textAreaRefs}
              isOverdistance={isOverdistance}
              grandTotal={grandTotal}
            />

            <OrderReceiptUpload
              receiptFiles={receiptFiles}
              handleImageClick={handleImageClick}
              evidenceRef={evidenceRef}
              handleFileChange={handleFileChange}
              handleFileClick={handleFileClick}
              handleRemoveFile={handleRemoveFile}
              selectedFileIndex={selectedFileIndex}
              previewImage={previewImage}
              visible={visible}
              setVisible={setVisible}
              apiUrl={apiUrl}
            />

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
