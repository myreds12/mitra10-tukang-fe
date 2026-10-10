import React from 'react'
import {Alert} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons'

interface VendorViolationLogsTabProps {
  violationLogsLoading: boolean
  quarterPointsLoading: boolean
  violationLogs: any[]
  quarterPoints: any
  canSubmitRevision: boolean
  openRevisionModal: (type: 'REVISE' | 'RESET', logId?: number) => void
  formatDate: (date: any) => string
  revisionRequests: any[]
}

export const VendorViolationLogsTab: React.FC<VendorViolationLogsTabProps> = ({
  violationLogsLoading,
  quarterPointsLoading,
  violationLogs,
  quarterPoints,
  canSubmitRevision,
  openRevisionModal,
  formatDate,
  revisionRequests,
}) => {
  if (violationLogsLoading || quarterPointsLoading) {
    return (
      <div className='text-center py-4'>
        <div className='spinner-border text-primary' role='status' />
      </div>
    )
  }

  if (violationLogs.length === 0) {
    return (
      <div className='alert alert-success mb-0'>
        <FontAwesomeIcon icon={faExclamationTriangle} className='me-2' />
        Vendor tidak memiliki log pelanggaran.
      </div>
    )
  }

  return (
    <>
      {/* Total Points Metric Card */}
      {canSubmitRevision && (
        <div className='d-flex flex-wrap gap-2 mb-4'>
          <button
            type='button'
            className='btn btn-sm btn-light-primary'
            onClick={() => openRevisionModal('REVISE')}
          >
            Ajukan Revisi Poin
          </button>
          <button
            type='button'
            className='btn btn-sm btn-light-danger'
            onClick={() => openRevisionModal('RESET')}
          >
            Reset Poin Quarter
          </button>
        </div>
      )}

      {quarterPoints?.has_ever_sp && (
        <Alert variant='warning' className='py-2'>
          Vendor pernah mencapai SP. Histori SP tetap ditampilkan meskipun poin sudah direvisi/reset.
        </Alert>
      )}

      <div
        className={`d-flex align-items-center gap-4 p-3 mb-4 rounded-3 ${
          (quarterPoints?.total_points || 0) > 50
            ? 'bg-danger bg-opacity-10 border border-danger'
            : (quarterPoints?.total_points || 0) > 25
            ? 'bg-danger bg-opacity-10 border border-danger'
            : (quarterPoints?.total_points || 0) > 0
            ? 'bg-warning bg-opacity-10 border border-warning'
            : 'bg-success bg-opacity-10 border border-success'
        }`}
        style={{borderWidth: '2px'}}
      >
        <div
          className={`d-flex align-items-center justify-content-center rounded-circle ${
            (quarterPoints?.total_points || 0) > 25
              ? 'bg-danger text-white'
              : (quarterPoints?.total_points || 0) > 0
              ? 'bg-warning text-dark'
              : 'bg-success text-white'
          }`}
          style={{width: '48px', height: '48px', minWidth: '48px'}}
        >
          <FontAwesomeIcon icon={faExclamationTriangle} size='lg' />
        </div>
        <div>
          <p className='mb-0 text-gray-500 fw-semibold' style={{fontSize: '12px'}}>
            TOTAL POIN PELANGGARAN (QUARTER INI)
          </p>
          <h2
            className={`mb-0 fw-boldest ${
              (quarterPoints?.total_points || 0) > 25
                ? 'text-danger'
                : (quarterPoints?.total_points || 0) > 0
                ? 'text-warning'
                : 'text-success'
            }`}
            style={{fontSize: '28px'}}
          >
            {quarterPoints?.total_points || 0}
          </h2>
        </div>
        <div className='ms-auto text-end'>
          <p className='mb-0 text-muted' style={{fontSize: '11px'}}>
            Q{quarterPoints?.quarter || '-'} {quarterPoints?.year || '-'}
          </p>
          <span
            className={`badge ${
              (quarterPoints?.violation_count || 0) > 0
                ? 'badge-secondary'
                : 'badge-success'
            } fw-semibold`}
          >
            {quarterPoints?.violation_count || 0} Pelanggaran
          </span>
        </div>
      </div>

      {/* Metronic Styled Table */}
      <div className='table-responsive'>
        <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
          <thead>
            <tr className='fw-bold text-gray-700 border-bottom'>
              <th className='pb-3'>Tanggal</th>
              <th className='pb-3'>Jenis Pelanggaran</th>
              <th className='pb-3'>Kategori</th>
              <th className='pb-3 text-center'>Poin</th>
              <th className='pb-3'>Keterangan</th>
              <th className='pb-3'>Order</th>
            </tr>
          </thead>
          <tbody>
            {violationLogs.map((log: any) => (
              <tr key={log.id} className='border-bottom-0'>
                <td className='text-gray-600 fw-normal'>{formatDate(new Date(log.created_at))}</td>
                <td>
                  <span className='text-gray-800 fw-semibold'>{log.violation_type?.name || '-'}</span>
                </td>
                <td>
                  <span className={`badge ${
                    log.violation_type?.category === 'SLA'
                      ? 'badge-primary'
                      : log.violation_type?.category === 'KUALITAS'
                      ? 'badge-info'
                      : 'badge-secondary'
                  } fw-semibold`}>
                    {log.violation_type?.category || '-'}
                  </span>
                </td>
                <td className='text-center'>
                  <span className='badge badge-danger fw-bold fs-6'>
                    +{log.adjusted_point ?? log.violation_type?.point ?? 0}
                  </span>
                </td>
                <td className='text-gray-600 fw-normal'>{log.description || '-'}</td>
                <td>
                  <span className='text-primary fw-semibold'>
                    {log.orders?.project_number || '-'}
                  </span>
                  {canSubmitRevision && (
                    <button
                      type='button'
                      className='btn btn-link btn-sm p-0 ms-2'
                      onClick={() => openRevisionModal('REVISE', log.id)}
                    >
                      Revisi
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {revisionRequests.length > 0 && (
        <div className='mt-5'>
          <h6 className='fw-bold mb-3'>Request Revisi/Reset Poin</h6>
          <div className='table-responsive'>
            <table className='table table-sm table-bordered'>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Tipe</th>
                  <th>Status</th>
                  <th>Alasan</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {revisionRequests.map((request: any) => (
                  <tr key={request.id}>
                    <td>{formatDate(new Date(request.created_at))}</td>
                    <td>{request.type}</td>
                    <td>
                      <span
                        className={`badge ${
                          request.status === 'APPROVED'
                            ? 'badge-light-success'
                            : request.status === 'REJECTED'
                            ? 'badge-light-danger'
                            : 'badge-light-warning'
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td>{request.reason}</td>
                    <td>{request.review_note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
