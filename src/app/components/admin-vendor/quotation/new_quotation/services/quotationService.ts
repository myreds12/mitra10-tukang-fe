import Swal from 'sweetalert2'
import {Quotation, QuotationDetailItem} from '../types'

export const formatForFormData = (date: any): string => {
  if (!date || isNaN(date.getTime())) {
    return ''
  }

  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()

  return `${year}-${month}-${day}`
}

export const stringToHash = (string: string): number => {
  let hash = 0
  if (string.length === 0) return hash

  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  return hash
}

export const validateQuotation = (quotation: Quotation, workOrderDetail: any): boolean => {
  if (!workOrderDetail) {
    Swal.fire({
      title: 'Warning',
      text: 'Tolong pilih Order ID',
      icon: 'warning',
    })
    return false
  }

  if (!quotation.quotation_date) {
    Swal.fire({
      title: 'Warning',
      text: 'Tolong isi tanggal quotation',
      icon: 'warning',
    })
    return false
  }

  const validateDetail = (
    detail: QuotationDetailItem,
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

  return true
}

export const buildQuotationFormData = (
  quotation: Quotation,
  workOrderDetail: any
): FormData => {
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

  const appendIfNotDefault = (fd: FormData, key: string, value: any) => {
    if (value !== null && value !== undefined && value !== '' && value !== 0) {
      fd.append(key, String(value))
    }
  }

  quotation.quotation_details.forEach((item, index) => {
    appendIfNotDefault(formData, `quotation_details[${index}][item_id]`, item.item_id)
    appendIfNotDefault(
      formData,
      `quotation_details[${index}][work_order_item_id]`,
      item.work_order_item_id
    )

    appendIfNotDefault(formData, `quotation_details[${index}][name]`, item.item_name)
    appendIfNotDefault(formData, `quotation_details[${index}][unit]`, item.unit)
    appendIfNotDefault(formData, `quotation_details[${index}][work_step]`, item.work_step)

    formData.append(`quotation_details[${index}][margin]`, String(item?.margin ?? 0))
    formData.append(`quotation_details[${index}][price]`, String(item?.unit_price ?? 0))
    formData.append(`quotation_details[${index}][quantity]`, String(item?.quantity ?? 0))

    if (item.item_name !== '') {
      appendIfNotDefault(formData, `quotation_details[${index}][type]`, item.type)
      formData.append(`quotation_details[${index}][margin_type]`, String(item.margin_type))
      formData.append(`quotation_details[${index}][is_customer]`, String(item.is_user))
    }
  })

  return formData
}
