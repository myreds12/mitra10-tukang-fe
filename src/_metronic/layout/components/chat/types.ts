export interface ChatMessage {
  sender: string
  message: string | any
  timestamp: any
}

export interface VendorItem {
  id: string
  store_name?: string
  company_name?: string
  [key: string]: any
}

export interface StoreItem {
  id: string
  store_name: string
  [key: string]: any
}

export type ChatStep = 'start' | 'orderId' | 'vendor' | 'previous' | 'chat'

export interface ChatGroupMember {
  user: string
  read: boolean
}
