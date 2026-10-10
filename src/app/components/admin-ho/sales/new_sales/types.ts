export interface BankSelect {
  value: number | null
  label: string
}

export interface CategorySelect {
  value: number | null
  label: string
}

export interface StoreItem {
  value: number | null
  label: string
}

export interface SalesCategoryPayload {
  category_id?: number | null
}

export interface Sales {
  store_id: number | null
  bank_id: number | null
  full_name: string
  username: string
  account_name: string
  phone_number: string
  account_number: string
  nik: string
  sales_brand: string
  sales_categories: any[]
  password: string
  is_active: number
}

export interface DataType {
  no: number
  sales_id: number
  store_name: string
  full_name: string
  sales_brand: string
  sales_category: string
  is_active: string
  deleted_at: string | null
}
