import React from 'react'

export type Props = {
  className: string
}

export interface TimeLeft {
  days: number
  hours: number
  minutes: number
}

export interface DataType {
  key: React.Key
  quotation_id: number
  store_name: string
  order_id: number
  date_order: Date | string
  costumer_name: string
  vendor_name: string
  payment_status: string
  receipt_quotation: string
  order_status: string
  order_status_label: string
  quotation_status: string
  period_active: Date | string
  countdown_to_expired: Date | string
  period_expired: Date | string
  grand_total: string
  promotion: any
  quotation_receipt: any
  quotation_special: number
  quotation_grand_total: number
  quotation_detail: any[]
  order_detail: any[]
}

export interface VendorItem {
  value: number | null
  label: string
}

export interface DiscountType {
  value: number | null
  label: string
}

export interface TotalQuotationState {
  grandTotalFromVendor: number
  promotionSurvey: number
  grandTotalFromMitra: number
  mitraMargin: number
  nominalMitraMargin: number
  vendorMargin: number
  nominalVendorMargin: number
  requestDiscount: number
  customerPay: number
  margin: number
  marginMitraAfterDiscount: number
}
