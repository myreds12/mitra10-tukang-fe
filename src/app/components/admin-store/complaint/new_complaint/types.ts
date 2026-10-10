export interface Complaint {
  order_id: number | null
  pic_name: string
  description: string
  complaint_channel: number | null
  complaint_date: string
  complaint_received_date: string
  complaint_status: string
  complaint_type: number
  crm_type: number
}

export interface CrmType {
  value: number | null
  label: string
}

export interface ComplaintChannel {
  value: number | null
  label: string
}

export interface OrderSelectOption {
  value: number | null
  label: string
  status?: string
  complaints?: any[]
}
