import React, {useState, useEffect, useMemo} from 'react'
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
  actor_username?: string | null
  actor_role?: string | null
  actor_display?: string | null
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
  REGISTRANT_PROMOTED: 'Akun Pendaftar Dipromosikan',
}

const formatRegistrationDate = (date?: string | null) => {
  if (!date) return '-'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatDateTime = (date?: string | null) => {
  if (!date) return '-'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '-'
  const datePart = parsed.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const hours = parsed.getHours().toString().padStart(2, '0')
  const minutes = parsed.getMinutes().toString().padStart(2, '0')
  return `${datePart}, ${hours}.${minutes}`
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

  // Toggle eye mask for KTP & NPWP
  const [showKtp, setShowKtp] = useState(false)
  const [showNpwp, setShowNpwp] = useState(false)

  // Lightbox preview modal state
  const [previewDoc, setPreviewDoc] = useState<{title: string; url: string} | null>(null)

  // Dropdown maps: service types & areas
  const [serviceTypes, setServiceTypes] = useState<Record<number, string>>({})
  const [areaMap, setAreaMap] = useState<Record<number, string>>({})

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const res = await apiClient.get('/service-type')
        const data = res.data?.data?.data || res.data?.data || []
        const map: Record<number, string> = {}
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            map[item.id] = item.service_type
          })
        }
        setServiceTypes(map)
      } catch (err) {
        console.error('Failed to load service types', err)
      }
    }

    const fetchAreas = async () => {
      try {
        const res = await apiClient.get('/area?take=100')
        const data = res.data?.data?.data || res.data?.data || []
        const map: Record<number, string> = {}
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            map[item.id] = item.area
          })
        }
        setAreaMap(map)
      } catch (err) {
        console.error('Failed to load areas', err)
      }
    }

    fetchServiceTypes()
    fetchAreas()
  }, [])

  useEffect(() => {
    if (id) {
      fetchData(id)
    }
  }, [id])

  useEffect(() => {
    if (actionParam === 'reject') {
      setShowRejectModal(true)
    }
  }, [actionParam])

  useEffect(() => {
    const hasButtons = Boolean(
      (vendorDetail?.status === 1 || vendorDetail?.status === 2) && isAuthorized
    )
    if (hasButtons) {
      document.body.classList.add('has-vendor-action-bar')
    } else {
      document.body.classList.remove('has-vendor-action-bar')
    }
    return () => {
      document.body.classList.remove('has-vendor-action-bar')
    }
  }, [vendorDetail?.status, isAuthorized])

  const fetchData = async (vendorId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await vendorRegistrationService.getById(vendorId)
      const data = response.data?.data ?? response.data ?? null
      setVendorDetail(data)

      const historyData =
        Array.isArray(data?.histories) && data.histories.length > 0
          ? data.histories
          : Array.isArray(data?.history) && data.history.length > 0
          ? data.history
          : null

      if (historyData) {
        setHistories(historyData)
      } else {
        try {
          const histRes = await vendorRegistrationService.getHistory(vendorId)
          const raw = histRes.data?.data ?? histRes.data
          const parsed = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
          setHistories(parsed)
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
      confirmButtonColor: '#183383',
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

  const getImageUrl = (path: string | undefined | null) => {
    if (!path) return ''
    const cleanPath = path.replace('uploads/', '')
    return `${apiUrl}/public/${cleanPath}`
  }

  // Service types list
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

  // Service areas list
  const serviceAreaList = useMemo(() => {
    if (!vendorDetail?.areas) return []
    let ids: any[] = []
    try {
      const parsed =
        typeof vendorDetail.areas === 'string' ? JSON.parse(vendorDetail.areas) : vendorDetail.areas
      if (Array.isArray(parsed)) ids = parsed
      else if (parsed !== null && parsed !== undefined) ids = [parsed]
    } catch {
      if (typeof vendorDetail.areas === 'string') {
        ids = vendorDetail.areas.split(',').map((s) => s.trim())
      }
    }
    return ids.map((item) => {
      const num = Number(item)
      if (!isNaN(num) && areaMap[num]) {
        return areaMap[num]
      }
      return String(item)
    })
  }, [vendorDetail?.areas, areaMap])

  // Tukang data list
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

  // Document list strictly matching vendor-detail (6).html
  const documentList = useMemo(() => {
    if (!vendorDetail) return []
    return [
      {
        key: 'vendor_photo',
        label: 'Foto Vendor',
        value: vendorDetail.vendor_photo,
      },
      {
        key: 'ktp_photo',
        label: 'KTP',
        value: vendorDetail.ktp_photo,
      },
      {
        key: 'npwp_photo',
        label: 'NPWP',
        value: vendorDetail.npwp_photo,
      },
      {
        key: 'compro_photo',
        label: 'Company Profile',
        value: vendorDetail.compro_photo,
      },
      {
        key: 'surat_permohonan_photo',
        label: 'Surat Permohonan',
        value: vendorDetail.surat_permohonan_photo,
      },
      {
        key: 'pks_photo',
        label: 'PKS',
        value: vendorDetail.pks_photo,
      },
      {
        key: 'siup_photo',
        label: 'SIUP / NIB',
        value: vendorDetail.siup_photo,
      },
    ]
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
    const missingText =
      missingDocs.length > 0
        ? `${missingDocs.length} dokumen belum lengkap (${missingDocs
            .map((d) => d.label)
            .join(', ')})`
        : 'Semua dokumen lengkap'

    if (s === 1) {
      return {
        colorClass: 'amber',
        label: 'Menunggu Approve',
        noteText: `Pendaftaran sedang menunggu approval · ${missingText}`,
      }
    }
    if (s === 2) {
      return {
        colorClass: 'blue',
        label: 'Proses Pitching',
        noteText: `Pendaftaran sedang dalam proses pitching · ${missingText}`,
      }
    }
    if (s === 3) {
      return {
        colorClass: 'green',
        label: 'Disetujui',
        noteText: 'Pendaftaran vendor telah disetujui (Vendor Aktif)',
      }
    }
    if (s === 4) {
      return {
        colorClass: 'red',
        label: 'Ditolak',
        noteText: `Pendaftaran ditolak${
          vendorDetail?.rejection_reason ? `: ${vendorDetail.rejection_reason}` : ''
        }`,
      }
    }
    return {
      colorClass: 'amber',
      label: 'Unknown',
      noteText: 'Status pendaftaran tidak diketahui',
    }
  }, [vendorDetail?.status, vendorDetail?.rejection_reason, missingDocs])

  // Loading State
  if (loading) {
    return (
      <div className='vendor-detail-page'>
        <div className='text-center py-5' style={{paddingTop: '100px'}}>
          <div className='spinner-border' style={{color: '#181c32'}} role='status'>
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
            style={{background: '#181c32', borderColor: '#181c32'}}
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
      <div className='page'>
        {/* LEFT COLUMN: Profile Card */}
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
                    url: getImageUrl(vendorDetail.vendor_photo),
                  })
                }
              }}
              title={vendorDetail.vendor_photo ? 'Klik untuk memperbesar foto' : undefined}
            >
              {vendorDetail.vendor_photo ? (
                <img src={getImageUrl(vendorDetail.vendor_photo)} alt='Foto vendor' />
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

        {/* RIGHT COLUMN: Detail Sections */}
        <div className='detail-col'>
          {/* Card 1: Informasi Perusahaan */}
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

          {/* Card 2: Informasi PIC & Rekening */}
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

          {/* Card 3: Daftar Tukang */}
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
                  <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
                </svg>
                Daftar Tukang
              </h2>
              <span className='count-badge'>{tukangList.length} orang</span>
            </div>

            {tukangList.length > 0 ? (
              <div className='tukang-list'>
                {tukangList.map((t: any, i: number) => {
                  const rawSkillIds = Array.isArray(t.service_type_id)
                    ? t.service_type_id
                    : t.service_type_id !== undefined && t.service_type_id !== null
                    ? [t.service_type_id]
                    : []
                  const skillNames = rawSkillIds.map(
                    (skillId: number) => serviceTypes[skillId] || `Skill #${skillId}`
                  )

                  return (
                    <div key={i} className='tukang-card'>
                      <div className='tukang-head'>
                        <span className='tukang-num'>{i + 1}</span>
                        Tukang {i + 1}
                      </div>
                      <div className='tukang-body'>
                        <div>
                          <p className='i-label'>
                            <svg
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                            >
                              <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                              <circle cx='12' cy='7' r='4' />
                            </svg>
                            Nama Lengkap
                          </p>
                          <p className='i-value'>{t.full_name || '-'}</p>
                        </div>
                        <div>
                          <p className='i-label'>
                            <svg
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                            >
                              <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' />
                            </svg>
                            No. HP
                          </p>
                          <p className='i-value'>{t.phone_number || '-'}</p>
                        </div>
                        <div>
                          <p className='i-label'>
                            <svg
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                            >
                              <rect x='2' y='5' width='20' height='14' rx='2' />
                              <path d='M2 10h20' />
                            </svg>
                            No. KTP
                          </p>
                          <p className='i-value'>{t.ktp_number || '-'}</p>
                        </div>
                        <div>
                          <p className='i-label'>
                            <svg
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                            >
                              <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
                            </svg>
                            Skill
                          </p>
                          <p className='i-value'>
                            {skillNames.length > 0 ? skillNames.join(', ') : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='tukang-empty'>Belum ada data tukang yang didaftarkan</div>
            )}
          </div>

          {/* Card 4: Dokumen */}
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
                  <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                  <path d='M14 2v6h6' />
                </svg>
                Dokumen
              </h2>
              <span className='count-badge'>
                {uploadedDocsCount} / {documentList.length} lengkap
              </span>
            </div>

            <div className='doc-list'>
              {documentList.map((doc, idx) => {
                const hasFile = Boolean(doc.value)
                const docUrl = hasFile ? getImageUrl(doc.value) : ''

                return (
                  <div key={idx} className={`doc-row ${hasFile ? '' : 'missing'}`}>
                    <span className='doc-row-label'>{doc.label}</span>
                    {hasFile ? (
                      <button
                        type='button'
                        className='file-link'
                        onClick={() => setPreviewDoc({title: doc.label, url: docUrl})}
                        title={`Lihat dokumen ${doc.label}`}
                      >
                        Lihat Dokumen
                        <svg
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2.5'
                          strokeLinecap='round'
                        >
                          <path d='M7 17 17 7M7 7h10v10' />
                        </svg>
                      </button>
                    ) : (
                      <span className='file-link'>Belum diunggah</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card 5: Histori Pendaftaran */}
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
                  <path d='M3 3v5h5' />
                  <path d='M3.05 13A9 9 0 1 0 6 5.3L3 8' />
                  <path d='M12 7v5l4 2' />
                </svg>
                Histori Pendaftaran
              </h2>
              <span className='hist-count'>{histories.length} catatan aktivitas</span>
            </div>

            {histories.length === 0 ? (
              <div className='hist-empty'>Belum ada catatan aktivitas untuk pendaftaran ini.</div>
            ) : (
              <div className='hist-timeline'>
                {histories.map((history, idx) => {
                  const fromLabel = history.from_status
                    ? statusLabels[history.from_status] || `Status ${history.from_status}`
                    : 'Pendaftaran Masuk'
                  const toLabel = statusLabels[history.to_status] || `Status ${history.to_status}`
                  const actionTitle =
                    actionLabels[history.action] || history.action || 'Perubahan Status'

                  const dotColor =
                    history.to_status === 3
                      ? 'green'
                      : history.to_status === 4
                      ? 'red'
                      : history.to_status === 2
                      ? 'blue'
                      : 'amber'

                  const toBadgeColor = dotColor

                  return (
                    <div key={history.id || idx} className='hist-item'>
                      <div className='hist-marker'>
                        <span className={`hist-dot ${dotColor}`} />
                        {idx !== histories.length - 1 && <span className='hist-line' />}
                      </div>

                      <div
                        className='hist-body'
                        style={idx === histories.length - 1 ? {marginBottom: 0} : undefined}
                      >
                        <div className='hist-top'>
                          <p className='hist-title'>{actionTitle}</p>
                          <span className='hist-time'>
                            <svg
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                            >
                              <circle cx='12' cy='12' r='10' />
                              <path d='M12 6v6l4 2' />
                            </svg>
                            {formatDateTime(history.created_at)}
                          </span>
                        </div>

                        <div className='hist-status-row'>
                          <span className='hist-badge'>{fromLabel}</span>
                          <svg
                            className='hist-arrow'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2.5'
                            strokeLinecap='round'
                          >
                            <path d='M5 12h14M13 6l6 6-6 6' />
                          </svg>
                          <span className={`hist-badge ${toBadgeColor}`}>{toLabel}</span>
                        </div>

                        {history.notes && (
                          <p className='hist-note'>
                            <b>Catatan:</b> {history.notes}
                          </p>
                        )}

                        <p className='hist-exec'>
                          Eksekutor:{' '}
                          <b>
                            {history.actor_display ||
                              (history.actor_username
                                ? `${history.actor_username}${
                                    history.actor_role ? ` (${history.actor_role})` : ''
                                  }`
                                : history.actor_id
                                ? `Admin #${history.actor_id}`
                                : 'Sistem')}
                          </b>
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky Action Bar ───────────────────────────────── */}
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
          <Modal.Title style={{fontWeight: 700, fontSize: '17px', color: '#181c32'}}>
            Tolak Pendaftaran Vendor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{fontSize: '13px', color: '#5B6178', marginBottom: '14px', lineHeight: 1.5}}>
            Masukkan alasan penolakan pendaftaran vendor{' '}
            <strong>{vendorDetail.company_name}</strong>. Email dan kontak PIC akan dibatasi selama
            30 hari.
          </p>
          <Form.Group>
            <Form.Label style={{fontSize: '12.5px', fontWeight: 600, color: '#181c32'}}>
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
export default VendorRegistrationApproval
