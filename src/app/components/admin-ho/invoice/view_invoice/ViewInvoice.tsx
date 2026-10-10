/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect, FC, useRef, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {RootState} from '../../../../../store'
import {
  setQueryParams,
  setCurrentPage,
  setPageSize,
  setDateFrom,
  setDateTo,
  setSearchFilter,
  setSelectedVendor,
} from '../../../../../store/invoiceSlice'

import './ViewInvoice.css'

import axios from 'axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import Select, {SingleValue} from 'react-select'
import type {ColumnsType} from 'antd/es/table'
import {Table, Tag, DatePicker, PaginationProps, Spin, Pagination, Upload, Image} from 'antd'
import {InboxOutlined} from '@ant-design/icons'
import {
  Form,
  Row,
  Button,
  OverlayTrigger,
  Tooltip,
  Modal,
  ListGroup,
  FormGroup,
} from 'react-bootstrap'
import {LoadingOutlined} from '@ant-design/icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faBook,
  faSearch,
  faPen,
  faImage,
  faFileImage,
  faTrash,
  faCheckCircle,
  faFile,
  faXmarkCircle,
} from '@fortawesome/free-solid-svg-icons'
import {formatDateWithTimeZone} from '../../../../../_metronic/helpers'

const {RangePicker} = DatePicker
const {Dragger} = Upload

interface DataType {
  invoice_id: number
  status: number
  invoice_date: string
  vendor_name: string
  amount: number
  invoice_status: string
}

interface VendorItem {
  value: number | null
  label: string
}

