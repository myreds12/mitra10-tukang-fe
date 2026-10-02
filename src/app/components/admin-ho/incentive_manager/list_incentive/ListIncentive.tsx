/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'

import axios from 'axios'
import type {ColumnsType} from 'antd/es/table'
import {LoadingOutlined} from '@ant-design/icons'
import {Table, PaginationProps, Spin, Pagination, DatePicker} from 'antd'
import {Row, Col, Form, InputGroup, Button, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSearch, faPen, faTrash} from '@fortawesome/free-solid-svg-icons'
import Swal from 'sweetalert2'

const {RangePicker} = DatePicker

type Props = {
  className: string
}

interface DataType {
  index: number
  id: number
  name: string
  min_order: string
  max_order: string
  incentive: string
  type: string
  stores: string
}

interface StoreSelect {
  store_id: number
  store_name: string
}

const ListIncentiveHOManager: React.FC<Props> = ({className}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()

  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [userData, setUserData] = useState<DataType[]>([])
  const [store, setStore] = useState<StoreSelect[]>([])

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(10)

  const [dateFrom, setDateFrom] = useState<any>('')
  const [dateTo, setDateTo] = useState<any>('')
  const [searchFilter, setSearchFilter] = useState<string>('')

  // Handle Change Search Filter
  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSearchFilter = event.target.value
    setSearchFilter(updatedSearchFilter)
  }

  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>

  const columns: ColumnsType<DataType> = [
    {
      title: 'No.',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 90,
      className: 'col_order_id',
      sorter: (a, b) => a.index - b.index,
      render: (text: any, record: any, index: number) => {
        return (currentPage - 1) * pageSize + index + 1
      },
    },
    {
      title: 'Nama Insentif',
      dataIndex: 'name',
      key: 'name',
      align: 'start',
      width: 110,
      onFilter: (value, record) => record.name.includes(String(value)),
      sorter: (a, b) => a.name.length - b.name.length,
    },
    {
      title: 'Minimal Belanja',
      dataIndex: 'min_order',
      key: 'min_order',
      align: 'start',
      width: 110,
      onFilter: (value, record) => record.min_order.includes(String(value)),
      sorter: (a, b) => a.min_order.length - b.min_order.length,
    },
    {
      title: 'Maksimal Belanja',
      dataIndex: 'max_order',
      key: 'max_order',
      align: 'start',
      width: 110,
      onFilter: (value, record) => record.max_order.includes(String(value)),
      sorter: (a, b) => a.max_order.length - b.max_order.length,
    },
    {
      title: 'Insentif Manager',
      dataIndex: 'incentive',
      key: 'incentive',
      align: 'start',
      width: 110,
      onFilter: (value, record) => record.incentive.includes(String(value)),
      sorter: (a, b) => a.incentive.length - b.incentive.length,
    },
    {
      title: 'Tipe Insentif',
      dataIndex: 'type',
      key: 'type',
      align: 'start',
      width: 110,
      onFilter: (value, record) => record.type.includes(String(value)),
      sorter: (a, b) => a.type.length - b.type.length,
    },
    {
      title: 'Assign To Store',
      dataIndex: 'stores',
      key: 'stores',
      align: 'start',
      width: 110,
      onFilter: (value, record) => record.stores.includes(String(value)),
      sorter: (a, b) => a.stores.length - b.stores.length,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      align: 'center',
      width: 80,
      render: (record) => {
        const id = record.id

        const handleUpdateId = () => {
          navigate(`/incentive-manager/update-incentive/${id}`)
        }

        const handleDelete = () => {
          Swal.fire({
            title: `Apakah anda yakin akan menghapus data Insentif ini ?`,
            icon: 'warning',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Ya',
            denyButtonText: 'Cancel',
          })
            .then((willDelete) => {
              if (willDelete.value) {
                axios
                  .delete(`${apiUrl}/incentive/${id}`, {
                    headers: {
                      Accept: 'application/json',
                      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                      // 'Access-Control-Allow-Origin': '*',
                     // 'ngrok-skip-browser-warning':  'true',
                    },
                  })
                  .then((response) => {
                    Swal.fire({
                      title: 'Success',
                      text: 'Berhasil menghapus data insentif sales',
                      icon: 'success',
                      showConfirmButton: false,
                    }).then(() => {
                      window.location.reload()
                    })
                  })
                  .catch((error) => {
                    Swal.fire({
                      title: 'Error',
                      text: error.response.data.message,
                      icon: 'error',
                    })
                  })
              }
            })
            .catch((error) => {
              Swal.fire({
                title: 'Error',
                text: error.response.data.message,
                icon: 'error',
              })
            })
        }

        return (
          <div className='button-wrapper d-flex justify-content-center gap-3'>
            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Edit Insentif')}
            >
              <Button variant='primary' className='button-edit' onClick={handleUpdateId}>
                <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Hapus Insentif')}
            >
              <Button className='button-delete' variant='danger' onClick={handleDelete}>
                <FontAwesomeIcon className='text-white' icon={faTrash} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>
          </div>
        )
      },
    },
  ]

  // Fetch Data
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
          store_id: item.id,
          store_name: item.store_name,
        }))

        setStore(tempStore)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getIncentive = async (page: number, pageSize: number, queryparams: any) => {
    let apiUrlWithParams = `${apiUrl}/incentive?is_manager=${true}&page=${page}&take=${pageSize}${queryparams}`

    try {
      const response = await axios.get(apiUrlWithParams, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      setCurrentPage(response?.data?.data?.page ?? 1)
      setTotalData(response?.data?.total ?? 0)
      setLoadData(false)

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const ViewIncentive = async (page: number, pageSize: number, queryparams: any) => {
    try {
      const apiData = await getIncentive(page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from incentive data')
        return []
      }

      const incentiveData = apiData.map((item: any, index: number) => {
        let data

        const formattedPrice = (price: number) => {
          return new Intl.NumberFormat('id', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
          }).format(price)
        }

        const storesId = Object.entries(item.stores).map(([key, value]) => ({
          id: value as number,
        }))

        const incentiveStoreNames = storesId
          .map((storeIdObj) => {
            const foundStore = store.find((x: any) => x.store_id === storeIdObj.id)
            return foundStore ? foundStore.store_name : null
          })
          .filter((storeName) => storeName !== null)
          .join(', ')

        data = {
          index: index + 1,
          id: item.id,
          name: item.name,
          min_order: formattedPrice(parseInt(item?.min_order ?? 0)),
          max_order: formattedPrice(parseInt(item?.max_order ?? 0)),
          incentive:
            item.type === 1 ? `${item.incentive} %` : `${formattedPrice(parseInt(item.incentive))}`,
          type: item.type === 1 ? 'Persen' : 'Nominal',
          stores: incentiveStoreNames,
        }

        return data
      })

      return incentiveData
    } catch (error) {
      console.error('Error getting incentive list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewIncentive(page, pageSize, queryparams)
    setUserData(data)
  }

  useEffect(() => {
    fetchData(1, 10, '')
  }, [store])

  useEffect(() => {
    getStore()
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

    const data = await ViewIncentive(1, 10, queryparams)
    setUserData(data)

    setLoadingButton(false)
  }

  return (
    <section id='view-item'>
      <div className={`card ${className}`}>
        <div className='card-body table-view-order'>
          <Row className='table-head-wrapper'>
            <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='d-flex mb-2'>
              <div className='d-flex align-items-center me-3'>
                <h3 className='fs-3 fw-normal'>Date : </h3>
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

            <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
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

            <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
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
                dataSource={userData}
                rowKey={(record) => record.id}
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
              {Math.min(currentPage * pageSize, totalData)} of {totalData} List Insentif Manager
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

export {ListIncentiveHOManager}
