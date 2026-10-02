/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {FC, useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'

import './ViewPayment.css'

import axios from 'axios'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'
import type {ColumnsType} from 'antd/es/table'
import {Table, Tag, DatePicker, PaginationProps, Spin, Pagination} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import {Form, InputGroup, Row, Col, Button} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBook, faSearch, faFileExcel} from '@fortawesome/free-solid-svg-icons'
import {formatDateWithTime} from '../../../../../_metronic/helpers'

const {RangePicker} = DatePicker

interface Status {
  value: any
  category: string
  label: string
}

interface DataType {
  invoice_id: number
  invoice_date: string
  vendor_name: string
  amount: number
  invoice_status: string
}

const ViewPaymentHO: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()

  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [invoiceData, setInvoiceData] = useState<DataType[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalData, setTotalData] = useState<number>(0)

  const [dateFrom, setDateFrom] = useState<any>('')
  const [dateTo, setDateTo] = useState<any>('')
  const [searchFilter, setSearchFilter] = useState<string>('')

  const [selectedRows, setSelectedRows] = useState<DataType[]>([])

  // Status
  const storedStatus = localStorage.getItem('statusData')
  const statusData: Array<Status> = storedStatus ? JSON.parse(storedStatus) : []
  const desiredStatus = statusData.filter((status: any) => ['PAID'].includes(status.category))

  // Filter Table
  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSearchFilter = event.target.value
    setSearchFilter(updatedSearchFilter)
  }

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
      title: 'Invoice Date',
      dataIndex: 'invoice_date',
      key: 'invoice_date',
      align: 'center',
      width: 110,
      onFilter: (value, record) => record.invoice_date.includes(String(value)),
      sorter: (a, b) => a.invoice_date.length - b.invoice_date.length,
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      align: 'center',
      width: 140,
      onFilter: (value, record) => record.vendor_name.includes(String(value)),
      sorter: (a, b) => a.vendor_name.length - b.vendor_name.length,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      width: 100,
      className: 'col_order_id',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Invoice Status',
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
          case 'INVOICE':
            color = 'green'
            break
          case 'INVOICESEND':
          default:
            color = 'blue'
            break
        }

        return <Tag color={color}>{orderStatus}</Tag>
      },
      filters: [
        {text: 'INVOICE', value: 'INVOICE'},
        {text: 'INVOICESEND', value: 'INVOICESEND'},
      ],
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 70,
      align: 'center',
      render: (record) => {
        // const handleUpdateInvoice = () => {
        //   const id = record.invoice_id
        //   navigate(`/invoice/update-invoice/${id}`)
        // }

        const handleDetailInvoice = () => {
          const id = record.invoice_id
          navigate(`/invoice/detail-invoice/${id}`)
        }

        return (
          <div className='button-wrapper d-flex justify-content-center'>
            <a className='button-detail ' onClick={handleDetailInvoice}>
              <FontAwesomeIcon icon={faBook} size='sm' />
            </a>

            {/* 
            <a className='button-edit' onClick={handleUpdateInvoice}>
              <FontAwesomeIcon icon={faPen} size='sm' />
            </a> */}
          </div>
        )
      },
    },
  ]

  const fetchInvoiceList = async (page: number, pageSize: number, queryparams: any) => {
    const statuses = desiredStatus.map((x) => x.value)
    let apiUrlWithParams = `${apiUrl}/invoices?order_by=desc&page=${page}&take=${pageSize}&status=${statuses}${queryparams}`

    const response = await axios.get(apiUrlWithParams, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        // // 'Access-Control-Allow-Origin': '*',
       // // 'ngrok-skip-browser-warning':  'true',
      },
    })

    setCurrentPage(response.data?.page ?? 1)
    setTotalData(response?.data?.total ?? 0)
    setLoadData(false)

    return response.data.data
  }

  const ViewInvoice = async (page: number, pageSize: number, queryparams: any) => {
    try {
      const apiData = await fetchInvoiceList(page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from fetchInvoiceList')
        return []
      }

      const paymentRequestData = apiData.map((item: any) => {
        let data

        const invoiceDate = formatDateWithTime(item?.created_at)

        data = {
          invoice_id: item?.id,
          invoice_date: invoiceDate,
          vendor_name: item?.vendor?.company_name,
          amount: `-`,
          invoice_status: item?.status?.category,
        }

        return data
      })

      return paymentRequestData
    } catch (error) {
      console.error('Error getting payment request list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewInvoice(page, pageSize, queryparams)
    setInvoiceData(data)
  }

  useEffect(() => {
    fetchData(1, 10, '')
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

  // Selected Row
  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      setSelectedRows(selectedRows)
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
    },
  }

  // Export To Excel
  const exportToExcel = () => {
    if (selectedRows.length === 0) {
      Swal.fire('Error', 'Please select at least one row to export', 'error')
      return
    }

    const headers = Object.keys(selectedRows[0]) as (keyof DataType)[]
    const data = selectedRows.map((row) => headers.map((header) => row[header]))

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1')

    XLSX.writeFile(workbook, 'exported_data.xlsx')
  }

  const handleSubmitFilter = async () => {
    setLoadingButton(true)
    let queryparams = ``

    const valueCheck = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        queryparams += `${key}${value}`
      }
    }

    valueCheck(`&date_from=`, dateFrom)
    valueCheck(`&date_to=`, dateTo)
    valueCheck(`&search=`, searchFilter)

    const data = await ViewInvoice(1, 10, queryparams)
    setInvoiceData(data)

    setLoadingButton(false)
  }

  return (
    <section id='view-payment'>
      <div className={`card`}>
        <div className='card-body table-view-order'>
          <Row className='table-head-wrapper'>
            <Col className='d-flex mb-2'>
              <div className='d-flex align-items-center me-3'>
                <h3 className='fs-5 fw-normal'>Date</h3>
              </div>

              <RangePicker
                format={'DD-MM-YYYY'}
                className='date-range ms-3'
                onChange={(values) => {
                  if (values && values.length === 2) {
                    const dateFromFormatted = values[0]?.format('YYYY-MM-DD')
                    const dateToFormatted = values[1]?.format('YYYY-MM-DD')

                    setDateFrom(dateFromFormatted)
                    setDateTo(dateToFormatted)
                  } else {
                    setDateFrom('')
                    setDateTo('')
                  }
                }}
              />
            </Col>

            <Col>
              <div className='filter-search'>
                <InputGroup>
                  <InputGroup.Text className='filter-ltr'>
                    <FontAwesomeIcon icon={faSearch} size='sm' />
                  </InputGroup.Text>

                  <Form.Control
                    placeholder='Search'
                    className='filter-ltr'
                    onChange={handleChangeSearchFilter}
                  />
                </InputGroup>
              </div>
            </Col>

            <Col>
              <Button className='btn-dark-primary button-submit' disabled={loadingButton}>
                {loadingButton ? 'Filtering..' : 'Submit'}
              </Button>
            </Col>

            <Col className='d-flex justify-content-end'>
              <button className='button-export' onClick={exportToExcel}>
                <h3 className='fs-5 fw-semibold text-black'>Export To Excel</h3>
                <FontAwesomeIcon icon={faFileExcel} size='lg' className='excel-icon text-black' />
              </button>
            </Col>
          </Row>

          <Spin
            tip='Loading...'
            spinning={loadData}
            size='large'
            indicator={<LoadingOutlined style={{fontSize: 24}} spin />}
          >
            <Table
              className='table-striped-rows'
              bordered
              columns={columns}
              dataSource={invoiceData}
              rowSelection={rowSelection}
              rowKey={(record) => record.invoice_id}
              pagination={false}
            />
          </Spin>

          <div className='pagination-container mt-5'>
            <span className='total-text'>
              Showing {totalData === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Payment Request
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
                fetchData(page, newPageSize, '')
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export {ViewPaymentHO}
