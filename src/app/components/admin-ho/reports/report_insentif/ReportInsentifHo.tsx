/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react'

import './ReportInsentif.css'

import axios from 'axios'
import dayjs from 'dayjs'
import Select from 'react-select'
import {Table, DatePicker, PaginationProps, Spin, Pagination} from 'antd'
import type {ColumnsType} from 'antd/es/table'
import {Row, Col, Form, InputGroup, Button} from 'react-bootstrap'
import {LoadingOutlined} from '@ant-design/icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSearch} from '@fortawesome/free-solid-svg-icons'
import {formatDateWithTime, formatDateWithTimeZone} from '../../../../../_metronic/helpers'

const {RangePicker} = DatePicker

type Props = {
  className: string
}

interface StoreItem {
  value: number | null
  label: string
  city_id: number | null
}

interface SalesItem {
  value: number | null
  label: string
}

interface DataType {
  incentive_id: number
  incentive_type: string
  order_id: number
  date_order: Date
  costumer_name: string
  order_status: string
  sales_name: string
  incentive_name: string
  incentive_nominal: string
  quotation_grand_total: number
  sales_comission: number
  status: string
}

const ReportInsentifHO: React.FC<Props> = ({className}) => {
  const apiUrl = process.env.REACT_APP_API_URL

  const [loadingExport, setLoadingExport] = useState(false)
  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [orderData, setOrderData] = useState<DataType[]>([])
  const [totalOrder, setTotalOrder] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  const [dateFrom, setDateFrom] = useState<any>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  )
  const [dateTo, setDateTo] = useState<any>(new Date().toISOString().split('T')[0])
  const [searchFilter, setSearchFilter] = useState<string>('')

  // Store
  const [store, setStore] = useState<SalesItem[]>([])
  const storeOptions = [{value: null, label: 'All Store', area_id: null}, ...store]
  const [selectedStore, setSelectedStore] = useState<any>({
    value: null,
    label: 'All Store',
    area_id: null,
  })

  // Sales
  const [sales, setSales] = useState<SalesItem[]>([])
  const [searchSales, setSearchSales] = useState('')
  const salesOptions = [{value: null, label: 'All Sales'}, ...sales]
  const [selectedSales, setSelectedSales] = useState<any>({
    value: null,
    label: 'All Sales',
  })

  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSearchFilter = event.target.value
    setSearchFilter(updatedSearchFilter)
  }

  const columns: ColumnsType<DataType> = [
    {
      title: 'Insentif ID',
      dataIndex: 'incentive_id',
      key: 'incentive_id',
      align: 'center',
      width: 110,
      className: 'col_order_id',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.incentive_id - b.incentive_id,
    },
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      align: 'center',
      width: 110,
      className: 'col_order_id',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.order_id - b.order_id,
    },
    {
      title: 'Tanggal Order',
      dataIndex: 'date_order',
      key: 'date_order',
      align: 'left',
      width: 110,
      sorter: (a, b) => new Date(a.date_order).getTime() - new Date(b.date_order).getTime(),
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
      title: 'Status Order',
      dataIndex: 'order_status',
      key: 'order_status',
      align: 'left',
      width: 140,
      onFilter: (value, record) => record.order_status.includes(String(value)),
      sorter: (a, b) => a.order_status.length - b.order_status.length,
    },
    {
      title: 'Nama Sales',
      dataIndex: 'sales_name',
      key: 'sales_name',
      align: 'left',
      width: 140,
      onFilter: (value, record) => record.sales_name.includes(String(value)),
      sorter: (a, b) => a.sales_name.length - b.sales_name.length,
    },
    {
      title: 'Grand Total Quotation',
      dataIndex: 'quotation_grand_total',
      key: 'quotation_grand_total',
      align: 'center',
      width: 135,
      sorter: (a, b) => a.quotation_grand_total - b.quotation_grand_total,
    },
    {
      title: 'Komisi Sales',
      dataIndex: 'sales_comission',
      key: 'sales_comission',
      align: 'center',
      width: 135,
      sorter: (a, b) => a.sales_comission - b.sales_comission,
    },
    {
      title: 'Tipe Insentif',
      dataIndex: 'incentive_type',
      key: 'incentive_type',
      align: 'center',
      width: 135,
      onFilter: (value, record) => record.incentive_type.includes(String(value)),
      sorter: (a, b) => a.incentive_type.length - b.incentive_type.length,
    },
    {
      title: 'Status Insentif',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 135,
      onFilter: (value, record) => record.status.includes(String(value)),
      sorter: (a, b) => a.status.length - b.status.length,
    },
  ]

  const fetchOrderList = async (page: number, pageSize: number, queryparams: any) => {
    let apiUrlWithParams = `${apiUrl}/reports/sales-comission?order_by=desc&page=${page}&take=${pageSize}${queryparams}`
    if (dateFrom && dateTo) {
      apiUrlWithParams += `&date_from=${dateFrom}&date_to=${dateTo}`
    }

    try {
      const response = await axios.get(apiUrlWithParams, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      setTotalOrder(response?.data?.total ?? 0)
      setCurrentPage(response?.data?.page ?? 1)
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

      const orderData = apiData.map((item: any) => {
        let data

        const orderDate = formatDateWithTimeZone(item?.quotation?.created_at)

        const statusIncentive = (status: number) => {
          switch (status) {
            case 1:
              return 'Potensial Insentif'
            case 2:
              return 'Pengajuan Insentif'
            case 3:
              return 'Insentif dibayarkan'
            case 4:
              return 'Ditolak'
            case 5:
              return 'Lost Insentif'
            default:
              return ''
          }
        }

        data = {
          incentive_id: item?.id,
          incentive_type:
            item?.quotation?.quotation_special === 0 ? 'Insentif Biasa' : 'Insentif Tahapan',
          order_id: item?.quotation?.order_id,
          date_order: orderDate,
          costumer_name: item?.quotation?.order?.members?.full_name,
          order_status: item?.quotation?.order?.status?.description,
          sales_name: item?.sales?.full_name,
          incentive_name: item?.incentive?.name,
          incentive_nominal:
            item.type === 1
              ? `${item?.incentive?.incentive ?? 0} %`
              : `Rp. ${parseInt(item?.incentive?.incentive ?? 0).toLocaleString('id')}`,
          status: statusIncentive(item?.status),
          quotation_grand_total: `Rp. ${parseInt(
            item?.quotation?.quotation_grand_total ?? 0
          ).toLocaleString('id')}`,
          sales_comission: `Rp. ${parseInt(item?.nominal ?? 0).toLocaleString('id')}`,
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
    const data = await ViewOrder(page, pageSize, queryparams)
    setOrderData(data)
  }

  useEffect(() => {
    fetchData(1, 10, '')
  }, [])

  const getSales = async () => {
    const search = searchSales ? `&search=${searchSales}` : ''

    try {
      const response = await axios.get(`${apiUrl}/sales?take=0${search}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempSales = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.full_name,
        }))

        setSales(tempSales)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getStore = async () => {
    try {
      const response = await axios.get(`${apiUrl}/stores?take=0`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempStore = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.store_name,
          area_id: item.area_id,
        }))

        setStore(tempStore)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getStore()
  }, [])

  useEffect(() => {
    getSales()
  }, [searchSales])

  const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
    if (type === 'prev') {
      return <a>Prev</a>
    }
    if (type === 'next') {
      return <a>Next</a>
    }
    return originalElement
  }

  // Export To Excel
  const exportToExcel = () => {
    setLoadingExport(true)

    axios
      .get(
        `${apiUrl}/sales/export-excel-template?take=0${
          selectedStore?.value ? `&store_id=${selectedStore.value}` : ''
        }${selectedSales?.value ? `&sales_id=${selectedSales.value}` : ''}`,
        {
          method: 'GET',
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `Report Insentif Sales.xlsx`)
        document.body.appendChild(link)
        link.click()

        setLoadingExport(false)
      })
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
    valueCheck(`&sales_id=`, selectedSales.value)
    valueCheck(`&store_id=`, selectedStore.value)

    const data = await ViewOrder(1, 10, queryparams)
    setOrderData(data)

    setLoadingButton(false)
  }

  return (
    <section id='report-insentif'>
      <div className={`card ${className}`}>
        <div className='card-body table-view-report'>
          <Row className='table-head-wrapper'>
            <Col xs={12} md={12} lg={12} xl={4} xxl={4} className='d-flex mb-2'>
              <div className='d-flex align-items-center me-3'>
                <h3 className='fs-5 fw-normal'>Date : </h3>
              </div>

              <RangePicker
                format={'DD-MM-YYYY'}
                className='date-range ms-3'
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
              <Button
                className='btn-dark-primary button-submit'
                onClick={handleSubmitFilter}
                disabled={loadingButton}
              >
                {loadingButton ? 'Filtering..' : 'Submit'}
              </Button>
            </Col>

            <Col>
              <div className='d-flex justify-content-end'>
                <Button
                  variant='success m-0'
                  className='d-flex justify-content-center align-items-center'
                  onClick={exportToExcel}
                  disabled={loadingExport}
                >
                  {loadingExport ? 'Exporting..' : 'Export To Excel'}
                </Button>
              </div>
            </Col>
          </Row>

          <Row className='table-head-wrapper-bottom mb-4'>
            <Col xs={12} md={12} lg={12} xl={2} xxl={2} className='d-flex align-items-center'>
              <h3 className='fs-3 fw-bold w-100'>Filter By : </h3>
            </Col>

            <Col
              xs={12}
              md={12}
              lg={12}
              xl={10}
              xxl={10}
              className='d-flex align-items-center gap-2'
            >
              <h3 className='fs-5 fw-normal'>Store</h3>

              <Select
                name='sales_id'
                className='form-control p-0 w-100'
                classNamePrefix='select'
                placeholder='Pilih Sales'
                isSearchable={true}
                options={storeOptions}
                value={selectedStore}
                onChange={(newValue) => setSelectedStore(newValue)}
                // onInputChange={(newValue) => setSearchSales(newValue)}
              />
            </Col>
          </Row>

          <div className='total-order'>
            <p className='fs-5'>Total order : {totalOrder}</p>
          </div>

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
                rowKey={(record) => record.incentive_id}
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
              {Math.min(currentPage * pageSize, totalOrder)} of {totalOrder} Total Order
            </span>

            <Pagination
              className='pagination'
              current={currentPage}
              pageSize={pageSize}
              total={totalOrder}
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

export {ReportInsentifHO}
