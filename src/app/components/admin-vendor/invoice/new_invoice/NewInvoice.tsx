import React, {FC, useState, useEffect, useMemo} from 'react'
import {useNavigate} from 'react-router-dom'

import './NewInvoice.css'

import axios from 'axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import type {ColumnsType} from 'antd/es/table'
import {LoadingOutlined} from '@ant-design/icons'
import {Table, Tag, PaginationProps, Spin, Pagination, DatePicker} from 'antd'
import {Form, FormGroup, Row, Button, Card} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSearch} from '@fortawesome/free-solid-svg-icons'
import {formatDateWithTimeZone} from '../../../../../_metronic/helpers'

import type {Orders} from '../../../../interfaces/order'

const {RangePicker} = DatePicker

interface Status {
  value: number | null
  category: string
}

interface DataType {
  grand_total: any
  _key: number
  order_id: number
  store_name: string
  date_order: string
  member_name: string
  order_type: string
  order_status: string
  order_status_label: string
}

interface InvoiceData {
  vendor_id: number | null
  invoice_evidences: Array<any>
  invoice_details: Array<{
    order_id?: number | null
    type?: number | null
  }>
}

// Table Column
const columns: ColumnsType<DataType> = [
  {
    title: 'Order ID',
    dataIndex: 'order_id',
    key: 'order_id',
    align: 'center',
    width: 110,
    className: 'col_order_id',
    sorter: (a, b) => a.order_id - b.order_id,
    sortOrder: 'descend',
  },
  {
    title: 'Tanggal Order',
    dataIndex: 'date_order',
    key: 'date_order',
    align: 'center',
    width: 200,
    onFilter: (value, record) => record.date_order.includes(String(value)),
    sorter: (a, b) => a.date_order.length - b.date_order.length,
  },
  {
    title: 'Nama Konsumen',
    dataIndex: 'member_name',
    key: 'member_name',
    align: 'center',
    width: 180,
    onFilter: (value, record) => record.member_name.includes(String(value)),
    sorter: (a, b) => a.member_name.length - b.member_name.length,
  },
  {
    title: 'Tipe Pengerjaan',
    dataIndex: 'order_type',
    key: 'order_type',
    align: 'left',
    width: 180,
    onFilter: (value, record) => record.order_type.includes(String(value)),
    sorter: (a, b) => a.order_type.length - b.order_type.length,
  },
  {
    title: 'Status Order',
    dataIndex: 'order_status_label',
    key: 'order_status_label',
    align: 'left',
    onFilter: (value, record) => record.order_status_label.includes(String(value)),
    render: (order_status_label) => {
      const orderStatus = order_status_label
      return <Tag color='green'>{orderStatus}</Tag>
    },
  },
  {
    title: 'Nominal',
    dataIndex: 'grand_total',
    key: 'grand_total',
    align: 'left',
    sorter: (a, b) => Number(a.grand_total) - Number(b.grand_total), // Pastikan angka untuk sorting
    render: (grand_total) => {
      // Pastikan konversi ke angka sebelum diformat
      const numericValue = Number(grand_total)
      if (isNaN(numericValue)) {
        return `Rp 0` // Jika tidak valid, tampilkan Rp 0
      }
      return `Rp ${numericValue.toLocaleString('id-ID')}`
    },
  },
]

