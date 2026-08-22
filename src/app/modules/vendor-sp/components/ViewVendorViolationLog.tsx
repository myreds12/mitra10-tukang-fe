import React, { useState, useEffect } from 'react'
import axios from 'axios'
import apiClient from '../../../services/apiClient'
import {
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Badge,
  Descriptions,
  Upload,
  Pagination,
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  VendorSpActionButton,
  VendorSpPill,
  vendorSpTableClassName,
} from './VendorSpTable'
import { vendorViolationService } from '../../../services/vendorViolationService'
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
  const [data, setData] = useState<ViolationLog[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [detailModal, setDetailModal] = useState<ViolationLog | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [vendors, setVendors] = useState<any[]>([])
  const [violationTypes, setViolationTypes] = useState<any[]>([])
  const [filtersInput, setFiltersInput] = useState({
    search: '',
    category: undefined as string | undefined,
    vendor_id: undefined as number | undefined,
  })
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    category: undefined as string | undefined,
    vendor_id: undefined as number | undefined,
  })
  const [loadingButton, setLoadingButton] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        take: pagination.pageSize.toString(),
        ...(appliedFilters.search && { search: appliedFilters.search }),
        ...(appliedFilters.category && { category: appliedFilters.category }),
        ...(appliedFilters.vendor_id && { vendor_id: appliedFilters.vendor_id.toString() }),
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
    try {
      const response = await apiClient.get('/vendor-violation/type', {
        params: {take: 100, is_active: true},
      })
      // eslint-disable-next-line no-console
      console.log('[ViolationTypes] raw response:', response.data)
      const payload = response.data?.data && response.data?.meta
        ? response.data
        : response.data?.data || response.data
      const types = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : []
      // eslint-disable-next-line no-console
      console.log('[ViolationTypes] parsed types count:', types.length)
      setViolationTypes(types)
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(
        '[ViolationTypes] fetch failed:',
        error?.response?.status,
        error?.response?.data,
      )
      message.error(
        `Gagal mengambil jenis pelanggaran${
          error?.response?.status ? ` (HTTP ${error.response.status})` : ''
        }`,
      )
    }
  }

  useEffect(() => {
    fetchData()
    fetchVendors()
    fetchViolationTypes()
  }, [pagination.current, pagination.pageSize, appliedFilters.search, appliedFilters.category, appliedFilters.vendor_id])

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

  const handleTableChange = (newPagination: any) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || prev.pageSize,
    }))
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

  const canExport = (() => {
    const role =
      typeof window !== 'undefined'
        ? localStorage.getItem('userRole')
        : null
    return role === 'Admin HO' || role === 'Super User'
  })()

  const getCategoryColor = (category: string) => {
    const found = CATEGORIES.find((c) => c.value === category)
    return found?.color || 'default'
  }

  const columns: ColumnsType<ViolationLog> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Vendor',
      key: 'vendor',
      render: (_, record) => (
        <div>
          <div className='fw-bold'>{record.vendor?.company_name}</div>
          <div className='text-muted small'>{record.vendor?.pic_name}</div>
        </div>
      ),
    },
    {
      title: 'Jenis Pelanggaran',
      key: 'violation',
      render: (_, record) => (
        <div>
          <VendorSpPill color={getCategoryColor(record.violation_type?.category)}>
            {record.violation_type?.code}
          </VendorSpPill>
          <div className='small mt-1'>{record.violation_type?.name}</div>
        </div>
      ),
    },
    {
      title: 'Poin',
      key: 'point',
      width: 80,
      render: (_, record) => (
        <Badge count={record.adjusted_point ?? record.violation_type?.point ?? 0} showZero color='red' />
      ),
    },
    {
      title: 'Periode',
      key: 'period',
      width: 100,
      render: (_, record) => (
        <span>Q{record.quarter} {record.year}</span>
      ),
    },
    {
      title: 'Order',
      key: 'order',
      width: 120,
      render: (_, record) =>
        record.orders ? (
          <VendorSpPill>{record.orders.project_number}</VendorSpPill>
        ) : (
          <span className='text-muted'>-</span>
        ),
    },
    {
      // [POIN 6] Badge untuk legacy data yang evidence_path masih null
      // (data sebelum fix Poin 6). Data baru setelah fix tidak akan pernah null.
      title: 'Evidence',
      key: 'evidence',
      width: 130,
      render: (_, record) =>
        !record.evidence_path ? (
          <Tag color='warning'>
            ⚠ Tanpa Evidence
          </Tag>
        ) : record.evidence_provenance === 'SYSTEM_GENERATED' ? (
          <Tag color='blue' title='Snapshot kejadian sistem (JSON)'>Sistem</Tag>
        ) : (
          <Tag color='green' title={record.evidence_path}>Upload</Tag>
        ),
    },
    {
      title: 'Tanggal',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('id-ID'),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <VendorSpActionButton
          title='Detail'
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
        <div className='card-title d-flex flex-column'>
          <div className='vendor-sp-table-head' onKeyDown={handleKeyPress}>
            <div className='row g-2 mb-3'>
              <div className='col-md-3'>
                <div className='vendor-sp-search-wrapper'>
                  <SearchOutlined className='vendor-sp-search-icon' />
                  <Input
                    className='vendor-sp-search'
                    placeholder='Cari vendor...'
                    allowClear
                    value={filtersInput.search}
                    onChange={(e) =>
                      setFiltersInput((prev) => ({ ...prev, search: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className='col-md-2'>
                <Select
                  className='vendor-sp-filter-select'
                  placeholder='Kategori'
                  allowClear
                  value={filtersInput.category}
                  onChange={(value) =>
                    setFiltersInput((prev) => ({ ...prev, category: value }))
                  }
                  style={{ width: '100%' }}
                >
                  {CATEGORIES.map((cat) => (
                    <Option key={cat.value} value={cat.value}>
                      {cat.label}
                    </Option>
                  ))}
                </Select>
              </div>
              <div className='col-md-2'>
                <Select
                  className='vendor-sp-filter-select'
                  placeholder='Pilih Vendor'
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
                  style={{ width: '100%' }}
                />
              </div>
              <div className='col-md-2'>
                <Button
                  className='btn-dark-primary'
                  onClick={handleSubmitFilter}
                  loading={loadingButton}
                >
                  {loadingButton ? 'Filtering..' : 'Submit'}
                </Button>
              </div>
              <div className='col-md-3 d-flex flex-column align-items-stretch align-items-md-end gap-2'>
                {canExport && (
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleExport}
                    loading={exporting}
                  >
                    Download Excel
                  </Button>
                )}
                <Button
                  type='primary'
                  icon={<PlusOutlined />}
                  onClick={() => setAddModal(true)}
                >
                  <span className='d-none d-md-inline'>Catat Pelanggaran</span>
                  <span className='d-md-none'>Tambah</span>
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
        />
        <div className='pagination-container'>
          <span className='pagination-total'>
            {pagination.total === 0
              ? 'Showing 0 of 0 Pelanggaran'
              : `Showing ${(pagination.current - 1) * pagination.pageSize + 1} - ${Math.min(
                  pagination.current * pagination.pageSize,
                  pagination.total,
                )} of ${pagination.total} Pelanggaran`}
          </span>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger
            pageSizeOptions={[5, 10, 20, 50, 100, 250, 500]}
            onChange={(page, size) =>
              setPagination((prev) => ({ ...prev, current: page, pageSize: size }))
            }
          />
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        title='Detail Pelanggaran'
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={[
          <Button key='close' onClick={() => setDetailModal(null)}>
            Tutup
          </Button>,
        ]}
      >
        {detailModal && (
          <Descriptions column={1} bordered size='small'>
            <Descriptions.Item label='ID'>{detailModal.id}</Descriptions.Item>
            <Descriptions.Item label='Vendor'>
              {detailModal.vendor?.company_name}
            </Descriptions.Item>
            <Descriptions.Item label='Kategori'>
              <Tag color={getCategoryColor(detailModal.violation_type?.category)}>
                {detailModal.violation_type?.category}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label='Kode'>
              {detailModal.violation_type?.code}
            </Descriptions.Item>
            <Descriptions.Item label='Nama Pelanggaran'>
              {detailModal.violation_type?.name}
            </Descriptions.Item>
            <Descriptions.Item label='Poin'>
              {detailModal.violation_type?.point}
            </Descriptions.Item>
            <Descriptions.Item label='Periode'>
              Q{detailModal.quarter} {detailModal.year}
            </Descriptions.Item>
            <Descriptions.Item label='Order'>
              {detailModal.orders?.project_number || '-'}
            </Descriptions.Item>
            <Descriptions.Item label='Deskripsi'>
              {detailModal.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label='Tanggal'>
              {new Date(detailModal.created_at).toLocaleString('id-ID')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Add Violation Modal */}
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
  const [uploading, setUploading] = useState(false)
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [evidencePath, setEvidencePath] = useState<string | null>(null)

  const handleEvidenceUpload = async (file: any): Promise<boolean> => {
    const actualFile: File = file.originFileObj || file
    const allowedPrefixes = ['image/', 'application/pdf']
    if (!allowedPrefixes.some((p) => actualFile.type.startsWith(p))) {
      message.error('Tipe file tidak didukung. Hanya gambar atau PDF.')
      return false
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', actualFile)
      const token = localStorage.getItem('accessToken')
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/vendor-violation/log/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      setEvidencePath(res.data.data.path)
      setEvidenceFile(actualFile)
      message.success('File berhasil diupload')
      return false
    } catch (err) {
      message.error('Gagal upload file')
      return false
    } finally {
      setUploading(false)
    }
  }

  const handleFinish = (values: any) => {
    if (!evidencePath) {
      message.error('Upload bukti pelanggaran terlebih dahulu')
      return
    }
    onSubmit({ ...values, evidence_path: evidencePath })
  }

  const handleEvidenceRemove = () => {
    setEvidenceFile(null)
    setEvidencePath(null)
  }

  return (
    <Form form={form} layout='vertical' onFinish={handleFinish}>
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
              ? 'Belum ada jenis pelanggaran. Tambahkan di menu Jenis Pelanggaran (Admin → Vendor SP → Jenis Pelanggaran).'
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

      <Form.Item name='order_id' label='Order (opsional)'>
        <Input type='number' placeholder='ID Order' />
      </Form.Item>

      <Form.Item name='description' label='Deskripsi'>
        <Input.TextArea rows={3} placeholder='Keterangan tambahan' />
      </Form.Item>

      <Form.Item label='Bukti Pelanggaran (wajib)' required>
        <Upload
          maxCount={1}
          accept='image/*,application/pdf'
          beforeUpload={handleEvidenceUpload}
          onRemove={handleEvidenceRemove}
          fileList={
            evidenceFile
              ? [
                  {
                    uid: '-1',
                    name: evidenceFile.name,
                    status: 'done',
                  },
                ]
              : []
          }
        >
          <Button icon={<UploadOutlined />} loading={uploading}>
            {evidencePath ? 'Ganti File' : 'Pilih File'}
          </Button>
        </Upload>
        {evidencePath && (
          <div className='small text-muted mt-1'>
            Path: {evidencePath}
          </div>
        )}
      </Form.Item>

      <Form.Item className='mb-0 text-end'>
        <Space>
          <Button onClick={onCancel}>Batal</Button>
          <Button type='primary' htmlType='submit' disabled={!evidencePath}>
            Simpan
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export { ViewVendorViolationLog }
