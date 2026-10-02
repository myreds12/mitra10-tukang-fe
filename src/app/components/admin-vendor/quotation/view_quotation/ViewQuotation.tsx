/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react'
import axiosInstance from '../../../../../_metronic/layout/core/axiosInterceptor'
import {useNavigate} from 'react-router-dom'

import './ViewQuotation.css'

import axios from 'axios'
import dayjs from 'dayjs'
import type {ColumnsType} from 'antd/es/table'
import {LoadingOutlined} from '@ant-design/icons'
import {Table, Tag, DatePicker, PaginationProps, Spin, Pagination} from 'antd'
import {Row, Form, FormGroup, Button, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBook, faPen, faSearch} from '@fortawesome/free-solid-svg-icons'
import {formatDate, formatDateWithTimeZone} from '../../../../../_metronic/helpers'

const {RangePicker} = DatePicker

type Props = {
  className: string
}

interface DataType {
  key: React.Key
  readiness: number
  quotation_id: number
  store_name: string
  order_id: number
  date_order: string
  costumer_name: string
  service_name: string
  payment_status: string
  order_status: string
  order_status_label: string
  quotation_status: string
}

const ViewQuotationVendor: React.FC<Props> = ({className}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()

  const userRole = localStorage.getItem('userRole')
  const vendorId = localStorage.getItem('vendor_id') as string

  const [loadingButton, setLoadingButton] = useState(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [orderData, setOrderData] = useState<DataType[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(50)
  const [totalData, setTotalData] = useState<number>(0)
  const [activeQueryParams, setActiveQueryParams] = useState<string>('')

  const [dateFrom, setDateFrom] = useState<any>(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
  )
  const [dateTo, setDateTo] = useState<any>(new Date().toISOString().split('T')[0])
  const [searchFilter, setSearchFilter] = useState<string>('')

  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSearchFilter = event.target.value
    setSearchFilter(updatedSearchFilter)
  }

  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>

  const columns: ColumnsType<DataType> = [
    {
      title: 'Quotation ID',
      dataIndex: 'quotation_id',
      key: 'quotation_id',
      align: 'center',
      defaultSortOrder: 'descend',
      width: 120,
      sorter: (a, b) => a.quotation_id - b.quotation_id,
    },
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      align: 'center',
      className: 'col_order_id',
      width: 120,
      sorter: (a, b) => a.order_id - b.order_id,
    },
    {
      title: 'Nama Toko',
      dataIndex: 'store_name',
      key: 'store_name',
      align: 'center',
      width: 120,
      onFilter: (value, record) => record.store_name.includes(String(value)),
      sorter: (a, b) => a.store_name.length - b.store_name.length,
    },
    {
      title: 'Tanggal Order',
      dataIndex: 'date_order',
      key: 'date_order',
      align: 'center',
      width: 120,
      onFilter: (value, record) => record.date_order.includes(String(value)),
      sorter: (a, b) => a.date_order.length - b.date_order.length,
    },
    {
      title: 'Nama Customer',
      dataIndex: 'costumer_name',
      key: 'costumer_name',
      align: 'left',
      width: 120,
      onFilter: (value, record) => record.costumer_name.includes(String(value)),
      sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
    },
    {
      title: 'Status Order',
      dataIndex: 'order_status_label',
      key: 'order_status_label',
      align: 'left',
      width: 120,
      render: (order_status) => {
        const orderStatus = order_status
        let color = ''

        switch (orderStatus) {
          case 'SURVEYDONE':
            color = 'green'
            break
          case 'QUOTEIN':
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
      title: 'Status Pembayaran Quotation',
      dataIndex: 'payment_status',
      key: 'payment_status',
      align: 'left',
      width: 150,
      onFilter: (value, record) => record.payment_status.includes(String(value)),
      sorter: (a, b) => a.payment_status.length - b.payment_status.length,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      align: 'center',
      width: 110,
      render: (record) => {
        const handleDetailId = () => {
          const id = record.quotation_id
          navigate(`/quotation/detail-quotation/${id}`)
        }

        const handleUpdateId = () => {
          const id = record.quotation_id
          navigate(`/quotation/update-quotation/${id}`)
        }

        return (
          <div className='button-wrapper d-flex justify-content-center gap-3'>
            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Detail Quotation')}
            >
              <Button variant='primary' className='button-detail' onClick={handleDetailId}>
                <FontAwesomeIcon className='text-white' icon={faBook} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>

            {['Owner Vendor', 'Admin Vendor'].includes(userRole ?? '') &&
              ['SURVEYDONE', 'QUOTEIN', 'QUOTATIONDRAFT', 'REJECTED'].includes(
                record.order_status
              ) && (
                <OverlayTrigger
                  placement='bottom'
                  delay={{show: 250, hide: 400}}
                  overlay={renderTooltip('Edit Quotation')}
                >
                  <Button variant='primary' className='button-edit' onClick={handleUpdateId}>
                    <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
                  </Button>
                </OverlayTrigger>
              )}
          </div>
        )
      },
    },
  ]

  const getQuotationList = async (page: number, pageSize: number, queryparams: any) => {
    let apiUrlWithParams = `${apiUrl}/quotation?order_by=desc&vendor_id=${vendorId}&date_from=${dateFrom}&date_to=${dateTo}&page=${page}&take=${pageSize}${queryparams}`

    try {
      const response = await axiosInstance.get(apiUrlWithParams, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      const data = response.data.data

      const resPage = Number(response?.data?.page ?? response?.data?.meta?.page ?? page)
      const resTotal = Number(response?.data?.total ?? response?.data?.meta?.total ?? 0)

      setCurrentPage(resPage)
      setTotalData(resTotal)
      setLoadData(false)

      return data
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoadData(false)
    }
  }

  const ViewQuotation = async (page: number, pageSize: number, queryparams: any) => {
    try {
      const apiData = await getQuotationList(page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from fetchOrderList')
        return []
      }

      const orderData = apiData.map((item: any) => {
        let data

        const orderDate = formatDateWithTimeZone(item?.order?.created_at)

        const workOrderItems = item?.quotation_details
          .map((service: any) => service.name ?? '-')
          .join(', ')

        const paymentStatus = (() => {
          if (item?.receipt_quotation !== null && item?.quotation_files.length) {
            return 'PAID'
          } else {
            return 'UNPAID'
          }
        })()

        data = {
          quotation_id: item?.id,
          readiness: item?.readiness,
          store_name: item?.store.store_name,
          order_id: item?.order.id,
          date_order: orderDate,
          costumer_name: item?.order.members.full_name,
          service_name: workOrderItems,
          payment_status: paymentStatus,
          order_status: item?.order?.status?.category,
          order_status_label: item?.order?.status?.description,
        }

        return data
      })

      return orderData
    } catch (error) {
      console.error('Error getting order list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewQuotation(page, pageSize, queryparams)
    setOrderData(data)
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

    setActiveQueryParams(queryparams)
    setCurrentPage(1)

    const data = await ViewQuotation(1, pageSize, queryparams)
    setOrderData(data)

    setLoadingButton(false)
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleSubmitFilter()
    }
  }

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
    </section>
  )
}

export {ViewQuotationVendor}
