import React, {FC, useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {Orders} from '../../../../interfaces/order'

import './UpdateOrder.css'

import Swal from 'sweetalert2'
import {SingleValue} from 'react-select'
import {Card, Button} from 'react-bootstrap'
import {Spin} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'

import {MemberSelect, SalesSelect, ItemSelect, Order} from './types'
import {
  fetchOrderByIdApi,
  fetchMembersApi,
  fetchItemsApi,
  updateOrderStaffApi,
  reprintOrderStaffApi,
} from './services/updateOrderStaffService'
import {UpdateOrderStaffHeader} from './components/UpdateOrderStaffHeader'
import {UpdateOrderStaffCustomerForm} from './components/UpdateOrderStaffCustomerForm'
import {UpdateOrderStaffSalesForm} from './components/UpdateOrderStaffSalesForm'
import {UpdateOrderStaffItemsTable} from './components/UpdateOrderStaffItemsTable'

const UpdateOrderStoreStaff: FC<{updatePageTitle: (order: Orders) => void}> = ({
  updatePageTitle,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const params = useParams()

  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // If User Login is Admin Sales
  const salesId = localStorage.getItem('sales_id') as any
  const username = localStorage.getItem('username') as string
  const userRole = localStorage.getItem('userRole')
  const staffStoreId = localStorage.getItem('storeId') as any
  const staffStoreName = localStorage.getItem('storeName') as string

  // Order Information Detail
  const [orderDetail, setOrderDetail] = useState<any>()

  // Order
  const [orderForm, setOrderForm] = useState<Order>({
    member_id: null,
    sales_id: userRole === 'Sales' ? Number.parseInt(salesId) ?? null : null,
    store_id: Number.parseInt(staffStoreId),
    project_status_id: null,
    project_address: '',
    project_number: '',
    request_survey: '',
    payment_type: '',
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
  })

  const [paymentTypeValue, setPaymentTypeValue] = useState(['gratis', 'pemasangan_tanpa_survey'])

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

      if (Array.isArray(response.data.data)) {
        const expectedType = isGratis ? 1 : isTanpaSurvey ? 2 : 3
        const items = response.data.data
          .filter((x: any) => Boolean(x.is_active) && Number(x.type) === expectedType)
          .map((elem: any) => {
            const itemCode = elem?.item_code ?? ''
            const itemName = elem?.item_name || elem?.service_name || ''
            const surveyLabel = itemCode && itemName ? `${itemCode} - ${itemName}` : itemCode || itemName
            const pemasanganLabel = `${elem.service_name || elem.item_name}${elem.item_code ? ` (${elem.item_code})` : ''}`

            return {
              value: elem.id,
              label: isSurvey ? surveyLabel : pemasanganLabel,
              item_code: itemCode,
              item_name: elem?.item_name ?? '',
              service_name: elem?.service_name ?? '',
              category_id: elem.category_id,
              default_price: elem.default_price,
              type: elem?.type,
              prices: (elem.prices || []).map((priceItem: any) => ({
                id: priceItem.id,
                item_id: priceItem.item_id,
                store_id: priceItem.store_id,
                periodic_start: priceItem.periodic_start,
                periodic_end: priceItem.periodic_end,
                min_order: priceItem.min_order,
                price: priceItem.price,
              })),
            }
          })

        setItem(items)
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
    // eslint-disable-next-line
  }, [paymentTypeValue, debouncedSearchItem, debouncedSearchPemasangan])

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetchOrderByIdApi(apiUrl, params.id)
        const data = response.data.data

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

        if (data?.sales) {
          setSelectedSales((prev) => ({
            ...prev,
            value: data.sales.id,
            label: data.sales.id,
            full_name: data.sales.full_name,
          }))

          setOrderForm((prev) => ({
            ...prev,
            sales_id: data.sales.id,
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
            const previousDetailValues = data.order_details.map((orderDetailItem: any) => {
              const code =
                orderDetailItem?.item_code === 'null' ? '' : orderDetailItem?.item_code || ''
              const name =
                (orderDetailItem?.item_name === 'null' ? '' : orderDetailItem?.item_name) ||
                orderDetailItem?.item?.item_name ||
                orderDetailItem?.item?.service_name ||
                ''
              const surveyLabel = code && name ? `${code} - ${name}` : code || name

              const previousItem = {
                value: orderDetailItem.id,
                label:
                  data.payment_type === 'survey' ? surveyLabel : orderDetailItem?.item?.service_name,
                item_code: code,
                item_name: name,
                service_name: orderDetailItem?.item?.service_name ?? '',
                category_id: orderDetailItem?.item?.category?.id,
                default_price: orderDetailItem?.item?.default_price,
                type: orderDetailItem?.item?.type,
                prices:
                  orderDetailItem?.item?.prices?.length > 0
                    ? orderDetailItem?.item?.prices.map((price: any) => ({
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
                id: orderDetailItem.id,
                item_id: orderDetailItem.item_id,
                item_code: orderDetailItem?.item_code === 'null' ? '' : orderDetailItem.item_code,
                item_name: orderDetailItem?.item_name === 'null' ? '' : orderDetailItem.item_name,
                item_notes:
                  orderDetailItem?.item_notes === 'null' ? '' : orderDetailItem.item_notes,
                quantity: orderDetailItem.quantity,
                unit_price: orderDetailItem.unit_price,
                total: orderDetailItem.total,
              }
            })

            return {
              ...prev,
              order_details: previousDetailValues,
            }
          })
        }

        updatePageTitle(data)
      } catch (error) {
        console.error(error)
      }
    }

    const getMember = async () => {
      try {
        const response = await fetchMembersApi(apiUrl)
        if (Array.isArray(response.data.data)) {
          const tempMember = response.data.data.map((memberItem: any) => ({
            value: memberItem.id,
            label: memberItem.member_number,
            full_name: memberItem.full_name,
            email: memberItem.email,
            phone_number: memberItem.phone_number,
            whatsapp_number: memberItem.whatsapp_number,
            address_1: memberItem.address_1,
          }))

          setMember(tempMember)
        } else {
          console.error('API response data is not an array:', response.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchOrderData()
    getMember()
    // eslint-disable-next-line
  }, [])

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
    setOrderForm((prev) => ({
      ...prev,
      is_overdistance: isOverdistance,
    }))
  }, [isOverdistance])

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

  // Selected Payment Type
  useEffect(() => {
    setOrderForm((prev) => ({
      ...prev,
      payment_type: paymentTypeValue[0] === 'gratis' ? 'gratis' : paymentTypeValue[1],
    }))
  }, [paymentTypeValue])

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
          const {item: detailItem, quantity} = detail
          const {prices, default_price} = detailItem

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

  const handleRemoveForm = (index: any) => {
    setOrderForm((prev) => {
      const cache = {...prev}
      cache.order_details.splice(index, 1)
      return cache
    })

    getItem()
  }

  // Calculate Grand Total Order Amount
  const calculatedGrandTotalOrder = () => {
    const totalOrder = orderForm.order_details.reduce((accumulator, element) => {
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
    return isOverdistance === 1 ? totalOrder + additionalFee : totalOrder
  }

  useEffect(() => {
    const calculatedGrandTotal = calculatedGrandTotalOrder()
    setGrandTotal(calculatedGrandTotal)
  }, [orderForm.order_details, orderForm.additional_fee, paymentTypeValue, isOverdistance])

  const appendIfNotDefault = (formData: FormData, key: any, value: any) => {
    if (value !== null && value !== undefined && value !== '' && value !== 0) {
      formData.append(key, String(value))
    }
  }

  const handleUpdateOrder = async () => {
    setIsLoading(true)
    const formData = new FormData()

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
      orderForm.order_details.forEach((orderItem: any, index: number) => {
        requiredOrderDetailsFields.forEach(({key, fieldName}) => {
          const value = orderItem[key]

          if (key === 'item_code') {
            if (value?.length < 10 && ![1, 2].includes(orderItem?.item?.type)) {
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

        if (orderItem) {
          appendIfNotDefault(formData, `order_details[${index}][item_code]`, orderItem.item_code ?? '')
          appendIfNotDefault(formData, `order_details[${index}][item_name]`, orderItem.item_name ?? '')
          appendIfNotDefault(formData, `order_details[${index}][item_notes]`, orderItem.item_notes ?? '')
          appendIfNotDefault(formData, `order_details[${index}][item_id]`, orderItem.item_id ?? '')
          appendIfNotDefault(formData, `order_details[${index}][quantity]`, orderItem.quantity ?? '')
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

    try {
      const response = await updateOrderStaffApi(apiUrl, params.id, formData)

      if (response.data.status === 200 || response.data.status === 201) {
        Swal.fire({
          title: 'Success',
          text: 'Success Update Order',
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

      navigate('/order/view-order')
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message,
        icon: 'error',
      })
      setIsLoading(false)
    }
  }

  // Reprint Order
  const handleReprintOrder = async () => {
    try {
      await reprintOrderStaffApi(apiUrl, params.id)
      navigate(`/order/printout-order-picklist/${params.id}`)
    } catch (error: any) {
      console.error(error)

      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message,
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
              <div className='form-costumer'>
                <UpdateOrderStaffHeader
                  staffStoreName={staffStoreName}
                  paymentTypeValue={paymentTypeValue}
                  setPaymentTypeValue={setPaymentTypeValue}
                />

                <UpdateOrderStaffCustomerForm
                  member={member}
                  selectedMember={selectedMember}
                  setSelectedMember={setSelectedMember}
                  isWhatsapp={isWhatsapp}
                  setIsWhatsapp={setIsWhatsapp}
                  orderForm={orderForm}
                  orderFormHandler={orderFormHandler}
                />
              </div>

              <UpdateOrderStaffSalesForm
                userRole={userRole}
                salesId={salesId}
                username={username}
                selectedSales={selectedSales}
                orderForm={orderForm}
                orderFormHandler={orderFormHandler}
              />
            </div>

            <UpdateOrderStaffItemsTable
              orderForm={orderForm}
              setOrderForm={setOrderForm}
              orderDetail={orderDetail}
              paymentTypeValue={paymentTypeValue}
              today={today}
              orderFormHandler={orderFormHandler}
              orderDetailsFormHandler={orderDetailsFormHandler}
              addOrderDetails={addOrderDetails}
              handleRemoveForm={handleRemoveForm}
              isOverdistance={isOverdistance}
              handleCheckboxChange={handleCheckboxChange}
              isLoadingItem={isLoadingItem}
              item={item}
              setSearchItem={setSearchItem}
              setSearchPemasangan={setSearchPemasangan}
              calcEachDetails={calcEachDetails}
              grandTotal={grandTotal}
            />

            <div className='button-submit d-flex justify-content-center align-items-center mt-5'>
              {orderDetail?.print_counter >= 1 && (
                <Button type='submit' onClick={handleReprintOrder} variant='warning'>
                  Reprint Order
                </Button>
              )}

              <Button
                type='submit'
                disabled={isLoading}
                onClick={handleUpdateOrder}
                variant='dark-primary'
              >
                {isLoading ? 'Updating Order..' : ' Update Order & Print'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Spin>
    </section>
  )
}

export {UpdateOrderStoreStaff}
