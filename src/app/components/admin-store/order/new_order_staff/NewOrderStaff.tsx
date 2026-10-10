import React, {FC, useState, useEffect, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import {Card, Button} from 'react-bootstrap'
import {Spin} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import Swal from 'sweetalert2'
import axios from 'axios'
import './NewOrder.css'
import {Order, MemberSelect} from './types'
import {sendOrderStaffWA} from './services/orderStaffService'
import {useNewOrderStaffLookups} from './hooks/useNewOrderStaffLookups'
import {OrderStaffCustomerForm} from './components/OrderStaffCustomerForm'
import {OrderStaffSalesForm} from './components/OrderStaffSalesForm'
import {OrderStaffVendorSection} from './components/OrderStaffVendorSection'
import {OrderStaffItemsTable} from './components/OrderStaffItemsTable'

const NewOrderStoreStaff: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const textAreaRefs = useRef<(HTMLTextAreaElement | null)[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(false)

  // If User Login is Admin Sales
  const salesId = localStorage.getItem('sales_id') as any
  const salesName = localStorage.getItem('salesName') as string
  const userRole = localStorage.getItem('userRole')
  const staffStoreId = localStorage.getItem('storeId') as any
  const staffStoreName = localStorage.getItem('storeName') as string

  // Payment Type
  const [paymentTypeValue, setPaymentTypeValue] = useState(['gratis', 'pemasangan_tanpa_survey'])

  // Lookups hook
  const {
    isLoadingPage,
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
    vendorAvailbility,
    item,
    setItem,
    setSearchItem,
    setSearchPemasangan,
    isLoadingItem,
    getItem,
  } = useNewOrderStaffLookups(paymentTypeValue, staffStoreId)

  // Order
  const [orderForm, setOrderForm] = useState<Order>({
    member_id: null,
    sales_id: userRole === 'Sales' ? Number.parseInt(salesId) ?? null : null,
    store_id: Number.parseInt(staffStoreId),
    project_status_id: null,
    project_address: '',
    project_number: '',
    request_survey: '',
    payment_type: 'gratis',
    is_overdistance: 0,
    additional_fee: 25000,
    notes: '',
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

  const [isSubmittingNewMember, setIsSubmittingNewMember] = useState(false)
  const [isWhatsapp, setIsWhatsapp] = useState<boolean>(true)
  const [isOverdistance, setIsOverdistance] = useState<number>(0)
  const [grandTotal, setGrandTotal] = useState<number>(0)

  // WA Details
  const [orderDetail, setOrderDetail] = useState<any>()
  const [emailDetail, setEmailDetail] = useState<any>()

  const today = new Date().toISOString().split('T')[0]

  // Order Form Handler
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

  // Selected Sales Handler
  useEffect(() => {
    setOrderForm((prev) => ({
      ...prev,
      sales_id: userRole === 'Sales' ? Number.parseInt(salesId) : selectedSales?.value || null,
    }))
  }, [selectedSales, salesId, userRole])

  // Selected Member Handler
  useEffect(() => {
    setOrderForm((prev) => ({
      ...prev,
      member_id: selectedMember?.value || null,
      project_address: selectedMember?.address_1 || '',
      project_number: isWhatsapp
        ? selectedMember?.whatsapp_number || ''
        : selectedMember?.phone_number || '',
    }))
  }, [selectedMember, isWhatsapp])

  // Clear Order Detail when payment type changed
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

  // Set default project status to PICKLIST
  useEffect(() => {
    const storedStatus = localStorage.getItem('statusData')
    const statusData = storedStatus ? JSON.parse(storedStatus) : []

    const desiredStatusName = 'PICKLIST'
    const desiredStatus = statusData.find((status: any) => status?.category === desiredStatusName)
    const statusId = desiredStatus?.value

    setOrderForm((prev) => ({
      ...prev,
      project_status_id: statusId,
    }))
  }, [])

  // Calculate each details
  const calcEachDetails = () => {
    const now = new Date()

    setOrderForm((prev) => {
      const order_details = prev.order_details.map((detail) => {
        let newDetail = {...detail}

        if (detail.item) {
          const {item: selectedItm, quantity} = detail
          const {prices = [], default_price} = selectedItm

          const validPrices = prices.filter((price: any) => {
            const start = new Date(price.periodic_start)
            const end = new Date(price.periodic_end)
            return now >= start && now <= end
          })

          const applicablePrice = validPrices
            .filter((price: any) => quantity >= +price.min_order)
            .sort((a: any, b: any) => +b.min_order - +a.min_order)[0]

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

  // Order Details Add/Remove
  const addOrderDetails = () => {
    const newDetail = {
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

  const orderDetailsFormHandler = (e: any, index: number) => {
    const {name, value} = e.target
    setOrderForm((prev) => {
      const cache = {...prev}
      cache.order_details[index] = {
        ...cache.order_details[index],
        [name]: value,
      }
      return cache
    })
  }

  // Auto-resize textarea
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
    const totalDetails = orderForm.order_details.reduce((accumulator, element) => {
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
    return isOverdistance === 1 ? totalDetails + additionalFee : totalDetails
  }

  useEffect(() => {
    const calculatedGrandTotal = calculatedGrandTotalOrder()
    setGrandTotal(calculatedGrandTotal)
  }, [orderForm.order_details, orderForm.additional_fee, paymentTypeValue, isOverdistance])

  // Submit New Order
  const appendIfNotDefault = (fd: FormData, key: any, value: any) => {
    if (value !== null && value !== undefined && value !== '' && value !== 0) {
      fd.append(key, String(value))
    }
  }

  const fetchOrderData = async (newOrderId: number) => {
    try {
      const response = await axios.get(`${apiUrl}/orders/${newOrderId}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      setOrderDetail(response.data.data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchEmailData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/mails`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        params: {
          order_by: 'asc',
          type_email_message: 1,
        },
      })
      setEmailDetail(response.data.data.data[0])
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmitNewOrder = async (customMemberId?: number) => {
    setIsLoading(true)
    const url = `${apiUrl}/orders`
    const targetMemberId = customMemberId ?? orderForm.member_id ?? selectedMember?.value

    const errorBags: Array<{message: string}> = []
    const requiredOrderFields = [
      {key: 'member_id', fieldName: 'Nomor Member'},
      {key: 'sales_id', fieldName: 'Sales Information'},
      {key: 'store_id', fieldName: 'Store'},
      {key: 'project_status_id', fieldName: 'Status Proyek'},
      {key: 'project_address', fieldName: 'Alamat Proyek'},
      {key: 'project_number', fieldName: 'Nomor Proyek'},
      {key: 'request_survey', fieldName: 'Request Survey'},
      {key: 'payment_type', fieldName: 'Payment Type'},
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

    const formData = new FormData()

    for (const {key, fieldName} of requiredOrderFields) {
      const value = key === 'member_id' ? targetMemberId : orderForm[key]
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
        formData.append(key, String(value))
      }
    }

    if (orderForm.order_details && Array.isArray(orderForm.order_details)) {
      orderForm.order_details.forEach((dt: any, index: number) => {
        if (dt?.item && dt.item.prices?.length > 0) {
          const minOrder = Number(dt.item.prices[0].min_order)

          if (dt.quantity < minOrder) {
            errorBags.push({
              message: `Quantity item "${dt.item_name}" harus lebih dari minimal order (${minOrder}).`,
            })
            setIsLoading(false)
          }
        }

        requiredOrderDetailsFields.forEach(({key, fieldName}) => {
          const value = dt[key]

          if (key === 'item_code') {
            if (value?.length < 10 && ![1, 2].includes(dt?.item?.type)) {
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

        if (dt) {
          appendIfNotDefault(formData, `order_details[${index}][item_code]`, dt.item_code ?? '')
          appendIfNotDefault(formData, `order_details[${index}][item_name]`, dt.item_name ?? '')
          appendIfNotDefault(formData, `order_details[${index}][item_notes]`, dt.item_notes ?? '')
          appendIfNotDefault(formData, `order_details[${index}][item_id]`, dt.item_id ?? '')
          appendIfNotDefault(formData, `order_details[${index}][quantity]`, dt.quantity ?? '')
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

    try {
      const response = await axios.post(url, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      const newOrderId = response.data?.data?.id
      if (response.data.status === 201) {
        fetchOrderData(newOrderId)
        fetchEmailData()
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
        text: error.response?.data?.message || 'Error occurred',
        icon: 'error',
      })
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
        join_location: parseInt(staffStoreId),
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
          const createdMemberId = response.data.data.id
          setSelectedMember((prev) => ({
            ...prev,
            value: createdMemberId,
          }))

          setOrderForm((prev) => ({
            ...prev,
            member_id: createdMemberId,
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
          text: error.response?.data?.message || 'Error creating member',
          icon: 'warning',
        })
      }
    } else {
      await handleSubmitNewOrder()
    }
  }

  useEffect(() => {
    if (isSubmittingNewMember === true && selectedMember?.value) {
      setOrderForm((prev) => ({
        ...prev,
        member_id: selectedMember.value ?? null,
      }))
      handleSubmitNewOrder(selectedMember.value)
    }
  }, [selectedMember?.value, isSubmittingNewMember])

  // Handle WA Send & Redirect on Order + Mail loaded
  useEffect(() => {
    if (!orderDetail || !emailDetail) return

    const handleSendWA = async () => {
      try {
        await sendOrderStaffWA(
          orderDetail,
          emailDetail,
          staffStoreName,
          window.location.origin
        )
      } catch (e) {
        console.error('Failed to send WA:', e)
      }

      Swal.fire({
        title: 'Success',
        text: 'Order Created',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        navigate(`/order/printout-order-picklist/${orderDetail.id}`)
      })

      setIsLoading(false)
    }

    handleSendWA()
  }, [orderDetail, emailDetail, navigate, staffStoreName])

  return (
    <section id='pre-order'>
      <Spin
        spinning={isLoadingPage}
        size='large'
        tip='Loading..'
        indicator={<LoadingOutlined style={{fontSize: 24}} spin />}
      >
        <Card className='mb-5'>
          <Card.Body>
            <div className='form-wrapper'>
              <OrderStaffCustomerForm
                staffStoreName={staffStoreName}
                paymentTypeValue={paymentTypeValue}
                setPaymentTypeValue={setPaymentTypeValue}
                member={member}
                setSearchByPhoneNumber={setSearchByPhoneNumber}
                handleChangeSelectMember={handleChangeSelectMember}
                isWhatsapp={isWhatsapp}
                setIsWhatsapp={setIsWhatsapp}
                orderForm={orderForm}
                orderFormHandler={orderFormHandler}
                selectedMember={selectedMember}
                handleCheckboxChange={handleCheckboxChange}
              />

              <OrderStaffSalesForm
                userRole={userRole}
                salesId={salesId}
                salesName={salesName}
                selectedSales={selectedSales}
                setSelectedSales={setSelectedSales}
                sales={sales}
                setSearchSales={setSearchSales}
                orderForm={orderForm}
                orderFormHandler={orderFormHandler}
              />
            </div>

            <OrderStaffVendorSection
              orderForm={orderForm}
              orderFormHandler={orderFormHandler}
              today={today}
              vendor={vendor}
              vendorAvailbility={vendorAvailbility}
            />

            <OrderStaffItemsTable
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

            <div className='button-submit d-flex justify-content-center align-items-center mt-5'>
              <Button
                type='submit'
                onClick={handleSubmitNewMember}
                disabled={isLoading}
                variant='dark-primary'
              >
                {isLoading || isSubmittingNewMember
                  ? 'Submitting Order...'
                  : 'Submit Order & Print'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Spin>
    </section>
  )
}

export {NewOrderStoreStaff}
