import React from 'react'
import {VendorRegistrationDetail} from './types'

interface VendorActionBarProps {
  vendorDetail: VendorRegistrationDetail
  statusInfo: {
    colorClass: string
    label: string
    noteText: string
  }
  isAuthorized: boolean
  submitting: boolean
  setShowRejectModal: (val: boolean) => void
  handleApprove: () => void
}

export const VendorActionBar: React.FC<VendorActionBarProps> = ({
  vendorDetail,
  statusInfo,
  isAuthorized,
  submitting,
  setShowRejectModal,
  handleApprove,
}) => {
  return (
    <div className='action-bar'>
      <div className='action-note'>
        <svg
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          style={{
            color:
              vendorDetail.status === 3
                ? '#15803D'
                : vendorDetail.status === 4
                ? '#DC2626'
                : '#B45309',
          }}
        >
          <circle cx='12' cy='12' r='10' />
          <path d='M12 16v-4M12 8h.01' />
        </svg>
        <span title={statusInfo.noteText}>{statusInfo.noteText}</span>
      </div>

      {/* Action Buttons for Authorized Roles (Status 1 or 2) */}
      {(vendorDetail.status === 1 || vendorDetail.status === 2) && isAuthorized && (
        <div className='action-buttons-wrap'>
          <button
            type='button'
            className='btn btn-reject'
            onClick={() => setShowRejectModal(true)}
            disabled={submitting}
          >
            Tolak Pendaftaran
          </button>

          <button
            type='button'
            className='btn btn-approve'
            onClick={handleApprove}
            disabled={submitting}
          >
            {submitting
              ? 'Memproses...'
              : vendorDetail.status === 1
              ? 'Proses Pitching'
              : 'Setujui Final'}
          </button>
        </div>
      )}
    </div>
  )
}
