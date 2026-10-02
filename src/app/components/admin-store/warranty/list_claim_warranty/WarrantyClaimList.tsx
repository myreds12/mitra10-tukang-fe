/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react'

import './WarrantyClaimList.css'

import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import {Table, Tag, PaginationProps, Spin, Pagination} from 'antd'
import type {ColumnsType} from 'antd/es/table'
import {LoadingOutlined} from '@ant-design/icons'
import {Row, Col, Form, InputGroup, Button, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTicket, faSearch} from '@fortawesome/free-solid-svg-icons'

import {DatePicker} from 'antd'
import {formatDate, formatDateWithTimeZone} from '../../../../../_metronic/helpers'
const {RangePicker} = DatePicker

type Props = {
  className: string
}

interface DataType {
  key: string
  order_id: number
  date_order: Date
  no_member: number
  costumer_name: string
  phone_number: number
  services_name: string
  status_order: string
  tanggal_aktif_garansi: string
}

interface Status {
  value: number | null
  category: string
}

const WarrantyClaimList: React.FC<Props> = ({className}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()

  const userStore = localStorage.getItem('storeId')
  const userRole = localStorage.getItem('userRole') as string
  const storeId = ['Store Staff', 'Store CS'].includes(userRole) ? `&store_id=${userStore}` : ''

  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [claimWarrantyData, setClaimWarrantyData] = useState<DataType[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalData, setTotalData] = useState<number>(1)

  const [dateFrom, setDateFrom] = useState<any>('')
  const [dateTo, setDateTo] = useState<any>('')
  const [searchFilter, setSearchFilter] = useState<string>('')

  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSearchFilter = event.target.value
    setSearchFilter(updatedSearchFilter)
  }

  const storedStatus = localStorage.getItem('statusData')
  const statusData = storedStatus ? JSON.parse(storedStatus) : []
  const desiredStatus = statusData.filter((status: any) => ['DONE'].includes(status.category))
  const statuses = desiredStatus.map((x: any) => x.value)
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
      width: 90,
      className: 'col_order_id',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.order_id - b.order_id,
    },
    {
      title: 'Order Date',
      dataIndex: 'date_order',
      key: 'date_order',
      align: 'center',
      width: 100,
      sorter: (a, b) => new Date(a.date_order).getTime() - new Date(b.date_order).getTime(),
    },
    {
      title: 'No Member',
      dataIndex: 'no_member',
      key: 'no_member',
      align: 'center',
      width: 110,
      sorter: (a, b) => a.no_member - b.no_member,
    },
    {
      title: 'Nama Customer',
      dataIndex: 'costumer_name',
      key: 'costumer_name',
      align: 'left',
      width: 140,
      onFilter: (value, record) => record.costumer_name.includes(String(value)),
      sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
    },
    {
      title: 'No. Telp / WA',
      dataIndex: 'phone_number',
      key: 'phone_number',
      align: 'left',
      width: 120,
      sorter: (a, b) => a.phone_number - b.phone_number,
    },
    {
      title: 'Nama Jasa Pemasangan',
      dataIndex: 'services_name',
      key: 'services_name',
      align: 'left',
      width: 180,
      onFilter: (value, record) => record.services_name.includes(String(value)),
      sorter: (a, b) => a.services_name.length - b.services_name.length,
    },
    {
      title: 'Status Order',
      dataIndex: 'status_order',
      key: 'status_order',
      filters: statusFilters,
      render: (status_order) => {
        const orderStatus = status_order
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
      onFilter: (value, record) => record.status_order.includes(String(value)),
      sorter: (a, b) => a.status_order.length - b.status_order.length,
      align: 'left',
      width: 140,
    },
    {
      title: 'Tanggal Aktif Garansi',
      dataIndex: 'tanggal_aktif_garansi',
      key: 'tanggal_aktif_garansi',
      align: 'left',
      width: 140,
      sorter: (a, b) => a.tanggal_aktif_garansi.length - b.tanggal_aktif_garansi.length,
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (record) => {
        const handleDetailId = () => {
          const id = record.order_id
          navigate(`/warranty/claim-warranty-form/${id}`)
        }

        return (
          <div className='button-wrapper d-flex justify-content-center gap-3'>
            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Claim Garansi')}
            >
              <Button variant='primary' className='button-detail' onClick={handleDetailId}>
                <FontAwesomeIcon className='text-white' icon={faTicket} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>
          </div>
        )
      },
      fixed: 'right',
      width: 50,
    },
  ]

  const fetchOrderList = async (page: number, pageSize: number, queryparams: any) => {
    let apiUrlWithParams = `${apiUrl}/orders?order_by=desc&page=${page}&take=${pageSize}&status=${statuses}${queryparams}`

    const url = (() => {
      switch (userRole) {
        case 'Store CS':
          apiUrlWithParams += `${storeId}`
          break
        case 'Tukang':
          apiUrlWithParams += ``
          break
        default:
          break
      }

      return apiUrlWithParams
    })()

    try {
      const response = await axios.get(apiUrlWithParams, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      setCurrentPage(response.data.page)
      setTotalData(response?.data?.total ?? 0)
      setLoadData(false)

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const ViewOrder = async (page: number, pageSize: number, queryparams: any) => {
    try {
      const apiData = await fetchOrderList(page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from fetchOrderList')
        return []
      }

      const claimWarrantyData = apiData.map((item: any) => {
        let data

        const orderDate = formatDateWithTimeZone(item?.created_at)

        data = {
          order_id: item.id,
          date_order: orderDate,
          no_member: item?.members?.member_number,
          costumer_name: item?.members?.full_name,
          phone_number: item?.project_number,
          services_name:
            item.payment_type === 'survey'
              ? item.m_order_details[0]?.item_notes
              : item.m_order_details[0]?.item?.service_name ?? '-',
          status_order: item?.status?.description,
        }

        return data
      })

      return claimWarrantyData
    } catch (error) {
      console.error('Error getting order list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewOrder(page, pageSize, queryparams)
    setClaimWarrantyData(data)
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

  const handleSubmitFilter = async () => {
    setLoadingButton(true)
    let queryparams = ``

    const valueCheck = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        queryparams += `${key}${value}`
      }
    }

    valueCheck(`&search=`, searchFilter)
    valueCheck(`&date_from=`, dateFrom)
    valueCheck(`&date_to=`, dateTo)

    const data = await ViewOrder(1, 10, queryparams)
    setClaimWarrantyData(data)

    setLoadingButton(false)
  }

  return (
    <section id='warranty-claim-list'>
      <div className={`card ${className}`}>
        <div className='card-body table-view-order'>
          <Row className='table-head-wrapper'>
            <Col xs={12} md={12} lg={12} xl={4} xxl={4} className='d-flex mb-2'>
              <div className='d-flex align-items-center me-3'>
                <h3 className='fs-5 fw-normal'>Date : </h3>
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
                dataSource={claimWarrantyData}
                rowKey={(record) => record.key}
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
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Claim Garansi
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

export {WarrantyClaimList}
