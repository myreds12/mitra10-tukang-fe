export interface Status {
  value: number | null
  category: string
}

export interface OrderHistory {
  order_id: number
  order_status: string
  created_at: string
  updated_by: string
}

export interface PaymentStage {
  stage: string
  percentage: string
  amount: number
}
