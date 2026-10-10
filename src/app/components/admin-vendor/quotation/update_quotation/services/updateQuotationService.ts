import Swal from 'sweetalert2'
import {Quotation, QuotationDetailItem} from '../types'

export const validateUpdateQuotation = (quotation: Quotation): boolean => {
  if (!quotation.quotation_details.length) {
    Swal.fire({
      title: 'Warning',
      text: 'Mohon isi item quotation',
      icon: 'warning',
    })
    return false
  }

  if (!quotation.quotation_date) {
    Swal.fire({
      title: 'Warning',
      text: 'Mohon isi tanggal quotation',
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
        text: `Mohon isi "${typeName}" pada baris ke-${rowNumber}.`,
        icon: 'warning',
      })
      return false
    }

    if (!detail.unit || detail.unit.trim() === '') {
      Swal.fire({
        title: 'Warning',
        text: `Mohon isi kolom "Satuan" pada "${typeName}" pada baris ke-${rowNumber}.`,
        icon: 'warning',
      })
      return false
    }

    if (detail.quantity === null || detail.quantity === '') {
      Swal.fire({
        title: 'Warning',
        text: `Mohon isi kolom "QTY" (Quantity) pada baris ke-${rowNumber}.`,
        icon: 'warning',
      })
      return false
    }

    if (detail.margin === null || detail.margin === '') {
      Swal.fire({
        title: 'Warning',
        text: `Mohon isi kolom "Profit" pada baris ke-${rowNumber}.`,
        icon: 'warning',
      })
      return false
    }

    if (detail.unit_price === null || detail.unit_price === '') {
      Swal.fire({
        title: 'Warning',
        text: `Mohon isi kolom "Price" pada baris ke-${rowNumber}.`,
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

export const buildUpdateQuotationFormData = (quotation: Quotation): FormData => {
  const formData = new FormData()
  const appendIfNotDefault = (fd: FormData, key: string, value: any) => {
    if (value !== null && value !== undefined && value !== '') {
      fd.append(key, String(value))
    }
  }

  formData.append('order_id', quotation.order_id?.toString() ?? '')
  formData.append('store_id', quotation.store_id?.toString() ?? '')
  formData.append('quotation_number', quotation.id?.toString() ?? '')
  formData.append('quotation_status', quotation.quotation_status?.toString() ?? '')
  formData.append('quotation_special', quotation.quotation_special?.toString() ?? '')
  formData.append('description', quotation.description)
  formData.append('quotation_date', quotation.quotation_date)

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
