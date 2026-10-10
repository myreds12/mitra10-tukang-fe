import React from 'react'
import { Room, Message, LastMessage } from './types'
import { getStoreDisplayName, getVendorDisplayName, normalizeLiveChatRoom } from './roomDisplay'

export const formatTime = (date: string) => {
  const d = new Date(date)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export const formatDate = (date: string) => {
  const d = new Date(date)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Hari ini'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export const getInitials = (name = '') =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

export const avatarColor = (name = '') => {
  const colors = ['#e8b4b8', '#b4d4e8', '#b4e8c8', '#e8dab4', '#d4b4e8', '#b4e8e4']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31
  return colors[Math.abs(hash) % colors.length]
}

export const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 32 }) => (
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

export const getRoomLabel = (room: Room): string => {
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

export const getRoomTypeIcon = (room: Room) => {
  if (room.type === 'DIRECT_STORE') return 'bi-shop'
  if (room.type === 'DIRECT_VENDOR') return 'bi-truck'
  return 'bi-box-seam'
}

export const buildLastMessage = (message: Message): LastMessage => ({
  id: message.id,
  content: message.content,
  type: message.type,
  senderName: message.senderName,
  createdAt: message.createdAt,
})

export const getRoomActivityTimestamp = (room: Room) => {
  const lastMessageTime = room.lastMessage?.createdAt
    ? new Date(room.lastMessage.createdAt).getTime()
    : 0
  const updatedAtTime = room.updatedAt ? new Date(room.updatedAt).getTime() : 0
  return Math.max(lastMessageTime, updatedAtTime)
}

export const sortRoomsByActivity = (rooms: Room[]) =>
  [...rooms].sort((a, b) => {
    const timeDiff = getRoomActivityTimestamp(b) - getRoomActivityTimestamp(a)
    if (timeDiff !== 0) return timeDiff
    return b.id - a.id
  })

export const updateRoomList = (rooms: Room[], roomId: number, updater: (room: Room) => Room) =>
  sortRoomsByActivity(rooms.map((room) => (room.id === roomId ? updater(room) : room)))

export const mergeRoomIntoList = (rooms: Room[], room: Room) => {
  const nextRoom = normalizeLiveChatRoom(room) as Room
  const nextRooms = rooms.some((existingRoom) => existingRoom.id === nextRoom.id)
    ? rooms.map((existingRoom) =>
        existingRoom.id !== nextRoom.id
          ? existingRoom
          : {
              ...existingRoom,
              ...nextRoom,
              storeName: nextRoom.storeName || existingRoom.storeName,
              vendorName: nextRoom.vendorName || existingRoom.vendorName,
              store: nextRoom.store || existingRoom.store,
              vendor: nextRoom.vendor || existingRoom.vendor,
            }
      )
    : [nextRoom, ...rooms]

  return sortRoomsByActivity(nextRooms)
}
