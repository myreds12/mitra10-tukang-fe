import React, {useState, useEffect, useRef} from 'react'
import {useParams, useNavigate, useSearchParams} from 'react-router-dom'
import {vendorRegistrationService} from '../../../services/vendorRegistrationService'
import apiClient from '../../../services/apiClient'
import {PageTitle} from '../../../../_metronic/layout/core'
import Swal from 'sweetalert2'
import {Form, Row, Col, Button} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faTimes,
  faArrowLeft,
  faUser,
  faPhone,
  faIdCard,
  faTools,
  faImage,
  faHistory,
} from '@fortawesome/free-solid-svg-icons'
import './VendorRegistrationApproval.css'

interface VendorRegistrationDetail {
  id: number
  company_name: string
  address: string
  phone_number: string
  email_address: string
  pic_name: string
  pic_email: string
  pic_phone: string
  ktp_number: string | null
  npwp_number: string | null
  bank_id: number | null
  service_types: number[]
  areas: number[]
  status: number
  rejection_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
  bank?: {
    id: number
    bank_name: string
  }
  vendor_photo?: string
  ktp_photo?: string
  npwp_photo?: string
  compro_photo?: string
  surat_permohonan_photo?: string
  pks_photo?: string
  siup_photo?: string
  tukang_data?: string | any[]
}

