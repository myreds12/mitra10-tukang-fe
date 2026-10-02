import React, {FC, useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {Orders} from '../../../../interfaces/order'

import './UpdateOrder.css'

import axios from 'axios'
import Swal from 'sweetalert2'
import Select, {SingleValue} from 'react-select'
import CreatableSelect from 'react-select/creatable'
import {Card, Row, Col, Form, InputGroup, Table, Button} from 'react-bootstrap'
import {Spin} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash} from '@fortawesome/free-solid-svg-icons'

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
  project_status_id: number | null
  project_address: string
  project_number: string
  request_survey: string
  payment_type: string
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
  [key: string]: any
}

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
  const [searchPemasangan, setSearchPemasangan] = useState('')
  const [grandTotal, setGrandTotal] = useState<number>(0)

  // Fetch API Data
  const getItem = async () => {
    const itemFree =
      paymentTypeValue[0] === 'gratis' && paymentTypeValue[1] === 'pemasangan_tanpa_survey'
        ? `&item_type=1&is_promotion=1&store_id=${staffStoreId}`
        : ''
    const itemTanpaSurvey =
      paymentTypeValue[0] === 'berbayar' && paymentTypeValue[1] === 'pemasangan_tanpa_survey'
        ? `&item_type=2&is_promotion=1&store_id=${staffStoreId}`
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
              item_id: priceItem.item_id,
              store_id: priceItem.store_id,
              periodic_start: priceItem.periodic_start,
              periodic_end: priceItem.periodic_end,
              min_order: priceItem.min_order,
              price: priceItem.price,
            })),
          }))

        const filteredItem = item.filter((detail: any) => detail.default_price !== '0')
        setItem(paymentTypeValue[0] === 'berbayar' ? filteredItem : item)

        // setItem(item)
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
                const previousDetailValues = data.order_details.map((item: any) => {
                  const previousItem = {
                    value: item.id,
                    label: item?.item_id === null ? item?.item_code : item?.item?.service_name,
                    item_code: item?.item_code ?? '',
                    item_name: item?.item_name ?? '',
                    service_name: item?.item?.service_name ?? '',
                    category_id: item?.item?.category.id,
                    default_price: item?.item?.default_price,
                    type: item?.item?.type,
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

            updatePageTitle(data)
          })
      } catch (error) {
        console.error(error)
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

    fetchOrderData()
    getMember()
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
    setOrderForm({
      ...orderForm,
      is_overdistance: isOverdistance,
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

  useEffect(() => {
    const storedStatus = localStorage.getItem('statusData')
    const statusData = storedStatus ? JSON.parse(storedStatus) : []

    const desiredStatusName = 'PICKLIST'
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
    const today = new Date()

    setOrderForm((prev) => {
      const order_details = prev.order_details.map((detail) => {
        let newDetail = {...detail}

        if (detail.item) {
          const {item, quantity} = detail
          const {prices, default_price} = item

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

  const handleUpdateOrder = async () => {
    setIsLoading(true)
    const url = `${apiUrl}/orders/${params.id}`

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
      orderForm.order_details.forEach((item: any, index: number) => {
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
      setIsLoading(false)

      Swal.fire({
        title: 'Warning',
        text: errorBags[0].message,
        icon: 'warning',
      })

      return false
    }

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
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
        })
        setIsLoading(false)
      })
  }

  // Reprint Order
  const handleReprintOrder = async () => {
    await axios
      .request({
        url: `${apiUrl}/orders/${params.id}/counter`,
        method: 'post',
        maxBodyLength: Infinity,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })
      .then((response) => {
        navigate(`/order/printout-order-picklist/${params.id}`)
      })
      .catch((error) => {
        console.error(error)

        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
        })
      })
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
                <Row className='form-header'>
                  <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='mb-3'>
                    <Form.Group>
                      <Form.Label className='title'>
                        Nama Toko
                        <span className='fs-5 ms-2 pt-2 pb-2 fw-semibold bg-secondary'>
                          {staffStoreName}
                        </span>
                      </Form.Label>
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
                        <Form.Label className='title'>WA / Phone Number</Form.Label>

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
                      <Form.Label className='title'>Nama Customer</Form.Label>
                      <Form.Control type='text' disabled value={selectedMember?.full_name || ''} />
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Form.Group className='mb-5'>
                      <Form.Label className='title'>Email</Form.Label>
                      <Form.Control type='text' disabled value={selectedMember?.email || ''} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className='alamat-order'>
                  <Col>
                    <Form.Group className='mb-5'>
                      <Form.Label className='title'>Alamat</Form.Label>
                      <Form.Control
                        as='textarea'
                        name='project_address'
                        className='field-alamat'
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
                  <Form.Label className='title' column xxl='4' xl='5' md='2'>
                    Sales ID :
                  </Form.Label>

                  <Col xxl='8' xl='7' md='10'>
                    <Form.Control
                      type='number'
                      disabled
                      value={
                        userRole === 'SALES' ? salesId : selectedSales?.value?.toString() || ''
                      }
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='mb-5'>
                  <Form.Label className='title' column xxl='4' xl='5' md='2'>
                    Nama Sales :
                  </Form.Label>

                  <Col xxl='8' xl='7' md='10'>
                    <Form.Control
                      type='text'
                      disabled
                      value={userRole === 'SALES' ? username : selectedSales?.full_name || ''}
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
              <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='request-date order-2 order-md-1'>
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

              <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='order-status order-1 order-md-2'>
                <h1 className='fs-3 fw-bold'>
                  ORDER STATUS :{' '}
                  <span className='fw-bold text-success'>{orderDetail?.status.category}</span>
                </h1>
              </Col>

              <Col
                xs={12}
                md={4}
                lg={4}
                xl={4}
                xxl={4}
                className='button-add text-end order-3 order-md-3'
              >
                <button onClick={() => addOrderDetails()}>Tambah Order</button>
              </Col>
            </Row>

            <Row className='mb-2'>
              <Col>
                <Form.Check
                  inline
                  label='Lebih dari 10 KM dari Store'
                  type='checkbox'
                  checked={isOverdistance === 1}
                  onChange={(e) => handleCheckboxChange(e.target.checked)}
                />
              </Col>
            </Row>

            <div className='table-order-content'>
              <Table hover responsive='md'>
                <thead className='table-order-head'>
                  <tr>
                    {orderForm.order_details.length >= 2 && <th>Action</th>}
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Nama Pemasangan</th>
                    <th>QTY Pemasangan</th>
                    {!(paymentTypeValue[0] === 'gratis' || paymentTypeValue[1] === 'survey') && (
                      <>
                        <th>Harga Jasa</th>
                        <th>Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {orderForm.order_details.map((element, index) => (
                    <tr key={`${index}-order_details`}>
                      {orderForm.order_details.length >= 2 && (
                        <td align='center'>
                          <Button
                            className='btn-remove'
                            variant='danger'
                            onClick={() => handleRemoveForm(index)}
                          >
                            <span className='text'>Remove</span>
                            <span className='icon'>
                              <FontAwesomeIcon icon={faTrash} />
                            </span>
                          </Button>
                        </td>
                      )}

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
                            readOnly={
                              paymentTypeValue[1] === 'pemasangan_tanpa_survey' ? true : false
                            }
                            value={element.item_code ?? ''}
                            onChange={(e) => orderDetailsFormHandler(e, index)}
                          />
                        )}
                      </td>

                      <td style={{maxWidth: '200px', minWidth: '200px'}}>
                        <Form.Control
                          id={`item-name-${index}`}
                          name={`item_name`}
                          plaintext
                          as='textarea'
                          readOnly={
                            paymentTypeValue[1] === 'pemasangan_tanpa_survey' ? true : false
                          }
                          value={element.item_name ?? ''}
                          onChange={(e) => {
                            orderDetailsFormHandler(e, index)
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
                            value={element.item_notes ?? ''}
                            onChange={(e) => {
                              orderDetailsFormHandler(e, index)
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
                            getOptionLabel={(option) => option?.service_name || option?.label || ''}
                            getOptionValue={(option) => String(option?.value ?? '')}
                            onInputChange={(newValue) => setSearchPemasangan(newValue)}
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
                          type='number'
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
                        <Form.Control
                          name='additional_fee'
                          type='number'
                          value={orderForm.additional_fee}
                          onChange={(e) => orderFormHandler(e)}
                        />
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

              <Form.Text className='fs-8 fs-l text-dark-danger'>
                *Penulisan Item code dan Item Name sama persis dengan yang tercantum di NAV
              </Form.Text>
            </div>

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
