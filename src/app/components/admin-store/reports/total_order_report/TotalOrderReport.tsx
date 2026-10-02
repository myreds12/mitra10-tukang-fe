/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react'
import axiosInstance from '../../../../../_metronic/layout/core/axiosInterceptor'

import './TotalOrderReport.css'

import axios from 'axios'
import Swal from 'sweetalert2'
import {Table, PaginationProps, Spin, Pagination, DatePicker} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import {Row, Col, Button} from 'react-bootstrap'
import {
  formatDate,
  formatDateWithTime,
  formatDateWithTimeZone,
} from '../../../../../_metronic/helpers'

const {RangePicker} = DatePicker

type Props = {
  title: string
  endpoint: string
  isWorkOrder: boolean
  className: string
  params: string
  statusName: string[]
}

interface Status {
  value: number
  category: string
}

interface DataType {
  order_id: number
  date_order: Date
  costumer_name: string
  phone_number: number
  email: string
  address: string
  sales_name: string
  complaint_date: Date
  order_status: string
  grand_total: number
}

const TotalOrderReportStore: React.FC<Props> = ({
  endpoint,
  className,
  statusName,
  isWorkOrder,
  title,
  params,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL

  const storedStatus = localStorage.getItem('statusData')
  const statusData: Array<Status> = storedStatus ? JSON.parse(storedStatus) : []
  const desiredStatus = statusData.filter((status) => statusName.includes(status.category))
  const statuses = desiredStatus.map((x) => x.value)
  const queryStatus = statuses.length
    ? isWorkOrder
      ? `&work_order_status=${statuses.join(',')}`
      : `&status=${statuses.join(',')}`
    : ''

  const reportStatus = statuses.length
    ? isWorkOrder
      ? `${statuses.join(',')}`
      : `${statuses.join(',')}`
    : ''

  const userStore = localStorage.getItem('storeId') as any
  const userStoreName = localStorage.getItem('storeName') as string
  const storeId = userStore ? `&store_id=${userStore}` : ''

  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadingExport, setLoadingExport] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [reportData, setReportData] = useState<DataType[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalOrder, setTotalOrder] = useState<number>(0)

  const [dateFrom, setDateFrom] = useState<any>('')
  const [dateTo, setDateTo] = useState<any>('')

  const columns: ColumnsType<DataType> = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      align: 'center',
      width: 110,
      className: 'col_order_id',
      defaultSortOrder: 'descend',
      sorter: (a: DataType, b: DataType) => a.order_id - b.order_id,
    },
    {
      title: 'Tanggal Order',
      dataIndex: 'date_order',
      key: 'date_order',
      align: 'left',
      width: 110,
      sorter: (a: DataType, b: DataType) =>
        new Date(a.date_order).getTime() - new Date(b.date_order).getTime(),
    },
    {
      title: 'Nama Costumer',
      dataIndex: 'costumer_name',
      key: 'costumer_name',
      align: 'left',
      width: 140,
      onFilter: (value: string, record: DataType) => record.costumer_name.includes(value),
      sorter: (a: DataType, b: DataType) => a.costumer_name.length - b.costumer_name.length,
    },
    {
      title: 'No Telp/WA',
      dataIndex: 'phone_number',
      key: 'phone_number',
      align: 'left',
      width: 130,
      sorter: (a: DataType, b: DataType) => a.phone_number - b.phone_number,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      align: 'left',
      width: 170,
      onFilter: (value: string, record: DataType) => record.email.includes(value),
      sorter: (a: DataType, b: DataType) => a.email.length - b.email.length,
    },
    {
      title: 'Alamat',
      dataIndex: 'address',
      key: 'address',
      align: 'left',
      width: 150,
      onFilter: (value: string, record: DataType) => record.address.includes(value),
      sorter: (a: DataType, b: DataType) => a.address.length - b.address.length,
    },
    {
      title: 'Nama Sales',
      dataIndex: 'sales_name',
      key: 'sales_name',
      align: 'left',
      width: 150,
      onFilter: (value: string, record: DataType) => record.sales_name.includes(value),
      sorter: (a: DataType, b: DataType) => a.sales_name.length - b.sales_name.length,
    },
    title === 'LAPORAN SEDANG/PROSES PENGERJAAN' && {
      title: 'Tanggal Komplain',
      dataIndex: 'complaint_date',
      key: 'complaint_date',
      align: 'left',
      width: 140,
      sorter: (a: DataType, b: DataType) =>
        new Date(a.complaint_date).getTime() - new Date(b.complaint_date).getTime(),
    },
    {
      title: 'Status Order',
      dataIndex: 'order_status',
      key: 'order_status',
      align: 'left',
      width: 150,
      onFilter: (value: string, record: DataType) => record.order_status.includes(value),
      sorter: (a: DataType, b: DataType) => a.order_status.length - b.order_status.length,
    },
    {
      title: 'Grand Total',
      dataIndex: 'grand_total',
      key: 'grand_total',
      align: 'center',
      width: 135,
      sorter: (a: DataType, b: DataType) => a.grand_total - b.grand_total,
    },
  ].filter(Boolean) as ColumnsType<DataType>

  const fetchReportData = async (
    endpoint: string,
    page: number,
    pageSize: number,
    queryparams: any
  ) => {
    let url = `${apiUrl}/${endpoint}?order_by=desc&page=${page}&take=${pageSize}${storeId}${queryStatus}${queryparams}`

    if (params !== '') {
      url += `${params}`
    }

    try {
      const response = await axiosInstance.get(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (response?.data) {
        switch (endpoint) {
          case 'orders':
            setCurrentPage(response?.data?.page ?? 1)
            setTotalOrder(response?.data?.total ?? 0)
            setLoadData(false)
            break

          case 'reschedule':
            setCurrentPage(response?.data?.page ?? 1)
            setTotalOrder(response?.data?.takeTotal ?? 0)
            setLoadData(false)
            break

          case 'refund':
            setCurrentPage(response?.data?.page ?? 1)
            setTotalOrder(response?.data?.takeTotal ?? 0)
            setLoadData(false)
            break

          default:
            setCurrentPage(response?.data?.page ?? 1)
            setTotalOrder(response?.data?.total ?? 0)
            setLoadData(false)
            break
        }
      }

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const ViewReportData = async (
    endpoint: string,
    page: number,
    pageSize: number,
    queryparams: any
  ) => {
    try {
      const apiData = await fetchReportData(endpoint, page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from fetchOrderList')
        return []
      }

      let orderData
      let rescheduleData
      let refundData
      let quotationData

      switch (endpoint) {
        case 'orders':
          orderData = apiData.map((item: any) => {
            let data

            const phoneNumber = item?.project_number.startsWith('0')
              ? item?.project_number
              : `+62${item?.project_number}`

            const orderDate = formatDateWithTimeZone(item?.created_at)

            const complaintDate = item?.complaints?.length
              ? formatDateWithTimeZone(item?.complaints[0]?.created_at)
              : ''

            data = {
              order_id: item.id,
              date_order: orderDate,
              costumer_name: item?.members?.full_name ?? '-',
              phone_number: phoneNumber,
              email: item?.members?.email ?? '-',
              address: item?.project_address ?? '-',
              sales_name: item?.sales?.full_name,
              order_status: item?.status?.description,
              complaint_date: complaintDate,
              grand_total: `Rp. ${Number(item?.grand_total).toLocaleString('id')}`,
            }

            return data
          })
          break

        case 'refund':
          refundData = apiData.map((item: any) => {
            let data

            const phoneNumber = item?.order?.project_number.startsWith('0')
              ? item?.order?.project_number
              : `+62${item?.order?.project_number}`

            const orderDate = formatDateWithTimeZone(item?.orders?.created_at)

            data = {
              order_id: item?.order_id,
              date_order: orderDate,
              costumer_name: item?.orders?.members?.full_name,
              phone_number: phoneNumber,
              email: item?.orders?.members?.email ?? '-',
              address: item?.orders?.project_address ?? '-',
              sales_name: item?.orders?.sales?.full_name,
              order_status: item?.orders?.status?.description,
              grand_total: `Rp. ${Number(item?.orders?.grand_total).toLocaleString('id')}`,
            }

            return data
          })
          break

        case 'reschedule':
          rescheduleData = apiData.map((item: any) => {
            let data

            const phoneNumber = item?.order?.project_number.startsWith('0')
              ? item?.order?.project_number
              : `+62${item?.order?.project_number}`

            const orderDate = formatDateWithTimeZone(item?.order?.created_at)

            data = {
              order_id: item?.order_id,
              date_order: orderDate,
              costumer_name: item?.order?.members?.full_name,
              phone_number: phoneNumber,
              email: item?.order?.members?.email ?? '-',
              address: item?.order?.project_address ?? '-',
              sales_name: item?.order?.sales?.full_name,
              order_status: item?.order?.status?.description,
              grand_total: `Rp. ${Number(item?.order?.grand_total).toLocaleString('id')}`,
            }

            return data
          })
          break

        case 'quotation':
          quotationData = apiData.map((item: any) => {
            let data

            const phoneNumber = item?.order?.project_number.startsWith('0')
              ? item?.order?.project_number
              : `+62${item?.order?.project_number}`

            const orderDate = formatDateWithTimeZone(item?.orders?.created_at)

            data = {
              order_id: item?.order?.id,
              date_order: orderDate,
              costumer_name: item?.order?.members?.full_name,
              phone_number: phoneNumber,
              email: item?.order?.members?.email ?? '-',
              address: item?.order?.project_address ?? '-',
              sales_name: item?.order?.sales?.full_name,
              order_status: item?.status?.description,
              grand_total: `Rp. ${Number(item?.order?.grand_total).toLocaleString('id')}`,
            }

            return data
          })
          break

        default:
          break
      }

      return endpoint === 'orders'
        ? orderData
        : endpoint === 'refund'
        ? refundData
        : endpoint === 'reschedule'
        ? rescheduleData
        : endpoint === 'quotation'
        ? quotationData
        : []
    } catch (error) {
      console.error('Error getting order list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewReportData(endpoint, page, pageSize, queryparams)
    setReportData(data)
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

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleSubmitFilter()
    }
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

    const data = await ViewReportData('orders', 1, 10, queryparams)
    setReportData(data)

    setLoadingButton(false)
  }

  // Export To Excel
  const exportToExcel = () => {
    if (totalOrder === 0) {
      Swal.fire('Warning', 'Belum ada data yang dapat di export', 'warning')
      return
    }
    setLoadingExport(true)
    let url = `${apiUrl}/${endpoint}/export-excel`

    if (params !== '') {
      url += `${params}`
    }

    const valueCheck = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        url += `${key}${value}`
      }
    }

    valueCheck(`?store_id=`, userStore)
    valueCheck(`&date_from=`, dateFrom)
    valueCheck(`&date_to=`, dateTo)
    valueCheck(`${isWorkOrder === true ? '&work_order_status=' : '&status='}`, reportStatus)

    axios
      .get(url, {
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
        link.setAttribute('download', `${title}.xlsx`)
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
    <section id='total-order-report'>
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
                <span className='fs-6 ms-2 pt-2 pb-2 fw-normal bg-secondary'>{userStoreName}</span>
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
                dataSource={reportData}
                rowKey={(record) => record.order_id}
                pagination={false}
                sticky={true}
                tableLayout='auto'
                scroll={{x: 'max-content'}}
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
                fetchData(page, newPageSize, '')
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export {TotalOrderReportStore}
