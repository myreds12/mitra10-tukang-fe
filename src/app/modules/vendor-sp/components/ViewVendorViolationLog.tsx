import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import apiClient from '../../../services/apiClient'
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  DatePicker,
  Pagination,
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  DownloadOutlined,
  SearchOutlined,
  ClearOutlined,
  FileSearchOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import {
  VendorSpActionButton,
  VendorSpOrderLink,
  VendorSpPill,
  vendorSpTableClassName,
  formatQuarterDateBounds,
  formatViolationIncidentDate,
  formatViolationIncidentDateTime,
} from './VendorSpTable'
import { vendorViolationService } from '../../../services/vendorViolationService'
import { vendorSpService } from '../../../services/vendorSpService'
import { DetailVendorSpModal } from './DetailVendorSP'
import './VendorSpFilter.css'

const { Option } = Select

interface ViolationLog {
  id: number
  vendor_id: number
  violation_type_id: number
  order_id: number | null
  quarter: number
  year: number
  description: string | null
  evidence_path: string | null
  // [POIN 6] Provenance bukti: MANUAL_UPLOAD | SYSTEM_GENERATED | LEGACY.
  // LEGACY = data lama (nullable kolom DB, default "LEGACY").
  evidence_provenance: string | null
  adjusted_point?: number | null
  is_active: boolean
  created_at: string
  vendor: {
    id: number
    company_name: string
    pic_name: string
  }
  violation_type: {
    id: number
    code: string
    category: string
    name: string
    point: number
  }
  orders?: {
    id: number
    project_number: string
  }
}

const CATEGORIES = [
  { value: 'KONFIRMASI_ORDER', label: 'Konfirmasi Order', color: 'blue' },
  { value: 'RESCHEDULE', label: 'Reschedule', color: 'orange' },
  { value: 'REFUND', label: 'Refund', color: 'red' },
  { value: 'LAINNYA', label: 'Lainnya', color: 'default' },
]

