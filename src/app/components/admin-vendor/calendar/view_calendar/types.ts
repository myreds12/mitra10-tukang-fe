export interface Order {
  id: any
  title: string
  start: string
  end: string
  status_order?: string
  order_status?: string
  className: string
  order_detail?: any
}

export interface Status {
  value: number | null
  category: string
}

export interface PaymentStage {
  stage: string
  percentage: string
  amount: number
}

export interface TimelineHistoryItem {
  title: string
  value: (number | null)[]
}
