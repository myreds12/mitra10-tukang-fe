import React, {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {Button, Col, Row} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowLeft, faClock} from '@fortawesome/free-solid-svg-icons'
import Swal from 'sweetalert2'
import {vendorRegistrationService} from '../../../services/vendorRegistrationService'
import './VendorRegistrationApproval.css'

interface VendorRegistrationHistoryItem {
  id: number
  vendor_registration_id: number
  from_status: number | null
  to_status: number
  action: string
  notes: string | null
  actor_id: number | null
  created_at: string
}

const statusLabels: Record<number, string> = {
  1: 'Menunggu Approve',
  2: 'Proses Pitching',
  3: 'Disetujui',
  4: 'Ditolak',
}

const actionLabels: Record<string, string> = {
  REGISTER_SUBMITTED: 'Registrasi Disubmit',
  START_PITCHING: 'Masuk Proses Pitching',
  FINAL_APPROVED: 'Disetujui Final',
  REJECTED: 'Ditolak',
}

const formatDateTime = (date?: string) => {
  if (!date) return '-'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const VendorRegistrationHistory: React.FC = () => {
  const {id} = useParams<{id: string}>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [currentStatus, setCurrentStatus] = useState<number | null>(null)
  const [histories, setHistories] = useState<VendorRegistrationHistoryItem[]>([])

  useEffect(() => {
    const fetchHistory = async () => {
      if (!id) return
      setLoading(true)
      try {
        const response = await vendorRegistrationService.getHistory(id)
        const data = response.data?.data ?? response.data ?? {}
        setCompanyName(data.company_name || '')
        setCurrentStatus(data.current_status ?? null)
        setHistories(data.data || [])
      } catch (err: any) {
        Swal.fire({
          title: 'Error',
          text: err.response?.data?.message || 'Gagal mengambil histori pendaftaran',
          icon: 'error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [id])

  return (
    <section id='detail-vendor-registration'>
      <div className='card'>
        <div className='card-body'>
          <div className='d-flex align-items-center mb-4'>
            <button className='btn btn-back me-3' onClick={() => navigate('/vendor-registration/view')}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div>
              <h4 className='mb-1'>Histori Pendaftaran Vendor</h4>
              <div className='text-muted'>
                {companyName || `Registration #${id}`} -{' '}
                {currentStatus ? statusLabels[currentStatus] || 'Unknown' : '-'}
              </div>
            </div>
          </div>

          {loading ? (
            <div className='text-center py-5'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          ) : histories.length === 0 ? (
            <div className='alert alert-info'>Belum ada histori proses untuk pendaftaran ini.</div>
          ) : (
            <div className='vendor-registration-history'>
              {histories.map((history) => (
                <Row key={history.id} className='history-row'>
                  <Col md={3} className='history-time'>
                    <FontAwesomeIcon icon={faClock} className='me-2' />
                    {formatDateTime(history.created_at)}
                  </Col>
                  <Col md={9}>
                    <div className='history-item'>
                      <div className='d-flex flex-wrap align-items-center gap-2 mb-2'>
                        <strong>{actionLabels[history.action] || history.action}</strong>
                        <span className='status-badge status-badge-pending'>
                          {history.from_status ? statusLabels[history.from_status] || '-' : 'Awal'}
                        </span>
                        <span className='text-muted'>ke</span>
                        <span className='status-badge status-badge-approved'>
                          {statusLabels[history.to_status] || 'Unknown'}
                        </span>
                      </div>
                      {history.notes && <p className='mb-1'>{history.notes}</p>}
                      <small className='text-muted'>
                        Actor ID: {history.actor_id || 'System'}
                      </small>
                    </div>
                  </Col>
                </Row>
              ))}
            </div>
          )}

          <div className='d-flex justify-content-end mt-4'>
            <Button variant='light' onClick={() => navigate(`/vendor-registration/approval/${id}`)}>
              Kembali ke Detail
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export {VendorRegistrationHistory}
