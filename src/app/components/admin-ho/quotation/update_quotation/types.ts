export interface Promotion {
  id: number
  name: string
  min_order: number
  promotion: number
  promotion_type: number
  periodic_start?: string
  periodic_end?: string
}

export interface CategorySelect {
  value: number | null
  label: string
}

export interface QuotationDetail {
  id: number | null
  index: string
  item_id: number | null
  work_order_item_id: number | null
  category_id: number | null
  category_name: string
  type: number
  item_name: string
  unit: string
  unit_price: number
  total: number
  final_price: number
  margin: number
  margin_type: number
  quantity: number
  is_user: number
  description: string
  work_step?: number
}

export interface PaymentStage {
  stage: string
  percentage: string
  amount: number
}
