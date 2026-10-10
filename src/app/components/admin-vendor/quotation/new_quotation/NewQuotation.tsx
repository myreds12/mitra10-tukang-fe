import React, {FC, useState, useEffect, ChangeEvent} from 'react'

import './NewQuotation.css'

import axios from 'axios'
import Select from 'react-select'
import Swal from 'sweetalert2'
import {useNavigate} from 'react-router-dom'
import {Form, Button, Row, Col, Card, Table} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash} from '@fortawesome/free-solid-svg-icons'

interface Status {
  value: number | null
  category: string
}

interface Quotation {
  id: number | null
  order_id: number | null
  store_id: number | null
  quotation_special: number
  quotation_status: number | null
  description: string
  quotation_number: string
  quotation_date: string
  quotation_validity: string
  quotation_disc: number
  quotation_promotion: number | null
  quotation_grand_total: number
  readiness: number
  receipt_quotation: string
  quotation_details: Array<{
    id: number | null
    index: number
    work_step?: number
    item_id: number | null
    work_order_item_id: number | null
    category_id: number | null
    type: number
    item_name: string
    unit_price: number | string
    unit: string
    description: string
    total: number
    final_price: number
    margin: number | string
    margin_type: number
    quantity: number | string
    is_user: number
  }>
}

const NewQuotationVendor: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const vendorId = localStorage.getItem('vendor_id')
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const today = new Date().toISOString().split('T')[0]

  // Fetch Data Work Order
  const [workOrder, setWorkOrder] = useState<any>()
  const [workOrderId, setWorkOrderId] = useState<string>('')
  const [workOrderDetail, setWorkOrderDetail] = useState<any>()

  // Add Quotation
  const [quotation, setQuotation] = useState<Quotation>({
    id: null,
    order_id: null,
    store_id: null,
    quotation_special: 0,
    quotation_status: null,
    description: '',
    quotation_number: '',
    quotation_date: '',
    quotation_validity: '',
    quotation_disc: 0,
    quotation_promotion: null,
    quotation_grand_total: 0,
    readiness: 1,
    receipt_quotation: '',
    quotation_details: [
      {
        id: null,
        index: Number(Date.now() + 1),
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
        index: Number(Date.now() + 2),
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

  const [totalMaterial, setTotalMaterial] = useState<number>(0)
  const [totalJasaMaterial, setTotalJasaMaterial] = useState<number>(0)
  const [grandTotalRounded, setGrandTotalRounded] = useState<any>(0)
  const [grandTotalDiff, setGrandTotalDiff] = useState<any>(0)

  const getWorkOrder = async () => {
    const storedStatus = localStorage.getItem('statusData')
    const statusData: Array<Status> = storedStatus ? JSON.parse(storedStatus) : []
    const desiredStatus = statusData.filter((status: any) =>
      ['SURVEYDONE', 'RESURVEYDONE'].includes(status?.category)
    )

    if (desiredStatus) {
      const statuses = desiredStatus.map((x) => x.value)

      const response = await axios.get(
        `${apiUrl}/work-orders?order_by=desc&take=0&status=${statuses}&vendor_id=${vendorId}`,
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
        const tempWorkOrder = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.order_id,
          quotation: item?.order?.quotation,
        }))
        const filteredWorkOrder = tempWorkOrder.filter((x: any) => x.quotation.length === 0)
        setWorkOrder(filteredWorkOrder)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } else {
      console.error('Desired status not found in statusData')
    }
  }

  const getWorkOrderDetail = async () => {
    try {
      await axios
        .get(`${apiUrl}/work-orders/${workOrderId}`, {
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

          if (data?.work_order_status) {
            const quotationDetails = data.work_order_status[0].work_order_items.map(
              (item: any, index: number) => ({
                id: item?.id,
                index: Math.abs(stringToHash(`${Date.now() + index}-indexes`)),
                type: item?.type,
                item_id: null,
                work_order_item_id: item.id,
                category_id: null,
                item_name: item?.name,
                quantity: item?.quantity,
                unit: item?.unit ?? '',
                is_user: item?.is_customer ? 1 : 0,
                unit_price: 0,
                final_price: 0,
                margin: 0,
                margin_type: 1,
                ...(item?.type === 2 && quotation.quotation_special === 1
                  ? {work_step: 1}
                  : {work_step: 0}),
              })
            )

            setQuotation((prev) => ({
              ...prev,
              quotation_details: quotationDetails,
            }))
          }
        })
    } catch (err) {
      console.error(err)
    }
  }

  const getCode = async () => {
    try {
      const response = await axios.get(`${apiUrl}/quotation/next-code`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (response.status === 200) {
        const {data} = response
        setQuotation((prev) => ({
          ...prev,
          id: data.data.code,
        }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getWorkOrder()
    getCode()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (workOrderId) {
      getWorkOrderDetail()
    }
    // eslint-disable-next-line
  }, [workOrderId, quotation.quotation_special])

  const formatForFormData = (date: any) => {
    if (isNaN(date.getTime())) {
      return ''
    }

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()

    return `${year}-${month}-${day}`
  }

  // Hash Key
  const stringToHash = (string: string): number => {
    let hash = 0

    if (string.length === 0) return hash

    for (let i = 0; i < string.length; i++) {
      const char = string.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }

    return hash
  }

  // Select Work Order
  const handleSelectWorkOrder = (element: any) => {
    const selectedWorkOrder = element.value
    setWorkOrderId(selectedWorkOrder)
  }

  // Quotation Status
  useEffect(() => {
    const storedStatus = localStorage.getItem('statusData')
    const statusData = storedStatus ? JSON.parse(storedStatus) : []

    const desiredStatus = statusData.find((status: any) => status.category === 'QUOTEIN')
    const statusId = desiredStatus?.value

    setQuotation((prev) => ({
      ...prev,
      quotation_status: statusId,
    }))
  }, [quotation.quotation_status])

  // Handler Change
  const handleChangeQuotation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target

    if (name === 'quotation_date') {
      const quotationDate = value ? new Date(value) : new Date()
      const daysToAdd = 7
      const validityDate = new Date(quotationDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000)

      setQuotation((prev) => ({
        ...prev,
        [name]: value,
        quotation_validity: validityDate.toISOString().split('T')[0],
      }))
    } else {
      setQuotation((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleChangeQuotationType = (isChecked: boolean) => {
    setQuotation((prev) => ({
      ...prev,
      quotation_special: isChecked ? 1 : 0,
    }))
  }

  // Handle Quotation Detail
  const addQuotationDetail = (type: number, work_step?: number) => {
    const newDetail = {
      id: null,
      index: Number(Date.now()),
      item_id: null,
      work_order_item_id: null,
      category_id: null,
      category_name: '',
      type: type,
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
      work_step: work_step !== undefined ? work_step : 0,
    }

    setQuotation((prev) => {
      const cache = {...prev}
      cache.quotation_details.push(newDetail)
      return cache
    })
  }

  const handleRemoveQuotationDetailForm = (index: number) => {
    setQuotation((prev) => {
      const cache = {...prev}
      const typeIndex = cache.quotation_details.findIndex((item) => item.index === index)
      if (typeIndex !== -1) {
        cache.quotation_details.splice(typeIndex, 1)
      }
      return cache
    })
  }

  const handleIsUser = (index: number, isChecked: boolean) => {
    setQuotation((prev) => {
      const updatedDetails = [...prev.quotation_details]
      const elementIndex = updatedDetails.findIndex((item) => item.index === index)

      if (elementIndex !== -1) {
        updatedDetails[elementIndex].is_user = isChecked ? 1 : 0

        if (isChecked) {
          updatedDetails[elementIndex].margin = 0
          updatedDetails[elementIndex].unit_price = 0
        }
      }

      return {
        ...prev,
        quotation_details: updatedDetails,
      }
    })
  }

  const handleMarginType = (index: number, isChecked: boolean) => {
    setQuotation((prev) => {
      const updatedDetails = [...prev.quotation_details]
      const elementIndex = updatedDetails.findIndex((item) => item.index === index)
      if (elementIndex !== -1) {
        updatedDetails[elementIndex].margin_type = isChecked ? 1 : 2
      }
      return {
        ...prev,
        quotation_details: updatedDetails,
      }
    })
  }

  const handleChangeQuotationDetails = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    item_type: number,
    work_step?: number
  ) => {
    setQuotation((prev) => {
      const updatedDetails = prev.quotation_details.map((detail) => {
        if (detail.index === index && detail.type === item_type) {
          return {
            ...detail,
            [e.target.name]: e.target.value,
            ...(work_step ? {work_step} : {}),
          }
        }
        return detail
      })

      return {
        ...prev,
        quotation_details: updatedDetails,
      }
    })
  }

  const validateQtyInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    item_type: number,
    work_step?: number
  ) => {
    const value = e.target.value

    const regex = /^[0-9]*(\.[0-9]{1})?$/

    if (!regex.test(value)) {
      const roundedValue = parseFloat(value).toFixed(1)

      Swal.fire({
        icon: 'warning',
        title: 'Input tidak valid',
        text: 'QTY hanya boleh memiliki satu angka di belakang koma. Nilai telah dibulatkan.',
        confirmButtonText: 'OK',
      })

      e.target.value = roundedValue
      handleChangeQuotationDetails(e, index, item_type, work_step)
    } else {
      handleChangeQuotationDetails(e, index, item_type, work_step)
    }
  }

  const calculateEachDetail = (isNominal: number, index: number) => {
    setQuotation((prev) => {
      const updatedDetails = prev.quotation_details.map((detail) => {
        if (detail.index === index) {
          const {quantity, unit_price, margin, is_user} = detail

          const total = Number(quantity) * Number(unit_price)
          const final_price =
            is_user === 1
              ? 0
              : isNominal === 1
              ? total + total * (Number(margin) / 100)
              : total + Number(margin)

          return {
            ...detail,
            total,
            final_price,
          }
        }
        return detail
      })

      return {
        ...prev,
        quotation_details: updatedDetails,
      }
    })
  }

  const calculateTotalMaterials = () => {
    const materialDetails = quotation.quotation_details.filter((detail) => detail.type === 1)
    const total = materialDetails.reduce(
      (accumulator, detail) => accumulator + detail.final_price,
      0
    )
    setTotalMaterial(total)
  }

  const calculateTotalDetails = () => {
    const total = quotation.quotation_details.reduce((accumulator, detail) => {
      if (detail.type === 1 || detail.type === 2) {
        return accumulator + detail.final_price
      }
      return accumulator
    }, 0)
    setTotalJasaMaterial(total)
  }

  // Payment Stage
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

  const calculatedGrandTotalQuotation = () => {
    const grandTotal = Number(totalJasaMaterial)
    const roundedValue = Math.ceil(grandTotal / 100) * 100
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    })

    setQuotation((prev) => ({
      ...prev,
      quotation_grand_total: grandTotal,
    }))
    setGrandTotalRounded(formatter.format(roundedValue))
    setGrandTotalDiff(roundedValue - grandTotal)
    calculatePaymentStages(grandTotal)
  }

  useEffect(() => {
    calculateTotalMaterials()
    calculateTotalDetails()
    calculatedGrandTotalQuotation()
    // eslint-disable-next-line
  }, [quotation.quotation_details, quotation.quotation_details.length, totalJasaMaterial])

  // Quotation Validation
  const QuotationValidation = () => {
    let valid = true

    if (!workOrderDetail) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong pilih Order ID',
        icon: 'warning',
      })
      valid = false
    } else if (!quotation.quotation_date) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi tanggal quotation',
        icon: 'warning',
      })
      valid = false
    }

    const validateDetail = (
      detail: Quotation['quotation_details'][number],
      rowNumber: number,
      typeName: string
    ): boolean => {
      if (!detail.item_name || detail.item_name.trim() === '') {
        Swal.fire({
          title: 'Warning',
          text: `Tolong isi "${typeName}" pada baris ke-${rowNumber}.`,
          icon: 'warning',
        })
        return false
      }

      if (!detail.unit || detail.unit.trim() === '') {
        Swal.fire({
          title: 'Warning',
          text: `Tolong isi kolom "Satuan" pada "${typeName}" pada baris ke-${rowNumber}.`,
          icon: 'warning',
        })
        return false
      }

      if (detail.quantity === null || detail.quantity === '') {
        Swal.fire({
          title: 'Warning',
          text: `Tolong isi kolom "QTY" (Quantity) pada baris ke-${rowNumber}.`,
          icon: 'warning',
        })
        return false
      }

      if (detail.margin === null || detail.margin === '') {
        Swal.fire({
          title: 'Warning',
          text: `Tolong isi kolom "Profit" pada baris ke-${rowNumber}.`,
          icon: 'warning',
        })
        return false
      }

      if (detail.unit_price === null || detail.unit_price === '') {
        Swal.fire({
          title: 'Warning',
          text: `Tolong isi kolom "Price" pada baris ke-${rowNumber}.`,
          icon: 'warning',
        })
        return false
      }
      return true
    }

    const materialDetails = quotation.quotation_details.filter((x) => x.type === 1)
    for (let i = 0; i < materialDetails.length; i++) {
      if (!validateDetail(materialDetails[i], i + 1, 'Material Yang Dibutuhkan')) {
        return false
      }
    }

    const serviceDetails = quotation.quotation_details.filter((x) => x.type === 2)
    for (let i = 0; i < serviceDetails.length; i++) {
      if (!validateDetail(serviceDetails[i], i + 1, 'Jenis Jasa')) {
        return false
      }
    }

    // else if (quotation.quotation_grand_total >= 20000000 && quotation.quotation_special === 0) {
    //   Swal.fire({
    //     title: 'Warning',
    //     text: 'Tolong gunakan tipe quotation spesial',
    //     icon: 'warning',
    //   })
    //   valid = false
    // }
    return valid
  }

  // Handle Submit Quotation
  const handleSubmitNewQuotation = async () => {
    if (QuotationValidation()) {
      setIsLoading(true)
      const formData = new FormData()

      formData.append('order_id', workOrderDetail?.order?.id)
      formData.append('store_id', workOrderDetail?.order?.store?.id)
      formData.append('quotation_number', quotation.id?.toString() ?? '')
      formData.append('quotation_status', quotation.quotation_status?.toString() ?? '')
      formData.append('quotation_special', quotation.quotation_special?.toString() ?? '')
      formData.append('description', quotation.description)
      formData.append('quotation_date', quotation.quotation_date)
      formData.append(
        'quotation_validity',
        formatForFormData(new Date(quotation.quotation_validity))
      )

      const appendIfNotDefault = (formData: any, key: any, value: any) => {
        if (value !== null && value !== undefined && value !== '' && value !== 0) {
          formData.append(key, String(value))
        }
      }

      quotation.quotation_details.forEach((quotation, index) => {
        appendIfNotDefault(formData, `quotation_details[${index}][item_id]`, quotation.item_id)
        appendIfNotDefault(
          formData,
          `quotation_details[${index}][work_order_item_id]`,
          quotation.work_order_item_id
        )

        appendIfNotDefault(formData, `quotation_details[${index}][name]`, quotation.item_name)
        appendIfNotDefault(formData, `quotation_details[${index}][unit]`, quotation.unit)
        appendIfNotDefault(formData, `quotation_details[${index}][work_step]`, quotation.work_step)

        formData.append(`quotation_details[${index}][margin]`, String(quotation?.margin ?? 0))
        formData.append(`quotation_details[${index}][price]`, String(quotation?.unit_price ?? 0))
        formData.append(`quotation_details[${index}][quantity]`, String(quotation?.quantity ?? 0))

        if (quotation.item_name !== '') {
          appendIfNotDefault(formData, `quotation_details[${index}][type]`, quotation.type)
          formData.append(`quotation_details[${index}][margin_type]`, String(quotation.margin_type))
          formData.append(`quotation_details[${index}][is_customer]`, String(quotation.is_user))
        }
      })

      await axios
        .post(`${apiUrl}/quotation`, formData, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })
        .then((response) => {
          if (response.data.status === 200 || response.data.status === 201) {
            Swal.fire({
              title: 'Success',
              text: 'Berhasil menambahkan quotation',
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

          navigate('/quotation/view-quotation')
        })
        .catch((error) => {
          console.error(error)
          setIsLoading(false)

          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
          })
        })
    }
  }

  const handleCancelQuotation = () => {
    navigate('/quotation/view-quotation')
  }

  return (
    <section id='quotation-vendor'>
      <Card className='card-quotation'>
        <Card.Body className='content-quotation'>
          <Row className='mb-4'>
            <Col
              xs={{order: 'last'}}
              xxl={6}
              className='vendor-information order-1 order-xxl-1 order-xl-2 order-lg-2 order-md-2 order-sm-2 mb-3'
            >
              <div className='vendor-detail'>
                <Form.Group>
                  <Form.Label className='fs-5 fw-semibold'>Nama Toko :</Form.Label>

                  <Col>
                    <Form.Label className='fs-3 fw-bold'>
                      {workOrderDetail?.order?.store?.store_name}
                    </Form.Label>
                  </Col>
                </Form.Group>

                <Form.Group>
                  <Form.Label className='fs-5 fw-bold'>
                    {workOrderDetail?.order?.store?.address}
                  </Form.Label>

                  <Col>
                    <Form.Label className='fs-5 fw-bold'>
                      {workOrderDetail?.order?.store?.phone_number_1
                        ? `Telp : ${
                            workOrderDetail?.order?.store?.phone_number_1 ??
                            workOrderDetail?.order?.store?.phone_number_2 ??
                            'Nomor Telepon tidak tersedia'
                          }`
                        : ''}
                    </Form.Label>
                  </Col>
                </Form.Group>
              </div>
            </Col>

            <Col
              xs={{order: 'first'}}
              xxl={6}
              className='payment-request order-2 order-xxl-2 order-xl-1 order-lg-1 order-md-1 order-sm-1 mb-3'
            >
              <h1 className='fw-bolder'>QUOTATION</h1>

              <Form.Group as={Row} className='mb-4'>
                <Form.Label className='fs-5 fw-bold' column sm='4'>
                  Status :
                </Form.Label>

                <Col sm='8'>
                  <Form.Control
                    readOnly
                    plaintext
                    className='fs-2 fw-bold text-black'
                    type='text'
                    value={workOrderDetail?.work_order_status[0]?.status?.description}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-4'>
                <Form.Label className='fs-5 fw-bold' column sm='4'>
                  Tanggal :
                </Form.Label>

                <Col sm='8'>
                  <Form.Control
                    name='quotation_date'
                    type='date'
                    min={today}
                    required
                    onChange={(e) => handleChangeQuotation(e as ChangeEvent<HTMLInputElement>)}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-4'>
                <Form.Label className='fs-5 fw-bold' column sm='4'>
                  Order ID :
                </Form.Label>

                <Col sm='8'>
                  <Select
                    name='order-id'
                    className='form-control p-0'
                    placeholder='Ketik/Pilih Order Id'
                    isSearchable={true}
                    options={workOrder}
                    onChange={(e) => handleSelectWorkOrder(e)}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-4'>
                <Form.Label className='fs-5 fw-bold' column sm='4'>
                  Quotation ID :
                </Form.Label>

                <Col sm='8'>
                  <Form.Control type='number' value={quotation.id ? quotation.id : ''} readOnly />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-4'>
                <Form.Label className='fs-5 fw-bold' column sm='4'>
                  Costumer ID :
                </Form.Label>

                <Col sm='8'>
                  <Form.Control
                    type='number'
                    readOnly
                    value={workOrderDetail?.order?.members?.member_number}
                  />
                </Col>
              </Form.Group>

              {/* <Form.Group as={Row} className='mb-4'>
                <Form.Label className='fs-5 fw-bold' column sm='4'>
                  Quotation Valid Until :
                </Form.Label>

                <Col sm='8'>
                  <Form.Control
                    type='text'
                    min={today}
                    value={formatDate(new Date(quotation.quotation_validity))}
                    plaintext
                    readOnly
                  />
                </Col>
              </Form.Group> */}
            </Col>
          </Row>

          <Row className='mb-5'>
            <Col xxl={6}>
              <div className='receiver-information mb-3'>
                <div className='receiver-detail'>
                  <h1 className='fs-5 fw-semibold'>Ditunjukkan kepada :</h1>
                  <h1 className='fs-3 fw-bold mt-2'>{workOrderDetail?.order?.members.full_name}</h1>
                </div>

                <div className='address'>
                  <h3 className='fw-normal'>{workOrderDetail?.order?.project_address}</h3>
                  <h3 className='fw-normal'>
                    {workOrderDetail?.order?.project_number
                      ? `Telp : ${workOrderDetail?.order?.project_number}`
                      : ''}
                  </h3>
                </div>
              </div>
            </Col>

            <Col xxl={6}>
              <div className='payment-request'>
                <Form.Group>
                  <Form.Label className='fs-5 fw-bold'>Instruksi Spesial</Form.Label>
                  <Form.Control
                    style={{minHeight: '140px'}}
                    as='textarea'
                    name='description'
                    onChange={(e) => handleChangeQuotation(e as ChangeEvent<HTMLInputElement>)}
                  />
                </Form.Group>
              </div>
            </Col>
          </Row>

          <hr />

          <Row>
            <Col>
              <Form.Check
                id='quotation-type'
                type='checkbox'
                label='Tipe Quotation Spesial'
                className='mb-5'
                checked={quotation.quotation_special === 1}
                onChange={(e) => handleChangeQuotationType(e.target.checked)}
              />
              <Form.Text className='fs-7 text-black'>Catatan : </Form.Text>
              <br></br>
              <Form.Text className='fs-7 text-black'>
                *Quotation spesial merupakan quotation yang nominalnya diatas 20.000.000
              </Form.Text>
              <br></br>
              <Form.Text className='fs-7 text-danger'>
                *Ceklis checkbox diatas untuk mengaktifkan quotation spesial
              </Form.Text>
              <br></br>
              <Form.Text className='fs-7 text-danger'>
                *Harap masukkan angka tanpa tanda koma (,) sebagai pengganti gunakan tanda titik
                (.).
              </Form.Text>
            </Col>
          </Row>

          {quotation.quotation_special === 0 && (
            <>
              <hr />

              <div className='item-jasa'>
                <h4 className='fs-4 fw-semibold mb-5'>Item Jasa Pemasangan</h4>

                {quotation.quotation_details
                  .filter((x) => x.type === 2)
                  .map((element, index) => (
                    <Card key={`${element.index}-service`} className='card-item-jasa mb-5'>
                      <div className='d-flex border-rounded-3'>
                        <Card.Body>
                          <Row>
                            <Col xxl={4} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Jenis Jasa</Form.Label>
                                <Form.Control
                                  id={`item-name-${index}`}
                                  name='item_name'
                                  type='text'
                                  value={element.item_name}
                                  onChange={(e) =>
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2
                                    )
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={2} xl={2} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>QTY</Form.Label>
                                <Form.Control
                                  id={`quantity-${index}`}
                                  name='quantity'
                                  type='number'
                                  value={element.quantity}
                                  onKeyDown={(e) => {
                                    if (e.key === ',') {
                                      e.preventDefault()
                                    }
                                  }}
                                  onChange={(e) => {
                                    validateQtyInput(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2
                                    )
                                    calculateEachDetail(element.margin_type, element.index)
                                  }}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Price</Form.Label>
                                <Form.Control
                                  id={`unit-price-${index}`}
                                  type='number'
                                  name='unit_price'
                                  value={element.unit_price}
                                  onKeyDown={(e) => {
                                    if (e.key === ',') {
                                      e.preventDefault()
                                    }
                                  }}
                                  onChange={(e) => {
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2
                                    )
                                    calculateEachDetail(element.margin_type, element.index)
                                  }}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Total</Form.Label>
                                <Form.Control
                                  readOnly
                                  plaintext
                                  value={`Rp. ${(
                                    Number(element.quantity) * Number(element.unit_price)
                                  ).toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col xxl={6} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Satuan</Form.Label>

                                <Form.Control
                                  id={`satuan-${index}`}
                                  name='unit'
                                  value={element.unit}
                                  onChange={(e) => {
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2
                                    )
                                  }}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Profit</Form.Label>

                                <Form.Control
                                  id={`margin-${index}`}
                                  type='number'
                                  name='margin'
                                  value={element.margin}
                                  onKeyDown={(e) => {
                                    if (e.key === ',') {
                                      e.preventDefault()
                                    }
                                  }}
                                  onChange={(e) => {
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2
                                    )
                                    calculateEachDetail(element.margin_type, element.index)
                                  }}
                                />

                                <div className='d-flex flex-inline mt-2'>
                                  <div className='me-1'>
                                    <Form.Check
                                      id={`margin-type-${index}`}
                                      type='checkbox'
                                      checked={element.margin_type === 1}
                                      onChange={(e) => {
                                        handleMarginType(element.index, e.target.checked)
                                        calculateEachDetail(element.margin_type, element.index)
                                      }}
                                    />
                                  </div>

                                  <div className='ms-1'>Persen</div>
                                </div>
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Final Price</Form.Label>

                                <Form.Control
                                  readOnly
                                  plaintext
                                  value={`Rp. ${element.final_price.toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>

                        <div className='d-flex flex-column align-items-center justify-content-between border-start p-2'>
                          <Button
                            className='button-transparent text-danger'
                            variant='primary'
                            onClick={() => handleRemoveQuotationDetailForm(element.index)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                <Button
                  className='add-jasa'
                  variant='button-dark-success'
                  onClick={() => addQuotationDetail(2)}
                >
                  Tambah Jasa
                </Button>
              </div>
            </>
          )}

          {quotation.quotation_special === 1 && (
            <>
              <hr />

              <div className='item-jasa'>
                <h4 className='fs-4 fw-bold mb-5'>Item Jasa Pemasangan Tahap 1</h4>

                {quotation.quotation_details
                  .filter((x) => x.type === 2 && x.work_step === 1)
                  .map((element, index) => (
                    <Card key={`${element.index}-service`} className='card-item-jasa mb-5'>
                      <div className='d-flex border-rounded-3'>
                        <Card.Body>
                          <Row>
                            <Col xxl={4} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Jenis Jasa</Form.Label>
                                <Form.Control
                                  id={`item-name-${index}`}
                                  name='item_name'
                                  type='text'
                                  value={element.item_name}
                                  onChange={(e) =>
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2,
                                      1
                                    )
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={2} xl={2} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>QTY</Form.Label>
                                <Form.Control
                                  id={`quantity-${index}`}
                                  name='quantity'
                                  type='number'
                                  value={element.quantity}
                                  onKeyDown={(e) => {
                                    if (e.key === ',') {
                                      e.preventDefault()
                                    }
                                  }}
                                  onChange={(e) => {
                                    validateQtyInput(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2,
                                      1
                                    )
                                    calculateEachDetail(element.margin_type, element.index)
                                  }}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Price</Form.Label>
                                <Form.Control
                                  id={`unit-price-${index}`}
                                  type='number'
                                  name='unit_price'
                                  value={element.unit_price}
                                  onKeyDown={(e) => {
                                    if (e.key === ',') {
                                      e.preventDefault()
                                    }
                                  }}
                                  onChange={(e) => {
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2,
                                      1
                                    )
                                    calculateEachDetail(element.margin_type, element.index)
                                  }}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Total</Form.Label>
                                <Form.Control
                                  readOnly
                                  plaintext
                                  value={`Rp. ${(
                                    Number(element.quantity) * Number(element.unit_price)
                                  ).toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col xxl={6} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Satuan</Form.Label>

                                <Form.Control
                                  id={`satuan-${index}`}
                                  name='unit'
                                  value={element.unit}
                                  onChange={(e) => {
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2,
                                      1
                                    )
                                  }}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Profit</Form.Label>

                                <Form.Control
                                  id={`margin-${index}`}
                                  type='number'
                                  name='margin'
                                  value={element.margin}
                                  onKeyDown={(e) => {
                                    if (e.key === ',') {
                                      e.preventDefault()
                                    }
                                  }}
                                  onChange={(e) => {
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2,
                                      1
                                    )
                                    calculateEachDetail(element.margin_type, element.index)
                                  }}
                                />

                                <div className='d-flex flex-inline mt-2'>
                                  <div className='me-1'>
                                    <Form.Check
                                      id={`margin-type-${index}`}
                                      type='checkbox'
                                      checked={element.margin_type === 1}
                                      onChange={(e) => {
                                        handleMarginType(element.index, e.target.checked)
                                        calculateEachDetail(element.margin_type, element.index)
                                      }}
                                    />
                                  </div>

                                  <div className='ms-1'>Persen</div>
                                </div>
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Final Price</Form.Label>

                                <Form.Control
                                  readOnly
                                  plaintext
                                  value={`Rp. ${element.final_price.toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>

                        <div className='d-flex flex-column align-items-center justify-content-between border-start p-2'>
                          <Button
                            className='button-transparent text-danger'
                            variant='primary'
                            onClick={() => handleRemoveQuotationDetailForm(element.index)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                <Button
                  className='add-jasa'
                  variant='button-dark-success'
                  onClick={() => addQuotationDetail(2, 1)}
                >
                  Tambah Jasa
                </Button>
              </div>

              <hr />

              <div className='item-jasa'>
                <h4 className='fs-4 fw-bold mb-5'>Item Jasa Pemasangan Tahap 2</h4>

                {quotation.quotation_details
                  .filter((x) => x.type === 2 && x.work_step === 2)
                  .map((element, index) => (
                    <Card key={`${element.index}-service`} className='card-item-jasa mb-5'>
                      <div className='d-flex border-rounded-3'>
                        <Card.Body>
                          <Row>
                            <Col xxl={4} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Jenis Jasa</Form.Label>
                                <Form.Control
                                  id={`item-name-${index}`}
                                  name='item_name'
                                  type='text'
                                  value={element.item_name}
                                  onChange={(e) =>
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2,
                                      2
                                    )
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={2} xl={2} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>QTY</Form.Label>
                                <Form.Control
                                  id={`quantity-${index}`}
                                  name='quantity'
                                  type='number'
                                  value={element.quantity}
                                  onKeyDown={(e) => {
                                    if (e.key === ',') {
                                      e.preventDefault()
                                    }
                                  }}
                                  onChange={(e) => {
                                    validateQtyInput(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2,
                                      2
                                    )
                                    calculateEachDetail(element.margin_type, element.index)
                                  }}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Price</Form.Label>
                                <Form.Control
                                  id={`unit-price-${index}`}
                                  type='number'
                                  name='unit_price'
                                  value={element.unit_price}
                                  onKeyDown={(e) => {
                                    if (e.key === ',') {
                                      e.preventDefault()
                                    }
                                  }}
                                  onChange={(e) => {
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2,
                                      2
                                    )
                                    calculateEachDetail(element.margin_type, element.index)
                                  }}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Total</Form.Label>
                                <Form.Control
                                  readOnly
                                  plaintext
                                  value={`Rp. ${(
                                    Number(element.quantity) * Number(element.unit_price)
                                  ).toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col xxl={6} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Satuan</Form.Label>

                                <Form.Control
                                  id={`satuan-${index}`}
                                  name='unit'
                                  value={element.unit}
                                  onChange={(e) => {
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2,
                                      2
                                    )
                                  }}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Profit</Form.Label>

                                <Form.Control
                                  id={`margin-${index}`}
                                  type='number'
                                  name='margin'
                                  value={element.margin}
                                  onKeyDown={(e) => {
                                    if (e.key === ',') {
                                      e.preventDefault()
                                    }
                                  }}
                                  onChange={(e) => {
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2,
                                      2
                                    )
                                    calculateEachDetail(element.margin_type, element.index)
                                  }}
                                />

                                <div className='d-flex flex-inline mt-2'>
                                  <div className='me-1'>
                                    <Form.Check
                                      id={`margin-type-${index}`}
                                      type='checkbox'
                                      checked={element.margin_type === 1}
                                      onChange={(e) => {
                                        handleMarginType(element.index, e.target.checked)
                                        calculateEachDetail(element.margin_type, element.index)
                                      }}
                                    />
                                  </div>

                                  <div className='ms-1'>Persen</div>
                                </div>
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Final Price</Form.Label>

                                <Form.Control
                                  readOnly
                                  plaintext
                                  value={`Rp. ${element.final_price.toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>

                        <div className='d-flex flex-column align-items-center justify-content-between border-start p-2'>
                          <Button
                            className='button-transparent text-danger'
                            variant='primary'
                            onClick={() => handleRemoveQuotationDetailForm(element.index)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                <Button
                  className='add-jasa'
                  variant='button-dark-success'
                  onClick={() => addQuotationDetail(2, 2)}
                >
                  Tambah Jasa
                </Button>
              </div>

              <hr />

              <div className='item-jasa'>
                <h4 className='fs-4 fw-bold mb-5'>Item Jasa Pemasangan Tahap 3</h4>

                {quotation.quotation_details
                  .filter((x) => x.type === 2 && x.work_step === 3)
                  .map((element, index) => (
                    <Card key={`${element.index}-service`} className='card-item-jasa mb-5'>
                      <div className='d-flex border-rounded-3'>
                        <Card.Body>
                          <Row>
                            <Col xxl={4} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Jenis Jasa</Form.Label>
                                <Form.Control
                                  id={`item-name-${index}`}
                                  name='item_name'
                                  type='text'
                                  value={element.item_name}
                                  onChange={(e) =>
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2,
                                      3
                                    )
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={2} xl={2} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>QTY</Form.Label>
                                <Form.Control
                                  id={`quantity-${index}`}
                                  name='quantity'
                                  type='number'
                                  value={element.quantity}
                                  onKeyDown={(e) => {
                                    if (e.key === ',') {
                                      e.preventDefault()
                                    }
                                  }}
                                  onChange={(e) => {
                                    validateQtyInput(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2,
                                      3
                                    )
                                    calculateEachDetail(element.margin_type, element.index)
                                  }}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Price</Form.Label>
                                <Form.Control
                                  id={`unit-price-${index}`}
                                  type='number'
                                  name='unit_price'
                                  value={element.unit_price}
                                  onKeyDown={(e) => {
                                    if (e.key === ',') {
                                      e.preventDefault()
                                    }
                                  }}
                                  onChange={(e) => {
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2,
                                      3
                                    )
                                    calculateEachDetail(element.margin_type, element.index)
                                  }}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Total</Form.Label>
                                <Form.Control
                                  readOnly
                                  plaintext
                                  value={`Rp. ${(
                                    Number(element.quantity) * Number(element.unit_price)
                                  ).toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col xxl={6} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Satuan</Form.Label>

                                <Form.Control
                                  id={`satuan-${index}`}
                                  name='unit'
                                  value={element.unit}
                                  onChange={(e) => {
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2,
                                      3
                                    )
                                  }}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Profit</Form.Label>

                                <Form.Control
                                  id={`margin-${index}`}
                                  type='number'
                                  name='margin'
                                  value={element.margin}
                                  onKeyDown={(e) => {
                                    if (e.key === ',') {
                                      e.preventDefault()
                                    }
                                  }}
                                  onChange={(e) => {
                                    handleChangeQuotationDetails(
                                      e as ChangeEvent<HTMLInputElement>,
                                      element.index,
                                      2,
                                      3
                                    )
                                    calculateEachDetail(element.margin_type, element.index)
                                  }}
                                />

                                <div className='d-flex flex-inline mt-2'>
                                  <div className='me-1'>
                                    <Form.Check
                                      id={`margin-type-${index}`}
                                      type='checkbox'
                                      checked={element.margin_type === 1}
                                      onChange={(e) => {
                                        handleMarginType(element.index, e.target.checked)
                                        calculateEachDetail(element.margin_type, element.index)
                                      }}
                                    />
                                  </div>

                                  <div className='ms-1'>Persen</div>
                                </div>
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Final Price</Form.Label>

                                <Form.Control
                                  readOnly
                                  plaintext
                                  value={`Rp. ${element.final_price.toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>

                        <div className='d-flex flex-column align-items-center justify-content-between border-start p-2'>
                          <Button
                            className='button-transparent text-danger'
                            variant='primary'
                            onClick={() => handleRemoveQuotationDetailForm(element.index)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                <Button
                  className='add-jasa'
                  variant='button-dark-success'
                  onClick={() => addQuotationDetail(2, 3)}
                >
                  Tambah Jasa
                </Button>
              </div>
            </>
          )}

          <hr />

          <div className='item-material'>
            <h4 className='fs-4 fw-semibold mb-5'>Item Material</h4>

            {quotation.quotation_details
              .filter((x) => x.type === 1)
              .map((element, index) => (
                <Card key={`${element.index}-material`} className='card-item-material mb-5'>
                  <div className='d-flex border-rounded-3'>
                    <div className='d-flex flex-column align-items-center justify-content-between border-end p-2'>
                      <Form.Check
                        id={`is-user-${index}`}
                        type='checkbox'
                        className='mt-2'
                        checked={element.is_user === 1}
                        onChange={(e) => handleIsUser(element.index, e.target.checked)}
                      />
                    </div>

                    <Card.Body>
                      <Row>
                        <Col xxl={4} xl={6} lg={12} md={12} sm={12}>
                          <Form.Group className='mb-3'>
                            <Form.Label className='fs-5 fw-bold'>
                              Material Yang Dibutuhkan
                            </Form.Label>

                            <Form.Control
                              id={`item-name-${index}`}
                              name='item_name'
                              value={element.item_name}
                              disabled={element.is_user === 1 ? true : false}
                              onChange={(e) =>
                                handleChangeQuotationDetails(
                                  e as ChangeEvent<HTMLInputElement>,
                                  element.index,
                                  1
                                )
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col xxl={2} xl={2} lg={12} md={12} sm={12}>
                          <Form.Group className='mb-3'>
                            <Form.Label className='fs-5 fw-bold'>QTY</Form.Label>
                            <Form.Control
                              id={`quantity-${index}`}
                              name='quantity'
                              value={element.quantity}
                              disabled={element.is_user === 1 ? true : false}
                              onKeyDown={(e) => {
                                if (e.key === ',') {
                                  e.preventDefault()
                                }
                              }}
                              onChange={(e) => {
                                validateQtyInput(
                                  e as ChangeEvent<HTMLInputElement>,
                                  element.index,
                                  1
                                )
                                calculateEachDetail(element.margin_type, element.index)
                              }}
                            />
                          </Form.Group>
                        </Col>

                        <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                          <Form.Group className='mb-3'>
                            <Form.Label className='fs-5 fw-bold'>Price</Form.Label>
                            <Form.Control
                              id={`unit-price-${index}`}
                              type='number'
                              name='unit_price'
                              value={element.unit_price}
                              disabled={element.is_user === 1 ? true : false}
                              onKeyDown={(e) => {
                                if (e.key === ',') {
                                  e.preventDefault()
                                }
                              }}
                              onChange={(e) => {
                                handleChangeQuotationDetails(
                                  e as ChangeEvent<HTMLInputElement>,
                                  element.index,
                                  1
                                )
                                calculateEachDetail(element.margin_type, element.index)
                              }}
                            />
                          </Form.Group>
                        </Col>

                        <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                          <Form.Group className='mb-3'>
                            <Form.Label className='fs-5 fw-bold'>Total</Form.Label>
                            <Form.Control
                              readOnly
                              plaintext
                              value={`Rp. ${(
                                Number(element.quantity) * Number(element.unit_price)
                              ).toLocaleString('id')}`}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col xxl={6} xl={6} lg={12} md={12} sm={12}>
                          <Form.Group className='mb-3'>
                            <Form.Label className='fs-5 fw-bold'>Satuan</Form.Label>

                            <Form.Control
                              id={`satuan-${index}`}
                              name='unit'
                              value={element.unit}
                              disabled={element.is_user === 1 ? true : false}
                              onChange={(e) =>
                                handleChangeQuotationDetails(
                                  e as ChangeEvent<HTMLInputElement>,
                                  element.index,
                                  1
                                )
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                          <Form.Group className='mb-3'>
                            <Form.Label className='fs-5 fw-bold'>Profit</Form.Label>

                            <Form.Control
                              id={`margin-${index}`}
                              type='number'
                              name='margin'
                              value={element.margin}
                              disabled={element.is_user === 1 ? true : false}
                              onKeyDown={(e) => {
                                if (e.key === ',') {
                                  e.preventDefault()
                                }
                              }}
                              onChange={(e) => {
                                handleChangeQuotationDetails(
                                  e as ChangeEvent<HTMLInputElement>,
                                  element.index,
                                  1
                                )
                                calculateEachDetail(element.margin_type, element.index)
                              }}
                            />

                            <div className='d-flex flex-inline mt-2'>
                              <div className='me-1'>
                                <Form.Check
                                  id={`margin-type-${index}`}
                                  type='checkbox'
                                  checked={element.margin_type === 1}
                                  disabled={element.is_user === 1 ? true : false}
                                  onChange={(e) => {
                                    handleMarginType(element.index, e.target.checked)
                                    calculateEachDetail(element.margin_type, element.index)
                                  }}
                                />
                              </div>

                              <div className='ms-1'>Persen</div>
                            </div>
                          </Form.Group>
                        </Col>

                        <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                          <Form.Group className='mb-3'>
                            <Form.Label className='fs-5 fw-bold'>Final Price</Form.Label>

                            <Form.Control
                              readOnly
                              plaintext
                              value={`Rp. ${element.final_price.toLocaleString('id')}`}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>

                    <div className='d-flex flex-column align-items-center justify-content-between border-start p-2'>
                      <Button
                        className='button-transparent text-danger'
                        variant='primary'
                        onClick={() => handleRemoveQuotationDetailForm(element.index)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

            <h4 className='fs-8 fw-normal text-danger'>
              *Jika <span className='fw-bolder text-decoration-underline'>Material</span> diceklis,
              maka material tersebut disediakan oleh customer
            </h4>

            <Button
              className='add-material'
              variant='button-warning'
              onClick={() => addQuotationDetail(1)}
            >
              Tambah Material
            </Button>
          </div>

          {quotation.quotation_special === 1 && (
            <>
              <hr />

              <div className='title fs-6 mb-2'>Preview Pembayaran</div>

              <Table bordered responsive>
                <thead>
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
              </Table>
            </>
          )}

          <hr />

          <div className='item-total'>
            <table className='table table-borderless '>
              <tr>
                <td align='right'>
                  <div className='fs-6 fw-bold'>Total Material :</div>
                </td>

                <td className='total-content'>
                  <div className='fs-6 fw-semibold'>{`Rp. ${totalMaterial.toLocaleString(
                    'id'
                  )}`}</div>
                </td>
              </tr>

              <tr>
                <td align='right'>
                  <div className='fs-6 fw-bold'>Total Jasa & Material :</div>
                </td>

                <td className='total-content'>
                  <div className='fs-6 fw-semibold'>{`Rp. ${totalJasaMaterial.toLocaleString(
                    'id'
                  )}`}</div>
                </td>
              </tr>

              <tr>
                <td align='right'>
                  <div className='fs-6 fw-bold'>Grand Total :</div>
                </td>

                <td className='total-content'>
                  <div className='fs-6 fw-semibold'>{`Rp. ${quotation.quotation_grand_total.toLocaleString(
                    'id'
                  )}`}</div>
                </td>
              </tr>

              <tr>
                <td align='right'>
                  <div className='fs-6 fw-bold'>
                    Grand Total{' '}
                    <span className='dark-success'>{`+ Rp. ${grandTotalDiff} (Pembulatan) :`}</span>
                  </div>
                </td>

                <td className='total-content'>
                  <div className='fs-6 fw-semibold'>{grandTotalRounded}</div>
                </td>
              </tr>
            </table>
          </div>

          <div className='button-wrapper d-flex justify-content-center align-items-center mt-5'>
            <Button
              variant='dark-danger'
              className='d-flex justify-content-center align-items-center mb-2'
              type='submit'
              disabled={isLoading}
              onClick={handleCancelQuotation}
            >
              Cancel
            </Button>

            <Button
              variant='dark-primary'
              className='d-flex justify-content-center align-items-center mb-2'
              type='submit'
              disabled={isLoading}
              onClick={handleSubmitNewQuotation}
            >
              {isLoading ? 'Saving..' : 'Save'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </section>
  )
}

export {NewQuotationVendor}
