/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect, useRef} from 'react'
import {formatDateWithTimeZone} from '../../../../../_metronic/helpers'

import './ReportPerformance.css'

import axios from 'axios'
import Swal from 'sweetalert2'
import {Table, PaginationProps, Spin, Pagination, DatePicker} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import {Row, Col, Button} from 'react-bootstrap'

const {RangePicker} = DatePicker

type Props = {
  className: string
}

interface DataType {
  order_id: number
  date_order: string
  costumer_name: string
  phone_number: number | string
  email: string
  address: string
  sales_name: string
  order_status: string
  grand_total: string
}

type SortField = 'created_at' | 'id'
type SortOrder = 'asc' | 'desc'

const ReportPerformanceStore: React.FC<Props> = ({className}) => {
  const apiUrl = process.env.REACT_APP_API_URL

  const userStore = localStorage.getItem('storeId')
  const staffStoreName = localStorage.getItem('storeName') as string

  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadingExport, setLoadingExport] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [orderData, setOrderData] = useState<DataType[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalOrder, setTotalOrder] = useState<number>(0)

  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Guard supaya response lama tidak menimpa response baru saat filter cepat.
  const requestIdRef = useRef<number>(0)

  const buildQuery = (
    page: number,
    size: number,
    from: string,
    to: string,
    field: SortField,
    order: SortOrder
  ) => {
    const query = new URLSearchParams()
    query.set('page', String(page))
    query.set('take', String(size))
    query.set('sort_by', field)
    query.set('order_by', order)
    if (userStore) query.set('store_id', userStore)
    if (from && to) {
      query.set('date_from', from)
      query.set('date_to', to)
    }
    return query.toString()
  }

  const mapRow = (item: any): DataType => {
    const useQuotation = item?.payment_type === 'survey' && item?.quotation?.length > 0
    const totalAmount = useQuotation ? item.quotation[0]?.quotation_grand_total : item?.grand_total

    return {
      order_id: item?.id,
      date_order: formatDateWithTimeZone(item?.created_at),
      costumer_name: item?.members?.full_name ?? '-',
      phone_number: item?.project_number ?? '-',
      email: item?.members?.email ?? '-',
      address: item?.project_address ?? '-',
      sales_name: item?.sales?.full_name ?? '-',
      order_status: item?.status?.description ?? '-',
      grand_total: `Rp. ${Number(totalAmount ?? 0).toLocaleString('id')}`,
    }
  }

  const fetchData = async (
    page: number,
    size: number,
    from: string,
    to: string,
    field: SortField,
    order: SortOrder
  ) => {
    const requestId = ++requestIdRef.current
    setLoadData(true)

    try {
      const query = buildQuery(page, size, from, to, field, order)
      const response = await axios.get(`${apiUrl}/orders/performance?${query}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (requestId !== requestIdRef.current) return

      const rows: DataType[] = (response.data?.data ?? []).map(mapRow)
      setOrderData(rows)
      setTotalOrder(response.data?.total ?? 0)
      setCurrentPage(response.data?.page ?? page)
    } catch (error) {
      if (requestId === requestIdRef.current) {
        console.error('Error fetching report performance:', error)
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoadData(false)
      }
    }
  }

  useEffect(() => {
    fetchData(1, pageSize, '', '', 'created_at', 'desc')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columns: ColumnsType<DataType> = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      align: 'center',
      width: 110,
      className: 'col_order_id',
      sorter: true,
      sortOrder: sortField === 'id' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
    },
    {
      title: 'Tanggal Order',
      dataIndex: 'date_order',
      key: 'date_order',
      align: 'left',
      width: 150,
      sorter: true,
      sortOrder:
        sortField === 'created_at' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
    },
    {
      title: 'Nama Costumer',
      dataIndex: 'costumer_name',
      key: 'costumer_name',
      align: 'left',
      width: 140,
    },
    {
      title: 'No Telepon',
      dataIndex: 'phone_number',
      key: 'phone_number',
      align: 'center',
      width: 130,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      align: 'left',
      width: 170,
    },
    {
      title: 'Alamat',
      dataIndex: 'address',
      key: 'address',
      align: 'left',
      width: 150,
    },
    {
      title: 'Nama Sales',
      dataIndex: 'sales_name',
      key: 'sales_name',
      align: 'left',
      width: 150,
    },
    {
      title: 'Status Order',
      dataIndex: 'order_status',
      key: 'order_status',
      align: 'left',
      width: 150,
    },
    {
      title: 'Grand Total',
      dataIndex: 'grand_total',
      key: 'grand_total',
      align: 'center',
      width: 135,
    },
  ]

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

  const handleSubmitFilter = async () => {
    setLoadingButton(true)
    setCurrentPage(1)
    await fetchData(1, pageSize, dateFrom, dateTo, sortField, sortOrder)
    setLoadingButton(false)
  }

  const handleTableChange = (_pagination: any, _filters: any, sorter: any) => {
    if (!sorter || !sorter.order) return
    const field: SortField = sorter.field === 'order_id' ? 'id' : 'created_at'
    const order: SortOrder = sorter.order === 'ascend' ? 'asc' : 'desc'
    setSortField(field)
    setSortOrder(order)
    setCurrentPage(1)
    fetchData(1, pageSize, dateFrom, dateTo, field, order)
  }

  // Export To Excel
  const exportToExcel = () => {
    if (totalOrder === 0) {
      Swal.fire('Warning', 'Belum ada data yang dapat di export', 'warning')
      return
    }

    setLoadingExport(true)

    const query = new URLSearchParams()
    if (userStore) query.set('store_id', userStore)
    if (dateFrom && dateTo) {
      query.set('date_from', dateFrom)
      query.set('date_to', dateTo)
    }

    axios
      .get(`${apiUrl}/orders/export-excel?${query.toString()}`, {
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
        link.setAttribute('download', `Laporan.xlsx`)
        document.body.appendChild(link)
        link.click()

        setLoadingExport(false)
      })
      .catch((error: any) => {
        Swal.fire('Error', 'Terjadi kesalahan saat mengekspor data', 'error')
        setLoadingExport(false)
      })
  }

  return (
    <section id='report-performance'>
      <div className={`card ${className}`}>
        <div className='card-body table-view-order'>
          <Row>
            <div className='d-flex justify-content-end'>
              <button className='button-export' onClick={exportToExcel}>
                <h3 className='fs-5 fw-semibold'>
                  {loadingExport ? 'Exporting..' : 'Export To Excel'}
                </h3>
              </button>
            </div>
          </Row>

          <Row className='table-head-wrapper' onKeyDown={handleKeyPress}>
            <Col xs={12} md={12} lg={12} xl={4} xxl={4} className='d-flex align-items-center mb-2'>
              <div className='fw-bold mb-5'>
                Nama Toko
                <span className='fs-6 ms-2 pt-2 pb-2 fw-normal bg-secondary'>{staffStoreName}</span>
              </div>
            </Col>

            <Col xs={12} md={12} lg={12} xl={4} xxl={4}>
              <div className='d-flex align-items-center me-3'>
                <h3 className='fs-5 fw-normal'>Date</h3>

                <RangePicker
                  format={'DD-MM-YYYY'}
                  className='date-range ms-3 w-100'
                  onChange={(values) => {
                    if (values && values.length === 2) {
                      setDateFrom(values[0]?.format('YYYY-MM-DD') ?? '')
                      setDateTo(values[1]?.format('YYYY-MM-DD') ?? '')
                    } else {
                      setDateFrom('')
                      setDateTo('')
                    }
                  }}
                />
              </div>
            </Col>

            <Col xs={12} md={12} lg={12} xl={4} xxl={4} className='d-flex justify-content-between'>
              <Button
                className='btn-dark-primary button-submit'
                disabled={loadingButton}
                onClick={handleSubmitFilter}
              >
                {loadingButton ? 'Filtering..' : 'Submit'}
              </Button>

              <div className='ms-1 fs-1 fw-bolder text-uppercase'>Total Order : {totalOrder}</div>
            </Col>
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
                dataSource={orderData}
                rowKey={(record) => record.order_id}
                pagination={false}
                sticky={true}
                tableLayout='auto'
                scroll={{x: 'max-content'}}
                onChange={handleTableChange}
              />
            </div>
          </Spin>

          <div className='pagination-container mt-5'>
            <span className='total-text'>
              Showing {totalOrder === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, totalOrder)} of {totalOrder} Order
            </span>

            <Pagination
              className='pagination'
              current={currentPage}
              pageSize={pageSize}
              total={totalOrder}
              showSizeChanger
              pageSizeOptions={[5, 10, 20, 50, 100]}
              itemRender={itemRender}
              onChange={(page, newPageSize) => {
                setPageSize(newPageSize)
                setCurrentPage(page)
                fetchData(page, newPageSize, dateFrom, dateTo, sortField, sortOrder)
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export {ReportPerformanceStore}
