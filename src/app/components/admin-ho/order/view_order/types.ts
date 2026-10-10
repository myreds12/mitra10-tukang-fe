export interface DataType {
  order_id: number
  store_id?: number
  date_order: string | Date
  assign_from: string
  vendor_name: string
  no_member: string | number
  costumer_name: string
  phone_number: string | number
  payment_receipt: string
  payment_quotation: string
  order_status: string
  order_status_label: string
  work_order_status: string
  print_counter: number
}

export interface StoreItem {
  value: number | null
  label: string
}

export interface VendorItem {
  value: number | null
  label: string
}

export interface Order {
  id: number | null
  project_status_id: number | null
  store_id: number | null
  request_survey: string
  request_work: string
  notes: string
  order_details: Array<{
    id: number | null
    item_id: number | null
    item_code: string
    item_name: string
    quantity: number
    unit_price: string
    total: string
    item_notes: string
  }>
}

export interface CSI {
  value: number | null
  label: string
}

export interface Quotation {
  id: number | null
  order_id: number | null
  store_id: number | null
  quotation_status: number | null
  quotation_special: number
  description: string
  quotation_number: string
  quotation_date: string
  quotation_validity: string
  quotation_disc: number
  quotation_promotion: number | null
  quotation_grand_total: number
  readiness: number
  receipt_quotation: string
  receipts_quotation: Array<{
    id: number | null
    index: number
    receipt_quotation: string
    quotation_step: number
  }>
  quotation_details: Array<{
    id: number | null
    index: string
    item_id: number | null
    work_order_item_id: number | null
    category_id: number | null
    type: number
    item_name: string
    unit_price: number
    unit: string
    description: string
    total: number
    final_price: number
    margin: number
    margin_type: number
    quantity: number
    is_user: number
    work_step?: number
  }>
}
