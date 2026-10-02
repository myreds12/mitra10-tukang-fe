import React, {useState, useEffect, useRef, useCallback} from 'react'
import AsyncSelect from 'react-select/async'
import type {OptionsOrGroups, GroupBase} from 'react-select'
import Swal from 'sweetalert2'
import {getStoreDisplayName, getVendorDisplayName, normalizeLiveChatRoom} from './roomDisplay'
import {isLiveChatVideo, LIVECHAT_UPLOAD_ACCEPT, validateLiveChatUpload} from './uploadValidation'

const API_URL =
  process.env.REACT_APP_LIVECHAT_API_URL || 'https://apigatewayinstalasi.mitra10.com/live-chat'

// ─── HELPERS ─────────────────────────────────────────────────
const formatTime = (date: string) => {
  const d = new Date(date)
  return d.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})
}
const formatDate = (date: string) => {
  const d = new Date(date)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Hari ini'
  return d.toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})
}
const getInitials = (name = '') =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
const avatarColor = (name = '') => {
  const colors = ['#e8b4b8', '#b4d4e8', '#b4e8c8', '#e8dab4', '#d4b4e8', '#b4e8e4']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31
  return colors[Math.abs(hash) % colors.length]
}

// ─── TYPES ───────────────────────────────────────────────────
interface Room {
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
interface Participant {
  userId: string
  userName: string
  role: string
  isOnline?: boolean
}
interface LastMessage {
  id: number
  content: string
  type: string
  senderName: string
  createdAt: string
}
interface Message {
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
interface MediaPreview {
  url: string
  fileName?: string
  type: 'image' | 'video'
}
interface Store {
  id: number
  store_name: string
}
interface Vendor {
  id: number
  company_name: string
}

// ─── API ─────────────────────────────────────────────────────
const buildHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
})
const api = {
  getRooms: (token: string) =>
    fetch(`${API_URL}/rooms`, {headers: buildHeaders(token)}).then((r) => r.json()),
  getMessages: (token: string, roomId: number) =>
    fetch(`${API_URL}/rooms/${roomId}/messages?limit=30`, {headers: buildHeaders(token)}).then(
      (r) => r.json()
    ),
  sendMessage: (token: string, roomId: number, content: string) =>
    fetch(`${API_URL}/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify({content, type: 'text'}),
    }).then((r) => r.json()),
  markAsRead: (token: string, roomId: number) =>
    fetch(`${API_URL}/rooms/${roomId}/read`, {method: 'PATCH', headers: buildHeaders(token)}),
  createRoom: (token: string, orderId: string) =>
    fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify({orderId}),
    }).then((r) => r.json()),
  createDirectStore: (token: string, storeId: string) =>
    fetch(`${API_URL}/rooms/direct-store`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify({storeId}),
    }).then((r) => r.json()),
  createDirectVendor: (token: string, vendorId: string) =>
    fetch(`${API_URL}/rooms/direct-vendor`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify({vendorId}),
    }).then((r) => r.json()),
  getStores: (token: string, search?: string) =>
    fetch(`${API_URL}/rooms/stores${search ? `?search=${encodeURIComponent(search)}` : ''}`, {
      headers: buildHeaders(token),
    }).then((r) => r.json()),
  getVendors: (token: string, search?: string) =>
    fetch(`${API_URL}/rooms/vendors${search ? `?search=${encodeURIComponent(search)}` : ''}`, {
      headers: buildHeaders(token),
    }).then((r) => r.json()),
  uploadFile: (token: string, roomId: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return fetch(`${API_URL}/rooms/${roomId}/upload`, {
      method: 'POST',
      headers: {Authorization: `Bearer ${token}`},
      body: form,
    }).then(async (r) => {
      // Handle non-JSON responses (e.g., gateway errors, HTML pages)
      const contentType = r.headers.get('content-type') || ''
      if (!r.ok) {
        let errorMessage = `Upload gagal (HTTP ${r.status})`
        if (contentType.includes('application/json')) {
          const errData = await r.json()
          errorMessage = errData?.message || errorMessage
        } else {
          const text = await r.text().catch(() => '')
          if (text) {
            // Extract meaningful error from HTML if possible
            const match = text.match(/<title>(.*?)<\/title>/i)
            if (match) errorMessage = `Upload gagal: ${match[1]}`
          }
        }
        return {success: false, message: errorMessage}
      }
      if (!contentType.includes('application/json')) {
        return {success: false, message: 'Respons server tidak valid. Pastikan koneksi stabil.'}
      }
      return r.json()
    })
  },
  deleteRoom: (token: string, roomId: number) =>
    fetch(`${API_URL}/rooms/${roomId}`, {
      method: 'DELETE',
      headers: buildHeaders(token),
    }).then((r) => r.json()),
}

// ─── MINI COMPONENTS ─────────────────────────────────────────
const Avatar: React.FC<{name: string; size?: number}> = ({name, size = 32}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: avatarColor(name),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.35,
      fontWeight: 700,
      color: '#3a3a3a',
      flexShrink: 0,
    }}
  >
    {getInitials(name)}
  </div>
)

const getRoomLabel = (room: Room): string => {
  const normalizedRoom = normalizeLiveChatRoom(room) as Room

  if (normalizedRoom.type === 'DIRECT_STORE') {
    return getStoreDisplayName(normalizedRoom) || `Store ${normalizedRoom.storeId}`
  }
  if (normalizedRoom.type === 'DIRECT_VENDOR') {
    return getVendorDisplayName(normalizedRoom) || `Vendor ${normalizedRoom.vendorId}`
  }
  if (normalizedRoom.orderId) return `Order #${normalizedRoom.orderId}`
  return `Room #${normalizedRoom.id}`
}

const getRoomTypeIcon = (room: Room) => {
  if (room.type === 'DIRECT_STORE') return 'bi-shop'
  if (room.type === 'DIRECT_VENDOR') return 'bi-truck'
  return 'bi-box-seam'
}

const buildLastMessage = (message: Message): LastMessage => ({
  id: message.id,
  content: message.content,
  type: message.type,
  senderName: message.senderName,
  createdAt: message.createdAt,
})

const getRoomActivityTimestamp = (room: Room) => {
  const lastMessageTime = room.lastMessage?.createdAt
    ? new Date(room.lastMessage.createdAt).getTime()
    : 0
  const updatedAtTime = room.updatedAt ? new Date(room.updatedAt).getTime() : 0
  return Math.max(lastMessageTime, updatedAtTime)
}

const sortRoomsByActivity = (rooms: Room[]) =>
  [...rooms].sort((a, b) => {
    const timeDiff = getRoomActivityTimestamp(b) - getRoomActivityTimestamp(a)
    if (timeDiff !== 0) return timeDiff
    return b.id - a.id
  })

const updateRoomList = (rooms: Room[], roomId: number, updater: (room: Room) => Room) =>
  sortRoomsByActivity(rooms.map((room) => (room.id === roomId ? updater(room) : room)))

const mergeRoomIntoList = (rooms: Room[], room: Room) => {
  const nextRoom = normalizeLiveChatRoom(room) as Room
  const nextRooms = rooms.some((existingRoom) => existingRoom.id === nextRoom.id)
    ? rooms.map((existingRoom) =>
        existingRoom.id !== nextRoom.id
          ? existingRoom
          : {
              ...existingRoom,
              ...nextRoom,
              // Always prefer names from API response (nextRoom)
              storeName: nextRoom.storeName || existingRoom.storeName,
              vendorName: nextRoom.vendorName || existingRoom.vendorName,
              store: nextRoom.store || existingRoom.store,
              vendor: nextRoom.vendor || existingRoom.vendor,
            }
      )
    : [nextRoom, ...rooms]

  return sortRoomsByActivity(nextRooms)
}

// ─── CREATE ROOM MODAL ────────────────────────────────────────
const CreateModal: React.FC<{
  token: string
  onClose: () => void
  onCreated: (room: Room) => void
}> = ({token, onClose, onCreated}) => {
  const [step, setStep] = useState<null | 'order' | 'store' | 'vendor'>(null)
  const [orderId, setOrderId] = useState('')
  const [selectedStore, setSelectedStore] = useState('')
  const [selectedVendor, setSelectedVendor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Store ALL stores/vendors for filtering
  const [allStores, setAllStores] = useState<Store[]>([])
  const [allVendors, setAllVendors] = useState<Vendor[]>([])
  const [loadingList, setLoadingList] = useState(false)

  // Helper to get store options filtered by search (from local data)
  const getStoreOptions = (inputValue: string) =>
    allStores
      .filter((s) => s.store_name.toLowerCase().includes(inputValue.toLowerCase()))
      .map((s) => ({value: String(s.id), label: s.store_name}))

  // Helper to get vendor options filtered by search (from local data)
  const getVendorOptions = (inputValue: string) =>
    allVendors
      .filter((v) => v.company_name.toLowerCase().includes(inputValue.toLowerCase()))
      .map((v) => ({value: String(v.id), label: v.company_name}))

  // Load stores on first open
  const loadStoresIfNeeded = useCallback(() => {
    if (allStores.length === 0) {
      setLoadingList(true)
      api
        .getStores(token, '')
        .then((r: any) => {
          setAllStores((r.data || []) as Store[])
        })
        .catch(() => {})
        .finally(() => setLoadingList(false))
    }
  }, [allStores.length, token])

  // Load vendors on first open
  const loadVendorsIfNeeded = useCallback(() => {
    if (allVendors.length === 0) {
      setLoadingList(true)
      api
        .getVendors(token, '')
        .then((r: any) => {
          setAllVendors((r.data || []) as Vendor[])
        })
        .catch(() => {})
        .finally(() => setLoadingList(false))
    }
  }, [allVendors.length, token])

  const goStore = () => {
    setStep('store')
    setSelectedStore('')
    setError('')
    loadStoresIfNeeded()
  }
  const goVendor = () => {
    setStep('vendor')
    setSelectedVendor('')
    setError('')
    loadVendorsIfNeeded()
  }

  const canSubmit = () => {
    if (step === 'order') return orderId.trim().length > 0
    if (step === 'store') return selectedStore !== ''
    if (step === 'vendor') return selectedVendor !== ''
    return false
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      let res: any
      let fallbackStoreName: string | undefined
      let fallbackVendorName: string | undefined

      if (step === 'order') {
        res = await api.createRoom(token, orderId.trim())
      } else if (step === 'store') {
        res = await api.createDirectStore(token, selectedStore)
        // Get store name from local state (already loaded)
        if (res?.success) {
          const storeData = allStores.find((s: Store) => String(s.id) === selectedStore)
          fallbackStoreName = storeData?.store_name
        }
      } else if (step === 'vendor') {
        res = await api.createDirectVendor(token, selectedVendor)
        // Get vendor name from local state (already loaded)
        if (res?.success) {
          const vendorData = allVendors.find((v: Vendor) => String(v.id) === selectedVendor)
          fallbackVendorName = vendorData?.company_name
        }
      }

      if (res?.success) {
        const createdRoom = normalizeLiveChatRoom(res.data || {}, {
          fallbackType:
            step === 'store' ? 'DIRECT_STORE' : step === 'vendor' ? 'DIRECT_VENDOR' : 'ORDER',
          fallbackStoreId: step === 'store' ? selectedStore : undefined,
          fallbackStoreName,
          fallbackVendorId: step === 'vendor' ? selectedVendor : undefined,
          fallbackVendorName,
        }) as Room
        onCreated(createdRoom)
        onClose()
      } else setError(res?.message || 'Gagal membuat room')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.46)',
        backdropFilter: 'blur(6px)',
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
          borderRadius: 20,
          width: '92%',
          maxWidth: 360,
          border: '1px solid #dbe7f5',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.26)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid #e7eef7',
            background: 'linear-gradient(180deg, #f5faff 0%, #ffffff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{fontWeight: 700, fontSize: 15, color: '#102a43'}}>
            {!step
              ? 'Mulai Chat'
              : step === 'order'
              ? 'Chat Order'
              : step === 'store'
              ? 'Chat Store'
              : 'Chat Vendor'}
          </span>
          <button
            className='btn btn-sm btn-icon'
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: '#f4f7fb',
              border: '1px solid #d7e3f0',
              color: '#486581',
            }}
          >
            <i className='bi bi-x fs-5' />
          </button>
        </div>

        {/* Body */}
        <div style={{padding: 18, background: '#fbfdff'}}>
          {!step && (
            <div className='d-flex flex-column gap-2'>
              {[
                {
                  icon: 'bi-box-seam',
                  label: 'Berdasarkan Order',
                  sub: 'Masukkan Order ID',
                  action: () => setStep('order'),
                },
                {
                  icon: 'bi-shop',
                  label: 'Chat dengan Store',
                  sub: 'Pilih dari daftar store',
                  action: () => goStore(),
                },
                {
                  icon: 'bi-truck',
                  label: 'Chat dengan Vendor',
                  sub: 'Pilih dari daftar vendor',
                  action: () => goVendor(),
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className='btn text-start d-flex align-items-center gap-3 p-3'
                  style={{
                    border: '1px solid #d8e5f2',
                    borderRadius: 14,
                    background: '#ffffff',
                    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #eaf5ff, #dceeff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <i className={`bi ${item.icon}`} style={{color: '#0f63ff', fontSize: 18}} />
                  </div>
                  <div>
                    <div style={{fontWeight: 700, fontSize: 13, color: '#102a43'}}>
                      {item.label}
                    </div>
                    <div style={{fontSize: 11, color: '#6b7c93'}}>{item.sub}</div>
                  </div>
                  <i className='bi bi-chevron-right text-muted ms-auto' />
                </button>
              ))}
            </div>
          )}

          {step === 'order' && (
            <div>
              <label className='form-label fw-bold fs-7'>Order ID</label>
              <input
                className='form-control form-control-sm'
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canSubmit() && handleSubmit()}
                placeholder='Contoh: 12345'
                autoFocus
              />
            </div>
          )}

          {step === 'store' && (
            <div>
              <label className='form-label fw-bold fs-7'>Pilih Store</label>
              {loadingList ? (
                <div className='text-center py-3 text-muted'>
                  <span className='spinner-border spinner-border-sm me-2' />
                  Memuat...
                </div>
              ) : (
                <AsyncSelect
                  placeholder='Ketik untuk mencari store...'
                  loadOptions={(input) => Promise.resolve(getStoreOptions(input))}
                  defaultOptions={true}
                  noOptionsMessage={({inputValue}) =>
                    inputValue ? 'Store tidak ditemukan' : 'Ketik nama store'
                  }
                  onChange={(opt: any) => setSelectedStore(opt ? opt.value : '')}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: 10,
                      fontSize: 13,
                      borderColor: '#d7e3f0',
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: 10,
                      fontSize: 13,
                      zIndex: 9999,
                    }),
                  }}
                />
              )}
            </div>
          )}

          {step === 'vendor' && (
            <div>
              <label className='form-label fw-bold fs-7'>Pilih Vendor</label>
              {loadingList ? (
                <div className='text-center py-3 text-muted'>
                  <span className='spinner-border spinner-border-sm me-2' />
                  Memuat...
                </div>
              ) : (
                <AsyncSelect
                  placeholder='Ketik untuk mencari vendor...'
                  loadOptions={(input) => Promise.resolve(getVendorOptions(input))}
                  defaultOptions={true}
                  noOptionsMessage={({inputValue}) =>
                    inputValue ? 'Vendor tidak ditemukan' : 'Ketik nama vendor'
                  }
                  onChange={(opt: any) => setSelectedVendor(opt ? opt.value : '')}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: 10,
                      fontSize: 13,
                      borderColor: '#d7e3f0',
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: 10,
                      fontSize: 13,
                      zIndex: 9999,
                    }),
                  }}
                />
              )}
            </div>
          )}

          {error && step && <div className='alert alert-danger mt-3 py-2 fs-8'>{error}</div>}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 18px',
            borderTop: '1px solid #e7eef7',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            background: '#ffffff',
          }}
        >
          {step ? (
            <>
              <button
                className='btn btn-sm'
                onClick={() => {
                  setStep(null)
                  setError('')
                  setSelectedStore('')
                  setSelectedVendor('')
                }}
                style={{
                  minWidth: 108,
                  borderRadius: 10,
                  background: '#eef4ff',
                  border: '1px solid #cfe0ff',
                  color: '#0f63ff',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  fontSize: 0,
                }}
              >
                <i className='bi bi-arrow-left-short' style={{fontSize: 16}} />
                <span style={{fontSize: 12}}>Kembali</span>
              </button>
              <button
                className='btn btn-sm btn-primary'
                onClick={handleSubmit}
                disabled={loading || !canSubmit()}
                style={{
                  minWidth: 116,
                  borderRadius: 10,
                  fontWeight: 600,
                  boxShadow: '0 10px 24px rgba(15, 99, 255, 0.22)',
                }}
              >
                {loading ? <span className='spinner-border spinner-border-sm me-1' /> : null}
                Mulai Chat
              </button>
            </>
          ) : (
            <button
              className='btn btn-sm'
              onClick={onClose}
              style={{
                borderRadius: 10,
                background: '#f4f7fb',
                border: '1px solid #d7e3f0',
                color: '#486581',
                fontWeight: 600,
              }}
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────
const Bubble: React.FC<{
  msg: Message
  isMe: boolean
  showMeta: boolean
  showDate: boolean
  onPreviewMedia: (media: MediaPreview) => void
}> = ({msg, isMe, showMeta, showDate, onPreviewMedia}) => {
  const isImage = msg.type === 'image'
  const isVideo = isLiveChatVideo(msg.type, msg.fileName, msg.fileUrl)
  const isFile = msg.type === 'file'
  const canPreview = (isImage || isVideo) && !!msg.fileUrl

  return (
    <>
      {showDate && (
        <div style={{textAlign: 'center', margin: '8px 0'}}>
          <span
            style={{
              background: '#e9ecef',
              borderRadius: 20,
              padding: '2px 12px',
              fontSize: 11,
              color: '#666',
            }}
          >
            {formatDate(msg.createdAt)}
          </span>
        </div>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: isMe ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
          gap: 6,
          marginBottom: 4,
          paddingLeft: isMe ? 40 : 0,
          paddingRight: isMe ? 0 : 40,
        }}
      >
        {!isMe && (
          <div style={{width: 24, flexShrink: 0}}>
            {showMeta && <Avatar name={msg.senderName} size={24} />}
          </div>
        )}
        <div style={{maxWidth: '75%'}}>
          {!isMe && showMeta && (
            <div style={{fontSize: 10, fontWeight: 700, color: '#888', marginBottom: 2}}>
              {msg.senderName}
            </div>
          )}
          <div
            style={{
              background: isMe ? '#009ef7' : '#f0f2f5',
              borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: isImage || isVideo ? 4 : '8px 12px',
              overflow: 'hidden',
              boxShadow: canPreview ? '0 8px 20px rgba(15, 23, 42, 0.08)' : 'none',
            }}
          >
            {isImage ? (
              <button
                type='button'
                onClick={() =>
                  msg.fileUrl &&
                  onPreviewMedia({url: msg.fileUrl, fileName: msg.fileName, type: 'image'})
                }
                style={{
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  background: 'transparent',
                  cursor: 'zoom-in',
                  display: 'block',
                  position: 'relative',
                  borderRadius: 12,
                }}
                title='Klik untuk lihat detail gambar'
              >
                <img
                  src={msg.fileUrl}
                  alt={msg.fileName || 'image'}
                  style={{maxWidth: 180, maxHeight: 160, display: 'block', borderRadius: 12}}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: 8,
                    bottom: 8,
                    background: 'rgba(15,23,42,0.72)',
                    color: '#fff',
                    borderRadius: 999,
                    padding: '3px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <i className='bi bi-arrows-fullscreen' />
                  Detail
                </span>
              </button>
            ) : isVideo ? (
              <button
                type='button'
                onClick={() =>
                  msg.fileUrl &&
                  onPreviewMedia({url: msg.fileUrl, fileName: msg.fileName, type: 'video'})
                }
                style={{
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  background: '#000',
                  cursor: 'zoom-in',
                  display: 'block',
                  position: 'relative',
                  borderRadius: 12,
                }}
                title='Klik untuk lihat detail video'
              >
                <video
                  preload='metadata'
                  muted
                  playsInline
                  style={{
                    maxWidth: 180,
                    maxHeight: 160,
                    display: 'block',
                    borderRadius: 12,
                    background: '#000',
                  }}
                >
                  <source src={msg.fileUrl} />
                  Browser Anda belum mendukung pemutaran video.
                </video>
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(180deg, rgba(15,23,42,0.05), rgba(15,23,42,0.28))',
                  }}
                >
                  <span
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.92)',
                      color: '#111827',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 10px 25px rgba(15,23,42,0.28)',
                    }}
                  >
                    <i className='bi bi-play-fill' style={{fontSize: 20, marginLeft: 2}} />
                  </span>
                </span>
                <span
                  style={{
                    position: 'absolute',
                    right: 8,
                    bottom: 8,
                    background: 'rgba(15,23,42,0.72)',
                    color: '#fff',
                    borderRadius: 999,
                    padding: '3px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  Buka Video
                </span>
              </button>
            ) : isFile ? (
              <a
                href={msg.fileUrl}
                target='_blank'
                rel='noreferrer'
                style={{
                  color: isMe ? '#fff' : '#333',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                }}
              >
                <i className='bi bi-paperclip' />
                {msg.fileName || 'File'}
              </a>
            ) : (
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: isMe ? '#fff' : '#333',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.4,
                }}
              >
                {msg.content}
              </p>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              marginTop: 2,
              justifyContent: isMe ? 'flex-end' : 'flex-start',
            }}
          >
            <span style={{fontSize: 10, color: '#aaa'}}>{formatTime(msg.createdAt)}</span>
            {isMe && (
              <i
                className='bi bi-check2-all'
                style={{fontSize: 10, color: msg.isRead ? '#009ef7' : '#bbb'}}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const MediaPreviewOverlay: React.FC<{
  media: MediaPreview
  onClose: () => void
}> = ({media, onClose}) => {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        background: 'rgba(2, 6, 23, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(920px, 100%)',
          maxHeight: 'calc(100vh - 40px)',
          background: '#0f172a',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            background: 'linear-gradient(135deg, rgba(14,165,233,0.22), rgba(15,23,42,0.94))',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{minWidth: 0}}>
            <div style={{color: '#f8fafc', fontWeight: 700, fontSize: 14}}>
              {media.type === 'image' ? 'Detail Gambar' : 'Detail Video'}
            </div>
            <div
              style={{
                color: 'rgba(248,250,252,0.72)',
                fontSize: 12,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {media.fileName || 'Media livechat'}
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0}}>
            <a
              href={media.url}
              target='_blank'
              rel='noreferrer'
              style={{
                background: 'rgba(255,255,255,0.14)',
                color: '#fff',
                borderRadius: 10,
                padding: '8px 10px',
                textDecoration: 'none',
                fontSize: 12,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <i className='bi bi-box-arrow-up-right' />
              Tab Baru
            </a>
            <button
              type='button'
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: 'none',
                background: 'rgba(255,255,255,0.14)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title='Tutup preview'
            >
              <i className='bi bi-x-lg' />
            </button>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'radial-gradient(circle at top, rgba(14,165,233,0.12), transparent 35%), #020617',
          }}
        >
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt={media.fileName || 'preview'}
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(100vh - 180px)',
                objectFit: 'contain',
                borderRadius: 16,
                boxShadow: '0 24px 55px rgba(0,0,0,0.38)',
              }}
            />
          ) : (
            <video
              src={media.url}
              controls
              autoPlay
              playsInline
              preload='metadata'
              style={{
                width: '100%',
                maxWidth: 860,
                maxHeight: 'calc(100vh - 180px)',
                borderRadius: 16,
                background: '#000',
                boxShadow: '0 24px 55px rgba(0,0,0,0.38)',
              }}
            >
              Browser Anda belum mendukung pemutaran video.
            </video>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN POPUP COMPONENT ─────────────────────────────────────
const LiveChatPopup: React.FC = () => {
  const token = localStorage.getItem('accessToken') || ''
  const userId = localStorage.getItem('user_id') || ''
  const userRole = localStorage.getItem('userRole') || ''

  // Hanya tampilkan untuk role yang diizinkan — cek SETELAH semua hooks
  const allowedRoles = ['Store CS', 'Admin HO', 'Super User', 'Admin Vendor', 'Owner Vendor']
  const isAllowed = allowedRoles.includes(userRole)

  const [open, setOpen] = useState(false)

  // Sinkronisasi status livechat internal ke class body agar widget eksternal (Yellow.ai)
  // tersusun rapi secara vertikal (atas-bawah) tanpa tumpang tindih.
  useEffect(() => {
    if (isAllowed) {
      document.body.classList.add('has-internal-livechat')
      return () => {
        document.body.classList.remove('has-internal-livechat')
      }
    } else {
      document.body.classList.remove('has-internal-livechat')
    }
  }, [isAllowed])

  useEffect(() => {
    if (open) {
      document.body.classList.add('livechat-popup-is-open')
    } else {
      document.body.classList.remove('livechat-popup-is-open')
    }
    return () => {
      document.body.classList.remove('livechat-popup-is-open')
    }
  }, [open])
  const [view, setView] = useState<'rooms' | 'chat'>('rooms')
  const [rooms, setRooms] = useState<Room[]>([])
  const [activeRoom, setActiveRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sseConnected, setSseConnected] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalUnread, setTotalUnread] = useState(0)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [previewMedia, setPreviewMedia] = useState<MediaPreview | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null) // ← scroll target: BOTTOM (newest messages)
  const sseRef = useRef<EventSource | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const activeRoomRef = useRef<Room | null>(null)

  useEffect(() => {
    activeRoomRef.current = activeRoom
  }, [activeRoom])

  // ── Global SSE (room list real-time sync) ───────────────────
  const clearSSE = useCallback(() => {
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current)
      reconnectRef.current = null
    }
    if (sseRef.current) {
      sseRef.current.close()
      sseRef.current = null
    }
    setSseConnected(false)
  }, [])

  const connectGlobalSSE = useCallback(() => {
    clearSSE()
    const es = new EventSource(`${API_URL}/rooms/sse?token=${token}`)
    sseRef.current = es

    es.addEventListener('CONNECTED', () => setSseConnected(true))

    // NEW_MESSAGE: pesan baru dari room manapun
    es.addEventListener('NEW_MESSAGE', (e: MessageEvent) => {
      try {
        const msg: Message = JSON.parse(e.data)
        const isActiveRoom = activeRoomRef.current?.id === msg.roomId

        // Update room list state (last message, timestamp, unread)
        setRooms((prev) =>
          updateRoomList(prev, msg.roomId, (room) => ({
            ...room,
            lastMessage: buildLastMessage(msg),
            updatedAt: msg.createdAt,
            unreadCount: isActiveRoom ? 0 : room.unreadCount,
          }))
        )

        // Update chat window only if this room is currently open
        if (isActiveRoom) {
          setMessages((prev) => (prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]))
          if (String(msg.senderId) !== String(userId)) {
            void api.markAsRead(token, msg.roomId).catch(() => undefined)
          }
          setTimeout(() => messagesEndRef.current?.scrollIntoView({behavior: 'smooth'}), 50)
        }
      } catch {}
    })

    es.addEventListener('READ_RECEIPT', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        setMessages((prev) =>
          prev.map((m) => (data.messageIds?.includes(m.id) ? {...m, isRead: true} : m))
        )
      } catch {}
    })

    es.addEventListener('USER_ONLINE', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        setOnlineUsers((prev) => {
          const n = new Set(prev)
          n.add(data.userId)
          return n
        })
      } catch {}
    })

    es.addEventListener('USER_OFFLINE', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        setOnlineUsers((prev) => {
          const n = new Set(prev)
          n.delete(data.userId)
          return n
        })
      } catch {}
    })

    es.addEventListener('UNREAD_NOTIFICATION', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        if (activeRoomRef.current?.id === data.roomId) {
          void api.markAsRead(token, data.roomId).catch(() => undefined)
          return
        }
        setRooms((prev) =>
          updateRoomList(prev, data.roomId, (room) => ({
            ...room,
            unreadCount: (room.unreadCount || 0) + 1,
            updatedAt: new Date().toISOString(),
          }))
        )
        setTotalUnread((n) => n + 1)
      } catch {}
    })

    es.addEventListener('ROOM_CREATED', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        const nextRoom = normalizeLiveChatRoom(data.room || {}) as Room
        setRooms((prev) => mergeRoomIntoList(prev, nextRoom))
      } catch {}
    })

    es.onerror = () => {
      setSseConnected(false)
      if (sseRef.current !== es) return
      es.close()
      reconnectRef.current = setTimeout(() => {
        if (open) connectGlobalSSE()
      }, 3000)
    }
  }, [token, clearSSE, open])

  // ── Load Rooms ─────────────────────────────────────────────
  const loadRooms = useCallback(async () => {
    if (!token) return
    setLoadingRooms(true)
    try {
      const res = await api.getRooms(token)
      if (res.success) {
        const normalizedRooms = (res.data || []).map((room: Room) =>
          normalizeLiveChatRoom(room)
        ) as Room[]
        setRooms(sortRoomsByActivity(normalizedRooms))
        setActiveRoom((prev) =>
          prev ? normalizedRooms.find((room) => room.id === prev.id) || prev : prev
        )
        const unread = normalizedRooms.reduce(
          (sum: number, r: Room) => sum + (r.unreadCount || 0),
          0
        )
        setTotalUnread(unread)
      }
    } catch {
    } finally {
      setLoadingRooms(false)
    }
  }, [token])

  // ── Open Room ──────────────────────────────────────────────
  const openRoom = useCallback(
    async (room: Room) => {
      const normalizedRoom = normalizeLiveChatRoom(room) as Room
      // Sync ref FIRST to avoid race condition with SSE handlers
      activeRoomRef.current = normalizedRoom
      setActiveRoom(normalizedRoom)
      setView('chat')
      setMessages([])
      setOnlineUsers(new Set())
      setLoadingMessages(true)

      // 🧹 KOSONGKAN PANEL KANAN DULU
      try {
        const res = await api.getMessages(token, room.id)
        if (res.success && Array.isArray(res.data)) {
          setMessages(res.data.reverse()) // oldest-first for display, newest at bottom
        }
        await api.markAsRead(token, room.id)
        setRooms((prev) => prev.map((r) => (r.id === room.id ? {...r, unreadCount: 0} : r)))
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingMessages(false)
        setTimeout(() => messagesEndRef.current?.scrollIntoView({behavior: 'auto'}), 100)
      }
    },
    [token]
  )
  // ── Send ───────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || !activeRoom || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    try {
      const res = await api.sendMessage(token, activeRoom.id, content)
      if (res.success) {
        setMessages((prev) => (prev.find((m) => m.id === res.data.id) ? prev : [...prev, res.data])) // ← newest at BOTTOM
        setRooms((prev) =>
          updateRoomList(prev, activeRoom.id, (room) => ({
            ...room,
            lastMessage: buildLastMessage(res.data),
            updatedAt: res.data.createdAt,
            unreadCount: 0,
          }))
        )
        setTimeout(() => messagesEndRef.current?.scrollIntoView({behavior: 'smooth'}), 50)
      }
    } catch {
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file || !activeRoom) return

    const validationError = validateLiveChatUpload(file)

    if (validationError) {
      await Swal.fire({
        title: 'Upload gagal',
        text: validationError,
        icon: 'error',
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    try {
      const res = await api.uploadFile(token, activeRoom.id, file)
      if (res.success) {
        setMessages((prev) => (prev.find((m) => m.id === res.data.id) ? prev : [...prev, res.data])) // ← newest at BOTTOM
        setRooms((prev) =>
          updateRoomList(prev, activeRoom.id, (room) => ({
            ...room,
            lastMessage: buildLastMessage(res.data),
            updatedAt: res.data.createdAt,
            unreadCount: 0,
          }))
        )
        setTimeout(() => messagesEndRef.current?.scrollIntoView({behavior: 'smooth'}), 50)
      } else {
        await Swal.fire({
          title: 'Upload gagal',
          text: res?.message || 'File tidak dapat diupload.',
          icon: 'error',
        })
      }
    } catch {
      await Swal.fire({
        title: 'Upload gagal',
        text: 'Terjadi kendala saat mengirim file.',
        icon: 'error',
      })
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRoomCreated = (room: Room) => {
    const normalizedRoom = normalizeLiveChatRoom(room) as Room
    setRooms((prev) => mergeRoomIntoList(prev, normalizedRoom))
    openRoom(normalizedRoom)
  }

  const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null)

  const handleDeleteRoom = async (room: Room, e: React.MouseEvent) => {
    e.stopPropagation()

    const result = await Swal.fire({
      title: 'Hapus Room?',
      text: `Yakin ingin menghapus "${getRoomLabel(room)}"? Semua pesan akan ikut terhapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f1416c',
      cancelButtonColor: '#6b7c93',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    })

    if (!result.isConfirmed) return

    setDeletingRoomId(room.id)
    try {
      const res = await api.deleteRoom(token, room.id)
      if (res.success) {
        setRooms((prev) => prev.filter((r) => r.id !== room.id))
        if (activeRoom?.id === room.id) {
          setActiveRoom(null)
          setView('rooms')
          clearSSE()
        }
        await Swal.fire({
          title: 'Berhasil',
          text: 'Room berhasil dihapus',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        })
      } else {
        await Swal.fire({
          title: 'Gagal',
          text: res?.message || 'Gagal menghapus room',
          icon: 'error',
        })
      }
    } catch {
      await Swal.fire({
        title: 'Error',
        text: 'Terjadi kesalahan saat menghapus room',
        icon: 'error',
      })
    } finally {
      setDeletingRoomId(null)
    }
  }

  // ── Effects ────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      loadRooms()
      connectGlobalSSE()
    } else {
      clearSSE()
    }
  }, [open, loadRooms, connectGlobalSSE, clearSSE])

  // NOTE: Removed auto-scroll on messages change
  // - Initial load: oldest at TOP, newest at BOTTOM
  // - New message: auto-scroll to BOTTOM handled in SSE/send/upload handlers below

  useEffect(() => {
    if (!open || view !== 'chat') setPreviewMedia(null)
  }, [open, view])

  useEffect(() => {
    if (!previewMedia) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewMedia(null)
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [previewMedia])

  const filteredRooms = rooms.filter((r) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return getRoomLabel(r).toLowerCase().includes(q)
  })

  // ─── RENDER ────────────────────────────────────────────────
  if (!isAllowed) return null

  return (
    <>
      {/* ── FLOATING BUTTON ──────────────────────────────── */}
      <button
        id='livechat-popup-btn'
        className='livechat-popup-btn'
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 96,
          zIndex: 9998,
          width: open ? 50 : 82,
          height: open ? 50 : 'auto',
          borderRadius: open ? 16 : 0,
          background: open ? 'linear-gradient(135deg, #0f63ff 0%, #08a2cd 100%)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          boxShadow: open ? '0 12px 28px rgba(15,99,255,0.3)' : 'none',
          filter: open ? 'none' : 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))',
          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.05)'
          if (!open) {
            ;(e.currentTarget as HTMLElement).style.filter =
              'drop-shadow(0 6px 16px rgba(19,50,142,0.35))'
          }
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)'
          if (!open) {
            ;(e.currentTarget as HTMLElement).style.filter =
              'drop-shadow(0 4px 10px rgba(0,0,0,0.15))'
          }
        }}
        aria-label={open ? 'Tutup Live Chat' : 'Buka Live Chat'}
      >
        {open ? (
          <i className='bi bi-x-lg text-white fs-4' />
        ) : (
          <img
            src={`${process.env.PUBLIC_URL || ''}/media/livechat-yellow-ai.png`}
            alt='Live Chat Mitra10'
            draggable={false}
            style={{width: '100%', height: 'auto', display: 'block', pointerEvents: 'none'}}
          />
        )}
        {!open && totalUnread > 0 && (
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: '#f1416c',
              color: '#fff',
              borderRadius: '50%',
              width: 18,
              height: 18,
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff',
            }}
          >
            {totalUnread > 9 ? '9+' : totalUnread}
          </div>
        )}
      </button>

      {/* ── POPUP PANEL ──────────────────────────────────── */}
      {open && (
        <div
          className='livechat-popup-panel'
          style={{
            position: 'fixed',
            bottom: 88,
            right: 12,
            zIndex: 9997,
            width: 'min(400px, calc(100vw - 24px))',
            height: 'min(720px, calc(100vh - 116px))',
            background: 'linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)',
            borderRadius: 24,
            border: '1px solid #dbe7f5',
            boxShadow: '0 28px 70px rgba(15, 23, 42, 0.24)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'popupSlideIn 0.2s ease-out',
          }}
        >
          <style>{`
            @keyframes popupSlideIn {
              from { opacity: 0; transform: translateY(16px) scale(0.97); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }

            .livechat-popup-panel *::-webkit-scrollbar {
              width: 8px;
            }

            .livechat-popup-panel *::-webkit-scrollbar-thumb {
              background: rgba(130, 150, 170, 0.35);
              border-radius: 999px;
            }

            .livechat-popup-panel *::-webkit-scrollbar-track {
              background: transparent;
            }

            .livechat-popup-search::placeholder {
              color: rgba(72, 101, 129, 0.78);
            }

            .livechat-popup-search:focus {
              box-shadow: 0 0 0 3px rgba(15, 99, 255, 0.12);
            }

            @media (max-width: 575px) {
              .livechat-popup-panel {
                bottom: 84px !important;
                height: calc(100vh - 104px) !important;
                border-radius: 20px !important;
              }

              .livechat-chat-participants {
                display: none !important;
              }
            }
          `}</style>

          {/* ── ROOMS VIEW ─────────────────────────────── */}
          {view === 'rooms' && (
            <>
              {/* Header */}
              <div
                style={{
                  padding: '18px 18px 16px',
                  background:
                    'linear-gradient(135deg, rgba(15,99,255,1) 0%, rgba(10,132,255,0.94) 54%, rgba(5,162,205,0.92) 100%)',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          background: 'rgba(255,255,255,0.16)',
                          border: '1px solid rgba(255,255,255,0.24)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <i className='bi bi-chat-dots-fill text-white' />
                      </div>
                      <div>
                        <div style={{color: '#fff', fontWeight: 700, fontSize: 15}}>Live Chat</div>
                        <div style={{color: 'rgba(255,255,255,0.76)', fontSize: 11}}>
                          Percakapan vendor, store, dan order
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <button
                      className='btn btn-sm'
                      style={{
                        background: '#ffffff',
                        color: '#0f63ff',
                        borderRadius: 10,
                        padding: '5px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        border: 'none',
                        boxShadow: '0 10px 24px rgba(7, 53, 112, 0.18)',
                      }}
                      onClick={() => setShowCreate(true)}
                    >
                      <i className='bi bi-plus-lg me-1' />
                      Baru
                    </button>
                    <button
                      className='btn btn-sm btn-icon'
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.24)',
                        background: 'rgba(255,255,255,0.14)',
                        color: '#fff',
                      }}
                      onClick={() => setOpen(false)}
                      title='Tutup live chat'
                    >
                      <i className='bi bi-x-lg' />
                    </button>
                  </div>
                </div>
                {/* Search */}
                <div
                  style={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.92)',
                    borderRadius: 14,
                    padding: 4,
                    boxShadow: '0 10px 22px rgba(7, 53, 112, 0.14)',
                  }}
                >
                  <i
                    className='bi bi-search'
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#7b8794',
                      fontSize: 13,
                    }}
                  />
                  <input
                    className='livechat-popup-search'
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 10,
                      padding: '10px 12px 10px 34px',
                      color: '#102a43',
                      fontSize: 12,
                      fontWeight: 500,
                      outline: 'none',
                    }}
                    placeholder='Cari room...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Room List */}
              <div style={{flex: 1, overflowY: 'auto', padding: '10px 10px 6px'}}>
                {loadingRooms ? (
                  <div style={{textAlign: 'center', padding: 32, color: '#aaa', fontSize: 13}}>
                    <span className='spinner-border spinner-border-sm me-2' />
                    Memuat...
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <div style={{textAlign: 'center', padding: 32, color: '#aaa', fontSize: 13}}>
                    {searchQuery ? 'Room tidak ditemukan' : 'Belum ada room chat'}
                  </div>
                ) : (
                  filteredRooms.map((room) => {
                    const isActive = activeRoom?.id === room.id
                    return (
                      <div
                        key={room.id}
                        onClick={() => openRoom(room)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '12px 14px',
                          cursor: 'pointer',
                          border: isActive ? '1px solid #b8d6ff' : '1px solid #e2ebf5',
                          borderRadius: 18,
                          background: isActive ? '#eef6ff' : '#ffffff',
                          marginBottom: 8,
                          boxShadow: isActive
                            ? '0 14px 28px rgba(15, 99, 255, 0.14)'
                            : '0 10px 24px rgba(15, 23, 42, 0.04)',
                          transition: 'background 0.12s, transform 0.12s, box-shadow 0.12s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isActive ? '#eef6ff' : '#f8fbff'
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = isActive
                            ? '0 16px 30px rgba(15, 99, 255, 0.18)'
                            : '0 14px 28px rgba(15, 23, 42, 0.08)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isActive ? '#eef6ff' : '#ffffff'
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = isActive
                            ? '0 14px 28px rgba(15, 99, 255, 0.14)'
                            : '0 10px 24px rgba(15, 23, 42, 0.04)'
                        }}
                      >
                        {/* Icon */}
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            flexShrink: 0,
                            background:
                              room.type === 'DIRECT_STORE'
                                ? '#e8fff0'
                                : room.type === 'DIRECT_VENDOR'
                                ? '#fff8e8'
                                : '#e8f4ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(15, 23, 42, 0.04)',
                          }}
                        >
                          <i
                            className={`bi ${getRoomTypeIcon(room)}`}
                            style={{
                              color:
                                room.type === 'DIRECT_STORE'
                                  ? '#50cd89'
                                  : room.type === 'DIRECT_VENDOR'
                                  ? '#ffa800'
                                  : '#009ef7',
                              fontSize: 16,
                            }}
                          />
                        </div>

                        {/* Info */}
                        <div style={{flex: 1, minWidth: 0}}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: 13,
                                color: '#1a1a2e',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 180,
                              }}
                            >
                              {getRoomLabel(room)}
                            </span>
                            {(room.unreadCount || 0) > 0 && (
                              <span
                                style={{
                                  background: '#009ef7',
                                  color: '#fff',
                                  borderRadius: '50%',
                                  width: 18,
                                  height: 18,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {(room.unreadCount || 0) > 9 ? '9+' : room.unreadCount}
                              </span>
                            )}
                            <button
                              className='btn btn-sm btn-icon'
                              onClick={(e) => handleDeleteRoom(room, e)}
                              disabled={deletingRoomId === room.id}
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 8,
                                border: 'none',
                                background: deletingRoomId === room.id ? '#fce8e8' : '#fff0f0',
                                color: '#f1416c',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                cursor: deletingRoomId === room.id ? 'not-allowed' : 'pointer',
                                opacity: deletingRoomId === room.id ? 0.6 : 1,
                              }}
                              title='Hapus room'
                            >
                              {deletingRoomId === room.id ? (
                                <span
                                  className='spinner-border spinner-border-sm'
                                  style={{width: 10, height: 10}}
                                />
                              ) : (
                                <i className='bi bi-trash-fill' style={{fontSize: 11}} />
                              )}
                            </button>
                          </div>
                          {room.lastMessage ? (
                            <div
                              style={{
                                fontSize: 11,
                                color: '#7b8794',
                                marginTop: 4,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {room.lastMessage.senderName}: {room.lastMessage.content}
                            </div>
                          ) : (
                            <div style={{fontSize: 11, color: '#9fb0c2', marginTop: 4}}>
                              Belum ada pesan
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Refresh */}
              <div
                style={{
                  padding: '10px 14px 14px',
                  borderTop: '1px solid #e7eef7',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3), #ffffff)',
                  flexShrink: 0,
                }}
              >
                <button
                  className='btn btn-sm w-100'
                  onClick={loadRooms}
                  style={{
                    fontSize: 12,
                    borderRadius: 12,
                    background: '#f4f7fb',
                    border: '1px solid #d7e3f0',
                    color: '#486581',
                    fontWeight: 600,
                  }}
                >
                  <i className='bi bi-arrow-clockwise me-1' />
                  Refresh
                </button>
              </div>
            </>
          )}

          {/* ── CHAT VIEW ──────────────────────────────── */}
          {view === 'chat' && activeRoom && (
            <>
              {/* Header */}
              <div
                style={{
                  padding: '14px 14px 12px',
                  background:
                    'linear-gradient(135deg, rgba(10,72,146,1) 0%, rgba(15,99,255,0.98) 50%, rgba(5,162,205,0.92) 100%)',
                  flexShrink: 0,
                  boxShadow: '0 16px 32px rgba(7, 53, 112, 0.2)',
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                  <button
                    className='btn btn-sm'
                    style={{
                      color: '#fff',
                      background: 'rgba(255,255,255,0.18)',
                      minWidth: 88,
                      height: 34,
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.24)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                    onClick={() => {
                      setView('rooms')
                    }}
                    title='Kembali ke daftar room'
                  >
                    <i className='bi bi-arrow-left-short' style={{fontSize: 16}} />
                    <span>Kembali</span>
                  </button>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div
                      style={{
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 14,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {getRoomLabel(activeRoom)}
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 4, marginTop: 1}}>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: sseConnected ? '#50cd89' : '#f1416c',
                        }}
                      />
                      <span style={{color: 'rgba(255,255,255,0.8)', fontSize: 10}}>
                        {sseConnected ? 'Live' : 'Reconnecting...'}
                      </span>
                    </div>
                  </div>
                  {/* Online participants */}
                  <div
                    className='livechat-chat-participants'
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px 6px',
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.16)',
                    }}
                  >
                    {activeRoom.participants?.slice(0, 3).map((p, i) => (
                      <div
                        key={p.userId}
                        style={{marginLeft: i > 0 ? -6 : 0, position: 'relative'}}
                      >
                        <Avatar name={p.userName} size={26} />
                        {onlineUsers.has(p.userId) && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: 7,
                              height: 7,
                              background: '#50cd89',
                              borderRadius: '50%',
                              border: '1.5px solid #009ef7',
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    className='btn btn-sm btn-icon'
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.24)',
                      background: 'rgba(255,255,255,0.14)',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                    onClick={() => setOpen(false)}
                    title='Tutup live chat'
                  >
                    <i className='bi bi-x-lg' />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '14px 14px 10px',
                  background: 'linear-gradient(180deg, #f7fbff 0%, #eef4ff 100%)',
                }}
              >
                {loadingMessages ? (
                  <div style={{textAlign: 'center', padding: 32, color: '#aaa', fontSize: 13}}>
                    <span className='spinner-border spinner-border-sm me-2' />
                    Memuat pesan...
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{textAlign: 'center', padding: 32, color: '#aaa', fontSize: 13}}>
                    Belum ada pesan. Mulai chat!
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const isMe = String(msg.senderId) === String(userId)
                      const prev = messages[i - 1]
                      const showMeta = !isMe && (!prev || prev.senderId !== msg.senderId)
                      const showDate =
                        !prev || formatDate(msg.createdAt) !== formatDate(prev.createdAt)
                      return (
                        <Bubble
                          key={msg.id}
                          msg={msg}
                          isMe={isMe}
                          showMeta={showMeta}
                          showDate={showDate}
                          onPreviewMedia={setPreviewMedia}
                        />
                      )
                    })}
                    {/* Scroll target: BOTTOM — newest messages appear here */}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div
                style={{
                  padding: '12px',
                  borderTop: '1px solid #e1e9f2',
                  background: 'rgba(255,255,255,0.96)',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 8,
                    background: '#ffffff',
                    borderRadius: 18,
                    padding: '8px 10px',
                    border: '1px solid #d7e3f0',
                    boxShadow: '0 14px 28px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  <button
                    className='btn btn-sm btn-icon'
                    style={{
                      width: 34,
                      height: 34,
                      flexShrink: 0,
                      color: '#0f63ff',
                      background: '#eef4ff',
                      border: '1px solid #cfe0ff',
                      borderRadius: 12,
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    title='Upload gambar, video, atau dokumen'
                  >
                    <i className='bi bi-paperclip fs-6' />
                  </button>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept={LIVECHAT_UPLOAD_ACCEPT}
                    style={{display: 'none'}}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder='Ketik pesan...'
                    rows={1}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      resize: 'none',
                      outline: 'none',
                      color: '#102a43',
                      fontSize: 13,
                      maxHeight: 96,
                      lineHeight: 1.4,
                      padding: '4px 2px',
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 14,
                      border: 'none',
                      background: !input.trim() || sending ? '#e9eef5' : '#0f63ff',
                      color: !input.trim() || sending ? '#9aa5b1' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: !input.trim() || sending ? 'not-allowed' : 'pointer',
                      flexShrink: 0,
                      transition: 'background 0.15s, transform 0.15s',
                      boxShadow:
                        !input.trim() || sending ? 'none' : '0 12px 26px rgba(15, 99, 255, 0.22)',
                    }}
                  >
                    {sending ? (
                      <span
                        className='spinner-border spinner-border-sm'
                        style={{width: 12, height: 12}}
                      />
                    ) : (
                      <i className='bi bi-send-fill' style={{fontSize: 12}} />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── CREATE MODAL OVERLAY ─────────────────────── */}
          {showCreate && (
            <CreateModal
              token={token}
              onClose={() => setShowCreate(false)}
              onCreated={handleRoomCreated}
            />
          )}
        </div>
      )}
      {previewMedia && (
        <MediaPreviewOverlay media={previewMedia} onClose={() => setPreviewMedia(null)} />
      )}
    </>
  )
}

export default LiveChatPopup
