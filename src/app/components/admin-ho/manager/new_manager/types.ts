export interface BankSelect {
  value: number | null
  label: string
}

export interface StoreItem {
  value: number | null
  label: string
}

export interface Manager {
  id: number | null
  bank_id: number | null
  store_id: number | null
  full_name: string
  nik: string
  username: string
  account_name: string
  phone_number: string
  account_number: string
  password: string
  is_active: number
}

export interface DataType {
  no: number
  manager_id: number
  store_name: string
  full_name: string
  nik: string
  is_active: string
}
