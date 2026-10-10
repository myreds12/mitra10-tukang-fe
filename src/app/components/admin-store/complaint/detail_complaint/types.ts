export interface Complaint {
  id: number | null
  order_id: number | null
  pic_name: string
  description: string
  complaint_channel: number | null
  complaint_date: string
  complaint_status: number | null
  complaint_type: number
  crm_type: number
  work_status_update?: number | null
}

export interface Remedial {
  complaint_id: number | null
  remedial_action: string
  ra_date_start: string
  remedial_pic: string
  remedial_pic_position: string
  complaint_date: string
  remedial_status: number | null
}

export interface Position {
  value: string
  label: string
}

export interface CrmType {
  value: number | null
  label: string
}
