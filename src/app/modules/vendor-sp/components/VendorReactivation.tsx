import React, { useState, useEffect } from 'react'
import { vendorSpService } from '../../../services/vendorSpService'
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Alert,
  Descriptions,
  Select,
  DatePicker,
  Empty,
  Pagination,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { RangePickerProps } from 'antd/es/date-picker'
import {
  CheckCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  ClearOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import Swal from 'sweetalert2'
import dayjs, { Dayjs } from 'dayjs'
import {
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
}

// [POIN 5] Filter state — semua optional, kalau kosong artinya "no filter"
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
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/vendor?vendor_with_max_order=0&take=100&is_active=0`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const vendors: InactiveVendor[] = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : []
      setInactiveVendors(
        vendors.filter((vendor: InactiveVendor) => Number(vendor.is_active) === 0)
      )
    } catch (error) {
      console.error('Failed to fetch inactive vendors')
    }
  }

  const handleReactivate = async (values: any) => {
    try {
      await vendorSpService.reactivate({
        vendor_id: selectedVendor?.id,
        reason: values.reason,
      })
      Swal.fire('Berhasil', 'Vendor berhasil diaktifkan kembali', 'success')
      setReactivateModal(false)
      setSelectedVendor(null)
      fetchReactivationLogs()
      fetchInactiveVendors()
    } catch (error) {
      Swal.fire('Error', 'Gagal mengaktifkan vendor', 'error')
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

  const resetFilter = () => {
    setFiltersInput(emptyFilter)
    setAppliedFilters(emptyFilter)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  // Filter inactive vendors secara lokal (client-side) by company_name / pic_name
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
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        switch (record.status) {
          case 1:
            return <VendorSpPill color='processing'>Pending</VendorSpPill>
          case 2:
            return <VendorSpPill color='success'>Disetujui</VendorSpPill>
          case 3:
            return <VendorSpPill color='error'>Ditolak</VendorSpPill>
          default:
            return <VendorSpPill>Unknown</VendorSpPill>
        }
      },
    },
    {
      title: 'Alasan',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: 'Tanggal',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString('id-ID'),
    },
  ]

  return (
    <div id='vendor-sp-reactivation'>
    <div className='card card-xxl-stretch mb-5 mb-xxl-8 vendor-sp-table'>
      <div className='card-header border-0 pt-5'>
        <div className='card-title d-flex flex-column'>
          <h3 className='card-label'>Reaktivasi Vendor SP3</h3>
          <span className='text-muted'>
            Vendor yang dinonaktifkan akibat SP3 dapat diaktifkan kembali melalui
            menu ini
          </span>
        </div>
      </div>

      {/* Inactive Vendors Section */}
      <div className='card-body py-3'>
        <Alert
          message='Vendor Nonaktif'
          description='Vendor berikut dinonaktifkan akibat SP3. Klik tombol "Aktifkan" untuk mengaktifkan kembali.'
          type='warning'
          showIcon
          icon={<StopOutlined />}
          className='mb-4'
        />

        {/* Search untuk inactive vendors grid (client-side filter, live) */}
        <div className='mb-3' style={{maxWidth: 450}}>
          <div className='vendor-sp-search-wrapper'>
            <SearchOutlined className='vendor-sp-search-icon' />
            <Input
              className='vendor-sp-search'
              placeholder='Cari nama vendor atau PIC...'
              allowClear
              value={inactiveSearch}
              onChange={(e) => setInactiveSearch(e.target.value)}
            />
          </div>
        </div>

        <div className='row mb-4'>
          {filteredInactiveVendors.map((vendor) => (
            <div key={vendor.id} className='col-md-4 mb-3'>
              <Card
                size='small'
                title={vendor.company_name}
                extra={
                  <Button
                    type='primary'
                    size='small'
                    icon={<CheckCircleOutlined />}
                    onClick={() => openReactivateModal(vendor)}
                  >
                    Aktifkan
                  </Button>
                }
              >
                <Descriptions column={1} size='small'>
                  <Descriptions.Item label='PIC'>
                    {vendor.pic_name}
                  </Descriptions.Item>
                  <Descriptions.Item label='Email'>
                    {vendor.email_address}
                  </Descriptions.Item>
                  <Descriptions.Item label='Telepon'>
                    {vendor.phone_number}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </div>
          ))}
          {filteredInactiveVendors.length === 0 && (
            <div className='col-12'>
              <Empty
                description={
                  inactiveSearch.trim()
                    ? `Tidak ada vendor nonaktif sesuai pencarian "${inactiveSearch}"`
                    : 'Tidak ada vendor nonaktif'
                }
              >
                {inactiveSearch.trim() && (
                  <Button onClick={() => setInactiveSearch('')}>Reset Pencarian</Button>
                )}
              </Empty>
            </div>
          )}
        </div>

        <hr />

        <h5 className='mb-3'>Log Reaktivasi</h5>

        <div className='vendor-sp-table-head' onKeyDown={handleKeyPress}>
          <div className='row g-2 mb-3'>
            <div className='col-md-4'>
              <div className='vendor-sp-search-wrapper'>
                <SearchOutlined className='vendor-sp-search-icon' />
                <Input
                  className='vendor-sp-search'
                  placeholder='Cari nama vendor / PIC...'
                  allowClear
                  value={filtersInput.search}
                  onChange={(e) =>
                    setFiltersInput((prev) => ({...prev, search: e.target.value}))
                  }
                />
              </div>
            </div>
            <div className='col-md-2'>
              <Select
                className='vendor-sp-filter-select'
                placeholder='Status reaktivasi'
                allowClear
                value={filtersInput.status}
                onChange={(val) =>
                  setFiltersInput((prev) => ({...prev, status: val}))
                }
                options={[
                  {value: 1, label: 'Pending'},
                  {value: 2, label: 'Disetujui'},
                  {value: 3, label: 'Ditolak'},
                ]}
              />
            </div>
            <div className='col-md-3'>
              <DatePicker.RangePicker
                style={{width: '100%'}}
                value={filtersInput.dateRange}
                onChange={(val) =>
                  setFiltersInput((prev) => ({...prev, dateRange: val}))
                }
                format='YYYY-MM-DD'
                placeholder={['Dari tanggal', 'Sampai tanggal']}
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
            <div className='col-md-1'>
              <Button
                icon={<ClearOutlined />}
                onClick={resetFilter}
                title='Reset semua filter'
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        <Table
          className={vendorSpTableClassName}
          columns={columns}
          dataSource={data}
          rowKey='id'
          loading={loading}
          pagination={false}
          locale={{
            emptyText: (
              <Empty
                description='Tidak ada log reaktivasi sesuai filter'
              >
                <Button type='primary' onClick={resetFilter}>
                  Reset Filter
                </Button>
              </Empty>
            ),
          }}
        />
        <div className='pagination-container'>
          <span className='pagination-total'>
            {pagination.total === 0
              ? 'Showing 0 of 0 Log Reaktivasi'
              : `Showing ${(pagination.current - 1) * pagination.pageSize + 1} - ${Math.min(
                  pagination.current * pagination.pageSize,
                  pagination.total,
                )} of ${pagination.total} Log Reaktivasi`}
          </span>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger
            pageSizeOptions={[5, 10, 20, 50, 100, 250, 500]}
            onChange={(page, size) =>
              setPagination((prev) => ({...prev, current: page, pageSize: size}))
            }
          />
        </div>
      </div>

      {/* Reactivate Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            Konfirmasi Reaktivasi Vendor
          </Space>
        }
        open={reactivateModal}
        onCancel={() => {
          setReactivateModal(false)
          setSelectedVendor(null)
        }}
        footer={null}
      >
        {selectedVendor && (
          <Form layout='vertical' onFinish={handleReactivate}>
            <Alert
              message={`Aktifkan Vendor: ${selectedVendor.company_name}`}
              description={
                <div>
                  <p>
                    Vendor ini sebelumnya dinonaktifkan akibat SP3. Dengan
                    mengaktifkan kembali, vendor akan dapat menerima order seperti
                    biasa.
                  </p>
                </div>
              }
              type='info'
              showIcon
              className='mb-3'
            />

            <Descriptions column={1} size='small' className='mb-3'>
              <Descriptions.Item label='Perusahaan'>
                {selectedVendor.company_name}
              </Descriptions.Item>
              <Descriptions.Item label='PIC'>
                {selectedVendor.pic_name}
              </Descriptions.Item>
              <Descriptions.Item label='Email'>
                {selectedVendor.email_address}
              </Descriptions.Item>
            </Descriptions>

            <Form.Item
              name='reason'
              label='Alasan Reaktivasi'
              rules={[{ required: true, message: 'Wajib diisi' }]}
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
                <Button type='primary' htmlType='submit'>
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