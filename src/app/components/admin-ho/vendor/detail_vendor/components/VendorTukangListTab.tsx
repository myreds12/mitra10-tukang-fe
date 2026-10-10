import React from 'react'
import {Row, Col} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faUser} from '@fortawesome/free-solid-svg-icons'

interface VendorTukangListTabProps {
  tukangLoading: boolean
  tukangList: any[]
}

export const VendorTukangListTab: React.FC<VendorTukangListTabProps> = ({
  tukangLoading,
  tukangList,
}) => {
  if (tukangLoading) {
    return (
      <div className='text-center py-4'>
        <div className='spinner-border text-primary' role='status' />
      </div>
    )
  }

  const activeTukangs = tukangList.filter((t: any) => !t.deleted_at)

  if (activeTukangs.length === 0) {
    return (
      <div className='alert alert-secondary mb-0'>
        <FontAwesomeIcon icon={faUser} className='me-2' />
        Vendor tidak memiliki tukang.
      </div>
    )
  }

  return (
    <Row className='g-3'>
      {activeTukangs.map((tukang: any) => (
        <Col key={tukang.id} md={6} lg={4}>
          <div
            className='card h-100'
            style={{
              borderRadius: '12px',
              border: '1px solid #e9ecef',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #183383 0%, #1a42b8 100%)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '700',
                }}
              >
                {tukang.full_name?.charAt(0) || 'T'}
              </div>
              <div>
                <p className='mb-0 text-white fw-semibold' style={{fontSize: '13px'}}>
                  {tukang.full_name || '-'}
                </p>
                <p className='mb-0 text-white-50' style={{fontSize: '11px'}}>
                  {tukang.ktp_number || 'No. KTP belum ada'}
                </p>
              </div>
            </div>
            <div className='card-body p-3'>
              <Row className='g-2'>
                <Col xs={6}>
                  <small className='text-muted d-block'>No. HP</small>
                  <span className='fw-semibold' style={{fontSize: '12px'}}>
                    {tukang.phone_number || '-'}
                  </span>
                </Col>
                <Col xs={6}>
                  <small className='text-muted d-block'>Email</small>
                  <span className='fw-semibold' style={{fontSize: '12px'}}>
                    {tukang.email || '-'}
                  </span>
                </Col>
                <Col xs={12}>
                  <small className='text-muted d-block'>Keahlian / Service Type</small>
                  <div className='d-flex flex-wrap gap-1 mt-1'>
                    {(tukang.tukang_service || []).map((ts: any, idx: number) => (
                      <span
                        key={idx}
                        style={{
                          background: 'rgba(24, 51, 131, 0.08)',
                          color: '#183383',
                          borderRadius: '20px',
                          padding: '2px 8px',
                          fontSize: '10px',
                          fontWeight: '600',
                        }}
                      >
                        {ts.service_type?.service_type || `Service #${ts.service_type_id}`}
                      </span>
                    ))}
                    {(!tukang.tukang_service || tukang.tukang_service.length === 0) && (
                      <span className='text-muted' style={{fontSize: '11px'}}>
                        Belum ada keahlian
                      </span>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  )
}
