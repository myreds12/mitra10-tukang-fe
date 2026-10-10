export interface VendorRegistrationDetail {
  id: number
  company_name: string
  address: string
  phone_number: string
  email_address: string
  pic_name: string
  pic_email: string
  pic_phone: string
  ktp_number: string | null
  npwp_number: string | null
  bank_id: number | null
  service_types: number[] | string
  areas: number[] | string
  status: number
  rejection_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
  bank?: {
    id: number
    bank_name: string
  }
  vendor_photo?: string
  ktp_photo?: string
  npwp_photo?: string
  compro_photo?: string
  surat_permohonan_photo?: string
  pks_photo?: string
  siup_photo?: string
  tukang_data?: string | any[]
  histories?: VendorRegistrationHistoryItem[]
}

export interface VendorRegistrationHistoryItem {
  id: number
  vendor_registration_id: number
  from_status: number | null
  to_status: number
  action: string
  notes: string | null
  actor_id: number | null
  actor_username?: string | null
  actor_role?: string | null
  actor_display?: string | null
  created_at: string
}
