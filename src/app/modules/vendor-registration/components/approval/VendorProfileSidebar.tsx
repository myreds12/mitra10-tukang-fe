import React from 'react'
import {VendorRegistrationDetail} from './types'
import {formatRegistrationDate, getImageUrl} from './formatters'

interface VendorProfileSidebarProps {
  vendorDetail: VendorRegistrationDetail
  statusInfo: {
    colorClass: string
    label: string
    noteText: string
  }
  navigate: (path: string) => void
  apiUrl?: string
  setPreviewDoc: (doc: {title: string; url: string} | null) => void
}

export const VendorProfileSidebar: React.FC<VendorProfileSidebarProps> = ({
  vendorDetail,
  statusInfo,
  navigate,
  apiUrl,
  setPreviewDoc,
}) => {
  return (
    <div className='profile-col'>
      <button
        type='button'
        className='back-to-list'
        onClick={() => navigate('/vendor-registration/view')}
        title='Kembali ke Daftar Pendaftaran'
      >
        <svg
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2.2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M19 12H5M12 19l-7-7 7-7' />
        </svg>
        Kembali ke Daftar
      </button>

      <div className='card profile-card'>
        <div
          className='avatar-wrap'
          onClick={() => {
            if (vendorDetail.vendor_photo) {
              setPreviewDoc({
                title: `Foto Vendor - ${vendorDetail.company_name}`,
                url: getImageUrl(apiUrl, vendorDetail.vendor_photo),
              })
            }
          }}
          title={vendorDetail.vendor_photo ? 'Klik untuk memperbesar foto' : undefined}
        >
          {vendorDetail.vendor_photo ? (
            <img src={getImageUrl(apiUrl, vendorDetail.vendor_photo)} alt='Foto vendor' />
          ) : (
            <div className='avatar-placeholder'>
              {vendorDetail.company_name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>

        <p className='profile-name'>{vendorDetail.company_name || '-'}</p>

        <div className={`status-pill ${statusInfo.colorClass}`}>
          <span className='dot'></span>
          {statusInfo.label}
        </div>

        <div className='reg-date'>
          <p className='rd-label'>Tanggal Pendaftaran</p>
          <p className='rd-value'>{formatRegistrationDate(vendorDetail.created_at)}</p>
        </div>
      </div>
    </div>
  )
}
