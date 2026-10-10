import {Orders} from '../../../../interfaces/order'

export interface Status {
  value: number | null
  category: string
}

export interface OrderHistory {
  order_id: number
  status: string
  created_at: string
  updated_by: string
}

export interface DetailWorkVendorProps {
  updatePageTitle: (order: Orders) => void
}