const ViewVendorViolationLog: React.FC = () => {
  const navigate = useNavigate()
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
  const isVendorRole = userRole === 'Admin Vendor' || userRole === 'Owner Vendor'
  const storedVendorId =
    typeof window !== 'undefined' && localStorage.getItem('vendor_id')
      ? Number(localStorage.getItem('vendor_id'))
      : undefined

  const [data, setData] = useState<ViolationLog[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [mySpStatus, setMySpStatus] = useState<any>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [detailModal, setDetailModal] = useState<ViolationLog | null>(null)
  const [selectedSpId, setSelectedSpId] = useState<number | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [vendors, setVendors] = useState<any[]>([])
  const [violationTypes, setViolationTypes] = useState<any[]>([])
  const [filtersInput, setFiltersInput] = useState({
    search: '',
    category: undefined as string | undefined,
    vendor_id: undefined as number | undefined,
    quarter: undefined as number | undefined,
  })
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    category: undefined as string | undefined,
    vendor_id: undefined as number | undefined,
    quarter: undefined as number | undefined,
  })
  const [loadingButton, setLoadingButton] = useState(false)

  const fetchMyVendorSpSummary = async () => {
    if (!isVendorRole) return
    try {
      const response = await vendorSpService.checkMyStatus()
      const payload = response.data?.data || response.data || null
      if (payload?.vendor_id && !localStorage.getItem('vendor_id')) {
        localStorage.setItem('vendor_id', String(payload.vendor_id))
      }
      setMySpStatus(payload)
    } catch (error) {
      // ignore if vendor status cannot be loaded
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const effectiveVendorId = isVendorRole
        ? mySpStatus?.vendor_id || storedVendorId
        : appliedFilters.vendor_id

      const params = new URLSearchParams({
        page: pagination.current.toString(),
        take: pagination.pageSize.toString(),
        ...(appliedFilters.search && { search: appliedFilters.search }),
        ...(appliedFilters.category && { category: appliedFilters.category }),
        ...(effectiveVendorId && { vendor_id: effectiveVendorId.toString() }),
        ...(appliedFilters.quarter && { quarter: appliedFilters.quarter.toString() }),
      })

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/vendor-violation/log?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const payload = response.data?.data && response.data?.meta
        ? response.data
        : response.data?.data || response.data
      const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
      const total = payload?.meta?.total ?? rows.length

      setData(rows)
      setPagination((prev) => ({
        ...prev,
        total,
      }))
    } catch (error) {
      message.error('Gagal mengambil data')
    } finally {
      setLoading(false)
      setLoadingButton(false)
    }
  }

  const fetchVendors = async () => {
    if (isVendorRole) return
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/vendor?vendor_with_max_order=0&take=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setVendors(response.data.data)
    } catch (error) {
      console.error('Failed to fetch vendors')
    }
  }

  const fetchViolationTypes = async () => {
    if (isVendorRole) return
    try {
      const response = await apiClient.get('/vendor-violation/type', {
        params: { take: 100, is_active: true },
      })
      const payload = response.data?.data && response.data?.meta
        ? response.data
        : response.data?.data || response.data
      const types = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : []
      setViolationTypes(types)
    } catch (error: any) {
      console.error(
        '[ViolationTypes] fetch failed:',
        error?.response?.status,
        error?.response?.data,
      )
    }
  }

  useEffect(() => {
    void fetchMyVendorSpSummary()
    fetchVendors()
    fetchViolationTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.current,
    pagination.pageSize,
    appliedFilters.search,
    appliedFilters.category,
    appliedFilters.vendor_id,
    appliedFilters.quarter,
    mySpStatus?.vendor_id,
  ])

  const handleSubmitFilter = () => {
    setLoadingButton(true)
    setAppliedFilters(filtersInput)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const hasActiveFilters =
    !!filtersInput.search ||
    !!filtersInput.category ||
    filtersInput.vendor_id !== undefined ||
    filtersInput.quarter !== undefined ||
    !!appliedFilters.search ||
    !!appliedFilters.category ||
    appliedFilters.vendor_id !== undefined ||
    appliedFilters.quarter !== undefined

  const handleClearFilters = () => {
    setFiltersInput({
      search: '',
      category: undefined,
      vendor_id: undefined,
      quarter: undefined,
    })
    setAppliedFilters({
      search: '',
      category: undefined,
      vendor_id: undefined,
      quarter: undefined,
    })
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleSubmitFilter()
    }
  }

  const handleAdd = async (values: any) => {
    try {
      const token = localStorage.getItem('accessToken')
      await axios.post(
        `${process.env.REACT_APP_API_URL}/vendor-violation/log`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      message.success('Pelanggaran berhasil dicatat')
      setAddModal(false)
      fetchData()
    } catch (error) {
      message.error('Gagal mencatat pelanggaran')
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await vendorViolationService.exportLogs({
        search: appliedFilters.search,
        category: appliedFilters.category,
        vendor_id: appliedFilters.vendor_id,
      })
      const blob = response.data as Blob
      const disposition = (response.headers as Record<string, string>)?.[
        'content-disposition'
      ]
      const filenameMatch = disposition?.match(/filename="?([^";]+)"?/i)
      const filename =
        filenameMatch?.[1] ?? `log-pelanggaran-${Date.now()}.xlsx`

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      message.success(`Berhasil mendownload ${filename}`)
    } catch (error) {
      const axiosErr = error as {
        response?: { data?: { message?: string }; status?: number }
      }
      if (axiosErr?.response?.status === 403) {
        message.error('Anda tidak punya akses untuk export data ini.')
      } else if (axiosErr?.response?.status === 400) {
        const detail = (axiosErr.response.data as { message?: string })?.message
        message.error(detail || 'Filter export tidak valid.')
      } else {
        message.error('Gagal mendownload Excel. Silakan coba lagi.')
      }
    } finally {
      setExporting(false)
    }
  }

  const canExport = userRole === 'Admin HO' || userRole === 'Super User'

  const getCategoryColor = (category: string) => {
    const found = CATEGORIES.find((c) => c.value === category)
    return found?.color || 'default'
  }

  const getCategoryLabel = (category: string) => {
    const found = CATEGORIES.find((c) => c.value === category)
    return found?.label || category || '-'
  }

  const getSpLevelColor = (level?: number | null) => {
    if (level === 1) return 'orange'
    if (level === 2) return 'red'
    if (level === 3) return 'dark'
    return 'success'
  }

  const now = new Date()
  const currentQuarter = mySpStatus?.quarter || Math.ceil((now.getMonth() + 1) / 3)
  const currentYear = mySpStatus?.year || now.getFullYear()
  const currentQuarterBounds = formatQuarterDateBounds(
    currentQuarter,
    currentYear,
    mySpStatus?.end_date,
    1,
  )

  const columns: ColumnsType<ViolationLog> = [
    {
      title: 'No',
      key: 'no',
      width: 65,
      align: 'center',
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Order ID',
      key: 'order_id',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <VendorSpOrderLink orderId={record.order_id ?? record.orders?.id} />
      ),
    },
    ...(!isVendorRole
      ? [
          {
            title: 'Vendor',
            key: 'vendor',
            render: (_: any, record: ViolationLog) => (
              <div>
                <div className='fw-bold text-gray-800'>{record.vendor?.company_name || '-'}</div>
                <div className='text-muted small'>{record.vendor?.pic_name || '-'}</div>
              </div>
            ),
          },
        ]
      : []),
    {
      title: 'Jenis Pelanggaran',
      key: 'violation',
      render: (_, record) => (
        <div>
          <VendorSpPill color={getCategoryColor(record.violation_type?.category)}>
            {record.violation_type?.code || '-'}
          </VendorSpPill>
          <div className='small mt-1'>{record.violation_type?.name || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Poin',
      key: 'point',
      width: 110,
      align: 'center',
      render: (_, record) => {
        const point = record.adjusted_point ?? record.violation_type?.point ?? 0
        return (
          <VendorSpPill color={point >= 2 ? 'red' : 'orange'}>
            {point} Poin
          </VendorSpPill>
        )
      },
    },
    {
      title: 'Periode',
      key: 'period',
      width: 190,
      align: 'center',
      render: (_, record) => {
        const bounds = formatQuarterDateBounds(record.quarter, record.year)
        return (
          <div className='small'>
            <div className='fw-semibold'>{bounds.quarterLabel}</div>
            <div className='text-muted'>{bounds.rangeFormatted}</div>
          </div>
        )
      },
    },
    {
      title: 'Tanggal Kejadian',
      key: 'incident_date',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <span className='fw-semibold text-gray-800' style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatViolationIncidentDate(record)}
        </span>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <VendorSpActionButton
          title='Detail Pelanggaran'
          tone='primary'
          icon={<EyeOutlined />}
          onClick={() => setDetailModal(record)}
        />
      ),
    },
  ]

  return (
    <div id='vendor-sp-violations'>
      <div className='card card-xxl-stretch mb-5 mb-xxl-8 vendor-sp-table'>
        <div className='card-header border-0 pt-5'>
          <div className='card-title d-flex justify-content-between align-items-center flex-wrap gap-3'>
            <div>
              <h3 className='card-label fw-bold fs-3 mb-1'>
                {isVendorRole ? 'Log SP & Pelanggaran Vendor' : 'Log Pelanggaran Vendor'}
              </h3>
              <span className='text-muted fs-7'>
                {isVendorRole
                  ? 'Pantau level Surat Peringatan aktif, akumulasi poin kuartal, dan riwayat log pelanggaran Anda.'
                  : 'Riwayat pelanggaran vendor, bukti pendukung, dan akumulasi poin per kuartal.'}
              </span>
            </div>
            {!isVendorRole && (
              <div className='d-flex gap-2 flex-wrap'>
                {canExport && (
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleExport}
                    loading={exporting}
                    className='vendor-sp-header-btn'
                  >
                    <span className='d-none d-md-inline'>Download Excel</span>
                    <span className='d-md-none'>Export</span>
                  </Button>
                )}
                <Button
                  type='primary'
                  icon={<PlusOutlined />}
                  onClick={() => setAddModal(true)}
                  className='vendor-sp-recap-button'
                >
                  <span className='d-none d-md-inline'>Catat Pelanggaran</span>
                  <span className='d-md-none'>Tambah</span>
                </Button>
              </div>
            )}
          </div>

          {isVendorRole && (
            <div className='vendor-sp-metric-grid mt-4 mb-1'>
              <div className='vendor-sp-metric-card'>
                <span className='vendor-sp-metric-label'>Level Surat Peringatan</span>
                <div className='vendor-sp-metric-value'>
                  <VendorSpPill color={getSpLevelColor(mySpStatus?.sp_level)}>
                    {mySpStatus?.sp_level
                      ? `SP${mySpStatus.sp_level}`
                      : 'Normal (Bebas SP)'}
                  </VendorSpPill>
                </div>
              </div>
              <div className='vendor-sp-metric-card'>
                <span className='vendor-sp-metric-label'>Total Poin Penalti Aktif</span>
                <div className='vendor-sp-metric-value'>
                  <VendorSpPill
                    color={(mySpStatus?.total_point ?? 0) >= 2 ? 'red' : 'orange'}
                  >
                    {mySpStatus?.total_point ?? 0} Poin
                  </VendorSpPill>
                </div>
              </div>
              <div className='vendor-sp-metric-card'>
                <span className='vendor-sp-metric-label'>Pengurangan Alokasi Order</span>
                <div className='vendor-sp-metric-value'>
                  {mySpStatus?.allocation_reduction ? (
                    <VendorSpPill color='red'>-{mySpStatus.allocation_reduction}%</VendorSpPill>
                  ) : (
                    <span className='text-muted fs-6 fw-semibold'>Tidak Ada (0%)</span>
                  )}
                </div>
              </div>
              <div className='vendor-sp-metric-card'>
                <span className='vendor-sp-metric-label'>Periode Kuartal</span>
                <div className='d-flex justify-content-between align-items-center flex-wrap gap-2'>
                  <div className='d-flex flex-column'>
                    <span className='fw-bold text-gray-800' style={{ fontSize: 14 }}>
                      {currentQuarterBounds.quarterLabel}
                    </span>
                    <span className='text-muted' style={{ fontSize: 12 }}>
                      {currentQuarterBounds.rangeFormatted}
                    </span>
                  </div>
                  {mySpStatus?.sp_id && (
                    <Button
                      size='small'
                      type='primary'
                      icon={<EyeOutlined />}
                      onClick={() => setSelectedSpId(mySpStatus.sp_id)}
                      className='vendor-sp-save-notes-btn'
                    >
                      Detail SP
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className='vendor-sp-table-head' onKeyDown={handleKeyPress}>
            <div className='row g-3 align-items-end'>
              <div className='col-12 col-md-4 col-lg-4'>
                <label className='form-label'>Pencarian</label>
                <div className='vendor-sp-search-wrapper'>
                  <SearchOutlined className='vendor-sp-search-icon' />
                  <Input
                    className='vendor-sp-search'
                    placeholder={
                      isVendorRole
                        ? 'Cari kode atau nama pelanggaran...'
                        : 'Cari nama vendor atau PIC...'
                    }
                    allowClear
                    value={filtersInput.search}
                    onChange={(e) =>
                      setFiltersInput((prev) => ({ ...prev, search: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className='col-6 col-md-2 col-lg-2'>
                <label className='form-label'>Kategori</label>
                <Select
                  className='vendor-sp-filter-select'
                  placeholder='Semua Kategori'
                  allowClear
                  value={filtersInput.category}
                  onChange={(value) =>
                    setFiltersInput((prev) => ({ ...prev, category: value }))
                  }
                >
                  {CATEGORIES.map((cat) => (
                    <Option key={cat.value} value={cat.value}>
                      {cat.label}
                    </Option>
                  ))}
                </Select>
              </div>
              {isVendorRole ? (
                <div className='col-6 col-md-2 col-lg-2'>
                  <label className='form-label'>Kuartal</label>
                  <Select
                    className='vendor-sp-filter-select'
                    placeholder='Semua Kuartal'
                    allowClear
                    value={filtersInput.quarter}
                    onChange={(value) =>
                      setFiltersInput((prev) => ({ ...prev, quarter: value }))
                    }
                  >
                    <Option value={1}>Q1 (1 Jan - 31 Mar)</Option>
                    <Option value={2}>Q2 (1 Apr - 30 Jun)</Option>
                    <Option value={3}>Q3 (1 Jul - 30 Sep)</Option>
                    <Option value={4}>Q4 (1 Okt - 31 Des)</Option>
                  </Select>
                </div>
              ) : (
                <div className='col-6 col-md-2 col-lg-2'>
                  <label className='form-label'>Vendor</label>
                  <Select
                    className='vendor-sp-filter-select'
                    placeholder='Semua Vendor'
                    allowClear
                    showSearch
                    value={filtersInput.vendor_id}
                    onChange={(value) =>
                      setFiltersInput((prev) => ({ ...prev, vendor_id: value }))
                    }
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={vendors.map((v) => ({
                      value: v.id,
                      label: v.company_name,
                    }))}
                  />
                </div>
              )}
              <div className='col-12 col-md-4 col-lg-4'>
                <div className='vendor-sp-filter-actions'>
                  <Button
                    className='btn-reset-filter'
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                    icon={<ClearOutlined />}
                  >
                    <span className='d-none d-sm-inline'>Reset Filter</span>
                    <span className='d-sm-none'>Reset</span>
                  </Button>
                  <Button
                    type='primary'
                    className='btn-dark-primary'
                    onClick={handleSubmitFilter}
                    loading={loadingButton}
                    icon={<SearchOutlined />}
                  >
                    {loadingButton ? 'Memfilter...' : 'Terapkan Filter'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='card-body py-3'>
          <Table
            className={vendorSpTableClassName}
            columns={columns}
            dataSource={data}
            rowKey='id'
            loading={loading}
            pagination={false}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: (
                <div className='vendor-sp-empty-state'>
                  <FileSearchOutlined className='vendor-sp-empty-icon' />
                  <div className='vendor-sp-empty-title'>
                    {hasActiveFilters ? 'Tidak Ada Data yang Cocok' : 'Belum Ada Data Pelanggaran'}
                  </div>
                  <div className='vendor-sp-empty-desc'>
                    {hasActiveFilters
                      ? 'Coba ubah atau reset filter untuk menampilkan data.'
                      : 'Belum ada log pelanggaran vendor yang tercatat.'}
                  </div>
                  {hasActiveFilters && (
                    <Button
                      type='link'
                      onClick={handleClearFilters}
                      className='vendor-sp-empty-action'
                    >
                      Reset Filter
                    </Button>
                  )}
                </div>
              ),
            }}
          />
          <div className='pagination-container'>
            <span className='pagination-total'>
              {pagination.total === 0
                ? 'Belum ada data Pelanggaran'
                : `Menampilkan ${(pagination.current - 1) * pagination.pageSize + 1} - ${Math.min(
                    pagination.current * pagination.pageSize,
                    pagination.total,
                  )} dari ${pagination.total} Pelanggaran`}
            </span>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger
              pageSizeOptions={[10, 20, 50, 100]}
              onChange={(page, size) =>
                setPagination((prev) => ({ ...prev, current: page, pageSize: size }))
              }
            />
          </div>
        </div>

        {/* Detail Modal */}
        <Modal
          title='Detail Pelanggaran Vendor'
          open={!!detailModal}
          onCancel={() => setDetailModal(null)}
          width={680}
          centered
          className='vendor-sp-popup-modal'
          footer={[
            <Button
              key='close'
              type='primary'
              className='vendor-sp-modal-close-btn'
              onClick={() => setDetailModal(null)}
            >
              Tutup
            </Button>,
          ]}
        >
          {detailModal && (
            <div className='vendor-sp-table'>
              <div className='vendor-sp-detail-banner'>
                <div>
                  <div className='eyebrow'>Vendor Terkait</div>
                  <div className='name'>
                    {detailModal.vendor?.company_name || '-'}
                  </div>
                  <div className='pic'>
                    PIC: {detailModal.vendor?.pic_name || '-'}
                  </div>
                </div>
                <div className='badges'>
                  <span className='vendor-sp-detail-badge'>
                    {getCategoryLabel(detailModal.violation_type?.category)}
                  </span>
                  <span className='vendor-sp-detail-badge warn'>
                    {detailModal.adjusted_point ?? detailModal.violation_type?.point ?? 0} Poin
                  </span>
                  <span
                    className={`vendor-sp-detail-badge ${
                      detailModal.is_active !== false ? 'ok' : ''
                    }`}
                  >
                    {detailModal.is_active !== false ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>

              <div className='vendor-sp-detail-grid'>
                <section className='vendor-sp-info-card'>
                  <div className='vendor-sp-info-card-title'>
                    <span>Informasi Pelanggaran</span>
                  </div>
                  <div className='vendor-sp-info-list'>
                    <div className='vendor-sp-info-row'>
                      <span className='vendor-sp-info-row-label'>Order ID</span>
                      <span className='vendor-sp-info-row-value'>
                        <VendorSpOrderLink
                          orderId={detailModal.order_id ?? detailModal.orders?.id}
                        />
                      </span>
                    </div>
                    <div className='vendor-sp-info-row'>
                      <span className='vendor-sp-info-row-label'>Kode Pelanggaran</span>
                      <span className='vendor-sp-info-row-value mono'>
                        {detailModal.violation_type?.code || '-'}
                      </span>
                    </div>
                    <div className='vendor-sp-info-row'>
                      <span className='vendor-sp-info-row-label'>Nama Pelanggaran</span>
                      <span className='vendor-sp-info-row-value'>
                        {detailModal.violation_type?.name || '-'}
                      </span>
                    </div>
                    <div className='vendor-sp-info-row'>
                      <span className='vendor-sp-info-row-label'>Periode Evaluasi</span>
                      <span className='vendor-sp-info-row-value'>
                        {
                          formatQuarterDateBounds(detailModal.quarter, detailModal.year)
                            .quarterLabel
                        }{' '}
                        (
                        {
                          formatQuarterDateBounds(detailModal.quarter, detailModal.year)
                            .rangeFormatted
                        }
                        )
                      </span>
                    </div>
                  </div>
                </section>

                <section className='vendor-sp-info-card'>
                  <div className='vendor-sp-info-card-title'>
                    <span>Bukti & Pencatatan</span>
                  </div>
                  <div className='vendor-sp-info-list'>
                    <div className='vendor-sp-info-row'>
                      <span className='vendor-sp-info-row-label'>Sumber Bukti</span>
                      <span className='vendor-sp-info-row-value'>
                        {!detailModal.evidence_path ? (
                          <span className='vendor-sp-detail-badge warn'>Tanpa Evidence</span>
                        ) : detailModal.evidence_provenance === 'SYSTEM_GENERATED' ? (
                          <span className='vendor-sp-detail-badge info'>Sistem</span>
                        ) : (
                          <span className='vendor-sp-detail-badge ok'>Upload Manual</span>
                        )}
                      </span>
                    </div>
                    <div className='vendor-sp-info-row'>
                      <span className='vendor-sp-info-row-label'>Tanggal Kejadian</span>
                      <span className='vendor-sp-info-row-value'>
                        {formatViolationIncidentDateTime(detailModal)}
                      </span>
                    </div>
                    <div className='vendor-sp-info-row'>
                      <span className='vendor-sp-info-row-label'>Poin Dasar</span>
                      <span className='vendor-sp-info-row-value'>
                        {detailModal.violation_type?.point ?? 0} Poin
                      </span>
                    </div>
                    <div className='vendor-sp-info-row'>
                      <span className='vendor-sp-info-row-label'>Tanggal Tercatat</span>
                      <span className='vendor-sp-info-row-value'>
                        {new Date(detailModal.created_at).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              <section className='vendor-sp-info-card full'>
                <div className='vendor-sp-info-card-title'>
                  <span>Deskripsi / Keterangan Tambahan</span>
                </div>
                <div className='vendor-sp-note-box'>
                  {detailModal.description || 'Tidak ada keterangan tambahan pada pelanggaran ini.'}
                </div>
              </section>
            </div>
          )}
        </Modal>

        <DetailVendorSpModal
          spId={selectedSpId}
          open={Boolean(selectedSpId)}
          onClose={() => setSelectedSpId(null)}
        />

        {/* Add Violation Modal */}
        {!isVendorRole && (
          <Modal
            title='Catat Pelanggaran Baru'
            open={addModal}
            onCancel={() => setAddModal(false)}
            footer={null}
          >
            <AddViolationForm
              vendors={vendors}
              violationTypes={violationTypes}
              onSubmit={handleAdd}
              onCancel={() => setAddModal(false)}
            />
          </Modal>
        )}
      </div>
    </div>
  )
}

// Add Violation Form Component
const AddViolationForm: React.FC<{
  vendors: any[]
  violationTypes: any[]
  onSubmit: (values: any) => void
  onCancel: () => void
}> = ({ vendors, violationTypes, onSubmit, onCancel }) => {
  const [form] = Form.useForm()

  const handleFinish = (values: any) => {
    const formattedIncidentDate = values.incident_date
      ? values.incident_date.format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD')

    onSubmit({
      vendor_id: values.vendor_id,
      violation_type_id: values.violation_type_id,
      ...(values.order_id ? { order_id: Number(values.order_id) } : {}),
      description: values.description,
      incident_date: formattedIncidentDate,
      evidence_path: formattedIncidentDate,
    })
  }

  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={handleFinish}
      initialValues={{ incident_date: dayjs() }}
    >
      <Form.Item
        name='vendor_id'
        label='Vendor'
        rules={[{ required: true, message: 'Pilih vendor' }]}
      >
        <Select
          showSearch
          placeholder='Pilih Vendor'
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={vendors.map((v) => ({
            value: v.id,
            label: v.company_name,
          }))}
        />
      </Form.Item>

      <Form.Item
        name='violation_type_id'
        label='Jenis Pelanggaran'
        rules={[{ required: true, message: 'Pilih jenis pelanggaran' }]}
      >
        <Select
          placeholder={
            violationTypes.length === 0
              ? 'Tidak ada jenis pelanggaran aktif'
              : 'Pilih Pelanggaran'
          }
          notFoundContent={
            violationTypes.length === 0
              ? 'Belum ada jenis pelanggaran. Tambahkan di menu Jenis Pelanggaran (Admin > Vendor SP > Jenis Pelanggaran).'
              : 'Tidak ada hasil'
          }
        >
          {violationTypes.map((vt) => (
            <Option key={vt.id} value={vt.id}>
              [{vt.code}] {vt.name} ({vt.point} poin)
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name='incident_date'
        label='Tanggal Kejadian'
        rules={[{ required: true, message: 'Pilih tanggal kejadian pelanggaran' }]}
      >
        <DatePicker
          className='w-100'
          format='DD-MM-YYYY'
          placeholder='Pilih Tanggal Kejadian'
        />
      </Form.Item>

      <Form.Item name='order_id' label='Order (opsional)'>
        <Input type='number' placeholder='ID Order' />
      </Form.Item>

      <Form.Item name='description' label='Deskripsi'>
        <Input.TextArea rows={3} placeholder='Keterangan tambahan' />
      </Form.Item>

      <Form.Item className='mb-0 text-end'>
        <Space>
          <Button onClick={onCancel}>Batal</Button>
          <Button type='primary' htmlType='submit'>
            Simpan
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export { ViewVendorViolationLog }
