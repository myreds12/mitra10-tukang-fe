import React, {useState, useEffect, useRef, useCallback} from 'react'
import Swal from 'sweetalert2'
import {Room, Message, MediaPreview} from './types'
import {API_URL, api} from './liveChatApi'
import {
  getRoomLabel,
  buildLastMessage,
  updateRoomList,
  sortRoomsByActivity,
  mergeRoomIntoList,
} from './liveChatHelpers'
import {normalizeLiveChatRoom} from './roomDisplay'
import {validateLiveChatUpload} from './uploadValidation'
import {RoomListView} from './components/RoomListView'
import {ChatView} from './components/ChatView'
import {CreateModal} from './components/CreateModal'
import {MediaPreviewOverlay} from './components/MediaPreviewOverlay'

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
  }, [token, clearSSE, open, userId])

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
        setMessages((prev) => (prev.find((m) => m.id === res.data.id) ? prev : [...prev, res.data]))
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
        setMessages((prev) => (prev.find((m) => m.id === res.data.id) ? prev : [...prev, res.data]))
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
            <RoomListView
              setShowCreate={setShowCreate}
              setOpen={setOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              loadingRooms={loadingRooms}
              filteredRooms={filteredRooms}
              activeRoom={activeRoom}
              openRoom={openRoom}
              handleDeleteRoom={handleDeleteRoom}
              deletingRoomId={deletingRoomId}
              loadRooms={loadRooms}
            />
          )}

          {/* ── CHAT VIEW ──────────────────────────────── */}
          {view === 'chat' && activeRoom && (
            <ChatView
              activeRoom={activeRoom}
              setView={setView}
              setOpen={setOpen}
              sseConnected={sseConnected}
              onlineUsers={onlineUsers}
              loadingMessages={loadingMessages}
              messages={messages}
              userId={userId}
              onPreviewMedia={setPreviewMedia}
              messagesEndRef={messagesEndRef}
              fileInputRef={fileInputRef}
              inputRef={inputRef}
              input={input}
              setInput={setInput}
              sending={sending}
              handleSend={handleSend}
              handleFileUpload={handleFileUpload}
            />
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
