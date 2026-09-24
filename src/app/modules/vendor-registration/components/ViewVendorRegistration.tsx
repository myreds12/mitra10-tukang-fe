/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import { vendorRegistrationService } from '../../../services/vendorRegistrationService'
import Swal from 'sweetalert2'
import {Table, Spin, Pagination, PaginationProps} from 'antd'
import {Form, OverlayTrigger, Tooltip, Button} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {LoadingOutlined} from '@ant-design/icons'
import {
  faSearch,
  faFileAlt,
  faCheckCircle,
  faTimes,
  faHistory,
  faPaperPlane,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'
import './ViewVendorRegistration.css'

import type {ColumnsType} from 'antd/es/table'

interface EmailStatus {
  sent: boolean
  status: 'TERKIRIM' | 'GAGAL' | 'BELUM_TERKIRIM'
  sent_at: string | null
  recipient: string
  log_id?: number | null
}

interface VendorRegistration {
  id: number
  company_name: string
  address: string
  phone_number: string
  email_address: string
  pic_name: string
  pic_email: string
  pic_phone: string
  ktp_number: string | null
  npwp_number: string | null
  bank_id: number | null
  service_types: number[]
  areas: number[]
  status: number
  rejection_reason: string | null
  notes: string | null
  created_at: string
  bank?: {
    id: number
    bank_name: string
  }
  email_status?: EmailStatus
}

const ViewVendorRegistration: React.FC = () => {
  const navigate = useNavigate()

  const statusConfig: Record<number, {label: string; className: string}> = {
    1: {label: 'Menunggu Approve', className: 'status-badge-pending'},
    2: {label: 'Proses Pitching', className: 'status-badge-pitching'},
    3: {label: 'Disetujui', className: 'status-badge-approved'},
    4: {label: 'Ditolak', className: 'status-badge-rejected'},
  }

  const statusTabs = [
    {value: 1, label: 'Menunggu Approve', countKey: 'menunggu_approve'},
    {value: 2, label: 'Proses Pitching', countKey: 'proses_pitching'},
  ]

  // Loading state
  const [loadData, setLoadData] = useState<boolean>(true)

  // Table State
  const [vendorData, setVendorData] = useState<VendorRegistration[]>([])
  const [totalData, setTotalData] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [resendingId, setResendingId] = useState<number | null>(null)

  // Filter State
  const [companyNameFilter, setCompanyNameFilter] = useState<string>('')
  const [dateFromFilter, setDateFromFilter] = useState<string>('')
  const [dateToFilter, setDateToFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<number | undefined>(1)

  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value)
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay)
      return () => clearTimeout(handler)
    }, [value, delay])
    return debouncedValue
  }

  const debouncedCompanyName = useDebounce(companyNameFilter, 500)

  const handleResendEmail = async (record: VendorRegistration) => {
    const recipient = record.pic_email || record.email_address
    const result = await Swal.fire({
      title: 'Kirim Ulang Email?',
      text: `Kirim ulang email notifikasi / kredensial akun ke ${recipient}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#183383',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Kirim',
      cancelButtonText: 'Batal',
    })

    if (!result.isConfirmed) return

    setResendingId(record.id)
    try {
      const response = await vendorRegistrationService.resendEmail(record.id)
      Swal.fire({
        title: 'Berhasil',
        text: response.data?.message || `Email berhasil dikirim ulang ke ${recipient}`,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false,
      })
      fetchData(currentPage, pageSize)
    } catch (error: any) {
      console.error('Error resending email:', error)
      Swal.fire({
        title: 'Gagal',
        text: error?.response?.data?.message || 'Gagal mengirim ulang email.',
        icon: 'error',
      })
    } finally {
      setResendingId(null)
    }
  }

  // Pagination
  const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
    if (type === 'prev') {
      return <a>Prev</a>
    }
    if (type === 'next') {
      return <a>Next</a>
    }
    return originalElement
  }

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page)
    if (size) {
      setPageSize(size)
    }
  }

  // Table columns
  const columns: ColumnsType<VendorRegistration> = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      align: 'center',
      width: 60,
      render: (text: any, record: any, index: number) => {
        return (currentPage - 1) * pageSize + index + 1
      },
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: 70,
    },
    {
      title: 'Nama Perusahaan',
      dataIndex: 'company_name',
      key: 'company_name',
      align: 'left',
      width: 180,
    },
    {
      title: 'Nama PIC',
      dataIndex: 'pic_name',
      key: 'pic_name',
      align: 'left',
      width: 130,
    },
    {
      title: 'Email PIC',
      dataIndex: 'pic_email',
      key: 'pic_email',
      align: 'left',
      width: 180,
    },
    {
      title: 'Telepon',
      dataIndex: 'pic_phone',
      key: 'pic_phone',
      align: 'left',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 110,
      render: (status: number) => {
        const currentStatus = statusConfig[status] || {
          label: 'Unknown',
          className: 'status-badge-unknown',
        }

        return (
          <span className={`status-badge fw-semibold ${currentStatus.className}`}>
            {currentStatus.label}
          </span>
        )
      },
    },
    {
      title: 'Status Email',
      key: 'email_status',
      align: 'center',
      width: 140,
      render: (record: VendorRegistration) => {
        const emailStatus = record.email_status
        const isSent = emailStatus?.sent
        const isFailed = emailStatus?.status === 'GAGAL'

        let badgeClass = 'email-badge-pending'
        let label = 'Belum Terkirim'
        let icon = faExclamationTriangle

        if (isSent) {
          badgeClass = 'email-badge-sent'
          label = 'Terkirim'
          icon = faCheckCircle
        } else if (isFailed) {
          badgeClass = 'email-badge-failed'
          label = 'Gagal'
          icon = faTimes
        }

        return (
          <div className='email-status-cell d-flex flex-column align-items-center gap-1'>
            <span className={`email-status-badge ${badgeClass}`}>
              <FontAwesomeIcon icon={icon} className='me-1' style={{fontSize: '11px'}} />
              {label}
            </span>
            {emailStatus?.sent_at && (
              <span className='email-status-date'>
                {new Date(emailStatus.sent_at).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
        )
      },
    },
    {
      title: 'Tanggal',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      width: 140,
      render: (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      },
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      align: 'center',
      width: 200,
      render: (record) => {
        const id = record.id
        const isResending = resendingId === record.id

        return (
          <div className='button-wrapper d-flex justify-content-center align-items-center gap-2 flex-nowrap'>
            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={<Tooltip id={`tooltip-detail-${id}`}>Detail</Tooltip>}
            >
              <a
                href='#'
                className='btn btn-icon btn-sm btn-light-primary rounded action-button shadow-none'
                onClick={(e) => {
                  e.preventDefault()
                  navigate(`/vendor-registration/approval/${id}`)
                }}
              >
                <FontAwesomeIcon icon={faFileAlt} fontSize={'13px'} />
              </a>
            </OverlayTrigger>

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={<Tooltip id={`tooltip-history-${id}`}>Histori</Tooltip>}
            >
              <a
                href='#'
                className='btn btn-icon btn-sm btn-light-primary rounded action-button shadow-none'
                onClick={(e) => {
                  e.preventDefault()
                  navigate(`/vendor-registration/history/${id}`)
                }}
              >
                <FontAwesomeIcon icon={faHistory} fontSize={'13px'} />
              </a>
            </OverlayTrigger>

            {!record.email_status?.sent && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={<Tooltip id={`tooltip-resend-action-${id}`}>Kirim Ulang Email</Tooltip>}
              >
                <button
                  type='button'
                  className='btn btn-icon btn-sm btn-light-warning rounded action-button shadow-none'
                  disabled={isResending}
                  onClick={() => handleResendEmail(record)}
                >
                  {isResending ? (
                    <span className='spinner-border spinner-border-sm' role='status' style={{width: '12px', height: '12px'}} />
                  ) : (
                    <FontAwesomeIcon icon={faPaperPlane} fontSize={'12px'} />
                  )}
                </button>
              </OverlayTrigger>
            )}

            {(record.status === 1 || record.status === 2) && (
              <>
                <OverlayTrigger
                  placement='bottom'
                  delay={{show: 250, hide: 400}}
                  overlay={<Tooltip id={`tooltip-reject-${id}`}>Tolak</Tooltip>}
                >
                  <a
                    href='#'
                    className='btn btn-icon btn-sm btn-danger rounded action-button shadow-none'
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(`/vendor-registration/approval/${id}?action=reject`)
                    }}
                  >
                    <FontAwesomeIcon icon={faTimes} fontSize={'13px'} />
                  </a>
                </OverlayTrigger>

                <OverlayTrigger
                  placement='bottom'
                  delay={{show: 250, hide: 400}}
                  overlay={
                    <Tooltip id={`tooltip-approve-${id}`}>
                      {record.status === 1 ? 'Proses Pitching' : 'Setujui Final'}
                    </Tooltip>
                  }
                >
                  <a
                    href='#'
                    rel='noopener noreferrer'
                    className='btn btn-icon btn-sm btn-primary rounded action-button shadow-none'
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(`/vendor-registration/approval/${id}?action=approve`)
                    }}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} fontSize={'13px'} />
                  </a>
                </OverlayTrigger>
              </>
            )}
          </div>
        )
      },
    },
  ]

  // Fetch data
  const fetchData = async (page: number, pageSize: number) => {
    setLoadData(true)
    try {
      const params: any = {
        page: page,
        take: pageSize,
      }

      if (debouncedCompanyName) {
        params.company_name = debouncedCompanyName
      }
      if (dateFromFilter) {
        params.date_from = dateFromFilter
      }
      if (dateToFilter) {
        params.date_to = dateToFilter
      }
      if (statusFilter !== undefined) {
        params.status = statusFilter
      } else {
        params.status = 1
      }

      const response = await vendorRegistrationService.getAll(params)

      setVendorData(response.data?.data || [])
      setTotalData(response.data?.meta?.total ?? response.data?.total ?? 0)
    } catch (error) {
      console.error('Error fetching data:', error)
      Swal.fire({
        title: 'Error',
        text: 'Gagal mengambil data',
        icon: 'error',
      })
    } finally {
      setLoadData(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await vendorRegistrationService.getStats()
      const data = response.data?.data ?? response.data ?? {}
      setStats({
        ...data,
        total:
          (data.menunggu_approve || 0) +
          (data.proses_pitching || 0) +
          (data.disetujui || 0) +
          (data.ditolak || 0),
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Initial fetch and debounce search
  useEffect(() => {
    fetchData(currentPage, pageSize)
  }, [
    currentPage,
    pageSize,
    debouncedCompanyName,
    dateFromFilter,
    dateToFilter,
    statusFilter,
  ])

  useEffect(() => {
    fetchStats()
  }, [])

  // Handle filter submit
  const handleSubmitFilter = () => {
    setLoadingButton(true)
    fetchData(1, pageSize)
    setCurrentPage(1)
    setLoadingButton(false)
  }

  const handleChangeCompanyNameFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyNameFilter(e.target.value)
    setCurrentPage(1)
  }

  return (
    <section id='view-vendor-registration'>
      <div className='card'>
        <div className='card-body'>
          <div className='vendor-registration-status-tabs'>
            {statusTabs.map((tab) => {
              const isActive = statusFilter === tab.value
              return (
                <button
                  key={tab.label}
                  type='button'
                  className={`status-tab ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(tab.value)
                    setCurrentPage(1)
                  }}
                >
                  <span>{tab.label}</span>
                  <strong>{stats[tab.countKey] ?? 0}</strong>
                </button>
              )
            })}
          </div>

          <div className='table-head-wrapper'>
            <div className='filter-bar-container'>
              <div className='filter-item filter-search-box'>
                <Form.Label className='filter-field-label'>Pencarian</Form.Label>
                <div className='search-input-wrapper'>
                  <Form.Control
                    placeholder='Nama Perusahaan'
                    className='filter-input filter-ltr'
                    onChange={handleChangeCompanyNameFilter}
                    value={companyNameFilter}
                  />
                  <span className='search-icon'>
                    <FontAwesomeIcon icon={faSearch} size='sm' />
                  </span>
                </div>
              </div>

              <div className='filter-item filter-date-box'>
                <Form.Label className='filter-field-label'>Tanggal Dari</Form.Label>
                <Form.Control
                  type='date'
                  className='filter-input'
                  aria-label='Tanggal mulai'
                  value={dateFromFilter}
                  onChange={(event) => {
                    setDateFromFilter(event.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>

              <div className='filter-item filter-date-box'>
                <Form.Label className='filter-field-label'>Tanggal Sampai</Form.Label>
                <Form.Control
                  type='date'
                  className='filter-input'
                  aria-label='Tanggal akhir'
                  min={dateFromFilter || undefined}
                  value={dateToFilter}
                  onChange={(event) => {
                    setDateToFilter(event.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>

              <div className='filter-item filter-submit-box'>
                <Form.Label className='filter-field-label invisible d-none d-lg-block'>&nbsp;</Form.Label>
                <Button
                  className='btn-dark-primary button-submit m-0 d-inline-flex align-items-center justify-content-center'
                  disabled={loadingButton}
                  onClick={handleSubmitFilter}
                >
                  {loadingButton ? 'Filtering..' : 'Submit'}
                </Button>
              </div>
            </div>
          </div>

          <Spin
            tip='Loading...'
            spinning={loadData}
            size='large'
            indicator={<LoadingOutlined style={{fontSize: 24}} spin />}
          >
            <div className='table-custom-wrapper'>
              <Table
                className='table-striped-rows vendor-registration-table'
                bordered
                columns={columns}
                dataSource={vendorData}
                rowKey={(record) => record.id}
                pagination={false}
                sticky={true}
                tableLayout='auto'
                scroll={{x: 'max-content'}}
              />
            </div>
          </Spin>

          <div className='pagination-container mt-5'>
            <span className='total-text'>
              Showing {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Pendaftaran
            </span>

            <Pagination
              className='pagination'
              pageSize={pageSize}
              current={currentPage}
              total={totalData}
              showSizeChanger
              pageSizeOptions={[5, 10, 20, 50, 100]}
              itemRender={itemRender}
              onChange={(page, pageSize) => {
                handlePageChange(page, pageSize)
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export {ViewVendorRegistration}
