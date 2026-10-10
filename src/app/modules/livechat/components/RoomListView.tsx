import React from 'react'
import { Room } from '../types'
import { getRoomLabel, getRoomTypeIcon } from '../liveChatHelpers'

interface RoomListViewProps {
  setShowCreate: (show: boolean) => void
  setOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  loadingRooms: boolean
  filteredRooms: Room[]
  activeRoom: Room | null
  openRoom: (room: Room) => void
  handleDeleteRoom: (room: Room, e: React.MouseEvent) => void
  deletingRoomId: number | null
  loadRooms: () => void
}

export const RoomListView: React.FC<RoomListViewProps> = ({
  setShowCreate,
  setOpen,
  searchQuery,
  setSearchQuery,
  loadingRooms,
  filteredRooms,
  activeRoom,
  openRoom,
  handleDeleteRoom,
  deletingRoomId,
  loadRooms,
}) => {
  return (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Live Chat</div>
                <div style={{ color: 'rgba(255,255,255,0.76)', fontSize: 11 }}>
                  Percakapan vendor, store, dan order
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 6px' }}>
        {loadingRooms ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#aaa', fontSize: 13 }}>
            <span className='spinner-border spinner-border-sm me-2' />
            Memuat...
          </div>
        ) : filteredRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#aaa', fontSize: 13 }}>
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
                <div style={{ flex: 1, minWidth: 0 }}>
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
                          style={{ width: 10, height: 10 }}
                        />
                      ) : (
                        <i className='bi bi-trash-fill' style={{ fontSize: 11 }} />
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
                    <div style={{ fontSize: 11, color: '#9fb0c2', marginTop: 4 }}>
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
  )
}
