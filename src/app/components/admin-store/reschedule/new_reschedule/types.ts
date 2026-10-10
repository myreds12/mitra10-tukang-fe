export interface Reschedule {
  order_id: any
  status_id: any
  reschedule_date: string
  reschedule_status_id: any
  description: string
  reschedule_status_by: string
}

export interface Status {
  value: number
  category: string
}

export interface PaymentStage {
  stage: string
  percentage: string
  amount: number
}