const VendorRegistrationApproval: React.FC = () => {
  const {id} = useParams<{id: string}>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const apiUrl = process.env.REACT_APP_API_URL
  const userRole = localStorage.getItem('userRole')
  const isAuthorized = userRole === 'Admin HO' || userRole === 'Super User'

  const actionParam = searchParams.get('action')

  const [vendorDetail, setVendorDetail] = useState<VendorRegistrationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // Refs for scrolling to action forms
  const approveFormRef = useRef<HTMLDivElement>(null)
  const rejectFormRef = useRef<HTMLDivElement>(null)

  // Service types for mapping tukang skill IDs to names
  const [serviceTypes, setServiceTypes] = useState<Record<number, string>>({})

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const res = await apiClient.get('/service-type')
        const data = res.data?.data?.data || res.data?.data || []
        const map: Record<number, string> = {}
        data.forEach((item: any) => {
          map[item.id] = item.service_type
        })
        setServiceTypes(map)
      } catch (err) {
        console.error('Failed to load service types', err)
      }
    }
    fetchServiceTypes()
  }, [])

  useEffect(() => {
    if (id) {
      fetchData(id)
    }
  }, [id])

  // Handle action query param on mount
  useEffect(() => {
    if (actionParam === 'approve' && approveFormRef.current) {
      setShowRejectForm(false)
      setTimeout(() => {
        approveFormRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'})
      }, 300)
    } else if (actionParam === 'reject' && rejectFormRef.current) {
      setShowRejectForm(true)
      setTimeout(() => {
        rejectFormRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'})
      }, 300)
    }
  }, [actionParam, vendorDetail])

  const fetchData = async (vendorId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await vendorRegistrationService.getById(vendorId)
      // Handle both nested (response.data.data) and flat (response.data) structures
      const data = response.data?.data ?? response.data ?? null
      setVendorDetail(data)
      if (!data) {
        setError('Data vendor tidak ditemukan')
      }
    } catch (err: any) {
      console.error('Error fetching vendor data:', err)
      setError(err.response?.data?.message || 'Gagal mengambil data vendor')
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'Gagal mengambil data vendor',
        icon: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    const isStartPitching = vendorDetail?.status === 1
    const isFinalApprove = vendorDetail?.status === 2
    if (!isStartPitching && !isFinalApprove) return

    Swal.fire({
      title: 'Konfirmasi',
      text: isStartPitching
        ? 'Apakah Anda yakin ingin memproses vendor ini ke tahap pitching?'
        : 'Apakah Anda yakin ingin menyetujui final pendaftaran vendor ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: isStartPitching ? 'Ya, Proses Pitching' : 'Ya, Setujui Final',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#183383',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setSubmitting(true)
        try {
          if (isStartPitching) {
            await vendorRegistrationService.startPitching(id as string)
          } else {
            await vendorRegistrationService.finalApprove(id as string)
          }
          Swal.fire({
            title: 'Berhasil',
            text: isStartPitching
              ? 'Pendaftaran vendor berhasil masuk proses pitching.'
              : 'Pendaftaran vendor berhasil disetujui. Email notifikasi telah dikirim.',
            icon: 'success',
          }).then(() => {
            navigate('/vendor-registration/view')
          })
        } catch (err: any) {
          Swal.fire({
            title: 'Error',
            text: err.response?.data?.message || 'Gagal menyetujui pendaftaran',
            icon: 'error',
          })
        } finally {
          setSubmitting(false)
        }
      }
    })
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Swal.fire({
        title: 'Warning',
        text: 'Alasan penolakan wajib diisi',
        icon: 'warning',
      })
      return
    }

    setSubmitting(true)
    try {
      await vendorRegistrationService.reject(id as string, {rejection_reason: rejectReason})
      Swal.fire({
        title: 'Berhasil',
        text: 'Pendaftaran vendor berhasil ditolak.',
        icon: 'success',
      }).then(() => {
        navigate('/vendor-registration/view')
      })
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'Gagal menolak pendaftaran',
        icon: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-'
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return '-'
      const day = d.getDate().toString().padStart(2, '0')
      const month = (d.getMonth() + 1).toString().padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return '-'
    }
  }

  const getStatusBadge = (status: number | undefined) => {
    if (status === 1) {
      return <span className='status-badge status-badge-pending'>Menunggu Approve</span>
    } else if (status === 2) {
      return <span className='status-badge status-badge-pitching'>Proses Pitching</span>
    } else if (status === 3) {
      return <span className='status-badge status-badge-approved'>Disetujui</span>
    } else if (status === 4) {
      return <span className='status-badge status-badge-rejected'>Ditolak</span>
    }
    return <span className='status-badge status-badge-unknown'>Unknown</span>
  }

  // Static files served from the same server as API (port 3039)
  const getImageUrl = (path: string | undefined | null) => {
    if (!path) return ''
    const cleanPath = path.replace('uploads/', '')
    return `${apiUrl}/public/${cleanPath}`
  }

  // Loading State
  if (loading) {
    return (
      <>
        <PageTitle>Detail Pendaftaran Vendor</PageTitle>
        <section id='detail-vendor-registration'>
          <div className='card'>
            <div className='card-body text-center py-5'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
              <p className='mt-3 text-muted'>Memuat data vendor...</p>
            </div>
          </div>
        </section>
      </>
    )
  }

  // Error State
  if (error || !vendorDetail) {
    return (
      <>
        <PageTitle>Detail Pendaftaran Vendor</PageTitle>
        <section id='detail-vendor-registration'>
          <div className='card'>
            <div className='card-body text-center py-5'>
              <div className='mb-4'>
                <FontAwesomeIcon
                  icon={faTimes}
                  className='text-danger'
                  style={{fontSize: '48px'}}
                />
              </div>
              <h5 className='text-danger'>{error || 'Data tidak ditemukan'}</h5>
              <Button
                variant='primary'
                className='mt-3'
                onClick={() => navigate('/vendor-registration/view')}
              >
                <FontAwesomeIcon icon={faArrowLeft} className='me-2' />
                Kembali ke Daftar
              </Button>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageTitle>Detail Pendaftaran Vendor - {vendorDetail.company_name || 'Loading'}</PageTitle>
      <section id='detail-vendor-registration'>
        <div className='card mb-5'>
          <div className='card-body'>
            {/* Header with back button */}
            <div className='d-flex align-items-center mb-4'>
              <button
                className='btn btn-back me-3'
                onClick={() => navigate('/vendor-registration/view')}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h4 className='mb-0'>Detail Pendaftaran Vendor</h4>
              <Button
                variant='light'
                className='ms-auto'
                onClick={() => navigate(`/vendor-registration/history/${vendorDetail.id}`)}
              >
                <FontAwesomeIcon icon={faHistory} className='me-2' />
                Histori
              </Button>
            </div>

            <Row>
              {/* Left Column */}
              <Col xl={3}>
                {/* Vendor Avatar */}
                <div className='vendor-profile text-center'>
                  {vendorDetail.vendor_photo ? (
                    <img
                      className='vendor-avatar'
                      src={getImageUrl(vendorDetail.vendor_photo)}
                      alt='Vendor'
                    />
                  ) : (
                    <div className='vendor-avatar-placeholder'>
                      <span className='fs-1 fw-bold'>
                        {vendorDetail.company_name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>

                <h2 className='text-center fs-2 fw-bold mt-3'>
                  {vendorDetail.company_name || '-'}
                </h2>

                {/* Vendor Info */}
                <div className='detail-info-wrapper'>
                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm={6}>
                      ID :
                    </Form.Label>
                    <Col sm={6}>
                      <p className='fw-normal mt-3'>{vendorDetail.id ?? '-'}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm={6}>
                      Tanggal Daftar :
                    </Form.Label>
                    <Col sm={6}>
                      <p className='fw-normal mt-3'>{formatDate(vendorDetail.created_at)}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm={6}>
                      Status :
                    </Form.Label>
                    <Col sm={6}>
                      <p className='fw-normal mt-3'>{getStatusBadge(vendorDetail.status)}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm={6}>
                      Phone :
                    </Form.Label>
                    <Col sm={6}>
                      <p className='fw-normal mt-3'>{vendorDetail.phone_number || '-'}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm={6}>
                      Email :
                    </Form.Label>
                    <Col sm={6}>
                      <p className='fw-normal mt-3'>{vendorDetail.email_address || '-'}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm={6}>
                      Alamat :
                    </Form.Label>
                    <Col sm={6}>
                      <p className='fw-normal mt-3'>{vendorDetail.address || '-'}</p>
                    </Col>
                  </Form.Group>

                  <hr />

                  <h6 className='fw-bold mb-3'>INFORMASI PIC</h6>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm={6}>
                      Nama PIC :
                    </Form.Label>
                    <Col sm={6}>
                      <p className='fw-normal mt-3'>{vendorDetail.pic_name || '-'}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm={6}>
                      Phone PIC :
                    </Form.Label>
                    <Col sm={6}>
                      <p className='fw-normal mt-3'>{vendorDetail.pic_phone || '-'}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm={6}>
                      Email PIC :
                    </Form.Label>
                    <Col sm={6}>
                      <p className='fw-normal mt-3'>{vendorDetail.pic_email || '-'}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm={6}>
                      No. KTP :
                    </Form.Label>
                    <Col sm={6}>
                      <p className='fw-normal mt-3'>{vendorDetail.ktp_number || '-'}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm={6}>
                      No. NPWP :
                    </Form.Label>
                    <Col sm={6}>
                      <p className='fw-normal mt-3'>{vendorDetail.npwp_number || '-'}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm={6}>
                      Bank :
                    </Form.Label>
                    <Col sm={6}>
                      <p className='fw-normal mt-3'>{vendorDetail.bank?.bank_name || '-'}</p>
                    </Col>
                  </Form.Group>

                  {/* Service Types */}
                  {(() => {
                    let serviceTypeIds: number[] = []
                    try {
                      if (vendorDetail.service_types) {
                        const parsed =
                          typeof vendorDetail.service_types === 'string'
                            ? JSON.parse(vendorDetail.service_types)
                            : vendorDetail.service_types
                        if (Array.isArray(parsed)) serviceTypeIds = parsed
                      }
                    } catch {}
                    const serviceNames = serviceTypeIds.map(
                      (id) => serviceTypes[id] || `Service #${id}`
                    )
                    if (serviceNames.length === 0) return null
                    return (
                      <Form.Group as={Row} className='detail-info'>
                        <Form.Label column sm={6}>
                          Service Type :
                        </Form.Label>
                        <Col sm={6}>
                          <div className='d-flex flex-wrap gap-1 mt-2'>
                            {serviceNames.map((name, i) => (
                              <span
                                key={i}
                                style={{
                                  background: 'rgba(24, 51, 131, 0.08)',
                                  color: '#183383',
                                  borderRadius: '20px',
                                  padding: '2px 10px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                }}
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </Col>
                      </Form.Group>
                    )
                  })()}

                  {vendorDetail.notes && (
                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm={6}>
                        Catatan :
                      </Form.Label>
                      <Col sm={6}>
                        <p className='fw-normal mt-3'>{vendorDetail.notes}</p>
                      </Col>
                    </Form.Group>
                  )}
                </div>

                {/* Tukang List - Card Based */}
                {(() => {
                  let tukangList: any[] = []
                  try {
                    if (vendorDetail.tukang_data) {
                      tukangList = Array.isArray(vendorDetail.tukang_data)
                        ? vendorDetail.tukang_data
                        : JSON.parse(vendorDetail.tukang_data)
                    }
                  } catch {}
                  if (!Array.isArray(tukangList) || tukangList.length === 0) return null
                  return (
                    <div className='tukang-review mt-4'>
                      <h6 className='fw-bold mb-3'>DAFTAR TUKANG ({tukangList.length})</h6>
                      <div className='d-flex flex-column gap-3'>
                        {tukangList.map((t: any, i: number) => {
                          const skillNames = (t.service_type_id || []).map(
                            (id: number) => serviceTypes[id] || `Skill #${id}`
                          )
                          return (
                            <div
                              key={i}
                              style={{
                                background: '#ffffff',
                                borderRadius: '12px',
                                border: '1px solid #e9ecef',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  background: 'linear-gradient(135deg, #183383 0%, #1a42b8 100%)',
                                  padding: '12px 16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <div className='d-flex align-items-center gap-2'>
                                  <div
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '50%',
                                      background: 'rgba(255,255,255,0.2)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#fff',
                                      fontSize: '12px',
                                      fontWeight: '700',
                                    }}
                                  >
                                    {i + 1}
                                  </div>
                                  <span
                                    style={{color: '#fff', fontWeight: '600', fontSize: '13px'}}
                                  >
                                    Tukang {i + 1}
                                  </span>
                                </div>
                              </div>
                              <div style={{padding: '16px'}}>
                                <Row className='g-3'>
                                  <Col md={6}>
                                    <div className='d-flex align-items-center gap-2 mb-2'>
                                      <FontAwesomeIcon
                                        icon={faUser}
                                        style={{color: '#183383', fontSize: '12px'}}
                                      />
                                      <span
                                        style={{
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          color: '#5e6278',
                                        }}
                                      >
                                        Nama Lengkap
                                      </span>
                                    </div>
                                    <p
                                      style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#183383',
                                        margin: 0,
                                      }}
                                    >
                                      {t.full_name || '-'}
                                    </p>
                                  </Col>
                                  <Col md={6}>
                                    <div className='d-flex align-items-center gap-2 mb-2'>
                                      <FontAwesomeIcon
                                        icon={faPhone}
                                        style={{color: '#183383', fontSize: '12px'}}
                                      />
                                      <span
                                        style={{
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          color: '#5e6278',
                                        }}
                                      >
                                        No. HP
                                      </span>
                                    </div>
                                    <p
                                      style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#183383',
                                        margin: 0,
                                      }}
                                    >
                                      {t.phone_number || '-'}
                                    </p>
                                  </Col>
                                  <Col md={6}>
                                    <div className='d-flex align-items-center gap-2 mb-2'>
                                      <FontAwesomeIcon
                                        icon={faIdCard}
                                        style={{color: '#183383', fontSize: '12px'}}
                                      />
                                      <span
                                        style={{
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          color: '#5e6278',
                                        }}
                                      >
                                        No. KTP
                                      </span>
                                    </div>
                                    <p
                                      style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#183383',
                                        margin: 0,
                                      }}
                                    >
                                      {t.ktp_number || '-'}
                                    </p>
                                  </Col>
                                  <Col md={6}>
                                    <div className='d-flex align-items-center gap-2 mb-2'>
                                      <FontAwesomeIcon
                                        icon={faTools}
                                        style={{color: '#183383', fontSize: '12px'}}
                                      />
                                      <span
                                        style={{
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          color: '#5e6278',
                                        }}
                                      >
                                        Skill / Keahlian
                                      </span>
                                    </div>
                                    <div className='d-flex flex-wrap gap-1'>
                                      {skillNames.length > 0 ? (
                                        skillNames.map((name: string, idx: number) => (
                                          <span
                                            key={idx}
                                            style={{
                                              background: 'rgba(24, 51, 131, 0.08)',
                                              color: '#183383',
                                              borderRadius: '20px',
                                              padding: '3px 10px',
                                              fontSize: '11px',
                                              fontWeight: '600',
                                            }}
                                          >
                                            {name}
                                          </span>
                                        ))
                                      ) : (
                                        <span style={{color: '#6c757d', fontSize: '12px'}}>-</span>
                                      )}
                                    </div>
                                  </Col>
                                </Row>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}

                {/* Action Buttons */}
                {(vendorDetail.status === 1 || vendorDetail.status === 2) &&
                  isAuthorized &&
                  !showRejectForm && (
                    <div className='action-buttons d-flex justify-content-end align-items-center gap-3 mt-4 pt-4 border-top flex-wrap'>
                      <div ref={approveFormRef}>
                        <Button
                          className='btn-approve'
                          onClick={handleApprove}
                          disabled={submitting}
                        >
                          <FontAwesomeIcon icon={faCheck} className='me-2' />
                          {submitting
                            ? 'Memproses...'
                            : vendorDetail.status === 1
                            ? 'Proses Pitching'
                            : 'Setujui Final'}
                        </Button>
                      </div>

                      <Button
                        className='btn-reject'
                        onClick={() => setShowRejectForm(true)}
                        disabled={submitting}
                      >
                        <FontAwesomeIcon icon={faTimes} className='me-2' />
                        Tolak Pendaftaran
                      </Button>
                    </div>
                  )}

                {showRejectForm &&
                  (vendorDetail.status === 1 || vendorDetail.status === 2) &&
                  isAuthorized && (
                    <div
                      ref={rejectFormRef}
                      className='reject-form mt-4 pt-4 border-top'
                    >
                      <h6 className='fw-bold mb-3'>Form Penolakan Pendaftaran</h6>
                      <p className='text-muted mb-3' style={{fontSize: '13px'}}>
                        Masukkan alasan penolakan. Pendaftaran yang ditolak akan
                        otomatis mengunci email/phone PIC selama 30 hari.
                      </p>
                      <Form.Group>
                        <Form.Label className='fw-semibold required'>
                          Alasan Penolakan
                        </Form.Label>
                        <Form.Control
                          as='textarea'
                          rows={4}
                          placeholder='Contoh: Dokumen KTP tidak terbaca, mohon upload ulang...'
                          value={rejectReason}
                          onChange={(e: any) => setRejectReason(e.target.value)}
                          autoFocus
                        />
                      </Form.Group>
                      <div className='d-flex justify-content-end gap-2 mt-3'>
                        <Button
                          variant='light'
                          className='btn-active-light-primary'
                          onClick={() => {
                            setShowRejectForm(false)
                            setRejectReason('')
                          }}
                          disabled={submitting}
                        >
                          Batal
                        </Button>
                        <Button
                          className='btn-reject'
                          onClick={handleReject}
                          disabled={submitting || !rejectReason.trim()}
                        >
                          <FontAwesomeIcon icon={faTimes} className='me-2' />
                          {submitting ? 'Menolak...' : 'Konfirmasi Tolak'}
                        </Button>
                      </div>
                    </div>
                  )}

                {vendorDetail.status === 2 && (
                  <div className='alert alert-info mt-4'>
                    <FontAwesomeIcon icon={faCheck} className='me-2' />
                    Pendaftaran sedang dalam proses pitching
                  </div>
                )}

                {vendorDetail.status === 3 && (
                  <div className='alert alert-success mt-4'>
                    <FontAwesomeIcon icon={faCheck} className='me-2' />
                    Pendaftaran telah disetujui
                  </div>
                )}

                {vendorDetail.status === 4 && (
                  <div className='alert alert-danger mt-4'>
                    <FontAwesomeIcon icon={faTimes} className='me-2' />
                    Pendaftaran ditolak
                    {vendorDetail.rejection_reason && (
                      <p className='mb-0 mt-2'>
                        <strong>Alasan:</strong> {vendorDetail.rejection_reason}
                      </p>
                    )}
                  </div>
                )}
              </Col>

              {/* Right Column - Documents */}
              <Col xl={9}>
                <h5 className='fw-bold mb-4'>DOKUMEN & FOTO</h5>
                <Row className='g-3'>
                  {[
                    {label: 'Foto Vendor', value: vendorDetail.vendor_photo, icon: faImage},
                    {label: 'Foto KTP', value: vendorDetail.ktp_photo, icon: faIdCard},
                    {label: 'Foto NPWP', value: vendorDetail.npwp_photo, icon: faIdCard},
                    {label: 'Foto COMPRO', value: vendorDetail.compro_photo, icon: faImage},
                    {
                      label: 'Surat Permohonan',
                      value: vendorDetail.surat_permohonan_photo,
                      icon: faImage,
                    },
                    {label: 'Foto PKS', value: vendorDetail.pks_photo, icon: faImage},
                    {label: 'Foto SIUP', value: vendorDetail.siup_photo, icon: faImage},
                  ].map((doc, idx) => (
                    <Col key={idx} xxl={4} lg={6}>
                      <div
                        style={{
                          background: '#fff',
                          borderRadius: '12px',
                          border: '1px solid #e9ecef',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div
                          style={{
                            background: doc.value
                              ? 'linear-gradient(135deg, #183383 0%, #1a42b8 100%)'
                              : '#6c757d',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <FontAwesomeIcon
                            icon={doc.icon}
                            style={{color: '#fff', fontSize: '12px'}}
                          />
                          <span style={{color: '#fff', fontWeight: '600', fontSize: '12px'}}>
                            {doc.label}
                          </span>
                        </div>
                        {doc.value ? (
                          <a
                            href={getImageUrl(doc.value)}
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{
                              display: 'block',
                              height: '180px',
                              background: '#f8f9fa',
                              overflow: 'hidden',
                              position: 'relative',
                            }}
                            title={`Buka ${doc.label} di tab baru`}
                          >
                            <img
                              src={getImageUrl(doc.value)}
                              alt={doc.label}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.2s ease',
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent && !parent.querySelector('.img-fallback')) {
                                  const fallback = document.createElement('div')
                                  fallback.className = 'img-fallback'
                                  fallback.style.cssText =
                                    'text-align:center; color:#6c757d; padding:20px;'
                                  fallback.innerHTML =
                                    '<i class="fas fa-image" style="font-size:32px; margin-bottom:8px; display:block;"></i>' +
                                    '<p style="font-size:11px; margin:0;">Gambar tidak dapat dimuat</p>'
                                  parent.appendChild(fallback)
                                }
                              }}
                              onMouseEnter={(e) => {
                                ;(e.target as HTMLImageElement).style.transform =
                                  'scale(1.05)'
                              }}
                              onMouseLeave={(e) => {
                                ;(e.target as HTMLImageElement).style.transform = 'scale(1)'
                              }}
                            />
                          </a>
                        ) : (
                          <div
                            style={{
                              height: '140px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#f8f9fa',
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faImage}
                              style={{color: '#ced4da', fontSize: '28px', marginBottom: '8px'}}
                            />
                            <p style={{fontSize: '11px', color: '#6c757d', margin: 0}}>
                              Belum ada dokumen
                            </p>
                          </div>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </div>
        </div>
      </section>
    </>
  )
}

export {VendorRegistrationApproval}
