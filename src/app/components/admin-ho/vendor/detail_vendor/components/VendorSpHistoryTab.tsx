import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faUserShield} from '@fortawesome/free-solid-svg-icons'

interface VendorSpHistoryTabProps {
  spHistoryLoading: boolean
  spHistory: any[]
  formatDate: (date: any) => string
}

export const VendorSpHistoryTab: React.FC<VendorSpHistoryTabProps> = ({
  spHistoryLoading,
  spHistory,
  formatDate,
}) => {
  if (spHistoryLoading) {
    return (
      <div className='text-center py-4'>
        <div className='spinner-border text-primary' role='status' />
      </div>
    )
  }

  if (spHistory.length === 0) {
    return (
      <div className='alert alert-success mb-0'>
        <FontAwesomeIcon icon={faUserShield} className='me-2' />
        Vendor tidak memiliki riwayat Surat Peringatan.
      </div>
    )
  }

  return (
    <div className='table-responsive'>
      <table className='table table-hover table-bordered'>
        <thead className='table-light'>
          <tr>
            <th>Level</th>
            <th>Tanggal Mulai</th>
            <th>Tanggal Berakhir</th>
            <th>Total Poin</th>
            <th>Status</th>
            <th>Pengurangan Alokasi</th>
          </tr>
        </thead>
        <tbody>
          {spHistory.map((sp: any) => (
            <tr key={sp.id}>
              <td>
                <span
                  className={`badge bg-${
                    sp.sp_level === 1
                      ? 'warning'
                      : sp.sp_level === 2
                      ? 'danger'
                      : 'dark'
                  }`}
                >
                  SP{sp.sp_level}
                </span>
              </td>
              <td>{formatDate(new Date(sp.start_date))}</td>
              <td>{formatDate(new Date(sp.end_date))}</td>
              <td>{sp.total_point} poin</td>
              <td>
                <span
                  className={`badge bg-${
                    sp.status === 1
                      ? 'success'
                      : sp.status === 2
                      ? 'secondary'
                      : 'info'
                  }`}
                >
                  {sp.status === 1
                    ? 'AKTIF'
                    : sp.status === 2
                    ? 'SELESAI'
                    : 'DIPERPANJANG'}
                </span>
              </td>
              <td>
                {sp.allocation_reduction ? `${sp.allocation_reduction}%` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
