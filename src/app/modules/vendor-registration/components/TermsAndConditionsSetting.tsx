/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Swal from 'sweetalert2'
import {Table, Spin} from 'antd'
import type {ColumnsType} from 'antd/es/table'
import {LoadingOutlined} from '@ant-design/icons'
import {Form, FormGroup, Row, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSearch, faEdit, faToggleOn, faToggleOff} from '@fortawesome/free-solid-svg-icons'
import apiClient from '../../../services/apiClient'
import './TermsAndConditionsSetting.css'

interface TermsVersion {
  id: number
  title: string
  version: number
  is_active: boolean
  document_type: 'HTML' | 'PDF'
  created_at: string
  updated_at: string | null
}

/**
 * Halaman SETTING: daftar versi Syarat & Ketentuan (T&C).
 * Tampilan 1:1 dengan halaman Daftar Pendaftaran Vendor (ViewVendorRegistration):
 * search bar + icon, tabel striped header biru, badge outline, action icon pensil.
 * Hanya Admin HO / Super User (di-guard backend role-check manual).
 * Edit selalu membuat versi baru (versioning/audit trail).
 */
const ViewTermsAndConditions: React.FC = () => {
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [versions, setVersions] = useState<TermsVersion[]>([])
  const [error, setError] = useState('')

  // Search filter (client-side: data versi sedikit, tidak perlu server filter)
  const [searchFilter, setSearchFilter] = useState('')

  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value)
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay)
      return () => clearTimeout(handler)
    }, [value, delay])
    return debouncedValue
  }

  const debouncedSearch = useDebounce(searchFilter, 500)

  const fetchVersions = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await apiClient.get('/vendor-registration/terms-and-conditions/versions')
      const data = response.data?.data ?? response.data
      setVersions(data?.data ?? [])
    } catch (err: unknown) {
      console.error('Error fetching terms versions:', err)
      setError('Gagal memuat data versi Syarat & Ketentuan.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVersions()
  }, [])

  // Filter client-side by judul / versi
  const filteredVersions = versions.filter((version) => {
    if (!debouncedSearch) return true
    const query = debouncedSearch.toLowerCase()
    return (
      version.title.toLowerCase().includes(query) ||
      `v${version.version}`.includes(query) ||
      String(version.version).includes(query)
    )
  })
  // Extract pesan error dari AxiosError response (narrowing, tanpa cast inline)
  const extractErrorMessage = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as {response?: {data?: {message?: string[] | string}}}).response
      const message = response?.data?.message
      if (typeof message === 'string') return message
      if (Array.isArray(message)) return message.join(', ')
    }
    return fallback
  }

  const handleChangeSearchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(e.target.value)
  }

  // Aktifkan versi -> backend menonaktifkan semua versi lain (single-active).
  const handleActivate = async (record: TermsVersion) => {
    const confirm = await Swal.fire({
      title: 'Aktifkan Versi Ini?',
      text: `Versi v${record.version} (${record.document_type}) akan menjadi SATU-SATUNYA T&C aktif. Versi aktif saat ini otomatis dinonaktifkan.`,
      icon: 'question',
      showConfirmButton: true,
      confirmButtonColor: '#6b9230',
      showDenyButton: true,
      confirmButtonText: 'Ya, Aktifkan',
      denyButtonText: 'Batal',
    })

    if (!confirm.isConfirmed) return

    try {
      await apiClient.put(`/vendor-registration/terms-and-conditions/versions/${record.id}/activate`)
      Swal.fire({
        title: 'Berhasil',
        text: `Versi v${record.version} diaktifkan.`,
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
      })
      fetchVersions()
    } catch (err: unknown) {
      Swal.fire('Gagal', extractErrorMessage(err, 'Gagal mengaktifkan versi.'), 'error')
    }
  }

  // Nonaktifkan versi -> ditolak backend jika ini satu-satunya versi aktif.
  const handleDeactivate = async (record: TermsVersion) => {
    const confirm = await Swal.fire({
      title: 'Nonaktifkan Versi Ini?',
      text: `Versi v${record.version} akan dinonaktifkan. Catatan: minimal 1 versi harus aktif - aktifkan versi lain terlebih dahulu jika ini satu-satunya versi aktif.`,
      icon: 'warning',
      showConfirmButton: true,
      confirmButtonColor: '#d32f2f',
      showDenyButton: true,
      confirmButtonText: 'Ya, Nonaktifkan',
      denyButtonText: 'Batal',
    })

    if (!confirm.isConfirmed) return

    try {
      await apiClient.put(
        `/vendor-registration/terms-and-conditions/versions/${record.id}/deactivate`
      )
      Swal.fire({
        title: 'Berhasil',
        text: `Versi v${record.version} dinonaktifkan.`,
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
      })
      fetchVersions()
    } catch (err: unknown) {
      Swal.fire('Gagal', extractErrorMessage(err, 'Gagal menonaktifkan versi.'), 'error')
    }
  }
  const columns: ColumnsType<TermsVersion> = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      align: 'center',
      width: 60,
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'Versi',
      dataIndex: 'version',
      key: 'version',
      align: 'center',
      width: 90,
      render: (version: number) => `v${version}`,
    },
    {
      title: 'Tipe',
      dataIndex: 'document_type',
      key: 'document_type',
      align: 'center',
      width: 90,
      render: (docType: 'HTML' | 'PDF') => (
        <span
          className={`status-badge fw-semibold ${
            docType === 'PDF' ? 'terms-setting-badge-pdf' : 'terms-setting-badge-html'
          }`}
        >
          {docType}
        </span>
      ),
    },
    {
      title: 'Judul',
      dataIndex: 'title',
      key: 'title',
      align: 'left',
      width: 220,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center',
      width: 130,
      render: (isActive: boolean) => (
        <span
          className={`status-badge fw-semibold ${isActive ? 'terms-setting-badge-active' : 'terms-setting-badge-archived'}`}
        >
          {isActive ? 'Aktif' : 'Arsip'}
        </span>
      ),
    },
    {
      title: 'Tanggal Dibuat',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      width: 160,
      render: (date: string) =>
        new Date(date).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      align: 'center',
      width: 140,
      render: (record: TermsVersion) => (
        <div className='button-wrapper d-flex justify-content-center align-items-center gap-2'>
          <OverlayTrigger
            placement='bottom'
            delay={{show: 250, hide: 400}}
            overlay={<Tooltip id={`tooltip-edit-${record.id}`}>Edit / Buat Versi Baru</Tooltip>}
          >
            <a
              href='#'
              className='btn btn-icon btn-sm btn-light-primary rounded action-button shadow-none'
              onClick={(e) => {
                e.preventDefault()
                navigate(`/vendor-registration/terms-setting/edit/${record.id}`)
              }}
            >
              <FontAwesomeIcon icon={faEdit} fontSize={'13px'} />
            </a>
          </OverlayTrigger>

          {record.is_active ? (
            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={
                <Tooltip id={`tooltip-deactivate-${record.id}`}>
                  Nonaktifkan (aktifkan versi lain terlebih dahulu)
                </Tooltip>
              }
            >
              <a
                href='#'
                className='btn btn-icon btn-sm btn-danger rounded action-button shadow-none'
                onClick={(e) => {
                  e.preventDefault()
                  handleDeactivate(record)
                }}
              >
                <FontAwesomeIcon icon={faToggleOn} fontSize={'13px'} />
              </a>
            </OverlayTrigger>
          ) : (
            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={
                <Tooltip id={`tooltip-activate-${record.id}`}>
                  Aktifkan (versi aktif saat ini otomatis dinonaktifkan)
                </Tooltip>
              }
            >
              <a
                href='#'
                className='btn btn-icon btn-sm btn-light-success rounded action-button shadow-none'
                onClick={(e) => {
                  e.preventDefault()
                  handleActivate(record)
                }}
              >
                <FontAwesomeIcon icon={faToggleOff} fontSize={'13px'} />
              </a>
            </OverlayTrigger>
          )}
        </div>
      ),
    },
  ]

  const activeVersion = versions.find((version) => version.is_active)

  return (
    <section id='terms-setting-view'>
      <div className='card'>
        <div className='card-body'>
          <h1 className='terms-setting-title'>Syarat &amp; Ketentuan Pendaftaran Vendor</h1>
          <p className='terms-setting-subtitle'>
            Konten ini ditampilkan read-only (tanpa download) di halaman login dan dashboard
            pendaftar. Setiap perubahan membuat versi baru; versi lama menjadi arsip.
          </p>

          <Form.Group className='mb-3'>
            <Form.Label className='mb-1'>
              Edit konten T&amp;C aktif (v{activeVersion?.version ?? '-'}): klik icon pensil pada
              baris berstatus Aktif.
            </Form.Label>
          </Form.Group>

          {error ? (
            <div className='terms-setting-error'>{error}</div>
          ) : null}

          <Row className='table-head-wrapper'>
            <div className='d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row flex-xxl-row align-items-start align-items-sm-center align-items-md-center align-items-lg-center align-items-xl-center align-items-xxl-center justify-content-start gap-3'>
              <div className='filter-search'>
                <FormGroup>
                  <Form.Control
                    placeholder='Judul / Versi'
                    className='filter-ltr'
                    onChange={handleChangeSearchFilter}
                    value={searchFilter}
                  />
                  <span className='search-icon'>
                    <FontAwesomeIcon icon={faSearch} className='text-black' size='sm' />
                  </span>
                </FormGroup>
              </div>
            </div>
          </Row>

          <Spin
            tip='Loading...'
            spinning={isLoading}
            size='large'
            indicator={<LoadingOutlined style={{fontSize: 24}} spin />}
          >
            <div className='table-custom-wrapper'>
              <Table
                className='table-striped-rows terms-setting-table'
                bordered
                columns={columns}
                dataSource={filteredVersions}
                rowKey={(record) => record.id}
                pagination={false}
                sticky={true}
                tableLayout='auto'
                scroll={{x: 'max-content'}}
              />
            </div>
          </Spin>

          <div className='pagination-container mt-5'>
            <span className='total-text'>Showing {filteredVersions.length} of {versions.length} Versi T&amp;C</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export {ViewTermsAndConditions}