const ViewInvoiceHO: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const userRole = localStorage.getItem('userRole') as string

  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Loading State
  const [loadingTemplate, setLoadingTemplate] = useState<boolean>(false)
  const [loadingUploadExcel, setLoadingUploadExcel] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [loadingButton, setLoadingButton] = useState(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  // Table State
  const [invoiceData, setInvoiceData] = useState<DataType[]>([])
  const [totalData, setTotalData] = useState<number>(0)
  const {queryParams, searchFilter, currentPage, pageSize, dateFrom, dateTo, selectedVendor} =
    useSelector((state: RootState) => state.invoice)

  // Vendor
  const [vendor, setVendor] = useState<VendorItem[]>([])
  const vendorOptions = [{value: null, label: 'All Vendor'}, ...vendor]

  // Update Invoice
  const [invoiceId, setInvoiceId] = useState<any>()
  const [invoiceNotes, setInvoiceNotes] = useState<any>()

  // Filter Table
  const handleChangeSearchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value))
  }

  const handleVendorChange = (newValue: SingleValue<VendorItem>) => {
    const selectedVendor: VendorItem = newValue || {value: null, label: 'All Vendor'}
    dispatch(setSelectedVendor(selectedVendor))
  }

  const handlePageChange = (page: number, size?: number) => {
    dispatch(setCurrentPage(page))
    if (size) {
      dispatch(setPageSize(size))
    }
  }

  const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
    if (type === 'prev') {
      return <a>Prev</a>
    }
    if (type === 'next') {
      return <a>Next</a>
    }
    return originalElement
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleSubmitFilter()
    }
  }

  // Table
  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>
  const columns: ColumnsType<DataType> = [
    {
      title: 'Invoice ID',
      dataIndex: 'invoice_id',
      key: 'invoice_id',
      align: 'center',
      width: 100,
      className: 'col_order_id',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.invoice_id - b.invoice_id,
    },
    {
      title: 'Tanggal Invoice Terbit',
      dataIndex: 'invoice_date',
      key: 'invoice_date',
      align: 'center',
      width: 110,
      onFilter: (value, record) => record.invoice_date.includes(String(value)),
      sorter: (a, b) => a.invoice_date.length - b.invoice_date.length,
    },
    {
      title: 'Nama Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      align: 'center',
      width: 140,
      onFilter: (value, record) => record.vendor_name.includes(String(value)),
      sorter: (a, b) => a.vendor_name.length - b.vendor_name.length,
    },
    {
      title: 'Total Tagihan',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      width: 100,
      className: 'col_order_id',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Status Invoice',
      dataIndex: 'invoice_status',
      key: 'invoice_status',
      align: 'center',
      width: 140,
      onFilter: (value, record) => record.invoice_status.includes(String(value)),
      sorter: (a, b) => a.invoice_status.length - b.invoice_status.length,
      render: (invoice_status) => {
        const orderStatus = invoice_status
        let color = ''

        switch (orderStatus) {
          case 'UNPAID':
            color = 'red'
            break
          default:
            color = 'blue'
            break
        }

        return <Tag color={color}>{orderStatus}</Tag>
      },
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 70,
      align: 'center',
      render: (record) => {
        const id = record.invoice_id

        const handleUpdateInvoicePage = () => {
          navigate(`/invoice/update-invoice/${id}`)
        }

        const handleDetailInvoicePage = () => {
          navigate(`/invoice/detail-invoice/${id}`)
        }

        const handleShowModal = (id: number, type: number) => {
          const selected = invoiceData.find((invoice) => invoice.invoice_id === id)

          if (selected) {
            setInvoiceId(selected.invoice_id)
            setModalInvoice(true)
            setModalType(type)
          }
        }

        return (
          <div className='button-wrapper d-flex justify-content-center gap-3'>
            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Detail Invoice')}
            >
              <a
                href={`/invoice/detail-invoice/${id}`}
                target='_blank'
                rel='noopener noreferrer'
                className='btn btn-primary button-detail'
                onClick={(e) => {
                  e.preventDefault()
                  handleDetailInvoicePage()
                }}
              >
                <FontAwesomeIcon className='text-white' icon={faBook} fontSize={'13px'} />
              </a>
            </OverlayTrigger>

            {[6].includes(record.status) && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Upload File Invoice')}
              >
                <Button
                  variant='primary'
                  className='button-verif'
                  onClick={() => handleShowModal(id, 2)}
                >
                  <FontAwesomeIcon className='text-white' icon={faFile} fontSize='13px' />
                </Button>
              </OverlayTrigger>
            )}

            {['Super User', 'Admin HO'].includes(userRole) && (
              <>
                {record.status === 1 && (
                  <OverlayTrigger
                    placement='bottom'
                    delay={{show: 250, hide: 400}}
                    overlay={renderTooltip('Edit Invoice')}
                  >
                    <a
                      href={`/order/update-order/${id}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='btn btn-primary button-edit'
                      onClick={(e) => {
                        e.preventDefault()
                        handleUpdateInvoicePage()
                      }}
                    >
                      <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
                    </a>
                  </OverlayTrigger>
                )}

                {![3, 6].includes(record.status) && (
                  <OverlayTrigger
                    placement='bottom'
                    delay={{show: 250, hide: 400}}
                    overlay={renderTooltip('Tolak Invoice')}
                  >
                    <Button
                      className='button-cancel'
                      variant='danger'
                      onClick={() => handleShowModal(id, 1)}
                    >
                      <FontAwesomeIcon
                        className='text-white'
                        icon={faXmarkCircle}
                        fontSize='13px'
                      />
                    </Button>
                  </OverlayTrigger>
                )}

                {[2, 4].includes(record.status) && (
                  <OverlayTrigger
                    placement='bottom'
                    delay={{show: 250, hide: 400}}
                    overlay={renderTooltip('Kirim Invoice ke Finance')}
                  >
                    <Button
                      variant='primary'
                      className='button-verif'
                      onClick={() => handleUpdateInvoice(id, 5, 'Invoice diberikan kepada Finance')}
                    >
                      <FontAwesomeIcon
                        className='text-white'
                        icon={faCheckCircle}
                        fontSize='13px'
                      />
                    </Button>
                  </OverlayTrigger>
                )}
              </>
            )}

            {['Finance'].includes(userRole) && (
              <>
                {record.status === 5 && (
                  <OverlayTrigger
                    placement='bottom'
                    delay={{show: 250, hide: 400}}
                    overlay={renderTooltip('Sudah dibayarkan')}
                  >
                    <Button
                      variant='primary'
                      className='button-verif'
                      onClick={() => handleUpdateInvoice(id, 6, 'Invoice sudah dibayarkan')}
                    >
                      <FontAwesomeIcon
                        className='text-white'
                        icon={faCheckCircle}
                        fontSize='13px'
                      />
                    </Button>
                  </OverlayTrigger>
                )}
              </>
            )}
          </div>
        )
      },
    },
  ]

  const getInvoiceList = async (page: number, pageSize: number, queryparams: any) => {
    const statuses = ['Finance'].includes(userRole) ? '&status=5,6' : ''
    const url = `${apiUrl}/invoices?order_by=desc&page=${page}&take=${pageSize}${queryparams}${statuses}&date_from=${dateFrom}&date_to=${dateTo}`

    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        // // 'Access-Control-Allow-Origin': '*',
       // // 'ngrok-skip-browser-warning':  'true',
      },
    })

    setLoadData(false)
    setCurrentPage(response?.data?.page ?? 1)
    setTotalData(response?.data?.total ?? 0)

    return response.data.data
  }

  const ViewInvoice = async (page: number, pageSize: number, queryparams: any) => {
    try {
      const apiData = await getInvoiceList(page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from getInvoiceList')
        return []
      }

      const invoiceData = apiData.map((item: any) => {
        let data

        const invoiceDate = formatDateWithTimeZone(item?.created_at)

        const invoiceStatus = (status: number) => {
          switch (status) {
            case 1:
              return 'Pengecekan invoice'
            case 2:
              return 'Invoice disetujui'
            case 3:
              return 'Invoice ditolak'
            case 4:
              return 'Menunggu dokumen tagihan'
            case 5:
              return 'Invoice diberikan kepada finance'
            case 6:
              return 'Invoice sudah dibayarkan'
            case 7:
              return 'Dokumen ditolak'
            default:
              return ''
          }
        }

        data = {
          invoice_id: item?.id,
          invoice_date: invoiceDate,
          vendor_name: item?.vendor?.company_name ?? '-',
          amount: `Rp. ${parseInt(item?.total_amount).toLocaleString('id')}`,
          status: item?.status,
          invoice_status: invoiceStatus(item?.status),
        }

        return data
      })

      return invoiceData
    } catch (error) {
      console.error('Error getting order list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewInvoice(page, pageSize, queryparams)
    setInvoiceData(data)
  }

  useEffect(() => {
    fetchData(currentPage, pageSize, queryParams)
    // eslint-disable-next-line
  }, [currentPage, pageSize, queryParams])

  const getVendor = async () => {
    let currentPage = 1
    const pageSize = 20
    let allVendors: any[] = []
    let hasMoreData = true

    try {
      while (hasMoreData) {
        const response = await axios.get(`${apiUrl}/vendor?page=${currentPage}&take=${pageSize}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })

        const data = response.data.data

        if (data.length > 0) {
          const tempVendor = response.data.data.map((item: any) => ({
            value: item.id,
            label: item.company_name,
          }))

          allVendors = [...allVendors, ...tempVendor]
          currentPage += 1
        } else {
          hasMoreData = false
        }
      }

      setVendor(allVendors)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getVendor()
    //eslint-disable-next-line
  }, [])

  // Filter
  const handleSubmitFilter = async () => {
    setLoadingButton(true)
    let queryparams = ``

    const valueCheck = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        queryparams += `${key}${value}`
      }
    }

    valueCheck(`&search=`, searchFilter)
    valueCheck(`&vendor_id=`, selectedVendor?.value)
    dispatch(setQueryParams(queryparams))

    const data = await ViewInvoice(currentPage, pageSize, queryparams)
    setInvoiceData(data)

    setLoadingButton(false)
  }

  // Decline Invoice
  const [invoiceEvidence, setInvoiceEvidence] = useState<Array<File | null>>([])
  const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState<number | null>(null)
  const [previewInvoice, setPreviewInvoice] = useState<any>()
  const [visibleInvoice, setVisibleInvoice] = useState(false)
  const evidenceRef = useRef<HTMLInputElement>(null)

  const [showModalInvoice, setModalInvoice] = useState(false)
  const [modalType, setModalType] = useState<number | null>(null)
  const handleCloseModalInvoice = () => {
    setModalInvoice(false)
  }

  // Upload Order File Handler
  const handleInvoiceEvidenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files

    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...invoiceEvidence]
      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setInvoiceEvidence(mergedFiles)
    }
  }

  // Click Image
  const handleInvoiceClick = () => {
    const inputField = document.querySelector('.input-field-invoice') as HTMLInputElement
    inputField.click()
  }

  // Handle Remove File
  const handleRemoveFiles = (index: number) => {
    const newEvidances = [...invoiceEvidence]
    newEvidances.splice(index, 1)
    setInvoiceEvidence(newEvidances)

    // Update element value
    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  // File Click
  const handleFileInvoice = (index: number) => {
    setPreviewInvoice(invoiceEvidence[index]?.name)
    setVisibleInvoice(true)
    setSelectedInvoiceIndex(index)
  }

  // Upload Excel
  const [excel, setExcel] = useState<File | null>(null)
  const [showModalUpload, setModalUpload] = useState(false)
  const handleCloseModalUpload = () => {
    setModalUpload(false)
  }

  const handleFileChange = (event: any) => {
    const files = event.fileList
    if (files && files[0]) {
      setExcel(files[0].originFileObj)
    }
  }

  const handleFileRemove = () => {
    setExcel(null)
  }

  const handleDeclineInvoice = async (statusInvoice: number) => {
    setIsLoading(true)
    const formData = new FormData()

    formData.append(`invoice_id`, invoiceId)
    formData.append(`notes`, invoiceNotes)
    formData.append(`status`, String(statusInvoice))

    if (invoiceEvidence?.length) {
      invoiceEvidence.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`invoice_evidences`, item, item.name)
        }
      })
    }

    await axios
      .post(`${apiUrl}/invoices/${invoiceId}`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })
      .then((response) => {
        if (response.data.status === 201 || response.data.status === 200) {
          Swal.fire({
            title: 'Success',
            text: `${
              statusInvoice === 3
                ? 'Berhasil menolak invoice yang akan ditagihkan'
                : 'Berhasil menolak dokumen tagihan'
            }`,
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          })
        } else {
          Swal.fire({
            title: 'Error',
            text: response.data.message,
            icon: 'error',
          })
        }

        setIsLoading(false)
        window.location.reload()
      })
      .catch((error) => {
        setIsLoading(false)
        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
        })
      })
  }

  const handleUploadInvoiceFile = async () => {
    const formData = new FormData()

    formData.append(`invoice_id`, invoiceId)
    formData.append(`status`, String(6))

    if (invoiceEvidence?.length) {
      invoiceEvidence.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`invoice_evidences`, item, item.name)
        }
      })
    }

    await axios
      .post(`${apiUrl}/invoices/${invoiceId}`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })
      .then((response) => {
        if (response.data.status === 201 || response.data.status === 200) {
          Swal.fire({
            title: 'Success',
            text: 'Berhasil Mengupload File Bukti Pembayaran',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          })
        } else {
          Swal.fire({
            title: 'Error',
            text: response.data.message,
            icon: 'error',
          })
        }

        window.location.reload()
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
        })
      })
  }

  const handleUpload = async () => {
    setLoadingUploadExcel(true)

    const formData = new FormData()
    if (excel !== null) {
      formData.append('excel_file', excel)
    }

    await axios
      .post(`${apiUrl}/invoices/upload-excel-invoice`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })
      .then((response) => {
        if (response.data.status === 201) {
          Swal.fire({
            title: 'Success',
            text: 'Berhasil Upload Excel',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          })

          setLoadingUploadExcel(false)
        } else {
          Swal.fire({
            title: 'Error',
            text: response.data.message,
            icon: 'error',
          })

          setLoadingUploadExcel(false)
        }

        window.location.reload()
      })
      .catch((error) => {
        setLoadingUploadExcel(false)
        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
        })
      })
  }

  // Export Template Excel
  const exportTemplate = useCallback(() => {
    setLoadingTemplate(true)

    axios
      .get(`${apiUrl}/invoices/export-excel`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        params: {
          date_from: dateFrom,
          date_to: dateTo,
          vendor_id: selectedVendor ? selectedVendor.value : null,
        },
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `Invoice Periode ${dateFrom} - ${dateTo}.xlsx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      })
      .catch((error) => {
        console.error('Export failed:', error)
      })
      .finally(() => {
        setLoadingTemplate(false)
      })

    // eslint-disable-next-line
  }, [dateFrom, dateTo, selectedVendor?.value])

  // Handle Update Status
  const handleUpdateInvoice = async (id: number, status: number, statusName: string) => {
    const formData = new FormData()
    formData.append('status', String(status))

    const textConfirmation = `Apakah Anda yakin ingin mengubah status invoice ini menjadi ${statusName} ?`

    Swal.fire({
      title: textConfirmation,
      icon: 'question',
      showConfirmButton: true,
      confirmButtonColor: '#6b9230',
      showDenyButton: true,
      confirmButtonText: 'Ya',
      denyButtonText: 'Tidak',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true)
        try {
          const response = await axios.post(`${apiUrl}/invoices/${id}`, formData, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              // 'Access-Control-Allow-Origin': '*',
             // 'ngrok-skip-browser-warning':  'true',
            },
          })
          if (response.data.status === 201) {
            Swal.fire({
              title: 'Success',
              text: 'Berhasil mengubah status Invoice',
              icon: 'success',
              showConfirmButton: false,
              timer: 1500,
            })
            setIsLoading(false)
          } else {
            Swal.fire({
              title: 'Error',
              text: response.data.message,
              icon: 'error',
            })
            setIsLoading(false)
          }

          window.location.reload()
        } catch (error: any) {
          console.error(error)
          setIsLoading(false)
          Swal.fire({
            title: 'Error',
            text: error.response?.data?.message || 'Something went wrong',
            icon: 'error',
          })
        }
      } else {
        setIsLoading(false)
      }
    })
  }

  return (
    <section id='view-invoice'>
      <div className='card'>
        <div className='card-body table-view-order'>
          <div className='d-flex justify-content-end align-items-center gap-3 mb-5'>
            <button className='button-export' onClick={exportTemplate}>
              <h3 className='fs-5 fw-semibold'>
                {loadingTemplate ? 'Exporting..' : 'Export Excel'}
              </h3>
            </button>
          </div>

          <Row className='table-head-wrapper'>
            <div
              className='d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row flex-xxl-row align-items-start align-items-sm-center align-items-md-center align-items-lg-center align-items-xl-center align-items-xxl-center justify-content-start gap-3'
              onKeyDown={handleKeyPress}
            >
              <h3 className='d-flex align-items-center fs-5 fw-normal'>Date</h3>

              <RangePicker
                format={'DD-MM-YYYY'}
                className='date-range'
                defaultValue={[dayjs().subtract(30, 'day'), dayjs()]}
                onChange={(values) => {
                  if (values && values.length === 2) {
                    const dateFromFormatted = values[0]?.format('YYYY-MM-DD') || ''
                    const dateToFormatted = values[1]?.format('YYYY-MM-DD') || ''

                    dispatch(setDateFrom(dateFromFormatted))
                    dispatch(setDateTo(dateToFormatted))
                  } else {
                    dispatch(setDateFrom(''))
                    dispatch(setDateTo(''))
                  }
                }}
              />

              <div className='filter-search'>
                <FormGroup>
                  <Form.Control
                    placeholder='Search'
                    className='filter-ltr'
                    onChange={handleChangeSearchFilter}
                  />

                  <span className='search-icon'>
                    <FontAwesomeIcon icon={faSearch} className='text-black' size='sm' />
                  </span>
                </FormGroup>
              </div>

              <Select
                name='vendor_id'
                className='form-control w-50 p-0'
                classNamePrefix='select'
                placeholder='Pilih Vendor'
                isSearchable={true}
                isClearable={true}
                options={vendorOptions}
                value={selectedVendor}
                onChange={handleVendorChange}
              />

              <Button
                className='btn-dark-primary button-submit m-0'
                disabled={loadingButton}
                onClick={handleSubmitFilter}
              >
                {loadingButton ? 'Filtering..' : 'Submit'}
              </Button>
            </div>
          </Row>

          <Spin
            tip='Loading...'
            spinning={loadData}
            size='large'
            indicator={<LoadingOutlined style={{fontSize: 24}} spin />}
          >
            <div className='table-custom-wrapper'>
              <Table
                className='table-striped-rows'
                bordered
                columns={columns}
                dataSource={invoiceData}
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
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Invoice
            </span>

            <Pagination
              className='pagination'
              pageSize={pageSize}
              current={currentPage}
              total={totalData}
              showSizeChanger
              pageSizeOptions={[5, 10, 20, 50, 100, 250, 500]}
              itemRender={itemRender}
              onChange={(page, pageSize) => {
                handlePageChange(page, pageSize)
              }}
            />
          </div>
        </div>
      </div>

      {/* Modal Upload Excel */}
      <Modal
        dialogClassName='modal-upload-excel'
        centered
        show={showModalUpload}
        onHide={handleCloseModalUpload}
      >
        <Modal.Header closeButton>
          <Modal.Title>Import Excel Invoice</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Dragger
            className='input-excel'
            accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
            multiple={false}
            maxCount={1}
            beforeUpload={() => false}
            onChange={(e) => handleFileChange(e)}
            onRemove={handleFileRemove}
          >
            <p className='ant-upload-drag-icon'>
              <InboxOutlined style={{fontSize: 32}} />
            </p>

            <p className='ant-upload-text'>Klik atau seret file ke area ini untuk mengunggah</p>
            <p className='ant-upload-hint text-danger'>Maksimal upload file excel adalah satu</p>
          </Dragger>

          <Button
            className='d-flex justify-content-center align-items-center w-100 mt-5'
            disabled={excel === null}
            onClick={handleUpload}
            variant='primary'
          >
            {loadingUploadExcel ? 'Uploading..' : 'Upload Excel'}
          </Button>
        </Modal.Body>
      </Modal>

      {/* Modal Invoice */}
      <Modal
        dialogClassName='modal-upload-excel'
        centered
        show={showModalInvoice}
        onHide={handleCloseModalInvoice}
      >
        {modalType === 1 && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Formulir Alasan Penolakan Invoice</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Row className='notes mb-5'>
                <Form.Group>
                  <Form.Label className='fs-5 fw-bold'>Alasan Ditolak :</Form.Label>
                  <Form.Control
                    style={{minHeight: '140px'}}
                    as='textarea'
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                    value={invoiceNotes}
                  />
                </Form.Group>
              </Row>

              <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
                <Form.Group>
                  <Form.Label>Upload File</Form.Label>

                  <Form className='form-input-image' onClick={handleInvoiceClick}>
                    <Form.Control
                      type='file'
                      accept='image/jpeg, image/png'
                      className='input-field-invoice'
                      multiple
                      hidden
                      id='file-input'
                      ref={evidenceRef}
                      onChange={handleInvoiceEvidenceChange}
                    />

                    <div className='input-image-text'>
                      <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                      <p>Add File</p>
                    </div>
                  </Form>

                  <ListGroup className='pt-3'>
                    {invoiceEvidence.length ? (
                      invoiceEvidence.map((item: any, index: number) => (
                        <ListGroup>
                          <ListGroup.Item
                            className='d-flex justify-content-between align-items-center'
                            key={`${item?.name}-${index}-${item?.type}`}
                          >
                            <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                            <span
                              className='upload-content'
                              style={{cursor: 'pointer'}}
                              onClick={() => handleFileInvoice(index)}
                            >
                              {item?.name}
                            </span>

                            <FontAwesomeIcon
                              icon={faTrash}
                              size='sm'
                              color='#ed2b2a'
                              style={{cursor: 'pointer'}}
                              onClick={(e) => handleRemoveFiles(index)}
                            />
                          </ListGroup.Item>

                          {selectedInvoiceIndex === index && item && (
                            <Image
                              key={`${previewInvoice} - ${index}`}
                              width={200}
                              style={{display: 'none'}}
                              src={
                                item instanceof File
                                  ? URL.createObjectURL(item)
                                  : `${apiUrl}/public/invoices/${previewInvoice}`
                              }
                              preview={{
                                visible: visibleInvoice,
                                src:
                                  item instanceof File
                                    ? URL.createObjectURL(item)
                                    : `${apiUrl}/public/invoices/${previewInvoice}`,
                                onVisibleChange: (value) => {
                                  setVisibleInvoice(value)
                                },
                              }}
                            />
                          )}
                        </ListGroup>
                      ))
                    ) : (
                      <ListGroup.Item className='d-flex justify-content-center'>
                        Tidak ada file yang dipilih
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Form.Group>
              </Row>

              <Button
                className='d-flex justify-content-center align-items-center w-100 mt-5'
                onClick={() => handleDeclineInvoice(3)}
                variant='primary'
              >
                {isLoading ? 'Submitting..' : 'Submit'}
              </Button>
            </Modal.Body>
          </>
        )}

        {modalType === 2 && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Formulir Upload Tagihan Invoice</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
                <Form.Group>
                  <Form.Label>Upload File</Form.Label>

                  <Form className='form-input-image' onClick={handleInvoiceClick}>
                    <Form.Control
                      type='file'
                      accept='.jpg, .jpeg, .png, .pdf'
                      className='input-field-invoice'
                      multiple
                      hidden
                      id='file-input'
                      ref={evidenceRef}
                      onChange={handleInvoiceEvidenceChange}
                    />

                    <div className='input-image-text'>
                      <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                      <p>Add File</p>
                    </div>
                  </Form>

                  <ListGroup className='pt-3'>
                    {invoiceEvidence.length ? (
                      invoiceEvidence.map((item: any, index: number) => (
                        <ListGroup>
                          <ListGroup.Item
                            className='d-flex justify-content-between align-items-center'
                            key={`${item?.name}-${index}-${item?.type}`}
                          >
                            <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                            <span
                              className='upload-content'
                              style={{cursor: 'pointer'}}
                              onClick={() => handleFileInvoice(index)}
                            >
                              {item?.name}
                            </span>

                            <FontAwesomeIcon
                              icon={faTrash}
                              size='sm'
                              color='#ed2b2a'
                              style={{cursor: 'pointer'}}
                              onClick={(e) => handleRemoveFiles(index)}
                            />
                          </ListGroup.Item>

                          {selectedInvoiceIndex === index && item && (
                            <Image
                              key={`${previewInvoice} - ${index}`}
                              width={200}
                              style={{display: 'none'}}
                              src={
                                item instanceof File
                                  ? URL.createObjectURL(item)
                                  : `${apiUrl}/public/invoices/${previewInvoice}`
                              }
                              preview={{
                                visible: visibleInvoice,
                                src:
                                  item instanceof File
                                    ? URL.createObjectURL(item)
                                    : `${apiUrl}/public/invoices/${previewInvoice}`,
                                onVisibleChange: (value) => {
                                  setVisibleInvoice(value)
                                },
                              }}
                            />
                          )}
                        </ListGroup>
                      ))
                    ) : (
                      <ListGroup.Item className='d-flex justify-content-center'>
                        Tidak ada file yang dipilih
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Form.Group>
              </Row>

              <Button
                className='d-flex justify-content-center align-items-center w-100 mt-5'
                onClick={handleUploadInvoiceFile}
                variant='primary'
              >
                Submit
              </Button>
            </Modal.Body>
          </>
        )}

        {modalType === 3 && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Formulir Alasan Penolakan Dokumen Tagihan</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Row className='notes mb-5'>
                <Form.Group>
                  <Form.Label className='fs-5 fw-bold'>Alasan Ditolak :</Form.Label>
                  <Form.Control
                    style={{minHeight: '140px'}}
                    as='textarea'
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                    value={invoiceNotes}
                  />
                </Form.Group>
              </Row>

              <Button
                className='d-flex justify-content-center align-items-center w-100 mt-5'
                onClick={() => handleDeclineInvoice(7)}
                variant='primary'
              >
                Submit
              </Button>
            </Modal.Body>
          </>
        )}
      </Modal>
    </section>
  )
}

export {ViewInvoiceHO}
