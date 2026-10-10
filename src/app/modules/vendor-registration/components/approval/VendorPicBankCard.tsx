import React from 'react'
import {VendorRegistrationDetail} from './types'

interface VendorPicBankCardProps {
  vendorDetail: VendorRegistrationDetail
  showKtp: boolean
  setShowKtp: (val: boolean) => void
  showNpwp: boolean
  setShowNpwp: (val: boolean) => void
}

export const VendorPicBankCard: React.FC<VendorPicBankCardProps> = ({
  vendorDetail,
  showKtp,
  setShowKtp,
  showNpwp,
  setShowNpwp,
}) => {
  return (
    <div className='card'>
      <div className='section-head'>
        <h2>
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
            <circle cx='12' cy='7' r='4' />
          </svg>
          Informasi PIC &amp; Rekening
        </h2>
      </div>
      <div className='info-grid'>
        <div className='info-item'>
          <p className='i-label'>Nama PIC</p>
          <p className='i-value'>{vendorDetail.pic_name || '-'}</p>
        </div>
        <div className='info-item'>
          <p className='i-label'>No. HP / WA PIC</p>
          <p className='i-value'>{vendorDetail.pic_phone || '-'}</p>
        </div>
        <div className='info-item'>
          <p className='i-label'>Email PIC</p>
          <p className='i-value'>{vendorDetail.pic_email || '-'}</p>
        </div>
        <div className='info-item'>
          <p className='i-label'>Bank</p>
          <p className='i-value'>{vendorDetail.bank?.bank_name || '-'}</p>
        </div>
        <div className='info-item'>
          <p className='i-label'>No. KTP</p>
          <div className='mask-row'>
            <p className='i-value mask-value'>
              {showKtp
                ? vendorDetail.ktp_number || '-'
                : vendorDetail.ktp_number
                ? '•'.repeat(Math.min(vendorDetail.ktp_number.length, 16))
                : '-'}
            </p>
            {vendorDetail.ktp_number && (
              <button
                className='mask-toggle'
                type='button'
                onClick={() => setShowKtp(!showKtp)}
                aria-label={showKtp ? 'Sembunyikan No. KTP' : 'Tampilkan No. KTP'}
                title={showKtp ? 'Sembunyikan No. KTP' : 'Tampilkan No. KTP'}
              >
                {showKtp ? (
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.9 19.9 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a19.9 19.9 0 0 1-3.22 4.36M14.12 14.12a3 3 0 1 1-4.24-4.24' />
                    <path d='M1 1l22 22' />
                  </svg>
                ) : (
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                    <circle cx='12' cy='12' r='3' />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
        <div className='info-item'>
          <p className='i-label'>No. NPWP</p>
          <div className='mask-row'>
            <p className='i-value mask-value'>
              {showNpwp
                ? vendorDetail.npwp_number || '-'
                : vendorDetail.npwp_number
                ? '•'.repeat(Math.min(vendorDetail.npwp_number.length, 16))
                : '-'}
            </p>
            {vendorDetail.npwp_number && (
              <button
                className='mask-toggle'
                type='button'
                onClick={() => setShowNpwp(!showNpwp)}
                aria-label={showNpwp ? 'Sembunyikan No. NPWP' : 'Tampilkan No. NPWP'}
                title={showNpwp ? 'Sembunyikan No. NPWP' : 'Tampilkan No. NPWP'}
              >
                {showNpwp ? (
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.9 19.9 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a19.9 19.9 0 0 1-3.22 4.36M14.12 14.12a3 3 0 1 1-4.24-4.24' />
                    <path d='M1 1l22 22' />
                  </svg>
                ) : (
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                    <circle cx='12' cy='12' r='3' />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
