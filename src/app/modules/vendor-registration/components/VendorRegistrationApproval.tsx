import React, {useState, useEffect, useMemo} from 'react'
import {useParams, useNavigate, useSearchParams} from 'react-router-dom'
import {vendorRegistrationService} from '../../../services/vendorRegistrationService'
import apiClient from '../../../services/apiClient'
import Swal from 'sweetalert2'
import {Button} from 'react-bootstrap'
import './VendorRegistrationApproval.css'
import {VendorRegistrationDetail, VendorRegistrationHistoryItem} from './approval/types'
import {VendorProfileSidebar} from './approval/VendorProfileSidebar'
import {VendorCompanyInfoCard} from './approval/VendorCompanyInfoCard'
import {VendorPicBankCard} from './approval/VendorPicBankCard'
import {VendorTukangListCard} from './approval/VendorTukangListCard'
import {VendorDocumentListCard} from './approval/VendorDocumentListCard'
import {VendorHistoryTimelineCard} from './approval/VendorHistoryTimelineCard'
import {VendorActionBar} from './approval/VendorActionBar'
import {VendorRejectModal} from './approval/VendorRejectModal'
import {VendorLightboxModal} from './approval/VendorLightboxModal'

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
    // eslint-disable-next-line
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

  // Document list strictly matching vendor-detail
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
        <VendorProfileSidebar
          vendorDetail={vendorDetail}
          statusInfo={statusInfo}
          navigate={navigate}
          apiUrl={apiUrl}
          setPreviewDoc={setPreviewDoc}
        />

        {/* RIGHT COLUMN: Detail Sections */}
        <div className='detail-col'>
          <VendorCompanyInfoCard
            vendorDetail={vendorDetail}
            serviceAreaList={serviceAreaList}
            serviceTypeList={serviceTypeList}
          />

          <VendorPicBankCard
            vendorDetail={vendorDetail}
            showKtp={showKtp}
            setShowKtp={setShowKtp}
            showNpwp={showNpwp}
            setShowNpwp={setShowNpwp}
          />

          <VendorTukangListCard
            tukangList={tukangList}
            serviceTypes={serviceTypes}
          />

          <VendorDocumentListCard
            documentList={documentList}
            uploadedDocsCount={uploadedDocsCount}
            apiUrl={apiUrl}
            setPreviewDoc={setPreviewDoc}
          />

          <VendorHistoryTimelineCard histories={histories} />
        </div>
      </div>

      {/* Sticky Action Bar */}
      <VendorActionBar
        vendorDetail={vendorDetail}
        statusInfo={statusInfo}
        isAuthorized={isAuthorized}
        submitting={submitting}
        setShowRejectModal={setShowRejectModal}
        handleApprove={handleApprove}
      />

      {/* Rejection Modal Dialog */}
      <VendorRejectModal
        show={showRejectModal}
        submitting={submitting}
        vendorCompanyName={vendorDetail.company_name}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onClose={() => {
          setShowRejectModal(false)
          setRejectReason('')
        }}
        handleReject={handleReject}
      />

      {/* Lightbox Preview Modal */}
      <VendorLightboxModal
        previewDoc={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  )
}

export default VendorRegistrationApproval
