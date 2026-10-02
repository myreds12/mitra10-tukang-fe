import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  message,
  Popconfirm,
  Switch,
  Pagination,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ClearOutlined,
  FileSearchOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  VendorSpActionButton,
  VendorSpPill,
  vendorSpTableClassName,
} from './VendorSpTable'

const { Option } = Select

interface ViolationType {
  id: number
  code: string
  category: string
  name: string
  description: string | null
  point: number
  is_active: boolean
  created_at: string
}

const CATEGORIES = [
  { value: 'KONFIRMASI_ORDER', label: 'Konfirmasi Order' },
  { value: 'RESCHEDULE', label: 'Reschedule' },
  { value: 'REFUND', label: 'Refund' },
  { value: 'LAINNYA', label: 'Lainnya' },
]

const ViewVendorViolationType: React.FC = () => {
  const [data, setData] = useState<ViolationType[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ViolationType | null>(null)
  const [form] = Form.useForm()
  const [filters, setFilters] = useState({
    search: '',
    category: undefined as string | undefined,
  })
  const [filtersInput, setFiltersInput] = useState({
    search: '',
    category: undefined as string | undefined,
  })
  const [loadingButton, setLoadingButton] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        take: pagination.pageSize.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
      })

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/vendor-violation/type?${params}`,
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

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize, filters])

  const handleTableChange = (newPagination: any) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || prev.pageSize,
    }))
  }

  const handleSubmitFilter = () => {
    setLoadingButton(true)
    setFilters(filtersInput)
    setPagination((prev) => ({...prev, current: 1}))
  }

  const hasActiveFilters = !!filtersInput.search || !!filtersInput.category

  const handleClearFilters = () => {
    setFiltersInput({search: '', category: undefined})
    setFilters({search: '', category: undefined})
    setPagination((prev) => ({...prev, current: 1}))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'KONFIRMASI_ORDER':
        return 'blue'
      case 'RESCHEDULE':
        return 'orange'
      case 'REFUND':
        return 'red'
      case 'LAINNYA':
        return 'default'
      default:
        return 'default'
    }
  }

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: ViolationType) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('accessToken')
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/vendor-violation/type/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      message.success('Data berhasil dihapus')
      fetchData()
    } catch (error) {
      message.error('Gagal menghapus data')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (editingRecord) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/vendor-violation/type/${editingRecord.id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        message.success('Data berhasil diperbarui')
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/vendor-violation/type`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        message.success('Data berhasil ditambahkan')
      }
      setIsModalOpen(false)
      fetchData()
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Terjadi kesalahan')
    }
  }

  const columns: ColumnsType<ViolationType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Kode',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <VendorSpPill color={getCategoryColor(category)}>{category}</VendorSpPill>
      ),
    },
    {
      title: 'Nama Pelanggaran',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Poin',
      dataIndex: 'point',
      key: 'point',
      width: 80,
      render: (point: number) => (
        <VendorSpPill color={point >= 2 ? 'red' : 'orange'}>{point} Poin</VendorSpPill>
      ),
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (isActive: boolean) => (
        <VendorSpPill color={isActive ? 'success' : 'default'}>
          {isActive ? 'Aktif' : 'Nonaktif'}
        </VendorSpPill>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size='small'>
          <VendorSpActionButton
            title='Edit'
            tone='primary'
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title='Hapus data ini?'
            onConfirm={() => handleDelete(record.id)}
          >
            <VendorSpActionButton title='Hapus' tone='danger' icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className='card card-xxl-stretch mb-5 mb-xxl-8 vendor-sp-table'>
      <div className='card-header border-0 pt-5'>
        <div className='card-title d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3'>
          <h3 className='card-label fw-bold fs-3 mb-0'>Jenis Pelanggaran</h3>
          <Space className='flex-wrap'>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              <span className='d-none d-md-inline'>Refresh</span>
            </Button>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleAdd}
              className='vendor-sp-recap-button'
            >
              <span className='d-none d-md-inline'>Tambah Jenis Pelanggaran</span>
              <span className='d-md-none'>Tambah</span>
            </Button>
          </Space>
        </div>
        <div className='vendor-sp-toolbar'>
          <div className='row g-2 align-items-end'>
            <div className='col-12 col-md-4'>
              <label className='form-label fw-semibold fs-7 mb-1'>Pencarian</label>
              <div className='vendor-sp-search-wrapper'>
                <SearchOutlined className='vendor-sp-search-icon' />
                <Input
                  className='vendor-sp-search'
                  placeholder='Cari kode atau nama pelanggaran...'
                  allowClear
                  value={filtersInput.search}
                  onChange={(e) =>
                    setFiltersInput((prev) => ({...prev, search: e.target.value}))
                  }
                />
              </div>
            </div>
            <div className='col-6 col-md-3'>
              <label className='form-label fw-semibold fs-7 mb-1'>Kategori</label>
              <Select
                className='vendor-sp-filter-select'
                placeholder='Semua Kategori'
                allowClear
                style={{width: '100%'}}
                value={filtersInput.category}
                onChange={(value) =>
                  setFiltersInput((prev) => ({...prev, category: value}))
                }
              >
                {CATEGORIES.map((cat) => (
                  <Option key={cat.value} value={cat.value}>
                    {cat.label}
                  </Option>
                ))}
              </Select>
            </div>
            <div className='col-12 col-md-5 d-flex justify-content-end gap-2 flex-wrap'>
              <Button
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

      <div className='card-body py-3'>
        <Table
          className={vendorSpTableClassName}
          columns={columns}
          dataSource={data}
          rowKey='id'
          loading={loading}
          pagination={false}
          scroll={{x: 800}}
          locale={{
            emptyText: (
              <div className='vendor-sp-empty-state'>
                <FileSearchOutlined className='vendor-sp-empty-icon' />
                <div className='vendor-sp-empty-title'>
                  {hasActiveFilters ? 'Tidak Ada Data yang Cocok' : 'Belum Ada Jenis Pelanggaran'}
                </div>
                <div className='vendor-sp-empty-desc'>
                  {hasActiveFilters
                    ? 'Coba ubah atau reset filter untuk menampilkan data.'
                    : 'Belum ada jenis pelanggaran yang terdaftar.'}
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
              ? 'Belum ada data Jenis Pelanggaran'
              : `Menampilkan ${(pagination.current - 1) * pagination.pageSize + 1} - ${Math.min(
                  pagination.current * pagination.pageSize,
                  pagination.total,
                )} dari ${pagination.total} Jenis Pelanggaran`}
          </span>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={(page, size) => {
              setPagination((prev) => ({...prev, current: page, pageSize: size}))
            }}
          />
        </div>
      </div>

      <Modal
        title={editingRecord ? 'Edit Jenis Pelanggaran' : 'Tambah Jenis Pelanggaran'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Form.Item
            name='code'
            label='Kode'
            rules={[{ required: true, message: 'Kode wajib diisi' }]}
          >
            <Input placeholder='Contoh: ORDER_NOT_CONFIRMED_H' />
          </Form.Item>

          <Form.Item
            name='category'
            label='Kategori'
            rules={[{ required: true, message: 'Kategori wajib diisi' }]}
          >
            <Select placeholder='Pilih kategori'>
              {CATEGORIES.map((cat) => (
                <Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name='name'
            label='Nama Pelanggaran'
            rules={[{ required: true, message: 'Nama wajib diisi' }]}
          >
            <Input placeholder='Nama pelanggaran' />
          </Form.Item>

          <Form.Item
            name='description'
            label='Deskripsi'
          >
            <Input.TextArea rows={3} placeholder='Deskripsi detail' />
          </Form.Item>

          <Form.Item
            name='point'
            label='Poin'
            rules={[{ required: true, message: 'Poin wajib diisi' }]}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name='is_active' label='Status' valuePropName='checked'>
            <Switch />
          </Form.Item>

          <Form.Item className='mb-0 text-end'>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type='primary' htmlType='submit'>
                Simpan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export { ViewVendorViolationType }