const NewInvoiceVendor: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()

  const vendorId = localStorage.getItem('vendor_id')

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [order, setOrder] = useState<DataType[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalData, setTotalData] = useState<number>(0)

  const [dateFrom, setDateFrom] = useState<any>(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
  )
  const [dateTo, setDateTo] = useState<any>(new Date().toISOString().split('T')[0])
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [activeQueryParams, setActiveQueryParams] = useState<string>('')

  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSearchFilter = event.target.value
    setSearchFilter(updatedSearchFilter)
  }

  // Status
  const storedStatus = localStorage.getItem('statusData')
  const statusData: Array<Status> = storedStatus ? JSON.parse(storedStatus) : []
  const workend = statusData.filter((status: any) =>
    ['WORKEND', 'REWORKEND'].includes(status.category)
  )
  const workStepOne = statusData.filter((status: any) => status.category === 'WORKENDSTEPONE')
  const workStepTwo = statusData.filter((status: any) => status.category === 'WORKENDSTEPTWO')
  const workStepThree = statusData.filter((status: any) => status.category === 'WORKENDSTEPTHREE')
  const surveyend = statusData.filter((status: any) => ['QUOTEIN'].includes(status.category))
  const workStatuses = workend.map((x) => x.value)

  const workStepOneStatus = workStepOne.map((x) => x.value)
  const workStepTwoStatus = workStepTwo.map((x) => x.value)
  const workStepThreeStatus = workStepThree.map((x) => x.value)

  const surveyStatuses = surveyend.map((x) => x.value)

  // Create Invoice
  const [selectedRows, setSelectedRows] = useState<DataType[]>([])
  const [, setInvoiceCode] = useState<string | number>('NaN')
  const [invoices, setInvoices] = useState<InvoiceData>({
    vendor_id: Number(vendorId),
    invoice_evidences: [],
    invoice_details: [
      {
        order_id: null,
        type: null,
      },
    ],
  })

  // Calculation
  const totalSelectedGrandTotal = useMemo(() => {
    if (!selectedRows.length) return 0
    return selectedRows.reduce((total, row) => total + Number(row.grand_total || 0), 0)
  }, [selectedRows])

  const grandTotalOrder = (order: Orders, orderType: 'survei' | 'pengerjaan') => {
    const isOverdistance = order.is_overdistance === 1
    const quotationTotal = order?.quotation?.[0]?.quotation_no_promotion || 0

    const calculateTotal = (baseTotal: number): number => {
      return isOverdistance
        ? Number(baseTotal.toFixed(0)) + Number(order?.additional_fee ?? 0)
        : Number(baseTotal.toFixed(0))
    }

    switch (order.payment_type) {
      case 'gratis':
        if (orderType === 'pengerjaan') {
          const baseTotal = order?.m_order_details?.reduce(
            (total, item) =>
              total + Number(item?.item?.invoice_nominal ?? 0) * Number(item?.quantity ?? 0),
            0
          )
          return calculateTotal(baseTotal)
        }
        break

      case 'pemasangan_tanpa_survey':
        if (orderType === 'pengerjaan') {
          let baseTotal = 0

          if (order?.work_orders?.vendor?.margin_type === 1) {
            baseTotal = order?.m_order_details?.reduce(
              (total, item) =>
                total + Number(item?.item?.invoice_nominal ?? 0) * Number(item?.quantity ?? 0),
              0
            )
          } else if (order?.work_orders?.vendor?.margin_type === 2) {
            const totalQuantity = order?.m_order_details?.reduce(
              (total, item) => total + Number(item?.quantity ?? 0),
              0
            )

            baseTotal = +(order?.work_orders?.vendor?.margin_nominal ?? 0) * totalQuantity
          }

          return calculateTotal(baseTotal)
        }
        break

      case 'survey':
        // ORDER STATUS TYPE 1: QUOTEIN
        if (orderType === 'survei') {
          const baseTotal = Number(order?.work_orders?.vendor?.nominal_survey ?? 75000)

          return calculateTotal(baseTotal)
        }

        // ORDER STATUS TYPE 2: WORKEND / REWORKEND
        if (
          orderType === 'pengerjaan' &&
          ['WORKEND', 'REWORKEND'].includes(order?.status?.category ?? '')
        ) {
          let baseTotal = 0

          if (order?.work_orders?.vendor?.margin_type === 1) {
            baseTotal =
              (Number(order?.work_orders?.vendor?.margin_nominal) / 100) * Number(quotationTotal)
          } else {
            baseTotal = Number(quotationTotal) + Number(order?.work_orders?.vendor?.margin_nominal)
          }

          baseTotal += Number(order.additional_fee)
          return calculateTotal(baseTotal)
        }

        // ORDER STATUS TYPE 3: WORKENDSTEPONE
        if (
          orderType === 'pengerjaan' &&
          order?.order_history?.find((x: any) => x.status.category === 'WORKENDSTEPONE')
        ) {
          let baseTotal = 0
          if (order?.work_orders?.vendor?.margin_type === 1) {
            baseTotal =
              ((Number(order?.work_orders?.vendor?.margin_nominal) / 100) *
                Number(quotationTotal) *
                25) /
              100
          } else {
            baseTotal = Number(quotationTotal) + Number(order?.work_orders?.vendor?.margin_nominal)
          }
          baseTotal += Number(order.additional_fee)
          return calculateTotal(baseTotal)
        }

        // ORDER STATUS TYPE 4: WORKENDSTEPTWO
        if (
          orderType === 'pengerjaan' &&
          order?.order_history?.find((x: any) => x.status.category === 'WORKENDSTEPTWO')
        ) {
          let baseTotal = 0
          if (order?.work_orders?.vendor?.margin_type === 1) {
            baseTotal =
              ((Number(order?.work_orders?.vendor?.margin_nominal) / 100) *
                Number(quotationTotal) *
                50) /
              100
          } else {
            baseTotal = Number(quotationTotal) + Number(order?.work_orders?.vendor?.margin_nominal)
          }
          baseTotal += Number(order.additional_fee)
          return calculateTotal(baseTotal)
        }

        // ORDER STATUS TYPE 5: WORKENDSTEPTHREE
        if (
          orderType === 'pengerjaan' &&
          order?.order_history?.find((x: any) => x.status.category === 'WORKENDSTEPTHREE')
        ) {
          let baseTotal = 0
          if (order?.work_orders?.vendor?.margin_type === 1) {
            baseTotal =
              ((Number(order?.work_orders?.vendor?.margin_nominal) / 100) *
                Number(quotationTotal) *
                25) /
              100
          } else {
            baseTotal = Number(quotationTotal) + Number(order?.work_orders?.vendor?.margin_nominal)
          }

          baseTotal += Number(order.additional_fee)
          return calculateTotal(baseTotal)
        }
        break

      default:
        return order.grand_total
    }
  }

  // Fetch Data
  const getCode = async () => {
    try {
      const response = await axios.get(`${apiUrl}/invoices/next-code`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (response.status === 200) {
        const {data} = response
        setInvoiceCode(data.data.code)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getAllData = async (url: string, headers: any) => {
    let allData: any[] = []
    let page = 1
    const pageSize = 50

    while (true) {
      const response = await axios.get(`${url}&page=${page}&take=${pageSize}`, {headers})
      const data = response.data.data || []
      allData = [...allData, ...data]

      if (data.length < pageSize) break
      page += 1
    }

    return allData
  }

  const getOrders = async (queryparams: any) => {
    const urlWork = `${apiUrl}/orders?order_by=desc&date_from=${dateFrom}&date_to=${dateTo}&vendor_id=${vendorId}&status=${workStatuses}${queryparams}`

    const urlWorkStepOne = `${apiUrl}/orders?order_by=desc&date_from=${dateFrom}&date_to=${dateTo}&vendor_id=${vendorId}&history_status=${workStepOneStatus}${queryparams}`
    const urlWorkStepTwo = `${apiUrl}/orders?order_by=desc&date_from=${dateFrom}&date_to=${dateTo}&vendor_id=${vendorId}&history_status=${workStepTwoStatus}${queryparams}`
    const urlWorkStepThree = `${apiUrl}/orders?order_by=desc&date_from=${dateFrom}&date_to=${dateTo}&vendor_id=${vendorId}&history_status=${workStepThreeStatus}${queryparams}`

    const urlSurvey = `${apiUrl}/orders?order_by=desc&date_from=${dateFrom}&date_to=${dateTo}&vendor_id=${vendorId}&history_status=${surveyStatuses}${queryparams}`

    try {
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        // // 'Access-Control-Allow-Origin': '*',
       // // 'ngrok-skip-browser-warning':  'true',
      }

      const [workOrders, surveyOrders, workStepOrders, workStepTwoOrders, workStepThreeOrders] =
        await Promise.all([
          getAllData(urlWork, headers),
          getAllData(urlSurvey, headers),
          getAllData(urlWorkStepOne, headers),
          getAllData(urlWorkStepTwo, headers),
          getAllData(urlWorkStepThree, headers),
        ])

      setLoadData(false)

      return {workOrders, surveyOrders, workStepOrders, workStepTwoOrders, workStepThreeOrders}
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  }

  const ViewWorkOrder = async (queryparams: any) => {
    try {
      const {workOrders, surveyOrders, workStepOrders, workStepTwoOrders, workStepThreeOrders} =
        await getOrders(queryparams)

      if (
        !workOrders &&
        !surveyOrders &&
        !workStepOrders &&
        !workStepTwoOrders &&
        !workStepThreeOrders
      ) {
        console.error('No data received from getOrders')
        return []
      }

      const canCreateInvoice = (order: any, invoiceType: number) => {
        const invoiceDetails = Array.isArray(order.invoice_details) ? order.invoice_details : []
        const noInvoice = invoiceDetails.length === 0

        const sortedInvoices = invoiceDetails.slice().sort((a: any, b: any) => {
          if (Number(a.type) !== Number(b.type)) return Number(a.type) - Number(b.type)
          return Number(b.invoices?.id ?? 0) - Number(a.invoices?.id ?? 0)
        })

        const relevantInvoice = sortedInvoices.find((inv: any) => Number(inv.type) === invoiceType)

        if (!relevantInvoice) return true

        const invoiceStatus = Number(relevantInvoice.invoices?.status)
        const hasInvoiceSent = [1, 2, 4, 5, 6, 7].includes(invoiceStatus)
        const hasInvoiceRejected = invoiceStatus === 3

        return noInvoice || hasInvoiceRejected || !hasInvoiceSent
      }

      const createDataObject = (
        item: any,
        keyIndex: number,
        orderType: string,
        statusHistory?: any
      ) => {
        const status = statusHistory || item.status

        return {
          _key: keyIndex,
          order_id: item.id,
          store_name: item.store?.store_name,
          date_order: formatDateWithTimeZone(item.created_at),
          member_name: item.members?.full_name,
          order_type: orderType,
          order_status: status?.category || null,
          order_status_label: status?.description || null,
          grand_total: grandTotalOrder(item, orderType === 'Survei' ? 'survei' : 'pengerjaan'),
        }
      }

      let currentIndex = 1

      // Work Orders (WORKEND, REWORKEND) - INVOICE TYPE 2
      const workOrderData = workOrders
        .filter((order) => canCreateInvoice(order, 2))
        .map((item: any) => {
          const dataObj = createDataObject(item, currentIndex++, 'Pengerjaan')
          return dataObj
        })

      // Survey Orders (QUOTEIN) - INVOICE TYPE 1
      const surveyOrderData = surveyOrders
        .filter((order) => {
          const hasQuoteInHistory = order.order_history.some(
            (h: any) => h.status.category === 'QUOTEIN'
          )
          return hasQuoteInHistory && canCreateInvoice(order, 1)
        })
        .map((item: any) => {
          const quoteInHistory = item.order_history.find(
            (x: any) => x.status.category === 'QUOTEIN'
          )
          return createDataObject(item, currentIndex++, 'Survei', quoteInHistory?.status)
        })

      // Work Step One Orders (WORKENDSTEPONE) - INVOICE TYPE 3
      const workStepOneData = workStepOrders
        .filter((order) => {
          const hasStepOneHistory = order.order_history.some(
            (h: any) => h.status.category === 'WORKENDSTEPONE'
          )
          return hasStepOneHistory && canCreateInvoice(order, 3)
        })
        .map((item: any) => {
          const workStepHistory = item.order_history.find(
            (x: any) => x.status.category === 'WORKENDSTEPONE'
          )
          return createDataObject(
            item,
            currentIndex++,
            'Pekerjaan Tahap 1',
            workStepHistory?.status
          )
        })

      // Work Step Two Orders (WORKENDSTEPTWO) - INVOICE TYPE 5
      const workStepTwoData = workStepTwoOrders
        .filter((order) => {
          const hasStepTwoHistory = order.order_history.some(
            (h: any) => h.status.category === 'WORKENDSTEPTWO'
          )
          return hasStepTwoHistory && canCreateInvoice(order, 4)
        })
        .map((item: any) => {
          const workStepHistory = item.order_history.find(
            (x: any) => x.status.category === 'WORKENDSTEPTWO'
          )
          return createDataObject(
            item,
            currentIndex++,
            'Pekerjaan Tahap 2',
            workStepHistory?.status
          )
        })

      // Work Step Three Orders (WORKENDSTEPTHREE) - INVOICE TYPE 5
      const workStepThreeData = workStepThreeOrders
        .filter((order) => {
          const hasStepThreeHistory = order.order_history.some(
            (h: any) => h.status.category === 'WORKENDSTEPTHREE'
          )
          return hasStepThreeHistory && canCreateInvoice(order, 5)
        })
        .map((item: any) => {
          const workStepHistory = item.order_history.find(
            (x: any) => x.status.category === 'WORKENDSTEPTHREE'
          )
          return createDataObject(
            item,
            currentIndex++,
            'Pekerjaan Tahap 3',
            workStepHistory?.status
          )
        })

      const allData = [
        ...workOrderData,
        ...surveyOrderData,
        ...workStepOneData,
        ...workStepTwoData,
        ...workStepThreeData,
      ]

      const sortedData = allData.sort((a, b) => b.order_id - a.order_id)

      const finalData = sortedData.map((item, index) => ({
        ...item,
        _key: index + 1,
      }))

      console.log('final data', finalData)

      return finalData
    } catch (error) {
      console.error('Error getting work order list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewWorkOrder(queryparams)
    const paginatedData = data.slice((page - 1) * pageSize, page * pageSize)
    setOrder(paginatedData)
    setCurrentPage(page)
    setTotalData(data.length)
  }

  useEffect(() => {
    getCode()
    fetchData(1, 10, '')
  }, [])

  // Selected Row
  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      const invoiceType = selectedRows.map((row) => ({
        order_id: row.order_id,
        type:
          row.order_status === 'QUOTEIN'
            ? 1
            : row.order_status === 'WORKEND'
            ? 2
            : row.order_status === 'REWORKEND'
            ? 2
            : row.order_status === 'WORKENDSTEPONE'
            ? 3
            : row.order_status === 'WORKENDSTEPTWO'
            ? 4
            : row.order_status === 'WORKENDSTEPTHREE'
            ? 5
            : 0,
      }))

      setSelectedRows(selectedRows)
      setInvoices((prevInvoices) => ({
        ...prevInvoices,
        invoice_details: invoiceType,
      }))
    },
  }

  // Invoice Validation
  const InvoiceValidation = () => {
    let valid = true

    if (!invoices.invoice_details.some((item: any) => item.order_id !== null)) {
      Swal.fire({
        title: 'Warning',
        text: 'Pilih Order yang ingin diberi Invoice ',
        icon: 'warning',
      })
      valid = false
    }

    return valid
  }

  // Handle Submit
  const handleCreateInvoice = async () => {
    if (!InvoiceValidation()) {
      setIsLoading(false)
      return false
    }

    setIsLoading(true)
    const formData = new FormData()

    formData.append('vendor_id', String(invoices.vendor_id))
    formData.append('status', String(1))
    invoices.invoice_details.forEach((invoice, index) => {
      if (invoice.order_id !== null) {
        formData.append(`invoice_details[${index}][order_id]`, String(invoice.order_id))
        formData.append(`invoice_details[${index}][type]`, String(invoice.type))
      }
    })

    try {
      const response = await axios.post(`${apiUrl}/invoices`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (response.data.status === 201) {
        Swal.fire({
          title: 'Success',
          text: 'Success Add Invoice',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          navigate(`/invoice/view-invoice`)
        })

        setIsLoading(false)
      } else {
        Swal.fire({
          title: 'Warning',
          text: response.data.message,
          icon: 'warning',
        })

        setIsLoading(false)
      }
    } catch (error: any) {
      console.error(error)
      setIsLoading(false)

      Swal.fire({
        title: 'Error',
        text: error.response.data.message,
        icon: 'error',
      })
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

  // Handle Submit Filter
  const handleSubmitFilter = async () => {
    setLoadingButton(true)
    let queryparams = ``

    const valueCheck = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        queryparams += `${key}${value}`
      }
    }

    valueCheck(`&search=`, searchFilter)

    const page = 1
    const pageSize = 10
    setActiveQueryParams(queryparams)
    await fetchData(page, pageSize, queryparams)

    setLoadingButton(false)
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleSubmitFilter()
    }
  }

  return (
    <section id='new-invoice'>
      <Card>
        <Card.Body>
          <Row className='table-head-wrapper'>
            <div
              className='d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row flex-xxl-row align-items-start align-items-sm-center align-items-md-center align-items-lg-center align-items-xl-center align-items-xxl-center justify-content-start gap-3'
              onKeyDown={handleKeyPress}
            >
              <h3 className='d-flex align-items-center fs-5 fw-normal'>Date</h3>

              <RangePicker
                format={'DD-MM-YYYY'}
                className='date-range'
                defaultValue={[dayjs().subtract(7, 'day'), dayjs()]}
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

              <Button
                className='btn-dark-primary button-submit m-0'
                disabled={loadingButton}
                onClick={handleSubmitFilter}
              >
                {loadingButton ? 'Filtering..' : 'Submit'}
              </Button>
            </div>
          </Row>

          <Row>
            <Form.Text className='text-danger fs-7'>
              * Pilih order yang ingin dijadikan invoice, lalu klik tombol "Create Invoice Draft"
              untuk mengirim ke Admin HO
            </Form.Text>
          </Row>

          <Row>
            <Form.Text className='text-danger fs-7'>
              {
                '* Untuk melihat daftar invoice yang sudah dikirim, buka menu Invoice > List Invoice'
              }
            </Form.Text>
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
                dataSource={order}
                rowSelection={{
                  preserveSelectedRowKeys: true,
                  ...rowSelection,
                }}
                rowKey={(record) => record._key}
                pagination={false}
                sticky={true}
                tableLayout='auto'
                scroll={{x: 1000}}
              />
            </div>
          </Spin>
          <div className='total-container'>
            <h4>Total Grand Total: Rp {totalSelectedGrandTotal.toLocaleString('id-ID')}</h4>
          </div>
          <div className='pagination-container mt-5'>
            <span className='total-text'>
              Showing {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Invoice Pending
            </span>

            <Pagination
              className='pagination'
              current={currentPage}
              total={totalData}
              showSizeChanger
              pageSizeOptions={[5, 10, 20, 50, 100]}
              itemRender={itemRender}
              onShowSizeChange={(current, size) => {
                setPageSize(size)
                fetchData(1, size, activeQueryParams)
              }}
              onChange={(page, pageSize) => {
                fetchData(page, pageSize, activeQueryParams)
              }}
            />
          </div>

          <div className='d-flex justify-content-center align-items-center mt-5'>
            <Button
              className='d-flex justify-content-center align-items-center m-0'
              variant='dark-success'
              type='submit'
              disabled={isLoading}
              onClick={() => handleCreateInvoice()}
            >
              {isLoading ? 'Creating..' : 'Create Invoice Draft'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </section>
  )
}

export {NewInvoiceVendor}
