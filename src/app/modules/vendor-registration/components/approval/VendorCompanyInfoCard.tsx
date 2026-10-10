import React from 'react'
import {VendorRegistrationDetail} from './types'

interface VendorCompanyInfoCardProps {
  vendorDetail: VendorRegistrationDetail
  serviceAreaList: string[]
  serviceTypeList: string[]
}

export const VendorCompanyInfoCard: React.FC<VendorCompanyInfoCardProps> = ({
  vendorDetail,
  serviceAreaList,
  serviceTypeList,
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
            <path d='M3 21h18' />
            <path d='M5 21V7l8-4v18' />
            <path d='M19 21V11l-6-4' />
            <path d='M9 9v.01M9 12v.01M9 15v.01M9 18v.01' />
          </svg>
          Informasi Perusahaan
        </h2>
      </div>
      <div className='info-grid'>
        <div className='info-item'>
          <p className='i-label'>Nama Perusahaan</p>
          <p className='i-value'>{vendorDetail.company_name || '-'}</p>
        </div>
        <div className='info-item'>
          <p className='i-label'>Email Perusahaan</p>
          <p className='i-value'>{vendorDetail.email_address || '-'}</p>
        </div>
        <div className='info-item'>
          <p className='i-label'>Telepon Perusahaan</p>
          <p className='i-value'>{vendorDetail.phone_number || '-'}</p>
        </div>
        <div className='info-item'>
          <p className='i-label'>Service Area</p>
          <p className='i-value'>
            {serviceAreaList.length > 0 ? serviceAreaList.join(', ') : '-'}
          </p>
        </div>
        <div className='info-item'>
          <p className='i-label'>Service Type</p>
          <p className='i-value'>
            {serviceTypeList.length > 0 ? serviceTypeList.join(', ') : '-'}
          </p>
        </div>
        <div className='info-item full'>
          <p className='i-label'>Alamat Lengkap</p>
          <p className='i-value'>{vendorDetail.address || '-'}</p>
        </div>
        {vendorDetail.notes && (
          <div className='info-item full'>
            <p className='i-label'>Catatan Tambahan</p>
            <p className='i-value'>{vendorDetail.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
