export interface DataType {
  invoice_id: number
  status: number
  invoice_date: string
  vendor_name: string
  amount: string | number
  invoice_status: string
}

export interface VendorItem {
  value: number | null
  label: string
}
