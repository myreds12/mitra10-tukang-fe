import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { vendorSpService } from '../../../services/vendorSpService'
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  Badge,
  Pagination,
} from 'antd'
import {
  EyeOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import Swal from 'sweetalert2'
import {
  VendorSpActionButton,
  VendorSpPill,
  vendorSpTableClassName,
} from './VendorSpTable'
import './VendorSpFilter.css'

const { Option } = Select

interface VendorSP {
  id: number
  vendor_id: number
  sp_level: number
  total_point: number
  quarter: number
  year: number
  start_date: string
  end_date: string
  status: number
  allocation_reduction: number | null
  notes: string | null
  created_at: string
  vendor: {
    id: number
    company_name: string
    pic_name: string
    is_active: boolean
  }
}

const ViewVendorSP: React.FC = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<VendorSP[]>([])
  const [loading, setLoading] = useState(false)
  const [exportingRecap, setExportingRecap] = useState(false)
  const [recapModalOpen, setRecapModalOpen] = useState(false)
  const [recapForm] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [filtersInput, setFiltersInput] = useState({
    search: '',
    sp_level: undefined as number | undefined,
    status: undefined as number | undefined,
  })
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    sp_level: undefined as number | undefined,
    status: undefined as number | undefined,
  })
  const [loadingButton, setLoadingButton] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        take: pagination.pageSize,
        ...(appliedFilters.search ? { search: appliedFilters.search } : {}),
        ...(appliedFilters.sp_level ? { sp_level: appliedFilters.sp_level } : {}),
        ...(appliedFilters.status ? { status: appliedFilters.status } : {}),
      }
      const response = await vendorSpService.getAll(params)
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
      Swal.fire('Error', 'Gagal mengambil data Surat Peringatan', 'error')
    } finally {
      setLoading(false)
      setLoadingButton(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, appliedFilters.search, appliedFilters.sp_level, appliedFilters.status])

  const handleTableChange = (newPagination: any) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || prev.pageSize,
    }))
  }

  const getSpLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'orange'
      case 2:
        return 'red'
      case 3:
        return 'purple'
      default:
        return 'default'
    }
  }

  const getSpLevelText = (level: number) => {
    switch (level) {
      case 1:
        return 'SP1'
      case 2:
        return 'SP2'
      case 3:
        return 'SP3'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return 'processing'
      case 2:
        return 'success'
      case 3:
        return 'warning'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return 'Aktif'
      case 2:
        return 'Selesai'
      case 3:
        return 'Diperpanjang'
      default:
        return 'Unknown'
    }
  }

  const handleComplete = async (id: number) => {
    Modal.confirm({
      title: 'Konfirmasi',
      icon: <CheckCircleOutlined />,
      content: 'Apakah Anda yakin ingin menyelesaikan SP ini?',
      onOk: async () => {
        try {
          await vendorSpService.complete(id)
          Swal.fire('Berhasil', 'SP berhasil diselesaikan', 'success')
          fetchData()
        } catch (error) {
          Swal.fire('Error', 'Gagal menyelesaikan SP', 'error')
        }
      },
    })
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

  const openRecapModal = () => {
    const now = new Date()
    recapForm.setFieldsValue({
      quarter: Math.ceil((now.getMonth() + 1) / 3),
      year: now.getFullYear(),
      category: undefined,
    })
    setRecapModalOpen(true)
  }

  const handleRecapSubmit = async (values: any) => {
    setExportingRecap(true)
    try {
      await vendorSpService.generateCleanVendorRecap({
        quarter: values.quarter,
        year: values.year,
        category: values.category || undefined,
      })
      Swal.fire('Sukses', 'Rekap vendor bersih PDF berhasil didownload', 'success')
      setRecapModalOpen(false)
    } catch (error: any) {
      Swal.fire('Error', error?.message || 'Gagal generate rekap vendor bersih', 'error')
    } finally {
      setExportingRecap(false)
    }
  }

  const columns: ColumnsType<VendorSP> = [
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
      title: 'Level SP',
      dataIndex: 'sp_level',
      key: 'sp_level',
      render: (level: number) => (
        <VendorSpPill color={getSpLevelColor(level)}>
          {getSpLevelText(level)}
        </VendorSpPill>
      ),
    },
    {
      title: 'Total Poin',
      dataIndex: 'total_point',
      key: 'total_point',
      render: (point: number) => (
        <Badge count={point} showZero color='red' />
      ),
    },
    {
      title: 'Periode',
      key: 'period',
      render: (_, record) => (
        <div className='small'>
          <div>Q{record.quarter} {record.year}</div>
          <div className='text-muted'>
            {new Date(record.start_date).toLocaleDateString('id-ID')} -{' '}
            {new Date(record.end_date).toLocaleDateString('id-ID')}
          </div>
        </div>
      ),
    },
    {
      title: 'Pengurangan Alokasi',
      dataIndex: 'allocation_reduction',
      key: 'allocation_reduction',
      render: (reduction: number | null) =>
        reduction ? `${reduction}%` : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <VendorSpPill color={getStatusColor(status)}>{getStatusText(status)}</VendorSpPill>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space size='small'>
          <VendorSpActionButton
            title='Detail'
            tone='primary'
            icon={<EyeOutlined />}
            onClick={() => navigate(`/vendor-sp/detail/${record.id}`)}
          />
          {record.status === 1 && (
            <VendorSpActionButton
              title='Selesaikan SP'
              tone='success'
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record.id)}
            />
          )}
        </Space>
      ),
    },
  ]

  return (
    <div id='vendor-sp-list'>
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
                  placeholder='Level SP'
                  allowClear
                  value={filtersInput.sp_level}
                  onChange={(value) =>
                    setFiltersInput((prev) => ({ ...prev, sp_level: value }))
                  }
                  style={{ width: '100%' }}
                >
                  <Option value={1}>SP1</Option>
                  <Option value={2}>SP2</Option>
                  <Option value={3}>SP3</Option>
                </Select>
              </div>
              <div className='col-md-2'>
                <Select
                  className='vendor-sp-filter-select'
                  placeholder='Status'
                  allowClear
                  value={filtersInput.status}
                  onChange={(value) =>
                    setFiltersInput((prev) => ({ ...prev, status: value }))
                  }
                  style={{ width: '100%' }}
                >
                  <Option value={1}>Aktif</Option>
                  <Option value={2}>Selesai</Option>
                  <Option value={3}>Diperpanjang</Option>
                </Select>
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
              <div className='col-md-3 d-flex justify-content-end'>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={openRecapModal}
                  loading={exportingRecap}
                >
                  Download Rekap Vendor Bersih
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
              ? 'Showing 0 of 0 Vendor SP'
              : `Showing ${(pagination.current - 1) * pagination.pageSize + 1} - ${Math.min(
                  pagination.current * pagination.pageSize,
                  pagination.total,
                )} of ${pagination.total} Vendor SP`}
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

      <Modal
        title='Download Rekap Vendor Bersih'
        open={recapModalOpen}
        onCancel={() => setRecapModalOpen(false)}
        footer={null}
      >
        <Form form={recapForm} layout='vertical' onFinish={handleRecapSubmit}>
          <Form.Item
            name='quarter'
            label='Quartal'
            rules={[{ required: true, message: 'Pilih quartal' }]}
          >
            <Select placeholder='Pilih quartal'>
              <Option value={1}>Q1 (Jan-Mar)</Option>
              <Option value={2}>Q2 (Apr-Jun)</Option>
              <Option value={3}>Q3 (Jul-Sep)</Option>
              <Option value={4}>Q4 (Okt-Des)</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name='year'
            label='Tahun'
            rules={[{ required: true, message: 'Tahun wajib diisi' }]}
          >
            <Input type='number' min={2020} max={2100} />
          </Form.Item>
          <Form.Item name='category' label='Kategori Pelanggaran (opsional)'>
            <Select allowClear placeholder='Semua kategori'>
              <Option value='KONFIRMASI_ORDER'>Konfirmasi Order</Option>
              <Option value='REFUND'>Refund</Option>
              <Option value='RESCHEDULE'>Reschedule</Option>
              <Option value='LAINNYA'>Lainnya</Option>
            </Select>
          </Form.Item>
          <Form.Item className='mb-0 text-end'>
            <Space>
              <Button onClick={() => setRecapModalOpen(false)}>Batal</Button>
              <Button type='primary' htmlType='submit' loading={exportingRecap}>
                Download PDF
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
    </div>
  )
}

export { ViewVendorSP }
