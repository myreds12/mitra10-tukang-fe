import {WorkOrder} from '../../../../interfaces/work-order'

export interface StatusStorage {
  value: number
  category: any
  description: string
}

export interface OrderHistory {
  order_id: number
  status: string
  created_at: string
  updated_by: string
}

export interface SessionOption {
  value: number
  label: string
}

export interface UpdateWorkVendorProps {
  updatePageTitle: (work_order: WorkOrder) => void
}
