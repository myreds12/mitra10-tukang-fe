/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import axiosInstance from '../../../../../_metronic/layout/core/axiosInterceptor'

import './ViewQuotation.css'

import axios from 'axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import Select, {SingleValue} from 'react-select'
import type {ColumnsType} from 'antd/es/table'
import {LoadingOutlined} from '@ant-design/icons'
import {Table, Tag, DatePicker, PaginationProps, Spin, Pagination, Image} from 'antd'
import {
  Row,
  Col,
  Form,
  FormGroup,
  Button,
  OverlayTrigger,
  Tooltip,
  Modal,
  ListGroup,
} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faBook,
  faPen,
  faSearch,
  faPrint,
  faImage,
  faFileImage,
  faTrash,
  faTicket,
} from '@fortawesome/free-solid-svg-icons'
import {formatDateWithTimeZone} from '../../../../../_metronic/helpers'

const {RangePicker} = DatePicker

type Props = {
  className: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
}

interface DataType {
  key: React.Key
  quotation_id: number
  store_name: string
  order_id: number
  date_order: Date
  costumer_name: string
  vendor_name: string
  payment_status: string
  receipt_quotation: string
  order_status: string
  order_status_label: string
  quotation_status: string
  period_active: Date
  countdown_to_expired: Date
  period_expired: Date
  grand_total: string
  promotion: any
  quotation_receipt: any
  quotation_special: number
  quotation_grand_total: number
  quotation_detail: any[]
  order_detail: any[]
}

interface VendorItem {
  value: number | null
  label: string
}

interface DiscountType {
  value: number | null
  label: string
}

