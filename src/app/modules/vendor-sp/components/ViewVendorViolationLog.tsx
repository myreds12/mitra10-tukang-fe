import React, { useState, useEffect } from 'react'
import axios from 'axios'
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
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  VendorSpActionButton,
  VendorSpPill,
  vendorSpPagination,
  vendorSpTableClassName,
} from './VendorSpTable'
import { vendorViolationService } from '../../../services/vendorViolationService'

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
  const [filters, setFilters] = useState({
    search: '',
    category: undefined as string | undefined,
    vendor_id: undefined as number | undefined,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        take: pagination.pageSize.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.vendor_id && { vendor_id: filters.vendor_id.toString() }),
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
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/vendor-violation/type?take=100&is_active=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setViolationTypes(response.data.data)
    } catch (error) {
      console.error('Failed to fetch violation types')
    }
  }

  useEffect(() => {
    fetchData()
    fetchVendors()
    fetchViolationTypes()
  }, [pagination.current, pagination.pageSize, filters])

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
        search: filters.search,
        category: filters.category,
        vendor_id: filters.vendor_id,
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
    <div className='card card-xxl-stretch mb-5 mb-xxl-8 vendor-sp-table'>
      <div className='card-header border-0 pt-5'>
        <div className='card-title d-flex flex-column'>
          <div className='vendor-sp-toolbar'>
            <div className='vendor-sp-filter-group'>
              <Input.Search
                className='vendor-sp-filter-control'
                placeholder='Cari vendor...'
                onSearch={(value) =>
                  setFilters((prev) => ({ ...prev, search: value }))
                }
                style={{ width: 200 }}
              />
              <Select
                className='vendor-sp-filter-control'
                placeholder='Kategori'
                allowClear
                style={{ width: 150 }}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, category: value }))
                }
              >
                {CATEGORIES.map((cat) => (
                  <Option key={cat.value} value={cat.value}>
                    {cat.label}
                  </Option>
                ))}
              </Select>
              <Select
                className='vendor-sp-filter-control'
                placeholder='Pilih Vendor'
                allowClear
                showSearch
                style={{ width: 200 }}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, vendor_id: value }))
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
            <Space className='vendor-sp-action-group'>
              <Button icon={<ReloadOutlined />} onClick={fetchData}>
                Refresh
              </Button>
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
                Catat Pelanggaran
              </Button>
            </Space>
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
          pagination={vendorSpPagination(pagination)}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
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

  return (
    <Form form={form} layout='vertical' onFinish={onSubmit}>
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
        <Select placeholder='Pilih Pelanggaran'>
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

      {/* [POIN 6] Lapis 3 UI guard — evidence_path WAJIB diisi. */}
      <Form.Item
        name='evidence_path'
        label='Path Evidence (wajib)'
        rules={[{ required: true, message: 'Path evidence wajib diisi' }]}
      >
        <Input placeholder='/uploads/evidence/nama-file.png' />
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
