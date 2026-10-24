import {formatDateWithTimeZone} from '../../../_metronic/helpers/DateHelpers'

export interface OrderListRow {
  order_id: number
  store_id: number | undefined
  date_order: string
  assign_from: string
  vendor_name: string
  no_member: string | number | undefined
  costumer_name: string
  phone_number: string
  payment_receipt: string
  payment_quotation: string
  order_status: string | undefined
  order_status_label: string
  print_counter: number
}

interface OrderListApiItem {
  id: number
  store?: {id?: number; store_name?: string} | null
  vendor?: {company_name?: string} | null
  members?: {member_number?: string | number; full_name?: string} | null
  project_number?: string | null
  created_at?: string
  receipt_number?: string | null
  payment_type?: string | null
  status?: {category?: string; description?: string} | null
  print_counter?: number | null
  quotation?: Array<{
    receipt_quotation?: string | null
    quotation_files?: Array<{type?: number | null}> | null
  }>
}

const getPaymentReceipt = (item: OrderListApiItem) => {
  if (item.payment_type === 'gratis') return 'FREE'
  if (['survey', 'pemasangan_tanpa_survey'].includes(item.payment_type ?? '')) {
    return item.receipt_number === null ? 'UNPAID' : 'PAID'
  }
  return ''
}

const getPaymentQuotation = (item: OrderListApiItem) => {
  const quotation = item.quotation?.[0]
  if (!quotation) return ''

  const files = quotation.quotation_files ?? []
  if (quotation.receipt_quotation !== null && files.some((file) => file.type === 2)) {
    return 'PAID (RECEIPT DI UPLOAD OLEH TOKO)'
  }
  if (quotation.receipt_quotation !== null && files.some((file) => file.type === 3)) {
    return 'BUKTI TRANSFER SUDAH DI UPLOAD OLEH KONSUMEN'
  }
  return 'UNPAID'
}

export const mapOrderListItem = (item: OrderListApiItem): OrderListRow => ({
  order_id: item.id,
  store_id: item.store?.id,
  assign_from: item.store?.store_name ?? '-',
  date_order: formatDateWithTimeZone(item.created_at ?? ''),
  vendor_name: item.vendor?.company_name ?? 'Vendor Belum Ditugaskan',
  no_member: item.members?.member_number,
  costumer_name: item.members?.full_name ?? '-',
  phone_number: item.project_number?.startsWith('0')
    ? item.project_number
    : item.project_number
      ? `+62${item.project_number}`
      : '-',
  payment_receipt: getPaymentReceipt(item),
  payment_quotation: getPaymentQuotation(item),
  order_status: item.status?.category,
  order_status_label: item.status?.description ?? '-',
  print_counter: item.print_counter ?? 0,
})

export const mapOrderList = (items: OrderListApiItem[] = []) => items.map(mapOrderListItem)
