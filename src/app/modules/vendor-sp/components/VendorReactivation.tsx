import React, { useState, useEffect } from 'react'
import { vendorSpService } from '../../../services/vendorSpService'
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Alert,
  Select,
  DatePicker,
  Pagination,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CheckCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  ClearOutlined,
  SearchOutlined,
  FileSearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import Swal from 'sweetalert2'
import { Dayjs } from 'dayjs'
import {
  VendorSpActionButton,
  VendorSpPill,
  vendorSpTableClassName,
} from './VendorSpTable'
import './VendorSpFilter.css'

interface ReactivationLog {
  id: number
  vendor_id: number
  previous_sp_id: number | null
  reason: string
  approved_by: number
  status: number
  notes: string | null
  created_at: string
  vendor: {
    id: number
    company_name: string
    pic_name: string
    is_active: boolean
  }
}

interface InactiveVendor {
  id: number
  company_name: string
  pic_name: string
  email_address: string
  phone_number: string
  is_active: boolean
  previous_sp_id?: number | null
  sp_level?: number | null
  total_point?: number | null
  quarter?: number | null
  year?: number | null
  sp_status?: number | null
}

interface ReactivationFilter {
  search: string
  status: 1 | 2 | 3 | undefined
  dateRange: [Dayjs | null, Dayjs | null] | null
}

const emptyFilter: ReactivationFilter = {
  search: '',
  status: undefined,
  dateRange: null,
}

