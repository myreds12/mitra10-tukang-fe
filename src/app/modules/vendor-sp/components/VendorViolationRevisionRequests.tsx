import React, { useEffect, useState } from 'react'
import { Button, Input, Modal, Select, Space, Table, Pagination } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { vendorViolationService } from '../../../services/vendorViolationService'
import Swal from 'sweetalert2'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClearOutlined,
  FileSearchOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import {
  VendorSpActionButton,
  VendorSpOrderLink,
  VendorSpPill,
  vendorSpTableClassName,
} from './VendorSpTable'
import './VendorSpFilter.css'

const { Option } = Select

interface RevisionFilter {
  search: string
  type: string | undefined
  status: string | undefined
}

const VendorViolationRevisionRequests: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingButton, setLoadingButton] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [filtersInput, setFiltersInput] = useState<RevisionFilter>({
    search: '',
    type: undefined,
    status: 'PENDING',
  })
  const [appliedFilters, setAppliedFilters] = useState<RevisionFilter>({
    search: '',
    type: undefined,
    status: 'PENDING',
  })
  const [detailTarget, setDetailTarget] = useState<any>(null)
  const [reviewTarget, setReviewTarget] = useState<any>(null)
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await vendorViolationService.getRevisionRequests({
        take: 100,
        ...(appliedFilters.status ? { status: appliedFilters.status } : {}),
      })
      const payload = response.data?.data && response.data?.meta
        ? response.data
        : response.data?.data || response.data
      const rawRows: any[] = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : []

      const filteredRows = rawRows.filter((row) => {
        if (appliedFilters.type && row.type !== appliedFilters.type) {
          return false
        }
        if (appliedFilters.search.trim()) {
          const q = appliedFilters.search.trim().toLowerCase()
          const company = row.vendor?.company_name?.toLowerCase() || ''
          const pic = row.vendor?.pic_name?.toLowerCase() || ''
          const reason = row.reason?.toLowerCase() || ''
          const targetName = row.target_log?.violation_type?.name?.toLowerCase() || ''
          return (
            company.includes(q) ||
            pic.includes(q) ||
            reason.includes(q) ||
            targetName.includes(q)
          )
        }
        return true
      })

      const total =
        appliedFilters.search.trim() || appliedFilters.type
          ? filteredRows.length
          : payload?.meta?.total ?? filteredRows.length

      setData(filteredRows)
      setPagination((prev) => ({ ...prev, total }))
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
  }, [pagination.current, pagination.pageSize, appliedFilters])

  const handleSubmitFilter = () => {
    setLoadingButton(true)
    setAppliedFilters(filtersInput)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const handleClearFilters = () => {
    const cleared: RevisionFilter = {
      search: '',
      type: undefined,
      status: undefined,
    }
    setFiltersInput(cleared)
    setAppliedFilters(cleared)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const hasActiveFilters =
    !!filtersInput.search ||
    !!filtersInput.type ||
    !!filtersInput.status ||
    !!appliedFilters.search ||
    !!appliedFilters.type ||
    !!appliedFilters.status

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

  const paginatedData = data.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  )

  const getOrderId = (record: any) =>
    record?.target_log?.order_id ?? record?.target_log?.orders?.id ?? record?.order_id ?? null

  const columns: ColumnsType<any> = [
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
      render: (_, record) => <VendorSpOrderLink orderId={getOrderId(record)} />,
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
      title: 'Tipe',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      align: 'center',
      render: (value: string) => (
        <VendorSpPill color={value === 'RESET' ? 'red' : 'blue'}>{value}</VendorSpPill>
      ),
    },
    {
      title: 'Target Pelanggaran',
      key: 'target',
      render: (_, record) =>
        record.target_log ? (
          <div>
            {record.target_log.violation_type?.code && (
              <VendorSpPill color='primary' className='me-2'>
                {record.target_log.violation_type.code}
              </VendorSpPill>
            )}
            <span className='fw-semibold'>
              {record.target_log.violation_type?.name || 'Pelanggaran Terkait'}
            </span>
          </div>
        ) : (
          <span className='text-muted'>Quarter berjalan</span>
        ),
    },
    {
      title: 'Poin Baru',
      dataIndex: 'new_point',
      key: 'new_point',
      width: 110,
      align: 'center',
      render: (value: number | null) =>
        value === null || value === undefined ? (
          <span className='text-muted'>-</span>
        ) : (
          <VendorSpPill color={value >= 2 ? 'red' : 'orange'}>{value} Poin</VendorSpPill>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (value: string) => (
        <VendorSpPill
          color={value === 'APPROVED' ? 'green' : value === 'REJECTED' ? 'red' : 'gold'}
        >
          {value}
        </VendorSpPill>
      ),
    },
    {
      title: 'Alasan',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason: string) => reason || <span className='text-muted'>-</span>,
    },
    {
      title: 'Tanggal',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 115,
      align: 'center',
      render: (value: string) => new Date(value).toLocaleDateString('id-ID'),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Space size='small'>
          <VendorSpActionButton
            title='Detail Request'
            tone='primary'
            icon={<EyeOutlined />}
            onClick={() => setDetailTarget(record)}
          />
          {record.status === 'PENDING' && (
            <>
              <VendorSpActionButton
                title='Setujui Request'
                tone='success'
                icon={<CheckCircleOutlined />}
                onClick={() => openReview(record, 'APPROVE')}
              />
              <VendorSpActionButton
                title='Tolak Request'
                tone='danger'
                icon={<CloseCircleOutlined />}
                onClick={() => openReview(record, 'REJECT')}
              />
            </>
          )}
        </Space>
      ),
    },
  ]

  const renderRequestDetailSummary = (target: any) => {
    if (!target) return null
    const orderId = getOrderId(target)
    return (
      <div className='vendor-sp-table'>
        <div className='vendor-sp-detail-banner d-flex justify-content-between align-items-start flex-wrap gap-3'>
          <div>
            <div className='text-muted small fw-semibold mb-1'>Pemohon Vendor</div>
            <div className='fw-bold fs-4 text-gray-800'>
              {target.vendor?.company_name || '-'}
            </div>
            <div className='text-muted small'>
              PIC: {target.vendor?.pic_name || '-'}
            </div>
          </div>
          <div className='d-flex align-items-center gap-2 flex-wrap'>
            <VendorSpPill color={target.type === 'RESET' ? 'red' : 'blue'}>
              {target.type}
            </VendorSpPill>
            <VendorSpPill
              color={
                target.status === 'APPROVED'
                  ? 'green'
                  : target.status === 'REJECTED'
                    ? 'red'
                    : 'gold'
              }
            >
              {target.status}
            </VendorSpPill>
          </div>
        </div>

        <div className='vendor-sp-info-card mb-3'>
          <div className='vendor-sp-info-card-title'>
            <span>Rincian Permohonan</span>
          </div>
          <div className='vendor-sp-info-list'>
            <div className='vendor-sp-info-row'>
              <span className='vendor-sp-info-row-label'>Order ID</span>
              <span className='vendor-sp-info-row-value'>
                <VendorSpOrderLink orderId={orderId} />
              </span>
            </div>
            <div className='vendor-sp-info-row'>
              <span className='vendor-sp-info-row-label'>Target Pelanggaran</span>
              <span className='vendor-sp-info-row-value'>
                {target.target_log
                  ? `${target.target_log.violation_type?.code ? `[${target.target_log.violation_type.code}] ` : ''}${target.target_log.violation_type?.name || 'Pelanggaran Terkait'}`
                  : 'Seluruh Poin Quarter Berjalan'}
              </span>
            </div>
            <div className='vendor-sp-info-row'>
              <span className='vendor-sp-info-row-label'>Poin Baru</span>
              <span className='vendor-sp-info-row-value'>
                {target.new_point === null || target.new_point === undefined ? (
                  '-'
                ) : (
                  <VendorSpPill color={target.new_point >= 2 ? 'red' : 'orange'}>
                    {target.new_point} Poin
                  </VendorSpPill>
                )}
              </span>
            </div>
            <div className='vendor-sp-info-row'>
              <span className='vendor-sp-info-row-label'>Tanggal Pengajuan</span>
              <span className='vendor-sp-info-row-value'>
                {target.created_at
                  ? new Date(target.created_at).toLocaleString('id-ID')
                  : '-'}
              </span>
            </div>
          </div>
        </div>

        <div className='vendor-sp-info-card mb-3'>
          <div className='vendor-sp-info-card-title'>
            <span>Alasan Pengajuan</span>
          </div>
          <div className='vendor-sp-note-box'>
            {target.reason || 'Tidak ada alasan yang dicantumkan.'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id='vendor-sp-revisions'>
      <div className='card card-xxl-stretch mb-5 mb-xxl-8 vendor-sp-table'>
        <div className='card-header border-0 pt-5'>
          <div className='card-title d-flex justify-content-between align-items-center flex-wrap gap-3'>
            <div>
              <h3 className='card-label fw-bold fs-3 mb-1'>
                Approval Revisi / Reset Poin Vendor
              </h3>
              <span className='text-muted fs-7'>
                Tinjau dan proses permohonan revisi poin pelanggaran atau reset poin vendor.
              </span>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchData}
              className='vendor-sp-header-btn'
            >
              <span className='d-none d-md-inline'>Refresh</span>
            </Button>
          </div>

          <div className='vendor-sp-table-head' onKeyDown={handleKeyPress}>
            <div className='row g-3 align-items-end'>
              <div className='col-12 col-md-4 col-lg-4'>
                <label className='form-label'>Pencarian</label>
                <div className='vendor-sp-search-wrapper'>
                  <SearchOutlined className='vendor-sp-search-icon' />
                  <Input
                    className='vendor-sp-search'
                    placeholder='Cari nama vendor, PIC, atau alasan...'
                    allowClear
                    value={filtersInput.search}
                    onChange={(e) =>
                      setFiltersInput((prev) => ({ ...prev, search: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className='col-6 col-md-2 col-lg-2'>
                <label className='form-label'>Tipe Request</label>
                <Select
                  className='vendor-sp-filter-select'
                  value={filtersInput.type}
                  allowClear
                  placeholder='Semua Tipe'
                  onChange={(value) =>
                    setFiltersInput((prev) => ({ ...prev, type: value }))
                  }
                >
                  <Option value='REVISE'>REVISE</Option>
                  <Option value='RESET'>RESET</Option>
                </Select>
              </div>
              <div className='col-6 col-md-2 col-lg-2'>
                <label className='form-label'>Status Request</label>
                <Select
                  className='vendor-sp-filter-select'
                  value={filtersInput.status}
                  allowClear
                  placeholder='Semua Status'
                  onChange={(value) =>
                    setFiltersInput((prev) => ({ ...prev, status: value }))
                  }
                >
                  <Option value='PENDING'>PENDING</Option>
                  <Option value='APPROVED'>APPROVED</Option>
                  <Option value='REJECTED'>REJECTED</Option>
                </Select>
              </div>
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
            rowKey='id'
            loading={loading}
            columns={columns}
            dataSource={paginatedData}
            pagination={false}
            scroll={{ x: 1050 }}
            locale={{
              emptyText: (
                <div className='vendor-sp-empty-state'>
                  <FileSearchOutlined className='vendor-sp-empty-icon' />
                  <div className='vendor-sp-empty-title'>
                    {hasActiveFilters
                      ? 'Tidak Ada Request yang Cocok'
                      : 'Belum Ada Request Revisi/Reset'}
                  </div>
                  <div className='vendor-sp-empty-desc'>
                    {hasActiveFilters
                      ? 'Coba ubah atau reset filter untuk menampilkan data.'
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
                setPagination((prev) => ({ ...prev, current: page, pageSize: size }))
              }
            />
          </div>
        </div>

        <Modal
          title='Detail Permohonan Revisi / Reset Poin'
          open={Boolean(detailTarget)}
          onCancel={() => setDetailTarget(null)}
          width={680}
          centered
          className='vendor-sp-popup-modal'
          footer={[
            <Button
              key='close'
              type='primary'
              className='vendor-sp-modal-close-btn'
              onClick={() => setDetailTarget(null)}
            >
              Tutup
            </Button>,
            ...(detailTarget?.status === 'PENDING'
              ? [
                  <Button
                    key='reject'
                    danger
                    onClick={() => {
                      const target = detailTarget
                      setDetailTarget(null)
                      openReview(target, 'REJECT')
                    }}
                  >
                    Tolak
                  </Button>,
                  <Button
                    key='approve'
                    type='primary'
                    onClick={() => {
                      const target = detailTarget
                      setDetailTarget(null)
                      openReview(target, 'APPROVE')
                    }}
                  >
                    Setujui
                  </Button>,
                ]
              : []),
          ]}
        >
          {detailTarget && (
            <>
              {renderRequestDetailSummary(detailTarget)}
              {detailTarget.status !== 'PENDING' && (
                <div className='vendor-sp-info-card'>
                  <div className='vendor-sp-info-card-title'>
                    <span>Catatan Review Admin</span>
                  </div>
                  <div className='vendor-sp-note-box'>
                    {detailTarget.review_note || 'Tidak ada catatan review.'}
                  </div>
                </div>
              )}
            </>
          )}
        </Modal>

        {/* Review (Approve / Reject) Modal */}
        <Modal
          title={`${reviewAction === 'APPROVE' ? 'Setujui' : 'Tolak'} Permohonan ${reviewTarget?.type || ''}`}
          open={Boolean(reviewTarget)}
          onCancel={() => setReviewTarget(null)}
          onOk={submitReview}
          width={640}
          confirmLoading={submitting}
          okText={reviewAction === 'APPROVE' ? 'Ya, Setujui' : 'Ya, Tolak'}
          cancelText='Batal'
          okButtonProps={{ danger: reviewAction === 'REJECT' }}
        >
          {renderRequestDetailSummary(reviewTarget)}
          <div className='vendor-sp-info-card'>
            <div className='vendor-sp-info-card-title'>
              <span>Catatan Review</span>
            </div>
            <Input.TextArea
              rows={3}
              value={reviewNote}
              placeholder='Tuliskan catatan review (wajib diisi untuk penolakan, opsional untuk persetujuan)...'
              onChange={(event) => setReviewNote(event.target.value)}
            />
          </div>
        </Modal>
      </div>
    </div>
  )
}

export { VendorViolationRevisionRequests }
