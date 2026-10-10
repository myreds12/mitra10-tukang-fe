import React from 'react'

interface VendorLightboxModalProps {
  previewDoc: {title: string; url: string} | null
  onClose: () => void
}

export const VendorLightboxModal: React.FC<VendorLightboxModalProps> = ({
  previewDoc,
  onClose,
}) => {
  if (!previewDoc) return null

  return (
    <div className='vd-lightbox-overlay' onClick={onClose}>
      <div className='vd-lightbox-dialog' onClick={(e) => e.stopPropagation()}>
        <div className='vd-lightbox-header'>
          <h4>{previewDoc.title}</h4>
          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <a
              href={previewDoc.url}
              target='_blank'
              rel='noopener noreferrer'
              className='btn btn-sm btn-light'
              style={{fontSize: '12px', padding: '4px 10px'}}
            >
              Buka di Tab Baru
            </a>
            <button
              type='button'
              className='vd-lightbox-close'
              onClick={onClose}
              aria-label='Tutup'
            >
              <svg
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
                style={{width: '20px', height: '20px'}}
              >
                <path d='M18 6 6 18M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>
        <div className='vd-lightbox-body'>
          <img src={previewDoc.url} alt={previewDoc.title} />
        </div>
      </div>
    </div>
  )
}