const VendorReactivation: React.FC = () => {
  const [data, setData] = useState<ReactivationLog[]>([])
  const [inactiveVendors, setInactiveVendors] = useState<InactiveVendor[]>([])
  const [loading, setLoading] = useState(false)
  const [reactivateModal, setReactivateModal] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<InactiveVendor | null>(null)
  const [detailLog, setDetailLog] = useState<ReactivationLog | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const [loadingButton, setLoadingButton] = useState(false)

  const [filtersInput, setFiltersInput] = useState<ReactivationFilter>(emptyFilter)
  const [appliedFilters, setAppliedFilters] = useState<ReactivationFilter>(emptyFilter)

  const [inactiveSearch, setInactiveSearch] = useState<string>('')

  useEffect(() => {
    fetchInactiveVendors()
  }, [])

  useEffect(() => {
    fetchReactivationLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, appliedFilters])

  const fetchReactivationLogs = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: pagination.current,
        take: pagination.pageSize,
      }
      if (appliedFilters.search.trim()) params.search = appliedFilters.search.trim()
      if (appliedFilters.status) params.status = appliedFilters.status
      if (appliedFilters.dateRange?.[0]) params.date_from = appliedFilters.dateRange[0].format('YYYY-MM-DD')
      if (appliedFilters.dateRange?.[1]) params.date_to = appliedFilters.dateRange[1].format('YYYY-MM-DD')

      const response = await vendorSpService.getReactivationLogs(params)
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
      Swal.fire('Error', 'Gagal mengambil data log reaktivasi', 'error')
    } finally {
      setLoading(false)
      setLoadingButton(false)
    }
  }

  const fetchInactiveVendors = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const [candidatesRes, sp3Res, inactiveRes] = await Promise.allSettled([
        vendorSpService.getReactivationCandidates(),
        vendorSpService.getAll({ sp_level: 3, page: 1, take: 100 }),
        axios.get(
          `${process.env.REACT_APP_API_URL}/vendor?page=1&take=100&is_active=0`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ])

      const mergedByVendorId = new Map<number, InactiveVendor>()

      if (candidatesRes.status === 'fulfilled') {
        const rawCandidates = candidatesRes.value?.data?.data ?? candidatesRes.value?.data ?? []
        const candidateRows = Array.isArray(rawCandidates) ? rawCandidates : []
        for (const item of candidateRows) {
          const vendorId = Number(item?.id)
          if (!vendorId) continue
          mergedByVendorId.set(vendorId, {
            id: vendorId,
            company_name: item.company_name || '-',
            pic_name: item.pic_name || '-',
            email_address: item.email_address || '-',
            phone_number: item.phone_number || '-',
            is_active: false,
            previous_sp_id: item.previous_sp_id ?? null,
            sp_level: item.sp_level ?? 3,
            total_point: item.total_point ?? null,
            quarter: item.quarter ?? null,
            year: item.year ?? null,
            sp_status: item.sp_status ?? null,
          })
        }
      }

      if (sp3Res.status === 'fulfilled') {
        const payload = sp3Res.value?.data?.data ?? sp3Res.value?.data ?? []
        const spRows = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : []

        for (const sp of spRows) {
          const vendor = sp?.vendor
          const vendorId = Number(vendor?.id ?? sp?.vendor_id)
          if (!vendorId) continue

          const isActiveSp3 =
            Number(sp?.sp_level) === 3 &&
            (Number(sp?.status) === 1 || Number(sp?.status) === 3)
          const isVendorInactive =
            vendor?.is_active === false || Number(vendor?.is_active) === 0

          if (!isActiveSp3 && !isVendorInactive) continue

          if (!mergedByVendorId.has(vendorId)) {
            mergedByVendorId.set(vendorId, {
              id: vendorId,
              company_name: vendor?.company_name || '-',
              pic_name: vendor?.pic_name || '-',
              email_address: vendor?.email_address || '-',
              phone_number: vendor?.phone_number || '-',
              is_active: false,
              previous_sp_id: sp?.id ?? null,
              sp_level: sp?.sp_level ?? 3,
              total_point: sp?.total_point ?? null,
              quarter: sp?.quarter ?? null,
              year: sp?.year ?? null,
              sp_status: sp?.status ?? null,
            })
          }
        }
      }

      if (inactiveRes.status === 'fulfilled') {
        const rawVendors = inactiveRes.value?.data?.data ?? inactiveRes.value?.data ?? []
        const vendorRows: any[] = Array.isArray(rawVendors?.data)
          ? rawVendors.data
          : Array.isArray(rawVendors)
            ? rawVendors
            : []

        for (const vendor of vendorRows) {
          const isVendorInactive =
            vendor?.is_active === false || Number(vendor?.is_active) === 0
          const vendorId = Number(vendor?.id)
          if (!vendorId || !isVendorInactive) continue

          if (!mergedByVendorId.has(vendorId)) {
            mergedByVendorId.set(vendorId, {
              id: vendorId,
              company_name: vendor.company_name || '-',
              pic_name: vendor.pic_name || '-',
              email_address: vendor.email_address || '-',
              phone_number: vendor.phone_number || '-',
              is_active: false,
              previous_sp_id: null,
              sp_level: 3,
              total_point: null,
              quarter: null,
              year: null,
              sp_status: null,
            })
          }
        }
      }

      setInactiveVendors(Array.from(mergedByVendorId.values()))
    } catch (error) {
      console.error('Failed to fetch SP3 reactivation candidates')
    }
  }

  const handleReactivate = async (values: any) => {
    if (!selectedVendor) return
    try {
      await vendorSpService.reactivate({
        vendor_id: selectedVendor.id,
        previous_sp_id: selectedVendor.previous_sp_id ?? undefined,
        reason: values.reason,
      })

      if (
        selectedVendor.previous_sp_id &&
        (selectedVendor.sp_status === 1 || selectedVendor.sp_status === 3)
      ) {
        await vendorSpService.complete(selectedVendor.previous_sp_id).catch(() => null)
      }

      Swal.fire('Berhasil', 'Vendor berhasil diaktifkan kembali', 'success')
      setReactivateModal(false)
      setSelectedVendor(null)
      fetchReactivationLogs()
      fetchInactiveVendors()
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Gagal mengaktifkan vendor'
      Swal.fire('Error', Array.isArray(message) ? message.join(', ') : message, 'error')
    }
  }

  const handleSubmitFilter = () => {
    setLoadingButton(true)
    setAppliedFilters(filtersInput)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleSubmitFilter()
    }
  }

  const openReactivateModal = (vendor: InactiveVendor) => {
    setSelectedVendor(vendor)
    setReactivateModal(true)
  }

  const hasActiveFilters =
    !!filtersInput.search.trim() ||
    filtersInput.status !== undefined ||
    Boolean(filtersInput.dateRange?.[0] || filtersInput.dateRange?.[1]) ||
    !!appliedFilters.search.trim() ||
    appliedFilters.status !== undefined ||
    Boolean(appliedFilters.dateRange?.[0] || appliedFilters.dateRange?.[1])

  const resetFilter = () => {
    setFiltersInput(emptyFilter)
    setAppliedFilters(emptyFilter)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const renderStatusPill = (status: number) => {
    switch (status) {
      case 1:
        return <VendorSpPill color='processing'>Pending</VendorSpPill>
      case 2:
        return <VendorSpPill color='success'>Disetujui</VendorSpPill>
      case 3:
        return <VendorSpPill color='error'>Ditolak</VendorSpPill>
      default:
        return <VendorSpPill>Unknown</VendorSpPill>
    }
  }

  const filteredInactiveVendors = inactiveVendors.filter((v) => {
    if (!inactiveSearch.trim()) return true
    const q = inactiveSearch.toLowerCase()
    return (
      v.company_name?.toLowerCase().includes(q) ||
      v.pic_name?.toLowerCase().includes(q)
    )
  })

  const columns: ColumnsType<ReactivationLog> = [
    {
      title: 'No',
      key: 'no',
      width: 65,
      align: 'center',
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Vendor',
      key: 'vendor',
      render: (_, record) => (
        <div>
          <div className='fw-bold text-gray-800'>{record.vendor?.company_name || '-'}</div>
          <div className='text-muted small'>{record.vendor?.pic_name || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 130,
      align: 'center',
      render: (_, record) => renderStatusPill(record.status),
    },
    {
      title: 'Alasan Reaktivasi',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason: string) => reason || <span className='text-muted'>-</span>,
    },
    {
      title: 'Tanggal',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      align: 'center',
      render: (date: string) => new Date(date).toLocaleString('id-ID'),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <VendorSpActionButton
          title='Detail Reaktivasi'
          tone='primary'
          icon={<EyeOutlined />}
          onClick={() => setDetailLog(record)}
        />
      ),
    },
  ]

  return (
    <div id='vendor-sp-reactivation'>
      <div className='card mb-5 vendor-sp-table'>
        <div className='card-header border-0 pt-5'>
          <div className='card-title d-flex justify-content-between align-items-center flex-wrap gap-3'>
            <div>
              <h3 className='card-label fw-bold fs-3 mb-1'>Vendor Nonaktif (SP3)</h3>
              <span className='text-muted fs-7'>
                Vendor yang dinonaktifkan akibat SP3 dapat diaktifkan kembali melalui daftar di bawah ini.
              </span>
            </div>
            <VendorSpPill color={inactiveVendors.length > 0 ? 'warning' : 'success'}>
              {inactiveVendors.length} Vendor Nonaktif
            </VendorSpPill>
          </div>
        </div>

        <div className='card-body py-3'>
          <Alert
            message='Informasi Reaktivasi Vendor'
            description='Vendor berikut dinonaktifkan akibat akumulasi poin SP3. Klik tombol "Aktifkan" pada kartu vendor untuk memulihkan status operasional vendor.'
            type='warning'
            showIcon
            icon={<StopOutlined />}
            className='mb-4'
          />

          <div className='mb-4' style={{ maxWidth: 420 }}>
            <div className='vendor-sp-search-wrapper'>
              <SearchOutlined className='vendor-sp-search-icon' />
              <Input
                className='vendor-sp-search'
                placeholder='Cari nama vendor nonaktif atau PIC...'
                allowClear
                value={inactiveSearch}
                onChange={(e) => setInactiveSearch(e.target.value)}
              />
            </div>
          </div>

          <div className='row g-3 mb-2'>
            {filteredInactiveVendors.map((vendor) => (
              <div key={vendor.id} className='col-12 col-md-6 col-xl-4'>
                <div className='vendor-sp-info-card'>
                  <div className='vendor-sp-info-card-title'>
                    <div className='d-flex align-items-center gap-2 overflow-hidden'>
                      <span className='text-truncate'>{vendor.company_name}</span>
                      <VendorSpPill color='error'>
                        SP{vendor.sp_level ?? 3}
                      </VendorSpPill>
                    </div>
                    <Button
                      type='primary'
                      size='small'
                      className='vendor-sp-recap-button'
                      style={{ height: 32, padding: '0 12px', fontSize: 12 }}
                      icon={<CheckCircleOutlined />}
                      onClick={() => openReactivateModal(vendor)}
                    >
                      Aktifkan
                    </Button>
                  </div>
                  <div className='vendor-sp-info-list'>
                    <div className='vendor-sp-info-row'>
                      <span className='vendor-sp-info-row-label'>PIC</span>
                      <span className='vendor-sp-info-row-value'>{vendor.pic_name || '-'}</span>
                    </div>
                    <div className='vendor-sp-info-row'>
                      <span className='vendor-sp-info-row-label'>Email</span>
                      <span className='vendor-sp-info-row-value'>{vendor.email_address || '-'}</span>
                    </div>
                    <div className='vendor-sp-info-row'>
                      <span className='vendor-sp-info-row-label'>Telepon</span>
                      <span className='vendor-sp-info-row-value'>{vendor.phone_number || '-'}</span>
                    </div>
                    {(vendor.total_point != null || (vendor.quarter && vendor.year)) && (
                      <div className='vendor-sp-info-row'>
                        <span className='vendor-sp-info-row-label'>Status SP</span>
                        <span className='vendor-sp-info-row-value'>
                          {vendor.quarter && vendor.year ? `Q${vendor.quarter} ${vendor.year}` : 'SP3'}
                          {vendor.total_point != null ? ` • ${vendor.total_point} Poin` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredInactiveVendors.length === 0 && (
              <div className='col-12'>
                <div className='vendor-sp-empty-state py-4'>
                  <FileSearchOutlined className='vendor-sp-empty-icon' />
                  <div className='vendor-sp-empty-title'>
                    {inactiveSearch.trim()
                      ? 'Vendor Nonaktif Tidak Ditemukan'
                      : 'Tidak Ada Vendor Nonaktif'}
                  </div>
                  <div className='vendor-sp-empty-desc'>
                    {inactiveSearch.trim()
                      ? `Tidak ada vendor nonaktif yang cocok dengan pencarian "${inactiveSearch}".`
                      : 'Seluruh vendor saat ini berstatus aktif.'}
                  </div>
                  {inactiveSearch.trim() && (
                    <Button
                      type='link'
                      onClick={() => setInactiveSearch('')}
                      className='vendor-sp-empty-action'
                    >
                      Reset Pencarian
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='card card-xxl-stretch mb-5 mb-xxl-8 vendor-sp-table'>
        <div className='card-header border-0 pt-5'>
          <div className='card-title d-flex justify-content-between align-items-center flex-wrap gap-3'>
            <div>
              <h3 className='card-label fw-bold fs-3 mb-1'>Log Reaktivasi Vendor</h3>
              <span className='text-muted fs-7'>
                Riwayat pengajuan dan persetujuan reaktivasi vendor pasca-SP3.
              </span>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchReactivationLogs()
                fetchInactiveVendors()
              }}
              className='vendor-sp-header-btn'
            >
              <span className='d-none d-md-inline'>Refresh</span>
            </Button>
          </div>

          <div className='vendor-sp-table-head' onKeyDown={handleKeyPress}>
            <div className='row g-3 align-items-end'>
              <div className='col-12 col-md-3 col-lg-3'>
                <label className='form-label'>Pencarian</label>
                <div className='vendor-sp-search-wrapper'>
                  <SearchOutlined className='vendor-sp-search-icon' />
                  <Input
                    className='vendor-sp-search'
                    placeholder='Cari nama vendor atau PIC...'
                    allowClear
                    value={filtersInput.search}
                    onChange={(e) =>
                      setFiltersInput((prev) => ({ ...prev, search: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className='col-6 col-md-2 col-lg-2'>
                <label className='form-label'>Status</label>
                <Select
                  className='vendor-sp-filter-select'
                  placeholder='Semua Status'
                  allowClear
                  value={filtersInput.status}
                  onChange={(val) =>
                    setFiltersInput((prev) => ({ ...prev, status: val }))
                  }
                  options={[
                    { value: 1, label: 'Pending' },
                    { value: 2, label: 'Disetujui' },
                    { value: 3, label: 'Ditolak' },
                  ]}
                />
              </div>
              <div className='col-6 col-md-3 col-lg-3'>
                <label className='form-label'>Periode Tanggal</label>
                <DatePicker.RangePicker
                  className='vendor-sp-range-picker'
                  value={filtersInput.dateRange}
                  onChange={(val) =>
                    setFiltersInput((prev) => ({ ...prev, dateRange: val }))
                  }
                  format='YYYY-MM-DD'
                  placeholder={['Dari tanggal', 'Sampai tanggal']}
                />
              </div>
              <div className='col-12 col-md-4 col-lg-4'>
                <div className='vendor-sp-filter-actions'>
                  <Button
                    className='btn-reset-filter'
                    onClick={resetFilter}
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
                    {hasActiveFilters
                      ? 'Tidak Ada Log Reaktivasi yang Cocok'
                      : 'Belum Ada Data Log Reaktivasi'}
                  </div>
                  <div className='vendor-sp-empty-desc'>
                    {hasActiveFilters
                      ? 'Coba ubah atau reset filter untuk menampilkan data.'
                      : 'Belum ada riwayat reaktivasi vendor yang tercatat.'}
                  </div>
                  {hasActiveFilters && (
                    <Button
                      type='link'
                      onClick={resetFilter}
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
                ? 'Belum ada data Log Reaktivasi'
                : `Menampilkan ${(pagination.current - 1) * pagination.pageSize + 1} - ${Math.min(
                    pagination.current * pagination.pageSize,
                    pagination.total,
                  )} dari ${pagination.total} Log Reaktivasi`}
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

        <Modal
          title='Detail Log Reaktivasi Vendor'
          open={Boolean(detailLog)}
          onCancel={() => setDetailLog(null)}
          width={680}
          centered
          className='vendor-sp-popup-modal'
          footer={[
            <Button
              key='close'
              type='primary'
              className='vendor-sp-modal-close-btn'
              onClick={() => setDetailLog(null)}
            >
              Tutup
            </Button>,
          ]}
        >
          {detailLog && (
            <div className='vendor-sp-table'>
              <div className='vendor-sp-detail-banner d-flex justify-content-between align-items-start flex-wrap gap-3'>
                <div>
                  <div className='text-muted small fw-semibold mb-1'>Vendor</div>
                  <div className='fw-bold fs-4 text-gray-800'>
                    {detailLog.vendor?.company_name || '-'}
                  </div>
                  <div className='text-muted small'>
                    PIC: {detailLog.vendor?.pic_name || '-'}
                  </div>
                </div>
                <div className='d-flex align-items-center gap-2 flex-wrap'>
                  {renderStatusPill(detailLog.status)}
                  <VendorSpPill color={detailLog.vendor?.is_active ? 'success' : 'error'}>
                    {detailLog.vendor?.is_active ? 'Vendor Aktif' : 'Vendor Nonaktif'}
                  </VendorSpPill>
                </div>
              </div>

              <div className='vendor-sp-info-card mb-3'>
                <div className='vendor-sp-info-card-title'>
                  <span>Informasi Reaktivasi</span>
                </div>
                <div className='vendor-sp-info-list'>
                  <div className='vendor-sp-info-row'>
                    <span className='vendor-sp-info-row-label'>Status Reaktivasi</span>
                    <span className='vendor-sp-info-row-value'>
                      {renderStatusPill(detailLog.status)}
                    </span>
                  </div>
                  <div className='vendor-sp-info-row'>
                    <span className='vendor-sp-info-row-label'>Tanggal Reaktivasi</span>
                    <span className='vendor-sp-info-row-value'>
                      {new Date(detailLog.created_at).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <div className='vendor-sp-info-card mb-3'>
                <div className='vendor-sp-info-card-title'>
                  <span>Alasan Reaktivasi</span>
                </div>
                <div className='vendor-sp-note-box'>
                  {detailLog.reason || 'Tidak ada alasan yang dicantumkan.'}
                </div>
              </div>

              {detailLog.notes && (
                <div className='vendor-sp-info-card'>
                  <div className='vendor-sp-info-card-title'>
                    <span>Catatan Tambahan</span>
                  </div>
                  <div className='vendor-sp-note-box'>{detailLog.notes}</div>
                </div>
              )}
            </div>
          )}
        </Modal>

        <Modal
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: '#faad14' }} />
              Konfirmasi Reaktivasi Vendor
            </Space>
          }
          open={reactivateModal}
          width={600}
          onCancel={() => {
            setReactivateModal(false)
            setSelectedVendor(null)
          }}
          footer={null}
        >
          {selectedVendor && (
            <Form layout='vertical' onFinish={handleReactivate} className='vendor-sp-table'>
              <Alert
                message={`Aktifkan Vendor: ${selectedVendor.company_name}`}
                description='Vendor ini sebelumnya dinonaktifkan akibat SP3. Dengan mengaktifkan kembali, vendor akan dapat menerima order seperti biasa.'
                type='info'
                showIcon
                className='mb-3'
              />

              <div className='vendor-sp-info-card mb-3'>
                <div className='vendor-sp-info-card-title'>
                  <span>Identitas Vendor</span>
                </div>
                <div className='vendor-sp-info-list'>
                  <div className='vendor-sp-info-row'>
                    <span className='vendor-sp-info-row-label'>Perusahaan</span>
                    <span className='vendor-sp-info-row-value'>{selectedVendor.company_name}</span>
                  </div>
                  <div className='vendor-sp-info-row'>
                    <span className='vendor-sp-info-row-label'>Nama PIC</span>
                    <span className='vendor-sp-info-row-value'>{selectedVendor.pic_name || '-'}</span>
                  </div>
                  <div className='vendor-sp-info-row'>
                    <span className='vendor-sp-info-row-label'>Email</span>
                    <span className='vendor-sp-info-row-value'>{selectedVendor.email_address || '-'}</span>
                  </div>
                  <div className='vendor-sp-info-row'>
                    <span className='vendor-sp-info-row-label'>Telepon</span>
                    <span className='vendor-sp-info-row-value'>{selectedVendor.phone_number || '-'}</span>
                  </div>
                </div>
              </div>

              <Form.Item
                name='reason'
                label='Alasan Reaktivasi'
                rules={[{ required: true, message: 'Alasan reaktivasi wajib diisi' }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder='Jelaskan alasan mengaktifkan kembali vendor ini...'
                />
              </Form.Item>

              <Form.Item className='mb-0 text-end'>
                <Space>
                  <Button
                    onClick={() => {
                      setReactivateModal(false)
                      setSelectedVendor(null)
                    }}
                  >
                    Batal
                  </Button>
                  <Button type='primary' htmlType='submit' className='btn-dark-primary'>
                    Aktifkan Vendor
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Modal>
      </div>
    </div>
  )
}

export { VendorReactivation }
