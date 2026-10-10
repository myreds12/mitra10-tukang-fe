import React, {FC, useState, useEffect, useRef} from 'react'
import {toAbsoluteUrl} from '../../../../../_metronic/helpers'

import './UpdateQuotation.css'

import dayjs from 'dayjs'
import axios from 'axios'
import Select from 'react-select'
import Swal from 'sweetalert2'
import {useNavigate, useParams} from 'react-router-dom'
import {Form, Table, Button, Row, Col, Card} from 'react-bootstrap'

interface Promotion {
  id: number
  name: string
  min_order: number
  promotion: number
  promotion_type: number
}

interface CategorySelect {
  value: number | null
  label: string
}

interface QuotationDetail {
  id: number | null
  index: string
  item_id: number | null
  work_order_item_id: number | null
  category_id: number | null
  category_name: string
  type: number
  item_name: string
  unit: string
  unit_price: number
  total: number
  final_price: number
  margin: number
  margin_type: number
  quantity: number
  is_user: number
  description: string
  work_step?: number
}

const UpdateQuotationHO: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const params = useParams()

  // Loading
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Order Id
  const [orderId, setOrderId] = useState<string>('')

  // Date Promotion
  const [startDate] = useState<string>(dayjs().startOf('month').format('YYYY-MM-DD'))
  const [endDate] = useState<string>(dayjs().endOf('month').format('YYYY-MM-DD'))

  // Add Quotation
  const [quotationData, setQuotationData] = useState<any>()
  const [quotationStatus, setQuotationStatus] = useState<any>()
  const [quotationNumber, setQuotationNumber] = useState<string | number>('NaN')
  const [quotationDescription, setQuotationDescription] = useState<string>('')
  const [quotationDate, setQuotationDate] = useState<string>('')
  const [quotationValidity, setQuotationValidity] = useState<any>()
  const [quotationSpecial, setQuotationSpecial] = useState<number>(0)

  const [totalMaterial, setTotalMaterial] = useState<number>(0)
  const [totalJasaMaterial, setTotalJasaMaterial] = useState<number>(0)

  const [promotionId, setPromotionId] = useState<any>(null)
  const [promotionName, setPromotionName] = useState<string>('')
  const [promosiDiscount, setPromosiDiscount] = useState<any>()
  const [additionalPromosi, setAdditionalPromosi] = useState<any>(0)

  const [grandTotalBeforePromotion, setGrandTotalBeforePromotion] = useState<any>(0)
  const [grandTotal, setGrandTotal] = useState<any>(0)
  const [grandTotalRounded, setGrandTotalRounded] = useState<any>(0)
  const [grandTotalDiff, setGrandTotalDiff] = useState<any>(0)

  const evidenceRef = useRef<HTMLInputElement>(null)

  // Quotation Detail
  const [quotationDetail, setQuotationDetail] = useState<QuotationDetail[]>([
    {
      id: null,
      index: Date.now().toString(),
      item_id: null,
      work_order_item_id: null,
      category_id: null,
      category_name: '',
      type: 1,
      item_name: '',
      unit: '',
      unit_price: 0,
      total: 0,
      final_price: 0,
      margin: 0,
      margin_type: 1,
      quantity: 0,
      is_user: 0,
      description: '',
    },
    {
      id: null,
      index: Date.now().toString(),
      item_id: null,
      category_id: null,
      category_name: '',
      work_order_item_id: null,
      type: 2,
      item_name: '',
      unit: '',
      unit_price: 0,
      total: 0,
      final_price: 0,
      margin: 0,
      margin_type: 1,
      quantity: 0,
      is_user: 0,
      description: '',
    },
  ])

  // Store
  const [storeId, setStoreId] = useState<string>('')

  // Category
  const [categories, setCategories] = useState<CategorySelect[]>([])

  // Promotion
  const [promotion, setPromotion] = useState<Promotion[]>([])

  const getQuotationData = async () => {
    try {
      await axios
        .get(`${apiUrl}/quotation/${params.id}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })
        .then((response) => {
          const data = response.data.data

          if (data) {
            setQuotationData(data)
            setOrderId(data.order_id)
            setOrder(data.order)
            setStoreId(data.store.id)
            setQuotationNumber(data.id)
            setQuotationDate(new Date(data.quotation_date).toISOString().split('T')[0])
            setQuotationValidity(
              data.quotation_validity
                ? new Date(data.quotation_validity).toISOString().split('T')[0]
                : ''
            )
            setQuotationDescription(data.description)
            setQuotationSpecial(data.quotation_special)
            setGrandTotalBeforePromotion(data?.quotation_no_promotion)
            setGrandTotal(data.quotation_grand_total)
          }

          if (data?.quotation_disc) {
            setPromosiDiscount(data.quotation_disc)
          }

          if (data?.promotion) {
            setPromotionId(data?.promotion?.id)
            setPromotionName(data?.promotion?.name)
            setAdditionalPromosi(data?.promotion?.promotion)
          }

          if (data?.quotation_details) {
            const workOrderItem = data.quotation_details.map((item: any, index: number) => ({
              id: item.id,
              index: (Date.now() + index).toString(),
              type: item.item_type,
              item_id: item.item_id,
              work_order_item_id: item.work_order_items_id,
              category_id: item.category_id,
              category_name: item?.category?.category_name,
              item_name: item?.name,
              unit: item?.unit,
              quantity: item?.quantity ?? 0,
              is_user: item.is_customer ? 1 : 0,
              unit_price: parseInt(item.price),
              final_price: parseInt(item.final_price),
              margin: parseInt(item.margin),
              margin_type: item?.margin_type ?? 1,
              work_step: item?.work_step ?? 0,
            }))

            setQuotationDetail(workOrderItem)
          }
        })
    } catch (err) {
      console.error(err)
    }
  }

  const getCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/categories`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempCategories = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.category_name,
        }))

        setCategories(tempCategories)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getPromotion = async () => {
    try {
      const response = await axios.get(`${apiUrl}/promotion?store_id=${storeId}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempPromotion = response.data.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          min_order: item.min_order,
          promotion: item.promotion,
          promotion_type: item.promotion_type,
          periodic_start: item.periodic_start,
          periodic_end: item.periodic_end,
        }))

        const filteredPromotion = tempPromotion.filter((item: any) => {
          const periodicStart = dayjs(item.periodic_start)
          const periodicEnd = dayjs(item.periodic_end)
          const today = dayjs(quotationData.created_at)

          return (
            (periodicStart.isBefore(today, 'day') || periodicStart.isSame(today, 'day')) &&
            (periodicEnd.isAfter(today, 'day') || periodicEnd.isSame(today, 'day'))
          )
        })

        setPromotion(filteredPromotion)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getQuotationData()
    getCategories()
  }, [])

  useEffect(() => {
    if (!storeId) return

    getPromotion()
  }, [storeId])

  // Format Date
  const formatDate = (date: any) => {
    if (isNaN(date.getTime())) {
      return '--/--/----'
    }

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatForFormData = (date: any) => {
    if (isNaN(date.getTime())) {
      return ''
    }

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()

    return `${year}-${month}-${day}`
  }

  // Quotation Status
  useEffect(() => {
    const storedStatus = localStorage.getItem('statusData')
    const statusData = storedStatus ? JSON.parse(storedStatus) : []

    const desiredStatus = statusData.find((status: any) => status.category === 'QUOTEOUT')
    const statusId = desiredStatus?.value

    setQuotationStatus(statusId)
  }, [quotationStatus])

  // Handle Change Quotation Description
  const handleInputQuotationDesc = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedInputValue = event.target.value
    setQuotationDescription(updatedInputValue)
  }

  // Handle Change Quotation Date
  const today = new Date().toISOString().split('T')[0]

  const handleChangeQuotationDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedQuotationDate = event.target.value
    const quotationDateObject = new Date(updatedQuotationDate)

    const days = 7
    const nextDays = new Date(quotationDateObject.getTime() + days * 24 * 60 * 60 * 1000)
    const parsedNextDays = new Date(nextDays)

    setQuotationDate(updatedQuotationDate)
    setQuotationValidity(parsedNextDays)
  }

  // Handle Checkbox Change
  let handleCheckboxChange = (index: any, isChecked: boolean) => {
    const updatedDetailValues = [...quotationDetail]
    const elementIndex = updatedDetailValues.findIndex((item) => item.index === index)

    if (elementIndex !== -1) {
      updatedDetailValues[elementIndex].is_user = isChecked ? 1 : 0
    }

    setQuotationDetail(updatedDetailValues)
  }

  // Handle Margin Type Change
  let handleMarginTypeChange = (index: any, isChecked: boolean) => {
    const updatedDetailValues = [...quotationDetail]
    const elementIndex = updatedDetailValues.findIndex((item) => item.index === index)

    if (elementIndex !== -1) {
      updatedDetailValues[elementIndex].margin_type = isChecked ? 2 : 1
    }

    setQuotationDetail(updatedDetailValues)
  }

  // Handle Category Change
  let handleCategoryChange = (index: any, value: any) => {
    const updatedDetailValues = [...quotationDetail]
    const elementIndex = updatedDetailValues.findIndex((item) => item.index === index)

    if (elementIndex !== -1) {
      updatedDetailValues[elementIndex].category_id = value.value
      updatedDetailValues[elementIndex].category_name = value.label
    }

    setQuotationDetail(updatedDetailValues)
  }

  // Total Material
  const calculateTotalMaterial = () => {
    const materialDetails = quotationDetail.filter((detail) => detail.type === 1)
    const total = materialDetails.reduce(
      (accumulator, detail) => accumulator + detail.final_price,
      0
    )
    setTotalMaterial(total)
  }

  // Total Material & Jasa
  const calculateTotalJasaMaterial = () => {
    let total = 0
    for (const detail of quotationDetail) {
      if (detail.type === 1 || detail.type === 2) {
        total += detail.final_price
      }
    }
    setTotalJasaMaterial(total)
  }

  // Promosi & Discount
  let handlePromosiChange = (value: any) => {
    const updatedPromosiValue = value
    setPromosiDiscount(updatedPromosiValue)
  }

  // Promosi & Discount
  let handleAddtionalPromosiChange = (value: any) => {
    const updatedPromosiValue = value
    setAdditionalPromosi(updatedPromosiValue)
  }

  // useEffect(() => {
  //   if (quotationData?.readiness === 1) {
  //     let promotionSurvey = 0
  //     const minimalGrandTotal = 500000

  //     if (grandTotalBeforePromotion >= minimalGrandTotal) {
  //       promotionSurvey = 99000
  //     }

  //     setPromosiDiscount(promotionSurvey)
  //   }
  // }, [grandTotalBeforePromotion])

  useEffect(() => {
    if ([1, 4].includes(quotationData?.readiness)) {
      let totalQuotation = grandTotalBeforePromotion
      let totalPromotion = 0
      let promotionId = null
      let promotionName = ''

      promotion.forEach((promo) => {
        if (Number(totalQuotation) >= Number(promo.min_order)) {
          if (promo.promotion_type === 2) {
            promotionId = promo.id
            promotionName = promo.name
            totalPromotion = promo.promotion
          } else if (promo.promotion_type === 1) {
            promotionId = promo.id
            promotionName = promo.name
            totalPromotion = (totalQuotation * promo.promotion) / 100
          }
        } else {
          promotionId = 0
        }
      })

      setPromotionId(promotionId)
      setPromotionName(promotionName)
      setAdditionalPromosi(totalPromotion)
    }
  }, [promotion, grandTotalBeforePromotion])

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

  // Grand Total
  const calculatedGrandTotal = () => {
    const grandTotal =
      Number(totalJasaMaterial) - Number(promosiDiscount) - Number(additionalPromosi ?? 0)

    const roundedValue = Math.ceil(grandTotal / 100) * 100

    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    })

    setGrandTotal(grandTotal)
    setGrandTotalRounded(formatter.format(roundedValue))
    setGrandTotalDiff(roundedValue - grandTotal)
    calculatePaymentStages(grandTotal)
  }

  useEffect(() => {
    calculateTotalMaterial()
    calculateTotalJasaMaterial()
    calculatedGrandTotal()
  }, [quotationDetail, totalJasaMaterial, promosiDiscount, additionalPromosi])

  // Quotation Validation
  const QuotationValidation = () => {
    let valid = true

    if (quotationDetail.filter((x) => x.type === 2).some((x) => x.category_id === null)) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi item kategori',
        icon: 'warning',
      })
      valid = false
    }
    return valid
  }

  // Handle Submit Quotation
  const handleUpdateQuotation = async (readiness: number) => {
    if (!QuotationValidation()) {
      setIsLoading(false)
      return false
    }

    setIsLoading(true)
    const formData = new FormData()
    const appendIfNotDefault = (formData: any, key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        formData.append(key, String(value))
      }
    }

    formData.append('order_id', orderId)
    formData.append('store_id', storeId)
    formData.append('quotation_number', quotationNumber.toString())
    formData.append('quotation_special', quotationSpecial.toString())
    formData.append('quotation_date', quotationDate)
    formData.append('quotation_validity', formatForFormData(new Date(quotationValidity)))
    formData.append('quotation_disc', promosiDiscount.toString())
    appendIfNotDefault(formData, 'description', quotationDescription)

    if (promotionId !== null) {
      formData.append('promotion_id', String(promotionId))
    }

    quotationDetail.forEach((quotation, index) => {
      appendIfNotDefault(formData, `quotation_details[${index}][id]`, quotation.id)
      appendIfNotDefault(formData, `quotation_details[${index}][item_id]`, quotation.item_id)
      appendIfNotDefault(formData, `quotation_details[${index}][type]`, quotation.type)
      appendIfNotDefault(formData, `quotation_details[${index}][name]`, quotation.item_name)
      appendIfNotDefault(formData, `quotation_details[${index}][unit]`, quotation.unit)
      appendIfNotDefault(formData, `quotation_details[${index}][work_step]`, quotation.work_step)

      formData.append(`quotation_details[${index}][quantity]`, String(quotation.quantity))
      formData.append(`quotation_details[${index}][price]`, String(quotation.unit_price))
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

    let textConfirmation = ''
    switch (readiness) {
      case 1:
        formData.append('readiness', String(1))
        formData.append('quotation_status', String(1014))
        textConfirmation = 'Apakah Anda yakin ingin mengubah status quotation menjadi Draft ?'
        break

      case 2:
        formData.append('readiness', String(2))
        formData.append('quotation_status', String(26))
        textConfirmation = 'Apakah Anda yakin ingin menyetujui dan menyimpan quotation ini?'
        break

      case 3:
        formData.append('readiness', String(3))
        formData.append('quotation_status', String(27))
        textConfirmation = 'Apakah Anda yakin ingin menolak quotation ini?'
        break

      case 4:
        formData.append('readiness', String(4))
        formData.append('quotation_status', quotationStatus)
        textConfirmation = 'Apakah Anda yakin ingin mengirim email otomatis kepada pelanggan?'
        break
      default:
        break
    }

    Swal.fire({
      title: textConfirmation,
      icon: 'question',
      showConfirmButton: true,
      confirmButtonColor: '#6b9230',
      showDenyButton: true,
      confirmButtonText: 'Ya',
      denyButtonText: 'Tidak',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(`${apiUrl}/quotation/${params.id}`, formData, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              // 'Access-Control-Allow-Origin': '*',
             // 'ngrok-skip-browser-warning':  'true',
            },
          })
          if (response.data.status === 200 || response.data.status === 201) {
          if(order?.status?.category === 'APPROVED'){  
            sentWA();
          }
            Swal.fire({
              title: 'Success',
              text: 'Success Update Quotation',
              icon: 'success',
              showConfirmButton: false,
              timer: 1500,
            })
            setIsLoading(false)
            navigate('/quotation/view-quotation')
          } else {
            Swal.fire({
              title: 'Error',
              text: response.data.message,
              icon: 'error',
            })
            setIsLoading(false)
          }
        } catch (error: any) {
          console.error(error)
          setIsLoading(false)
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
          })
        }
      } else {
        setIsLoading(false)
      }
    })
  }

  const API_BASE = process.env.REACT_APP_WA_BACKEND_API_URL
const [emailDetail, setEmailDetail] = useState<any>()
const [order, setOrder] = useState<any>()
const [pdfQuotation, setPdfQuotation] = useState<String>()
const sentWA = async () => {
    
    // ==================================
    // === TEMPLATE INVOICE WHATSAPP ===
    // ==================================
    // Final WhatsApp Message
    //${apiUrl}/orders/quotation-pdf/${order.id}
    const invoiceMessage = `
Hi *${order?.members?.full_name || "-"}*, terima kasih telah menggunakan layanan instalasi Mitra10.

Berikut terlampir *Quotation Jasa Instalasi & Servis Mitra10*.
Jika Anda menyetujui penawaran tersebut, mohon lakukan pembayaran melalui kanal resmi Mitra10
sesuai instruksi pada dokumen.

Jika lampiran PDF tidak dapat dibuka atau tidak terkirim, silakan unduh Quotation melalui link berikut:
👉 [${apiUrl}/orders/quotation-pdf/${order.id}]
Terima kasih atas kepercayaan Anda kepada Mitra10.

⚠️ *Catatan Penting:*
• Quotation disusun berdasarkan hasil survey awal
• Biaya tambahan dapat berlaku jika terdapat pekerjaan tambahan saat pemasangan
• Jadwal pemasangan akan ditentukan setelah pembayaran terverifikasi
• Pembayaran hanya berlaku melalui kanal resmi Mitra10
• Dengan melakukan pembayaran, Anda dianggap menyetujui seluruh ketentuan yang berlaku

Terima kasih atas kepercayaan Anda kepada *Mitra10* 🙏
`;


  
  
  // =============================
  // === KIRIM GAMBAR + PESAN ===
  // =============================
    const payload = { 
        phonenumber: order?.members?.member_number,
        message: invoiceMessage,
        location: '',
        img: '',
        document: pdfQuotation,
        audio: '',
        video: '',
          types:'Order'
      };
  
      await axios.post(`${API_BASE}/conversation`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
  
    }
  const downloadToBase64 = async () => {
    try {
      console.log("Memulai unduhan PDF untuk order ID:", order.id); 
      const response = await fetch(`${apiUrl}/orders/quotation-pdf/${order.id}`, {
        mode: 'cors'
      });

      if (!response.ok) {
        console.error("❌ Failed to fetch file:", response.statusText);
        return "";
      }

      const contentType = response.headers.get("Content-Type") || "";
      const blob = await response.blob();

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Ensure prefix exists
      if (!base64.startsWith("data:")) {
        setPdfQuotation(`data:${contentType};base64,${base64}`);
      }

      setPdfQuotation(base64);
    } catch (err) {
      console.warn("⚠️ Download to Base64 failed (CORS or network issue):", err);
      return "";
    }
  }

  useEffect(() => {
      if (
       !pdfQuotation
     ) return;
     console.log("DATA BENAR-BENAR SIAP:", order,pdfQuotation);
  },[pdfQuotation]);
  useEffect(() => {
     if (
       !order// harus ada info
     ) return;
 
     downloadToBase64();
     //sentWA();
   }, [order]);

  return (
    <section id='update-quotation'>
      <Card className='card-quotation'>
        <Card.Body className='content-quotation'>
          <Row className='mb-4'>
            <Col
              xs={{order: 'last'}}
              xxl={6}
              className='vendor-information order-1 order-xxl-1 order-xl-2 order-lg-2 order-md-2 order-sm-2 mb-3'
            >
              <div className='vendor-detail'>
                <img
                  alt='Logo'
                  className='h-50px logo mb-3'
                  src={toAbsoluteUrl('/media/auth/logo-mitra.png')}
                />

                <Form.Group>
                  <Form.Label className='fs-5 fw-semibold'>Nama Toko :</Form.Label>

                  <Col>
                    <Form.Label className='fs-5 fw-bold'>
                      {quotationData?.store?.store_name}
                    </Form.Label>
                  </Col>
                </Form.Group>

                <Form.Group>
                  <Form.Label className='fs-5 fw-bold'>
                    {quotationData?.store?.address ?? ''}
                  </Form.Label>
                  <br></br>
                  <Form.Label className='fs-5 fw-bold'>
                    {`Telp : ${
                      quotationData?.store?.phone_number_1 ??
                      quotationData?.store?.phone_number_2 ??
                      'Nomor telepon belum tersedia'
                    }`}
                  </Form.Label>
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
                    value={quotationData?.status?.description}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-4'>
                <Form.Label className='fs-5 fw-bold' column sm='4'>
                  Tanggal :
                </Form.Label>

                <Col sm='8'>
                  <Form.Control
                    type='date'
                    min={today}
                    value={quotationDate}
                    onChange={handleChangeQuotationDate}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-4'>
                <Form.Label className='fs-5 fw-bold' column sm='4'>
                  Order ID :
                </Form.Label>

                <Col sm='8'>
                  <Form.Control
                    readOnly
                    className='fs-5  text-black'
                    type='text'
                    value={quotationData?.order_id}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-4'>
                <Form.Label className='fs-5 fw-bold' column sm='4'>
                  Quotation ID :
                </Form.Label>

                <Col sm='8'>
                  <Form.Control type='number' value={quotationData?.id} readOnly />
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
                    value={quotationData?.order?.members?.member_number}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='mb-4'>
                <Form.Label className='fs-5 fw-bold' column sm='4'>
                  Quotation Valid Until :
                </Form.Label>

                <Col sm='8'>
                  <Form.Control
                    type='text'
                    min={today}
                    value={formatDate(new Date(quotationValidity))}
                    plaintext
                    readOnly
                  />
                </Col>
              </Form.Group>
            </Col>
          </Row>

          <Row className='mb-5'>
            <Col xxl={6}>
              <div className='receiver-information mb-3'>
                <div className='receiver-detail'>
                  <h1 className='fs-5 fw-semibold'>Ditunjukkan kepada :</h1>
                  <h1 className='fs-3 fw-semibold mt-2'>
                    {quotationData?.order?.members?.full_name}
                  </h1>
                </div>

                <div className='address'>
                  <h3 className='fw-normal'>{quotationData?.order?.project_address}</h3>
                  <h3 className='fw-normal'>
                    {quotationData?.order?.project_number
                      ? `Telp : ${quotationData?.order?.project_number}`
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
                    readOnly
                    value={quotationDescription}
                    onChange={handleInputQuotationDesc}
                  />
                </Form.Group>
              </div>
            </Col>
          </Row>

          {quotationData?.quotation_special === 0 && (
            <>
              <hr />

              <div className='item-jasa'>
                <h4 className='fs-5 fw-semibold mb-5'>Item Jasa Pemasangan</h4>

                {quotationDetail
                  .filter((x) => x.type === 2)
                  .map((element, index) => (
                    <Card key={`${element.index}-service`} className='card-item-jasa mb-5'>
                      <div className='d-flex border-rounded-3'>
                        <Card.Body>
                          <Row>
                            <Col xxl={4} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Jenis Jasa</Form.Label>
                                <Form.Control readOnly value={element?.item_name ?? '-'} />
                              </Form.Group>
                            </Col>

                            <Col xxl={2} xl={2} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>QTY</Form.Label>
                                <Form.Control readOnly value={element?.quantity ?? 0} />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Profit</Form.Label>
                                <Form.Control
                                  readOnly
                                  value={
                                    element.margin_type === 1
                                      ? `${element.margin}%`
                                      : `Rp. ${element?.margin?.toLocaleString('id')}`
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Total</Form.Label>
                                <Form.Control
                                  readOnly
                                  value={`Rp. ${element?.unit_price?.toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col xxl={6} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Satuan</Form.Label>
                                <Form.Control readOnly value={element?.unit ?? '-'} />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Category</Form.Label>
                                <Select
                                  name='category_id'
                                  className='form-control p-0'
                                  classNamePrefix='select'
                                  placeholder='Pilih Kategori'
                                  isSearchable={true}
                                  options={categories}
                                  value={{
                                    value: element.category_id ?? null,
                                    label: element.category_name ?? 'Pilih Category',
                                  }}
                                  onChange={(newValue) =>
                                    handleCategoryChange(element.index, newValue)
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Final Price</Form.Label>

                                <Form.Control
                                  readOnly
                                  value={`Rp. ${element.final_price.toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </div>
                    </Card>
                  ))}
              </div>
            </>
          )}

          {quotationData?.quotation_special === 1 && (
            <>
              <hr />

              <div className='p-0'>
                <p className='fs-7 text-black'>Keterangan : </p>
                <p className='fs-7 fw-semibold text-black'>
                  *Quotation ini menggunakan quotation tipe spesial
                </p>
                <p className='fs-7 fw-semibold text-black'>
                  *Quotation spesial merupakan quotation yang nominalnya diatas 20.000.000
                </p>
              </div>

              <hr />

              <div className='item-jasa'>
                <h4 className='fs-5 fw-semibold mb-5'>Jasa Pemasangan Tahap 1</h4>

                {quotationDetail
                  .filter((x) => x.type === 2 && x.work_step === 1)
                  .map((element, index) => (
                    <Card key={`${element.index}-service`} className='card-item-jasa mb-5'>
                      <div className='d-flex border-rounded-3'>
                        <Card.Body>
                          <Row>
                            <Col xxl={4} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Jenis Jasa</Form.Label>
                                <Form.Control readOnly value={element?.item_name ?? '-'} />
                              </Form.Group>
                            </Col>

                            <Col xxl={2} xl={2} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>QTY</Form.Label>
                                <Form.Control readOnly value={element?.quantity ?? 0} />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Profit</Form.Label>
                                <Form.Control
                                  readOnly
                                  value={
                                    element.margin_type === 1
                                      ? `${element.margin}%`
                                      : `Rp. ${element?.margin?.toLocaleString('id')}`
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Total</Form.Label>
                                <Form.Control
                                  readOnly
                                  value={`Rp. ${element?.unit_price?.toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col xxl={6} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Satuan</Form.Label>
                                <Form.Control readOnly value={element?.unit ?? '-'} />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Category</Form.Label>
                                <Select
                                  name='category_id'
                                  className='form-control p-0'
                                  classNamePrefix='select'
                                  placeholder='Pilih Kategori'
                                  isSearchable={true}
                                  options={categories}
                                  value={{
                                    value: element.category_id ?? null,
                                    label: element.category_name ?? 'Pilih Category',
                                  }}
                                  onChange={(newValue) =>
                                    handleCategoryChange(element.index, newValue)
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Final Price</Form.Label>

                                <Form.Control
                                  readOnly
                                  value={`Rp. ${element.final_price.toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </div>
                    </Card>
                  ))}
              </div>

              <hr />

              <div className='item-jasa'>
                <h4 className='fs-5 fw-semibold mb-5'>Jasa Pemasangan Tahap 2</h4>

                {quotationDetail
                  .filter((x) => x.type === 2 && x.work_step === 2)
                  .map((element, index) => (
                    <Card key={`${element.index}-service`} className='card-item-jasa mb-5'>
                      <div className='d-flex border-rounded-3'>
                        <Card.Body>
                          <Row>
                            <Col xxl={4} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Jenis Jasa</Form.Label>
                                <Form.Control readOnly value={element?.item_name ?? '-'} />
                              </Form.Group>
                            </Col>

                            <Col xxl={2} xl={2} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>QTY</Form.Label>
                                <Form.Control readOnly value={element?.quantity ?? 0} />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Profit</Form.Label>
                                <Form.Control
                                  readOnly
                                  value={
                                    element.margin_type === 1
                                      ? `${element.margin}%`
                                      : `Rp. ${element?.margin?.toLocaleString('id')}`
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Total</Form.Label>
                                <Form.Control
                                  readOnly
                                  value={`Rp. ${element?.unit_price?.toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col xxl={6} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Satuan</Form.Label>
                                <Form.Control readOnly value={element?.unit ?? '-'} />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Category</Form.Label>
                                <Select
                                  name='category_id'
                                  className='form-control p-0'
                                  classNamePrefix='select'
                                  placeholder='Pilih Kategori'
                                  isSearchable={true}
                                  options={categories}
                                  value={{
                                    value: element.category_id ?? null,
                                    label: element.category_name ?? 'Pilih Category',
                                  }}
                                  onChange={(newValue) =>
                                    handleCategoryChange(element.index, newValue)
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Final Price</Form.Label>

                                <Form.Control
                                  readOnly
                                  value={`Rp. ${element.final_price.toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </div>
                    </Card>
                  ))}
              </div>

              <hr />

              <div className='item-jasa'>
                <h4 className='fs-5 fw-semibold mb-5'>Jasa Pemasangan Tahap 3</h4>

                {quotationDetail
                  .filter((x) => x.type === 2 && x.work_step === 3)
                  .map((element, index) => (
                    <Card key={`${element.index}-service`} className='card-item-jasa mb-5'>
                      <div className='d-flex border-rounded-3'>
                        <Card.Body>
                          <Row>
                            <Col xxl={4} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Jenis Jasa</Form.Label>
                                <Form.Control readOnly value={element?.item_name ?? '-'} />
                              </Form.Group>
                            </Col>

                            <Col xxl={2} xl={2} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>QTY</Form.Label>
                                <Form.Control readOnly value={element?.quantity ?? 0} />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Profit</Form.Label>
                                <Form.Control
                                  readOnly
                                  value={
                                    element.margin_type === 1
                                      ? `${element.margin}%`
                                      : `Rp. ${element?.margin?.toLocaleString('id')}`
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Total</Form.Label>
                                <Form.Control
                                  readOnly
                                  value={`Rp. ${element?.unit_price?.toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col xxl={6} xl={6} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Satuan</Form.Label>
                                <Form.Control readOnly value={element?.unit ?? '-'} />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Category</Form.Label>
                                <Select
                                  name='category_id'
                                  className='form-control p-0'
                                  classNamePrefix='select'
                                  placeholder='Pilih Kategori'
                                  isSearchable={true}
                                  options={categories}
                                  value={{
                                    value: element.category_id ?? null,
                                    label: element.category_name ?? 'Pilih Category',
                                  }}
                                  onChange={(newValue) =>
                                    handleCategoryChange(element.index, newValue)
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Final Price</Form.Label>

                                <Form.Control
                                  readOnly
                                  value={`Rp. ${element.final_price.toLocaleString('id')}`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </div>
                    </Card>
                  ))}
              </div>
            </>
          )}

          <hr />

          <div className='item-material'>
            <h4 className='fs-5 fw-semibold mb-5'>Item Material</h4>

            {quotationDetail.filter((x) => x.type === 1).length ? (
              <>
                {quotationDetail
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
                            onChange={(e) => handleCheckboxChange(element.index, e.target.checked)}
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
                                  readOnly
                                  value={element?.item_name ?? '-'}
                                  disabled={element.is_user === 1 ? true : false}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={2} xl={2} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>QTY</Form.Label>
                                <Form.Control
                                  id={`quantity-${index}`}
                                  name='quantity'
                                  readOnly
                                  value={element?.quantity ?? 0}
                                  disabled={element.is_user === 1 ? true : false}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Price</Form.Label>
                                <Form.Control
                                  readOnly
                                  value={element.unit_price}
                                  disabled={element.is_user === 1 ? true : false}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Total</Form.Label>
                                <Form.Control
                                  readOnly
                                  value={`Rp. ${element?.unit_price?.toLocaleString('id')}`}
                                  disabled={element.is_user === 1 ? true : false}
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
                                  value={element?.unit ?? '-'}
                                  disabled={element.is_user === 1 ? true : false}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Margin</Form.Label>

                                <Form.Control
                                  readOnly
                                  value={
                                    element.margin_type === 1
                                      ? `${element.margin}%`
                                      : `Rp. ${element?.margin?.toLocaleString('id')}`
                                  }
                                  disabled={element.is_user === 1 ? true : false}
                                />
                              </Form.Group>
                            </Col>

                            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                              <Form.Group className='mb-3'>
                                <Form.Label className='fs-5 fw-bold'>Final Price</Form.Label>

                                <Form.Control
                                  readOnly
                                  value={`Rp. ${element.final_price.toLocaleString('id')}`}
                                  disabled={element.is_user === 1 ? true : false}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </div>
                    </Card>
                  ))}
              </>
            ) : (
              <Card className='mb-3'>
                <Card.Body>
                  <div className='fs-5'>Tidak ada material yang dibutuhkan</div>
                </Card.Body>
              </Card>
            )}
          </div>

          <hr />

          <Form.Text className='fs-7 text-black'>Catatan : </Form.Text>
          <br></br>
          <Form.Text className='fs-8 fw-normal text-danger'>
            *Jika <span className='fw-bolder text-decoration-underline'>Material</span> diceklis,
            maka material tersebut disediakan oleh customer
          </Form.Text>
          <br></br>
          <Form.Text className='fs-8 text-danger'>
            *Harap masukkan angka tanpa tanda koma (,) sebagai pengganti gunakan tanda titik (.).
          </Form.Text>

          <hr />

          <div className='item-total'>
            <table className='table table-borderless'>
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
                  <div className='fs-6 fw-bold'>Promosi :</div>
                </td>

                <Form.Control
                  id='promosi'
                  type='number'
                  value={promosiDiscount}
                  onKeyDown={(e) => {
                    if (e.key === ',') {
                      e.preventDefault()
                    }
                  }}
                  onChange={(e) => handlePromosiChange(e.target.value)}
                />
              </tr>

              <tr>
                <td align='right'>
                  <div className='fs-6 fw-bold'>
                    {promotionName !== ''
                      ? `Additional Promosi ( ${promotionName} ) :`
                      : 'Additional Promosi :'}
                  </div>
                </td>

                <td className='total-content'>
                  <div className='fs-6 fw-semibold'>
                    {`Rp. ${parseInt(additionalPromosi).toLocaleString('id')}`}
                  </div>
                </td>
              </tr>

              <tr>
                <td align='right'>
                  <div className='fs-6 fw-bold'>Grand Total :</div>
                </td>

                <td className='total-content'>
                  <div className='fs-6 fw-semibold'>{`Rp. ${grandTotal.toLocaleString('id')}`}</div>
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

          {quotationData?.quotation_special === 1 && (
            <>
              <hr />

              <div className='fs-6 fw-semibold p-0 mb-2'>Preview Pembayaran</div>

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

          <div className='payment-detail'>
            <div className='payment-method mb-2'>
              <h1 className='fs-3 fw-bold'>
                Silahkan melakukan pembayaran di account di bawah ini :
              </h1>

              <h3 className='fs-5 fw-normal'>{quotationData?.store?.bank_account}</h3>
              <h3 className='fs-5 fw-normal'>{quotationData?.store?.bank_name}</h3>
              <h3 className='fs-5 fw-normal'>{quotationData?.store?.bank_number}</h3>
            </div>

            <div className='payment-evidence'>
              <h1 className='fs-3 fw-bold'>Silahkan kirim bukti bayar anda melalui:</h1>
              <h1 className='fs-5 fw-normal'>
                {`Telp : ${
                  quotationData?.store?.phone_number_1 ??
                  quotationData?.store?.phone_number_2 ??
                  'Nomor telepon belum tersedia'
                }`}
              </h1>
              <h1 className='fs-5 fw-normal'>
                {`Email : ${
                  quotationData?.store?.email ??
                  quotationData?.store?.email ??
                  'Email belum tersedia'
                }`}
              </h1>
            </div>

            <h1 className='fs-5 fw-normal'>
              Terima kasih telah melakukan bisnis dengan Mitra10. Kami harap kedatangan anda
              kembali.
            </h1>
          </div>

          <div className='button-wrapper d-flex justify-content-center align-items-center mt-5'>
            <Button
              variant='dark-primary'
              className='d-flex justify-content-center align-items-center mb-2'
              type='submit'
              disabled={isLoading}
              onClick={() => handleUpdateQuotation(1)}
            >
              Save
            </Button>

            {[1, 4].includes(quotationData?.readiness) && (
              <>
                <Button
                  variant='dark-success'
                  className='d-flex justify-content-center align-items-center mb-2'
                  type='submit'
                  disabled={isLoading}
                  onClick={() => handleUpdateQuotation(2)}
                >
                  Approve
                </Button>

                <Button
                  variant='dark-danger'
                  className='d-flex justify-content-center align-items-center mb-2'
                  type='submit'
                  disabled={isLoading}
                  onClick={() => handleUpdateQuotation(3)}
                >
                  Reject
                </Button>
              </>
            )}

            {quotationData?.readiness === 2 && (
              <Button
                variant='dark-warning'
                className='d-flex justify-content-center align-items-center mb-2'
                type='submit'
                disabled={isLoading}
                onClick={() => handleUpdateQuotation(4)}
              >
                Send Email To Customers
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </section>
  )
}

export {UpdateQuotationHO}
