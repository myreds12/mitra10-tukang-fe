import React, {FC, useState, useEffect, ChangeEvent} from 'react'
import './UpdateQuotation.css'
import axios from 'axios'
import Swal from 'sweetalert2'
import {useNavigate, useParams} from 'react-router-dom'
import {Card} from 'react-bootstrap'
import {Quotation, PaymentStage} from './types'
import {
  validateUpdateQuotation,
  buildUpdateQuotationFormData,
} from './services/updateQuotationService'
import {UpdateQuotationHeaderSection} from './components/UpdateQuotationHeaderSection'
import {UpdateQuotationServiceSection} from './components/UpdateQuotationServiceSection'
import {UpdateQuotationMaterialSection} from './components/UpdateQuotationMaterialSection'
import {UpdateQuotationSummarySection} from './components/UpdateQuotationSummarySection'

const UpdateQuotationVendor: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const params = useParams()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const today = new Date().toISOString().split('T')[0]

  // Add Quotation
  const [quotationData, setQuotationData] = useState<any>()
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

  const [paymentStages, setPaymentStages] = useState<PaymentStage[]>([
    {stage: 'Tahap 1', percentage: '25%', amount: 0},
    {stage: 'Tahap 2', percentage: '50%', amount: 0},
    {stage: 'Tahap 3', percentage: '25%', amount: 0},
  ])

  const getQuotationData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/quotation/${params.id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      const data = response.data.data

      if (data) {
        const quotationDetails = data?.quotation_details.map((item: any, index: number) => ({
          id: item?.id ?? null,
          index: (Date.now() + index).toString(),
          item_id: item?.item_id ?? null,
          work_order_item_id: item?.work_order_items_id ?? null,
          category_id: item?.category_id ?? null,
          type: item?.item_type ?? 2,
          item_name: item?.name ?? '',
          unit_price: parseInt(item?.price) || 0,
          unit: item?.unit ?? '',
          description: item?.description ?? '',
          final_price: parseInt(item?.final_price) || 0,
          margin: item?.margin ?? 0,
          margin_type: item?.margin_type ?? 1,
          quantity: item?.quantity ?? 0,
          is_user: item?.is_customer === true ? 1 : 0,
          work_step: item?.work_step ?? 0,
        }))

        setQuotation((prev) => ({
          ...prev,
          id: data?.id,
          order_id: data?.order_id,
          store_id: data?.store_id,
          quotation_status: data?.quotation_status,
          quotation_special: data?.quotation_special,
          description: data?.description,
          quotation_number: data?.quotation_number,
          quotation_date: new Date(data?.quotation_date).toISOString().split('T')[0],
          quotation_validity: data?.quotation_validity ?? null,
          readiness: data?.readiness,
          receipt_quotation: data?.receipt_quotation,
          quotation_details: quotationDetails,
        }))

        setQuotationData(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getQuotationData()
    // eslint-disable-next-line
  }, [])

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
      quotation_details: [],
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

  const handleRemoveQuotationDetailForm = (index: number | string) => {
    setQuotation((prev) => {
      const cache = {...prev}
      const typeIndex = cache.quotation_details.findIndex((item) => item.index === index)
      if (typeIndex !== -1) {
        cache.quotation_details.splice(typeIndex, 1)
      }
      return cache
    })
  }

  const handleIsUser = (index: number | string, isChecked: boolean) => {
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

  const handleMarginType = (index: number | string, isChecked: boolean) => {
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
    index: number | string,
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
    index: number | string,
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

  const calculateEachDetail = (isNominal: number, index: number | string) => {
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

  // Handle Submit Quotation
  const handleUpdateQuotation = async () => {
    if (!validateUpdateQuotation(quotation)) {
      return false
    }

    setIsLoading(true)
    const formData = buildUpdateQuotationFormData(quotation)

    try {
      const response = await axios.post(`${apiUrl}/quotation/${params.id}`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (response.data.status === 200 || response.data.status === 201) {
        Swal.fire({
          title: 'Success',
          text: 'Berhasil update quotation',
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
    } catch (error: any) {
      console.error(error)
      setIsLoading(false)

      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Gagal update quotation',
        icon: 'error',
      })
    }
  }

  const handleCancelQuotation = () => {
    navigate('/quotation/view-quotation')
  }

  return (
    <section id='quotation-vendor'>
      <Card className='card-quotation'>
        <Card.Body className='content-quotatation'>
          <UpdateQuotationHeaderSection
            quotationData={quotationData}
            quotation={quotation}
            today={today}
            handleChangeQuotation={handleChangeQuotation}
            handleChangeQuotationType={handleChangeQuotationType}
          />

          <UpdateQuotationServiceSection
            quotation={quotation}
            addQuotationDetail={addQuotationDetail}
            handleChangeQuotationDetails={handleChangeQuotationDetails}
            validateQtyInput={validateQtyInput}
            calculateEachDetail={calculateEachDetail}
            handleMarginType={handleMarginType}
            handleRemoveQuotationDetailForm={handleRemoveQuotationDetailForm}
          />

          <UpdateQuotationMaterialSection
            quotation={quotation}
            handleIsUser={handleIsUser}
            handleChangeQuotationDetails={handleChangeQuotationDetails}
            validateQtyInput={validateQtyInput}
            calculateEachDetail={calculateEachDetail}
            handleMarginType={handleMarginType}
            handleRemoveQuotationDetailForm={handleRemoveQuotationDetailForm}
            addQuotationDetail={addQuotationDetail}
          />

          <UpdateQuotationSummarySection
            quotation={quotation}
            paymentStages={paymentStages}
            totalMaterial={totalMaterial}
            totalJasaMaterial={totalJasaMaterial}
            grandTotalDiff={grandTotalDiff}
            grandTotalRounded={grandTotalRounded}
            isLoading={isLoading}
            handleCancelQuotation={handleCancelQuotation}
            handleUpdateQuotation={handleUpdateQuotation}
          />
        </Card.Body>
      </Card>
    </section>
  )
}

export {UpdateQuotationVendor}
