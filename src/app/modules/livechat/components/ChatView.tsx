import React from 'react'
import { Room, Message, MediaPreview } from '../types'
import { getRoomLabel, formatDate, Avatar } from '../liveChatHelpers'
import { MessageBubble } from './MessageBubble'
import { LIVECHAT_UPLOAD_ACCEPT } from '../uploadValidation'

interface ChatViewProps {
  activeRoom: Room
  setView: (view: 'rooms' | 'chat') => void
  setOpen: (open: boolean) => void
  sseConnected: boolean
  onlineUsers: Set<string>
  loadingMessages: boolean
  messages: Message[]
  userId: string
  onPreviewMedia: (media: MediaPreview) => void
  messagesEndRef: React.RefObject<any>
  fileInputRef: React.RefObject<any>
  inputRef: React.RefObject<any>
  input: string
  setInput: (val: string) => void
  sending: boolean
  handleSend: () => void
  handleFileUpload: (file: File) => void
}

export const ChatView: React.FC<ChatViewProps> = ({
  activeRoom,
  setView,
  setOpen,
  sseConnected,
  onlineUsers,
  loadingMessages,
  messages,
  userId,
  onPreviewMedia,
  messagesEndRef,
  fileInputRef,
  inputRef,
  input,
  setInput,
  sending,
  handleSend,
  handleFileUpload,
}) => {
  return (
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            <i className='bi bi-arrow-left-short' style={{ fontSize: 16 }} />
            <span>Kembali</span>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: sseConnected ? '#50cd89' : '#f1416c',
                }}
              />
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10 }}>
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
                style={{ marginLeft: i > 0 ? -6 : 0, position: 'relative' }}
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
          <div style={{ textAlign: 'center', padding: 32, color: '#aaa', fontSize: 13 }}>
            <span className='spinner-border spinner-border-sm me-2' />
            Memuat pesan...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#aaa', fontSize: 13 }}>
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
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isMe={isMe}
                  showMeta={showMeta}
                  showDate={showDate}
                  onPreviewMedia={onPreviewMedia}
                />
              )
            })}
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
            style={{ display: 'none' }}
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
                style={{ width: 12, height: 12 }}
              />
            ) : (
              <i className='bi bi-send-fill' style={{ fontSize: 12 }} />
            )}
          </button>
        </div>
      </div>
    </>
  )
}
