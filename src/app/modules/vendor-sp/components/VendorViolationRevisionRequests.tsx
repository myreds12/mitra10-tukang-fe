import React, {useEffect, useState} from 'react'
import {Button, Card, Input, Modal, Select, Space, Table, Pagination} from 'antd'
import type {ColumnsType} from 'antd/es/table'
import {vendorViolationService} from '../../../services/vendorViolationService'
import Swal from 'sweetalert2'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClearOutlined,
  FileSearchOutlined,
} from '@ant-design/icons'
import {
  VendorSpActionButton,
  VendorSpPill,
  vendorSpTableClassName,
} from './VendorSpTable'
import './VendorSpFilter.css'

const {Option} = Select

const VendorViolationRevisionRequests: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingButton, setLoadingButton] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [filtersInput, setFiltersInput] = useState<{
    status: string | undefined
  }>({status: 'PENDING'})
  const [appliedFilters, setAppliedFilters] = useState<{
    status: string | undefined
  }>({status: 'PENDING'})
  const [reviewTarget, setReviewTarget] = useState<any>(null)
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await vendorViolationService.getRevisionRequests({
        take: 100,
        ...(appliedFilters.status ? {status: appliedFilters.status} : {}),
      })
      const payload = response.data?.data && response.data?.meta
        ? response.data
        : response.data?.data || response.data
      const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
      const total = payload?.meta?.total ?? rows.length
      setData(rows)
      setPagination((prev) => ({...prev, total}))
    } catch (error) {
      Swal.fire('Error', 'Gagal mengambil request revisi/reset', 'error')
    } finally {
      setLoading(false)
      setLoadingButton(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, appliedFilters.status])

  const handleSubmitFilter = () => {
    setLoadingButton(true)
    setAppliedFilters(filtersInput)
    setPagination((prev) => ({...prev, current: 1}))
  }

  const handleClearFilters = () => {
    setFiltersInput({status: undefined})
    setAppliedFilters({status: undefined})
    setPagination((prev) => ({...prev, current: 1}))
  }

  const hasActiveFilters = !!filtersInput.status

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleSubmitFilter()
    }
  }

  const openReview = (record: any, action: 'APPROVE' | 'REJECT') => {
    setReviewTarget(record)
    setReviewAction(action)
    setReviewNote('')
  }

  const submitReview = async () => {
    if (!reviewTarget || !reviewAction) return

    setSubmitting(true)
    try {
      if (reviewAction === 'APPROVE') {
        await vendorViolationService.approveRevisionRequest(reviewTarget.id, {
          review_note: reviewNote,
        })
      } else {
        await vendorViolationService.rejectRevisionRequest(reviewTarget.id, {
          review_note: reviewNote,
        })
      }

      Swal.fire('Berhasil', 'Request berhasil direview', 'success')
      setReviewTarget(null)
      setReviewAction(null)
      fetchData()
    } catch (error: any) {
      Swal.fire('Error', error?.response?.data?.message || 'Gagal review request', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnsType<any> = [
    {
      title: 'Tanggal',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value: string) => new Date(value).toLocaleDateString('id-ID'),
    },
    {
      title: 'Vendor',
      key: 'vendor',
      render: (_, record) => (
        <div>
          <div className='fw-bold'>{record.vendor?.company_name || '-'}</div>
          <div className='text-muted small'>{record.vendor?.pic_name || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Tipe',
      dataIndex: 'type',
      key: 'type',
      render: (value: string) => (
        <VendorSpPill color={value === 'RESET' ? 'red' : 'blue'}>{value}</VendorSpPill>
      ),
    },
    {
      title: 'Target',
      key: 'target',
      render: (_, record) =>
        record.target_log ? (
          <span>
            #{record.target_log.id} - {record.target_log.violation_type?.name || '-'}
          </span>
        ) : (
          <span className='text-muted'>Quarter berjalan</span>
        ),
    },
    {
      title: 'Poin Baru',
      dataIndex: 'new_point',
      key: 'new_point',
      render: (value: number | null) => (value === null || value === undefined ? '-' : value),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => (
        <VendorSpPill color={value === 'APPROVED' ? 'green' : value === 'REJECTED' ? 'red' : 'gold'}>
          {value}
        </VendorSpPill>
      ),
    },
    {
      title: 'Alasan',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) =>
        record.status === 'PENDING' ? (
          <Space>
            <VendorSpActionButton
              title='Approve'
              tone='success'
              icon={<CheckCircleOutlined />}
              onClick={() => openReview(record, 'APPROVE')}
            />
            <VendorSpActionButton
              title='Reject'
              tone='danger'
              icon={<CloseCircleOutlined />}
              onClick={() => openReview(record, 'REJECT')}
            />
          </Space>
        ) : (
          <span className='text-muted'>{record.review_note || '-'}</span>
        ),
    },
  ]

  return (
    <div id='vendor-sp-revisions'>
    <Card className='vendor-sp-table' title='Approval Revisi / Reset Poin Vendor'>
      <div className='vendor-sp-table-head' onKeyDown={handleKeyPress}>
        <div className='row g-2 align-items-end mb-3'>
          <div className='col-12 col-md-4'>
            <label className='form-label fw-semibold fs-7 mb-1'>Status Request</label>
            <Select
              className='vendor-sp-filter-select'
              value={filtersInput.status}
              allowClear
              placeholder='Semua Status'
              style={{width: '100%'}}
              onChange={(value) =>
                setFiltersInput((prev) => ({...prev, status: value}))
              }
            >
              <Option value='PENDING'>PENDING</Option>
              <Option value='APPROVED'>APPROVED</Option>
              <Option value='REJECTED'>REJECTED</Option>
            </Select>
          </div>
          <div className='col-12 col-md-8 d-flex justify-content-end gap-2 flex-wrap'>
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
            >
              {loadingButton ? 'Memfilter...' : 'Terapkan Filter'}
            </Button>
          </div>
        </div>
      </div>

      <Table
        className={vendorSpTableClassName}
        rowKey='id'
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{x: 1000}}
        locale={{
          emptyText: (
            <div className='vendor-sp-empty-state'>
              <FileSearchOutlined className='vendor-sp-empty-icon' />
              <div className='vendor-sp-empty-title'>
                {hasActiveFilters ? 'Tidak Ada Request yang Cocok' : 'Belum Ada Request Revisi/Reset'}
              </div>
              <div className='vendor-sp-empty-desc'>
                {hasActiveFilters
                  ? 'Coba ubah filter status untuk menampilkan data.'
                  : 'Belum ada request revisi atau reset poin dari vendor.'}
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
            ? 'Belum ada data Request'
            : `Menampilkan ${(pagination.current - 1) * pagination.pageSize + 1} - ${Math.min(
                pagination.current * pagination.pageSize,
                pagination.total,
              )} dari ${pagination.total} Request`}
        </span>
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showSizeChanger
          pageSizeOptions={[10, 20, 50, 100]}
          onChange={(page, size) =>
            setPagination((prev) => ({...prev, current: page, pageSize: size}))
          }
        />
      </div>

      <Modal
        title={`${reviewAction === 'APPROVE' ? 'Approve' : 'Reject'} Request`}
        open={Boolean(reviewTarget)}
        onCancel={() => setReviewTarget(null)}
        onOk={submitReview}
        confirmLoading={submitting}
        okText={reviewAction === 'APPROVE' ? 'Ya, Approve' : 'Ya, Reject'}
        cancelText='Batal'
        okButtonProps={{danger: reviewAction === 'REJECT'}}
      >
        <p className='mb-2'>
          {reviewTarget?.type} untuk vendor {reviewTarget?.vendor?.company_name || '-'}
        </p>
        <Input.TextArea
          rows={3}
          value={reviewNote}
          placeholder='Catatan review (wajib untuk reject, opsional untuk approve)'
          onChange={(event) => setReviewNote(event.target.value)}
        />
      </Modal>
    </Card>
    </div>
  )
}

export {VendorViolationRevisionRequests}