const ViewQuotationHO: React.FC<Props> = ({className}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const userRole = localStorage.getItem('userRole') as string

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [loadingButton, setLoadingButton] = useState(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [quotationData, setQuotationData] = useState<DataType[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(50)
  const [totalData, setTotalData] = useState<number>(0)
  const [activeQueryParams, setActiveQueryParams] = useState<string>('')

  const [dateFrom, setDateFrom] = useState<any>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  )
  const [dateTo, setDateTo] = useState<any>(new Date().toISOString().split('T')[0])
  const [searchFilter, setSearchFilter] = useState<string>('')

  const [vendor, setVendor] = useState<VendorItem[]>([])
  const [selectedVendor, setSelectedVendor] = useState<SingleValue<VendorItem>>({
    value: null,
    label: 'All Vendor',
  })

  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSearchFilter = event.target.value
    setSearchFilter(updatedSearchFilter)
  }

  const vendorOptions = [{value: null, label: 'All Vendor'}, ...vendor]

  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>

  const columns: ColumnsType<DataType> = [
    {
      title: 'Quotation ID',
      dataIndex: 'quotation_id',
      key: 'quotation_id',
      align: 'center',
      defaultSortOrder: 'descend',
      width: 100,
      sorter: (a, b) => a.quotation_id - b.quotation_id,
    },
    {
      title: 'Nama Toko',
      dataIndex: 'store_name',
      key: 'store_name',
      align: 'center',
      onFilter: (value, record) => record.store_name.includes(String(value)),
      sorter: (a, b) => a.store_name.length - b.store_name.length,
    },
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      align: 'center',
      className: 'col_order_id',
      width: 100,
      sorter: (a, b) => a.order_id - b.order_id,
    },
    {
      title: 'Tanggal Order',
      dataIndex: 'date_order',
      key: 'date_order',
      align: 'center',
      sorter: (a, b) => new Date(a.date_order).getTime() - new Date(b.date_order).getTime(),
    },
    {
      title: 'Costumer Name',
      dataIndex: 'costumer_name',
      key: 'costumer_name',
      align: 'left',
      onFilter: (value, record) => record.costumer_name.includes(String(value)),
      sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
    },
    {
      title: 'Nama Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      align: 'left',
      onFilter: (value, record) => record.vendor_name.includes(String(value)),
      sorter: (a, b) => a.vendor_name.length - b.vendor_name.length,
    },
    {
      title: 'Status Pembayaran Quotation',
      dataIndex: 'payment_status',
      key: 'payment_status',
      align: 'left',
      width: 100,
      onFilter: (value, record) => record.payment_status.includes(String(value)),
      sorter: (a, b) => a.payment_status.length - b.payment_status.length,
    },
    {
      title: 'Receipt Quotation',
      dataIndex: 'receipt_quotation',
      key: 'receipt_quotation',
      align: 'left',
      onFilter: (value, record) => record.receipt_quotation.includes(String(value)),
      sorter: (a, b) => a.receipt_quotation.length - b.receipt_quotation.length,
    },
    {
      title: 'Tanggal Aktif Quotation',
      dataIndex: 'period_active',
      key: 'period_active',
      align: 'left',
      sorter: (a: DataType, b: DataType) =>
        new Date(a.period_active).getTime() - new Date(b.period_active).getTime(),
    },
    {
      title: 'Umur Masa Quotation',
      dataIndex: 'countdown_to_expired',
      key: 'countdown_to_expired',
      align: 'left',
      sorter: (a: DataType, b: DataType) =>
        new Date(a.countdown_to_expired).getTime() - new Date(b.countdown_to_expired).getTime(),
    },
    {
      title: 'Tanggal Quotation Expired',
      dataIndex: 'period_expired',
      key: 'period_expired',
      align: 'left',
      sorter: (a: DataType, b: DataType) =>
        new Date(a.period_expired).getTime() - new Date(b.period_expired).getTime(),
    },
    {
      title: 'Status',
      dataIndex: 'quotation_status',
      key: 'quotation_status',
      align: 'left',
      sorter: (a, b) => a.quotation_status.length - b.quotation_status.length,
    },
    {
      title: 'Status Order',
      dataIndex: 'order_status_label',
      key: 'order_status_label',
      align: 'left',
      render: (order_status_label) => {
        const orderStatus = order_status_label
        let color = ''

        switch (orderStatus) {
          case 'QUOTEIN':
            color = 'green'
            break
          case 'QUOTEOUT':
            color = 'lime'
            break
          default:
            color = 'blue'
            break
        }

        return <Tag color={color}>{orderStatus}</Tag>
      },
      onFilter: (value, record) => record.order_status_label.includes(String(value)),
      sorter: (a, b) => a.order_status_label.length - b.order_status_label.length,
    },
    {
      title: 'Grand Total Quotation',
      dataIndex: 'grand_total',
      key: 'grand_total',
      align: 'left',
      onFilter: (value, record) => record.grand_total.includes(String(value)),
      sorter: (a, b) => a.grand_total.length - b.grand_total.length,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      render: (record) => {
        const id = record.quotation_id

        const handleDetail = () => {
          navigate(`/quotation/detail-quotation/${id}`)
        }

        const handleEdit = () => {
          navigate(`/quotation/update-quotation/${id}`)
        }

        const handleShowModal = (id: number, type: number) => {
          const selected = quotationData.find((quotation) => quotation.quotation_id === id)

          if (selected) {
            setQuotationId(selected.quotation_id)
            setSelectedQuotation(selected)
            setModalInvoice(true)
            setModalType(type)
          }
        }

        return (
          <div className='button-wrapper d-flex justify-content-center gap-3'>
            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Detail Quotation')}
            >
              <a
                href={`/quotation/detail-quotation/${id}`}
                target='_blank'
                rel='noopener noreferrer'
                className='btn btn-primary button-detail'
                onClick={(e) => {
                  e.preventDefault()
                  handleDetail()
                }}
              >
                <FontAwesomeIcon className='text-white' icon={faBook} fontSize={'13px'} />
              </a>
            </OverlayTrigger>

            {['QUOTATIONDRAFT', 'QUOTEIN', 'QUOTEOUT', 'UNPAID', 'REJECTED', 'APPROVED'].includes(
              record.order_status
            ) && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Edit Quotation')}
              >
                <a
                  href={`/quotation/update-quotation/${id}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='btn btn-primary button-edit'
                  onClick={(e) => {
                    e.preventDefault()
                    handleEdit()
                  }}
                >
                  <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
                </a>
              </OverlayTrigger>
            )}

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Cetak PDF Quotation')}
            >
              <Button
                className='button-request'
                variant='warning'
                onClick={() =>
                  exportToPDF(record.order_id, record.payment_status, record.costumer_name)
                }
              >
                <FontAwesomeIcon className='text-white' icon={faPrint} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>

            {['QUOTEOUT'].includes(record.order_status) && ['Admin HO'].includes(userRole) && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Pengajuan Diskon')}
              >
                <Button
                  variant='primary'
                  className='button-verif'
                  onClick={() => handleShowModal(id, 1)}
                >
                  <FontAwesomeIcon className='text-white' icon={faTicket} fontSize='13px' />
                </Button>
              </OverlayTrigger>
            )}
          </div>
        )
      },
    },
  ]

  const getQuotationList = async (page: number, pageSize: number, queryparams: any) => {
    let apiUrlWithParams = `${apiUrl}/quotation?order_by=desc&page=${page}&take=${pageSize}${queryparams}`
    if (dateFrom && dateTo) {
      apiUrlWithParams += `&date_from=${dateFrom}&date_to=${dateTo}`
    }

    try {
      const response = await axiosInstance.get(apiUrlWithParams, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      const resPage = Number(response?.data?.page ?? response?.data?.meta?.page ?? page)
      const resTotal = Number(response?.data?.total ?? response?.data?.meta?.total ?? 0)
      setCurrentPage(resPage)
      setTotalData(resTotal)
      setLoadData(false)

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoadData(false)
    }
  }

  const ViewQuotation = async (page: number, pageSize: number, queryparams: any) => {
    try {
      const apiData = await getQuotationList(page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from getQuotationList')
        return []
      }

      const quotationData = apiData.map((item: any) => {
        let data

        const orderDate = formatDateWithTimeZone(item?.order?.created_at)

        const paymentStatus = (() => {
          if (item?.receipt_quotation !== null && item?.quotation_files.length) {
            return 'PAID'
          } else {
            return 'UNPAID'
          }
        })()

        const createdAt = item?.quotation_validity ? new Date(item.quotation_validity) : null
        const createdAtMinus = createdAt
          ? new Date(createdAt.getTime() - 6 * 24 * 60 * 60 * 1000)
          : null

        const quotationCreatedAt = createdAtMinus
          ? createdAtMinus.toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })
          : 'Quotation belum aktif'

        let quotationEndDate = '-'
        let cooldownQuotation = 0

        if (createdAtMinus) {
          const quotationEnd = new Date(createdAtMinus.getTime() + 7 * 24 * 60 * 60 * 1000)
          quotationEndDate = quotationEnd.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })
          cooldownQuotation = quotationEnd.getTime() - new Date().getTime()
        }

        const calculateTimeLeft = (timeLeft: number): TimeLeft => {
          let time: TimeLeft = {
            days: 0,
            hours: 0,
            minutes: 0,
          }

          if (timeLeft > 0) {
            time = {
              days: Math.floor(timeLeft / (1000 * 60 * 60 * 24)),
              hours: Math.floor((timeLeft / (1000 * 60 * 60)) % 24),
              minutes: Math.floor((timeLeft / 1000 / 60) % 60),
            }
          } else {
            time = {
              days: 0,
              hours: 0,
              minutes: 0,
            }
          }

          return time
        }

        const quotationCountdown = calculateTimeLeft(cooldownQuotation)
        const quotationCountdownText =
          item?.quotation_validity === null
            ? 'Quotation Belum Aktif'
            : quotationCountdown.days === 0 &&
              quotationCountdown.hours === 0 &&
              quotationCountdown.minutes === 0
            ? 'Quotation Expired'
            : `${quotationCountdown.days} Hari ${quotationCountdown.hours} Jam ${quotationCountdown.minutes} Menit`

        const quotationStatus =
          item?.quotation_validity === null
            ? 'Quotation Belum Aktif'
            : quotationCountdown.days === 0 &&
              quotationCountdown.hours === 0 &&
              quotationCountdown.minutes === 0
            ? 'Quotation Expired'
            : 'Quotation Aktif'

        data = {
          quotation_id: item.id,
          store_name: item?.store?.store_name ?? '-',
          order_id: item.order.id,
          date_order: orderDate,
          costumer_name: item?.order?.members?.full_name ?? '',
          vendor_name: item?.order?.vendor?.company_name ?? '-',
          payment_status: paymentStatus,
          order_status: item?.order?.status?.category,
          order_status_label: item?.order?.status?.description ?? '',
          period_active: quotationCreatedAt,
          period_expired: quotationEndDate,
          countdown_to_expired: quotationCountdownText,
          quotation_status: quotationStatus,
          quotation_detail: item.quotation_details,
          order_detail: item.order,
          promotion: item.promotion,
          quotation_grand_total: item?.quotation_grand_total,
          quotation_special: item?.quotation_special,
          quotation_receipt: item?.quotation_receipt,
          grand_total: `Rp. ${[
            parseInt(item?.quotation_grand_total ?? 0).toLocaleString('id-ID'),
          ]}`,
          receipt_quotation: item.receipt_quotation
            ? item.receipt_quotation
            : 'Quotation belum dibayar',
        }

        return data
      })

      return quotationData
    } catch (error) {
      console.error('Error getting order list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewQuotation(page, pageSize, queryparams)
    setQuotationData(data)
  }

  useEffect(() => {
    fetchData(1, 50, '')
  }, [])

  const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
    if (type === 'prev') {
      return <a>Prev</a>
    }
    if (type === 'next') {
      return <a>Next</a>
    }
    return originalElement
  }

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

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleSubmitFilter()
    }
  }

  const handleSubmitFilter = async () => {
    setLoadingButton(true)
    setLoadData(true)
    let queryparams = ``

    const valueCheck = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        queryparams += `${key}${value}`
      }
    }

    valueCheck(`&search=`, searchFilter)
    valueCheck(`&vendor_id=`, selectedVendor?.value)

    setActiveQueryParams(queryparams)
    setCurrentPage(1)

    const data = await ViewQuotation(1, pageSize, queryparams)
    setQuotationData(data)

    setLoadingButton(false)
  }

  // Export PDF Quotation
  const exportToPDF = (order_id: number, receipt_quotation: string, customer_name: string) => {
    axios
      .get(`${apiUrl}/orders/quotation-pdf/${order_id}`, {
        method: 'GET',
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `Quotation - ${customer_name} - Order ID ${order_id}.pdf`)
        document.body.appendChild(link)
        link.click()
      })
      .catch((error: any) => {
        Swal.fire('Error', 'Terjadi kesalahan saat mengekspor data', 'error')
      })
  }

  // Create Request Discount
  const [quotationId, setQuotationId] = useState<any>()
  const [selectedQuotation, setSelectedQuotation] = useState<any>()
  const [quotationNotes, setQuotationNotes] = useState<any>()
  const [discountNominal, setDiscountNominal] = useState<string>('')
  const [selectedDiscountType, setSelectedDiscountType] = useState<DiscountType | null>({
    value: 2,
    label: 'Nominal (Rp.)',
  })
  const [discountType] = useState<DiscountType[]>([
    {value: 1, label: 'Persentase (%)'},
    {value: 2, label: 'Nominal (Rp.)'},
  ])

  // Handle Discount Type Change
  const handleDiscountTypeChange = (newValue: DiscountType | null) => {
    setSelectedDiscountType(newValue)
    setDiscountNominal('')
  }

  // Request Discount
  const [showModalQuotation, setModalInvoice] = useState(false)
  const [modalType, setModalType] = useState<number | null>(null)
  const handleCloseModalQuotation = () => {
    setModalInvoice(false)
  }

  const [quotationEvidence, setQuotationEvidence] = useState<Array<File | null>>([])
  const [selectedQuotationIndex, setSelectedQuotationIndex] = useState<number | null>(null)
  const [previewQuotation, setPreviewQuotation] = useState<any>()
  const [visibleInvoice, setVisibleQuotation] = useState(false)
  const evidenceRef = useRef<HTMLInputElement>(null)

  // Upload File Handler
  const handleChangeQuotationFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files

    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...quotationEvidence]
      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setQuotationEvidence(mergedFiles)
    }
  }

  // Click Image
  const handleInvoiceClick = () => {
    const inputField = document.querySelector('.input-field-quotation') as HTMLInputElement
    inputField.click()
  }

  // Handle Remove File
  const handleRemoveFiles = (index: number) => {
    const newEvidances = [...quotationEvidence]
    newEvidances.splice(index, 1)
    setQuotationEvidence(newEvidances)

    // Update element value
    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  // File Click
  const handleFileQuotation = (index: number) => {
    setPreviewQuotation(quotationEvidence[index]?.name)
    setVisibleQuotation(true)
    setSelectedQuotationIndex(index)
  }

  const handleCreateRequest = async () => {
    setIsLoading(true)
    const formData = new FormData()

    formData.append(`quotation_id`, quotationId)
    formData.append(`status`, String(1))
    formData.append(`description`, quotationNotes)
    formData.append(`promotion_nominal`, discountNominal)

    if (quotationEvidence?.length) {
      quotationEvidence.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`quotation_promotion_evidences`, item, item.name)
        }
      })
    }

    try {
      const response = await axios.post(`${apiUrl}/quotation-promotion`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (response.data.status === 201 || response.data.status === 200) {
        Swal.fire({
          title: 'Success',
          text: 'Berhasil Melakukan Pengajuan',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          navigate('/quotation/view-request-discount')
          setIsLoading(false)
        })
      } else {
        setIsLoading(false)
        Swal.fire({title: 'Error', text: response.data.message, icon: 'error'})
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  // Total Quotation
  const [totalQuotation, setTotalQuotation] = useState({
    grandTotalFromVendor: 0,
    promotionSurvey: 0,
    grandTotalFromMitra: 0,
    mitraMargin: 0,
    nominalMitraMargin: 0,
    vendorMargin: 0,
    nominalVendorMargin: 0,
    requestDiscount: 0,
    customerPay: 0,
    margin: 0,
    marginMitraAfterDiscount: 0,
  })

  useEffect(() => {
    setTotalQuotation((prev) => {
      const discountAmount =
        selectedDiscountType?.value === 1
          ? totalQuotation.grandTotalFromVendor * (Number(discountNominal) / 100) || 0
          : Number(discountNominal) || 0

      return {
        ...prev,
        grandTotalFromVendor: selectedQuotation?.quotation_detail?.reduce(
          (total: any, item: any) => total + parseInt(item?.final_price ?? 0),
          0
        ),
        promotionSurvey: parseInt(selectedQuotation?.promotion?.promotion ?? 0),
        grandTotalFromMitra: parseInt(selectedQuotation?.quotation_grand_total ?? 0),
        mitraMargin: 100 - parseInt(selectedQuotation?.order_detail?.vendor?.margin_nominal ?? 0),
        nominalMitraMargin:
          totalQuotation.grandTotalFromVendor * (totalQuotation.mitraMargin / 100),
        vendorMargin: parseInt(selectedQuotation?.order_detail?.vendor?.margin_nominal ?? 0),
        nominalVendorMargin:
          (totalQuotation.grandTotalFromVendor * totalQuotation.vendorMargin) / 100,
        requestDiscount: discountAmount,
        customerPay: totalQuotation.grandTotalFromMitra - discountAmount,
        margin: totalQuotation.customerPay - totalQuotation.nominalVendorMargin,
        marginMitraAfterDiscount: Math.ceil(
          (totalQuotation.margin / totalQuotation.customerPay) * 100
        ),
      }
    })
  }, [
    selectedQuotation,
    discountNominal,
    totalQuotation.margin,
    totalQuotation.requestDiscount,
    totalQuotation.customerPay,
    totalQuotation.nominalVendorMargin,
  ])

  return (
    <section id='view-quotation'>
      <div className={`card ${className}`}>
        <div className='card-body'>
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
                    const dateFromFormatted = values[0]?.format('YYYY-MM-DD')
                    const dateToFormatted = values[1]?.format('YYYY-MM-DD')

                    setDateFrom(dateFromFormatted)
                    setDateTo(dateToFormatted)
                  } else {
                    setDateFrom(new Date().toISOString().split('T')[0])
                    setDateTo(new Date().toISOString().split('T')[0])
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
                onChange={(newValue) => setSelectedVendor(newValue)}
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
                dataSource={quotationData}
                rowKey={(record) => record.quotation_id}
                pagination={false}
                sticky={true}
                tableLayout='auto'
                scroll={{x: 'max-content'}}
              />
            </div>
          </Spin>

          <div className='pagination-container mt-5'>
            <span className='total-text'>
              Showing {totalData === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Total Quotation
            </span>

            <Pagination
              className='pagination'
              current={currentPage}
              pageSize={pageSize}
              total={totalData}
              showSizeChanger
              pageSizeOptions={[5, 10, 20, 50, 100, 250, 500]}
              itemRender={itemRender}
              onChange={(page, newPageSize) => {
                setPageSize(newPageSize)
                setCurrentPage(page)
                setLoadData(true)
                fetchData(page, newPageSize, activeQueryParams)
              }}
            />
          </div>
        </div>
      </div>

      {/* Modal Request Discount */}
      <Modal
        dialogClassName='modal-request-discount'
        centered
        show={showModalQuotation}
        onHide={handleCloseModalQuotation}
      >
        {modalType === 1 && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                Formulir Pengajuan Diskon Konsumen - Order ID {selectedQuotation?.order_id}
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Row className='mb-5'>
                <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                  <Form.Label className='fs-6 fw-bold'>
                    Nama Toko :{' '}
                    <span className='fs-6 ms-2 fw-normal'>
                      {selectedQuotation?.order_detail?.store?.store_name ?? ''}
                    </span>
                  </Form.Label>
                  <br></br>
                  <Form.Label className='fs-6 fw-bold'>
                    Quotation ID :{' '}
                    <span className='fs-6 ms-2 fw-normal'>
                      {selectedQuotation?.quotation_id ?? ''}
                    </span>
                  </Form.Label>
                </Col>

                <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                  <Form.Label className='fs-6 fw-bold'>
                    Receipt Number :
                    <span className='fs-6 ms-2 fw-normal'>
                      {selectedQuotation?.order_detail?.receipt_number ?? ''}
                    </span>
                  </Form.Label>

                  {selectedQuotation?.receipt_quotation &&
                    selectedQuotation?.receipt_quotation?.quotation_special === 0 && (
                      <>
                        <br></br>
                        <Form.Label className='fs-6 fw-bold'>
                          Receipt Quotation :
                          <span className='fs-6 ms-2 fw-normal'>
                            {selectedQuotation?.receipt_quotation}
                          </span>
                        </Form.Label>
                        <br></br>
                      </>
                    )}

                  <Form.Label className='fs-6 fw-bold'>
                    Order Status :
                    <span className='fs-6 ms-2 fw-bold text-success'>
                      {selectedQuotation?.order_detail?.status?.description ?? ''}
                    </span>
                  </Form.Label>
                </Col>
              </Row>

              <Row>
                <div className='fs-4 fw-bold mb-1'>Informasi Pembeli</div>

                <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                  <Form.Label className='fs-6 fw-semibold'>
                    No Member :{' '}
                    <span className='fs-6 ms-2 fw-normal'>
                      {selectedQuotation?.order_detail?.members?.member_number ?? ''}
                    </span>
                  </Form.Label>
                  <br></br>
                  <Form.Label className='fs-6 fw-semibold'>
                    Customer Name :
                    <span className='fs-6 ms-2 fw-normal'>
                      {selectedQuotation?.order_detail?.members?.full_name ?? ''}
                    </span>
                  </Form.Label>
                  <br></br>
                  <Form.Label className='fs-6 fw-semibold'>
                    Alamat Pemasangan :
                    <span className='fs-6 ms-2 fw-normal'>
                      {selectedQuotation?.order_detail?.project_address ?? ''}
                    </span>
                  </Form.Label>
                </Col>

                <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                  <Form.Label className='fs-6 fw-semibold'>
                    Nomor Telp/WA :
                    <span className='fs-6 ms-2 fw-normal'>
                      {selectedQuotation?.order_detail?.project_number ?? ''}
                    </span>
                  </Form.Label>
                  <br></br>
                  <Form.Label className='fs-6 fw-semibold'>
                    Alamat Email :
                    <span className='fs-6 ms-2 fw-normal'>
                      {selectedQuotation?.order_detail?.members?.email ?? ''}
                    </span>
                  </Form.Label>
                </Col>
              </Row>

              <hr />

              <Row className='notes mb-5'>
                <Form.Group>
                  <Form.Label className='fs-5 fw-bold'>Alasan pengajuan :</Form.Label>
                  <Form.Control
                    style={{minHeight: '140px'}}
                    as='textarea'
                    onChange={(e) => setQuotationNotes(e.target.value)}
                    value={quotationNotes}
                  />
                </Form.Group>
              </Row>

              {selectedQuotation?.quotation_detail?.length && (
                <Row className='information-detail'>
                  <div className='table-warranty-content'>
                    {selectedQuotation?.quotation_special === 0 ? (
                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th className='text-center' style={{width: '355px'}}>
                              Jenis Jasa
                            </th>

                            <th className='text-center' style={{width: '80px'}}>
                              QTY
                            </th>

                            <th className='text-center' style={{width: '150px'}}>
                              Satuan
                            </th>

                            <th className='text-center' style={{width: '250px'}}>
                              Final Price
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {selectedQuotation?.quotation_detail
                            .filter((x: any) => x.item_type === 2)
                            .map((item: any, index: any) => (
                              <tr key={`${index}-quotation`}>
                                <td>
                                  {item?.name ?? '-'}{' '}
                                  {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                                </td>
                                <td>{item?.quantity ?? 0}</td>
                                <td>{item?.unit}</td>
                                <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString(
                                  'id'
                                )}`}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    ) : (
                      <>
                        <div className='mt-2 mb-2'>
                          <p className='fs-6 text-black'>Keterangan : </p>
                          <p className='fs-6 fw-semibold text-black'>
                            *Quotation ini menggunakan quotation tipe spesial
                          </p>
                          <p className='fs-6 fw-semibold text-black'>
                            *Quotation spesial merupakan quotation yang nominalnya diatas 20.000.000
                          </p>
                        </div>

                        <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 1</div>

                        {selectedQuotation?.quotation_receipt[0]?.receipt_quotation &&
                          selectedQuotation?.quotation_receipt[0]?.quotation_special === 1 && (
                            <div className='fs-6 fw-bold'>
                              Receipt Quotation Tahap 1 :{' '}
                              <span className='fs-6 fw-semibold'>
                                {selectedQuotation?.quotation_receipt[0]?.quotation_receipt[0]
                                  ?.receipt_quotation ?? '-'}
                              </span>
                            </div>
                          )}

                        <table className='table hover responsive'>
                          <thead className='table-warranty-head'>
                            <tr>
                              <th className='text-center' style={{width: '355px'}}>
                                Jenis Jasa
                              </th>

                              <th className='text-center' style={{width: '80px'}}>
                                QTY
                              </th>

                              <th className='text-center' style={{width: '150px'}}>
                                Satuan
                              </th>

                              <th className='text-center' style={{width: '250px'}}>
                                Final Price
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {selectedQuotation?.quotation_detail
                              .filter((x: any) => x.item_type === 2 && x.work_step === 1)
                              .map((item: any, index: any) => (
                                <tr key={`${index}-quotation`}>
                                  <td>
                                    {item?.name ?? '-'}{' '}
                                    {item?.is_customer === true
                                      ? '( Disediakan oleh customer )'
                                      : ''}
                                  </td>
                                  <td>{item?.quantity ?? 0}</td>
                                  <td>{item?.unit}</td>
                                  <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString(
                                    'id'
                                  )}`}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>

                        <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 2</div>

                        {selectedQuotation?.quotation_receipt[1]?.receipt_quotation &&
                          selectedQuotation?.quotation_special === 1 && (
                            <div className='fs-6 fw-bold'>
                              Receipt Quotation Tahap 1 :{' '}
                              <span className='fs-6 fw-semibold'>
                                {selectedQuotation?.quotation_receipt[1]?.receipt_quotation ?? '-'}
                              </span>
                            </div>
                          )}

                        <table className='table hover responsive'>
                          <thead className='table-warranty-head'>
                            <tr>
                              <th className='text-center' style={{width: '355px'}}>
                                Jenis Jasa
                              </th>

                              <th className='text-center' style={{width: '80px'}}>
                                QTY
                              </th>

                              <th className='text-center' style={{width: '150px'}}>
                                Satuan
                              </th>

                              <th className='text-center' style={{width: '250px'}}>
                                Final Price
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {selectedQuotation?.quotation_detail
                              .filter((x: any) => x.item_type === 2 && x.work_step === 2)
                              .map((item: any, index: any) => (
                                <tr key={`${index}-quotation`}>
                                  <td>
                                    {item?.name ?? '-'}{' '}
                                    {item?.is_customer === true
                                      ? '( Disediakan oleh customer )'
                                      : ''}
                                  </td>
                                  <td>{item?.quantity ?? 0}</td>
                                  <td>{item?.unit}</td>
                                  <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString(
                                    'id'
                                  )}`}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>

                        <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 3</div>

                        {selectedQuotation?.quotation_receipt[2]?.receipt_quotation &&
                          selectedQuotation?.quotation_special === 1 && (
                            <div className='fs-6 fw-bold'>
                              Receipt Quotation Tahap 1 :{' '}
                              <span className='fs-6 fw-semibold'>
                                {selectedQuotation?.quotation_receipt[2]?.receipt_quotation ?? '-'}
                              </span>
                            </div>
                          )}

                        <table className='table hover responsive'>
                          <thead className='table-warranty-head'>
                            <tr>
                              <th className='text-center' style={{width: '355px'}}>
                                Jenis Jasa
                              </th>

                              <th className='text-center' style={{width: '80px'}}>
                                QTY
                              </th>

                              <th className='text-center' style={{width: '150px'}}>
                                Satuan
                              </th>

                              <th className='text-center' style={{width: '250px'}}>
                                Final Price
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {selectedQuotation?.quotation_detail
                              .filter((x: any) => x.item_type === 2 && x.work_step === 3)
                              .map((item: any, index: any) => (
                                <tr key={`${index}-quotation`}>
                                  <td>
                                    {item?.name ?? '-'}{' '}
                                    {item?.is_customer === true
                                      ? '( Disediakan oleh customer )'
                                      : ''}
                                  </td>
                                  <td>{item?.quantity ?? 0}</td>
                                  <td>{item?.unit}</td>
                                  <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString(
                                    'id'
                                  )}`}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </>
                    )}

                    <table className='table hover responsive'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th className='text-center' style={{width: '355px'}}>
                            Material Yang Dibutuhkan
                          </th>

                          <th className='text-center' style={{width: '80px'}}>
                            QTY
                          </th>

                          <th className='text-center' style={{width: '150px'}}>
                            Satuan
                          </th>

                          <th className='text-center' style={{width: '250px'}}>
                            Final Price
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedQuotation?.quotation_detail
                          ?.filter((x: any) => x.item_type === 1)
                          ?.map((item: any, index: any) => (
                            <tr key={`${index}-quotation`}>
                              <td>
                                {item?.name ?? '-'}{' '}
                                {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                              </td>
                              <td>{item?.quantity ?? 0}</td>
                              <td>{item?.unit ?? '-'}</td>
                              <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString(
                                'id'
                              )}`}</td>
                            </tr>
                          ))}

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Harga NET dari Vendor
                          </td>
                          <td className='fw-bolder'>{`Rp. ${Number(
                            totalQuotation.grandTotalFromVendor
                          ).toLocaleString('id')}`}</td>
                        </tr>

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Harga dikurang Promo Survey
                          </td>
                          <td className=' fw-bolder'>{`- ${Number(
                            totalQuotation.promotionSurvey
                          ).toLocaleString('id')}`}</td>
                        </tr>

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Harga Yang di tawarkan ke customer
                          </td>

                          <td className=' fw-bolder'>{`${Number(
                            totalQuotation.grandTotalFromMitra
                          ).toLocaleString('id')}`}</td>
                        </tr>

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            {`Margin Mitra ${totalQuotation.mitraMargin} %`}
                          </td>

                          <td className=' fw-bolder'>
                            {`Rp. ${Number(totalQuotation.nominalMitraMargin).toLocaleString(
                              'id'
                            )}`}
                          </td>
                        </tr>

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            {`Margin Vendor ${totalQuotation.vendorMargin} %`}
                          </td>

                          <td className=' fw-bolder'>
                            {`Rp. ${Number(totalQuotation.nominalVendorMargin).toLocaleString(
                              'id'
                            )}`}
                          </td>
                        </tr>

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            <div className='d-flex justify-content-end align-items-center gap-3'>
                              <div className=''>Tipe Pengajuan Diskon</div>

                              <Select
                                name='discount-type'
                                className='p-0'
                                placeholder='Ketik/Pilih Diskon '
                                isSearchable={true}
                                options={discountType}
                                value={selectedDiscountType}
                                onChange={(newValue) => handleDiscountTypeChange(newValue)}
                              />
                            </div>
                          </td>

                          <td className=' fw-bolder'>
                            <Form.Control
                              name='input-discount'
                              id='discount'
                              type='number'
                              value={discountNominal}
                              onChange={(e) => setDiscountNominal(e.target.value)}
                              placeholder={
                                selectedDiscountType?.value === 1
                                  ? 'Masukkan Persentase (%)'
                                  : 'Masukkan Nominal (Rp)'
                              }
                            />
                          </td>
                        </tr>

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Nominal Pengajuan Diskon
                          </td>

                          <td className=' fw-bolder'>{`Rp. ${Number(
                            totalQuotation.requestDiscount
                          ).toLocaleString('id')}`}</td>
                        </tr>

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Total Cust Transaksi
                          </td>

                          <td className=' fw-bolder'>{`Rp. ${Number(
                            totalQuotation.customerPay
                          ).toLocaleString('id')}`}</td>
                        </tr>

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Margin
                          </td>

                          <td className=' fw-bolder'>{`Rp. ${Number(
                            totalQuotation.margin
                          ).toLocaleString('id')}`}</td>
                        </tr>

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Margin Mitra setelah discount
                          </td>

                          <td className=' fw-bolder'>
                            {`${totalQuotation.marginMitraAfterDiscount} %`}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Row>
              )}

              <Row className='upload-file d-flex align-items-start mt-5 mb-5'>
                <Form.Group>
                  <Form.Label>Upload File</Form.Label>

                  <Form className='form-input-image' onClick={handleInvoiceClick}>
                    <Form.Control
                      type='file'
                      accept='image/jpeg, image/png'
                      className='input-field-quotation'
                      multiple
                      hidden
                      id='file-input'
                      ref={evidenceRef}
                      onChange={handleChangeQuotationFile}
                    />

                    <div className='input-image-text'>
                      <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                      <p>Add File</p>
                    </div>
                  </Form>

                  <ListGroup className='pt-3'>
                    {quotationEvidence.length ? (
                      quotationEvidence.map((item: any, index: number) => (
                        <ListGroup>
                          <ListGroup.Item
                            className='d-flex justify-content-between align-items-center'
                            key={`${item?.name}-${index}-${item?.type}`}
                          >
                            <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                            <span
                              className='upload-content'
                              style={{cursor: 'pointer'}}
                              onClick={() => handleFileQuotation(index)}
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

                          {selectedQuotationIndex === index && item && (
                            <Image
                              key={`${previewQuotation} - ${index}`}
                              width={200}
                              style={{display: 'none'}}
                              src={
                                item instanceof File
                                  ? URL.createObjectURL(item)
                                  : `${apiUrl}/public/quotation-promotion/${previewQuotation}`
                              }
                              preview={{
                                visible: visibleInvoice,
                                src:
                                  item instanceof File
                                    ? URL.createObjectURL(item)
                                    : `${apiUrl}/public/quotation-promotion/${previewQuotation}`,
                                onVisibleChange: (value) => {
                                  setVisibleQuotation(value)
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
                onClick={() => handleCreateRequest()}
                variant='primary'
              >
                {isLoading ? 'Submitting..' : 'Submit'}
              </Button>
            </Modal.Body>
          </>
        )}
      </Modal>
    </section>
  )
}

export {ViewQuotationHO}
