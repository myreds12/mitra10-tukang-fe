/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react'
import axiosInstance from '../../../../../_metronic/layout/core/axiosInterceptor'
import {useNavigate} from 'react-router-dom'

import './ViewRefund.css'

import dayjs from 'dayjs'
import type {ColumnsType} from 'antd/es/table'
import {Table, Tag, PaginationProps, Spin, Pagination, DatePicker} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import {Row, Col, Form, InputGroup, Button, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPen, faBook, faSearch} from '@fortawesome/free-solid-svg-icons'
import {formatDateWithTimeZone} from '../../../../../_metronic/helpers'

const {RangePicker} = DatePicker

type Props = {
  className: string
}

interface DataType {
  refund_id: number
  order_id: number
  store_name: string
  date_order: string
  member_id: number
  member_name: string
  phone_number: number
  vendor_name: string
  payment_status: string
  order_status: string
  paid_status: string
  refund_status: string
}

const ViewRefundCS: React.FC<Props> = ({className}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()

  const userStore = localStorage.getItem('storeId')

  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [refundData, setRefundData] = useState<DataType[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalData, setTotalData] = useState<number>(0)

  const [dateFrom, setDateFrom] = useState<any>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  )
  const [dateTo, setDateTo] = useState<any>(new Date().toISOString().split('T')[0])
  const [searchFilter, setSearchFilter] = useState<string>('')

  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSearchFilter = event.target.value
    setSearchFilter(updatedSearchFilter)
  }

  const storedStatus = localStorage.getItem('statusData')
  const statusData = storedStatus ? JSON.parse(storedStatus) : []
  const statusFilters = statusData.map((item: any) => ({
    text: item.description,
    value: item.description,
  }))

  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>

  const columns: ColumnsType<DataType> = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      align: 'center',
      width: 100,
      className: 'col_order_id',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.order_id - b.order_id,
    },
    {
      title: 'Refund ID',
      dataIndex: 'refund_id',
      key: 'refund_id',
      align: 'center',
      width: 100,
      sorter: (a, b) => a.refund_id - b.refund_id,
    },
    {
      title: 'Nama Toko',
      dataIndex: 'store_name',
      key: 'store_name',
      align: 'center',
      width: 150,
      onFilter: (value, record) => record.store_name.includes(String(value)),
      sorter: (a, b) => a.store_name.length - b.store_name.length,
    },
    {
      title: 'Tanggal Order',
      dataIndex: 'date_order',
      key: 'date_order',
      align: 'center',
      width: 110,
      onFilter: (value, record) => record.date_order.includes(String(value)),
      sorter: (a, b) => a.date_order.length - b.date_order.length,
    },
    {
      title: 'Nomor Member',
      dataIndex: 'member_id',
      key: 'member_id',
      align: 'center',
      width: 110,
      sorter: (a, b) => a.member_id - b.member_id,
    },
    {
      title: 'Nama Member',
      dataIndex: 'member_name',
      key: 'member_name',
      align: 'left',
      width: 110,
      onFilter: (value, record) => record.member_name.includes(String(value)),
      sorter: (a, b) => a.member_name.length - b.member_name.length,
    },
    {
      title: 'No Telp / WA',
      dataIndex: 'phone_number',
      key: 'phone_number',
      align: 'center',
      width: 110,
      sorter: (a, b) => a.phone_number - b.phone_number,
    },
    {
      title: 'Status Pembayaran Receipt',
      dataIndex: 'payment_status',
      key: 'payment_status',
      align: 'left',
      width: 140,
      onFilter: (value, record) => record.payment_status.includes(String(value)),
      sorter: (a, b) => a.payment_status.length - b.payment_status.length,
    },
    {
      title: 'Nama Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      align: 'left',
      width: 150,
      onFilter: (value, record) => record.vendor_name.includes(String(value)),
      sorter: (a, b) => a.vendor_name.length - b.vendor_name.length,
    },
    {
      title: 'Status Penalti',
      dataIndex: 'paid_status',
      key: 'paid_status',
      align: 'center',
      width: 150,
      onFilter: (value, record) => record.paid_status.includes(String(value)),
      sorter: (a, b) => a.paid_status.length - b.paid_status.length,
    },
    {
      title: 'Status Order',
      filters: statusFilters,
      dataIndex: 'order_status',
      key: 'order_status',
      align: 'left',
      width: 140,
      render: (order_status) => {
        const orderStatus = order_status
        let color = ''

        switch (orderStatus) {
          case 'UNPAID':
            color = 'red'
            break
          case 'PAID':
            color = 'green'
            break
          default:
            color = 'blue'
            break
        }

        return <Tag color={color}>{orderStatus}</Tag>
      },
      onFilter: (value, record) => record.order_status.includes(String(value)),
      sorter: (a, b) => a.order_status.length - b.order_status.length,
    },
    {
      title: 'Status Refund',
      dataIndex: 'refund_status',
      key: 'refund_status',
      align: 'left',
      width: 140,
      render: (refund_status) => {
        const refundStatus = refund_status
        return <Tag color='blue'>{refundStatus}</Tag>
      },
      onFilter: (value, record) => record.refund_status.includes(String(value)),
      sorter: (a, b) => a.refund_status.length - b.refund_status.length,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 60,
      render: (record) => {
        const handleDetail = () => {
          const id = record.refund_id
          navigate(`/refund/detail-refund/${id}`)
        }

        const handleEdit = () => {
          const id = record.refund_id
          navigate(`/refund/update-refund/${id}`)
        }

        return (
          <div className='button-wrapper d-flex justify-content-center gap-3'>
            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Detail Refund')}
            >
              <Button variant='primary' className='button-detail' onClick={handleDetail}>
                <FontAwesomeIcon className='text-white' icon={faBook} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Edit Refund')}
            >
              <Button variant='primary' className='button-edit' onClick={handleEdit}>
                <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>
          </div>
        )
      },
    },
  ]

  const fetchRefundList = async (page: number, pageSize: number, queryparams: any) => {
    let apiUrlWithParams = `${apiUrl}/refund?order_by=desc${queryparams}`

    try {
      const response = await axiosInstance.get(apiUrlWithParams, {
        params: {
          page: page,
          pageSize: pageSize,
          date_from: dateFrom,
          date_to: dateTo,
          storeId: userStore ? userStore : null,
        },
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      setCurrentPage(response.data.page)
      setTotalData(response?.data?.takeTotal ?? 0)
      setLoadData(false)

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const ViewRefund = async (page: number, pageSize: number, queryparams: any) => {
    try {
      const apiData = await fetchRefundList(page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from fetchRefundList')
        return []
      }

      const refundData = apiData.map((item: any) => {
        let data

        const orderDate = formatDateWithTimeZone(item?.created_at)

        const paymentStatus = (() => {
          if (item?.orders?.payment_type === 'survey') {
            return item?.orders.receipt_number === null ? 'UNPAID' : 'PAID'
          } else if (item?.orders?.payment_type === 'gratis') {
            return 'FREE'
          } else if (item?.orders?.payment_type === 'pemasangan_tanpa_survey') {
            return item?.orders?.receipt_number === null ? 'UNPAID' : 'PAID'
          } else {
            return ''
          }
        })()

        data = {
          refund_id: item.id,
          order_id: item.order_id,
          store_name: item?.orders?.store?.store_name,
          vendor_name: item?.orders?.vendor?.company_name ?? '-',
          date_order: orderDate,
          member_id: item?.orders?.members?.member_number,
          member_name: item?.orders?.members?.full_name,
          phone_number: item?.orders?.project_number,
          payment_status: paymentStatus,
          refund_status: item?.status?.description,
          paid_status: item?.paid_status === 1 ? 'Sudah Dibayar' : 'Belum Dibayar',
          order_status:
            item?.orders?.work_orders?.work_order_status?.length > 0 &&
            item?.status?.category !== 'QUOTEOUT'
              ? item?.orders?.work_orders?.work_order_status[0]?.status?.description
              : item?.orders?.work_orders?.work_order_status?.length > 0 &&
                item?.orders?.status?.category === 'QUOTEOUT'
              ? item?.orders?.status?.description
              : item?.orders?.status?.description,
        }

        return data
      })

      return refundData
    } catch (error) {
      console.error('Error getting order list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewRefund(page, pageSize, queryparams)
    setRefundData(data)
  }

  useEffect(() => {
    fetchData(1, 10, '')
    // eslint-disable-next-line
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

    valueCheck(`&search=`, searchFilter)

    const data = await ViewRefund(1, 10, queryparams)
    setRefundData(data)

    setLoadingButton(false)
  }

  return (
    <section id='view-refund'>
      <div className={`card ${className}`}>
        <div className='card-body'>
          <Row className='table-head-wrapper' onKeyDown={handleKeyPress}>
            <Col xs={12} md={12} lg={12} xl={4} xxl={4} className='d-flex mb-2'>
              <div className='d-flex align-items-center me-3'>
                <h3 className='fs-3 fw-normal'>Date : </h3>
              </div>

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
            </Col>

            <Col xs={12} md={12} lg={12} xl={4} xxl={4}>
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

            <Col xs={12} md={12} lg={12} xl={4} xxl={4}>
              <Button
                className='btn-dark-primary button-submit'
                disabled={loadingButton}
                onClick={handleSubmitFilter}
              >
                {loadingButton ? 'Filtering..' : 'Submit'}
              </Button>
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
                dataSource={refundData}
                rowKey={(record) => record.refund_id}
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
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Refund
            </span>

            <Pagination
              className='pagination'
              current={currentPage}
              pageSize={pageSize}
              total={totalData}
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

export {ViewRefundCS}
