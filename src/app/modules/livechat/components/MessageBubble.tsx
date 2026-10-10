import React from 'react'
import { Message, MediaPreview } from '../types'
import { isLiveChatVideo } from '../uploadValidation'
import { formatDate, formatTime, Avatar } from '../liveChatHelpers'

interface MessageBubbleProps {
  msg: Message
  isMe: boolean
  showMeta: boolean
  showDate: boolean
  onPreviewMedia: (media: MediaPreview) => void
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  isMe,
  showMeta,
  showDate,
  onPreviewMedia,
}) => {
  const isImage = msg.type === 'image'
  const isVideo = isLiveChatVideo(msg.type, msg.fileName, msg.fileUrl)
  const isFile = msg.type === 'file'
  const canPreview = (isImage || isVideo) && !!msg.fileUrl

  return (
    <>
      {showDate && (
        <div style={{ textAlign: 'center', margin: '8px 0' }}>
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
          <div style={{ width: 24, flexShrink: 0 }}>
            {showMeta && <Avatar name={msg.senderName} size={24} />}
          </div>
        )}
        <div style={{ maxWidth: '75%' }}>
          {!isMe && showMeta && (
            <div style={{ fontSize: 10, fontWeight: 700, color: '#888', marginBottom: 2 }}>
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
                  onPreviewMedia({ url: msg.fileUrl, fileName: msg.fileName, type: 'image' })
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
                  style={{ maxWidth: 180, maxHeight: 160, display: 'block', borderRadius: 12 }}
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
                  onPreviewMedia({ url: msg.fileUrl, fileName: msg.fileName, type: 'video' })
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
                    background:
                      'linear-gradient(180deg, rgba(15,23,42,0.05), rgba(15,23,42,0.28))',
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
                    <i className='bi bi-play-fill' style={{ fontSize: 20, marginLeft: 2 }} />
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
            <span style={{ fontSize: 10, color: '#aaa' }}>{formatTime(msg.createdAt)}</span>
            {isMe && (
              <i
                className='bi bi-check2-all'
                style={{ fontSize: 10, color: msg.isRead ? '#009ef7' : '#bbb' }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
