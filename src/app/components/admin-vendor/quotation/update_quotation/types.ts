export interface QuotationDetailItem {
  id: number | null
  index: number | string
  work_step?: number
  item_id: number | null
  work_order_item_id: number | null
  category_id: number | null
  type: number
  item_name: string
  unit_price: number | string
  unit: string
  description: string
  total?: number
  final_price: number
  margin: number | string
  margin_type: number
  quantity: number | string
  is_user: number
}

export interface Quotation {
  id: number | null
  order_id: number | null
  store_id: number | null
  quotation_special: number
  quotation_status: number | null
  description: string
  quotation_number: string
  quotation_date: string
  quotation_validity: string
  quotation_disc: number
  quotation_promotion: number | null
  quotation_grand_total: number
  readiness: number
  receipt_quotation: string
  quotation_details: QuotationDetailItem[]
}

export interface PaymentStage {
  stage: string
  percentage: string
  amount: number
}
