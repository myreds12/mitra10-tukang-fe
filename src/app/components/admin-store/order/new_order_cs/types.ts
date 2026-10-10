export interface MemberSelect {
  value?: number | null
  label?: string
  full_name: string
  email?: string
  phone_number?: string
  whatsapp_number?: string
  address_1: string
  join_location: number | null
}

export interface SalesSelect {
  value: number | null
  label: string
  full_name: string
}

export interface ItemSelect {
  __isNew__?: boolean
  value: number | null
  label: string
  item_code: string
  item_name: string
  service_name: string
  category: string
  type: number
  default_price: number
  prices: Array<{
    id: number | null
    is_active: boolean
    item_id: number | null
    unit_id: number | null
    store_id: number | null
    periodic_start: string
    periodic_end: string
    nominal_discount: string
    price: string
    min_order: string
  }>
}

export interface OrderDetailItem {
  item?: ItemSelect | null
  item_id: number | null
  item_code: string | null
  item_name: string | null
  service_name: string | null
  quantity: number
  unit_price: string | null
  total: string | null
  item_notes: string | null
}

export interface Order {
  member_id: number | null
  sales_id: number | null
  store_id: number | null
  vendor_id?: number | null
  project_status_id: number | null
  project_address: string
  project_number: string
  request_survey: string
  payment_type: string
  receipt_number: string
  is_overdistance: number
  additional_fee: number
  notes: string
  order_details: Array<OrderDetailItem>
  order_files: Array<any>
  [key: string]: any
}
