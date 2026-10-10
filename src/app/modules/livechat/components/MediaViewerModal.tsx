import React from 'react'
import { MediaPreview } from '../types'

interface MediaViewerModalProps {
  media: MediaPreview
  onClose: () => void
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ media, onClose }) => {
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
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
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
