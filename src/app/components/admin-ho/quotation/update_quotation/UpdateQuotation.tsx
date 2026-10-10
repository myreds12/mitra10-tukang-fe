import React, {FC, useState, useEffect} from 'react'
import './UpdateQuotation.css'

import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import {useNavigate, useParams} from 'react-router-dom'
import {Card} from 'react-bootstrap'

import {
  Promotion,
  CategorySelect,
  QuotationDetail,
  PaymentStage,
} from './types'
import {
  fetchQuotationByIdApi,
  fetchCategoriesApi,
  fetchPromotionsApi,
  saveQuotationApi,
  sendWaConversationApi,
} from './services/updateQuotationService'

import {UpdateQuotationHeaderSection} from './components/UpdateQuotationHeaderSection'
import {UpdateQuotationServiceSection} from './components/UpdateQuotationServiceSection'
import {UpdateQuotationMaterialSection} from './components/UpdateQuotationMaterialSection'
import {UpdateQuotationSummarySection} from './components/UpdateQuotationSummarySection'

const UpdateQuotationHO: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const apiBase = process.env.REACT_APP_WA_BACKEND_API_URL
  const navigate = useNavigate()
  const params = useParams()

  // Loading
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Order & Store Id
  const [orderId, setOrderId] = useState<string>('')
  const [storeId, setStoreId] = useState<string>('')
  const [order, setOrder] = useState<any>()
  const [pdfQuotation, setPdfQuotation] = useState<string>()

  // Quotation State
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

  // Category & Promotion Options
  const [categories, setCategories] = useState<CategorySelect[]>([])
  const [promotion, setPromotion] = useState<Promotion[]>([])

  // Payment Stage
  const [paymentStages, setPaymentStages] = useState<PaymentStage[]>([
    {stage: 'Tahap 1', percentage: '25%', amount: 0},
    {stage: 'Tahap 2', percentage: '50%', amount: 0},
    {stage: 'Tahap 3', percentage: '25%', amount: 0},
  ])

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

  const getQuotationData = async () => {
    try {
      const response = await fetchQuotationByIdApi(apiUrl, params.id)
      const data = response.data.data

      if (data) {
        setQuotationData(data)
        setOrderId(data.order_id)
        setOrder(data.order)
        setStoreId(data.store?.id)
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
    } catch (err) {
      console.error(err)
    }
  }

  const getCategories = async () => {
    try {
      const response = await fetchCategoriesApi(apiUrl)
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
      const response = await fetchPromotionsApi(apiUrl, storeId)
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
          const today = dayjs(quotationData?.created_at)

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

  const handleInputQuotationDesc = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuotationDescription(event.target.value)
  }

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

  const handleCheckboxChange = (index: any, isChecked: boolean) => {
    const updatedDetailValues = [...quotationDetail]
    const elementIndex = updatedDetailValues.findIndex((item) => item.index === index)

    if (elementIndex !== -1) {
      updatedDetailValues[elementIndex].is_user = isChecked ? 1 : 0
    }

    setQuotationDetail(updatedDetailValues)
  }

  const handleCategoryChange = (index: any, value: any) => {
    const updatedDetailValues = [...quotationDetail]
    const elementIndex = updatedDetailValues.findIndex((item) => item.index === index)

    if (elementIndex !== -1) {
      updatedDetailValues[elementIndex].category_id = value.value
      updatedDetailValues[elementIndex].category_name = value.label
    }

    setQuotationDetail(updatedDetailValues)
  }

  const calculateTotalMaterial = () => {
    const materialDetails = quotationDetail.filter((detail) => detail.type === 1)
    const total = materialDetails.reduce(
      (accumulator, detail) => accumulator + detail.final_price,
      0
    )
    setTotalMaterial(total)
  }

  const calculateTotalJasaMaterial = () => {
    let total = 0
    for (const detail of quotationDetail) {
      if (detail.type === 1 || detail.type === 2) {
        total += detail.final_price
      }
    }
    setTotalJasaMaterial(total)
  }

  const handlePromosiChange = (value: any) => {
    setPromosiDiscount(value)
  }

  useEffect(() => {
    if ([1, 4].includes(quotationData?.readiness)) {
      let totalQuotation = grandTotalBeforePromotion
      let totalPromotion = 0
      let promoId = null
      let promoName = ''

      promotion.forEach((promo) => {
        if (Number(totalQuotation) >= Number(promo.min_order)) {
          if (promo.promotion_type === 2) {
            promoId = promo.id
            promoName = promo.name
            totalPromotion = promo.promotion
          } else if (promo.promotion_type === 1) {
            promoId = promo.id
            promoName = promo.name
            totalPromotion = (totalQuotation * promo.promotion) / 100
          }
        } else {
          promoId = 0
        }
      })

      setPromotionId(promoId)
      setPromotionName(promoName)
      setAdditionalPromosi(totalPromotion)
    }
  }, [promotion, grandTotalBeforePromotion])

  const calculatePaymentStages = (currentGrandTotal: number) => {
    const stage1 = currentGrandTotal * 0.25
    const stage2 = currentGrandTotal * 0.5
    const stage3 = currentGrandTotal * 0.25

    setPaymentStages([
      {stage: 'Tahap 1', percentage: '25%', amount: stage1},
      {stage: 'Tahap 2', percentage: '50%', amount: stage2},
      {stage: 'Tahap 3', percentage: '25%', amount: stage3},
    ])
  }

  const calculatedGrandTotal = () => {
    const calculatedTotal =
      Number(totalJasaMaterial) - Number(promosiDiscount) - Number(additionalPromosi ?? 0)

    const roundedValue = Math.ceil(calculatedTotal / 100) * 100

    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    })

    setGrandTotal(calculatedTotal)
    setGrandTotalRounded(formatter.format(roundedValue))
    setGrandTotalDiff(roundedValue - calculatedTotal)
    calculatePaymentStages(calculatedTotal)
  }

  useEffect(() => {
    calculateTotalMaterial()
    calculateTotalJasaMaterial()
    calculatedGrandTotal()
  }, [quotationDetail, totalJasaMaterial, promosiDiscount, additionalPromosi])

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

  const sentWA = async () => {
    const invoiceMessage = `
Hi *${order?.members?.full_name || '-'}*, terima kasih telah menggunakan layanan instalasi Mitra10.

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
`

    const payload = {
      phonenumber: order?.members?.member_number,
      message: invoiceMessage,
      location: '',
      img: '',
      document: pdfQuotation,
      audio: '',
      video: '',
      types: 'Order',
    }

    await sendWaConversationApi(apiBase, payload)
  }

  const downloadToBase64 = async () => {
    try {
      console.log('Memulai unduhan PDF untuk order ID:', order.id)
      const response = await fetch(`${apiUrl}/orders/quotation-pdf/${order.id}`, {
        mode: 'cors',
      })

      if (!response.ok) {
        console.error('❌ Failed to fetch file:', response.statusText)
        return ''
      }

      const contentType = response.headers.get('Content-Type') || ''
      const blob = await response.blob()

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      if (!base64.startsWith('data:')) {
        setPdfQuotation(`data:${contentType};base64,${base64}`)
      } else {
        setPdfQuotation(base64)
      }
    } catch (err) {
      console.warn('⚠️ Download to Base64 failed (CORS or network issue):', err)
      return ''
    }
  }

  useEffect(() => {
    if (!pdfQuotation) return
    console.log('DATA BENAR-BENAR SIAP:', order, pdfQuotation)
  }, [pdfQuotation])

  useEffect(() => {
    if (!order) return
    downloadToBase64()
  }, [order])

  const handleUpdateQuotation = async (readiness: number) => {
    if (!QuotationValidation()) {
      setIsLoading(false)
      return false
    }

    setIsLoading(true)
    const formData = new FormData()
    const appendIfNotDefault = (fd: any, key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        fd.append(key, String(value))
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
          const response = await saveQuotationApi(apiUrl, params.id, formData)
          if (response.data.status === 200 || response.data.status === 201) {
            if (order?.status?.category === 'APPROVED') {
              sentWA()
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
            text: error.response?.data?.message || 'Error occurred',
            icon: 'error',
          })
        }
      } else {
        setIsLoading(false)
      }
    })
  }

  return (
    <section id='update-quotation'>
      <Card className='card-quotation'>
        <Card.Body className='content-quotation'>
          <UpdateQuotationHeaderSection
            quotationData={quotationData}
            today={today}
            quotationDate={quotationDate}
            handleChangeQuotationDate={handleChangeQuotationDate}
            quotationValidity={quotationValidity}
            formatDate={formatDate}
            quotationDescription={quotationDescription}
            handleInputQuotationDesc={handleInputQuotationDesc}
          />

          <UpdateQuotationServiceSection
            quotationData={quotationData}
            quotationDetail={quotationDetail}
            categories={categories}
            handleCategoryChange={handleCategoryChange}
          />

          <UpdateQuotationMaterialSection
            quotationDetail={quotationDetail}
            handleCheckboxChange={handleCheckboxChange}
          />

          <UpdateQuotationSummarySection
            totalMaterial={totalMaterial}
            totalJasaMaterial={totalJasaMaterial}
            promosiDiscount={promosiDiscount}
            handlePromosiChange={handlePromosiChange}
            promotionName={promotionName}
            additionalPromosi={additionalPromosi}
            grandTotal={grandTotal}
            grandTotalDiff={grandTotalDiff}
            grandTotalRounded={grandTotalRounded}
            quotationData={quotationData}
            paymentStages={paymentStages}
            isLoading={isLoading}
            handleUpdateQuotation={handleUpdateQuotation}
          />
        </Card.Body>
      </Card>
    </section>
  )
}

export {UpdateQuotationHO}
export default UpdateQuotationHO
