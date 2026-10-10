export interface Participant {
  userId: string
  userName: string
  role: string
  isOnline?: boolean
}

export interface LastMessage {
  id: number
  content: string
  type: string
  senderName: string
  createdAt: string
}

export interface Room {
  id: number
  orderId?: string | number | null
  storeId?: string | number | null
  storeName?: string | null
  store_name?: string | null
  vendorId?: string | number | null
  vendorName?: string | null
  vendor_name?: string | null
  store?: {
    id?: string | number | null
    name?: string | null
    storeName?: string | null
    store_name?: string | null
  } | null
  vendor?: {
    id?: string | number | null
    name?: string | null
    vendorName?: string | null
    company_name?: string | null
  } | null
  type?: 'ORDER' | 'DIRECT_STORE' | 'DIRECT_VENDOR'
  unreadCount?: number
  participants?: Participant[]
  lastMessage?: LastMessage | null
  updatedAt?: string
}

export interface Message {
  id: number
  roomId: number
  senderId: string
  senderName: string
  senderRole: string
  content: string
  type: 'text' | 'image' | 'file' | 'video'
  fileUrl?: string
  fileName?: string
  createdAt: string
  isRead?: boolean
}

export interface MediaPreview {
  url: string
  fileName?: string
  type: 'image' | 'video'
}

export interface Store {
  id: number
  store_name: string
}

export interface Vendor {
  id: number
  company_name: string
}
