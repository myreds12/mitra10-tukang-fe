import React, {useState, useEffect, useRef, useMemo} from 'react'
import {useParams, useNavigate, useSearchParams} from 'react-router-dom'
import {vendorRegistrationService} from '../../../services/vendorRegistrationService'
import apiClient from '../../../services/apiClient'
import Swal from 'sweetalert2'
import {Modal, Button, Form} from 'react-bootstrap'
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
  service_types: number[] | string
  areas: number[] | string
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
  histories?: VendorRegistrationHistoryItem[]
}

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
  REGISTRANT_ACCOUNT_CREATED: 'Akun Pendaftar Dibuat',
  START_PITCHING: 'Masuk Proses Pitching',
  FINAL_APPROVED: 'Disetujui Final',
  REJECTED: 'Ditolak',
  RESEND_EMAIL: 'Kirim Ulang Email',
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

export const VendorRegistrationApproval: React.FC = () => {
  const {id} = useParams<{id: string}>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const apiUrl = process.env.REACT_APP_API_URL
  const userRole = localStorage.getItem('userRole')
  const isAuthorized = userRole === 'Admin HO' || userRole === 'Super User'

  const actionParam = searchParams.get('action')

  const [vendorDetail, setVendorDetail] = useState<VendorRegistrationDetail | null>(null)
  const [histories, setHistories] = useState<VendorRegistrationHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // Lightbox preview modal state
  const [previewDoc, setPreviewDoc] = useState<{title: string; url: string} | null>(null)

  // Service types for mapping tukang skill IDs & vendor service types to names
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
    if (actionParam === 'reject') {
      setShowRejectModal(true)
    }
  }, [actionParam])

  const fetchData = async (vendorId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await vendorRegistrationService.getById(vendorId)
      const data = response.data?.data ?? response.data ?? null
      setVendorDetail(data)

      if (data?.histories && Array.isArray(data.histories)) {
        setHistories(data.histories)
      } else {
        try {
          const histRes = await vendorRegistrationService.getHistory(vendorId)
          const histData = histRes.data?.data ?? histRes.data ?? {}
          setHistories(histData.data || [])
        } catch {
          // ignore
        }
      }

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
      confirmButtonColor: '#15803D',
      cancelButtonColor: '#6B7280',
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
      setShowRejectModal(false)
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

  const getImageUrl = (path: string | undefined | null) => {
    if (!path) return ''
    const cleanPath = path.replace('uploads/', '')
    return `${apiUrl}/public/${cleanPath}`
  }

  // Parse service types list
  const serviceTypeList = useMemo(() => {
    if (!vendorDetail?.service_types) return []
    let ids: any[] = []
    try {
      const parsed =
        typeof vendorDetail.service_types === 'string'
          ? JSON.parse(vendorDetail.service_types)
          : vendorDetail.service_types
      if (Array.isArray(parsed)) ids = parsed
    } catch {}
    return ids.map((item) => {
      if (typeof item === 'number') {
        return serviceTypes[item] || `Layanan #${item}`
      }
      return String(item)
    })
  }, [vendorDetail?.service_types, serviceTypes])

  // Parse tukang data list
  const tukangList = useMemo(() => {
    if (!vendorDetail?.tukang_data) return []
    let list: any[] = []
    try {
      list = Array.isArray(vendorDetail.tukang_data)
        ? vendorDetail.tukang_data
        : JSON.parse(vendorDetail.tukang_data)
    } catch {}
    return Array.isArray(list) ? list : []
  }, [vendorDetail?.tukang_data])

  // Documents array matching 1:1 with mockup
  const documentList = useMemo(() => {
    if (!vendorDetail) return []
    const list = [
      {
        key: 'vendor_photo',
        label: 'Foto Vendor',
        value: vendorDetail.vendor_photo,
        format: 'JPG / PNG',
      },
      {
        key: 'ktp_photo',
        label: 'Foto KTP',
        value: vendorDetail.ktp_photo,
        format: 'JPG / PNG',
      },
      {
        key: 'npwp_photo',
        label: 'Foto NPWP',
        value: vendorDetail.npwp_photo,
        format: 'JPG / PNG',
      },
      {
        key: 'compro_photo',
        label: 'Foto COMPRO',
        value: vendorDetail.compro_photo,
        format: 'JPG / PDF',
      },
      {
        key: 'siup_photo',
        label: 'Foto SIUP',
        value: vendorDetail.siup_photo,
        format: 'JPG / PDF',
      },
      {
        key: 'surat_permohonan_photo',
        label: 'Surat Permohonan',
        value: vendorDetail.surat_permohonan_photo,
        format: 'JPG / PDF',
      },
    ]
    if (vendorDetail.pks_photo) {
      list.push({
        key: 'pks_photo',
        label: 'Foto PKS',
        value: vendorDetail.pks_photo,
        format: 'JPG / PDF',
      })
    }
    return list
  }, [vendorDetail])

  const uploadedDocsCount = useMemo(() => {
    return documentList.filter((d) => Boolean(d.value)).length
  }, [documentList])

  const missingDocs = useMemo(() => {
    return documentList.filter((d) => !d.value)
  }, [documentList])

  // Status configuration helper
  const statusInfo = useMemo(() => {
    const s = vendorDetail?.status
    if (s === 1) {
      return {
        pillClass: 'status-pending',
        label: 'Menunggu Approve',
        noteText: `Pendaftaran sedang menunggu approval · ${
          missingDocs.length > 0
            ? `${missingDocs.length} dokumen belum lengkap (${missingDocs.map((d) => d.label).join(', ')})`
            : 'Semua dokumen lengkap'
        }`,
      }
    }
    if (s === 2) {
      return {
        pillClass: 'status-pitching',
        label: 'Proses Pitching',
        noteText: `Pendaftaran sedang dalam proses pitching · ${
          missingDocs.length > 0
            ? `${missingDocs.length} dokumen belum lengkap (${missingDocs.map((d) => d.label).join(', ')})`
            : 'Semua dokumen lengkap'
        }`,
      }
    }
    if (s === 3) {
      return {
        pillClass: 'status-approved',
        label: 'Disetujui',
        noteText: 'Pendaftaran vendor telah disetujui (Vendor Aktif)',
      }
    }
    if (s === 4) {
      return {
        pillClass: 'status-rejected',
        label: 'Ditolak',
        noteText: `Pendaftaran ditolak${
          vendorDetail?.rejection_reason ? `: ${vendorDetail.rejection_reason}` : ''
        }`,
      }
    }
    return {
      pillClass: 'status-pending',
      label: 'Unknown',
      noteText: 'Status pendaftaran tidak diketahui',
    }
  }, [vendorDetail?.status, vendorDetail?.rejection_reason, missingDocs])

  // Loading State
  if (loading) {
    return (
      <div className='vendor-detail-page'>
        <div className='text-center py-5' style={{paddingTop: '100px'}}>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
          <p className='mt-3 text-muted' style={{fontSize: '14px', fontWeight: 600}}>
            Memuat data pendaftaran vendor...
          </p>
        </div>
      </div>
    )
  }

  // Error State
  if (error || !vendorDetail) {
    return (
      <div className='vendor-detail-page'>
        <div className='text-center py-5' style={{paddingTop: '80px'}}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <svg
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              style={{width: '32px', height: '32px'}}
            >
              <circle cx='12' cy='12' r='10' />
              <line x1='15' y1='9' x2='9' y2='15' />
              <line x1='9' y1='9' x2='15' y2='15' />
            </svg>
          </div>
          <h4 className='text-danger mb-2'>{error || 'Data vendor tidak ditemukan'}</h4>
          <p className='text-muted mb-4'>
            Periksa kembali ID pendaftaran atau kembali ke halaman daftar.
          </p>
          <Button
            variant='primary'
            style={{background: '#0F2A5C', borderColor: '#0F2A5C'}}
            onClick={() => navigate('/vendor-registration/view')}
          >
            Kembali ke Daftar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='vendor-detail-page'>
      {/* ── Main Container ──────────────────────────────────── */}
      <div className='vd-container'>
        {/* LEFT COLUMN: Profile Summary Card */}
        <div className='vd-profile-col'>
          <button
            type='button'
            className='vd-back-page-btn'
            onClick={() => navigate('/vendor-registration/view')}
            title='Kembali ke Daftar Pendaftaran'
          >
            <svg
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M19 12H5M12 19l-7-7 7-7' />
            </svg>
            Kembali ke Daftar
          </button>

          <div className='vd-card vd-profile-card'>
            <div
              className='vd-avatar-wrap'
              onClick={() => {
                if (vendorDetail.vendor_photo) {
                  setPreviewDoc({
                    title: `Foto Vendor - ${vendorDetail.company_name}`,
                    url: getImageUrl(vendorDetail.vendor_photo),
                  })
                }
              }}
              title={vendorDetail.vendor_photo ? 'Klik untuk memperbesar foto' : undefined}
            >
              {vendorDetail.vendor_photo ? (
                <img src={getImageUrl(vendorDetail.vendor_photo)} alt='Foto vendor' />
              ) : (
                <div className='vd-avatar-placeholder'>
                  {vendorDetail.company_name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>

            <p className='vd-profile-name'>{vendorDetail.company_name || '-'}</p>
            <p className='vd-profile-id'>
              ID Vendor #{vendorDetail.id} &middot; Daftar {formatDate(vendorDetail.created_at)}
            </p>

            <div className={`vd-status-pill ${statusInfo.pillClass}`}>
              <span className='dot'></span>
              {statusInfo.label}
            </div>

            <div className='vd-contact-list'>
              {/* Telepon */}
              <div className='vd-contact-row'>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' />
                </svg>
                <div>
                  <p className='vd-ct-label'>Telepon</p>
                  <p className='vd-ct-value'>{vendorDetail.phone_number || '-'}</p>
                </div>
              </div>

              {/* Email */}
              <div className='vd-contact-row'>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M4 4h16v16H4z' opacity='0' />
                  <path d='M22 6 12 13 2 6' />
                  <rect x='2' y='4' width='20' height='16' rx='2' />
                </svg>
                <div>
                  <p className='vd-ct-label'>Email</p>
                  <p className='vd-ct-value'>{vendorDetail.email_address || '-'}</p>
                </div>
              </div>

              {/* Alamat */}
              <div className='vd-contact-row'>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z' />
                  <circle cx='12' cy='10' r='3' />
                </svg>
                <div>
                  <p className='vd-ct-label'>Alamat</p>
                  <p className='vd-ct-value'>{vendorDetail.address || '-'}</p>
                </div>
              </div>
            </div>

            {/* Service Tags */}
            <div className='vd-service-tags'>
              <p className='vd-tag-title'>Jenis Layanan</p>
              {serviceTypeList.length > 0 ? (
                serviceTypeList.map((name, i) => (
                  <span key={i} className='vd-tag'>
                    {name}
                  </span>
                ))
              ) : (
                <span className='vd-tag' style={{color: '#9297AA', background: '#F4F5FA'}}>
                  Belum ditentukan
                </span>
              )}
            </div>

            {/* Catatan Tambahan (jika ada) */}
            {vendorDetail.notes && (
              <div className='vd-notes-box'>
                <div className='vd-notes-title'>Catatan Tambahan</div>
                <p className='vd-notes-text'>{vendorDetail.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Detail Sections */}
        <div className='vd-detail-col'>
          {/* 1. Data PIC & Rekening */}
          <div className='vd-card'>
            <div className='vd-section-head'>
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
            <div className='vd-info-grid'>
              <div className='vd-info-item'>
                <p className='vd-i-label'>Nama PIC</p>
                <p className='vd-i-value'>{vendorDetail.pic_name || '-'}</p>
              </div>
              <div className='vd-info-item'>
                <p className='vd-i-label'>Phone PIC</p>
                <p className='vd-i-value'>{vendorDetail.pic_phone || '-'}</p>
              </div>
              <div className='vd-info-item'>
                <p className='vd-i-label'>Email PIC</p>
                <p className='vd-i-value'>{vendorDetail.pic_email || '-'}</p>
              </div>
              <div className='vd-info-item'>
                <p className='vd-i-label'>Bank</p>
                <p className='vd-i-value'>{vendorDetail.bank?.bank_name || '-'}</p>
              </div>
              <div className='vd-info-item'>
                <p className='vd-i-label'>No. KTP</p>
                <p className='vd-i-value'>{vendorDetail.ktp_number || '-'}</p>
              </div>
              <div className='vd-info-item'>
                <p className='vd-i-label'>No. NPWP</p>
                <p className='vd-i-value'>{vendorDetail.npwp_number || '-'}</p>
              </div>
            </div>
          </div>

          {/* 2. Daftar Tukang */}
          <div className='vd-card'>
            <div className='vd-section-head'>
              <h2>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
                </svg>
                Daftar Tukang
              </h2>
              <span className='vd-count-badge'>{tukangList.length} orang</span>
            </div>

            {tukangList.length > 0 ? (
              <div className='vd-tukang-list'>
                {tukangList.map((t: any, i: number) => {
                  const skillNames = (t.service_type_id || []).map(
                    (id: number) => serviceTypes[id] || `Skill #${id}`
                  )
                  return (
                    <div key={i} className='vd-tukang-card'>
                      <div className='vd-tukang-head'>
                        <span className='vd-tukang-num'>{i + 1}</span>
                        Tukang {i + 1}
                      </div>
                      <div className='vd-tukang-body'>
                        <div>
                          <p className='vd-i-label'>
                            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                              <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                              <circle cx='12' cy='7' r='4' />
                            </svg>
                            Nama Lengkap
                          </p>
                          <p className='vd-i-value'>{t.full_name || '-'}</p>
                        </div>
                        <div>
                          <p className='vd-i-label'>
                            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                              <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' />
                            </svg>
                            No. HP
                          </p>
                          <p className='vd-i-value'>{t.phone_number || '-'}</p>
                        </div>
                        <div>
                          <p className='vd-i-label'>
                            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                              <rect x='2' y='5' width='20' height='14' rx='2' />
                              <path d='M2 10h20' />
                            </svg>
                            No. KTP
                          </p>
                          <p className='vd-i-value'>{t.ktp_number || '-'}</p>
                        </div>
                        <div>
                          <p className='vd-i-label'>
                            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                              <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
                            </svg>
                            Skill
                          </p>
                          <p className='vd-i-value'>
                            {skillNames.length > 0 ? skillNames.join(', ') : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='vd-empty-state'>
                <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6'>
                  <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
                </svg>
                <p>Belum ada data tukang yang didaftarkan</p>
              </div>
            )}
          </div>

          {/* 3. Dokumen & Foto */}
          <div className='vd-card'>
            <div className='vd-section-head'>
              <h2>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                  <path d='M14 2v6h6' />
                </svg>
                Dokumen &amp; Foto
              </h2>
              <span className='vd-count-badge'>
                {uploadedDocsCount} / {documentList.length} lengkap
              </span>
            </div>

            <div className='vd-doc-grid'>
              {documentList.map((doc, idx) => {
                const hasFile = Boolean(doc.value)
                const docUrl = hasFile ? getImageUrl(doc.value) : ''
                return (
                  <div key={idx} className='vd-doc-card'>
                    <div className={`vd-doc-card-head ${hasFile ? 'ok' : 'missing'}`}>
                      {hasFile ? (
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                          <rect x='3' y='3' width='18' height='18' rx='2' />
                          <circle cx='8.5' cy='8.5' r='1.5' />
                          <path d='m21 15-5-5L5 21' />
                        </svg>
                      ) : (
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                          <circle cx='12' cy='12' r='10' />
                          <path d='M12 8v4M12 16h.01' />
                        </svg>
                      )}
                      {doc.label}
                    </div>

                    {hasFile ? (
                      <div
                        className='vd-doc-thumb'
                        onClick={() => setPreviewDoc({title: doc.label, url: docUrl})}
                        title={`Klik untuk memperbesar ${doc.label}`}
                      >
                        <img
                          src={docUrl}
                          alt={doc.label}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent && !parent.querySelector('.vd-fallback')) {
                              const fallback = document.createElement('div')
                              fallback.className = 'vd-fallback'
                              fallback.style.cssText =
                                'text-align:center; color:#9297AA; padding:20px; font-size:12px; font-weight:600;'
                              fallback.innerText = 'Pratinjau berkas (klik untuk buka)'
                              parent.appendChild(fallback)
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className='vd-doc-thumb empty'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6'>
                          <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                          <path d='M14 2v6h6' />
                        </svg>
                        <span>Belum diunggah</span>
                      </div>
                    )}

                    <div className='vd-doc-footer'>
                      <span>{hasFile ? doc.format : 'Menunggu vendor'}</span>
                      {hasFile && (
                        <button
                          type='button'
                          className='vd-view-link'
                          onClick={() => setPreviewDoc({title: doc.label, url: docUrl})}
                        >
                          Lihat
                          <svg
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2.5'
                          >
                            <path d='M7 17 17 7M7 7h10v10' />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 4. Histori Pendaftaran */}
          <div className='vd-card vd-history-card'>
            <div className='vd-section-head'>
              <h2>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M3 3v5h5' />
                  <path d='M3.05 13A9 9 0 1 0 6 5.3L3 8' />
                  <path d='M12 7v5l4 2' />
                </svg>
                Histori Pendaftaran
              </h2>
              <span className='vd-section-sub'>
                {histories.length} catatan aktivitas
              </span>
            </div>

            <div className='vd-history-body'>
              {histories.length === 0 ? (
                <div className='vd-empty-history'>
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    width='36'
                    height='36'
                  >
                    <circle cx='12' cy='12' r='10' />
                    <path d='M12 6v6l4 2' />
                  </svg>
                  <p>Belum ada catatan aktivitas untuk pendaftaran ini.</p>
                </div>
              ) : (
                <div className='vd-timeline'>
                  {histories.map((history, idx) => {
                    const fromLabel = history.from_status
                      ? statusLabels[history.from_status] || `Status ${history.from_status}`
                      : 'Pendaftaran Masuk'
                    const toLabel =
                      statusLabels[history.to_status] || `Status ${history.to_status}`
                    const actionTitle =
                      actionLabels[history.action] || history.action || 'Perubahan Status'

                    return (
                      <div key={history.id || idx} className='vd-timeline-item'>
                        <div className='vd-timeline-marker'>
                          <span
                            className={`vd-timeline-dot ${
                              history.to_status === 3
                                ? 'dot-approved'
                                : history.to_status === 4
                                ? 'dot-rejected'
                                : history.to_status === 2
                                ? 'dot-pitching'
                                : 'dot-pending'
                            }`}
                          />
                          {idx !== histories.length - 1 && <span className='vd-timeline-line' />}
                        </div>

                        <div className='vd-timeline-content'>
                          <div className='vd-timeline-header'>
                            <span className='vd-timeline-action'>{actionTitle}</span>
                            <span className='vd-timeline-date'>
                              <svg
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                width='13'
                                height='13'
                              >
                                <circle cx='12' cy='12' r='10' />
                                <path d='M12 6v6l4 2' />
                              </svg>
                              {formatDateTime(history.created_at)}
                            </span>
                          </div>

                          <div className='vd-timeline-flow'>
                            <span className='vd-badge-from'>{fromLabel}</span>
                            <svg
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              className='vd-flow-arrow'
                            >
                              <path d='M5 12h14M12 5l7 7-7 7' />
                            </svg>
                            <span
                              className={`vd-badge-to ${
                                history.to_status === 3
                                  ? 'badge-approved'
                                  : history.to_status === 4
                                  ? 'badge-rejected'
                                  : history.to_status === 2
                                  ? 'badge-pitching'
                                  : 'badge-pending'
                              }`}
                            >
                              {toLabel}
                            </span>
                          </div>

                          {history.notes && (
                            <div className='vd-timeline-notes'>
                              <strong>Catatan:</strong> {history.notes}
                            </div>
                          )}

                          <div className='vd-timeline-footer'>
                            <span>
                              Eksekutor:{' '}
                              <strong>
                                {history.actor_id ? `Admin #${history.actor_id}` : 'Sistem'}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Action Bar ───────────────────────────────── */}
      <div className='vd-action-bar'>
        <div className='vd-action-note'>
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
          <>
            <button
              type='button'
              className='vd-btn vd-btn-reject'
              onClick={() => setShowRejectModal(true)}
              disabled={submitting}
            >
              <svg
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.4'
                strokeLinecap='round'
              >
                <path d='M18 6 6 18M6 6l12 12' />
              </svg>
              Tolak Pendaftaran
            </button>

            <button
              type='button'
              className='vd-btn vd-btn-approve'
              onClick={handleApprove}
              disabled={submitting}
            >
              <svg
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.4'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M20 6 9 17l-5-5' />
              </svg>
              {submitting
                ? 'Memproses...'
                : vendorDetail.status === 1
                ? 'Proses Pitching'
                : 'Setujui Final'}
            </button>
          </>
        )}
      </div>

      {/* ── Rejection Modal Dialog ──────────────────────────── */}
      <Modal
        show={showRejectModal}
        onHide={() => {
          if (!submitting) {
            setShowRejectModal(false)
            setRejectReason('')
          }
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{fontWeight: 700, fontSize: '17px', color: '#141B33'}}>
            Tolak Pendaftaran Vendor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{fontSize: '13px', color: '#5B6178', marginBottom: '14px', lineHeight: 1.5}}>
            Masukkan alasan penolakan pendaftaran vendor{' '}
            <strong>{vendorDetail.company_name}</strong>. Email dan kontak PIC akan dibatasi
            selama 30 hari.
          </p>
          <Form.Group>
            <Form.Label style={{fontSize: '12.5px', fontWeight: 600, color: '#141B33'}}>
              Alasan Penolakan <span className='text-danger'>*</span>
            </Form.Label>
            <Form.Control
              as='textarea'
              rows={4}
              placeholder='Contoh: Dokumen KTP atau NPWP tidak terbaca jelas, mohon mendaftar ulang dengan dokumen valid...'
              value={rejectReason}
              onChange={(e: any) => setRejectReason(e.target.value)}
              autoFocus
              style={{fontSize: '13px', borderRadius: '8px'}}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='light'
            onClick={() => {
              setShowRejectModal(false)
              setRejectReason('')
            }}
            disabled={submitting}
            style={{fontWeight: 600, borderRadius: '8px'}}
          >
            Batal
          </Button>
          <Button
            variant='danger'
            onClick={handleReject}
            disabled={submitting || !rejectReason.trim()}
            style={{
              fontWeight: 700,
              background: '#DC2626',
              borderColor: '#DC2626',
              borderRadius: '8px',
            }}
          >
            {submitting ? 'Memproses...' : 'Konfirmasi Tolak'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Lightbox Preview Modal ──────────────────────────── */}
      {previewDoc && (
        <div className='vd-lightbox-overlay' onClick={() => setPreviewDoc(null)}>
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
                  onClick={() => setPreviewDoc(null)}
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
      )}
    </div>
  )
}
