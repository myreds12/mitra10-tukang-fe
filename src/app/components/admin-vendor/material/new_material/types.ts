export interface StatusStorage {
  value: number
  category: string
  description: string
}

export interface WorkOrderSelect {
  value: number | null
  label: number | null
}

export interface Tukang {
  value: number | null
  label: string
  type?: number
}

export interface WorkOrders {
  id: number | null
  work_order_status: number | null
  description: string
  tukang_id: Array<any>
  survey_date_time: string
  work_date_time: string
  work_start_date: string
  work_end_date: string
  work_order_before: Array<any>
  work_order_after: Array<any>
}

export interface WorkOrderItem {
  id: number | null
  index: string
  item_name: string
  tukang_id: number | null
  tukang_name: string
  is_user: number
  type: number
  quantity: number | null
  unit: string
}

export interface OrderHistory {
  order_id?: number
  status: string
  created_at: string
  updated_by: string
}
